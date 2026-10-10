"""Tests for the model catalog of OpenRouter (roadmap step 5.12, ADR-055)."""

import asyncio
from dataclasses import dataclass, field

import httpx
import pytest

from skriptorium.ai_gateway import DEFAULT_MODELS, ModelCatalog, ModelConfig

GROK = {
    "id": "x-ai/grok-4.6",
    "name": "SpaceXAI: Grok 4.6",
    "context_length": 500000,
    "architecture": {"output_modalities": ["text"]},
    "pricing": {"prompt": "0.000002", "completion": "0.000006"},
    "top_provider": {"is_moderated": False},
    "reasoning": {"mandatory": True, "supported_efforts": ["xhigh", "high", "medium", "low"]},
}


def model(model_id: str, **changes: object) -> dict[str, object]:
    return {**GROK, "id": model_id, "name": model_id.title(), **changes}


@dataclass
class Server:
    """OpenRouter's model list; ``answer`` replaces the body or the status."""

    models: list[object] = field(default_factory=lambda: [GROK])
    answer: httpx.Response | None = None
    calls: int = 0

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.calls += 1
        assert str(request.url) == "https://openrouter.ai/api/v1/models"
        assert "authorization" not in request.headers
        return self.answer or httpx.Response(200, json={"data": self.models})


@dataclass
class Clock:
    now: float = 1000.0

    def __call__(self) -> float:
        return self.now


def catalog(server: Server, clock: Clock | None = None) -> ModelCatalog:
    return ModelCatalog(transport=httpx.MockTransport(server), clock=clock or Clock())


def test_before_loading_only_the_fixed_order_is_selectable() -> None:
    found = catalog(Server())

    assert list(found) == list(DEFAULT_MODELS)
    assert len(found) == 3
    assert not found.available
    assert found.models() == []
    assert "deepseek/deepseek-v3.2" not in found
    with pytest.raises(KeyError):
        found["deepseek/deepseek-v3.2"]


def test_loaded_models_with_prices_and_estimate() -> None:
    found = catalog(Server())

    asyncio.run(found.refresh())

    (grok,) = found.models()
    assert found.available
    assert (grok.name, grok.provider) == ("SpaceXAI: Grok 4.6", "x-ai")
    assert (grok.input_price, grok.output_price) == (2.0, 6.0)
    assert grok.estimated_cost == pytest.approx(0.063)
    assert (grok.context_length, grok.moderated) == (500000, False)
    assert (grok.reasoning_mandatory, grok.lowest_effort) == (True, "low")


def test_fixed_order_settings_come_first_then_catalog() -> None:
    server = Server(
        models=[
            GROK,
            model(
                "openai/gpt-5",
                reasoning={"mandatory": True, "supported_efforts": ["high", "minimal", "none"]},
            ),
            model("z-ai/glm-4.6", reasoning={"mandatory": False, "default_enabled": True}),
            model("a/denkt", reasoning={"mandatory": True}),
        ]
    )
    found = catalog(server)

    asyncio.run(found.refresh())

    assert found["x-ai/grok-4.6"] is DEFAULT_MODELS["x-ai/grok-4.6"]
    assert dict(found["openai/gpt-5"].reasoning) == {"effort": "minimal"}
    assert found["z-ai/glm-4.6"] == ModelConfig()
    assert dict(found["a/denkt"].reasoning) == {"enabled": True}
    assert list(found) == [*DEFAULT_MODELS, "a/denkt", "openai/gpt-5", "z-ai/glm-4.6"]
    assert len(found) == 6


def test_only_models_with_text_output_are_kept() -> None:
    server = Server(
        models=[
            GROK,
            model("a/bild", architecture={"output_modalities": ["image", "text"]}),
            model("a/ohne-art", architecture=None),
            model("ohne-anbieter"),
            {"name": "ohne Kennung"},
            "kein Eintrag",
        ]
    )
    found = catalog(server)

    asyncio.run(found.refresh())

    assert [entry.id for entry in found.models()] == ["x-ai/grok-4.6"]


def test_unknown_or_negative_prices_and_missing_fields() -> None:
    server = Server(
        models=[
            {
                "id": "openrouter/auto",
                "architecture": {"output_modalities": ["text"]},
                "pricing": {"prompt": "-1", "completion": "kaputt"},
                "context_length": 0,
            }
        ]
    )
    found = catalog(server)

    asyncio.run(found.refresh())

    (auto,) = found.models()
    assert auto.name == "openrouter/auto"
    assert (auto.input_price, auto.output_price, auto.estimated_cost) == (None, None, None)
    assert auto.context_length is None
    assert (auto.moderated, auto.reasoning_mandatory, auto.lowest_effort) == (False, False, None)
    assert found["openrouter/auto"] == ModelConfig()


def test_kept_for_an_hour_then_loaded_again() -> None:
    server, clock = Server(), Clock()
    found = catalog(server, clock)

    asyncio.run(found.refresh())
    clock.now += 3599
    asyncio.run(found.refresh())
    assert server.calls == 1

    server.models = [GROK, model("deepseek/deepseek-v3.2")]
    clock.now += 1
    asyncio.run(found.refresh())
    assert server.calls == 2
    assert "deepseek/deepseek-v3.2" in found


@pytest.mark.parametrize(
    "answer",
    [httpx.Response(503), httpx.Response(200, text="kein json"), httpx.Response(200, json=[1])],
)
def test_failure_keeps_fixed_order_and_waits_a_minute(answer: httpx.Response) -> None:
    server, clock = Server(answer=answer), Clock()
    found = catalog(server, clock)

    asyncio.run(found.refresh())
    asyncio.run(found.refresh())

    assert server.calls == 1
    assert not found.available
    assert list(found) == list(DEFAULT_MODELS)
    clock.now += 60
    server.answer = None
    asyncio.run(found.refresh())
    assert found.available


def test_failure_after_a_load_keeps_the_previous_catalog() -> None:
    server, clock = Server(), Clock()
    found = catalog(server, clock)
    asyncio.run(found.refresh())

    server.answer = httpx.Response(500)
    clock.now += 3600
    asyncio.run(found.refresh())

    assert found.available
    assert [entry.id for entry in found.models()] == ["x-ai/grok-4.6"]


def test_network_error_is_logged_without_raising(caplog: pytest.LogCaptureFixture) -> None:
    def unreachable(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("weg", request=request)

    found = ModelCatalog(transport=httpx.MockTransport(unreachable))

    asyncio.run(found.refresh())

    assert not found.available
    assert "modell-katalog nicht geladen fehler=ConnectError" in caplog.text

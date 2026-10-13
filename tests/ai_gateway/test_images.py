"""Generating images through OpenRouter (roadmap step 7.12, ADR-077): catalog and adapter."""

import asyncio
import base64
import json
import logging
from dataclasses import dataclass, field

import httpx
import pytest

from skriptorium.ai_gateway import (
    ImageCatalog,
    ImageOrder,
    ImagePrice,
    InvalidRequest,
    ModelRefused,
    OpenRouterImageProvider,
    ProviderUnavailable,
    RateLimited,
)
from skriptorium.ai_gateway.images import ImageEndpoint
from skriptorium.ai_gateway.openrouter_images import filter_options

KEY = "sk-or-test-key-not-real"
MODELS = {
    "data": [
        {
            "id": "black-forest-labs/flux.2-pro",
            "name": "FLUX.2 Pro",
            "supported_parameters": {"aspect_ratio": {"type": "enum", "values": ["1:1", "2:3"]}},
        },
        {"id": "black-forest-labs/flux-3-image", "name": "FLUX.3", "supported_parameters": {}},
        {"id": "openai/gpt-image-2", "name": "GPT Image 2", "supported_parameters": {}},
        {"id": "recraft/recraft-v4-vector", "name": "Vector", "supported_parameters": {}},
        {
            "id": "a/kann-svg",
            "name": "SVG",
            "supported_parameters": {"output_format": {"type": "enum", "values": ["png", "svg"]}},
        },
        {"id": "ohne-anbieter", "name": "kaputt"},
        {"id": "a/../../x?y", "name": "verbogen"},
        "kein Eintrag",
    ]
}
ENDPOINTS = {
    "black-forest-labs/flux.2-pro": [
        {
            "provider_slug": "black-forest-labs",
            "allowed_passthrough_parameters": ["steps", "safety_tolerance"],
            "pricing": [{"unit": "megapixel", "cost_usd": 0.03}],
        }
    ],
    "black-forest-labs/flux-3-image": [
        {
            "provider_slug": "black-forest-labs",
            "allowed_passthrough_parameters": ["safety_tolerance"],
            "pricing": [
                {"variant": "4k", "unit": "image", "cost_usd": 0.6},
                {"unit": "image", "cost_usd": 0.041},
            ],
        }
    ],
    "openai/gpt-image-2": [
        {
            "provider_slug": "openai",
            "allowed_passthrough_parameters": ["moderation"],
            "pricing": [{"unit": "token", "cost_usd": 8e-06}],
        }
    ],
}


@dataclass
class Server:
    """OpenRouter for images: model list, providers, and generation answers in turn."""

    answers: list[httpx.Response] = field(default_factory=list)
    sent: list[dict[str, object]] = field(default_factory=list)
    headers: list[httpx.Headers] = field(default_factory=list)
    lists: int = 0

    def __call__(self, request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path == "/api/v1/images/models":
            self.lists += 1
            return httpx.Response(200, json=MODELS)
        if path.startswith("/api/v1/images/models/"):
            model = path.removeprefix("/api/v1/images/models/").removesuffix("/endpoints")
            return httpx.Response(200, json={"endpoints": ENDPOINTS.get(model, [])})
        assert path == "/api/v1/images"
        self.sent.append(json.loads(request.content))
        self.headers.append(request.headers)
        return self.answers.pop(0)


def image_answer(
    data: bytes = b"\x89PNG", media: str = "image/png", cost: float = 0.03
) -> httpx.Response:
    return httpx.Response(
        200,
        json={
            "data": [{"b64_json": base64.b64encode(data).decode(), "media_type": media}],
            "usage": {"cost": cost},
        },
    )


def setup(*answers: httpx.Response) -> tuple[OpenRouterImageProvider, ImageCatalog, Server]:
    server = Server(list(answers))
    transport = httpx.MockTransport(server)
    catalog = ImageCatalog(transport=transport)
    asyncio.run(catalog.refresh())
    return OpenRouterImageProvider(KEY, catalog, transport=transport), catalog, server


def order(model: str = "black-forest-labs/flux.2-pro") -> ImageOrder:
    return ImageOrder(model, "Eine Wirtin im Lampenlicht", "2:3")


def test_catalog_leaves_out_vector_models_and_keeps_aspect_ratios() -> None:
    _, catalog, _ = setup()
    assert [m.id for m in catalog.models()] == [
        "black-forest-labs/flux.2-pro",
        "black-forest-labs/flux-3-image",
        "openai/gpt-image-2",
    ]
    flux = next(m for m in catalog.models() if m.id == "black-forest-labs/flux.2-pro")
    assert flux.aspect_ratios == ("1:1", "2:3")
    assert "recraft/recraft-v4-vector" not in catalog
    assert "a/kann-svg" not in catalog


def test_prices_come_from_the_providers_base_entry() -> None:
    _, catalog, _ = setup()
    assert asyncio.run(catalog.price("black-forest-labs/flux.2-pro")) == ImagePrice(
        0.03, "megapixel"
    )
    assert asyncio.run(catalog.price("black-forest-labs/flux-3-image")) == ImagePrice(
        0.041, "image"
    )
    assert asyncio.run(catalog.price("fehlt/ganz")) is None


def test_catalog_keeps_its_state_when_loading_fails() -> None:
    catalog = ImageCatalog(transport=httpx.MockTransport(lambda _: httpx.Response(503)))
    asyncio.run(catalog.refresh())
    assert not catalog.available
    assert catalog.models() == []


def test_fixed_filter_settings_per_provider() -> None:
    flux = ImageEndpoint("black-forest-labs", frozenset({"safety_tolerance"}), None)
    assert filter_options("black-forest-labs/flux.2-pro", flux) == {"safety_tolerance": 5}
    assert filter_options("black-forest-labs/flux-3-image", flux) == {"safety_tolerance": 4}
    assert filter_options("black-forest-labs/flux.3-pro", flux) == {"safety_tolerance": 4}
    gpt = ImageEndpoint("openai", frozenset({"moderation"}), None)
    assert filter_options("openai/gpt-image-2", gpt) == {"moderation": "low"}
    assert filter_options("seed/x", ImageEndpoint("seed", frozenset(), None)) == {}


def test_generates_with_the_fixed_filter_and_reads_the_image() -> None:
    adapter, _, server = setup(image_answer(b"\x89PNGbild", cost=0.031))
    image = asyncio.run(adapter.generate(order()))
    assert (image.data, image.media_type, image.cost_usd) == (b"\x89PNGbild", "image/png", 0.031)
    assert server.sent == [
        {
            "model": "black-forest-labs/flux.2-pro",
            "prompt": "Eine Wirtin im Lampenlicht",
            "aspect_ratio": "2:3",
            "n": 1,
            "provider": {"options": {"black-forest-labs": {"safety_tolerance": 5}}},
        }
    ]
    assert server.headers[0]["authorization"] == f"Bearer {KEY}"


def test_gpt_image_gets_low_moderation() -> None:
    adapter, _, server = setup(image_answer())
    asyncio.run(adapter.generate(order("openai/gpt-image-2")))
    assert server.sent[0]["provider"] == {"options": {"openai": {"moderation": "low"}}}


@pytest.mark.parametrize(
    ("status", "kind"),
    [
        (403, ModelRefused),
        (400, InvalidRequest),
        (429, RateLimited),
        (402, ProviderUnavailable),
        (502, ProviderUnavailable),
        (500, ProviderUnavailable),
    ],
)
def test_error_answers_become_error_kinds(status: int, kind: type[Exception]) -> None:
    adapter, _, _ = setup(httpx.Response(status, json={"error": {"message": "x"}}))
    with pytest.raises(kind):
        asyncio.run(adapter.generate(order()))


@pytest.mark.parametrize(
    "answer",
    [
        httpx.Response(200, text="kein json"),
        httpx.Response(200, json={"data": []}),
        httpx.Response(200, json={"data": [{"b64_json": "!!kein base64"}]}),
    ],
)
def test_answers_without_an_image_are_errors(answer: httpx.Response) -> None:
    adapter, _, _ = setup(answer)
    with pytest.raises(ProviderUnavailable):
        asyncio.run(adapter.generate(order()))


def test_connection_errors_do_not_keep_the_key(caplog: pytest.LogCaptureFixture) -> None:
    def broken(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/api/v1/images":
            raise httpx.ConnectError("weg", request=request)
        return Server()(request)

    transport = httpx.MockTransport(broken)
    catalog = ImageCatalog(transport=transport)
    asyncio.run(catalog.refresh())
    adapter = OpenRouterImageProvider(KEY, catalog, transport=transport)
    caplog.set_level(logging.INFO, logger="skriptorium.ai_gateway")
    with pytest.raises(ProviderUnavailable) as raised:
        asyncio.run(adapter.generate(order()))
    assert raised.value.__context__ is None
    assert KEY not in caplog.text
    assert "Wirtin" not in caplog.text
    assert "bild_anfrage" in caplog.text


def test_needs_a_key() -> None:
    with pytest.raises(ProviderUnavailable):
        OpenRouterImageProvider.from_environment(ImageCatalog(), {})
    assert "sk-" not in repr(OpenRouterImageProvider(KEY, ImageCatalog()))


def test_a_cost_that_is_not_a_number_is_dropped() -> None:
    answer = httpx.Response(
        200,
        content=b'{"data": [{"b64_json": "iVBORw==", "media_type": "image/png"}],'
        b' "usage": {"cost": NaN}}',
        headers={"content-type": "application/json"},
    )
    adapter, _, _ = setup(answer)
    assert asyncio.run(adapter.generate(order())).cost_usd is None


def catalog_with(
    models: object, endpoints: object, clock: list[float] | None = None
) -> tuple[ImageCatalog, list[str]]:
    """A catalog whose model list and endpoint answers are given; records requested paths."""
    paths: list[str] = []
    now = clock if clock is not None else [0.0]

    def handler(request: httpx.Request) -> httpx.Response:
        paths.append(request.url.path)
        body = models if request.url.path == "/api/v1/images/models" else endpoints
        return httpx.Response(200, json=body)

    return ImageCatalog(transport=httpx.MockTransport(handler), clock=lambda: now[0]), paths


def test_providers_are_kept_for_an_hour_then_loaded_again() -> None:
    now = [0.0]
    models = {"data": [{"id": "a/b", "name": "B"}]}
    endpoints = {"endpoints": [{"provider_slug": "p", "pricing": []}]}
    catalog, paths = catalog_with(models, endpoints, now)
    asyncio.run(catalog.refresh())
    first = asyncio.run(catalog.endpoints("a/b"))
    assert [e.provider for e in first] == ["p"]
    assert asyncio.run(catalog.endpoints("a/b")) == first
    assert paths.count("/api/v1/images/models/a/b/endpoints") == 1
    now[0] = 3601.0
    asyncio.run(catalog.endpoints("a/b"))
    assert paths.count("/api/v1/images/models/a/b/endpoints") == 2


@pytest.mark.parametrize("endpoints", [{"endpoints": "keine Liste"}, ["kein Objekt"]])
def test_unusable_provider_answers_give_no_providers(
    endpoints: object, caplog: pytest.LogCaptureFixture
) -> None:
    catalog, _ = catalog_with({"data": [{"id": "a/b", "name": "B"}]}, endpoints)
    asyncio.run(catalog.refresh())
    with caplog.at_level(logging.WARNING):
        assert asyncio.run(catalog.endpoints("a/b")) == ()
        assert asyncio.run(catalog.price("a/b")) is None
    assert "bildmodell-anbieter nicht geladen" in caplog.text


def test_failing_provider_request_gives_no_providers() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/api/v1/images/models":
            return httpx.Response(200, json={"data": [{"id": "a/b", "name": "B"}]})
        return httpx.Response(500)

    catalog = ImageCatalog(transport=httpx.MockTransport(handler))
    asyncio.run(catalog.refresh())
    assert asyncio.run(catalog.endpoints("a/b")) == ()


@pytest.mark.parametrize("models", [{"data": "keine Liste"}, ["kein Objekt"]])
def test_a_model_list_without_data_leaves_the_catalog_empty(
    models: object, caplog: pytest.LogCaptureFixture
) -> None:
    catalog, _ = catalog_with(models, {})
    with caplog.at_level(logging.WARNING):
        asyncio.run(catalog.refresh())
    assert not catalog.available
    assert "bildmodell-katalog nicht geladen" in caplog.text


def test_provider_entries_without_slug_or_object_are_skipped() -> None:
    endpoints = {
        "endpoints": [
            "kein Objekt",
            {"allowed_passthrough_parameters": ["x"]},
            {"provider_slug": ""},
            {"provider_slug": "ok", "allowed_passthrough_parameters": ["x", 3]},
        ]
    }
    catalog, _ = catalog_with({"data": [{"id": "a/b", "name": "B"}]}, endpoints)
    asyncio.run(catalog.refresh())
    found = asyncio.run(catalog.endpoints("a/b"))
    assert [(e.provider, e.passthrough) for e in found] == [("ok", frozenset({"x"}))]


@pytest.mark.parametrize(
    "pricing",
    [
        "kein Liste",
        ["kein Objekt"],
        [{"unit": "image", "cost_usd": -1}, {"cost_usd": 0.1}, {"unit": 3, "cost_usd": 0.1}],
    ],
)
def test_prices_without_a_usable_entry_are_none(pricing: object) -> None:
    endpoints = {"endpoints": [{"provider_slug": "p", "pricing": pricing}]}
    catalog, _ = catalog_with({"data": [{"id": "a/b", "name": "B"}]}, endpoints)
    asyncio.run(catalog.refresh())
    assert asyncio.run(catalog.price("a/b")) is None


def test_an_unusable_base_entry_falls_back_to_a_variant() -> None:
    pricing = [
        {"unit": "image", "cost_usd": -1},
        {"variant": "4k", "unit": "image", "cost_usd": 0.5},
    ]
    endpoints = {"endpoints": [{"provider_slug": "p", "pricing": pricing}]}
    catalog, _ = catalog_with({"data": [{"id": "a/b", "name": "B"}]}, endpoints)
    asyncio.run(catalog.refresh())
    assert asyncio.run(catalog.price("a/b")) == ImagePrice(0.5, "image")


def test_the_list_is_not_asked_again_within_an_hour() -> None:
    now = [0.0]
    catalog, paths = catalog_with({"data": [{"id": "a/b", "name": "B"}]}, {}, now)
    asyncio.run(catalog.refresh())
    now[0] = 3599.0
    asyncio.run(catalog.refresh())
    assert paths == ["/api/v1/images/models"]
    now[0] = 3601.0
    asyncio.run(catalog.refresh())
    assert paths == ["/api/v1/images/models"] * 2


def test_a_failed_load_is_not_retried_at_once() -> None:
    now = [0.0]
    calls: list[float] = []

    def handler(_: httpx.Request) -> httpx.Response:
        calls.append(now[0])
        return httpx.Response(503)

    catalog = ImageCatalog(transport=httpx.MockTransport(handler), clock=lambda: now[0])
    asyncio.run(catalog.refresh())
    asyncio.run(catalog.refresh())
    assert calls == [0.0]
    now[0] = 10_000.0
    asyncio.run(catalog.refresh())
    assert calls == [0.0, 10_000.0]


def test_a_model_without_known_providers_is_sent_without_provider_options() -> None:
    adapter, _, server = setup(image_answer())
    asyncio.run(adapter.generate(order("unbekannt/modell")))
    assert "provider" not in server.sent[0]


def test_closing_the_adapter_closes_its_client() -> None:
    adapter, _, _ = setup()
    asyncio.run(adapter.aclose())
    with pytest.raises(RuntimeError):
        asyncio.run(adapter.generate(order()))

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

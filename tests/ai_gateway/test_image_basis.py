"""An image as the basis of a new one through OpenRouter (roadmap step 9.8, ADR-097)."""

import asyncio
import base64

import httpx
import pytest

from skriptorium.ai_gateway import (
    ImageCatalog,
    ImageOrder,
    ImagePrice,
    ImageReference,
    OpenRouterImageProvider,
)
from tests.ai_gateway.test_images import KEY, Server, image_answer, setup

BASIS = ImageReference(b"\x89PNG-grundlage", "image/png")


def test_a_basis_goes_along_as_one_base64_reference() -> None:
    adapter, _, server = setup(image_answer())
    order = ImageOrder("black-forest-labs/flux.2-pro", "Im Winter", "2:3", BASIS)

    asyncio.run(adapter.generate(order))

    encoded = base64.b64encode(BASIS.data).decode()
    assert server.sent[0]["input_references"] == [
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{encoded}"}}
    ]
    assert server.sent[0]["prompt"] == "Im Winter"


def test_without_a_basis_nothing_changes() -> None:
    adapter, _, server = setup(image_answer())

    asyncio.run(adapter.generate(ImageOrder("black-forest-labs/flux.2-pro", "Wirtin", "1:1")))

    assert "input_references" not in server.sent[0]


def test_the_log_and_the_representation_name_no_image(caplog: pytest.LogCaptureFixture) -> None:
    adapter, _, _ = setup(image_answer())
    with caplog.at_level("INFO", logger="skriptorium.ai_gateway"):
        asyncio.run(
            adapter.generate(ImageOrder("black-forest-labs/flux.2-pro", "Geheim", "1:1", BASIS))
        )

    assert "Geheim" not in caplog.text
    assert "grundlage" not in caplog.text
    assert repr(BASIS) == "ImageReference(media_type='image/png', bytes=14)"


MODELS = {
    "data": [
        {
            "id": "a/acht",
            "name": "Acht",
            "supported_parameters": {"input_references": {"type": "range", "min": 0, "max": 8}},
        },
        {"id": "a/keine", "name": "Keine", "supported_parameters": {}},
        {
            "id": "a/falsch",
            "name": "Falsch",
            "supported_parameters": {"input_references": {"max": True}},
        },
        {
            "id": "a/null",
            "name": "Null",
            "supported_parameters": {"input_references": {"min": 0, "max": 0}},
        },
    ]
}
PRICING = {
    "a/acht": [
        {
            "provider_slug": "p",
            "pricing": [
                {"billable": "input_image", "unit": "megapixel", "cost_usd": 0.06},
                {"billable": "output_image", "unit": "megapixel", "cost_usd": 0.03},
            ],
        }
    ],
    "a/keine": [{"provider_slug": "p", "pricing": [{"unit": "image", "cost_usd": 0.04}]}],
}


def _catalog() -> ImageCatalog:
    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path == "/api/v1/images/models":
            return httpx.Response(200, json=MODELS)
        model = path.removeprefix("/api/v1/images/models/").removesuffix("/endpoints")
        return httpx.Response(200, json={"endpoints": PRICING.get(model, [])})

    catalog = ImageCatalog(transport=httpx.MockTransport(handler))
    asyncio.run(catalog.refresh())
    return catalog


def test_the_catalog_knows_how_many_bases_a_model_takes() -> None:
    catalog = _catalog()

    assert [catalog.references(m) for m in ("a/acht", "a/keine", "a/falsch", "a/null")] == [
        8,
        0,
        0,
        0,
    ]
    assert catalog.references("fehlt/ganz") == 0


def test_output_and_basis_are_priced_apart() -> None:
    catalog = _catalog()

    assert asyncio.run(catalog.price("a/acht")) == ImagePrice(0.03, "megapixel")
    assert asyncio.run(catalog.input_price("a/acht")) == ImagePrice(0.06, "megapixel")
    assert asyncio.run(catalog.price("a/keine")) == ImagePrice(0.04, "image")
    assert asyncio.run(catalog.input_price("a/keine")) is None


def test_an_adapter_needs_no_change_for_a_basis_with_another_media_type() -> None:
    server = Server([image_answer()])
    transport = httpx.MockTransport(server)
    catalog = ImageCatalog(transport=transport)
    asyncio.run(catalog.refresh())
    adapter = OpenRouterImageProvider(KEY, catalog, transport=transport)
    basis = ImageReference(b"RIFF....WEBP", "image/webp")

    asyncio.run(adapter.generate(ImageOrder("black-forest-labs/flux.2-pro", "x", "1:1", basis)))

    reference = server.sent[0]["input_references"]
    assert isinstance(reference, list)
    assert reference[0]["image_url"]["url"].startswith("data:image/webp;base64,")

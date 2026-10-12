"""Generating images over the API (roadmap step 7.12, ADR-077): preview only, nothing stored."""

import base64
from pathlib import Path

from fastapi.testclient import TestClient

from skriptorium.ai_gateway import ModelRefused, ProviderUnavailable
from skriptorium.api import create_app
from skriptorium.api.settings import Settings
from tests.api.conftest import ORIGIN, FakeImages, cheap_hasher, services_of, set_up_password
from tests.image_samples import png

ORDER = {"model": "black-forest-labs/flux.2-pro", "prompt": "Eine Wirtin", "aspect_ratio": "2:3"}


def test_lists_image_models_without_vector_models(logged_in: TestClient) -> None:
    body = logged_in.get("/api/images/models").json()
    assert body["default"] == "black-forest-labs/flux.2-pro"
    assert [m["id"] for m in body["models"]] == [
        "black-forest-labs/flux.2-pro",
        "bytedance-seed/seedream-4.5",
    ]
    assert body["available"] is True
    assert body["ready"] is True


def test_names_the_price_of_a_model(logged_in: TestClient) -> None:
    flux = logged_in.get("/api/images/price", params={"model": "black-forest-labs/flux.2-pro"})
    assert flux.json() == {"cost_usd": 0.03, "unit": "megapixel"}
    seed = logged_in.get("/api/images/price", params={"model": "bytedance-seed/seedream-4.5"})
    assert seed.json() == {"cost_usd": 0.04, "unit": "image"}
    vector = logged_in.get("/api/images/price", params={"model": "recraft/recraft-v4-vector"})
    assert vector.status_code == 422


def test_generates_a_preview_and_stores_nothing(
    logged_in: TestClient, images: FakeImages, data_dir: Path
) -> None:
    response = logged_in.post("/api/images/generate", json=ORDER)
    assert response.status_code == 200, response.text
    body = response.json()
    assert base64.b64decode(body["content"]) == png(1024, 1536)
    assert body["media_type"] == "image/png"
    assert body["cost_usd"] == 0.03
    (order,) = images.orders
    assert (order.model, order.prompt, order.aspect_ratio) == (ORDER["model"], "Eine Wirtin", "2:3")
    assert services_of(logged_in).usage.month().requests == 1
    text = next((data_dir / "system" / "verbrauch").glob("*.md")).read_text(encoding="utf-8")
    assert "art: bilderzeugung" in text
    assert (
        not list((data_dir / "worlds").rglob("*.png")) if (data_dir / "worlds").exists() else True
    )


def test_the_media_type_follows_the_bytes_not_the_provider(
    logged_in: TestClient, images: FakeImages
) -> None:
    images.media_type = "image/jpeg"
    assert logged_in.post("/api/images/generate", json=ORDER).json()["media_type"] == "image/png"


def test_refuses_svg_and_other_deliveries(logged_in: TestClient, images: FakeImages) -> None:
    images.image = b"<svg xmlns='http://www.w3.org/2000/svg'><script>x</script></svg>"
    images.media_type = "image/svg+xml"
    response = logged_in.post("/api/images/generate", json=ORDER)
    assert response.status_code == 502
    assert "<svg" not in response.text


def test_a_refusal_is_named_and_counted(logged_in: TestClient, images: FakeImages) -> None:
    images.error = ModelRefused("Moderation")
    response = logged_in.post("/api/images/generate", json=ORDER)
    assert response.status_code == 422
    assert "abgelehnt" in response.json()["detail"]
    assert "Wirtin" not in response.text
    month = services_of(logged_in).usage.month()
    assert month.requests == 1


def test_a_failure_is_an_answer(logged_in: TestClient, images: FakeImages) -> None:
    images.error = ProviderUnavailable("Das Bild wurde nicht fertig erzeugt (HTTP 502)")
    response = logged_in.post("/api/images/generate", json=ORDER)
    assert response.status_code == 502
    assert "anderes Modell" in response.json()["detail"]


def test_invalid_orders(logged_in: TestClient, images: FakeImages) -> None:
    unknown = {**ORDER, "model": "recraft/recraft-v4-vector"}
    assert logged_in.post("/api/images/generate", json=unknown).status_code == 422
    assert logged_in.post("/api/images/generate", json={**ORDER, "prompt": ""}).status_code == 422
    blank = {**ORDER, "prompt": "   "}
    assert logged_in.post("/api/images/generate", json=blank).status_code == 422
    long = {**ORDER, "prompt": "x" * 4001}
    assert logged_in.post("/api/images/generate", json=long).status_code == 422
    odd = {**ORDER, "aspect_ratio": "7:1"}
    assert logged_in.post("/api/images/generate", json=odd).status_code == 422
    assert images.orders == []


def test_without_a_key_generating_answers_503(data_dir: Path) -> None:
    app = create_app(
        Settings(data_dir=data_dir, ui_dir=data_dir / "no-ui"),
        hasher=cheap_hasher(),
        provider_factory=lambda _: None,
        image_provider_factory=lambda _: None,
    )
    with TestClient(app, base_url=ORIGIN, headers={"Origin": ORIGIN}) as client:
        set_up_password(client)
        client.post("/api/auth/login", json={"password": "Salzwind über der Mark 7"})
        assert client.post("/api/images/generate", json=ORDER).status_code == 503

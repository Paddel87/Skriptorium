"""Describing an image or a map once over the API (roadmap step 7.13, ADR-074)."""

import base64
from pathlib import Path

from fastapi.testclient import TestClient

from tests.api.conftest import FakeProvider, services_of
from tests.api.test_writing import _events, writer
from tests.image_samples import jpeg, png

__all__ = ["writer"]

WORLD = "/api/worlds/die-salzmark"


def _image(client: TestClient, entry: str = "kael") -> str:
    response = client.post(
        f"{WORLD}/entries/{entry}/images",
        json={"content": base64.b64encode(png()).decode()},
    )
    assert response.status_code == 201, response.text
    images: list[str] = response.json()["images"]
    return images[-1]


def test_describes_an_image_of_a_figure_once_and_saves_nothing(
    writer: TestClient, provider: FakeProvider
) -> None:
    image = _image(writer)
    before = writer.get(f"{WORLD}/entries/kael").json()

    response = writer.post(
        f"{WORLD}/entries/kael/images/{image}/describe", json={"model": "x-ai/grok-4.6"}
    )

    assert response.status_code == 200, response.text
    assert response.headers["cache-control"] == "no-store"
    events = _events(response.text)
    assert [name for name, _ in events] == ["start", "text", "text", "done"]
    (request,) = provider.requests
    system, user = request.messages
    assert "Figur „Kael“" in system.content
    assert "Aussehen" in system.content
    assert "nur, was im Bild zu sehen ist" in system.content
    assert system.images == ()
    (part,) = user.images
    assert (part.media_type, part.data) == ("image/png", png())
    assert request.temperature == 0.3
    assert writer.get(f"{WORLD}/entries/kael").json() == before


def test_describes_a_map_as_geography(writer: TestClient, provider: FakeProvider) -> None:
    added = writer.post(
        f"{WORLD}/maps",
        json={"name": "Seekarte", "content": base64.b64encode(jpeg()).decode()},
    )
    file = added.json()["maps"][0]["file"]

    response = writer.post(f"{WORLD}/maps/{file}/describe", json={"model": "x-ai/grok-4.6"})

    assert response.status_code == 200, response.text
    system, user = provider.requests[0].messages
    assert "Karte „Seekarte“" in system.content
    assert "Himmelsrichtungen" in system.content
    assert user.images[0].media_type == "image/jpeg"


def test_only_models_that_read_images(writer: TestClient, provider: FakeProvider) -> None:
    image = _image(writer)
    url = f"{WORLD}/entries/kael/images/{image}/describe"

    blind = writer.post(url, json={"model": "deepseek/deepseek-v3.2"})
    unknown = writer.post(url, json={"model": "gibt/es-nicht"})

    assert blind.status_code == 422
    assert "keine Bilder" in blind.text
    assert unknown.status_code == 422
    assert provider.requests == []


def test_unknown_images_and_maps(writer: TestClient, provider: FakeProvider) -> None:
    model = {"model": "x-ai/grok-4.6"}
    assert (
        writer.post(f"{WORLD}/entries/kael/images/fremd.png/describe", json=model).status_code
        == 404
    )
    assert (
        writer.post(f"{WORLD}/maps/karte-000000000000.png/describe", json=model).status_code == 404
    )
    assert provider.requests == []


def test_usage_is_counted_as_bildbeschreibung(writer: TestClient, data_dir: Path) -> None:
    image = _image(writer)
    writer.post(f"{WORLD}/entries/kael/images/{image}/describe", json={"model": "x-ai/grok-4.6"})

    assert services_of(writer).usage.month().requests == 1
    text = next((data_dir / "system" / "verbrauch").glob("*.md")).read_text(encoding="utf-8")
    assert "art: bildbeschreibung" in text

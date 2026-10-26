"""HTTP tests for an image as the basis of a new one (roadmap step 9.8, ADR-097)."""

import base64
from typing import Any

import pytest
from fastapi.testclient import TestClient

from tests.api.conftest import FakeImages
from tests.image_samples import jpeg, png

WORLD = "/api/worlds/die-salzmark"
ENTRY = f"{WORLD}/entries/gunda"
STORY = f"{WORLD}/stories/das-salz"
ORDER = {"model": "black-forest-labs/flux.2-pro", "prompt": "Im Winter", "aspect_ratio": "2:3"}


def _content(data: bytes) -> str:
    return base64.b64encode(data).decode()


def _setup(client: TestClient) -> dict[str, str]:
    """A world with an entry image, a map and a cover; their names."""
    client.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    client.post(f"{WORLD}/entries", json={"category": "figur", "name": "Gunda"})
    client.post(f"{WORLD}/stories", json={"title": "Das Salz", "form": "kurzgeschichte"})
    image = client.post(f"{ENTRY}/images", json={"content": _content(png(64, 96))}).json()
    world = client.post(
        f"{WORLD}/maps", json={"name": "Küste", "content": _content(png(80, 60))}
    ).json()
    client.post(f"{STORY}/cover", json={"content": _content(jpeg())})
    return {"image": image["images"][0], "map": world["maps"][0]["file"]}


def _generate(client: TestClient, reference: dict[str, Any], **changes: Any) -> Any:
    return client.post("/api/images/generate", json={**ORDER, **changes, "reference": reference})


def test_an_entry_image_goes_to_the_model_as_basis(
    logged_in: TestClient, images: FakeImages
) -> None:
    names = _setup(logged_in)

    response = _generate(
        logged_in, {"world": "die-salzmark", "entry": "gunda", "image": names["image"]}
    )

    assert response.status_code == 200, response.text
    reference = images.orders[-1].reference
    assert reference is not None
    stored = logged_in.get(f"{ENTRY}/images/{names['image']}")
    assert reference.data == stored.content
    assert reference.media_type == stored.headers["content-type"]
    assert images.orders[-1].prompt == "Im Winter"
    # Nothing new is stored: the entry still has its one image.
    assert logged_in.get(ENTRY).json()["images"] == [names["image"]]


def test_a_map_and_a_cover_can_be_the_basis(logged_in: TestClient, images: FakeImages) -> None:
    names = _setup(logged_in)

    by_map = _generate(logged_in, {"world": "die-salzmark", "map_file": names["map"]})
    by_cover = _generate(logged_in, {"world": "die-salzmark", "story": "das-salz"})

    assert (by_map.status_code, by_cover.status_code) == (200, 200)
    first, second = (order.reference for order in images.orders)
    assert first is not None and first.media_type == "image/png"
    assert second is not None and second.media_type == "image/jpeg"


def test_without_a_basis_the_order_has_none(logged_in: TestClient, images: FakeImages) -> None:
    assert logged_in.post("/api/images/generate", json=ORDER).status_code == 200
    assert images.orders[-1].reference is None


def test_a_model_without_basis_support_is_refused(
    logged_in: TestClient, images: FakeImages
) -> None:
    names = _setup(logged_in)

    response = _generate(
        logged_in,
        {"world": "die-salzmark", "entry": "gunda", "image": names["image"]},
        model="bytedance-seed/seedream-4.5",
    )

    assert response.status_code == 422
    assert "nimmt kein Ausgangsbild an" in response.text
    assert images.orders == []


@pytest.mark.parametrize(
    "reference",
    [
        {"world": "die-salzmark"},
        {"world": "die-salzmark", "entry": "gunda"},
        {"world": "die-salzmark", "image": "gunda-x.png"},
        {"world": "die-salzmark", "story": "das-salz", "map_file": "karte-x.png"},
        {"world": "die-salzmark", "entry": "gunda", "image": "a.png", "story": "das-salz"},
    ],
)
def test_exactly_one_stored_image_must_be_named(
    logged_in: TestClient, images: FakeImages, reference: dict[str, str]
) -> None:
    _setup(logged_in)

    response = _generate(logged_in, reference)

    assert response.status_code == 422
    assert "Grundlage" in response.text
    assert images.orders == []


def test_an_unknown_image_is_not_found(logged_in: TestClient, images: FakeImages) -> None:
    _setup(logged_in)

    response = _generate(
        logged_in, {"world": "die-salzmark", "entry": "gunda", "image": "gunda-000000.png"}
    )

    assert response.status_code == 404
    assert images.orders == []


def test_image_models_name_how_many_bases_they_take(logged_in: TestClient) -> None:
    models = logged_in.get("/api/images/models").json()["models"]

    assert {m["id"]: m["references"] for m in models} == {
        "black-forest-labs/flux.2-pro": 8,
        "bytedance-seed/seedream-4.5": 0,
    }


def test_the_origin_names_the_basis(logged_in: TestClient) -> None:
    _setup(logged_in)
    origin = {
        "model": "black-forest-labs/flux.2-pro",
        "prompt": "Im Winter",
        "aspect_ratio": "2:3",
        "cost_usd": 0.05,
        "basis": "Bild 1 von Gunda",
    }

    added = logged_in.post(f"{ENTRY}/images", json={"content": _content(png()), "herkunft": origin})
    plain = {key: value for key, value in origin.items() if key != "basis"}
    other = logged_in.post(f"{ENTRY}/images", json={"content": _content(png()), "herkunft": plain})

    made = added.json()["images"][-1]
    assert logged_in.get(f"{ENTRY}/images/{made}/origin").json()["basis"] == "Bild 1 von Gunda"
    without = other.json()["images"][-1]
    assert logged_in.get(f"{ENTRY}/images/{without}/origin").json()["basis"] is None


@pytest.mark.parametrize("basis", ["", "x" * 201])
def test_a_basis_text_has_bounds(logged_in: TestClient, basis: str) -> None:
    _setup(logged_in)
    origin = {"model": "m/x", "prompt": "p", "aspect_ratio": "1:1", "basis": basis}

    response = logged_in.post(
        f"{ENTRY}/images", json={"content": _content(png()), "herkunft": origin}
    )

    assert response.status_code == 422

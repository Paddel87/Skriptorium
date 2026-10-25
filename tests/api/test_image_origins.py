"""HTTP tests for the origin of generated images (step 9.6, ADR-095)."""

import base64
from typing import Any

import pytest
from fastapi.testclient import TestClient

from tests.image_samples import jpeg, png

WORLD = "/api/worlds/die-salzmark"
ENTRY = f"{WORLD}/entries/gunda"
STORY = f"{WORLD}/stories/das-salz"
ORIGIN = {
    "model": "openai/gpt-image-1",
    "prompt": "Gunda am Salzhafen, Abendlicht",
    "aspect_ratio": "2:3",
    "cost_usd": 0.04,
}


def _setup(client: TestClient) -> None:
    client.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    client.post(f"{WORLD}/entries", json={"category": "figur", "name": "Gunda"})
    client.post(f"{WORLD}/stories", json={"title": "Das Salz", "form": "kurzgeschichte"})


def _content(data: bytes) -> str:
    return base64.b64encode(data).decode()


def _check_origin(found: dict[str, Any]) -> None:
    assert {k: found[k] for k in ORIGIN} == ORIGIN
    assert found["date"].endswith("+00:00")


def test_an_entry_image_keeps_its_origin(logged_in: TestClient) -> None:
    _setup(logged_in)
    added = logged_in.post(f"{ENTRY}/images", json={"content": _content(png()), "herkunft": ORIGIN})
    assert added.status_code == 201, added.text
    generated = added.json()["images"][0]
    uploaded = logged_in.post(f"{ENTRY}/images", json={"content": _content(jpeg())}).json()[
        "images"
    ][1]
    _check_origin(logged_in.get(f"{ENTRY}/images/{generated}/origin").json())
    assert logged_in.get(f"{ENTRY}/images/{uploaded}/origin").json() is None
    logged_in.delete(f"{ENTRY}/images/{generated}")
    assert logged_in.get(f"{ENTRY}/images/{generated}/origin").status_code == 404


def test_a_map_keeps_its_origin(logged_in: TestClient) -> None:
    _setup(logged_in)
    added = logged_in.post(
        f"{WORLD}/maps", json={"name": "Küste", "content": _content(png()), "herkunft": ORIGIN}
    )
    assert added.status_code == 201, added.text
    file = added.json()["maps"][0]["file"]
    _check_origin(logged_in.get(f"{WORLD}/maps/{file}/origin").json())
    logged_in.delete(f"{WORLD}/maps/{file}")
    assert logged_in.get(f"{WORLD}/maps/{file}/origin").status_code == 404


def test_a_cover_keeps_its_origin_until_replaced(logged_in: TestClient) -> None:
    _setup(logged_in)
    assert logged_in.get(f"{STORY}/cover/origin").status_code == 404
    added = logged_in.post(f"{STORY}/cover", json={"content": _content(jpeg()), "herkunft": ORIGIN})
    assert added.status_code == 200, added.text
    _check_origin(logged_in.get(f"{STORY}/cover/origin").json())
    logged_in.post(f"{STORY}/cover", json={"content": _content(png())})
    assert logged_in.get(f"{STORY}/cover/origin").json() is None


@pytest.mark.parametrize(
    "change",
    [
        {"aspect_ratio": "5:1"},
        {"prompt": ""},
        {"prompt": "x" * 4001},
        {"model": ""},
        {"model": "m" * 201},
        {"cost_usd": -1},
    ],
)
def test_refuses_a_malformed_origin(logged_in: TestClient, change: dict[str, Any]) -> None:
    _setup(logged_in)
    response = logged_in.post(
        f"{ENTRY}/images", json={"content": _content(png()), "herkunft": ORIGIN | change}
    )
    assert response.status_code == 422
    assert logged_in.get(ENTRY).json()["images"] == []

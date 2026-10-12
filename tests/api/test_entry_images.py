"""HTTP tests for the images of canon entries (step 7.6, ADR-072)."""

import base64

from fastapi.testclient import TestClient

from tests.api.conftest import ORIGIN
from tests.image_samples import jpeg, png

ENTRY = "/api/worlds/die-salzmark/entries/gunda"


def _setup(client: TestClient) -> None:
    client.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    client.post("/api/worlds/die-salzmark/entries", json={"category": "figur", "name": "Gunda"})


def _upload(client: TestClient, data: bytes) -> list[str]:
    response = client.post(f"{ENTRY}/images", json={"content": base64.b64encode(data).decode()})
    assert response.status_code == 201, response.text
    images: list[str] = response.json()["images"]
    return images


def test_upload_show_reorder_and_remove(logged_in: TestClient) -> None:
    _setup(logged_in)
    assert logged_in.get(ENTRY).json()["images"] == []
    _upload(logged_in, png())
    first, second = _upload(logged_in, jpeg())
    shown = logged_in.get(f"{ENTRY}/images/{second}")
    assert shown.status_code == 200
    assert shown.content == jpeg()
    assert shown.headers["content-type"] == "image/jpeg"
    assert shown.headers["x-content-type-options"] == "nosniff"
    assert shown.headers["cache-control"] == "no-store"
    main = logged_in.post(f"{ENTRY}/images/{second}/main")
    assert main.json()["images"] == [second, first]
    removed = logged_in.delete(f"{ENTRY}/images/{second}")
    assert removed.json()["images"] == [first]
    assert logged_in.get(f"{ENTRY}/images/{second}").status_code == 404


def test_refuses_other_files_without_echoing_them(logged_in: TestClient) -> None:
    _setup(logged_in)
    svg = base64.b64encode(b"<svg><script>GEHEIM</script></svg>").decode()
    response = logged_in.post(f"{ENTRY}/images", json={"content": svg})
    assert response.status_code == 422
    assert "GEHEIM" not in response.text
    assert logged_in.post(f"{ENTRY}/images", json={"content": "!!"}).status_code == 422
    too_long = logged_in.post(f"{ENTRY}/images", json={"content": "A" * 7_000_001})
    assert too_long.status_code == 422
    assert "AAAA" not in too_long.text
    assert logged_in.get(ENTRY).json()["images"] == []


def test_unknown_images_and_paths(logged_in: TestClient) -> None:
    _setup(logged_in)
    assert logged_in.get(f"{ENTRY}/images/fremd.png").status_code == 404
    assert logged_in.get(f"{ENTRY}/images/..%2F..%2Fworld.md").status_code == 404
    assert logged_in.get("/api/worlds/die-salzmark/entries/fehlt/images/a.png").status_code == 404


def test_upload_needs_json_from_the_own_origin(logged_in: TestClient) -> None:
    _setup(logged_in)
    raw = logged_in.post(
        f"{ENTRY}/images", content=png(), headers={"content-type": "image/png", "origin": ORIGIN}
    )
    assert raw.status_code == 415
    foreign = logged_in.post(
        f"{ENTRY}/images",
        json={"content": base64.b64encode(png()).decode()},
        headers={"origin": "https://fremd.example"},
    )
    assert foreign.status_code == 403


def test_images_need_a_session(logged_in: TestClient) -> None:
    _setup(logged_in)
    (image,) = _upload(logged_in, png())
    logged_in.cookies.clear()
    assert logged_in.get(f"{ENTRY}/images/{image}").status_code == 401
    upload = logged_in.post(f"{ENTRY}/images", json={"content": base64.b64encode(png()).decode()})
    assert upload.status_code == 401

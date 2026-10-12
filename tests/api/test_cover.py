"""HTTP tests for the cover of a story (step 7.11, ADR-075)."""

import base64
import zipfile
from io import BytesIO

from fastapi.testclient import TestClient

from tests.image_samples import jpeg

STORY = "/api/worlds/die-salzmark/stories/das-salz"


def _setup(client: TestClient) -> None:
    client.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    client.post(
        "/api/worlds/die-salzmark/stories", json={"title": "Das Salz", "form": "kurzgeschichte"}
    )


def test_upload_show_and_remove_a_cover(logged_in: TestClient) -> None:
    _setup(logged_in)
    added = logged_in.post(f"{STORY}/cover", json={"content": base64.b64encode(jpeg()).decode()})
    assert added.status_code == 200, added.text
    assert added.json()["cover"].startswith("titelbild-")
    shown = logged_in.get(f"{STORY}/cover")
    assert shown.content == jpeg()
    assert shown.headers["content-type"] == "image/jpeg"
    assert shown.headers["cache-control"] == "no-store"
    removed = logged_in.delete(f"{STORY}/cover")
    assert removed.json()["cover"] is None
    assert logged_in.get(f"{STORY}/cover").status_code == 404


def test_refuses_other_files_without_echoing_them(logged_in: TestClient) -> None:
    _setup(logged_in)
    svg = base64.b64encode(b"<svg><script>GEHEIM</script></svg>").decode()
    refused = logged_in.post(f"{STORY}/cover", json={"content": svg})
    assert refused.status_code == 422
    assert "GEHEIM" not in refused.text
    assert logged_in.post(f"{STORY}/cover", json={"content": "!!"}).status_code == 422
    assert logged_in.get(STORY).json()["cover"] is None


def test_the_ebook_carries_the_cover(logged_in: TestClient) -> None:
    _setup(logged_in)
    logged_in.put(f"{STORY}/chapters/1", json={"title": "Eins", "text": "Nebel."})
    logged_in.post(f"{STORY}/cover", json={"content": base64.b64encode(jpeg()).decode()})
    book = logged_in.post(f"{STORY}/export/epub", json={})
    assert book.status_code == 200, book.text
    assert zipfile.ZipFile(BytesIO(book.content)).read("OEBPS/umschlag.jpg") == jpeg()


def test_cover_needs_a_session(logged_in: TestClient) -> None:
    _setup(logged_in)
    logged_in.cookies.clear()
    assert logged_in.get(f"{STORY}/cover").status_code == 401

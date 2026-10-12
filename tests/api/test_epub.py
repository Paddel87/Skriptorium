"""HTTP test of the EPUB export (step 7.4, ADR-071)."""

import zipfile
from io import BytesIO

from fastapi.testclient import TestClient

BASE = "/api/worlds/die-salzmark/stories"


def test_downloads_a_story_as_epub(logged_in: TestClient) -> None:
    logged_in.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    logged_in.post(BASE, json={"title": "Nacht", "form": "roman"})
    logged_in.put(f"{BASE}/nacht/chapters/1", json={"title": "Eins", "text": "Nebel."})
    response = logged_in.post(f"{BASE}/nacht/export/epub", json={"author": "Autorin"})
    assert response.status_code == 200, response.text
    assert response.headers["content-type"] == "application/epub+zip"
    assert response.headers["content-disposition"] == 'attachment; filename="nacht.epub"'
    assert response.headers["cache-control"] == "no-store"
    book = zipfile.ZipFile(BytesIO(response.content))
    assert book.namelist()[0] == "mimetype"
    assert "Autorin" in book.read("OEBPS/titel.xhtml").decode()
    refused = logged_in.post(f"{BASE}/nacht/export/epub", json={"only_completed": True})
    assert refused.status_code == 422
    assert "abgeschlossenes Kapitel" in refused.text
    too_long = logged_in.post(f"{BASE}/nacht/export/epub", json={"author": "GEHEIM" * 40})
    assert too_long.status_code == 422
    assert "GEHEIM" not in too_long.text
    assert logged_in.post(f"{BASE}/niemand/export/epub", json={}).status_code == 404

"""Taking out the looks of a figure over the API (step 7.16, ADR-078)."""

from pathlib import Path

from fastapi.testclient import TestClient

from tests.api.conftest import FakeProvider
from tests.api.test_writing import _events, writer

__all__ = ["writer"]

URL = "/api/worlds/die-salzmark/entries/kael/appearance"


def test_streams_the_looks_and_saves_nothing(
    writer: TestClient, provider: FakeProvider, data_dir: Path
) -> None:
    before = writer.get("/api/worlds/die-salzmark/entries/kael").json()

    response = writer.post(URL, json={})

    assert response.status_code == 200, response.text
    assert [name for name, _ in _events(response.text)] == ["start", "text", "text", "done"]
    system, user = provider.requests[0].messages
    assert "äußeres Erscheinungsbild" in system.content
    assert "Kael" in user.content
    assert provider.requests[0].temperature == 0.2
    assert writer.get("/api/worlds/die-salzmark/entries/kael").json() == before
    text = next((data_dir / "system" / "verbrauch").glob("*.md")).read_text(encoding="utf-8")
    assert "art: aussehen" in text


def test_unknown_model_and_entry(writer: TestClient, provider: FakeProvider) -> None:
    assert writer.post(URL, json={"model": "gibt/es-nicht"}).status_code == 422
    missing = writer.post("/api/worlds/die-salzmark/entries/niemand/appearance", json={})
    assert missing.status_code == 404
    assert provider.requests == []


def test_an_entry_too_large_for_the_budget_is_refused(
    writer: TestClient, provider: FakeProvider
) -> None:
    writer.post(
        "/api/worlds/die-salzmark/entries",
        json={"category": "figur", "name": "Riesenfigur", "body": "Narbe. " * 20_000},
    )

    response = writer.post("/api/worlds/die-salzmark/entries/riesenfigur/appearance", json={})

    assert response.status_code == 422
    assert "Eintrag (" in response.json()["detail"]
    assert provider.requests == []


def test_an_entry_that_is_not_a_figure_is_refused(
    writer: TestClient, provider: FakeProvider
) -> None:
    """Step 8.4 (ADR-083, D.18 B6): the request is refused before anything is sent."""
    writer.post(
        "/api/worlds/die-salzmark/entries",
        json={"category": "ort", "name": "Karst", "body": "Hafenstadt am Salz."},
    )

    response = writer.post("/api/worlds/die-salzmark/entries/karst/appearance", json={})

    assert response.status_code == 422
    assert "nur bei Figuren" in response.json()["detail"]
    assert provider.requests == []

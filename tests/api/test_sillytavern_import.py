"""HTTP test of the SillyTavern import (step 6.8, ADR-065): translation only, nothing stored."""

import base64
from pathlib import Path

from fastapi.testclient import TestClient

FIXTURES = Path(__file__).parents[1] / "canon" / "fixtures" / "sillytavern"
PATH = "/api/worlds/die-salzmark/import/sillytavern"


def _encoded(name: str) -> str:
    return base64.b64encode((FIXTURES / name).read_bytes()).decode()


def test_translates_a_card_for_the_import_field(logged_in: TestClient) -> None:
    logged_in.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    response = logged_in.post(PATH, json={"content": _encoded("karte-v2.json")})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["markdown"].startswith("# Figuren\n\n## Mira Ostwind\n")
    assert len(body["not_taken_over"]) == 3
    assert logged_in.get("/api/worlds/die-salzmark/entries").json() == []
    preview = logged_in.post(
        "/api/worlds/die-salzmark/import/preview", json={"markdown": body["markdown"]}
    )
    assert [item["name"] for item in preview.json()["items"]] == [
        "Mira Ostwind",
        "Die Rote Laterne",
        "Zollhaus",
    ]


def test_refuses_broken_input_without_echoing_it(logged_in: TestClient) -> None:
    logged_in.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    not_base64 = logged_in.post(PATH, json={"content": "GEHEIM!!"})
    assert not_base64.status_code == 422
    assert "GEHEIM" not in not_base64.text
    not_st = logged_in.post(PATH, json={"content": base64.b64encode(b'{"geheim": 1}').decode()})
    assert not_st.status_code == 422
    assert "geheim" not in not_st.text
    too_long = logged_in.post(PATH, json={"content": "A" * 14_000_000})
    assert too_long.status_code == 422
    assert "AAAA" not in too_long.text


def test_unknown_world(logged_in: TestClient) -> None:
    response = logged_in.post(PATH, json={"content": _encoded("lorebook-st.json")})
    assert response.status_code == 404

"""HTTP tests of the endpoints for canon and manuscript, including the flow checks of api."""

from fastapi.testclient import TestClient

from tests.api.conftest import services_of

MATERIAL = """# Figuren

## Kael
Aliasse: der Fährmann
Fährt über den Salzsee.

## Mira
Kategorie: figur
Heilerin.
"""


def _world(client: TestClient, name: str = "Die Salzmark") -> str:
    response = client.post("/api/worlds", json={"name": name, "description": "Salz"})
    assert response.status_code == 201, response.text
    world_id: str = response.json()["id"]
    return world_id


def _entry(client: TestClient, world: str, name: str, category: str = "figur") -> str:
    response = client.post(
        f"/api/worlds/{world}/entries", json={"category": category, "name": name}
    )
    assert response.status_code == 201, response.text
    entry_id: str = response.json()["id"]
    return entry_id


def test_worlds(logged_in: TestClient) -> None:
    world = _world(logged_in)
    assert world == "die-salzmark"
    assert [w["id"] for w in logged_in.get("/api/worlds").json()] == [world]
    changed = logged_in.patch(f"/api/worlds/{world}", json={"description": "Neu"})
    assert changed.json() == {"id": world, "name": "Die Salzmark", "description": "Neu"}
    assert logged_in.get(f"/api/worlds/{world}").json()["description"] == "Neu"
    assert logged_in.post("/api/worlds", json={"name": "Die Salzmark"}).status_code == 409
    assert logged_in.post("/api/worlds", json={"name": "  "}).status_code == 422
    assert logged_in.get("/api/worlds/nirgendwo").status_code == 404


def test_entries_and_search(logged_in: TestClient) -> None:
    world = _world(logged_in)
    response = logged_in.post(
        f"/api/worlds/{world}/entries",
        json={"category": "figur", "name": "Kael", "aliases": ["Fährmann"], "status": "lebt"},
    )
    assert response.status_code == 201
    _entry(logged_in, world, "Salzsee", "ort")
    listed = logged_in.get(f"/api/worlds/{world}/entries", params={"category": "ort"}).json()
    assert [e["id"] for e in listed] == ["salzsee"]
    assert (
        logged_in.get(f"/api/worlds/{world}/entries", params={"category": "x"}).status_code == 422
    )
    changed = logged_in.patch(
        f"/api/worlds/{world}/entries/kael", json={"status": None, "body": "Tot?"}
    ).json()
    assert changed["status"] is None
    assert changed["aliases"] == ["Fährmann"]
    assert logged_in.get(f"/api/worlds/{world}/entries/kael").json()["body"] == "Tot?"
    found = logged_in.get(f"/api/worlds/{world}/search", params={"text": "fähr"}).json()
    assert [e["id"] for e in found] == ["kael"]
    assert logged_in.delete(f"/api/worlds/{world}/entries/kael").status_code == 204
    assert logged_in.get(f"/api/worlds/{world}/entries/kael").status_code == 404


def test_import_preview_and_apply(logged_in: TestClient) -> None:
    world = _world(logged_in)
    preview = logged_in.post(
        f"/api/worlds/{world}/import/preview", json={"markdown": MATERIAL}
    ).json()
    assert [(i["id"], i["category"]) for i in preview["items"]] == [
        ("kael", "figur"),
        ("mira", "figur"),
    ]
    assert logged_in.get(f"/api/worlds/{world}/entries").json() == []
    result = logged_in.post(
        f"/api/worlds/{world}/import",
        json={"markdown": MATERIAL, "categories": {"mira": "kultur"}, "overwrite": []},
    ).json()
    assert result == {"created": ["kael", "mira"], "overwritten": [], "skipped": []}
    assert logged_in.get(f"/api/worlds/{world}/entries/mira").json()["category"] == "kultur"


def test_stories_and_chapters(logged_in: TestClient) -> None:
    world = _world(logged_in)
    _entry(logged_in, world, "Kael")
    response = logged_in.post(
        f"/api/worlds/{world}/stories",
        json={"title": "Die Überfahrt", "form": "roman", "controlled_characters": ["kael"]},
    )
    assert response.status_code == 201, response.text
    story = response.json()["id"]
    base = f"/api/worlds/{world}/stories/{story}"
    assert [s["id"] for s in logged_in.get(f"/api/worlds/{world}/stories").json()] == [story]
    assert logged_in.patch(base, json={"perspective": "ich"}).json()["perspective"] == "ich"
    assert logged_in.put(f"{base}/summary", json={"summary": "Bisher"}).json()["summary"] == (
        "Bisher"
    )
    saved = logged_in.put(f"{base}/chapters/1", json={"title": "Aufbruch", "text": "Es war"})
    assert saved.status_code == 200, saved.text
    assert logged_in.put(f"{base}/chapters/3", json={"title": "Zu weit"}).status_code == 404
    assert logged_in.put(f"{base}/chapters/1", json={"text": "Es war kalt"}).json()["title"] == (
        "Aufbruch"
    )
    assert logged_in.get(f"{base}/chapters/1").json()["text"] == "Es war kalt"
    assert logged_in.post(f"{base}/chapters/1/complete").json()["status"] == "abgeschlossen"
    summary = logged_in.put(
        f"{base}/chapters/1/summary", json={"summary": "Kael bricht auf", "status": "geprüft"}
    ).json()
    assert summary["summary_status"] == "geprüft"
    assert [c["number"] for c in logged_in.get(f"{base}/chapters").json()] == [1]
    assert logged_in.get(f"{base}/chapters/9").status_code == 404
    assert logged_in.get(base).json()["title"] == "Die Überfahrt"


def test_story_checks_world_and_character_references(logged_in: TestClient) -> None:
    world = _world(logged_in)
    missing_world = logged_in.post(
        "/api/worlds/nirgendwo/stories", json={"title": "X", "form": "fragment"}
    )
    assert missing_world.status_code == 404
    unknown = logged_in.post(
        f"/api/worlds/{world}/stories",
        json={"title": "X", "form": "fragment", "controlled_characters": ["niemand"]},
    )
    assert unknown.status_code == 422
    assert "niemand" in unknown.json()["detail"]
    bad_form = logged_in.post(f"/api/worlds/{world}/stories", json={"title": "X", "form": "epos"})
    assert bad_form.status_code == 422
    assert logged_in.get("/api/worlds/nirgendwo/stories").status_code == 404


def test_guest_links_and_facts(logged_in: TestClient) -> None:
    world = _world(logged_in)
    other = _world(logged_in, "Nordland")
    _entry(logged_in, world, "Kael")
    _entry(logged_in, other, "Ragna")
    story = logged_in.post(
        f"/api/worlds/{world}/stories", json={"title": "Treffen", "form": "kurzgeschichte"}
    ).json()["id"]
    base = f"/api/worlds/{world}/stories/{story}"

    missing = logged_in.post(f"{base}/guests", json={"world": other, "entry": "niemand"})
    assert missing.status_code == 422
    added = logged_in.post(f"{base}/guests", json={"world": other, "entry": "ragna"})
    assert added.status_code == 201
    assert added.json()["guest_links"] == [{"world": other, "entry": "ragna"}]
    assert logged_in.post(
        f"{base}/guests", json={"world": other, "entry": "ragna"}
    ).status_code == (409)

    # characters may be guests of the story
    patched = logged_in.patch(base, json={"controlled_characters": ["kael", "ragna"]})
    assert patched.status_code == 200, patched.text
    assert logged_in.patch(base, json={"controlled_characters": ["niemand"]}).status_code == 422

    fact = {"entry": "ragna", "fact": "Ragna ist hier verletzt"}
    assert logged_in.post(f"{base}/facts", json=fact).status_code == 201
    assert logged_in.post(f"{base}/facts", json={"entry": "x", "fact": "y"}).status_code == 422
    assert logged_in.get(base).json()["facts"] == [fact]
    assert logged_in.request("DELETE", f"{base}/facts", json=fact).json()["facts"] == []
    assert logged_in.request("DELETE", f"{base}/facts", json=fact).status_code == 404

    removed = logged_in.delete(f"{base}/guests/{other}/ragna")
    assert removed.status_code == 200
    assert removed.json()["guest_links"] == []


def test_storage_error_is_reported_without_details(logged_in: TestClient) -> None:
    world = _world(logged_in)
    services = services_of(logged_in)
    original = services.canon.update_world

    def failing(*args: object, **kwargs: object) -> None:
        from skriptorium.storage import StorageError

        raise StorageError("worlds/die-salzmark/world.md: Datenträger voll")

    object.__setattr__(services.canon, "update_world", failing)
    try:
        response = logged_in.patch(f"/api/worlds/{world}", json={"name": "Neu"})
    finally:
        object.__setattr__(services.canon, "update_world", original)
    assert response.status_code == 500
    assert response.json() == {"detail": "Speichern fehlgeschlagen"}

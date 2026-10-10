"""Worlds and texts are readable files without the Skriptorium (step 5.3, FR-020, ADR-003)."""

from pathlib import Path

from fastapi.testclient import TestClient

STYLE = {"tone": ["düster"], "tempo": "atemlos", "free": "Kurze Absätze."}


def _fill(client: TestClient) -> str:
    """One world with canon, a guest from a second world, a story and a chapter."""
    world = client.post("/api/worlds", json={"name": "Die Salzmark", "description": "Salz"})
    other = client.post("/api/worlds", json={"name": "Nordland", "description": "Eis"})
    world_id: str = world.json()["id"]
    other_id: str = other.json()["id"]
    kael = client.post(
        f"/api/worlds/{world_id}/entries",
        json={
            "category": "figur",
            "name": "Kael",
            "aliases": ["der Fährmann"],
            "body": "Fährt über den **Salzsee**.",
        },
    )
    assert kael.status_code == 201, kael.text
    ragna = client.post(
        f"/api/worlds/{other_id}/entries", json={"category": "figur", "name": "Ragna"}
    )
    assert ragna.status_code == 201, ragna.text
    story = client.post(
        f"/api/worlds/{world_id}/stories",
        json={"title": "Die Überfahrt", "form": "roman", "controlled_characters": ["kael"]},
    )
    base = f"/api/worlds/{world_id}/stories/{story.json()['id']}"
    assert client.post(f"{base}/guests", json={"world": other_id, "entry": "ragna"}).is_success
    assert client.post(f"{base}/facts", json={"entry": "ragna", "fact": "Ragna hinkt"}).is_success
    patched = client.patch(base, json={"genres": ["Thriller"], "writing_style": STYLE})
    assert patched.status_code == 200, patched.text
    assert client.put(f"{base}/summary", json={"summary": "Bisher: Aufbruch"}).is_success
    chapter = client.put(
        f"{base}/chapters/1", json={"title": "Aufbruch", "text": "Es war kalt.\n\nKael stieß ab."}
    )
    assert chapter.status_code == 200, chapter.text
    assert client.put(
        f"{base}/chapters/1/summary", json={"summary": "Kael bricht auf", "status": "geprüft"}
    ).is_success
    return world_id


def test_everything_of_a_world_is_plain_markdown(logged_in: TestClient, data_dir: Path) -> None:
    world = _fill(logged_in)
    files = sorted(p for p in (data_dir / "worlds" / world).rglob("*") if p.is_file())
    assert files, "no files written"
    assert {p.suffix for p in files} == {".md"}
    text = "\n".join(p.read_text(encoding="utf-8") for p in files)
    for expected in [
        "Die Salzmark",
        "Kael",
        "der Fährmann",
        "Fährt über den **Salzsee**.",
        "Die Überfahrt",
        "Thriller",
        "düster",
        "Kurze Absätze.",
        "Ragna hinkt",
        "Bisher: Aufbruch",
        "Es war kalt.\n\nKael stieß ab.",
        "Kael bricht auf",
    ]:
        assert expected in text, expected
    for file in files:
        assert file.read_text(encoding="utf-8").startswith("---\n"), file


def test_the_search_index_is_only_derived(logged_in: TestClient, data_dir: Path) -> None:
    world = _fill(logged_in)
    index = data_dir / "index.sqlite"
    assert index.is_file()
    names = {
        p.relative_to(data_dir).parts[0] for p in data_dir.iterdir() if p.name != "index.sqlite"
    }
    assert "worlds" in names
    assert not list((data_dir / "worlds").rglob("*.sqlite"))
    assert logged_in.get(f"/api/worlds/{world}/entries/kael").json()["name"] == "Kael"

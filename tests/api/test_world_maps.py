"""HTTP tests for the maps of a world (step 7.10, ADR-073)."""

import base64

from fastapi.testclient import TestClient

from tests.image_samples import jpeg, png

WORLD = "/api/worlds/die-salzmark"


def _encoded(data: bytes) -> str:
    return base64.b64encode(data).decode()


def test_add_show_rename_and_remove_a_map(logged_in: TestClient) -> None:
    logged_in.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    added = logged_in.post(f"{WORLD}/maps", json={"name": "Seekarte", "content": _encoded(jpeg())})
    assert added.status_code == 201, added.text
    (entry,) = added.json()["maps"]
    assert entry["name"] == "Seekarte"
    shown = logged_in.get(f"{WORLD}/maps/{entry['file']}")
    assert shown.content == jpeg()
    assert shown.headers["content-type"] == "image/jpeg"
    assert shown.headers["cache-control"] == "no-store"
    renamed = logged_in.patch(f"{WORLD}/maps/{entry['file']}", json={"name": "Die Salzmark"})
    assert renamed.json()["maps"][0]["name"] == "Die Salzmark"
    assert logged_in.get(WORLD).json()["maps"] == renamed.json()["maps"]
    removed = logged_in.delete(f"{WORLD}/maps/{entry['file']}")
    assert removed.json()["maps"] == []
    assert logged_in.get(f"{WORLD}/maps/{entry['file']}").status_code == 404


def test_refuses_other_files_and_oversized_bodies(logged_in: TestClient) -> None:
    logged_in.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    svg = _encoded(b"<svg><script>GEHEIM</script></svg>")
    refused = logged_in.post(f"{WORLD}/maps", json={"name": "Karte", "content": svg})
    assert refused.status_code == 422
    assert "GEHEIM" not in refused.text
    too_long = logged_in.post(f"{WORLD}/maps", json={"name": "Karte", "content": "A" * 17_000_000})
    assert too_long.status_code == 422
    assert "AAAA" not in too_long.text
    nameless = logged_in.post(f"{WORLD}/maps", json={"name": " ", "content": _encoded(png())})
    assert nameless.status_code == 422
    assert logged_in.get(WORLD).json()["maps"] == []


def test_maps_need_a_session(logged_in: TestClient) -> None:
    logged_in.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    added = logged_in.post(f"{WORLD}/maps", json={"name": "Karte", "content": _encoded(png())})
    file = added.json()["maps"][0]["file"]
    logged_in.cookies.clear()
    assert logged_in.get(f"{WORLD}/maps/{file}").status_code == 401


def test_set_and_clear_markers_of_a_map(logged_in: TestClient) -> None:
    logged_in.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    logged_in.post(f"{WORLD}/entries", json={"category": "ort", "name": "Karst"})
    added = logged_in.post(f"{WORLD}/maps", json={"name": "Festland", "content": _encoded(png())})
    file = added.json()["maps"][0]["file"]
    assert added.json()["maps"][0]["markers"] == []
    marked = logged_in.put(
        f"{WORLD}/maps/{file}/markers", json={"markers": [{"entry": "karst", "x": 0.2, "y": 0.4}]}
    )
    assert marked.status_code == 200, marked.text
    assert marked.json()["maps"][0]["markers"] == [{"entry": "karst", "x": 0.2, "y": 0.4}]
    assert logged_in.get(WORLD).json()["maps"] == marked.json()["maps"]
    cleared = logged_in.put(f"{WORLD}/maps/{file}/markers", json={"markers": []})
    assert cleared.json()["maps"][0]["markers"] == []


def test_refuses_markers_off_the_map_or_for_unknown_entries(logged_in: TestClient) -> None:
    logged_in.post("/api/worlds", json={"name": "Die Salzmark", "description": ""})
    added = logged_in.post(f"{WORLD}/maps", json={"name": "Festland", "content": _encoded(png())})
    file = added.json()["maps"][0]["file"]
    for marker in (
        {"entry": "karst", "x": 0.5, "y": 0.5},
        {"entry": "karst", "x": 1.5, "y": 0.5},
        {"entry": "karst", "x": "NaN", "y": 0.5},
    ):
        refused = logged_in.put(f"{WORLD}/maps/{file}/markers", json={"markers": [marker]})
        assert refused.status_code == 422, marker
    too_many = [{"entry": "karst", "x": 0.5, "y": 0.5}] * 201
    refused = logged_in.put(f"{WORLD}/maps/{file}/markers", json={"markers": too_many})
    assert refused.status_code == 422
    unknown_map = logged_in.put(
        f"{WORLD}/maps/karte-0a1b2c3d4e5f.png/markers", json={"markers": []}
    )
    assert unknown_map.status_code == 404
    logged_in.cookies.clear()
    assert logged_in.put(f"{WORLD}/maps/{file}/markers", json={"markers": []}).status_code == 401

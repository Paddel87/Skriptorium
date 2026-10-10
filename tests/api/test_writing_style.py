"""HTTP tests of the atmospheric writing style (step 5.6, ADR-053): purely additive fields."""

from fastapi.testclient import TestClient

STYLE: dict[str, object] = {
    "tone": ["düster", "kalt"],
    "atmosphere": ["angespannt"],
    "style": ["knapp"],
    "tempo": "atemlos",
    "explicitness": "angedeutet",
    "free": "Kurze Absätze.",
}
EMPTY: dict[str, object] = {
    "tone": [],
    "atmosphere": [],
    "style": [],
    "tempo": None,
    "explicitness": None,
    "free": "",
}


def _story(client: TestClient) -> str:
    world = client.post("/api/worlds", json={"name": "Salzmark", "description": "Salz"})
    assert world.status_code == 201, world.text
    response = client.post("/api/worlds/salzmark/stories", json={"title": "Nacht", "form": "roman"})
    assert response.status_code == 201, response.text
    return "/api/worlds/salzmark/stories/nacht"


def test_story_and_chapter_deliver_empty_fields_by_default(logged_in: TestClient) -> None:
    base = _story(logged_in)
    story = logged_in.get(base).json()
    assert story["genres"] == []
    assert story["writing_style"] == EMPTY
    logged_in.put(f"{base}/chapters/1", json={"title": "Eins"})
    assert logged_in.get(f"{base}/chapters/1").json()["writing_style"] is None


def test_existing_clients_keep_working(logged_in: TestClient) -> None:
    base = _story(logged_in)
    logged_in.patch(base, json={"genres": ["Krimi"], "writing_style": STYLE})
    changed = logged_in.patch(base, json={"perspective": "ich"})
    assert changed.status_code == 200, changed.text
    assert changed.json()["genres"] == ["Krimi"]
    assert changed.json()["writing_style"] == STYLE


def test_story_genres_and_default_style_are_set_and_emptied(logged_in: TestClient) -> None:
    base = _story(logged_in)
    set_ = logged_in.patch(base, json={"genres": ["Thriller", "Horror"], "writing_style": STYLE})
    assert set_.status_code == 200, set_.text
    assert set_.json()["genres"] == ["Thriller", "Horror"]
    assert set_.json()["writing_style"] == STYLE
    assert logged_in.get(base).json()["writing_style"] == STYLE
    partial = logged_in.patch(base, json={"writing_style": {"tempo": "langsam"}})
    assert partial.json()["writing_style"] == {**EMPTY, "tempo": "langsam"}
    emptied = logged_in.patch(base, json={"genres": None, "writing_style": None})
    assert emptied.json()["genres"] == []
    assert emptied.json()["writing_style"] == EMPTY


def test_new_chapter_takes_the_default_and_can_be_reset(logged_in: TestClient) -> None:
    base = _story(logged_in)
    logged_in.patch(base, json={"writing_style": STYLE})
    created = logged_in.put(f"{base}/chapters/1", json={"title": "Eins"})
    assert created.json()["writing_style"] == STYLE
    own = {**EMPTY, "tone": ["zärtlich"]}
    changed = logged_in.put(f"{base}/chapters/1", json={"writing_style": own})
    assert changed.json()["writing_style"] == own
    kept = logged_in.put(f"{base}/chapters/1", json={"text": "Neu"})
    assert kept.json()["writing_style"] == own
    reset = logged_in.put(f"{base}/chapters/1", json={"writing_style": None})
    assert reset.status_code == 200, reset.text
    assert reset.json()["writing_style"] is None
    assert logged_in.get(f"{base}/chapters").json()[0]["writing_style"] is None


def test_values_outside_the_lists_are_refused(logged_in: TestClient) -> None:
    base = _story(logged_in)
    logged_in.put(f"{base}/chapters/1", json={"title": "Eins"})
    for bad in (
        {"tone": ["fröhlich"]},
        {"atmosphere": ["hell"]},
        {"style": ["lang"]},
        {"tempo": "rasend"},
        {"explicitness": "roh"},
        {"free": "x" * 1001},
    ):
        assert logged_in.patch(base, json={"writing_style": bad}).status_code == 422
        assert logged_in.put(f"{base}/chapters/1", json={"writing_style": bad}).status_code == 422
    assert logged_in.patch(base, json={"genres": ["Western"]}).status_code == 422
    assert logged_in.patch(base, json={"writing_style": {"tone": "düster"}}).status_code == 422
    assert logged_in.get(base).json()["writing_style"] == EMPTY

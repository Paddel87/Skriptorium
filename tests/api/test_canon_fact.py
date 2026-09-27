"""Fakt aus dem Text in den Kanon (roadmap step 3.8, FR-015, FR-024).

The interface stores a marked passage through existing endpoints: as a supplement of a canon
entry (``PATCH …/entries/{id}``, for a guest in its home world) or as a fact of one story
(``POST …/facts``). These tests show that both targets reach the AI context as chosen.
"""

import pytest
from fastapi.testclient import TestClient

from tests.api.conftest import FakeProvider
from tests.api.test_writing import WRITE, _guest, _world

FACT = "Der Nebelkönig lacht nie."
OTHER_WRITE = "/api/worlds/die-salzmark/stories/anderswo/chapters/1/write"
HOME_WRITE = "/api/worlds/nebelreich/stories/heimat/chapters/1/write"


def _story(client: TestClient, world: str, title: str) -> None:
    created = client.post(
        f"/api/worlds/{world}/stories", json={"title": title, "form": "kurzgeschichte"}
    )
    assert created.status_code == 201, created.text


@pytest.fixture
def stories(logged_in: TestClient) -> TestClient:
    """ "Am Ufer" and "Anderswo" in Die Salzmark bind the Nebelkönig in; "Heimat" is his world's."""
    _world(logged_in)
    _guest(logged_in)
    _story(logged_in, "die-salzmark", "Anderswo")
    linked = logged_in.post(
        "/api/worlds/die-salzmark/stories/anderswo/guests",
        json={"world": "nebelreich", "entry": "nebelkoenig"},
    )
    assert linked.status_code == 201, linked.text
    _story(logged_in, "nebelreich", "Heimat")
    return logged_in


def _context(client: TestClient, provider: FakeProvider, path: str, entry: str) -> str:
    response = client.post(path, json={"references": [entry]})
    assert response.status_code == 200, response.text
    return provider.requests[-1].messages[0].content


def test_fact_of_a_guest_for_this_story_only(stories: TestClient, provider: FakeProvider) -> None:
    added = stories.post(
        "/api/worlds/die-salzmark/stories/am-ufer/facts",
        json={"entry": "nebelkoenig", "fact": FACT},
    )
    assert added.status_code == 201, added.text

    assert f"- Nebelkönig: {FACT}" in _context(stories, provider, WRITE, "nebelkoenig")
    assert FACT not in _context(stories, provider, OTHER_WRITE, "nebelkoenig")
    assert FACT not in _context(stories, provider, HOME_WRITE, "nebelkoenig")
    entry = stories.get("/api/worlds/nebelreich/entries/nebelkoenig").json()
    assert FACT not in entry["body"]


def test_supplement_in_the_canon_of_a_guest(stories: TestClient, provider: FakeProvider) -> None:
    entry = stories.get("/api/worlds/nebelreich/entries/nebelkoenig").json()
    changed = stories.patch(
        "/api/worlds/nebelreich/entries/nebelkoenig",
        json={"body": f"{entry['body']}\n\n{FACT}"},
    )
    assert changed.status_code == 200, changed.text

    for path in (WRITE, OTHER_WRITE, HOME_WRITE):
        assert FACT in _context(stories, provider, path, "nebelkoenig"), path
    story = stories.get("/api/worlds/die-salzmark/stories/am-ufer").json()
    assert story["facts"] == []


def test_fact_of_a_world_entry_for_this_story_only(
    stories: TestClient, provider: FakeProvider
) -> None:
    fact = "Kael kann nicht schwimmen."
    added = stories.post(
        "/api/worlds/die-salzmark/stories/am-ufer/facts", json={"entry": "kael", "fact": fact}
    )
    assert added.status_code == 201, added.text

    assert f"- Kael: {fact}" in _context(stories, provider, WRITE, "kael")
    assert fact not in _context(stories, provider, OTHER_WRITE, "kael")


def test_new_entry_from_a_passage_is_known_at_once(
    stories: TestClient, provider: FakeProvider
) -> None:
    created = stories.post(
        "/api/worlds/die-salzmark/entries",
        json={"category": "ort", "name": "Salzturm", "body": "Steht im Norden der Bucht."},
    )
    assert created.status_code == 201, created.text

    assert "Steht im Norden der Bucht." in _context(stories, provider, WRITE, "salzturm")


def test_removed_fact_leaves_the_context(stories: TestClient, provider: FakeProvider) -> None:
    facts = "/api/worlds/die-salzmark/stories/am-ufer/facts"
    stories.post(facts, json={"entry": "nebelkoenig", "fact": FACT})

    removed = stories.request("DELETE", facts, json={"entry": "nebelkoenig", "fact": FACT})

    assert removed.status_code == 200, removed.text
    assert FACT not in _context(stories, provider, WRITE, "nebelkoenig")

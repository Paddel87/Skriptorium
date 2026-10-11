"""Writing canon for SillyTavern and reading it back (step 6.9, ADR-066)."""

import json
from pathlib import Path

import pytest

from skriptorium.canon import CanonEntry, CanonService, InvalidInput, NotFound
from skriptorium.canon.importers import card_for, lorebook_for, parse_markdown
from skriptorium.storage import DocumentStore

FIGURE_BODY = (
    "Schmugglerin aus dem Hafenviertel.\n\n### Herkunft\nGeboren auf einem Kahn.\n\n"
    "### Wesen\nMisstrauisch.\n"
)


@pytest.fixture
def canon(tmp_path: Path) -> CanonService:
    service = CanonService(DocumentStore(tmp_path / "data"))
    service.create_world("Salzmark", "Welt-Grundregeln.")
    service.create_entry("salzmark", "figur", "Mira Ostwind", aliases=["Mira"], body=FIGURE_BODY)
    service.create_entry("salzmark", "ort", "Die Rote Laterne", aliases=["Laterne"], body="Kneipe.")
    # Items created in the page get the sections Zweck, Verwendung, Auswirkung (level 2).
    service.create_entry("salzmark", "gegenstand", "Pfannhaus-Glocke")
    service.create_entry("salzmark", "regel", "Salzrecht", body="Wer siedet, zahlt.\n")
    service.create_entry("salzmark", "kultur", "Siedertreue", body="```\n# kein Titel\n```\n")
    service.create_entry("salzmark", "zeitlinie", "Große Flut")
    return service


def _read_back(canon: CanonService, lorebook: dict[str, object]) -> list[tuple[object, ...]]:
    markdown = canon.translate_sillytavern("salzmark", json.dumps(lorebook).encode()).markdown
    # A closing line break is not part of the canon (entries are stored with or without one).
    return [
        (e.name, e.category, e.aliases, e.body.rstrip("\n"))
        for e in parse_markdown(markdown).entries
    ]


def test_a_world_comes_back_as_the_same_canon(canon: CanonService) -> None:
    entries = canon.list_entries("salzmark")
    back = _read_back(canon, canon.sillytavern_lorebook("salzmark"))
    expected = [(e.name, e.category, e.aliases, e.body.rstrip("\n")) for e in entries]
    item = next(e for e in entries if e.category == "gegenstand")
    # Level-2 sections cannot stand inside an entry of the import; they come back on level 3.
    normalized = item.body.replace("## ", "### ").rstrip("\n")
    expected = [(n, c, a, normalized if c == "gegenstand" else b) for n, c, a, b in expected]
    assert back == expected


def test_the_lorebook_is_written_like_sillytavern_does(canon: CanonService) -> None:
    book = canon.sillytavern_lorebook("salzmark")
    entries = book["entries"]
    assert isinstance(entries, dict)
    # Entries come sorted by name: Die Rote Laterne, Große Flut, Mira Ostwind, …
    first = entries["2"]
    assert first["key"] == ["Mira Ostwind", "Mira"]
    assert first["comment"] == "Mira Ostwind"
    assert first["content"] == FIGURE_BODY.strip("\n")
    assert first["disable"] is False
    assert first["extensions"] == {"skriptorium": {"kategorie": "figur"}}
    assert first["uid"] == 2 and first["displayIndex"] == 2
    assert list(entries) == [str(n) for n in range(6)]


def test_a_figure_card_and_reading_it_back(canon: CanonService) -> None:
    card = canon.sillytavern_card("salzmark", "mira-ostwind")
    assert card["spec"] == "chara_card_v2"
    data = card["data"]
    assert isinstance(data, dict)
    assert data["name"] == card["name"] == "Mira Ostwind"
    assert (
        data["description"]
        == "Schmugglerin aus dem Hafenviertel.\n\n### Herkunft\nGeboren auf einem Kahn."
    )
    assert data["personality"] == "Misstrauisch."
    assert data["alternate_greetings"] == [] and "character_book" not in data
    result = canon.translate_sillytavern("salzmark", json.dumps(card).encode())
    assert result.not_taken_over == ()
    (figure,) = parse_markdown(result.markdown).entries
    assert (figure.name, figure.category, figure.body) == ("Mira Ostwind", "figur", FIGURE_BODY)


def test_card_without_or_only_with_wesen() -> None:
    def figure(body: str) -> CanonEntry:
        return CanonEntry("w", "kael", "figur", "Kael", (), None, body)

    only_wesen = card_for(figure("### Wesen\nRuhig.\n"))
    assert (only_wesen["description"], only_wesen["personality"]) == ("", "Ruhig.")
    no_wesen = card_for(figure("Nur Text.\n"))
    assert (no_wesen["description"], no_wesen["personality"]) == ("Nur Text.", "")
    assert lorebook_for([]) == {"entries": {}}


def test_only_figures_become_cards(canon: CanonService) -> None:
    with pytest.raises(InvalidInput, match="Nur Figuren"):
        canon.sillytavern_card("salzmark", "die-rote-laterne")
    with pytest.raises(NotFound):
        canon.sillytavern_card("salzmark", "niemand")
    with pytest.raises(NotFound):
        canon.sillytavern_lorebook("nirgendwo")


def test_an_unknown_own_category_is_ignored(canon: CanonService) -> None:
    book = {
        "entries": {
            "0": {
                "key": ["X"],
                "content": "",
                "extensions": {"skriptorium": {"kategorie": "drache"}},
            }
        }
    }
    with pytest.raises(InvalidInput, match="keine übernehmbaren"):
        canon.translate_sillytavern("salzmark", json.dumps(book).encode())

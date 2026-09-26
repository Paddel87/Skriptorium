"""Tests for CanonService (roadmap step 2.3, FR-002, FR-016)."""

from pathlib import Path

import pytest

from skriptorium.canon import (
    CATEGORIES,
    AlreadyExists,
    CanonService,
    Category,
    InvalidInput,
    NotFound,
)
from skriptorium.storage import DocumentStore, slugify


@pytest.fixture
def root(tmp_path: Path) -> Path:
    return tmp_path / "data"


@pytest.fixture
def canon(root: Path) -> CanonService:
    service = CanonService(DocumentStore(root))
    service.create_world("Die Salzmark", "Sieben Inseln nach der Flut.")
    service.create_world("Nebelreich")
    return service


# --- worlds -------------------------------------------------------------------------------


def test_create_and_list_worlds(canon: CanonService) -> None:
    worlds = canon.list_worlds()
    assert [(w.id, w.name) for w in worlds] == [
        ("die-salzmark", "Die Salzmark"),
        ("nebelreich", "Nebelreich"),
    ]
    assert canon.get_world("die-salzmark").description == "Sieben Inseln nach der Flut."


def test_world_names_must_be_unique_and_not_empty(canon: CanonService) -> None:
    with pytest.raises(AlreadyExists):
        canon.create_world("die salzmark")
    with pytest.raises(InvalidInput):
        canon.create_world("   ")
    with pytest.raises(InvalidInput):
        canon.create_world("!!!")


def test_update_world_keeps_identifier(canon: CanonService) -> None:
    changed = canon.update_world("die-salzmark", name="Salzmark", description="Neu.")
    assert (changed.id, changed.name, changed.description) == ("die-salzmark", "Salzmark", "Neu.")
    assert canon.update_world("die-salzmark").name == "Salzmark"
    with pytest.raises(InvalidInput):
        canon.update_world("die-salzmark", name="")


def test_missing_world(canon: CanonService) -> None:
    with pytest.raises(NotFound):
        canon.get_world("atlantis")
    with pytest.raises(NotFound):
        canon.create_entry("atlantis", "figur", "Kael")
    with pytest.raises(NotFound):
        canon.list_entries("atlantis")


@pytest.mark.parametrize("world_id", ["../aussen", "Die Salzmark", ""])
def test_bad_world_identifiers(canon: CanonService, world_id: str) -> None:
    with pytest.raises(InvalidInput):
        canon.get_world(world_id)


# --- FR-002: every category can be created, changed and deleted ---------------------------


@pytest.mark.parametrize("category", CATEGORIES)
def test_each_category_can_be_created_changed_and_deleted(
    canon: CanonService, category: Category
) -> None:
    created = canon.create_entry(
        "die-salzmark", category, f"Eintrag {category}", aliases=["Kurz"], body="Erster Stand."
    )
    assert canon.get_entry("die-salzmark", created.id) == created
    assert created.category == category

    changed = canon.update_entry("die-salzmark", created.id, body="Zweiter Stand.")
    assert canon.get_entry("die-salzmark", created.id).body == "Zweiter Stand."
    assert changed.name == created.name

    canon.delete_entry("die-salzmark", created.id)
    with pytest.raises(NotFound):
        canon.get_entry("die-salzmark", created.id)
    assert canon.find_entries("die-salzmark", "Eintrag") == []


def test_entry_file_layout_follows_data_model(canon: CanonService, root: Path) -> None:
    canon.create_entry("die-salzmark", "figur", "Tomas Rehl", aliases=["der Zöllner"])
    text = (root / "worlds/die-salzmark/canon/figur/tomas-rehl.md").read_text(encoding="utf-8")
    assert text.startswith(
        "---\nname: Tomas Rehl\naliasse:\n- der Zöllner\nkategorie: figur\n---\n"
    )


def test_item_gets_purpose_usage_and_effect_sections(canon: CanonService) -> None:
    item = canon.create_entry("die-salzmark", "gegenstand", "Runenklinge")
    assert item.body == "## Zweck\n\n## Verwendung\n\n## Auswirkung\n"
    own = canon.create_entry("die-salzmark", "gegenstand", "Siegelring", body="Schwarzes Eisen.")
    assert own.body == "Schwarzes Eisen."


def test_timeline_keeps_events_in_written_order(canon: CanonService) -> None:
    events = "- **0:** Die Große Flut.\n- **12:** Gründung des Aschturms.\n- **88:** Salzrat.\n"
    canon.create_entry("die-salzmark", "zeitlinie", "Zeitlinie der Salzmark", body=events)
    [timeline] = canon.list_entries("die-salzmark", "zeitlinie")
    assert timeline.body == events


def test_entry_identifiers_are_unique_within_a_world(canon: CanonService) -> None:
    canon.create_entry("die-salzmark", "figur", "Kerrow")
    with pytest.raises(AlreadyExists):
        canon.create_entry("die-salzmark", "ort", "Kerrow")
    assert canon.create_entry("nebelreich", "ort", "Kerrow").world == "nebelreich"


def test_update_fields_status_and_aliases(canon: CanonService) -> None:
    entry = canon.create_entry("die-salzmark", "figur", "Hedda Varn", aliases=["Hedda"])
    dead = canon.update_entry(
        "die-salzmark", entry.id, name="Hedda Varn die Ältere", aliases=[], status=" tot "
    )
    assert (dead.id, dead.name, dead.aliases, dead.status) == (
        "hedda-varn",
        "Hedda Varn die Ältere",
        (),
        "tot",
    )
    assert canon.update_entry("die-salzmark", entry.id, status=None).status is None


def test_changing_category_moves_the_file(canon: CanonService, root: Path) -> None:
    entry = canon.create_entry("die-salzmark", "ort", "Salzeid", body="Schwur.")
    moved = canon.update_entry("die-salzmark", entry.id, category="kultur")
    assert moved.category == "kultur"
    assert not (root / "worlds/die-salzmark/canon/ort/salzeid.md").exists()
    assert canon.get_entry("die-salzmark", "salzeid").body == "Schwur."


def test_update_keeps_unknown_header_fields(canon: CanonService, root: Path) -> None:
    canon.create_entry("die-salzmark", "figur", "Fenn Asch")
    path = root / "worlds/die-salzmark/canon/figur/fenn-asch.md"
    path.write_text(
        "---\nname: Fenn Asch\nkategorie: figur\nquelle: Import\n---\nText", encoding="utf-8"
    )
    canon.update_entry("die-salzmark", "fenn-asch", body="Neu")
    assert "quelle: Import" in path.read_text(encoding="utf-8")


@pytest.mark.parametrize(
    ("category", "name", "aliases"),
    [("drache", "Kael", []), ("figur", "  ", []), ("figur", "Kael", ["  "])],
)
def test_invalid_entry_input(
    canon: CanonService, category: str, name: str, aliases: list[str]
) -> None:
    with pytest.raises(InvalidInput):
        canon.create_entry("die-salzmark", category, name, aliases=aliases)  # type: ignore[arg-type]  # unknown category on purpose


def test_aliases_must_be_a_list(canon: CanonService) -> None:
    with pytest.raises(InvalidInput):
        canon.create_entry("die-salzmark", "figur", "Kael", aliases="Kae")


def test_missing_entry(canon: CanonService) -> None:
    with pytest.raises(NotFound):
        canon.get_entry("die-salzmark", "niemand")
    with pytest.raises(NotFound):
        canon.update_entry("die-salzmark", "niemand", body="")
    with pytest.raises(InvalidInput):
        canon.get_entry("die-salzmark", "../world")


def test_list_entries_by_category_sorted_by_name(canon: CanonService) -> None:
    canon.create_entry("die-salzmark", "figur", "Tomas Rehl")
    canon.create_entry("die-salzmark", "figur", "Ilka Varn")
    canon.create_entry("die-salzmark", "ort", "Kerrow")
    assert [e.name for e in canon.list_entries("die-salzmark")] == [
        "Ilka Varn",
        "Kerrow",
        "Tomas Rehl",
    ]
    assert [e.name for e in canon.list_entries("die-salzmark", "figur")] == [
        "Ilka Varn",
        "Tomas Rehl",
    ]
    with pytest.raises(InvalidInput):
        canon.list_entries("die-salzmark", "drache")  # type: ignore[arg-type]  # unknown on purpose


# --- finding and world separation ---------------------------------------------------------


def test_find_entries_by_name_or_alias_prefix(canon: CanonService) -> None:
    kael = canon.create_entry("die-salzmark", "figur", "Kael", aliases=["der Schmied"])
    canon.create_entry("nebelreich", "figur", "Kael")
    assert canon.find_entries("die-salzmark", "ka") == [kael]
    assert canon.find_entries("die-salzmark", "der sch") == [kael]
    assert canon.find_entries("die-salzmark", "die salz") == []  # the world itself is no entry


def test_worlds_are_separated(canon: CanonService) -> None:
    canon.create_entry("die-salzmark", "figur", "Ilka Varn")
    assert canon.list_entries("nebelreich") == []
    assert canon.find_entries("nebelreich", "ilka") == []


# --- FR-016: a character keeps all its facts for further stories --------------------------


def test_character_keeps_all_facts_for_a_second_story(root: Path) -> None:
    first_session = CanonService(DocumentStore(root))
    first_session.create_world("Die Salzmark")
    kael = first_session.create_entry("die-salzmark", "figur", "Kael", aliases=["Kae"])
    facts = "- Linkshänder\n- Narbe über dem rechten Auge\n- verlor 412 seinen Bruder\n"
    first_session.update_entry("die-salzmark", kael.id, body=facts, status="lebt")

    second_story = CanonService(DocumentStore(root))
    [found] = second_story.find_entries("die-salzmark", "Kae")
    assert (found.body, found.status, found.aliases) == (facts, "lebt", ("Kae",))


# --- files edited by hand -----------------------------------------------------------------


@pytest.mark.parametrize(
    "header",
    [
        "name: Kael\nkategorie: ort",
        "name: Kael\naliasse: Kae",
        "aliasse: [Kae]",
        "name: '  '",
        "name: Kael\nstatus: 3",
    ],
)
def test_inconsistent_hand_edited_entries_are_reported(
    canon: CanonService, root: Path, header: str
) -> None:
    folder = root / "worlds/die-salzmark/canon/figur"
    folder.mkdir(parents=True)
    (folder / "kael.md").write_text(f"---\n{header}\n---\n", encoding="utf-8")
    with pytest.raises(InvalidInput):
        canon.get_entry("die-salzmark", "kael")


def test_hand_written_entry_without_category_field(canon: CanonService, root: Path) -> None:
    folder = root / "worlds/die-salzmark/canon/regel"
    folder.mkdir(parents=True)
    (folder / "salzlicht.md").write_text("---\nname: Salzlicht\n---\nLeuchtet.", encoding="utf-8")
    assert canon.get_entry("die-salzmark", "salzlicht").category == "regel"


@pytest.mark.parametrize(
    ("name", "expected"),
    [("Kael der Ältere", "kael-der-aeltere"), ("  Große  Flut! ", "grosse-flut"), ("Öl", "oel")],
)
def test_slugify(name: str, expected: str) -> None:
    assert slugify(name) == expected

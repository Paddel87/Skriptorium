"""References between canon entries with ``@Name`` (step 8.11, ADR-088)."""

from pathlib import Path

import pytest

from skriptorium.canon import CanonEntry, CanonService
from skriptorium.context import MAX_BUDGET, BuiltContext, ContextBuilder
from skriptorium.context.writing import find_references, frame
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

WORLD = "die-salzmark"
STORY = "das-salz"

Services = tuple[CanonService, ManuscriptService]


def entry(entry_id: str, name: str, aliases: tuple[str, ...] = ()) -> CanonEntry:
    return CanonEntry(WORLD, entry_id, "figur", name, aliases, None, "")


ENTRIES = [
    entry("gunda", "Gunda"),
    entry("gunda-hollt", "Gunda Hollt", ("die Wirtin",)),
    entry("ilka", "Ilka Varn", ("Ilka",)),
]


def test_longest_name_wins_and_case_is_ignored() -> None:
    found = find_references("@gunda hollt kennt @Gunda.", ENTRIES)

    assert found == ["gunda-hollt", "gunda"]


def test_aliases_with_spaces_and_punctuation_after_the_name() -> None:
    found = find_references("Fragt @die Wirtin, dann (@Ilka)! Oder @Ilka Varn?", ENTRIES)

    assert found == ["gunda-hollt", "ilka"]


def test_name_must_end_at_a_word_boundary() -> None:
    assert find_references("@Gundaland", ENTRIES) == []
    assert find_references("@Ilkas Boot", ENTRIES) == ["ilka"]  # genitive, as in the interface
    assert find_references("@Gunda Hollter", ENTRIES) == ["gunda"]


def test_unknown_words_mail_addresses_and_self_references_are_ignored() -> None:
    text = "@Unbekannt, mail@Ilka.de, @Ilka, @Ilka Varn, @Gunda, @Gunda"

    assert find_references(text, ENTRIES, own="ilka") == ["gunda"]


def test_entries_without_names_give_nothing() -> None:
    assert find_references("@Ilka", []) == []
    assert find_references("@Ilka", [entry("leer", " ")]) == []


def test_references_come_in_order_of_appearance_without_duplicates() -> None:
    assert find_references("@Ilka, @Gunda, @Ilka", ENTRIES) == ["ilka", "gunda"]


@pytest.fixture
def services(tmp_path: Path) -> Services:
    store = DocumentStore(tmp_path / "data")
    canon = CanonService(store)
    manuscripts = ManuscriptService(store)
    canon.create_world("Die Salzmark", "Sieben Inseln nach der Flut.")
    canon.create_world("Nebelreich", "Eine Welt aus Nebel.")
    canon.create_entry(WORLD, "figur", "Anna", body="Sie liebt @Berg und @Zora. @Nebelkönig auch.")
    canon.create_entry(WORLD, "figur", "Bert", body="Wohnt in @Gipfel.")
    canon.create_entry(WORLD, "figur", "Aaa", body="Unverbunden.")
    canon.create_entry(WORLD, "figur", "Zora", body="Kennt @Yeti.")
    canon.create_entry(WORLD, "ort", "Berg", body="Hoch.")
    canon.create_entry(WORLD, "ort", "Gipfel", body="Höher.")
    canon.create_entry(WORLD, "ort", "Yeti", body="Ein Wesen.")
    canon.create_entry("nebelreich", "figur", "Nebelkönig", body="Nebel.")
    manuscripts.create_story(WORLD, "Das Salz", "roman", controlled_characters=("bert",))
    manuscripts.save_chapter(WORLD, STORY, 1, title="Eins", text="Erster Absatz.")
    return canon, manuscripts


def build(
    services: Services, *references: str, budget: int = MAX_BUDGET, story: str = STORY
) -> BuiltContext:
    return ContextBuilder(*services).build(WORLD, story, 1, "Weiter.", references, budget)


def filler(context: BuiltContext) -> list[str]:
    return [block.label for block in context.blocks if block.kind == "auffuellung"]


def test_references_of_a_named_entry_lead_the_filler_one_step_deep(services: Services) -> None:
    context = build(services, "anna")

    # Berg and Zora from Anna, the led Bert's Gipfel; Yeti (a reference of Zora) is not taken
    # along but stays in its place after the other places.
    assert filler(context) == ["Berg", "Zora", "Gipfel", "Aaa", "Yeti"]


def test_references_follow_the_order_of_the_named_entries(services: Services) -> None:
    context = build(services, "zora", "anna")

    assert filler(context)[:4] == ["Yeti", "Berg", "Gipfel", "Aaa"]


def test_included_entries_and_guests_are_not_taken_again(services: Services) -> None:
    _, manuscripts = services
    manuscripts.add_guest_link(WORLD, STORY, "nebelreich", "nebelkoenig")

    context = build(services, "anna", "berg")
    labels = [block.label for block in context.blocks]

    assert labels.count("Berg") == 1
    assert labels.count("Nebelkönig") == 1
    assert filler(context)[0] == "Zora"
    assert filler(context)[-1] == "Nebelkönig"


def test_references_that_do_not_fit_are_left_out_without_error(services: Services) -> None:
    canon, _ = services
    canon.update_entry(WORLD, "berg", body="Sehr hoch. " * 1500)

    context = build(services, "anna", budget=2500)

    assert "Berg" not in filler(context)
    assert "Zora" in filler(context)


def test_frame_tells_that_place_bound_rules_hold_only_there() -> None:
    assert "Eine Regel mit der Zeile „Gilt nur in: …“ gilt nur an diesem Ort." in frame("Welt")


def test_worldbuilder_frame_asks_for_references_and_place_bound_rules(
    services: Services,
) -> None:
    context = ContextBuilder(*services).build_worldbuilder(WORLD, [("user", "Hallo")])

    system = context.messages[0].content
    assert "verweise mit `@Name`" in system
    assert "`Gilt nur in: @Ort`" in system


def test_a_genitive_counts_as_in_the_interface() -> None:
    """``@Kaels Hammer`` names Kael, as the links in the interface do (step 8.11)."""
    kael = entry("kael", "Kael")
    assert find_references("@Kaels Hammer und @Kaelchen", [kael]) == ["kael"]

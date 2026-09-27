"""Guests from other worlds in the context (roadmap step 3.7, FR-017).

A guest enters precedence 2 when it is named with ``@`` or led by the author; otherwise it only
fills the budget after the world's own entries. It is marked with its home world, whose rules
never come along (owner, step 3.7).
"""

from pathlib import Path

import pytest

from skriptorium.canon import CanonService, NotFound
from skriptorium.context import MAX_BUDGET, BuiltContext, ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

WORLD = "die-salzmark"
HOME = "nebelreich"
STORY = "am-ufer"
OTHER_STORY = "ohne-gast"
GUEST_BODY = "Herrscher über den Nebel, trägt eine Krone aus Reif."

Services = tuple[CanonService, ManuscriptService]


@pytest.fixture
def services(tmp_path: Path) -> Services:
    store = DocumentStore(tmp_path / "data")
    canon = CanonService(store)
    manuscripts = ManuscriptService(store)
    canon.create_world("Die Salzmark", "Sieben Inseln nach der Flut.")
    canon.create_world("Nebelreich", "Eine Welt aus Nebel.")
    canon.create_entry(WORLD, "figur", "Ilka Varn", body="Fischerin, 19.")
    canon.create_entry(WORLD, "ort", "Aschturm", body="Ruine im Norden.")
    canon.create_entry(HOME, "figur", "Nebelkönig", aliases=("König",), body=GUEST_BODY)
    canon.create_entry(HOME, "regel", "Nebelgesetz", body="Nebel lügt nie.")
    canon.create_entry(HOME, "ort", "Reifpalast", body="Palast aus Eis.")
    for title, story in (("Am Ufer", STORY), ("Ohne Gast", OTHER_STORY)):
        manuscripts.create_story(WORLD, title, "kurzgeschichte")
        manuscripts.save_chapter(WORLD, story, 1, text="Nebel.")
    manuscripts.add_guest_link(WORLD, STORY, HOME, "nebelkoenig")
    return canon, manuscripts


def build(
    services: Services, *references: str, story: str = STORY, budget: int = MAX_BUDGET
) -> BuiltContext:
    return ContextBuilder(*services).build(WORLD, story, 1, "Weiter.", references, budget)


def blocks(context: BuiltContext, kind: str) -> list[str]:
    return [block.label for block in context.blocks if block.kind == kind]


def test_named_guest_enters_precedence_two_with_its_home_world(services: Services) -> None:
    context = build(services, "nebelkoenig")

    system = context.messages[0].content
    assert blocks(context, "gast") == ["Nebelkönig"]
    assert "## Nebelkönig (Figur, Gast aus der Welt „Nebelreich“)\nAuch: König" in system
    assert GUEST_BODY in system
    assert "Nebelkönig" not in blocks(context, "auffuellung")


def test_rules_and_other_entries_of_the_home_world_never_come_along(
    services: Services,
) -> None:
    for context in (build(services, "nebelkoenig"), build(services)):
        text = "\n".join(message.content for message in context.messages)
        assert "Nebelgesetz" not in text
        assert "Nebel lügt nie" not in text
        assert "Reifpalast" not in text
        assert "Eine Welt aus Nebel" not in text


def test_unnamed_guest_only_fills_after_the_own_entries(services: Services) -> None:
    context = build(services)

    assert blocks(context, "gast") == []
    assert blocks(context, "auffuellung") == ["Ilka Varn", "Aschturm", "Nebelkönig"]
    assert "Gast aus der Welt „Nebelreich“" in context.messages[0].content


def test_unnamed_guest_is_left_out_before_own_entries_when_the_budget_is_short(
    services: Services,
) -> None:
    full = build(services)
    guest = next(b for b in full.blocks if b.label == "Nebelkönig")
    budget = full.estimated_tokens - guest.tokens  # room for everything except the guest

    context = build(services, budget=budget)

    assert blocks(context, "auffuellung") == ["Ilka Varn", "Aschturm"]


def test_led_guest_is_included_and_not_missing(services: Services) -> None:
    _, manuscripts = services
    manuscripts.update_story(WORLD, STORY, controlled_characters=("nebelkoenig",))

    context = build(services)

    assert context.missing_characters == ()
    assert blocks(context, "gast") == ["Nebelkönig"]
    assert "Der Autor führt selbst: Nebelkönig." in context.messages[0].content
    assert (
        context.messages[1]
        .content.rstrip()
        .endswith("Ende, sobald die Figur handeln oder antworten müsste.")
    )


def test_story_fact_about_a_guest_names_it(services: Services) -> None:
    _, manuscripts = services
    manuscripts.add_fact(WORLD, STORY, "nebelkoenig", "Hat hier seine Krone verloren.")

    context = build(services)

    assert "- Nebelkönig: Hat hier seine Krone verloren." in context.messages[0].content


def test_other_stories_of_the_world_never_see_the_guest(services: Services) -> None:
    """Szenario 4 of the vision: the link holds only for its story (FR-017)."""
    context = build(services, story=OTHER_STORY)

    text = "\n".join(message.content for message in context.messages)
    assert "Nebelkönig" not in text
    assert GUEST_BODY not in text
    with pytest.raises(NotFound):
        build(services, "nebelkoenig", story=OTHER_STORY)


def test_story_of_the_home_world_gets_no_facts_of_the_linking_story(
    services: Services,
) -> None:
    canon, manuscripts = services
    manuscripts.add_fact(WORLD, STORY, "nebelkoenig", "Hat hier seine Krone verloren.")
    manuscripts.create_story(HOME, "Im Palast", "kurzgeschichte")

    context = ContextBuilder(canon, manuscripts).build(HOME, "im-palast", 1, "Weiter.")

    text = "\n".join(message.content for message in context.messages)
    assert "Krone verloren" not in text
    assert "Gast aus der Welt" not in text
    assert "Ilka Varn" not in text


def test_guest_wins_over_an_entry_of_the_world_with_the_same_identifier(
    services: Services,
) -> None:
    canon, _ = services
    canon.create_entry(WORLD, "figur", "Nebelkönig", body="Ein Salzmärker gleichen Namens.")

    context = build(services, "nebelkoenig")

    assert blocks(context, "gast") == ["Nebelkönig"]
    assert blocks(context, "verweis") == []
    # The world's own entry of that name still may fill the budget.
    assert "Ein Salzmärker gleichen Namens." in context.messages[0].content


def test_guest_whose_entry_is_gone_is_skipped_or_reported(services: Services) -> None:
    canon, manuscripts = services
    manuscripts.update_story(WORLD, STORY, controlled_characters=("nebelkoenig",))
    canon.delete_entry(HOME, "nebelkoenig")

    context = build(services)

    assert context.missing_characters == ("nebelkoenig",)
    assert GUEST_BODY not in context.messages[0].content
    assert blocks(context, "gast") == []
    with pytest.raises(NotFound):
        build(services, "nebelkoenig")

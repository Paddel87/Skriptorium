"""Requests of the world builder (roadmap step 6.7, ADR-064)."""

from pathlib import Path

import pytest

from skriptorium.canon import CanonService, InvalidInput, NotFound
from skriptorium.context import (
    PROPOSAL_FENCE,
    ContextBuilder,
    ContextTooLarge,
    Role,
    estimate_tokens,
)
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

WORLD = "die-salzmark"


@pytest.fixture
def builder(tmp_path: Path) -> ContextBuilder:
    store = DocumentStore(tmp_path / "data")
    canon = CanonService(store)
    canon.create_world("Die Salzmark", "Sieben Inseln nach der Flut.")
    canon.create_world("Nebelreich", "Eine Welt aus Nebel.")
    canon.create_entry(WORLD, "figur", "Gunda Hollt", aliases=("Gunda",), body="Wirtin am Kai.")
    canon.create_entry(WORLD, "ort", "Aschturm", body="Ruine im Norden, 312 Stufen.")
    canon.create_entry("nebelreich", "figur", "Nebelkönig", body="Herrscher im Nebel.")
    return ContextBuilder(canon, ManuscriptService(store))


def test_request_holds_frame_world_names_and_named_entries(builder: ContextBuilder) -> None:
    context = builder.build_worldbuilder(
        WORLD, [("user", "Ein Fährmann, der @Gunda kennt.")], references=["gunda-hollt"]
    )

    system, user = context.messages
    assert system.role == "system"
    assert "Weltenbauer für die fiktive Welt „Die Salzmark“" in system.content
    assert f"```{PROPOSAL_FENCE}" in system.content
    assert "Sieben Inseln nach der Flut." in system.content
    assert "- Gunda Hollt (Figur; auch: Gunda)" in system.content
    assert "- Aschturm (Ort)" in system.content
    # Named in full, the others by name only.
    assert "Wirtin am Kai." in system.content
    assert "312 Stufen" not in system.content
    assert "Nebelkönig" not in system.content
    assert (user.role, user.content) == ("user", "Ein Fährmann, der @Gunda kennt.")
    assert [block.kind for block in context.blocks] == [
        "rahmen",
        "welt",
        "eintraege",
        "verweis",
        "gespraech",
    ]


def test_conversation_keeps_order_and_roles(builder: ContextBuilder) -> None:
    context = builder.build_worldbuilder(
        WORLD,
        [("user", "Ein Fährmann."), ("assistant", "Kael Brann?"), ("user", "Gern, mehr.")],
        references=["gunda-hollt", "gunda-hollt"],
    )

    assert [(m.role, m.content) for m in context.messages[1:]] == [
        ("user", "Ein Fährmann."),
        ("assistant", "Kael Brann?"),
        ("user", "Gern, mehr."),
    ]
    assert [b.kind for b in context.blocks].count("verweis") == 1


def test_older_turns_drop_first_when_the_budget_is_short(builder: ContextBuilder) -> None:
    long = "Wort " * 2000
    conversation: list[tuple[Role, str]] = [
        ("user", "Erste " + long),
        ("assistant", "Antwort " + long),
        ("user", "Zweite " + long),
        ("assistant", "Kurz."),
        ("user", "Letzte Frage."),
    ]
    full = builder.build_worldbuilder(WORLD, conversation)
    tight = full.estimated_tokens - estimate_tokens("Erste " + long)

    context = builder.build_worldbuilder(WORLD, conversation, budget=tight)

    contents = [m.content for m in context.messages[1:]]
    assert contents[-1] == "Letzte Frage."
    assert not any(c.startswith("Erste") for c in contents)
    # The answer to a dropped question would open the conversation; it goes as well.
    assert context.messages[1].role == "user"
    assert context.estimated_tokens <= tight


def test_world_without_entries(builder: ContextBuilder) -> None:
    context = builder.build_worldbuilder("nebelreich", [("user", "Wer lebt hier?")])

    assert "Noch keine." not in context.messages[0].content
    empty = ContextBuilder(*_empty(builder)).build_worldbuilder("leer", [("user", "Neu.")])
    assert "Noch keine." in empty.messages[0].content


def _empty(builder: ContextBuilder) -> tuple[CanonService, ManuscriptService]:
    canon, manuscripts = builder._canon, builder._manuscripts  # builder internals: test setup
    canon.create_world("Leer", "Noch nichts.")
    return canon, manuscripts


@pytest.mark.parametrize(
    "conversation",
    [[], [("assistant", "Hallo")], [("user", "   ")], [("user", "a"), ("assistant", "b")]],
)
def test_last_turn_must_be_the_authors(
    builder: ContextBuilder, conversation: list[tuple[str, str]]
) -> None:
    with pytest.raises(InvalidInput, match="letzte Nachricht"):
        builder.build_worldbuilder(WORLD, conversation)  # type: ignore[arg-type]  # test data


def test_unknown_world_reference_or_budget(builder: ContextBuilder) -> None:
    with pytest.raises(NotFound):
        builder.build_worldbuilder("erfunden", [("user", "x")])
    with pytest.raises(NotFound):
        builder.build_worldbuilder(WORLD, [("user", "x")], references=["nebelkoenig"])
    with pytest.raises(InvalidInput):
        builder.build_worldbuilder(WORLD, [("user", "x")], budget=0)
    with pytest.raises(ContextTooLarge):
        builder.build_worldbuilder(WORLD, [("user", "Wort " * 5000)], budget=2000)


def test_figures_are_proposed_with_the_section_aussehen(builder: ContextBuilder) -> None:
    """Step 7.16 (ADR-078): the frame asks for `### Aussehen` with only the visible."""
    system = builder.build_worldbuilder(WORLD, [("user", "Eine Figur")]).messages[0].content
    assert "Figuren haben immer die Unterüberschrift `### Aussehen`" in system
    assert "nur das Äußere" in system

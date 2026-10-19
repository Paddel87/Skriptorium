"""Requests of the world builder (roadmap step 6.7, ADR-064)."""

from pathlib import Path

import pytest

from skriptorium.canon import (
    APPEARANCE,
    RELATIONS,
    SECTIONS,
    CanonService,
    InvalidInput,
    NotFound,
)
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


def test_rules_and_timeline_go_along_in_full(tmp_path: Path) -> None:
    """As when writing, the world builder knows the laws of the world (step 8.7, ADR-086)."""
    store = DocumentStore(tmp_path / "data")
    canon = CanonService(store)
    canon.create_world("Die Salzmark", "Sieben Inseln.")
    canon.create_world("Nebelreich", "Nebel.")
    canon.create_entry(WORLD, "regel", "Salzbindung", body="Salz bindet Tote.")
    canon.create_entry(WORLD, "zeitlinie", "Chronik", body="- 412: Gründung")
    canon.create_entry(WORLD, "ort", "Aschturm", body="312 Stufen.")
    canon.create_entry("nebelreich", "regel", "Nebelgesetz", body="Nebel lügt nie.")
    builder = ContextBuilder(canon, ManuscriptService(store))

    context = builder.build_worldbuilder(
        WORLD, [("user", "Was gilt für @Salzbindung?")], references=["salzbindung"]
    )

    system = context.messages[0].content
    assert system.count("Salz bindet Tote.") == 1
    assert "- 412: Gründung" in system
    assert "312 Stufen" not in system
    assert "Nebel lügt nie." not in system
    assert [block.kind for block in context.blocks] == [
        "rahmen",
        "welt",
        "eintraege",
        "regel",
        "zeitlinie",
        "gespraech",
    ]


def test_other_worlds_never_appear_in_the_request(builder: ContextBuilder) -> None:
    """D.18 (step 8.4): neither description, entries nor names of another world go along."""
    context = builder.build_worldbuilder(WORLD, [("user", "Wer herrscht hier?")])

    text = "\n".join(message.content for message in context.messages)
    for foreign in ("Nebelreich", "Nebelkönig", "Herrscher im Nebel", "Eine Welt aus Nebel"):
        assert foreign not in text
    with pytest.raises(NotFound):
        builder.build_worldbuilder(WORLD, [("user", "Wer?")], references=["nebelkoenig"])


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


def test_the_frame_asks_for_the_fixed_sections_of_the_canon(builder: ContextBuilder) -> None:
    """Step 9.1 (rule 003): the sections the world builder asks for are those of the one list."""
    system = builder.build_worldbuilder(WORLD, [("user", "x")]).messages[0].content
    for name in (APPEARANCE, *SECTIONS["gegenstand"]):
        assert f"`### {name}`" in system


def test_the_frame_names_the_sections_of_each_category_in_their_order(
    builder: ContextBuilder,
) -> None:
    """Step 9.3 (ADR-092, rule 003): one rule from ``SECTIONS``, not a list of its own."""
    system = builder.build_worldbuilder(WORLD, [("user", "Etwas Neues")]).messages[0].content
    groups = ("Figuren", "Orte", "Gegenstände", "Kultur")
    assert list(SECTIONS) == ["figur", "ort", "gegenstand", "kultur"]
    for group, names in zip(groups, SECTIONS.values(), strict=True):
        listed = ", ".join(f"`### {name}`" for name in names)
        assert f"  - {group}: {listed}\n" in system
    assert "eine Ebene tiefer als der Name" in system
    assert "Lass einen Abschnitt weg, wenn dazu nichts bekannt ist" in system
    assert "erfinde nichts, um ihn zu füllen" in system
    assert "Regeln und die Zeitlinie haben keine Abschnitte" in system
    # The two single rules of before are gone.
    assert "Gegenstände haben immer" not in system
    assert "Figuren haben immer" not in system


def test_the_example_of_the_frame_is_a_figure_with_its_sections(builder: ContextBuilder) -> None:
    system = builder.build_worldbuilder(WORLD, [("user", "Eine Figur")]).messages[0].content
    example = "".join(f"  ### {name}\n  …\n" for name in SECTIONS["figur"])
    assert f"  # Figuren\n  ## Name der Figur\n  Aliasse: Zweitname\n{example}\n" in system


def test_the_looks_are_only_the_outside(builder: ContextBuilder) -> None:
    """Step 7.16 (ADR-078): the frame asks for `### Aussehen` with only the visible."""
    system = builder.build_worldbuilder(WORLD, [("user", "Eine Figur")]).messages[0].content
    assert (
        f"Der Abschnitt `### {APPEARANCE}` enthält nur das Äußere (Gesicht, Haare, Statur, "
        "Kleidung, Haltung, sichtbare Merkmale)"
    ) in system


def test_relations_are_one_line_each_and_on_both_sides(builder: ContextBuilder) -> None:
    """Step 9.4 (ADR-093): one `@Name` per line under `### Beziehungen`, written on both sides."""
    system = builder.build_worldbuilder(WORLD, [("user", "Ein Paar")]).messages[0].content
    assert SECTIONS["figur"][-1] == RELATIONS
    assert (
        f"Im Abschnitt `### {RELATIONS}` steht je Beziehung eine Listenzeile mit genau einem "
        "`@Name` (Name oder Alias), die Art der Beziehung davor, z. B. `- verheiratet mit @Kael`."
    ) in system
    assert "Schreibe jede Beziehung auf beiden Seiten" in system
    # An existing figure is only revised when its full text is in the request.
    assert "überarbeite sie nur, wenn ihr vollständiger Text oben steht" in system

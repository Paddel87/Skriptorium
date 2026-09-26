"""ContextBuilder: precedence, budget, separation of worlds (roadmap step 3.2)."""

from pathlib import Path

import pytest

from skriptorium.canon import CanonService, InvalidInput, NotFound
from skriptorium.context import (
    MAX_BUDGET,
    SAFETY_MARGIN,
    BuiltContext,
    ContextBuilder,
    ContextTooLarge,
    estimate_tokens,
)
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

WORLD = "die-salzmark"
OTHER = "nebelreich"
STORY = "das-salz-der-toten"
BLADE_BODY = (
    "## Zweck\n\nBindet Salzgeister.\n\n## Verwendung\n\nNur bei Neumond ziehen.\n\n"
    "## Auswirkung\n\nDer Träger verliert jedes Mal eine Erinnerung."
)
TIMELINE_BODY = "1. Die Flut.\n2. Der Salzeid.\n3. Der Fall des Aschturms."


@pytest.fixture
def services(tmp_path: Path) -> tuple[CanonService, ManuscriptService]:
    store = DocumentStore(tmp_path / "data")
    canon = CanonService(store)
    manuscripts = ManuscriptService(store)
    canon.create_world("Die Salzmark", "Sieben Inseln nach der Flut.")
    canon.create_world("Nebelreich", "Eine Welt aus Nebel.")
    canon.create_entry(WORLD, "figur", "Ilka Varn", aliases=("Ilka",), body="Fischerin, 19.")
    canon.create_entry(WORLD, "figur", "Tomas Rehl", body="Hafenmeister.")
    canon.create_entry(WORLD, "gegenstand", "Runenklinge", body=BLADE_BODY)
    canon.create_entry(WORLD, "zeitlinie", "Chronik der Salzmark", body=TIMELINE_BODY)
    canon.create_entry(WORLD, "regel", "Salzbindung", body="Salz bindet Tote.")
    canon.create_entry(WORLD, "ort", "Aschturm", body="Ruine im Norden.")
    canon.create_entry(WORLD, "kultur", "Totensitte", body="Tote werden gesalzen.")
    canon.create_entry(OTHER, "figur", "Nebelkönig", body="Herrscher über den Nebel.")
    canon.create_entry(OTHER, "regel", "Nebelgesetz", body="Nebel lügt nie.")
    manuscripts.create_story(
        WORLD,
        "Das Salz der Toten",
        "roman",
        perspective="Ich-Erzählerin",
        controlled_characters=("ilka-varn",),
    )
    manuscripts.save_chapter(WORLD, STORY, 1, title="Die Flut", text="Erster Absatz.\n\nZweiter.")
    manuscripts.save_chapter(WORLD, STORY, 2, title="Der Turm", text="Dritter.\n\nVierter Absatz.")
    manuscripts.set_chapter_summary(WORLD, STORY, 1, "Ilka findet die Klinge.", "geprüft")
    manuscripts.set_story_summary(WORLD, STORY, "Ilka sucht ihren Bruder.")
    manuscripts.add_fact(WORLD, STORY, "ilka-varn", "Hat eine Narbe an der Hand.")
    return canon, manuscripts


def build(
    services: tuple[CanonService, ManuscriptService], *references: str, budget: int = MAX_BUDGET
) -> BuiltContext:
    return ContextBuilder(*services).build(
        WORLD, STORY, 2, "Ilka zieht die Klinge.", references, budget
    )


def kinds(context: BuiltContext) -> list[str]:
    return [block.kind for block in context.blocks]


def labels(context: BuiltContext, kind: str) -> list[str]:
    return [block.label for block in context.blocks if block.kind == kind]


def test_messages_hold_fixed_parts_first_and_changing_parts_last(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    context = build(services, "runenklinge")

    system, user = context.messages
    assert (system.role, user.role) == ("system", "user")
    assert system.content.startswith("Du bist Co-Autor einer Geschichte in der Welt „Die Salzmark“")
    assert "Sieben Inseln nach der Flut." in system.content
    assert user.content.index("# Handlungsstand") < user.content.index("# Letzte Manuskript")
    assert user.content.endswith("# Anweisung\n\nIlka zieht die Klinge.")


def test_precedence_one_holds_world_mode_rules_and_timeline(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    context = build(services)

    assert kinds(context)[:3] == ["rahmen", "welt", "schreibweise"]
    assert labels(context, "regel") == ["Salzbindung"]
    assert labels(context, "zeitlinie") == ["Chronik der Salzmark"]
    system = context.messages[0].content
    assert TIMELINE_BODY in system
    assert "Erzählperspektive: Ich-Erzählerin" in system
    assert "Der Autor führt selbst: Ilka Varn." in system


def test_named_item_brings_purpose_use_and_effect(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    context = build(services, "runenklinge")

    assert labels(context, "verweis") == ["Runenklinge"]
    system = context.messages[0].content
    assert "## Runenklinge (Gegenstand)" in system
    assert BLADE_BODY in system


def test_led_characters_and_story_facts_are_included(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    context = build(services)

    assert labels(context, "gefuehrte-figur") == ["Ilka Varn"]
    assert "Auch: Ilka" in context.messages[0].content
    assert "- Ilka Varn: Hat eine Narbe an der Hand." in context.messages[0].content


def test_named_entry_already_in_precedence_one_is_not_repeated(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    context = build(services, "salzbindung", "ilka-varn")

    assert labels(context, "verweis") == ["Ilka Varn"]
    assert labels(context, "gefuehrte-figur") == []
    assert context.messages[0].content.count("## Salzbindung (Regel)") == 1


def test_story_state_and_last_pages(services: tuple[CanonService, ManuscriptService]) -> None:
    context = build(services)

    user = context.messages[1].content
    assert "Ilka sucht ihren Bruder." in user
    assert "## Kapitel 1: Die Flut\n\nIlka findet die Klinge." in user
    assert labels(context, "seiten") == ["Kapitel 1", "Kapitel 2"]
    assert "Erster Absatz.\n\nZweiter.\n\nDritter.\n\nVierter Absatz." in user


def test_remaining_budget_is_filled_with_further_canon(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    context = build(services)

    assert labels(context, "auffuellung") == ["Tomas Rehl", "Aschturm", "Runenklinge", "Totensitte"]


def test_other_worlds_never_appear(services: tuple[CanonService, ManuscriptService]) -> None:
    context = build(services, "runenklinge")

    text = "\n".join(message.content for message in context.messages)
    assert "Nebel" not in text
    with pytest.raises(NotFound):
        build(services, "nebelkoenig")


@pytest.mark.parametrize("budget", [500, 1500, 3000, MAX_BUDGET])
def test_budget_is_never_exceeded(
    services: tuple[CanonService, ManuscriptService], budget: int
) -> None:
    canon, manuscripts = services
    long_text = "\n\n".join(f"Absatz {n}: " + "Salz und Nebel. " * 40 for n in range(400))
    manuscripts.save_chapter(WORLD, STORY, 2, text=long_text)
    for n in range(60):
        canon.create_entry(WORLD, "ort", f"Insel {n}", body="Klippen und Möwen. " * 30)

    context = build(services, budget=budget)

    total = sum(estimate_tokens(message.content) for message in context.messages)
    assert total * SAFETY_MARGIN <= budget
    assert context.estimated_tokens <= budget
    if budget >= 1500:
        assert "Absatz 399" in context.messages[1].content


def test_pages_are_whole_paragraphs_from_the_end(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    _, manuscripts = services
    manuscripts.save_chapter(
        WORLD, STORY, 2, text="\n\n".join(f"Absatz {n} " + "x" * 300 for n in range(20))
    )

    context = build(services, budget=1500)

    user = context.messages[1].content
    assert "Absatz 19" in user
    assert "Absatz 0 " not in user
    assert "Erster Absatz." not in user
    assert labels(context, "seiten") == ["Kapitel 2"]


def test_no_room_for_pages_leaves_them_out(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    needed = build(services).blocks
    fixed = sum(b.tokens for b in needed if b.kind not in ("seiten", "auffuellung"))

    context = build(services, budget=int(fixed * SAFETY_MARGIN) + 2)

    assert labels(context, "seiten") == []
    assert "# Letzte Manuskript-Seiten" not in context.messages[1].content


def test_too_large_request_is_refused_with_the_largest_blocks(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    canon, _ = services
    canon.create_entry(WORLD, "gegenstand", "Schwarzes Buch", body="Seite. " * 3000)

    with pytest.raises(ContextTooLarge) as refused:
        build(services, "schwarzes-buch", budget=2000)

    assert refused.value.largest[0].label == "Schwarzes Buch"
    assert "Schwarzes Buch" in str(refused.value)
    assert refused.value.needed > refused.value.budget


def test_missing_led_character_is_reported(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    _, manuscripts = services
    manuscripts.update_story(WORLD, STORY, controlled_characters=("ilka-varn", "geist"))
    manuscripts.add_fact(WORLD, STORY, "geist", "Spukt im Turm.")

    context = build(services)

    assert context.missing_characters == ("geist",)
    assert "Der Autor führt selbst: Ilka Varn, geist." in context.messages[0].content
    assert "- geist: Spukt im Turm." in context.messages[0].content


def test_story_without_mode_or_state(services: tuple[CanonService, ManuscriptService]) -> None:
    canon, manuscripts = services
    manuscripts.create_story(WORLD, "Kurz", "kurzgeschichte")

    context = ContextBuilder(canon, manuscripts).build(WORLD, "kurz", 1, "Beginne.")

    assert "Erzählperspektive" not in context.messages[0].content
    assert labels(context, "handlungsstand") == []
    assert labels(context, "fakten") == []
    assert labels(context, "seiten") == []


def test_changed_entry_is_effective_in_the_next_request(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    canon, _ = services
    canon.update_entry(WORLD, "runenklinge", body="## Zweck\n\nSchneidet Nebel.")

    context = build(services, "runenklinge")

    assert "Schneidet Nebel." in context.messages[0].content
    assert "Bindet Salzgeister." not in context.messages[0].content


@pytest.mark.parametrize("budget", [0, -1, MAX_BUDGET + 1])
def test_budget_outside_limits_is_invalid(
    services: tuple[CanonService, ManuscriptService], budget: int
) -> None:
    with pytest.raises(InvalidInput):
        build(services, budget=budget)


def test_empty_instruction_is_invalid(services: tuple[CanonService, ManuscriptService]) -> None:
    with pytest.raises(InvalidInput):
        ContextBuilder(*services).build(WORLD, STORY, 2, "   ")


def test_unknown_chapter_is_not_found(services: tuple[CanonService, ManuscriptService]) -> None:
    with pytest.raises(NotFound):
        ContextBuilder(*services).build(WORLD, STORY, 9, "Weiter.")


def test_estimate_uses_three_point_three_characters_per_token() -> None:
    assert estimate_tokens("") == 0
    assert estimate_tokens("x" * 33) == 10
    assert estimate_tokens("x" * 34) == 11

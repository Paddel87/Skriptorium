"""ContextBuilder: precedence, budget, separation of worlds (roadmap step 3.2)."""

from pathlib import Path
from typing import Literal

import pytest

from skriptorium.canon import CanonService, InvalidInput, NotFound
from skriptorium.context import (
    LENGTHS,
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
    assert "# Anweisung\n\nIlka zieht die Klinge.\n\n# Vorgaben für deinen Text" in user.content
    assert user.content.index("# Vorgaben") < user.content.index("Erinnerung: Ilka Varn")
    assert user.content.endswith("Ende, sobald die Figur handeln oder antworten müsste.")


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


def test_named_entry_stays_when_further_canon_does_not_fit(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    needed = build(services, "aschturm").blocks
    fixed = sum(b.tokens for b in needed if b.kind not in ("seiten", "auffuellung"))

    context = build(services, "aschturm", budget=int(fixed * SAFETY_MARGIN) + 2)

    assert labels(context, "verweis") == ["Aschturm"]
    assert labels(context, "auffuellung") == []
    assert "Ruine im Norden." in context.messages[0].content
    assert "Hafenmeister." not in context.messages[0].content


def test_other_worlds_never_appear(services: tuple[CanonService, ManuscriptService]) -> None:
    context = build(services, "runenklinge")

    text = "\n".join(message.content for message in context.messages)
    assert "Nebel" not in text
    with pytest.raises(NotFound):
        build(services, "nebelkoenig")


@pytest.mark.parametrize("budget", [1300, 1500, 3000, MAX_BUDGET])
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


def test_last_paragraph_larger_than_the_budget_enters_with_its_end(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    """A long chapter with single line breaks only is one paragraph (step 4.1)."""
    _, manuscripts = services
    lines = "\n".join(f"Zeile {n}: " + "Salz und Nebel. " * 10 for n in range(3000))
    manuscripts.save_chapter(WORLD, STORY, 2, text=lines)

    context = build(services)

    pages = [block for block in context.blocks if block.kind == "seiten"]
    user = context.messages[1].content
    assert [block.label for block in pages] == ["Kapitel 2"]
    assert "Zeile 2999: " in user
    assert "Zeile 0: " not in user
    assert "Letzte Manuskript-Seiten (wörtlich)\n\n… " in user
    assert context.estimated_tokens <= MAX_BUDGET
    assert pages[0].tokens > 20_000


def test_last_paragraph_without_a_word_that_fits_leaves_the_pages_out(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    _, manuscripts = services
    manuscripts.save_chapter(WORLD, STORY, 2, text="x" * 200_000)

    context = build(services)

    assert labels(context, "seiten") == []


def test_end_of_a_paragraph_starts_at_a_word_and_keeps_line_breaks() -> None:
    from skriptorium.context.builder import _tail

    assert _tail("eins zwei drei vier", 2) == "… vier"
    assert _tail("eins zwei drei vier", 4) == "… drei vier"
    assert _tail("eins\nzwei drei\nvier", 4) == "… drei\nvier"
    assert _tail("kurz", 4) == "kurz"
    assert _tail("einwortohnepause", 2) == ""
    assert _tail("eins", 0) == ""


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


def test_writing_mode_forbids_action_speech_and_thought_of_led_characters(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    """FR-012 (step 3.4): the rule names what is forbidden and where to stop."""
    context = build(services)

    system, user = (message.content for message in context.messages)
    for rule in (
        "keine Handlung und keine Bewegung",
        "keine wörtliche oder indirekte Rede",
        "keine Gedanken, Erinnerungen, Gefühle oder Absichten",
        "was die Figur unmittelbar wahrnimmt",
        "beende deinen Text an genau dieser Stelle",
    ):
        assert rule in system
    assert labels(context, "schreibweise") == [
        "Figuren-Schreibweise",
        "Erinnerung Figuren-Schreibweise",
    ]
    assert user.index("# Anweisung") < user.index("Erinnerung: Ilka Varn")


def test_no_rule_and_no_reminder_without_led_characters(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    _, manuscripts = services
    manuscripts.update_story(WORLD, STORY, controlled_characters=())

    context = build(services)

    system, user = (message.content for message in context.messages)
    assert "Figuren-Schreibweise" not in system
    assert "Erinnerung" not in user
    assert labels(context, "schreibweise") == ["Figuren-Schreibweise"]


# --- seamless continuation (roadmap step 5.8) -------------------------------------------


def test_frame_asks_for_continuation_without_opening_or_closing(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    system = build(services).messages[0].content

    assert "Eine Fortsetzung schließt nahtlos an das Ende des Manuskripts an" in system
    assert "ohne Einleitung und ohne abschließenden Satz" in system


def test_seam_note_quotes_the_chapter_end_right_before_the_instruction(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    context = build(services)

    user = context.messages[1].content
    assert "# Anschluss\n\nDas Manuskript endet mit: „Vierter Absatz.“" in user
    assert "Führe Ort, Lage und Figuren nicht neu ein" in user
    pages, seam = user.index("# Letzte Manuskript"), user.index("# Anschluss")
    assert pages < seam < user.index("# Anweisung") < user.index("Erinnerung: Ilka Varn")
    assert labels(context, "anweisung") == ["Anschluss", "Anweisung", "Vorgaben"]


def test_seam_note_quotes_only_the_last_words_of_a_long_paragraph(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    _, manuscripts = services
    words = " ".join(f"w{n}" for n in range(100))
    manuscripts.save_chapter(WORLD, STORY, 2, text=f"Anfang.\n\n{words}")

    user = build(services).messages[1].content

    quoted = " ".join(f"w{n}" for n in range(70, 100))
    assert f"Das Manuskript endet mit: „… {quoted}“" in user
    assert "w69 " not in user.split("# Anschluss")[1]


def test_seam_note_is_capped_for_a_paragraph_without_spaces(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    _, manuscripts = services
    manuscripts.save_chapter(WORLD, STORY, 2, text="x" * 5000)

    user = build(services).messages[1].content

    assert f"Das Manuskript endet mit: „… {'x' * 300}“" in user


@pytest.mark.parametrize("text", ["", "# Kapitel 3: Die Fähre"])
def test_no_seam_note_when_the_chapter_has_no_text_yet(
    services: tuple[CanonService, ManuscriptService], text: str
) -> None:
    _, manuscripts = services
    manuscripts.save_chapter(WORLD, STORY, 3, title="Die Fähre", text=text)

    context = ContextBuilder(*services).build(WORLD, STORY, 3, "Neue Szene am Kai.")

    assert "# Anschluss" not in context.messages[1].content
    assert labels(context, "anweisung") == ["Anweisung", "Vorgaben"]


# --- only what was asked for, not up to the known end (roadmap step 5.15) ----------------


def test_requirements_follow_the_instruction_in_every_request(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    """Steps 5.8 and 5.15: no running ahead, no future events, no repetition, no closing."""
    _, manuscripts = services
    manuscripts.update_story(WORLD, STORY, controlled_characters=())

    user = build(services).messages[1].content

    requirements = user.split("# Vorgaben für deinen Text\n\n")[1]
    assert user.index("# Anweisung") < user.index("# Vorgaben")
    for rule in (
        "Schreibe nur aus, was die Anweisung verlangt, und höre dann auf.",
        "Nimm nicht vorweg, was der Autor als Nächstes schreiben könnte.",
        f"Länge: {LENGTHS['mittel']}.",
        "liegt in der Zukunft: Erzähle es nicht und deute es nicht an.",
        "Wiederhole keine Sätze, Bilder, Gesten und Wendungen aus den letzten",
        "Kein abschließender, zusammenfassender oder ausblickender Satz",
    ):
        assert rule in requirements
    assert user.endswith("Dein Text hört mitten im Geschehen auf.")


@pytest.mark.parametrize("length", ["kurz", "mittel", "lang"])
def test_requirements_name_the_chosen_length(
    services: tuple[CanonService, ManuscriptService], length: Literal["kurz", "mittel", "lang"]
) -> None:
    context = ContextBuilder(*services).build(WORLD, STORY, 2, "Weiter.", length=length)

    user = context.messages[1].content
    assert f"- Länge: {LENGTHS[length]}." in user
    assert [text for name, text in LENGTHS.items() if name != length and text in user] == []


def test_lengths_grow_from_short_to_long() -> None:
    assert list(LENGTHS) == ["kurz", "mittel", "lang"]
    assert LENGTHS["kurz"] == "etwa 60 bis 120 Wörter"
    assert LENGTHS["mittel"] == "etwa 150 bis 300 Wörter"
    assert LENGTHS["lang"] == "etwa 400 bis 600 Wörter"


def test_frame_marks_what_lies_after_the_writing_point_as_future(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    system = build(services).messages[0].content

    assert "Handlungsstand und Zeitlinie können über die Schreibstelle hinausreichen" in system
    assert "liegt in der Zukunft und wird weder erzählt noch angedeutet" in system


def test_instruction_for_the_led_character_is_written_out_exactly(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    """Owner, step 5.15: what the instruction gives the led character is written, no more."""
    system, user = (message.content for message in build(services).messages)

    assert (
        "Beschreibt die Anweisung, was Ilka Varn tut oder sagt, schreibst du genau das aus, "
        "Gesagtes als wörtliche Rede, und nichts darüber hinaus. Sonst gilt für Ilka Varn:"
    ) in system
    assert "solange die Anweisung nichts anderes ausdrücklich verlangt" not in system
    reminder = user.split("Erinnerung: ")[1]
    assert "Was die Anweisung für Ilka Varn vorgibt, schreibst du genau aus, nicht mehr." in (
        reminder
    )


# --- summaries (roadmap step 3.6) --------------------------------------------------------


def test_chapter_summary_request_holds_state_text_and_instruction(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    context = ContextBuilder(*services).build_chapter_summary(WORLD, STORY, 2)

    system, user = (message.content for message in context.messages)
    assert "„Das Salz der Toten“ in der Welt „Die Salzmark“" in system
    assert "Erfinde nichts hinzu" in system
    assert user.index("Ilka sucht ihren Bruder.") < user.index("# Kapitel 2: Der Turm")
    assert "Dritter.\n\nVierter Absatz." in user
    assert "150 bis höchstens 250 Wörtern" in user
    assert kinds(context) == ["rahmen", "handlungsstand", "kapiteltext", "anweisung"]


def test_chapter_summary_without_overall_summary_or_text(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    canon, manuscripts = services
    manuscripts.set_story_summary(WORLD, STORY, "")
    builder = ContextBuilder(canon, manuscripts)

    assert "handlungsstand" not in kinds(builder.build_chapter_summary(WORLD, STORY, 1))
    manuscripts.save_chapter(WORLD, STORY, 3, title="Leer", text="  ")
    with pytest.raises(InvalidInput, match="keinen Text"):
        builder.build_chapter_summary(WORLD, STORY, 3)


def test_chapter_summary_too_large_is_refused(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    canon, manuscripts = services
    manuscripts.save_chapter(WORLD, STORY, 3, title="Lang", text="Wort. " * 20000)

    with pytest.raises(ContextTooLarge) as refused:
        ContextBuilder(canon, manuscripts).build_chapter_summary(WORLD, STORY, 3)

    assert refused.value.largest[0].label == "Kapitel 3"
    with pytest.raises(InvalidInput):
        ContextBuilder(canon, manuscripts).build_chapter_summary(WORLD, STORY, 1, budget=0)


def test_story_summary_request_continues_the_overall_summary(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    context = ContextBuilder(*services).build_story_summary(WORLD, STORY, 1)

    user = context.messages[1].content
    assert user.index("Ilka sucht ihren Bruder.") < user.index("Ilka findet die Klinge.")
    assert "# Neues Kapitel 1: Die Flut" in user
    assert "Höchstens ca. 600 Wörter" in user
    assert context.estimated_tokens >= sum(block.tokens for block in context.blocks)


def test_story_summary_needs_a_chapter_summary_and_starts_empty(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    canon, manuscripts = services
    builder = ContextBuilder(canon, manuscripts)
    with pytest.raises(InvalidInput, match="keine Kurzfassung"):
        builder.build_story_summary(WORLD, STORY, 2)

    manuscripts.set_story_summary(WORLD, STORY, "")
    user = builder.build_story_summary(WORLD, STORY, 1).messages[1].content
    assert "# Bisherige Gesamtzusammenfassung\n\n(noch keine)" in user


def test_missing_summary_is_replaced_by_the_chapter_opening(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    canon, manuscripts = services
    first = " ".join(["erste"] * 200)
    second = " ".join(["zweite"] * 90)
    third = " ".join(["dritte"] * 20)
    manuscripts.save_chapter(WORLD, STORY, 1, text=f"{first}\n\n{second}\n\n{third}")
    manuscripts.set_chapter_summary(WORLD, STORY, 1, "", "fehlt")

    context = build((canon, manuscripts), budget=4000)

    assert labels(context, "kapitelanfang") == ["Kapitel 1 (Anfang)"]
    assert labels(context, "kurzfassung") == []
    user = context.messages[1].content
    heading = "## Kapitel 1: Die Flut (Kurzfassung fehlt, Anfang wörtlich)\n\n"
    opening = user.split(heading)[1].split("\n\n#")[0]
    assert opening == f"{first}\n\n{second}"


def test_opening_cuts_a_long_first_paragraph() -> None:
    from skriptorium.context.builder import _opening

    assert _opening(" ".join(["wort"] * 400)) == " ".join(["wort"] * 300) + " …"
    assert _opening("Kurz.\n\n\n\nNoch.", words=5) == "Kurz.\n\nNoch."


def test_chapter_without_text_and_summary_adds_nothing(
    services: tuple[CanonService, ManuscriptService],
) -> None:
    canon, manuscripts = services
    manuscripts.save_chapter(WORLD, STORY, 1, text="")
    manuscripts.set_chapter_summary(WORLD, STORY, 1, "", "fehlt")

    context = build((canon, manuscripts))

    assert labels(context, "kapitelanfang") == []
    assert labels(context, "kurzfassung") == []

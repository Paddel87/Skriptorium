"""Requests for the summaries of a chapter and of the story (step 3.6, FR-010)."""

import math

from skriptorium.canon import CanonService, InvalidInput
from skriptorium.context.parts import (
    CHARS_PER_TOKEN,
    MAX_BUDGET,
    SAFETY_MARGIN,
    BuiltContext,
    Part,
    check_budget,
    fitted,
)
from skriptorium.manuscript import Chapter, ManuscriptService


def _summary_frame(world_name: str, story_title: str) -> str:
    """Frame of the summary requests (step 3.6)."""
    return (
        f"Du fasst Kapitel der Geschichte „{story_title}“ in der Welt „{world_name}“ zusammen. "
        "Die Zusammenfassungen ersetzen beim Weiterschreiben den vollen Text früherer Kapitel; "
        "sie müssen deshalb den Handlungsstand vollständig und genau tragen. Halte dich strikt "
        "an den Text: Erfinde nichts hinzu, deute nichts, werte nicht."
    )


def _chapter_summary_instruction(number: int) -> str:
    return (
        f"# Anweisung\n\nFasse Kapitel {number} in 150 bis höchstens 250 Wörtern zusammen, "
        "im Präteritum, als Fließtext ohne Überschrift. Die Grenze von 250 Wörtern gilt auch "
        "für kurze Kapitel: Lass Nebensächliches weg. Halte fest, was geschieht und in welcher "
        "Reihenfolge, wer beteiligt ist und wo es spielt, was sich für die Figuren ändert "
        "(Wissen, Besitz, Verletzungen, Beziehungen, Aufenthaltsort) und welche Fragen am Ende "
        "offen sind. Nenne Namen so, wie sie im Text stehen. Antworte nur mit der Kurzfassung."
    )


def _story_summary_instruction(number: int) -> str:
    return (
        "# Anweisung\n\nSchreibe die Gesamtzusammenfassung der Geschichte fort: Übernimm die "
        f"bisherige Gesamtzusammenfassung und arbeite Kapitel {number} an seiner Stelle in "
        "der Reihenfolge ein; steht es schon darin, ersetze diesen Teil. Höchstens ca. 600 "
        "Wörter, im Präteritum, als Fließtext ohne Überschrift. Wird es mehr, verdichte ältere "
        "Abschnitte und behalte, was für die weitere Handlung zählt: Stand der Figuren, "
        "Besitz, Orte, offene Fragen. Antworte nur mit der Gesamtzusammenfassung."
    )


def build_chapter_summary(
    canon: CanonService,
    manuscripts: ManuscriptService,
    world_id: str,
    story_id: str,
    chapter_number: int,
    budget: int = MAX_BUDGET,
) -> BuiltContext:
    """Build the request for the short summary of ``chapter_number`` (step 3.6).

    The short summaries of the chapters before it come along so that names and threads stay
    consistent: only the state before this chapter, never later ones (step 8.6, ADR-085). The
    chapter text has priority; the newest earlier summaries fill the room that is left, the
    oldest fall away first.

    Raises:
        InvalidInput: Budget outside 1-30,000 or the chapter has no text.
        NotFound: World, story or chapter does not exist.
        ContextTooLarge: The chapter does not fit the budget.
    """
    check_budget(budget)
    chapter = manuscripts.get_chapter(world_id, story_id, chapter_number)
    if not chapter.text.strip():
        raise InvalidInput(f"Kapitel {chapter_number} hat noch keinen Text")
    system, user = _chapter_summary_parts(canon, manuscripts, world_id, story_id, chapter)
    used = sum(part.block.tokens for part in [*system, *user])
    state = _state_before(manuscripts, world_id, story_id, chapter.number, budget, used)
    if state is not None:
        user.insert(0, state)
    return fitted(system, user, budget)


def chapter_summary_room(
    canon: CanonService,
    manuscripts: ManuscriptService,
    world_id: str,
    story_id: str,
    chapter_number: int,
    budget: int = MAX_BUDGET,
) -> int:
    """Longest chapter text (characters, without outer whitespace) whose short summary still
    fits the budget (step 6.1). The summaries of earlier chapters only fill the room that is
    left (step 8.6), so they do not shorten it.

    Raises:
        InvalidInput: Budget outside 1-30,000.
        NotFound: World, story or chapter does not exist.
    """
    check_budget(budget)
    chapter = manuscripts.get_chapter(world_id, story_id, chapter_number)
    system, user = _chapter_summary_parts(canon, manuscripts, world_id, story_id, chapter, "")
    others = sum(part.block.tokens for part in [*system, *user] if part.kind != "kapiteltext")
    heading = next(part.text for part in user if part.kind == "kapiteltext")
    capacity = math.floor(budget / SAFETY_MARGIN) - others
    # The chapter block counts its text with the separator "\n\n" (``Part.block``).
    return max(0, math.floor(capacity * CHARS_PER_TOKEN) - len(heading) - 2)


def _chapter_summary_parts(
    canon: CanonService,
    manuscripts: ManuscriptService,
    world_id: str,
    story_id: str,
    chapter: Chapter,
    text: str | None = None,
) -> tuple[list[Part], list[Part]]:
    """System and user parts of the chapter summary request without the state before it;
    ``text`` replaces the chapter text (``None``: the chapter's own)."""
    world = canon.get_world(world_id)
    story = manuscripts.get_story(world_id, story_id)
    system = [Part("rahmen", "Rahmen", _summary_frame(world.name, story.title))]
    text = chapter.text if text is None else text
    user: list[Part] = []
    user.append(
        Part(
            "kapiteltext",
            f"Kapitel {chapter.number}",
            f"# Kapitel {chapter.number}: {chapter.title}\n\n{text.strip()}",
        )
    )
    user.append(Part("anweisung", "Anweisung", _chapter_summary_instruction(chapter.number)))
    return system, user


def _state_before(
    manuscripts: ManuscriptService,
    world_id: str,
    story_id: str,
    number: int,
    budget: int,
    used: int,
) -> Part | None:
    """The short summaries of the chapters before ``number`` that fit next to ``used`` tokens,
    newest first kept; ``None`` if there is none or none fits (step 8.6, ADR-085)."""
    earlier = [
        chapter
        for chapter in manuscripts.list_chapters(world_id, story_id)
        if chapter.number < number and chapter.summary.strip()
    ]
    room = math.floor(budget / SAFETY_MARGIN) - used
    while earlier:
        part = _state_part(earlier)
        if part.block.tokens <= room:
            return part
        earlier = earlier[1:]
    return None


def _state_part(chapters: list[Chapter]) -> Part:
    sections = "\n\n".join(
        f"## Kapitel {chapter.number}: {chapter.title}\n\n{chapter.summary.strip()}"
        for chapter in chapters
    )
    return Part(
        "handlungsstand",
        f"Kurzfassungen bis Kapitel {chapters[-1].number}",
        f"# Handlungsstand vor diesem Kapitel\n\n{sections}",
    )


def build_story_summary(
    canon: CanonService,
    manuscripts: ManuscriptService,
    world_id: str,
    story_id: str,
    chapter_number: int,
    budget: int = MAX_BUDGET,
) -> BuiltContext:
    """Build the request that continues the overall summary with ``chapter_number``.

    Raises:
        InvalidInput: Budget outside 1-30,000 or the chapter has no summary yet.
        NotFound: World, story or chapter does not exist.
        ContextTooLarge: Overall and chapter summary do not fit the budget.
    """
    check_budget(budget)
    world = canon.get_world(world_id)
    story = manuscripts.get_story(world_id, story_id)
    chapter = manuscripts.get_chapter(world_id, story_id, chapter_number)
    if not chapter.summary.strip():
        raise InvalidInput(f"Kapitel {chapter_number} hat noch keine Kurzfassung")
    system = [Part("rahmen", "Rahmen", _summary_frame(world.name, story.title))]
    previous = story.summary.strip() or "(noch keine)"
    user = [
        Part(
            "handlungsstand",
            "Gesamtzusammenfassung",
            f"# Bisherige Gesamtzusammenfassung\n\n{previous}",
        ),
        Part(
            "kurzfassung",
            f"Kapitel {chapter.number}",
            f"# Neues Kapitel {chapter.number}: {chapter.title}\n\n{chapter.summary.strip()}",
        ),
        Part("anweisung", "Anweisung", _story_summary_instruction(chapter.number)),
    ]
    return fitted(system, user, budget)

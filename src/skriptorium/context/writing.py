"""Parts of the request for writing on: sources in the order of precedence (ADR-003, step 3.2)."""

import math
import re
from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Final, Literal

from skriptorium.canon import CanonEntry, NotFound, World
from skriptorium.context.parts import (
    CHARS_PER_TOKEN,
    SAFETY_MARGIN,
    BlockKind,
    BuiltContext,
    ContextTooLarge,
    Known,
    Part,
    PromptMessage,
    estimate_tokens,
    render,
    render_known,
)
from skriptorium.manuscript import Chapter, Story

# Words of a chapter's opening that stand in for a missing summary (owner, step 3.6).
OPENING_WORDS: Final = 300
# Start of the one line in which the AI tells the author how it changed an instruction that
# contradicts the canon; ``api`` shows that line apart from the text (step 4.14).
CONFLICT_MARKER: Final = "HINWEIS:"
# Words of the chapter's end quoted in the note on the seam (step 5.8).
SEAM_WORDS: Final = 30
# Upper bound for the quote, should a paragraph have no spaces.
SEAM_CHARS: Final = 300

# Length of a proposal, chosen per request (owner, step 5.15).
Length = Literal["kurz", "mittel", "lang"]
LENGTHS: Final[dict[Length, str]] = {
    "kurz": "etwa 60 bis 120 Wörter",
    "mittel": "etwa 150 bis 300 Wörter",
    "lang": "etwa 400 bis 600 Wörter",
}
DEFAULT_LENGTH: Final[Length] = "mittel"


def find_references(text: str, entries: Sequence[CanonEntry], own: str | None = None) -> list[str]:
    """Identifiers of the entries that ``text`` names with ``@Name`` (step 8.11, ADR-088).

    A name or alias of an entry of ``entries`` (one world), without regard to case; the longest
    name wins (``@Gunda Hollt`` before ``@Gunda``) and ends at a word boundary, so punctuation
    may follow; a genitive "s" counts as in the interface (``@Kaels``, ``ui/src/references.ts``).
    In order of appearance, each entry once; ``own`` (the entry the text belongs to) and unknown
    words are left out.
    """
    owners: dict[str, str] = {}
    for entry in entries:
        for name in (entry.name, *entry.aliases):
            if name.strip():
                owners.setdefault(name.strip().casefold(), entry.id)
    if not owners:
        return []
    names = sorted(owners, key=lambda name: (-len(name), name))
    pattern = re.compile(
        r"(?<!\w)@(" + "|".join(re.escape(name) for name in names) + r")s?(?!\w)", re.IGNORECASE
    )
    found: list[str] = []
    for match in pattern.finditer(text):
        entry_id = owners[match.group(1).casefold()]
        if entry_id != own and entry_id not in found:
            found.append(entry_id)
    return found


def reference_candidates(request: Request) -> list[Known]:
    """Entries the named entries and the led characters refer to, one step deep (ADR-088).

    First those of the first named entry, then of the second, then of the led characters.
    Guests have no references: they are not part of the world's canon.
    """
    sources = [known for known in request.named if known.home is None]
    for character in request.story.controlled_characters:
        known = request.by_id.get(character)
        if known is not None and known.home is None:
            sources.append(known)
    by_id = {entry.id: entry for entry in request.entries}
    ordered: dict[str, Known] = {}
    for source in sources:
        for entry_id in find_references(source.entry.body, request.entries, source.entry.id):
            ordered.setdefault(entry_id, Known(by_id[entry_id]))
    return list(ordered.values())


@dataclass
class Request:
    """What one request is built from; the sources record in ``included`` and ``missing``."""

    world: World
    story: Story
    chapters: Sequence[Chapter]
    current: Chapter
    entries: Sequence[CanonEntry]
    guests: Sequence[Known]
    by_id: dict[str, Known]
    named: Sequence[Known]
    # Entries already in the request (keys of ``Known``), so no entry enters twice.
    included: set[tuple[str, str]] = field(default_factory=set)
    # Led characters without a canon entry.
    missing: list[str] = field(default_factory=list)


def _frame_parts(request: Request) -> list[Part]:
    return [Part("rahmen", "Rahmen", frame(request.world.name))]


def _world_part(request: Request) -> list[Part]:
    world = request.world
    return [Part("welt", world.name, f"# Welt: {world.name}\n\n{world.description}".strip())]


def _writing_mode_parts(request: Request) -> list[Part]:
    parts = [
        Part("schreibweise", "Figuren-Schreibweise", _writing_mode(request.story, request.by_id))
    ]
    atmosphere = _atmosphere(request.story, request.current)
    if atmosphere:
        parts.append(Part("schreibweise-atmo", "Schreibweise", atmosphere))
    return parts


def _rule_and_timeline_parts(request: Request) -> list[Part]:
    parts: list[Part] = []
    for category in ("regel", "zeitlinie"):
        for entry in request.entries:
            if entry.category == category:
                parts.append(Part(category, entry.name, render(entry)))
                request.included.add((entry.world, entry.id))
    return parts


def _reference_parts(request: Request) -> list[Part]:
    parts: list[Part] = []
    for known in request.named:
        if known.key not in request.included:
            parts.append(Part(kind(known, "verweis"), known.entry.name, render_known(known)))
            request.included.add(known.key)
    return parts


def _controlled_character_parts(request: Request) -> list[Part]:
    parts: list[Part] = []
    for character in request.story.controlled_characters:
        if character not in request.by_id:
            request.missing.append(character)
            continue
        known = request.by_id[character]
        if known.key in request.included:
            continue
        parts.append(Part(kind(known, "gefuehrte-figur"), known.entry.name, render_known(known)))
        request.included.add(known.key)
    return parts


def _fact_parts(request: Request) -> list[Part]:
    if not request.story.facts:
        return []
    return [Part("fakten", "Fakten dieser Geschichte", _facts(request.story, request.by_id))]


# The mandatory system parts in the order of the request (precedence 1 and 2); each source
# returns its parts and records the entries it took in ``request.included``.
# Mandatory parts of the system message, in this order (ADR-003, step 3.2); they always go
# along and count against the budget before the last pages and the filler (step 6.12).
_FIXED_SOURCES: Final = (
    _frame_parts,
    _world_part,
    _writing_mode_parts,
    _rule_and_timeline_parts,
    _reference_parts,
    _controlled_character_parts,
    _fact_parts,
)


def fixed_parts(request: Request) -> list[Part]:
    return [part for source in _FIXED_SOURCES for part in source(request)]


def closing_parts(request: Request, instruction: str, length: Length) -> list[Part]:
    """Seam note, instruction, requirements and the reminder of the character mode."""
    parts = [
        Part("anweisung", "Anweisung", f"# Anweisung\n\n{instruction.strip()}"),
        Part("anweisung", "Vorgaben", requirements(length)),
    ]
    note = seam(request.current)
    if note:
        parts.insert(0, Part("anweisung", "Anschluss", note))
    led = led_names(request.story, request.by_id)
    if led:
        parts.append(Part("schreibweise", "Erinnerung Figuren-Schreibweise", _reminder(led)))
    return parts


def remaining_room(required: Sequence[Part], budget: int) -> int:
    """Tokens left after the required parts; ``ContextTooLarge`` if they do not fit."""
    capacity = math.floor(budget / SAFETY_MARGIN)
    needed = sum(part.block.tokens for part in required)
    if needed > capacity:
        largest = sorted((part.block for part in required), key=lambda b: -b.tokens)[:3]
        raise ContextTooLarge(budget, math.ceil(needed * SAFETY_MARGIN), largest)
    return capacity - needed


def assemble(
    system_parts: Sequence[Part], user_parts: Sequence[Part], missing: Sequence[str]
) -> BuiltContext:
    system = "\n\n".join(part.text for part in system_parts)
    user = "\n\n".join(part.text for part in user_parts)
    blocks = tuple(part.block for part in [*system_parts, *user_parts])
    return BuiltContext(
        messages=(PromptMessage("system", system), PromptMessage("user", user)),
        blocks=blocks,
        estimated_tokens=math.ceil(sum(block.tokens for block in blocks) * SAFETY_MARGIN),
        missing_characters=tuple(missing),
    )


def frame(world_name: str) -> str:
    """Frame of the request, as tested in steps 1.1 and 1.5.

    Conflict note since step 4.14, seamless continuation since step 5.8, the future beyond the
    writing point since step 5.15.
    """
    return (
        f"Du bist Co-Autor einer Geschichte in der Welt „{world_name}“. Der Kanon unten ist "
        "verbindlich: Widersprich ihm nie. Erfinde nur, was der Kanon offen lässt. Die "
        "Zeitlinie ist verbindlich: Lass keine Handlung vor einem Ereignis geschehen, das laut "
        "Zeitlinie später liegt, wenn die Anweisung es nicht ausdrücklich verlangt. "
        "Verlangt die Anweisung etwas, das dem Kanon widerspricht, schreibe trotzdem "
        f"kanontreu und beginne deine Antwort mit genau einer Zeile „{CONFLICT_MARKER} …“, die "
        "dem Autor in einem Satz sagt, was du abgewandelt hast und warum; danach folgt der "
        "Text. Ohne Widerspruch schreibst du keine solche Zeile. Der Text selbst enthält nie "
        "Hinweise an den Autor. Eine Fortsetzung schließt nahtlos an das Ende des Manuskripts "
        "an: ohne Einleitung und ohne abschließenden Satz. Handlungsstand und Zeitlinie können "
        "über die Schreibstelle hinausreichen; was nach ihr geschieht, liegt in der Zukunft und "
        "wird weder erzählt noch angedeutet. Eine Regel mit der Zeile „Gilt nur in: …“ gilt nur "
        "an diesem Ort."
    )


def seam(current: Chapter) -> str:
    """Note before the instruction: go on right after the chapter's last words (step 5.8).

    Continuations used to open with place and situation and to close with a summing-up sentence
    (owner, 2026-10-08). Quoting the end makes the seam concrete. An empty chapter, or one with
    only its heading, starts fresh: no note.
    """
    paragraphs = [p for p in current.text.split("\n\n") if p.strip()]
    if not paragraphs or paragraphs[-1].lstrip().startswith("#"):
        return ""
    words = paragraphs[-1].split()
    end = " ".join(words[-SEAM_WORDS:])[-SEAM_CHARS:]
    cut = "… " if end != " ".join(words) else ""
    return (
        f"# Anschluss\n\nDas Manuskript endet mit: „{cut}{end}“\n\n"
        "Setzt du fort, beginnt dein Text mit dem nächsten Satz unmittelbar nach diesen Worten, "
        "in derselben Szene: Führe Ort, Lage und Figuren nicht neu ein und fasse nichts "
        "zusammen. Verlangt die Anweisung eine neue Szene, beginnt sie dort."
    )


def requirements(length: Length) -> str:
    """Requirements after the instruction (steps 5.8, 5.15); they hold for every request.

    Proposals ran ahead of the author up to events the summary names, and after a few
    taken-over proposals each one opened and closed like the ones before (owner, 2026-10-08).
    Long proposals filled up with the place's atmosphere in new words and closed with the same
    gesture of waiting (owner, 2026-10-09; step 5.22): length is a ceiling, known surroundings
    are described only when they change, and the end is an action or line, not a pause.
    """
    return (
        "# Vorgaben für deinen Text\n\n"
        "- Schreibe nur aus, was die Anweisung verlangt, und höre dann auf. Nimm nicht vorweg, "
        "was der Autor als Nächstes schreiben könnte.\n"
        f"- Länge: {LENGTHS[length]}.\n"
        "- Die Länge ist eine Obergrenze: Gibt die Anweisung weniger her, schreibe kürzer, "
        "statt mit Beschreibung aufzufüllen.\n"
        "- Die Schreibstelle ist das Ende des bisherigen Manuskripts. Was Handlungsstand, "
        "Kurzfassungen oder Zeitlinie über spätere Ereignisse sagen, liegt in der Zukunft: "
        "Erzähle es nicht und deute es nicht an.\n"
        "- Wiederhole keine Sätze, Bilder, Gesten und Wendungen aus den letzten "
        "Manuskript-Seiten; finde für Wiederkehrendes neue Worte oder lass es weg.\n"
        "- Ort, Licht, Geräusche, Gerüche und Stimmung sind bekannt: Beschreibe sie nur, wenn "
        "sich an ihnen etwas ändert, auch nicht umschrieben.\n"
        "- Kein abschließender, zusammenfassender oder ausblickender Satz: Dein Text hört "
        "mitten im Geschehen auf, mit einer Handlung oder Rede einer Figur, nicht mit Warten, "
        "Schweigen, einem Blick oder Stimmung."
    )


def lookup(by_id: dict[str, Known], reference: str) -> Known:
    if reference not in by_id:
        raise NotFound(reference)
    return by_id[reference]


def kind(known: Known, own: BlockKind) -> BlockKind:
    """Block kind of an entry in precedence 2: guests are marked as such in the protocol."""
    return "gast" if known.home is not None else own


def led_names(story: Story, by_id: dict[str, Known]) -> str:
    """Names of the characters the author leads, joined for the rule text."""
    return ", ".join(by_id[c].entry.name if c in by_id else c for c in story.controlled_characters)


def _writing_mode(story: Story, by_id: dict[str, Known]) -> str:
    """Perspective and characters led by the author (FR-012, wording of step 3.4)."""
    lines = [f"# Geschichte: {story.title}"]
    if story.perspective:
        lines.append(f"Erzählperspektive: {story.perspective}")
    names = led_names(story, by_id)
    if names:
        lines.append(
            f"## Figuren-Schreibweise\n\n"
            f"Der Autor führt selbst: {names}. Du führst die Welt und alle übrigen Figuren. "
            f"Beschreibt die Anweisung, was {names} tut oder sagt, schreibst du genau das aus, "
            "Gesagtes als wörtliche Rede, und nichts darüber hinaus. Sonst gilt für "
            f"{names}:\n\n"
            "- keine Handlung und keine Bewegung, auch keine kleine (nicht aufstehen, nicht "
            "greifen, nicht nicken, nicht weitergehen);\n"
            "- keine wörtliche oder indirekte Rede, keine Antwort, keinen Entschluss;\n"
            "- keine Gedanken, Erinnerungen, Gefühle oder Absichten;\n"
            "- erlaubt ist nur, was die Figur unmittelbar wahrnimmt: sehen, hören, riechen, "
            "spüren; bei Ich-Erzählung in der ersten Person.\n\n"
            "Beschreibe, was die übrigen Figuren und die Welt tun. Sobald die geführte Figur "
            "handeln, sprechen oder sich entscheiden müsste, beende deinen Text an genau dieser "
            "Stelle. Dort schreibt der Autor weiter."
        )
    return "\n\n".join(lines)


def _atmosphere(story: Story, current: Chapter) -> str:
    """Genres and atmospheric writing style of the chapter (step 5.6, ADR-053).

    The chapter's own style applies; a chapter without one follows the default of the story.
    Only lines with values; with nothing set there is no block. The block yields to the canon
    and to the Figuren-Schreibweise, as tested in the trial of step 5.6.
    """
    style = current.writing_style if current.writing_style is not None else story.writing_style
    values = [
        ("Genre", ", ".join(story.genres)),
        ("Tonalität", ", ".join(style.tone)),
        ("Atmosphäre", ", ".join(style.atmosphere)),
        ("Tempo", style.tempo or ""),
        ("Stil", ", ".join(style.style)),
        ("Deutlichkeit", style.explicitness or ""),
        ("Weitere Angaben", style.free.strip()),
    ]
    lines = [f"- {label}: {value}" for label, value in values if value]
    if not lines:
        return ""
    return (
        "## Schreibweise\n\n"
        + "\n".join(lines)
        + "\n\nHalte diese Schreibweise in Wortwahl, Satzbau und Tempo ein. Sie tritt hinter den "
        "Kanon und die Figuren-Schreibweise zurück: Widerspricht sie einem Kanon-Eintrag oder der "
        "Führung einer Figur, gelten Kanon und Figuren-Schreibweise."
    )


def _reminder(names: str) -> str:
    """Short repetition of the rule at the end of the request (steps 3.4, 5.15, 5.22)."""
    return (
        f"Erinnerung: {names} führt der Autor. Was die Anweisung für {names} vorgibt, schreibst "
        "du genau aus, nicht mehr. Darüber hinaus keine Handlung, keine Rede, keinen Entschluss "
        "und keine Gedanken, nur Wahrnehmung. Schließe nicht mit Warten oder einem Blick auf "
        f"{names}. Ende, sobald die Figur handeln oder antworten müsste."
    )


def _facts(story: Story, by_id: dict[str, Known]) -> str:
    lines = ["## Fakten dieser Geschichte"]
    for fact in story.facts:
        name = by_id[fact.entry].entry.name if fact.entry in by_id else fact.entry
        lines.append(f"- {name}: {fact.fact}")
    return "\n".join(lines)


def story_state(story: Story, chapters: Sequence[Chapter], current: int) -> list[Part]:
    """Precedence 3: overall summary and summaries of the chapters before ``current``.

    A chapter without a summary contributes its opening verbatim until the summary is made.
    """
    parts: list[Part] = []
    if story.summary.strip():
        parts.append(
            Part("handlungsstand", "Gesamtzusammenfassung", f"# Handlungsstand\n\n{story.summary}")
        )
    for chapter in chapters:
        if chapter.number >= current:
            continue
        heading = f"## Kapitel {chapter.number}: {chapter.title}"
        if chapter.summary.strip():
            parts.append(
                Part(
                    "kurzfassung",
                    f"Kapitel {chapter.number}",
                    f"{heading}\n\n{chapter.summary.strip()}",
                )
            )
        elif chapter.text.strip():
            parts.append(
                Part(
                    "kapitelanfang",
                    f"Kapitel {chapter.number} (Anfang)",
                    f"{heading} (Kurzfassung fehlt, Anfang wörtlich)\n\n{opening(chapter.text)}",
                )
            )
    return parts


def opening(text: str, words: int = OPENING_WORDS) -> str:
    """Whole paragraphs from the start up to ``words`` words; a longer first one is cut."""
    kept: list[str] = []
    count = 0
    for paragraph in (p.strip() for p in text.split("\n\n") if p.strip()):
        size = len(paragraph.split())
        if count + size > words:
            if not kept:
                kept.append(" ".join(paragraph.split()[:words]) + " …")
            break
        kept.append(paragraph)
        count += size
    return "\n\n".join(kept)


def tail(text: str, tokens: int) -> str:
    """The longest end of ``text`` within ``tokens``, starting at a word and marked with "…"."""
    if estimate_tokens(text) <= tokens:
        return text
    marker = "… "
    size = math.floor(tokens * CHARS_PER_TOKEN) - len(marker)
    if size <= 0:
        return ""
    end = text[-size:]
    if not text[-size - 1].isspace():
        # cut inside a word: start after its end
        cut = next((i for i, char in enumerate(end) if char.isspace()), None)
        if cut is None:
            return ""
        end = end[cut:]
    end = end.lstrip()
    return marker + end if end else ""


def last_pages(
    chapters: Sequence[Chapter], current: Chapter, remaining: int
) -> tuple[list[Part], int]:
    """Precedence 4: text up to the end of ``current``, from the back, whole paragraphs.

    If already the last paragraph does not fit - a long chapter with single line breaks only is
    one paragraph - its end enters instead, starting at a word (step 4.1).
    """
    heading = "# Letzte Manuskript-Seiten (wörtlich)"
    remaining -= estimate_tokens(heading) + 1
    if remaining <= 0:
        return [], 0
    taken: list[Part] = []
    for chapter in reversed([c for c in chapters if c.number <= current.number]):
        paragraphs = [p for p in chapter.text.split("\n\n") if p.strip()]
        kept: list[str] = []
        for paragraph in reversed(paragraphs):
            tokens = estimate_tokens(paragraph) + 1
            if tokens > remaining:
                if not taken and not kept:
                    end = tail(paragraph, remaining - 1)
                    if end:
                        kept.insert(0, end)
                        remaining -= estimate_tokens(end) + 1
                break
            kept.insert(0, paragraph)
            remaining -= tokens
        if kept:
            taken.insert(0, Part("seiten", f"Kapitel {chapter.number}", "\n\n".join(kept)))
        if len(kept) < len(paragraphs):
            break
    if not taken:
        return [], remaining + estimate_tokens(heading) + 1
    first = taken[0]
    taken[0] = Part(first.kind, first.label, f"{heading}\n\n{first.text}")
    return taken, remaining

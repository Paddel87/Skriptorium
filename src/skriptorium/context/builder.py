"""``ContextBuilder``: one AI request under a fixed token budget (ADR-003, ADR-010).

Order of precedence: (1) frame, world, writing mode, all rules and the timeline; (2) entries
named with ``@``, the characters the author leads and the facts of the story; (3) overall
summary and chapter summaries; (4) the last manuscript pages verbatim, then further canon
entries of the world until the budget is used (precision before step 3.2,
docs/architecture.md section 3). If (1)-(3) and the instruction do not fit, the request is
refused - nothing the author named is left out silently.

A continuation goes on right after the chapter's last words (step 5.8): a short note before the
instruction quotes the end of the current chapter and asks for no opening that re-introduces
place and situation and no closing sentence.

If the author leads characters (FR-012), a short reminder of that rule follows the instruction:
the rule in the fixed part alone was often broken (step 3.3), and the end of a request weighs
more for the model.

Fixed parts (frame, world, canon) come first, changing parts last, so provider caches apply.
Only entries of the story's own world are read (FR-001), plus the entries of other worlds the
story binds in as guests (FR-017, step 3.7). A guest enters like an entry of the world when it
is named with ``@`` (a new scene names its place and characters so) or led by the author;
otherwise it only fills the budget after the world's own entries (owner, step 3.7). It is
marked with its home world; that world's rules do not come along. Identifiers name a guest
before an entry of the world with the same identifier, as in the checks of ``api``.

Summaries (step 3.6, FR-010): ``build_chapter_summary`` asks for the short summary of a chapter
(about 150-250 words), ``build_story_summary`` for the continued overall summary (at most about
600 words); lengths chosen by the owner. An earlier chapter without a summary enters the story
state with its opening verbatim instead - whole paragraphs up to about 300 words.
"""

import math
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from typing import Final, Literal

from skriptorium.canon import (
    CATEGORIES,
    CanonEntry,
    CanonService,
    Category,
    InvalidInput,
    NotFound,
)
from skriptorium.manuscript import Chapter, ManuscriptService, Story

MAX_BUDGET: Final = 30_000
CHARS_PER_TOKEN: Final = 3.3
# Estimates differ from provider counts by -6 % to +8 % (step 1.1); 10 % margin keeps the
# real count below the budget.
SAFETY_MARGIN: Final = 1.1
# Words of a chapter's opening that stand in for a missing summary (owner, step 3.6).
OPENING_WORDS: Final = 300
# Start of the one line in which the AI tells the author how it changed an instruction that
# contradicts the canon; ``api`` shows that line apart from the text (step 4.14).
CONFLICT_MARKER: Final = "HINWEIS:"
# Words of the chapter's end quoted in the note on the seam (step 5.8).
SEAM_WORDS: Final = 30
# Upper bound for the quote, should a paragraph have no spaces.
SEAM_CHARS: Final = 300

_CATEGORY_LABELS: Final[dict[Category, str]] = {
    "figur": "Figur",
    "ort": "Ort",
    "gegenstand": "Gegenstand",
    "zeitlinie": "Zeitlinie",
    "regel": "Regel",
    "kultur": "Kultur",
}

Role = Literal["system", "user"]
BlockKind = Literal[
    "rahmen",
    "welt",
    "schreibweise",
    "regel",
    "zeitlinie",
    "verweis",
    "gefuehrte-figur",
    "gast",
    "fakten",
    "handlungsstand",
    "kurzfassung",
    "kapitelanfang",
    "kapiteltext",
    "seiten",
    "anweisung",
    "auffuellung",
]


@dataclass(frozen=True)
class PromptMessage:
    """One message of the request; ``api`` turns it into an ``ai_gateway`` message."""

    role: Role
    content: str


@dataclass(frozen=True)
class ContextBlock:
    """One building block in the protocol: what it is and its estimated size."""

    kind: BlockKind
    label: str
    tokens: int


@dataclass(frozen=True)
class BuiltContext:
    """The request and the protocol of its blocks."""

    messages: tuple[PromptMessage, ...]
    blocks: tuple[ContextBlock, ...]
    estimated_tokens: int
    missing_characters: tuple[str, ...]


class ContextTooLarge(Exception):  # noqa: N818 - named like the error kinds of the other modules
    """Precedence 1-3 and the instruction exceed the budget; names the largest blocks."""

    def __init__(self, budget: int, needed: int, largest: Sequence[ContextBlock]) -> None:
        names = ", ".join(f"{block.label} ({block.tokens} Token)" for block in largest)
        super().__init__(
            f"Der Kontext braucht ca. {needed} Token, das Budget erlaubt {budget}. "
            f"Größte Bausteine: {names}"
        )
        self.budget = budget
        self.needed = needed
        self.largest = tuple(largest)


@dataclass(frozen=True)
class _Known:
    """An entry the story may use; ``home`` names the world of a guest, else ``None``."""

    entry: CanonEntry
    home: str | None = None

    @property
    def key(self) -> tuple[str, str]:
        return (self.entry.world, self.entry.id)


def estimate_tokens(text: str) -> int:
    """Estimated tokens of ``text`` (3.3 characters per token, step 1.1)."""
    return math.ceil(len(text) / CHARS_PER_TOKEN)


@dataclass(frozen=True)
class _Part:
    kind: BlockKind
    label: str
    text: str

    @property
    def block(self) -> ContextBlock:
        # Counted with the separator that joins it to the next block.
        return ContextBlock(self.kind, self.label, estimate_tokens(self.text + "\n\n"))


class ContextBuilder:
    """Builds requests from canon and manuscript; reads only, never writes."""

    def __init__(self, canon: CanonService, manuscripts: ManuscriptService) -> None:
        """Create the builder on the reading services of ``canon`` and ``manuscript``."""
        self._canon = canon
        self._manuscripts = manuscripts

    def build(
        self,
        world_id: str,
        story_id: str,
        chapter_number: int,
        instruction: str,
        references: Sequence[str] = (),
        budget: int = MAX_BUDGET,
    ) -> BuiltContext:
        """Build the request for writing on in ``chapter_number``.

        ``references`` are identifiers of canon entries named with ``@``: entries of the story's
        world or guests bound into the story.

        Raises:
            InvalidInput: Budget outside 1-30,000 or empty instruction.
            NotFound: World, story, chapter or a referenced entry does not exist in the world
                or among the story's guests.
            ContextTooLarge: Precedence 1-3 and the instruction do not fit the budget.
        """
        _check_budget(budget)
        if not instruction.strip():
            raise InvalidInput("Anweisung fehlt")
        world = self._canon.get_world(world_id)
        story = self._manuscripts.get_story(world_id, story_id)
        chapters = self._manuscripts.list_chapters(world_id, story_id)
        current = self._manuscripts.get_chapter(world_id, story_id, chapter_number)
        entries = self._canon.list_entries(world_id)
        guests = self._guests(story)
        by_id = {entry.id: _Known(entry) for entry in entries} | {g.entry.id: g for g in guests}
        named = [_lookup(by_id, reference) for reference in references]

        fixed: list[_Part] = [
            _Part("rahmen", "Rahmen", _frame(world.name)),
            _Part("welt", world.name, f"# Welt: {world.name}\n\n{world.description}".strip()),
            _Part("schreibweise", "Figuren-Schreibweise", _writing_mode(story, by_id)),
        ]
        included: set[tuple[str, str]] = set()
        for category in ("regel", "zeitlinie"):
            for entry in entries:
                if entry.category == category:
                    fixed.append(_Part(category, entry.name, _render(entry)))
                    included.add((entry.world, entry.id))
        for known in named:
            if known.key not in included:
                fixed.append(_Part(_kind(known, "verweis"), known.entry.name, _render_known(known)))
                included.add(known.key)
        missing: list[str] = []
        for character in story.controlled_characters:
            if character not in by_id:
                missing.append(character)
                continue
            known = by_id[character]
            if known.key in included:
                continue
            fixed.append(
                _Part(_kind(known, "gefuehrte-figur"), known.entry.name, _render_known(known))
            )
            included.add(known.key)
        if story.facts:
            fixed.append(_Part("fakten", "Fakten dieser Geschichte", _facts(story, by_id)))

        state = _story_state(story, chapters, chapter_number)
        instruction_part = _Part("anweisung", "Anweisung", f"# Anweisung\n\n{instruction.strip()}")
        closing = [instruction_part]
        seam = _seam(current)
        if seam:
            closing.insert(0, _Part("anweisung", "Anschluss", seam))
        led = _led_names(story, by_id)
        if led:
            closing.append(_Part("schreibweise", "Erinnerung Figuren-Schreibweise", _reminder(led)))
        required = [*fixed, *state, *closing]
        capacity = math.floor(budget / SAFETY_MARGIN)
        needed = sum(part.block.tokens for part in required)
        if needed > capacity:
            largest = sorted((part.block for part in required), key=lambda b: -b.tokens)[:3]
            raise ContextTooLarge(budget, math.ceil(needed * SAFETY_MARGIN), largest)

        remaining = capacity - needed
        pages, remaining = _last_pages(chapters, current, remaining)
        filler: list[_Part] = []
        candidates = [_Known(entry) for entry in _in_category_order(entries)]
        candidates += sorted(guests, key=lambda g: _category_rank(g.entry))
        for known in candidates:
            if known.key in included:
                continue
            part = _Part("auffuellung", known.entry.name, _render_known(known))
            if part.block.tokens <= remaining:
                filler.append(part)
                remaining -= part.block.tokens

        system_parts = [*fixed, *filler]
        user_parts = [*state, *pages, *closing]
        system = "\n\n".join(part.text for part in system_parts)
        user = "\n\n".join(part.text for part in user_parts)
        blocks = tuple(part.block for part in [*system_parts, *user_parts])
        return BuiltContext(
            messages=(PromptMessage("system", system), PromptMessage("user", user)),
            blocks=blocks,
            estimated_tokens=math.ceil(sum(block.tokens for block in blocks) * SAFETY_MARGIN),
            missing_characters=tuple(missing),
        )

    def _guests(self, story: Story) -> list[_Known]:
        """The guest entries of ``story``; a guest whose entry or world is gone is skipped."""
        guests: list[_Known] = []
        for link in story.guest_links:
            try:
                entry = self._canon.get_entry(link.world, link.entry)
                home = self._canon.get_world(link.world).name
            except NotFound:
                continue
            guests.append(_Known(entry, home))
        return guests

    def build_chapter_summary(
        self, world_id: str, story_id: str, chapter_number: int, budget: int = MAX_BUDGET
    ) -> BuiltContext:
        """Build the request for the short summary of ``chapter_number`` (step 3.6).

        The overall summary so far comes along so that names and threads stay consistent.

        Raises:
            InvalidInput: Budget outside 1-30,000 or the chapter has no text.
            NotFound: World, story or chapter does not exist.
            ContextTooLarge: The chapter does not fit the budget.
        """
        _check_budget(budget)
        world = self._canon.get_world(world_id)
        story = self._manuscripts.get_story(world_id, story_id)
        chapter = self._manuscripts.get_chapter(world_id, story_id, chapter_number)
        if not chapter.text.strip():
            raise InvalidInput(f"Kapitel {chapter_number} hat noch keinen Text")
        system = [_Part("rahmen", "Rahmen", _summary_frame(world.name, story.title))]
        user: list[_Part] = []
        if story.summary.strip():
            user.append(
                _Part(
                    "handlungsstand",
                    "Gesamtzusammenfassung",
                    f"# Handlungsstand vor diesem Kapitel\n\n{story.summary.strip()}",
                )
            )
        user.append(
            _Part(
                "kapiteltext",
                f"Kapitel {chapter.number}",
                f"# Kapitel {chapter.number}: {chapter.title}\n\n{chapter.text.strip()}",
            )
        )
        user.append(_Part("anweisung", "Anweisung", _chapter_summary_instruction(chapter.number)))
        return _fitted(system, user, budget)

    def build_story_summary(
        self, world_id: str, story_id: str, chapter_number: int, budget: int = MAX_BUDGET
    ) -> BuiltContext:
        """Build the request that continues the overall summary with ``chapter_number``.

        Raises:
            InvalidInput: Budget outside 1-30,000 or the chapter has no summary yet.
            NotFound: World, story or chapter does not exist.
            ContextTooLarge: Overall and chapter summary do not fit the budget.
        """
        _check_budget(budget)
        world = self._canon.get_world(world_id)
        story = self._manuscripts.get_story(world_id, story_id)
        chapter = self._manuscripts.get_chapter(world_id, story_id, chapter_number)
        if not chapter.summary.strip():
            raise InvalidInput(f"Kapitel {chapter_number} hat noch keine Kurzfassung")
        system = [_Part("rahmen", "Rahmen", _summary_frame(world.name, story.title))]
        previous = story.summary.strip() or "(noch keine)"
        user = [
            _Part(
                "handlungsstand",
                "Gesamtzusammenfassung",
                f"# Bisherige Gesamtzusammenfassung\n\n{previous}",
            ),
            _Part(
                "kurzfassung",
                f"Kapitel {chapter.number}",
                f"# Neues Kapitel {chapter.number}: {chapter.title}\n\n{chapter.summary.strip()}",
            ),
            _Part("anweisung", "Anweisung", _story_summary_instruction(chapter.number)),
        ]
        return _fitted(system, user, budget)


def _check_budget(budget: int) -> None:
    if not 0 < budget <= MAX_BUDGET:
        raise InvalidInput(f"Budget muss zwischen 1 und {MAX_BUDGET} Token liegen")


def _fitted(system: Sequence[_Part], user: Sequence[_Part], budget: int) -> BuiltContext:
    """A two-message request from parts that must all fit; otherwise ``ContextTooLarge``."""
    parts = [*system, *user]
    needed = sum(part.block.tokens for part in parts)
    if needed > math.floor(budget / SAFETY_MARGIN):
        largest = sorted((part.block for part in parts), key=lambda b: -b.tokens)[:3]
        raise ContextTooLarge(budget, math.ceil(needed * SAFETY_MARGIN), largest)
    return BuiltContext(
        messages=(
            PromptMessage("system", "\n\n".join(part.text for part in system)),
            PromptMessage("user", "\n\n".join(part.text for part in user)),
        ),
        blocks=tuple(part.block for part in parts),
        estimated_tokens=math.ceil(needed * SAFETY_MARGIN),
        missing_characters=(),
    )


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


def _frame(world_name: str) -> str:
    """Frame of the request, as tested in steps 1.1 and 1.5.

    Conflict note since step 4.14, seamless continuation since step 5.8.
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
        "an: ohne Einleitung und ohne abschließenden Satz."
    )


def _seam(current: Chapter) -> str:
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
        "zusammen. Verlangt die Anweisung eine neue Szene, beginnt sie dort. In jedem Fall "
        "endet dein Text ohne abschließenden, zusammenfassenden oder ausblickenden Satz; er "
        "hört mitten im Geschehen auf."
    )


def _lookup(by_id: dict[str, _Known], reference: str) -> _Known:
    if reference not in by_id:
        raise NotFound(reference)
    return by_id[reference]


def _kind(known: _Known, own: BlockKind) -> BlockKind:
    """Block kind of an entry in precedence 2: guests are marked as such in the protocol."""
    return "gast" if known.home is not None else own


def _led_names(story: Story, by_id: dict[str, _Known]) -> str:
    """Names of the characters the author leads, joined for the rule text."""
    return ", ".join(by_id[c].entry.name if c in by_id else c for c in story.controlled_characters)


def _writing_mode(story: Story, by_id: dict[str, _Known]) -> str:
    """Perspective and characters led by the author (FR-012, wording of step 3.4)."""
    lines = [f"# Geschichte: {story.title}"]
    if story.perspective:
        lines.append(f"Erzählperspektive: {story.perspective}")
    names = _led_names(story, by_id)
    if names:
        lines.append(
            f"## Figuren-Schreibweise\n\n"
            f"Der Autor führt selbst: {names}. Du führst die Welt und alle übrigen Figuren. "
            f"Für {names} gilt, solange die Anweisung nichts anderes ausdrücklich verlangt:\n\n"
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


def _reminder(names: str) -> str:
    """Short repetition of the rule after the instruction (step 3.4)."""
    return (
        f"Erinnerung: {names} führt der Autor. Schreibe für {names} keine Handlung, keine Rede, "
        "keinen Entschluss und keine Gedanken, nur Wahrnehmung. Ende, sobald die Figur handeln "
        "oder antworten müsste."
    )


def _render(entry: CanonEntry, home: str | None = None) -> str:
    """A canon entry as Markdown; item sections and timeline events are part of the body.

    A guest names its home world in the heading (step 3.7).
    """
    label = _CATEGORY_LABELS[entry.category]
    if home is not None:
        label = f"{label}, Gast aus der Welt „{home}“"
    heading = f"## {entry.name} ({label})"
    aliases = f"\nAuch: {', '.join(entry.aliases)}" if entry.aliases else ""
    return f"{heading}{aliases}\n\n{entry.body.strip()}".strip()


def _render_known(known: _Known) -> str:
    return _render(known.entry, known.home)


def _facts(story: Story, by_id: dict[str, _Known]) -> str:
    lines = ["## Fakten dieser Geschichte"]
    for fact in story.facts:
        name = by_id[fact.entry].entry.name if fact.entry in by_id else fact.entry
        lines.append(f"- {name}: {fact.fact}")
    return "\n".join(lines)


def _story_state(story: Story, chapters: Sequence[Chapter], current: int) -> list[_Part]:
    """Precedence 3: overall summary and summaries of the chapters before ``current``.

    A chapter without a summary contributes its opening verbatim until the summary is made.
    """
    parts: list[_Part] = []
    if story.summary.strip():
        parts.append(
            _Part("handlungsstand", "Gesamtzusammenfassung", f"# Handlungsstand\n\n{story.summary}")
        )
    for chapter in chapters:
        if chapter.number >= current:
            continue
        heading = f"## Kapitel {chapter.number}: {chapter.title}"
        if chapter.summary.strip():
            parts.append(
                _Part(
                    "kurzfassung",
                    f"Kapitel {chapter.number}",
                    f"{heading}\n\n{chapter.summary.strip()}",
                )
            )
        elif chapter.text.strip():
            parts.append(
                _Part(
                    "kapitelanfang",
                    f"Kapitel {chapter.number} (Anfang)",
                    f"{heading} (Kurzfassung fehlt, Anfang wörtlich)\n\n{_opening(chapter.text)}",
                )
            )
    return parts


def _opening(text: str, words: int = OPENING_WORDS) -> str:
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


def _tail(text: str, tokens: int) -> str:
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


def _last_pages(
    chapters: Sequence[Chapter], current: Chapter, remaining: int
) -> tuple[list[_Part], int]:
    """Precedence 4: text up to the end of ``current``, from the back, whole paragraphs.

    If already the last paragraph does not fit - a long chapter with single line breaks only is
    one paragraph - its end enters instead, starting at a word (step 4.1).
    """
    heading = "# Letzte Manuskript-Seiten (wörtlich)"
    remaining -= estimate_tokens(heading) + 1
    if remaining <= 0:
        return [], 0
    taken: list[_Part] = []
    for chapter in reversed([c for c in chapters if c.number <= current.number]):
        paragraphs = [p for p in chapter.text.split("\n\n") if p.strip()]
        kept: list[str] = []
        for paragraph in reversed(paragraphs):
            tokens = estimate_tokens(paragraph) + 1
            if tokens > remaining:
                if not taken and not kept:
                    end = _tail(paragraph, remaining - 1)
                    if end:
                        kept.insert(0, end)
                        remaining -= estimate_tokens(end) + 1
                break
            kept.insert(0, paragraph)
            remaining -= tokens
        if kept:
            taken.insert(0, _Part("seiten", f"Kapitel {chapter.number}", "\n\n".join(kept)))
        if len(kept) < len(paragraphs):
            break
    if not taken:
        return [], remaining + estimate_tokens(heading) + 1
    first = taken[0]
    taken[0] = _Part(first.kind, first.label, f"{heading}\n\n{first.text}")
    return taken, remaining


def _category_rank(entry: CanonEntry) -> tuple[int, str]:
    """Stable order for filling: category order of the data model, then name."""
    return (CATEGORIES.index(entry.category), entry.name.casefold())


def _in_category_order(entries: Iterable[CanonEntry]) -> list[CanonEntry]:
    return sorted(entries, key=_category_rank)

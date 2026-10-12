"""``ContextBuilder``: one AI request under a fixed token budget (ADR-003, ADR-010).

Order of precedence: (1) frame, world, writing mode, atmospheric writing style (step 5.6),
all rules and the timeline; (2) entries named with ``@``, the characters the author leads and
the facts of the story; (3) overall
summary and chapter summaries; (4) the last manuscript pages verbatim, then further canon
entries of the world until the budget is used (precision before step 3.2,
docs/architecture.md section 3). If (1)-(3) and the instruction do not fit, the request is
refused - nothing the author named is left out silently.

A continuation goes on right after the chapter's last words (step 5.8): a short note before the
instruction quotes the end of the current chapter and asks for no opening that re-introduces
place and situation.

Requirements follow the instruction (steps 5.8, 5.15): write only what the instruction asks
for, in the length the author chose; what summary or timeline tell about events after the
writing point lies in the future and is neither told nor hinted at; no sentences, images or
gestures repeated from the last pages; no closing sentence. A finished story's summary used to
pull proposals towards its known end, and taken-over proposals were copied ever more closely.

If the author leads characters (FR-012), a short reminder of that rule comes last: the rule in
the fixed part alone was often broken (step 3.3), and the end of a request weighs more for the
model. What the instruction says the led character does or says is written out exactly, nothing
beyond it (owner, step 5.15).

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

Layout of the package (step 7.1): ``parts`` holds what every request shares (budget, parts,
rendering), ``writing`` the pieces of the writing-on request, ``summaries`` the two summary
requests and ``worldbuilder`` the world builder's request. This module keeps the facade
``ContextBuilder`` and the canon filler with its share (``CANON_SHARE``, ADR-062), which tests
and spikes adjust here.
"""

import math
from collections.abc import Sequence
from typing import Final

from skriptorium.canon import CanonService, InvalidInput, NotFound
from skriptorium.context.describe import build_entry_image_description, build_map_description
from skriptorium.context.parts import (
    MAX_BUDGET,
    SAFETY_MARGIN,
    BuiltContext,
    Known,
    Part,
    Role,
    category_rank,
    check_budget,
    in_category_order,
    render,
    render_known,
)
from skriptorium.context.summaries import (
    build_chapter_summary,
    build_story_summary,
    chapter_summary_room,
)
from skriptorium.context.worldbuilder import build_worldbuilder
from skriptorium.context.writing import (
    DEFAULT_LENGTH,
    Length,
    Request,
    assemble,
    closing_parts,
    fixed_parts,
    last_pages,
    lookup,
    opening,
    remaining_room,
    requirements,
    seam,
    story_state,
    tail,
)
from skriptorium.manuscript import ManuscriptService, Story

# Share of the capacity that not-named canon entries get before the last pages (step 6.3,
# ADR-062); what does not fit there fills the rest after the pages, as before.
CANON_SHARE: Final = 0.3

# Private helpers that tests and spikes reach for under these names.
_opening = opening
_tail = tail
_render = render
_requirements = requirements
_seam = seam


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
        length: Length = DEFAULT_LENGTH,
    ) -> BuiltContext:
        """Build the request for writing on in ``chapter_number``.

        ``references`` are identifiers of canon entries named with ``@``: entries of the story's
        world or guests bound into the story. ``length`` is the length the author chose for the
        proposal (step 5.15).

        Raises:
            InvalidInput: Budget outside 1-30,000 or empty instruction.
            NotFound: World, story, chapter or a referenced entry does not exist in the world
                or among the story's guests.
            ContextTooLarge: Precedence 1-3 and the instruction do not fit the budget.
        """
        check_budget(budget)
        if not instruction.strip():
            raise InvalidInput("Anweisung fehlt")
        request = self._load_request(world_id, story_id, chapter_number, references)
        fixed = fixed_parts(request)
        state = story_state(request.story, request.chapters, chapter_number)
        closing = closing_parts(request, instruction, length)
        remaining = remaining_room([*fixed, *state, *closing], budget)
        canon_room = min(remaining, math.floor(budget / SAFETY_MARGIN * CANON_SHARE))
        canon = _filler_parts(request, canon_room)
        remaining -= sum(part.block.tokens for part in canon)
        pages, remaining = last_pages(request.chapters, request.current, remaining)
        filler = _filler_parts(request, remaining)
        return assemble([*fixed, *canon, *filler], [*state, *pages, *closing], request.missing)

    def _load_request(
        self, world_id: str, story_id: str, chapter_number: int, references: Sequence[str]
    ) -> Request:
        """Read what the sources draw on and resolve the ``@`` references."""
        world = self._canon.get_world(world_id)
        story = self._manuscripts.get_story(world_id, story_id)
        chapters = self._manuscripts.list_chapters(world_id, story_id)
        current = self._manuscripts.get_chapter(world_id, story_id, chapter_number)
        entries = self._canon.list_entries(world_id)
        guests = self._guests(story)
        by_id = {entry.id: Known(entry) for entry in entries} | {g.entry.id: g for g in guests}
        named = [lookup(by_id, reference) for reference in references]
        return Request(world, story, chapters, current, entries, guests, by_id, named)

    def _guests(self, story: Story) -> list[Known]:
        """The guest entries of ``story``; a guest whose entry or world is gone is skipped."""
        guests: list[Known] = []
        for link in story.guest_links:
            try:
                entry = self._canon.get_entry(link.world, link.entry)
                home = self._canon.get_world(link.world).name
            except NotFound:
                continue
            guests.append(Known(entry, home))
        return guests

    def build_worldbuilder(
        self,
        world_id: str,
        conversation: Sequence[tuple[Role, str]],
        references: Sequence[str] = (),
        budget: int = MAX_BUDGET,
    ) -> BuiltContext:
        """Request for the next answer of the world builder (step 6.7); see
        :func:`skriptorium.context.worldbuilder.build_worldbuilder`."""
        return build_worldbuilder(self._canon, world_id, conversation, references, budget)

    def build_entry_image_description(
        self, world_id: str, entry_id: str, image: str, budget: int = MAX_BUDGET
    ) -> BuiltContext:
        """Request to describe an image of a canon entry once (step 7.13); see
        :func:`skriptorium.context.describe.build_entry_image_description`."""
        return build_entry_image_description(self._canon, world_id, entry_id, image, budget)

    def build_map_description(
        self, world_id: str, file: str, budget: int = MAX_BUDGET
    ) -> BuiltContext:
        """Request to describe a map of a world once (step 7.13); see
        :func:`skriptorium.context.describe.build_map_description`."""
        return build_map_description(self._canon, world_id, file, budget)

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
        return build_chapter_summary(
            self._canon, self._manuscripts, world_id, story_id, chapter_number, budget
        )

    def chapter_summary_room(
        self, world_id: str, story_id: str, chapter_number: int, budget: int = MAX_BUDGET
    ) -> int:
        """Longest chapter text (characters, without outer whitespace) whose short summary still
        fits the budget (step 6.1); depends on the overall summary so far.

        Raises:
            InvalidInput: Budget outside 1-30,000.
            NotFound: World, story or chapter does not exist.
        """
        return chapter_summary_room(
            self._canon, self._manuscripts, world_id, story_id, chapter_number, budget
        )

    def build_story_summary(
        self, world_id: str, story_id: str, chapter_number: int, budget: int = MAX_BUDGET
    ) -> BuiltContext:
        """Build the request that continues the overall summary with ``chapter_number``.

        Raises:
            InvalidInput: Budget outside 1-30,000 or the chapter has no summary yet.
            NotFound: World, story or chapter does not exist.
            ContextTooLarge: Overall and chapter summary do not fit the budget.
        """
        return build_story_summary(
            self._canon, self._manuscripts, world_id, story_id, chapter_number, budget
        )


def _filler_parts(request: Request, remaining: int) -> list[Part]:
    """Further entries of the world, then guests, while they fit into ``remaining``.

    Taken entries count as included, so a second call (after the last pages) adds only the rest.
    """
    filler: list[Part] = []
    candidates = [Known(entry) for entry in in_category_order(request.entries)]
    candidates += sorted(request.guests, key=lambda g: category_rank(g.entry))
    for known in candidates:
        if known.key in request.included:
            continue
        part = Part("auffuellung", known.entry.name, render_known(known))
        if part.block.tokens <= remaining:
            filler.append(part)
            remaining -= part.block.tokens
            request.included.add(known.key)
    return filler

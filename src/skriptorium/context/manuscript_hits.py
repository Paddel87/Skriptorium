"""Passages of the manuscript that mention a name (roadmap step 8.9, ADR-087).

The world builder can write a canon entry from what the stories already say about a figure or
an object. This module searches the chapters of a world for a name - and, if the canon holds an
entry of that name or alias, for all its names - and picks the passages that go into the
request. It only reads; nothing found is stored.

A passage is a paragraph (separated by a blank line) that contains a search term as a whole
word, in any case. Too many passages are thinned out to ``MAX_HITS_TOKENS``: the first and last
three stay, the rest is spread evenly between them.
"""

import re
from collections import deque
from collections.abc import Iterator, Sequence
from dataclasses import dataclass
from typing import Final

from skriptorium.canon import CanonService, InvalidInput, name_pattern
from skriptorium.context.parts import estimate_tokens
from skriptorium.manuscript import Chapter, ManuscriptService, Story

# Upper bound of the findings part of a request, summaries included (ADR-087).
MAX_HITS_TOKENS: Final = 12_000
# Paragraphs longer than this are cut around the first match.
MAX_PARAGRAPH_CHARS: Final = 1_200
_EDGE: Final = 3
_PARAGRAPHS = re.compile(r"\n\s*\n")


@dataclass(frozen=True)
class HitsQuery:
    """What to look for: ``name``; ``story`` limits the search to one story (``None``: all)."""

    name: str
    story: str | None = None


@dataclass(frozen=True)
class Passage:
    """One paragraph with its place in the manuscript and the chapter's short summary."""

    story: str
    number: int
    title: str
    summary: str
    text: str


@dataclass(frozen=True)
class ManuscriptHits:
    """All passages found (counts) and the ones that go into the request."""

    name: str
    total: int
    stories: int
    chapters: int
    passages: tuple[Passage, ...]

    @property
    def included(self) -> int:
        return len(self.passages)

    @property
    def text(self) -> str:
        """The system part for the request; empty without passages."""
        return render_hits(self.name, self.passages)

    @property
    def tokens(self) -> int:
        """Estimated tokens of :attr:`text` (with the separator that follows it)."""
        return _tokens(self.text)


def find_hits(
    canon: CanonService, manuscripts: ManuscriptService, world_id: str, query: HitsQuery
) -> ManuscriptHits:
    """Search the manuscript of ``world_id`` for ``query``.

    Raises:
        InvalidInput: Empty name.
        NotFound: World or story does not exist.
    """
    name = query.name.strip()
    if not name:
        raise InvalidInput("Name fehlt")
    canon.get_world(world_id)
    if query.story is None:
        stories = manuscripts.list_stories(world_id)
    else:
        stories = [manuscripts.get_story(world_id, query.story)]
    pattern = _pattern(_terms(canon, world_id, name))
    found: list[Passage] = []
    for story in stories:
        for chapter in sorted(manuscripts.list_chapters(world_id, story.id), key=_number):
            found.extend(_passages(story, chapter, pattern))
    chapters = {(passage.story, passage.number) for passage in found}
    return ManuscriptHits(
        name=name,
        total=len(found),
        stories=len({story for story, _ in chapters}),
        chapters=len(chapters),
        passages=tuple(_select(name, found)),
    )


def render_hits(name: str, passages: Sequence[Passage]) -> str:
    """Findings as Markdown: one section per chapter, its summary first, then the paragraphs."""
    if not passages:
        return ""
    lines = [
        f"# Fundstellen im Manuskript zu „{name}“",
        "",
        "Aus dem Manuskript des Autors; was hier steht, ist in der Geschichte geschehen. "
        "Nichts dazuerfinden.",
    ]
    place: tuple[str, int] | None = None
    for passage in passages:
        if (passage.story, passage.number) != place:
            place = (passage.story, passage.number)
            lines += ["", f"## {passage.story}, Kapitel {passage.number}: {passage.title}"]
            if passage.summary.strip():
                lines += ["", f"Kurzfassung: {passage.summary.strip()}"]
        lines += ["", passage.text]
    return "\n".join(lines)


def _number(chapter: Chapter) -> int:
    return chapter.number


def _tokens(text: str) -> int:
    return estimate_tokens(text + "\n\n") if text else 0


def _terms(canon: CanonService, world_id: str, name: str) -> list[str]:
    """The name, then name and aliases of every entry of the world that answers to it."""
    terms = [name]
    for entry in canon.list_entries(world_id):
        names = [entry.name, *entry.aliases]
        if name.casefold() in (candidate.casefold() for candidate in names):
            terms += names
    unique: dict[str, str] = {}
    for term in terms:
        unique.setdefault(term.casefold(), term)
    return list(unique.values())


def _pattern(terms: Sequence[str]) -> re.Pattern[str]:
    """Whole-word match of any term by the rule of ``canon.name_pattern`` (step 9.1), also in
    the German genitive ("Kaels", "Klaus'"); the longest name wins."""
    return name_pattern(terms)


def _passages(story: Story, chapter: Chapter, pattern: re.Pattern[str]) -> Iterator[Passage]:
    for raw in _PARAGRAPHS.split(chapter.text):
        paragraph = raw.strip()
        match = pattern.search(paragraph)
        if match is not None:
            text = _shorten(paragraph, match.start())
            yield Passage(story.title, chapter.number, chapter.title, chapter.summary, text)


def _shorten(paragraph: str, at: int) -> str:
    """Cut a very long paragraph to about ``MAX_PARAGRAPH_CHARS`` around position ``at``."""
    if len(paragraph) <= MAX_PARAGRAPH_CHARS:
        return paragraph
    start = max(0, min(at - MAX_PARAGRAPH_CHARS // 2, len(paragraph) - MAX_PARAGRAPH_CHARS))
    end = start + MAX_PARAGRAPH_CHARS
    return f"{'…' if start else ''}{paragraph[start:end]}{'…' if end < len(paragraph) else ''}"


def _select(name: str, found: Sequence[Passage]) -> list[Passage]:
    """All passages if they fit ``MAX_HITS_TOKENS``; else first, last and evenly spread ones."""
    if _tokens(render_hits(name, found)) <= MAX_HITS_TOKENS:
        return list(found)
    chosen: list[int] = []
    for index in _priority(len(found)):
        trial = sorted([*chosen, index])
        if _tokens(render_hits(name, [found[i] for i in trial])) > MAX_HITS_TOKENS:
            break
        chosen = trial
    return [found[i] for i in chosen]


def _priority(count: int) -> Iterator[int]:
    """Order in which passages are taken: the first and last three, then by bisection, which
    spreads the rest evenly."""
    edge = [*range(min(_EDGE, count)), *range(max(_EDGE, count - _EDGE), count)]
    yield from edge
    queue = deque([(_EDGE - 1, count - _EDGE)])
    while queue:
        low, high = queue.popleft()
        if high - low > 1:
            middle = (low + high) // 2
            yield middle
            queue.extend([(low, middle), (middle, high)])

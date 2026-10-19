"""Sections of a canon entry or world description (step 9.1, ADR-091, rule 003).

The same rule as ``ui/src/sections.ts``; both sides are checked against the shared cases in
``tests/shared/sections.json``. A section starts at a heading of any level (``#`` to ``######``)
and reaches up to the next heading of the same or a higher level, so subsections (``### Kleidung``
under ``## Aussehen``) belong to it. A closing run of ``#`` after a space is not part of the
heading text; headings inside fenced code blocks do not count. Names are compared without regard
to case. Everything outside the section stays as it was, byte for byte (line endings, blank lines).

The section names of each category stand in :data:`SECTIONS` (ADR-092); templates of new entries,
the Markdown import and the world builder's frame take them from here. For the request to the AI
:func:`drop_empty_sections` and :func:`nest_headings` shape the text of an entry by the same rule.
"""

import re
from dataclasses import dataclass
from typing import Final, Literal

from skriptorium.canon.categories import Category

# Whitespace as JavaScript's ``trim`` sees it, so both sides cut the same characters.
_SPACE: Final = "\t\n\v\f\r " + "".join(
    map(
        chr,
        (0x00A0, 0x1680, *range(0x2000, 0x200B), 0x2028, 0x2029, 0x202F, 0x205F, 0x3000, 0xFEFF),
    )
)
# Only the start is a pattern; the rest is cut with string operations, because a pattern for the
# closing hashes backtracks on long runs of spaces (review of step 6.8).
_HEADING_START: Final = re.compile(r"(#{1,6})[ \t]+")
_FENCE: Final = re.compile(r"[ \t]*(?:```|~~~)")
_LINE: Final = re.compile(r"[^\n]*\n|[^\n]+\Z")
_LIST_MARK: Final = re.compile("^[" + _SPACE + "]*[-*][" + _SPACE + "]+")
# Characters JavaScript's "." does not match: a heading line must not contain them.
_LINE_BREAKS: Final = "\r" + chr(0x2028) + chr(0x2029)

APPEARANCE: Final = "Aussehen"
"""The looks of a figure, a place or an item (ADR-078, ADR-092)."""
RELATIONS: Final = "Beziehungen"
"""The relations of a figure, one list line with one ``@Name`` each (ADR-093)."""

SECTIONS: Final[dict[Category, tuple[str, ...]]] = {
    "figur": (APPEARANCE, "Wesen", "Fähigkeiten", "Geschichte", RELATIONS),
    "ort": ("Lage", APPEARANCE, "Bewohner", "Geschichte"),
    "gegenstand": (APPEARANCE, "Zweck", "Verwendung", "Auswirkung"),
    "kultur": ("Gesellschaft", "Glaube und Bräuche", "Geschichte"),
}
"""Fixed sections of an entry by category, in order (FR-003, ADR-092); rules and the timeline
have none. The interface mirrors this list (``ui/src/sections.ts``, rule 003)."""

FORMER_SECTIONS: Final[dict[Category, tuple[str, ...]]] = {
    "figur": ("Wesen und Geschichte",),
}
"""Former names of sections, still read as such by the import but no longer in templates
(ADR-083: "Wesen und Geschichte" of a figure, since ADR-092 split into Wesen and Geschichte)."""

_NAMES: Final[dict[Category, frozenset[str]]] = {
    category: frozenset(name.lower() for name in (*names, *FORMER_SECTIONS.get(category, ())))
    for category, names in SECTIONS.items()
}
_ALL_NAMES: Final = frozenset(name for names in _NAMES.values() for name in names)

SectionMode = Literal["replace", "append"]
"""What to do with a section that already has text."""


@dataclass(frozen=True)
class _Found:
    start: int
    """Index of the heading line."""
    end: int
    """Index after the last line of the section."""
    level: int


def is_section_name(text: str, category: Category | None = None) -> bool:
    """Whether ``text`` is the name of a fixed section, in any case.

    With ``category`` only the sections of that category count (its former names too, ADR-092);
    without one the sections of all categories do.
    """
    name = _trim(text).lower()
    return name in _ALL_NAMES if category is None else name in _NAMES.get(category, frozenset())


def template_for(category: Category) -> str:
    """The empty sections of a new entry of ``category``, or ``""`` if it has none."""
    names = SECTIONS.get(category, ())
    return "\n\n".join(f"## {name}" for name in names) + "\n" if names else ""


def drop_empty_sections(markdown: str) -> str:
    """``markdown`` without the sections that have no text (step 9.3, ADR-092).

    A section without text is a heading whose lines up to the next heading of the same or a
    higher level hold nothing but blanks and deeper headings, so a section with only empty
    subsections goes with them. Everything else stays as it was, byte for byte.
    """
    lines = _lines_of(markdown)
    headings = _headings(lines)
    kept: list[str] = []
    at = 0
    while at < len(lines):
        head = headings[at]
        end = _section_end(headings, at, head[0]) if head is not None else at + 1
        if head is not None and all(
            headings[i] is not None or _is_blank(lines[i]) for i in range(at + 1, end)
        ):
            at = end
        else:
            kept.append(lines[at])
            at += 1
    return "".join(kept)


def nest_headings(markdown: str, top: int) -> str:
    """``markdown`` with its headings moved down until none is flatter than level ``top``.

    The distances between the headings stay, no level goes beyond 6 (step 9.3, ADR-092). A text
    without headings, or whose flattest heading is at ``top`` or deeper, stays as it was, byte
    for byte; the rest of a heading line does too.
    """
    lines = _lines_of(markdown)
    headings = _headings(lines)
    shift = top - min((head[0] for head in headings if head is not None), default=top)
    if shift <= 0:
        return markdown
    return "".join(
        line if head is None else "#" * min(head[0] + shift, 6) + line[head[0] :]
        for line, head in zip(lines, headings, strict=True)
    )


def read_section(markdown: str, heading: str) -> str | None:
    """The first section called ``heading`` that has text, or ``None`` (blanks cut)."""
    lines = _lines_of(markdown)
    for section in _sections_named(lines, heading):
        text = _body_of(lines, section)
        if text:
            return text
    return None


def read_labelled(markdown: str, label: str) -> str | None:
    """The text after a list label such as ``- **Aussehen:** …``, or ``None`` without one."""
    for line in markdown.split("\n"):
        plain = _trim(_LIST_MARK.sub("", line, count=1).replace("**", ""))
        if plain.lower().startswith(f"{label.lower()}:"):
            text = _trim(plain[len(label) + 1 :])
            return text or None
    return None


def read_part(markdown: str, name: str) -> str | None:
    """A part of an entry: the section ``name``, else the labelled line, else ``None``."""
    found = read_section(markdown, name)
    return found if found is not None else read_labelled(markdown, name)


def append_section(markdown: str, heading: str, text: str) -> str:
    """``markdown`` with a new ``## heading`` section at its end, after a blank line."""
    eol = _ending_of(markdown)
    before = markdown.rstrip(_SPACE)
    section = f"## {heading}{eol}{eol}{_trim(text)}{eol}"
    return section if before == "" else f"{before}{eol}{eol}{section}"


def put_section(markdown: str, heading: str, text: str, mode: SectionMode) -> str:
    """Puts ``text`` into the section ``heading``.

    The first one with text (else the first one) takes it, replacing what was there or below it
    (``mode``); empty duplicates are removed, so afterwards only one is left. Without such a
    section, one is appended.
    """
    lines = _lines_of(markdown)
    found = _sections_named(lines, heading)
    target = next((one for one in found if _body_of(lines, one)), found[0] if found else None)
    if target is None:
        return append_section(markdown, heading, text)
    gone = [
        one
        for one in _outermost(found)
        if one != target and not _body_of(lines, one) and not target.start < one.start < target.end
    ]
    eol = _ending_of(markdown)
    head = lines[target.start]
    body = lines[target.start + 1 : target.end]
    last = len(body)
    while last > 0 and _is_blank(body[last - 1]):
        last -= 1
    gap = body[last:]
    followed = any(
        not any(one.start <= at < one.end for one in gone) for at in range(target.end, len(lines))
    )
    if not gap and followed:
        gap.append(eol)
    if mode == "append":
        kept = body[:last]
        middle = [*kept[:-1], _terminated(kept[-1] if kept else "", eol), eol]
    else:
        middle = [eol]
    first = head if head.endswith("\n") else f"{head}{eol}"
    block = [first, *middle, f"{_trim(text)}{eol}", *gap]
    edits = [(target.start, target.end, block), *((one.start, one.end, []) for one in gone)]
    return _rebuild(lines, edits)


def _trim(text: str) -> str:
    return text.strip(_SPACE)


def _lines_of(markdown: str) -> list[str]:
    """The lines of a text, each with its line ending."""
    return _LINE.findall(markdown)


def _heading_of(line: str) -> tuple[int, str] | None:
    """Level and text of an ATX heading; a closing run of ``#`` after a space is cut off."""
    bare = line.removesuffix("\n").removesuffix("\r") if line.endswith("\n") else line
    start = _HEADING_START.match(bare)
    if start is None:
        return None
    rest = bare[start.end() :]
    if any(mark in rest for mark in _LINE_BREAKS):
        return None
    level = len(start.group(1))
    text = rest.rstrip(" \t")
    open_part = text.rstrip("#")
    if open_part == "":
        return level, ""
    if open_part != text and open_part[-1] in " \t":
        return level, open_part.rstrip(" \t")
    return level, text


def _headings(lines: list[str]) -> list[tuple[int, str] | None]:
    """Level and text of each line that is a heading, outside fenced code blocks."""
    result: list[tuple[int, str] | None] = []
    in_fence = False
    for line in lines:
        if _FENCE.match(line):
            in_fence = not in_fence
            result.append(None)
        else:
            result.append(None if in_fence else _heading_of(line))
    return result


def _sections_named(lines: list[str], heading: str) -> list[_Found]:
    """All sections called ``heading`` (any case, any level), in order."""
    headings = _headings(lines)
    wanted = _trim(heading).lower()
    found: list[_Found] = []
    for start, head in enumerate(headings):
        if head is None or _trim(head[1]).lower() != wanted:
            continue
        found.append(_Found(start, _section_end(headings, start, head[0]), head[0]))
    return found


def _section_end(headings: list[tuple[int, str] | None], start: int, level: int) -> int:
    """Index after the last line of the section whose heading of ``level`` is at ``start``."""
    end = start + 1
    while end < len(headings):
        following = headings[end]
        if following is not None and following[0] <= level:
            break
        end += 1
    return end


def _body_of(lines: list[str], section: _Found) -> str:
    return _trim("".join(lines[section.start + 1 : section.end]))


def _is_blank(line: str) -> bool:
    return _trim(line) == ""


def _ending_of(markdown: str) -> str:
    return "\r\n" if "\r\n" in markdown else "\n"


def _outermost(found: list[_Found]) -> list[_Found]:
    """Without the sections that lie inside another one of the list."""
    return [
        one
        for one in found
        if not any(other != one and other.start < one.start < other.end for other in found)
    ]


def _terminated(line: str, eol: str) -> str:
    return line if line == "" or line.endswith("\n") else f"{line}{eol}"


def _rebuild(lines: list[str], edits: list[tuple[int, int, list[str]]]) -> str:
    """The lines with the given ranges replaced; ranges must not overlap."""
    out: list[str] = []
    at = 0
    for start, end, block in sorted(edits, key=lambda edit: edit[0]):
        out += [*lines[at:start], *block]
        at = end
    out += lines[at:]
    return "".join(out)

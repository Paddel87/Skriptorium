"""Split Markdown world material into canon entries (rules confirmed by the owner in 2.4).

1. Every heading that is not a group heading and has no entry heading above it starts an
   entry; its name is the heading text. Deeper headings stay in the entry's body.
2. A group heading is a heading whose text names a category (e.g. "Figuren", "Orte"), or a
   heading without own text that has subheadings (e.g. "Sonstiges"). Exception (step 4.16): a
   heading whose subheadings are only the item sections Zweck, Verwendung and Auswirkung
   (FR-003) or the figure section Aussehen (step 7.16) is an entry, even without own text.
   Entries below a group heading that names a category get that category; a line
   ``Kategorie: …`` in the entry takes precedence. Entries without a recognised category get none.
3. A line ``Aliasse: …`` or ``Auch genannt: …`` gives the aliases (separated by commas or
   semicolons) and is removed from the body, as is the ``Kategorie:`` line.
4. Text before the first heading is the introduction (appended to the world description);
   text of group headings is reported as not taken over.
5. A heading Zweck, Verwendung, Auswirkung or Aussehen never starts an entry of its own: standing
   on the same level as the entry before it, it becomes a section of that entry (step 7.9; the
   world builder's model wrote them so; Aussehen since step 7.16, ADR-078).

Headings inside fenced code blocks are ignored.
"""

import re
from dataclasses import dataclass, field
from typing import Final

from skriptorium.canon.categories import Category, category_for

# Only the start is a pattern; the end is cut with string operations, because a pattern for
# the closing hashes backtracks cubically on long runs of spaces (review of step 6.8).
_HEADING_START: Final = re.compile(r"(#{1,6})[ \t]")
# Section titles of an item entry (FR-003); the canon module creates new items with them.
_ITEM_SECTIONS: Final = frozenset({"zweck", "verwendung", "auswirkung", "aussehen"})
_FENCE: Final = re.compile(r"^[ \t]*(```|~~~)")
_FIELD: Final = re.compile(
    r"^[ \t]*(?:[-*][ \t]+)?(?:\*\*|__)?(aliasse|auch genannt|kategorie)[ \t]*:[ \t]*(?:\*\*|__)?"
    r"[ \t]*(.*?)[ \t]*$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class ParsedEntry:
    """One entry found in the material."""

    name: str
    category: Category | None
    aliases: tuple[str, ...]
    body: str


@dataclass(frozen=True)
class ParsedMaterial:
    """Result of splitting the material; nothing is stored yet."""

    introduction: str
    entries: tuple[ParsedEntry, ...]
    not_taken_over: tuple[str, ...] = field(default=())


@dataclass
class _Section:
    level: int
    title: str
    lines: list[str]
    children: list[_Section]


def parse_markdown(text: str) -> ParsedMaterial:
    """Split Markdown ``text`` into an introduction and canon entries."""
    root = _Section(level=0, title="", lines=[], children=[])
    stack = [root]
    in_fence = False
    for line in text.replace("\r\n", "\n").split("\n"):
        if _FENCE.match(line):
            in_fence = not in_fence
        heading = None if in_fence else _heading(line)
        if heading is None:
            stack[-1].lines.append(line)
            continue
        level, title = heading
        while stack[-1].level >= level:
            stack.pop()
        section = _Section(level=level, title=title, lines=[], children=[])
        stack[-1].children.append(section)
        stack.append(section)

    _attach_item_sections(root)
    entries: list[ParsedEntry] = []
    not_taken_over: list[str] = []
    for child in root.children:
        _collect(child, None, entries, not_taken_over)
    return ParsedMaterial(
        introduction=_trimmed(root.lines),
        entries=tuple(entries),
        not_taken_over=tuple(not_taken_over),
    )


def _heading(line: str) -> tuple[int, str] | None:
    """Level and title of an ATX heading; closing hashes and spaces are not part of the title."""
    start = _HEADING_START.match(line)
    if start is None:
        return None
    rest = line[start.end() :]
    if not rest:
        return None
    full = rest.rstrip(" \t")
    title = full.rstrip("#").rstrip(" \t").strip()
    # A title of hashes only keeps one of them, as before.
    return len(start.group(1)), title or full.strip()[:1]


def _collect(
    section: _Section,
    group_category: Category | None,
    entries: list[ParsedEntry],
    not_taken_over: list[str],
) -> None:
    own_text = _trimmed(section.lines)
    named = category_for(section.title)
    if named is None and _has_only_item_sections(section):
        entries.append(_entry(section, group_category))
        return
    if named is not None or (not own_text and section.children):
        if own_text:
            not_taken_over.append(f"{section.title}: {own_text}")
        for child in section.children:
            _collect(child, named or group_category, entries, not_taken_over)
        return
    entries.append(_entry(section, group_category))


def _attach_item_sections(section: _Section) -> None:
    """Move item sections that stand beside an entry into that entry (rule 5)."""
    kept: list[_Section] = []
    for child in section.children:
        previous = kept[-1] if kept else None
        if (
            previous is not None
            and _is_item_section(child)
            and not _is_item_section(previous)
            and category_for(previous.title) is None
        ):
            _shift(child, previous.level + 1 - child.level)
            previous.children.append(child)
        else:
            kept.append(child)
    section.children = kept
    for child in kept:
        _attach_item_sections(child)


def _is_item_section(section: _Section) -> bool:
    return section.title.strip("*_: ").casefold() in _ITEM_SECTIONS


def _shift(section: _Section, by: int) -> None:
    section.level += by
    for child in section.children:
        _shift(child, by)


def _has_only_item_sections(section: _Section) -> bool:
    """Whether all subheadings are the sections of an item entry (FR-003, step 4.16)."""
    return bool(section.children) and all(_is_item_section(c) for c in section.children)


def _entry(section: _Section, group_category: Category | None) -> ParsedEntry:
    aliases: list[str] = []
    category = group_category
    body_lines: list[str] = []
    for line in _flatten(section):
        match = _FIELD.match(line)
        if match is None:
            body_lines.append(line)
        elif match.group(1).lower() == "kategorie":
            category = category_for(match.group(2)) or category
        else:
            aliases.extend(a.strip() for a in re.split(r"[,;]", match.group(2)) if a.strip())
    return ParsedEntry(
        name=section.title,
        category=category,
        aliases=tuple(aliases),
        body=_trimmed(body_lines),
    )


def _flatten(section: _Section) -> list[str]:
    """Own lines plus all subsections with their headings, in document order."""
    lines = list(section.lines)
    for child in section.children:
        lines.append(f"{'#' * child.level} {child.title}")
        lines.extend(_flatten(child))
    return lines


def _trimmed(lines: list[str]) -> str:
    text = "\n".join(lines).strip("\n")
    return f"{text}\n" if text.strip() else ""

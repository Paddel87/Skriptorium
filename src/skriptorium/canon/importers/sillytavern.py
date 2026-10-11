"""SillyTavern files: translate them into the Markdown import format (step 6.8, ADR-065) and
write canon in their formats (step 6.9, ADR-066).

Accepted: a character card as JSON or as PNG (tEXt chunk ``ccv3`` before ``chara``, base64 of
UTF-8 JSON; spec V1-V3) and a lorebook as JSON (``lorebook_v3``, a card's ``character_book`` or
SillyTavern's own world info with ``entries`` keyed by uid). The result goes into the import
field; the author confirms it in the usual preview, so nothing is stored here.

Rules confirmed by the owner (ADR-065):

1. A card becomes one entry of the category Figur: name from ``name``, alias from ``nickname``,
   text from ``description`` plus ``personality`` as section "Wesen". Everything made for the
   chat (scenario, greetings, example dialogues, system prompts, creator notes, tags) is left
   out and reported.
2. A lorebook entry becomes an entry without category: name from ``name`` or ``comment``, else
   its first key; its keys become aliases; text from ``content``. Disabled or empty entries are
   left out and reported.
3. ``{{char}}`` becomes the card's name; ``{{user}}`` stays and is reported.
4. A lorebook entry written by the Skriptorium carries its category in
   ``extensions.skriptorium.kategorie`` (ADR-066); it is taken over, and such an entry is kept
   even without text.

The text is protected against the Markdown rules of the import: headings in it move just far
enough that the highest lands below the entry heading (level 3), keeping their distances; open
code fences are closed; lines that would read as a field (``Aliasse:``, ``Kategorie:``, also
inside code fences) are kept as text; and an entry whose text starts with a heading gets an
invisible first line, so it does not turn into a group. Names that would name a category or
yield no identifier are changed and reported. Text written by the export (ADR-066) with headings
from level 3 on therefore comes back unchanged.
"""

import base64
import binascii
import json
import re
import struct
from collections.abc import Iterable
from dataclasses import dataclass
from typing import Final, Protocol

from skriptorium.canon.categories import CATEGORIES, Category, category_for
from skriptorium.storage import InvalidInput, slugify

MAX_BYTES: Final = 10 * 1024 * 1024
MAX_ENTRIES: Final = 1000
_PNG_SIGNATURE: Final = b"\x89PNG\r\n\x1a\n"
_CARD_CHUNKS: Final = ("ccv3", "chara")
_CARD_SPECS: Final = frozenset({"chara_card_v2", "chara_card_v3"})
# Fields of a card made for the chat, reported as not taken over (rule 1).
_CHAT_FIELDS: Final = (
    ("scenario", "Szenario"),
    ("first_mes", "Begrüßung"),
    ("alternate_greetings", "weitere Begrüßungen"),
    ("group_only_greetings", "Begrüßungen für Gruppen"),
    ("mes_example", "Beispieldialoge"),
    ("system_prompt", "Systemanweisung"),
    ("post_history_instructions", "Anweisung nach dem Verlauf"),
    ("creator_notes", "Notizen des Erstellers"),
    ("tags", "Schlagwörter"),
)
_CHAR: Final = re.compile(r"\{\{\s*char\s*\}\}|<bot>", re.IGNORECASE)
_USER: Final = re.compile(r"\{\{\s*user\s*\}\}|<user>", re.IGNORECASE)
_HEADING: Final = re.compile(r"^(#{1,6})([ \t])")
_FENCE: Final = re.compile(r"^[ \t]*(```|~~~)")
# Same words as the import's field lines (``canon.importers.markdown``).
_FIELD_LINE: Final = re.compile(
    r"^[ \t]*(?:[-*][ \t]+)?(?:\*\*|__)?(aliasse|auch genannt|kategorie)[ \t]*:", re.IGNORECASE
)
# Put before a line that would read as a field; invisible, so the text reads unchanged.
_KEEP_AS_TEXT: Final = "​"
# A lorebook's entries have no category; this group heading carries none (import rule 2).
_LOREBOOK_GROUP: Final = "Aus SillyTavern"
# Key under a lorebook entry's ``extensions`` for what only the Skriptorium reads (ADR-066).
_EXTENSION: Final = "skriptorium"


@dataclass(frozen=True)
class TranslatedMaterial:
    """Markdown for the import field and what was left out, in words for the author."""

    markdown: str
    not_taken_over: tuple[str, ...]


@dataclass(frozen=True)
class _Entry:
    name: str
    aliases: tuple[str, ...]
    body: str
    category: Category | None = None


def translate_sillytavern(data: bytes) -> TranslatedMaterial:
    """Translate a SillyTavern card (PNG or JSON) or lorebook (JSON) into import Markdown.

    Raises:
        InvalidInput: Too large, not a SillyTavern file, or broken; the message names no content.
    """
    if len(data) > MAX_BYTES:
        raise InvalidInput("Datei ist größer als 10 MB")
    document = _json(_card_from_png(data) if data.startswith(_PNG_SIGNATURE) else data)
    notes: list[str] = []
    if not isinstance(document, dict):
        raise InvalidInput("Keine Figurenkarte und kein Lorebook aus SillyTavern")
    card = _card(document)
    figure: _Entry | None = None
    lore: list[_Entry] = []
    if card is not None:
        figure = _figure(card, notes)
        book = card.get("character_book")
        if isinstance(book, dict):
            lore = _lorebook(book, figure.name, notes)
    else:
        book = document.get("data") if document.get("spec") == "lorebook_v3" else document
        if not isinstance(book, dict) or "entries" not in book:
            raise InvalidInput("Keine Figurenkarte und kein Lorebook aus SillyTavern")
        lore = _lorebook(book, None, notes)
    if figure is None and not lore:
        raise InvalidInput("Die Datei enthält keine übernehmbaren Einträge")
    users = sum(len(_USER.findall(e.body)) for e in [*([figure] if figure else []), *lore])
    if users:
        notes.append(f"„{{{{user}}}}“ steht {users}-mal im Text; bitte selbst passend umschreiben.")
    return TranslatedMaterial(markdown=_markdown(figure, lore), not_taken_over=tuple(notes))


def _card_from_png(data: bytes) -> bytes:
    """The card JSON from the tEXt chunk ``ccv3`` or ``chara``; other chunks are skipped."""
    found: dict[str, bytes] = {}
    at = len(_PNG_SIGNATURE)
    while at + 8 <= len(data):
        length, kind = struct.unpack(">I4s", data[at : at + 8])
        start, end = at + 8, at + 8 + length
        if end + 4 > len(data):
            break
        if kind == b"tEXt":
            keyword, _, text = data[start:end].partition(b"\x00")
            name = keyword.decode("latin-1").lower()
            if name in _CARD_CHUNKS and name not in found:
                found[name] = text
        if kind == b"IEND":
            break
        at = end + 4
    for name in _CARD_CHUNKS:
        if name in found:
            try:
                return base64.b64decode(b"".join(found[name].split()), validate=True)
            except binascii.Error, ValueError:
                raise InvalidInput("Die Figurenkarte im Bild ist beschädigt") from None
    raise InvalidInput("Das Bild enthält keine Figurenkarte aus SillyTavern")


def _json(raw: bytes) -> object:
    try:
        return json.loads(raw.decode("utf-8-sig"))
    except UnicodeDecodeError, ValueError, RecursionError:
        raise InvalidInput("Die Datei ist kein lesbares JSON") from None


def _card(document: dict[str, object]) -> dict[str, object] | None:
    """The card's fields: ``data`` of a V2/V3 card, or the document itself for V1."""
    if document.get("spec") in _CARD_SPECS:
        data = document.get("data")
        return data if isinstance(data, dict) else None
    if "spec" not in document and "name" in document and "entries" not in document:
        return document
    return None


def _figure(card: dict[str, object], notes: list[str]) -> _Entry:
    name = _usable(_line(_text(card.get("name"))), "Figur ohne Namen", "Figur", notes)
    nickname = _line(_text(card.get("nickname")))
    parts = [_protect(_replace_char(_text(card.get("description")), name))]
    personality = _replace_char(_text(card.get("personality")), name)
    if personality.strip():
        parts.append(f"### Wesen\n{_protect(personality)}")
    body = "\n\n".join(part for part in parts if part.strip())
    left_out = [label for field, label in _CHAT_FIELDS if _filled(card.get(field))]
    if left_out:
        notes.append(f"Nicht übernommen (Chat-Zubehör): {', '.join(left_out)}.")
    aliases = (nickname,) if nickname and nickname != name else ()
    return _Entry(name=name, aliases=aliases, body=body)


def _lorebook(book: dict[str, object], char: str | None, notes: list[str]) -> list[_Entry]:
    raw = book.get("entries")
    items = list(raw.values()) if isinstance(raw, dict) else raw if isinstance(raw, list) else []
    if len(items) > MAX_ENTRIES:
        raise InvalidInput(f"Mehr als {MAX_ENTRIES} Lorebook-Einträge")
    entries: list[_Entry] = []
    disabled = empty = 0
    for item in items:
        if not isinstance(item, dict):
            continue
        if item.get("enabled") is False or item.get("disable") is True:
            disabled += 1
            continue
        content = _text(item.get("content"))
        keys = _keys(item.get("keys", item.get("key")))
        category = _own_category(item)
        if not content.strip() and category is None:
            empty += 1
            continue
        name = _line(_text(item.get("name"))) or _line(_text(item.get("comment")))
        name = name or (keys[0] if keys else "")
        name = _usable(name, f"Eintrag {len(entries) + 1}", "Lorebook", notes)
        aliases = tuple(dict.fromkeys(k for k in keys if k.casefold() != name.casefold()))
        if char is not None:
            content = _replace_char(content, char)
        entries.append(
            _Entry(name=name, aliases=aliases, body=_protect(content), category=category)
        )
    if disabled:
        notes.append(
            "1 Lorebook-Eintrag ist in SillyTavern abgeschaltet und fehlt."
            if disabled == 1
            else f"{disabled} Lorebook-Einträge sind in SillyTavern abgeschaltet und fehlen."
        )
    if empty:
        notes.append(
            "1 Lorebook-Eintrag hat keinen Text und fehlt."
            if empty == 1
            else f"{empty} Lorebook-Einträge haben keinen Text und fehlen."
        )
    if char is None and any(_CHAR.search(e.body) for e in entries):
        notes.append("„{{char}}“ steht im Text, ohne dass eine Figur dazugehört.")
    return entries


def _markdown(figure: _Entry | None, lore: list[_Entry]) -> str:
    blocks: list[str] = []
    if figure is not None:
        blocks.append("# Figuren\n\n" + _entry_markdown(figure))
    if lore:
        blocks.append(f"# {_LOREBOOK_GROUP}\n\n" + "\n\n".join(_entry_markdown(e) for e in lore))
    return "\n\n".join(blocks) + "\n"


def _usable(name: str, fallback: str, kind: str, notes: list[str]) -> str:
    """A name the import keeps as an entry with an identifier."""
    if not name:
        return fallback
    try:
        slugify(name)
    except InvalidInput:
        notes.append(f"Ein Name ohne Buchstaben oder Ziffern heißt jetzt „{fallback}“.")
        return fallback
    if category_for(name) is not None:
        # A heading naming a category would turn into a group (import rule 2).
        return f"{name} ({kind})"
    return name


def _entry_markdown(entry: _Entry) -> str:
    lines = [f"## {entry.name}"]
    if entry.aliases:
        lines.append(f"Aliasse: {', '.join(entry.aliases)}")
    if entry.category is not None:
        lines.append(f"Kategorie: {entry.category}")
    body = entry.body.strip("\n")
    if body:
        if not entry.aliases and entry.category is None and _HEADING.match(body):
            # Without own text before a subheading the entry would become a group (import rule 2).
            lines.append(_KEEP_AS_TEXT)
        lines.append(body)
    return "\n".join(lines)


def _protect(text: str) -> str:
    """Text that the import keeps inside its entry (see module docstring)."""
    lines = text.replace("\r\n", "\n").split("\n")
    shift = max(0, 3 - min(_heading_levels(lines), default=3))
    out: list[str] = []
    in_fence = False
    for line in lines:
        if _FENCE.match(line):
            in_fence = not in_fence
        elif _FIELD_LINE.match(line):
            # The import reads field lines inside code fences too.
            line = _KEEP_AS_TEXT + line
        elif not in_fence:
            heading = _HEADING.match(line)
            if heading is not None:
                level = min(len(heading.group(1)) + shift, 6)
                line = "#" * level + line[len(heading.group(1)) :]
        out.append(line)
    if in_fence:
        out.append("```")
    # Lines of only spaces count as no text for the import; dropping them in front lets
    # ``_entry_markdown`` see a heading at the start.
    while out and not out[0].strip():
        out.pop(0)
    return "\n".join(out).strip("\n")


def _heading_levels(lines: list[str]) -> list[int]:
    """Levels of the headings outside code fences."""
    levels: list[int] = []
    in_fence = False
    for line in lines:
        if _FENCE.match(line):
            in_fence = not in_fence
        elif not in_fence and (heading := _HEADING.match(line)) is not None:
            levels.append(len(heading.group(1)))
    return levels


def _replace_char(text: str, name: str) -> str:
    return _CHAR.sub(lambda _: name, text)


def _keys(value: object) -> tuple[str, ...]:
    if not isinstance(value, list):
        return ()
    # Commas and semicolons separate aliases in the import (rule 3 there).
    keys = (_line(re.sub(r"[,;]", " ", k)) for k in value if isinstance(k, str))
    return tuple(k for k in keys if k)


def _text(value: object) -> str:
    return value if isinstance(value, str) else ""


def _line(text: str) -> str:
    """One line: whitespace collapsed, ``#`` at the ends removed (they would leave a heading)."""
    return " ".join(text.split()).strip("#").strip()


def _filled(value: object) -> bool:
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, list):
        return any(isinstance(v, str) and v.strip() for v in value)
    return False


def _own_category(item: dict[str, object]) -> Category | None:
    """The category a lorebook entry written by the Skriptorium carries (ADR-066)."""
    extensions = item.get("extensions")
    own = extensions.get(_EXTENSION) if isinstance(extensions, dict) else None
    category = own.get("kategorie") if isinstance(own, dict) else None
    return category if category in CATEGORIES else None


# --- Writing canon for SillyTavern (step 6.9, ADR-066) ---------------------------------------

_PERSONALITY: Final = "### Wesen"


class Exportable(Protocol):
    """What the export needs of a canon entry (``canon.CanonEntry`` has it)."""

    @property
    def name(self) -> str: ...
    @property
    def category(self) -> Category: ...
    @property
    def aliases(self) -> tuple[str, ...]: ...
    @property
    def body(self) -> str: ...


def lorebook_for(entries: Iterable[Exportable]) -> dict[str, object]:
    """A world info file as SillyTavern writes it, one entry per canon entry."""
    written: dict[str, object] = {}
    for uid, entry in enumerate(entries):
        written[str(uid)] = {
            **_WORLD_INFO_DEFAULTS,
            "uid": uid,
            "key": list(dict.fromkeys([entry.name, *entry.aliases])),
            "comment": entry.name,
            "content": entry.body.strip("\n"),
            "displayIndex": uid,
            "extensions": {_EXTENSION: {"kategorie": entry.category}},
        }
    return {"entries": written}


def card_for(entry: Exportable) -> dict[str, object]:
    """A character card V2 as SillyTavern writes it, without lorebook and chat fields.

    Raises:
        InvalidInput: The entry is not a figure.
    """
    if entry.category != "figur":
        raise InvalidInput("Nur Figuren lassen sich als Figurenkarte ausgeben")
    description, _, personality = entry.body.partition(f"\n{_PERSONALITY}\n")
    if entry.body.startswith(f"{_PERSONALITY}\n"):
        description, personality = "", entry.body[len(_PERSONALITY) + 1 :]
    fields = {
        "name": entry.name,
        "description": description.strip("\n"),
        "personality": personality.strip("\n"),
        "scenario": "",
        "first_mes": "",
        "mes_example": "",
    }
    return {
        **fields,
        "spec": "chara_card_v2",
        "spec_version": "2.0",
        "data": {
            **fields,
            "creator_notes": "",
            "system_prompt": "",
            "post_history_instructions": "",
            "alternate_greetings": [],
            "tags": [],
            "creator": "Skriptorium",
            "character_version": "",
            "extensions": {},
        },
    }


# Fields of a new world info entry in SillyTavern (``newWorldInfoEntryDefinition`` in
# ``public/scripts/world-info.js``, checked 2026-10-11); SillyTavern fills missing ones too.
_WORLD_INFO_DEFAULTS: Final[dict[str, object]] = {
    "keysecondary": [],
    "constant": False,
    "vectorized": False,
    "selective": True,
    "selectiveLogic": 0,
    "addMemo": True,
    "order": 100,
    "position": 0,
    "disable": False,
    "excludeRecursion": False,
    "preventRecursion": False,
    "delayUntilRecursion": False,
    "probability": 100,
    "useProbability": True,
    "depth": 4,
    "group": "",
    "groupOverride": False,
    "groupWeight": 100,
    "scanDepth": None,
    "caseSensitive": None,
    "matchWholeWords": None,
    "useGroupScoring": None,
    "automationId": "",
    "role": None,
    "sticky": 0,
    "cooldown": 0,
    "delay": 0,
}

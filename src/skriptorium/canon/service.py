"""``CanonService``: worlds and canon entries on top of ``DocumentStore``.

Layout below the data directory (docs/architecture.md section 7)::

    worlds/<world>/world.md                          name; body: description and ground rules
    worlds/<world>/canon/<category>/<entry>.md       name, aliasse, kategorie, optional status

Identifiers are derived from names (lower case, umlauts transliterated, words joined by
hyphens) and are the file names. An entry identifier is unique within its world across all
categories. The timeline of a world is kept as entries of category ``zeitlinie`` whose body
lists the events in order, as in the test world of step 1.1.
"""

import re
from collections.abc import Sequence
from dataclasses import dataclass
from enum import Enum
from pathlib import PurePosixPath
from typing import Final, Literal, cast, get_args

from skriptorium.storage import (
    AlreadyExists,
    Document,
    DocumentStore,
    HeaderValue,
    InvalidInput,
    NotFound,
)

Category = Literal["figur", "ort", "gegenstand", "zeitlinie", "regel", "kultur"]
CATEGORIES: Final[tuple[Category, ...]] = get_args(Category)

_WORLDS = "worlds"
_WORLD_FILE = "world.md"
_CANON = "canon"
_ITEM_TEMPLATE = "## Zweck\n\n## Verwendung\n\n## Auswirkung\n"
_TRANSLITERATION = str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"})


class _Keep(Enum):
    """Marker for "leave this field unchanged" in updates."""

    KEEP = "keep"


KEEP: Final = _Keep.KEEP


@dataclass(frozen=True)
class World:
    """A world: its identifier, name and description with ground rules."""

    id: str
    name: str
    description: str


@dataclass(frozen=True)
class CanonEntry:
    """One element of a world's canon."""

    world: str
    id: str
    category: Category
    name: str
    aliases: tuple[str, ...]
    status: str | None
    body: str


class CanonService:
    """Creates, changes, deletes and finds worlds and canon entries."""

    def __init__(self, store: DocumentStore) -> None:
        """Use ``store`` for all files."""
        self._store = store

    # --- worlds ---------------------------------------------------------------------------

    def list_worlds(self) -> list[World]:
        """All worlds, sorted by name."""
        paths = [
            path
            for path in self._store.list_paths(_WORLDS)
            if len(PurePosixPath(path).parts) == 3 and path.endswith(f"/{_WORLD_FILE}")
        ]
        worlds = [_world_from(self._store.read(path)) for path in paths]
        return sorted(worlds, key=lambda world: (world.name.casefold(), world.id))

    def get_world(self, world_id: str) -> World:
        """One world.

        Raises:
            NotFound: The world does not exist.
        """
        return _world_from(self._store.read(_world_path(world_id)))

    def create_world(self, name: str, description: str = "") -> World:
        """Create a world; its identifier is derived from ``name``.

        Raises:
            AlreadyExists: A world with the same identifier exists.
            InvalidInput: ``name`` is empty or yields no identifier.
        """
        clean_name = _required_text(name, "Name der Welt")
        world_id = slugify(clean_name)
        document = self._store.write(
            _world_path(world_id), {"name": clean_name}, description, create=True
        )
        return _world_from(document)

    def update_world(
        self,
        world_id: str,
        *,
        name: str | _Keep = KEEP,
        description: str | _Keep = KEEP,
    ) -> World:
        """Change name or description of a world; the identifier stays.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: ``name`` is empty.
        """
        path = _world_path(world_id)
        document = self._store.read(path)
        header = dict(document.header)
        if not isinstance(name, _Keep):
            header["name"] = _required_text(name, "Name der Welt")
        body = document.body if isinstance(description, _Keep) else description
        return _world_from(self._store.write(path, header, body))

    # --- canon entries --------------------------------------------------------------------

    def list_entries(self, world_id: str, category: Category | None = None) -> list[CanonEntry]:
        """The canon entries of a world, optionally of one category, sorted by name.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: Unknown category.
        """
        self.get_world(world_id)
        prefix = f"{_WORLDS}/{world_id}/{_CANON}"
        if category is not None:
            prefix = f"{prefix}/{_checked_category(category)}"
        entries = [
            _entry_from(self._store.read(path))
            for path in self._store.list_paths(prefix)
            if _is_entry_path(path)
        ]
        return sorted(entries, key=lambda entry: (entry.name.casefold(), entry.id))

    def get_entry(self, world_id: str, entry_id: str) -> CanonEntry:
        """One canon entry.

        Raises:
            NotFound: The world or the entry does not exist.
        """
        return _entry_from(self._store.read(self._entry_path(world_id, entry_id)))

    def create_entry(
        self,
        world_id: str,
        category: Category,
        name: str,
        *,
        aliases: Sequence[str] = (),
        status: str | None = None,
        body: str = "",
    ) -> CanonEntry:
        """Create a canon entry; its identifier is derived from ``name``.

        A new entry of category ``gegenstand`` without body gets the sections Zweck,
        Verwendung and Auswirkung (FR-003).

        Raises:
            NotFound: The world does not exist.
            AlreadyExists: An entry with the same identifier exists in the world.
            InvalidInput: Empty name, unknown category or empty alias.
        """
        self.get_world(world_id)
        checked = _checked_category(category)
        clean_name = _required_text(name, "Name des Eintrags")
        entry_id = slugify(clean_name)
        if self._find_entry_path(world_id, entry_id) is not None:
            raise AlreadyExists(f"{world_id}/{entry_id}")
        if checked == "gegenstand" and not body.strip():
            body = _ITEM_TEMPLATE
        header = _entry_header({}, clean_name, _clean_aliases(aliases), checked, status)
        document = self._store.write(
            _entry_path(world_id, checked, entry_id), header, body, create=True
        )
        return _entry_from(document)

    def update_entry(
        self,
        world_id: str,
        entry_id: str,
        *,
        category: Category | _Keep = KEEP,
        name: str | _Keep = KEEP,
        aliases: Sequence[str] | _Keep = KEEP,
        status: str | _Keep | None = KEEP,
        body: str | _Keep = KEEP,
    ) -> CanonEntry:
        """Change a canon entry; the identifier stays, other header fields are kept.

        Raises:
            NotFound: The world or the entry does not exist.
            InvalidInput: Empty name, unknown category or empty alias.
        """
        path = self._entry_path(world_id, entry_id)
        document = self._store.read(path)
        current = _entry_from(document)
        new_category = current.category if isinstance(category, _Keep) else category
        new_category = _checked_category(new_category)
        header = _entry_header(
            document.header,
            current.name if isinstance(name, _Keep) else _required_text(name, "Name des Eintrags"),
            list(current.aliases) if isinstance(aliases, _Keep) else _clean_aliases(aliases),
            new_category,
            current.status if isinstance(status, _Keep) else status,
        )
        new_body = current.body if isinstance(body, _Keep) else body
        new_path = _entry_path(world_id, new_category, entry_id)
        updated = self._store.write(new_path, header, new_body)
        if new_path != path:
            self._store.delete(path)
        return _entry_from(updated)

    def delete_entry(self, world_id: str, entry_id: str) -> None:
        """Delete a canon entry.

        Raises:
            NotFound: The world or the entry does not exist.
        """
        self._store.delete(self._entry_path(world_id, entry_id))

    def find_entries(self, world_id: str, text: str) -> list[CanonEntry]:
        """Entries of a world whose name or alias starts with ``text`` (``@`` menu).

        Raises:
            NotFound: The world does not exist.
        """
        self.get_world(world_id)
        return [
            _entry_from(self._store.read(hit.path))
            for hit in self._store.search(world_id, text, "name")
            if _is_entry_path(hit.path)
        ]

    def _entry_path(self, world_id: str, entry_id: str) -> str:
        self.get_world(world_id)
        path = self._find_entry_path(world_id, entry_id)
        if path is None:
            raise NotFound(f"{world_id}/{entry_id}")
        return path

    def _find_entry_path(self, world_id: str, entry_id: str) -> str | None:
        _checked_identifier(entry_id)
        for category in CATEGORIES:
            path = _entry_path(world_id, category, entry_id)
            try:
                self._store.read(path)
            except NotFound:
                continue
            return path
        return None


def slugify(name: str) -> str:
    """Derive an identifier from a name: ``"Kael der Ältere"`` → ``"kael-der-aeltere"``.

    Raises:
        InvalidInput: The name contains no letters or digits.
    """
    text = name.strip().lower().translate(_TRANSLITERATION)
    slug = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    if not slug:
        raise InvalidInput(f"Aus {name!r} lässt sich keine Kennung bilden")
    return slug


def _checked_identifier(identifier: str) -> str:
    if identifier != slugify(identifier):
        raise InvalidInput(f"Ungültige Kennung: {identifier!r}")
    return identifier


def _checked_category(category: str) -> Category:
    if category not in CATEGORIES:
        raise InvalidInput(f"Unbekannte Kategorie: {category!r}")
    return category


def _required_text(value: str, label: str) -> str:
    text = value.strip()
    if not text:
        raise InvalidInput(f"{label} darf nicht leer sein")
    return text


def _clean_aliases(aliases: Sequence[str]) -> list[str]:
    if isinstance(aliases, str):
        raise InvalidInput("Aliasse müssen eine Liste sein")
    return [_required_text(alias, "Alias") for alias in aliases]


def _world_path(world_id: str) -> str:
    return f"{_WORLDS}/{_checked_identifier(world_id)}/{_WORLD_FILE}"


def _entry_path(world_id: str, category: Category, entry_id: str) -> str:
    return f"{_WORLDS}/{_checked_identifier(world_id)}/{_CANON}/{category}/{entry_id}.md"


def _is_entry_path(path: str) -> bool:
    parts = PurePosixPath(path).parts
    return len(parts) == 5 and parts[2] == _CANON and parts[3] in CATEGORIES


def _entry_header(
    previous: dict[str, HeaderValue],
    name: str,
    aliases: list[str],
    category: Category,
    status: str | None,
) -> dict[str, HeaderValue]:
    header: dict[str, HeaderValue] = {
        "name": name,
        "aliasse": list[HeaderValue](aliases),
        "kategorie": category,
    }
    if status is not None and status.strip():
        header["status"] = status.strip()
    known = {"name", "aliasse", "kategorie", "status"}
    header.update({key: value for key, value in previous.items() if key not in known})
    return header


def _world_from(document: Document) -> World:
    parts = PurePosixPath(document.path).parts
    name = _header_text(document, "name", required=True)
    return World(id=parts[1], name=name or parts[1], description=document.body)


def _entry_from(document: Document) -> CanonEntry:
    parts = PurePosixPath(document.path).parts
    category = _checked_category(parts[3])
    written = document.header.get("kategorie", category)
    if written != category:
        raise InvalidInput(f"{document.path}: kategorie {written!r} passt nicht zum Ordner")
    raw_aliases = document.header.get("aliasse", [])
    if not isinstance(raw_aliases, list) or not all(isinstance(a, str) for a in raw_aliases):
        raise InvalidInput(f"{document.path}: aliasse muss eine Liste von Texten sein")
    return CanonEntry(
        world=parts[1],
        id=PurePosixPath(document.path).stem,
        category=category,
        name=_header_text(document, "name", required=True) or "",
        aliases=tuple(cast("list[str]", raw_aliases)),
        status=_header_text(document, "status", required=False),
        body=document.body,
    )


def _header_text(document: Document, key: str, *, required: bool) -> str | None:
    value = document.header.get(key)
    if value is None and not required:
        return None
    if not isinstance(value, str) or not value.strip():
        raise InvalidInput(f"{document.path}: Feld {key!r} muss ein nicht leerer Text sein")
    return value.strip()

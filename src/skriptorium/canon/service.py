"""``CanonService``: worlds and canon entries on top of ``DocumentStore``.

Layout below the data directory (docs/architecture.md section 7)::

    worlds/<world>/world.md                          name, optional karten (name, datei,
                                                     optional marken: eintrag, x, y); body:
                                                     description and ground rules
    worlds/<world>/karten/karte-<random>.<ending>    maps of the world (step 7.10, ADR-073)
    worlds/<world>/canon/<category>/<entry>.md       name, aliasse, kategorie, optional status,
                                                     optional bilder (first = main image)
    worlds/<world>/bilder/<entry>-<random>.<ending>  images of the entries (step 7.6, ADR-072)

Identifiers are derived from names (lower case, umlauts transliterated, words joined by
hyphens) and are the file names. An entry identifier is unique within its world across all
categories. The timeline of a world is kept as entries of category ``zeitlinie`` whose body
lists the events in order, as in the test world of step 1.1.
"""

import contextlib
import re
import secrets
from collections.abc import Mapping, Sequence, Set
from dataclasses import dataclass, replace
from enum import Enum
from pathlib import PurePosixPath
from typing import Final, cast

from skriptorium.canon.categories import CATEGORIES, Category
from skriptorium.canon.importers import (
    TranslatedMaterial,
    card_for,
    lorebook_for,
    parse_markdown,
    translate_sillytavern,
)
from skriptorium.storage import (
    IMAGE_SUFFIXES,
    MAX_MAP_BYTES,
    MAX_MAP_SIDE,
    AlreadyExists,
    Document,
    DocumentStore,
    HeaderValue,
    InvalidInput,
    NotFound,
    checked_identifier,
    inspect_image,
    slugify,
)

_WORLDS = "worlds"
_WORLD_FILE = "world.md"
_CANON = "canon"
_IMAGES = "bilder"
_MAPS = "karten"
MAX_MAPS_PER_WORLD: Final = 20
MAX_MARKERS_PER_MAP: Final = 200
_MARKERS = "marken"
_MAP_FILE = re.compile(r"karte-[0-9a-f]{12}\.(?:png|jpg|webp)")
_MAP_NAME_LENGTH = 200
# Control characters (line breaks included) and the marks that turn the writing direction.
_MAP_NAME_REFUSED = re.compile(r"[\x00-\x1f\x7f-\x9f\u200e\u200f\u202a-\u202e\u2066-\u2069]")
_ITEM_TEMPLATE = "## Zweck\n\n## Verwendung\n\n## Auswirkung\n"
# The looks of a figure stand in a section of their own (step 7.16, ADR-078).
_FIGURE_TEMPLATE = "## Aussehen\n"
MAX_IMAGES_PER_ENTRY: Final = 12
# Names of image files as this module creates them; nothing else is ever read or served.
_IMAGE_NAME = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\.(?:png|jpg|webp)")


class _Keep(Enum):
    """Marker for "leave this field unchanged" in updates."""

    KEEP = "keep"


KEEP: Final = _Keep.KEEP


@dataclass(frozen=True)
class MapMarker:
    """A point on a map that leads to a canon entry (step 7.14, ADR-079).

    ``x`` and ``y`` are shares of the map's width and height (0 to 1, from the top left), so a
    smaller copy of the map keeps the point in place.
    """

    entry: str
    x: float
    y: float


@dataclass(frozen=True)
class WorldMap:
    """A map of a world (step 7.10): the author's name for it, its file and its markers."""

    name: str
    file: str
    markers: tuple[MapMarker, ...] = ()


@dataclass(frozen=True)
class World:
    """A world: its identifier, name and description with ground rules."""

    id: str
    name: str
    description: str
    maps: tuple[WorldMap, ...] = ()
    """The world's maps in the order they were added."""


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
    images: tuple[str, ...] = ()
    """File names of the entry's images; the first is the main image (step 7.6)."""


@dataclass(frozen=True)
class ImportItem:
    """One entry of an import preview.

    ``conflict`` names why the entry is skipped unless it is overwritten: ``"vorhanden"``
    (an entry with this identifier exists in the world) or ``"doppelt"`` (an earlier entry
    of the material has the same identifier).
    """

    id: str
    name: str
    category: Category | None
    aliases: tuple[str, ...]
    body: str
    conflict: str | None


@dataclass(frozen=True)
class ImportPreview:
    """What an import would do; nothing is stored."""

    world: str
    introduction: str
    items: tuple[ImportItem, ...]
    not_taken_over: tuple[str, ...]


@dataclass(frozen=True)
class ImportResult:
    """Identifiers of the entries created, overwritten and skipped by an import."""

    created: tuple[str, ...]
    overwritten: tuple[str, ...]
    skipped: tuple[str, ...]


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

    # --- maps of a world (step 7.10, ADR-073) -----------------------------------------------

    def add_world_map(self, world_id: str, name: str, data: bytes) -> World:
        """Store a map (up to 6,000 pixels per side and 12 MB) and add it to the world.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: Empty or too long name, not a PNG, JPEG or WebP image, too large,
                or the world already has :data:`MAX_MAPS_PER_WORLD` maps.
        """
        document = self._store.read(_world_path(world_id))
        maps = list(_world_from(document).maps)
        clean_name = _map_name(name)
        if len(maps) >= MAX_MAPS_PER_WORLD:
            raise InvalidInput(f"Höchstens {MAX_MAPS_PER_WORLD} Karten je Welt")
        kind = inspect_image(data, max_bytes=MAX_MAP_BYTES, max_side=MAX_MAP_SIDE).kind
        file = f"karte-{secrets.token_hex(6)}{IMAGE_SUFFIXES[kind]}"
        self._store.write_image(
            _map_path(world_id, file), data, max_bytes=MAX_MAP_BYTES, max_side=MAX_MAP_SIDE
        )
        try:
            return self._write_maps(document, [*maps, WorldMap(clean_name, file)])
        except BaseException:
            self._delete_map_file(world_id, file)
            raise

    def world_map(self, world_id: str, file: str) -> tuple[bytes, str]:
        """The bytes and media type of one map of the world.

        Raises:
            NotFound: The world or the map does not exist.
        """
        if file not in {m.file for m in self.get_world(world_id).maps}:
            raise NotFound(f"{world_id}/{_MAPS}")
        return self._store.read_image(_map_path(world_id, file))

    def rename_world_map(self, world_id: str, file: str, name: str) -> World:
        """Give a map of the world another name.

        Raises:
            NotFound: The world or the map does not exist.
            InvalidInput: Empty or too long name.
        """
        document = self._store.read(_world_path(world_id))
        maps = list(_world_from(document).maps)
        clean_name = _map_name(name)
        at = _map_index(maps, world_id, file)
        maps[at] = replace(maps[at], name=clean_name)
        return self._write_maps(document, maps)

    def set_map_markers(self, world_id: str, file: str, markers: Sequence[MapMarker]) -> World:
        """Replace the markers of a map (step 7.14, ADR-079).

        Raises:
            NotFound: The world or the map does not exist.
            InvalidInput: A position outside the map, an entry that does not exist or appears
                twice, or more than :data:`MAX_MARKERS_PER_MAP` markers.
        """
        document = self._store.read(_world_path(world_id))
        maps = list(_world_from(document).maps)
        at = _map_index(maps, world_id, file)
        if len(markers) > MAX_MARKERS_PER_MAP:
            raise InvalidInput(f"Höchstens {MAX_MARKERS_PER_MAP} Markierungen je Karte")
        seen: set[str] = set()
        for marker in markers:
            _check_marker(marker)
            if marker.entry in seen:
                raise InvalidInput(f"Eintrag {marker.entry!r} ist schon auf der Karte")
            if self._find_entry_path(world_id, marker.entry) is None:
                raise InvalidInput(f"Eintrag {marker.entry!r} gibt es in dieser Welt nicht")
            seen.add(marker.entry)
        maps[at] = replace(maps[at], markers=tuple(markers))
        return self._write_maps(document, maps)

    def remove_world_map(self, world_id: str, file: str) -> World:
        """Remove a map from the world and delete its file.

        Raises:
            NotFound: The world or the map does not exist.
        """
        document = self._store.read(_world_path(world_id))
        maps = list(_world_from(document).maps)
        del maps[_map_index(maps, world_id, file)]
        updated = self._write_maps(document, maps)
        self._delete_map_file(world_id, file)
        return updated

    def _write_maps(self, document: Document, maps: list[WorldMap]) -> World:
        header = dict(document.header)
        if maps:
            header[_MAPS] = list[HeaderValue](_map_header(m) for m in maps)
        else:
            header.pop(_MAPS, None)
        return _world_from(self._store.write(document.path, header, document.body))

    def _delete_map_file(self, world_id: str, file: str) -> None:
        # A file already gone (deleted by hand) is not an error; the world no longer names it.
        with contextlib.suppress(NotFound):
            self._store.delete_image(_map_path(world_id, file))

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
        Verwendung and Auswirkung (FR-003); a new figure without body the section Aussehen
        (step 7.16, ADR-078).

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
        elif checked == "figur" and not body.strip():
            body = _FIGURE_TEMPLATE
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
        """Delete a canon entry together with its images.

        Raises:
            NotFound: The world or the entry does not exist.
        """
        path = self._entry_path(world_id, entry_id)
        document = self._store.read(path)
        # Read leniently: an entry whose image list was broken by hand can still be deleted;
        # only names that pass the check are deleted with it.
        try:
            images = _images_of(document)
        except InvalidInput:
            images = ()
        self._store.delete(path)
        for image in images:
            self._delete_image_file(world_id, image)
        self._drop_markers(world_id, entry_id)

    def _drop_markers(self, world_id: str, entry_id: str) -> None:
        """Remove the markers of a deleted entry from every map of the world (ADR-079)."""
        document = self._store.read(_world_path(world_id))
        maps = _world_from(document).maps
        if not any(m.entry == entry_id for world_map in maps for m in world_map.markers):
            return
        kept = [
            replace(world_map, markers=tuple(m for m in world_map.markers if m.entry != entry_id))
            for world_map in maps
        ]
        self._write_maps(document, kept)

    # --- images of canon entries (step 7.6, ADR-072) ------------------------------------

    def add_entry_image(self, world_id: str, entry_id: str, data: bytes) -> CanonEntry:
        """Store an image and append it to the entry; the first image is the main image.

        Raises:
            NotFound: The world or the entry does not exist.
            InvalidInput: Not a PNG, JPEG or WebP image, too large, or the entry already has
                :data:`MAX_IMAGES_PER_ENTRY` images.
        """
        path = self._entry_path(world_id, entry_id)
        document = self._store.read(path)
        current = _entry_from(document)
        if len(current.images) >= MAX_IMAGES_PER_ENTRY:
            raise InvalidInput(f"Höchstens {MAX_IMAGES_PER_ENTRY} Bilder je Eintrag")
        suffix = IMAGE_SUFFIXES[inspect_image(data).kind]
        name = f"{_image_prefix(entry_id)}{secrets.token_hex(6)}{suffix}"
        self._store.write_image(_image_path(world_id, name), data)
        try:
            return self._write_images(document, [*current.images, name])
        except BaseException:
            self._delete_image_file(world_id, name)
            raise

    def entry_image(self, world_id: str, entry_id: str, image: str) -> tuple[bytes, str]:
        """The bytes and media type of one image of an entry.

        Raises:
            NotFound: World, entry or image (at this entry) does not exist.
        """
        if image not in self.get_entry(world_id, entry_id).images:
            raise NotFound(f"{world_id}/{entry_id}/{_IMAGES}")
        return self._store.read_image(_image_path(world_id, image))

    def remove_entry_image(self, world_id: str, entry_id: str, image: str) -> CanonEntry:
        """Remove an image from the entry and delete its file.

        Raises:
            NotFound: World, entry or image (at this entry) does not exist.
        """
        document = self._store.read(self._entry_path(world_id, entry_id))
        images = list(_entry_from(document).images)
        if image not in images:
            raise NotFound(f"{world_id}/{entry_id}/{_IMAGES}")
        images.remove(image)
        updated = self._write_images(document, images)
        self._delete_image_file(world_id, image)
        return updated

    def set_main_image(self, world_id: str, entry_id: str, image: str) -> CanonEntry:
        """Make one of the entry's images its main image (first place).

        Raises:
            NotFound: World, entry or image (at this entry) does not exist.
        """
        document = self._store.read(self._entry_path(world_id, entry_id))
        images = list(_entry_from(document).images)
        if image not in images:
            raise NotFound(f"{world_id}/{entry_id}/{_IMAGES}")
        images.remove(image)
        return self._write_images(document, [image, *images])

    def _write_images(self, document: Document, images: list[str]) -> CanonEntry:
        header = dict(document.header)
        if images:
            header[_IMAGES] = list[HeaderValue](images)
        else:
            header.pop(_IMAGES, None)
        return _entry_from(self._store.write(document.path, header, document.body))

    def _delete_image_file(self, world_id: str, image: str) -> None:
        # A file already gone (deleted by hand) is not an error; the entry no longer names it.
        with contextlib.suppress(NotFound):
            self._store.delete_image(_image_path(world_id, image))

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

    # --- import of world material (ADR-012, rules confirmed in 2.4) ------------------------

    def translate_sillytavern(self, world_id: str, data: bytes) -> TranslatedMaterial:
        """Import Markdown from a SillyTavern card or lorebook (ADR-065); nothing is stored.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: Not a SillyTavern file, broken or larger than 10 MB.
        """
        self.get_world(world_id)
        return translate_sillytavern(data)

    def sillytavern_lorebook(self, world_id: str) -> dict[str, object]:
        """All entries of the world as a SillyTavern lorebook (ADR-066).

        Raises:
            NotFound: The world does not exist.
        """
        return lorebook_for(self.list_entries(world_id))

    def sillytavern_card(self, world_id: str, entry_id: str) -> dict[str, object]:
        """A figure as a SillyTavern character card (ADR-066).

        Raises:
            NotFound: World or entry does not exist.
            InvalidInput: The entry is not a figure.
        """
        return card_for(self.get_entry(world_id, entry_id))

    def preview_import(self, world_id: str, markdown: str) -> ImportPreview:
        """Split Markdown world material into entries without storing anything.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: A heading yields no identifier.
        """
        self.get_world(world_id)
        material = parse_markdown(markdown)
        existing = {entry.id for entry in self.list_entries(world_id)}
        seen: set[str] = set()
        items: list[ImportItem] = []
        for parsed in material.entries:
            entry_id = slugify(parsed.name)
            conflict = None
            if entry_id in seen:
                conflict = "doppelt"
            elif entry_id in existing:
                conflict = "vorhanden"
            seen.add(entry_id)
            items.append(
                ImportItem(
                    id=entry_id,
                    name=parsed.name,
                    category=parsed.category,
                    aliases=parsed.aliases,
                    body=parsed.body,
                    conflict=conflict,
                )
            )
        return ImportPreview(
            world=world_id,
            introduction=material.introduction,
            items=tuple(items),
            not_taken_over=material.not_taken_over,
        )

    def apply_import(
        self,
        world_id: str,
        markdown: str,
        *,
        categories: Mapping[str, Category] | None = None,
        overwrite: Set[str] = frozenset(),
    ) -> ImportResult:
        """Take over the material as previewed by :meth:`preview_import`.

        The introduction is appended to the world description. Entries with a conflict are
        skipped unless their identifier is in ``overwrite``.

        Args:
            categories: Category per entry identifier; overrides the recognised category.
            overwrite: Identifiers whose conflict should be resolved by overwriting.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: An entry that would be stored has no category; nothing is stored.
        """
        chosen = dict(categories or {})
        preview = self.preview_import(world_id, markdown)
        planned: list[tuple[ImportItem, Category]] = []
        skipped: list[str] = []
        for item in preview.items:
            if item.conflict is not None and item.id not in overwrite:
                skipped.append(item.id)
                continue
            category = chosen.get(item.id, item.category)
            if category is None:
                raise InvalidInput(f"Eintrag {item.name!r} hat keine Kategorie")
            planned.append((item, _checked_category(category)))

        if preview.introduction:
            world = self.get_world(world_id)
            joined = "\n\n".join(
                p for p in (world.description.rstrip("\n"), preview.introduction) if p
            )
            self.update_world(world_id, description=joined)
        created: list[str] = []
        overwritten: list[str] = []
        for item, category in planned:
            if item.conflict is None:
                self.create_entry(
                    world_id, category, item.name, aliases=item.aliases, body=item.body
                )
                created.append(item.id)
            else:
                self.update_entry(
                    world_id,
                    item.id,
                    category=category,
                    name=item.name,
                    aliases=item.aliases,
                    body=item.body,
                )
                overwritten.append(item.id)
        return ImportResult(
            created=tuple(created), overwritten=tuple(overwritten), skipped=tuple(skipped)
        )

    def _entry_path(self, world_id: str, entry_id: str) -> str:
        self.get_world(world_id)
        path = self._find_entry_path(world_id, entry_id)
        if path is None:
            raise NotFound(f"{world_id}/{entry_id}")
        return path

    def _find_entry_path(self, world_id: str, entry_id: str) -> str | None:
        checked_identifier(entry_id)
        for category in CATEGORIES:
            path = _entry_path(world_id, category, entry_id)
            try:
                self._store.read(path)
            except NotFound:
                continue
            return path
        return None


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


def _map_path(world_id: str, file: str) -> str:
    return f"{_WORLDS}/{checked_identifier(world_id)}/{_MAPS}/{file}"


def _map_name(name: str) -> str:
    clean = _required_text(name, "Name der Karte")
    if len(clean) > _MAP_NAME_LENGTH:
        raise InvalidInput(f"Name der Karte ist länger als {_MAP_NAME_LENGTH} Zeichen")
    if _MAP_NAME_REFUSED.search(clean):
        raise InvalidInput("Name der Karte enthält Steuerzeichen")
    return clean


def _is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _check_marker(marker: MapMarker) -> None:
    checked_identifier(marker.entry)
    for share in (marker.x, marker.y):
        if not _is_number(share):
            raise InvalidInput("Lage einer Markierung muss eine Zahl sein")
        # Also refuses NaN, which compares false with everything.
        if not 0 <= share <= 1:
            raise InvalidInput("Markierung liegt außerhalb der Karte")


def _map_header(world_map: WorldMap) -> dict[str, HeaderValue]:
    header: dict[str, HeaderValue] = {"name": world_map.name, "datei": world_map.file}
    if world_map.markers:
        header[_MARKERS] = list[HeaderValue](
            {"eintrag": m.entry, "x": round(m.x, 4), "y": round(m.y, 4)} for m in world_map.markers
        )
    return header


def _markers_of(path: str, value: HeaderValue) -> tuple[MapMarker, ...]:
    if not isinstance(value, list):
        raise InvalidInput(f"{path}: marken muss eine Liste sein")
    markers: list[MapMarker] = []
    for item in value:
        if not isinstance(item, dict):
            raise InvalidInput(f"{path}: marken braucht je Markierung eintrag, x und y")
        entry, x, y = item.get("eintrag"), item.get("x"), item.get("y")
        if not (isinstance(entry, str) and _is_number(x) and _is_number(y)):
            raise InvalidInput(f"{path}: marken braucht je Markierung eintrag, x und y")
        marker = MapMarker(entry, float(cast(float, x)), float(cast(float, y)))
        _check_marker(marker)
        markers.append(marker)
    return tuple(markers)


def _map_index(maps: list[WorldMap], world_id: str, file: str) -> int:
    for at, world_map in enumerate(maps):
        if world_map.file == file:
            return at
    raise NotFound(f"{world_id}/{_MAPS}")


def _world_path(world_id: str) -> str:
    return f"{_WORLDS}/{checked_identifier(world_id)}/{_WORLD_FILE}"


def _entry_path(world_id: str, category: Category, entry_id: str) -> str:
    return f"{_WORLDS}/{checked_identifier(world_id)}/{_CANON}/{category}/{entry_id}.md"


def _image_path(world_id: str, image: str) -> str:
    return f"{_WORLDS}/{checked_identifier(world_id)}/{_IMAGES}/{image}"


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
    return World(
        id=parts[1], name=name or parts[1], description=document.body, maps=_maps_of(document)
    )


def _maps_of(document: Document) -> tuple[WorldMap, ...]:
    value = document.header.get(_MAPS, [])
    if not isinstance(value, list):
        raise InvalidInput(f"{document.path}: karten muss eine Liste sein")
    maps: list[WorldMap] = []
    for item in value:
        name = item.get("name") if isinstance(item, dict) else None
        file = item.get("datei") if isinstance(item, dict) else None
        if not (
            isinstance(name, str)
            and name.strip()
            and isinstance(file, str)
            and _MAP_FILE.fullmatch(file)
        ):
            raise InvalidInput(f"{document.path}: karten braucht je Karte name und datei")
        markers = item.get(_MARKERS, []) if isinstance(item, dict) else []
        maps.append(WorldMap(name.strip(), file, _markers_of(document.path, markers)))
    return tuple(maps)


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
        images=_images_of(document),
    )


def _image_prefix(entry_id: str) -> str:
    """Start of the file names of an entry's images; ties each file to one entry."""
    return f"{entry_id[:60].rstrip('-')}-"


def _images_of(document: Document) -> tuple[str, ...]:
    value = document.header.get(_IMAGES, [])
    prefix = _image_prefix(PurePosixPath(document.path).stem)
    if not isinstance(value, list) or not all(
        isinstance(name, str) and _IMAGE_NAME.fullmatch(name) and name.startswith(prefix)
        for name in value
    ):
        raise InvalidInput(f"{document.path}: bilder muss eine Liste von Bilddateinamen sein")
    return tuple(cast("list[str]", value))


def _header_text(document: Document, key: str, *, required: bool) -> str | None:
    value = document.header.get(key)
    if value is None and not required:
        return None
    if not isinstance(value, str) or not value.strip():
        raise InvalidInput(f"{document.path}: Feld {key!r} muss ein nicht leerer Text sein")
    return value.strip()

"""Maps of a world and their markers (step 7.10, ADR-073; step 7.14, ADR-079)."""

import contextlib
import secrets
from collections.abc import Sequence
from dataclasses import replace

from skriptorium.canon.entries import EntryStore
from skriptorium.canon.headers import map_header, world_from
from skriptorium.canon.layout import (
    MAPS,
    MAX_MAPS_PER_WORLD,
    MAX_MARKERS_PER_MAP,
    map_path,
    world_path,
)
from skriptorium.canon.models import MapMarker, World, WorldMap
from skriptorium.canon.validation import check_marker, map_name
from skriptorium.canon.worlds import WorldStore
from skriptorium.storage import (
    IMAGE_SUFFIXES,
    MAX_MAP_BYTES,
    MAX_MAP_SIDE,
    Document,
    DocumentStore,
    HeaderValue,
    InvalidInput,
    NotFound,
    inspect_image,
)


class MapStore:
    """Adds, renames and removes the maps of a world and sets their markers."""

    def __init__(self, store: DocumentStore, worlds: WorldStore, entries: EntryStore) -> None:
        """Use ``store`` for all files, ``worlds`` and ``entries`` to find what markers lead to."""
        self._store = store
        self._worlds = worlds
        self._entries = entries

    def add_world_map(self, world_id: str, name: str, data: bytes) -> World:
        """Store a map and add it to the world."""
        document = self._store.read(world_path(world_id))
        maps = list(world_from(document).maps)
        clean_name = map_name(name)
        if len(maps) >= MAX_MAPS_PER_WORLD:
            raise InvalidInput(f"Höchstens {MAX_MAPS_PER_WORLD} Karten je Welt")
        kind = inspect_image(data, max_bytes=MAX_MAP_BYTES, max_side=MAX_MAP_SIDE).kind
        file = f"karte-{secrets.token_hex(6)}{IMAGE_SUFFIXES[kind]}"
        self._store.write_image(
            map_path(world_id, file), data, max_bytes=MAX_MAP_BYTES, max_side=MAX_MAP_SIDE
        )
        try:
            return self._write_maps(document, [*maps, WorldMap(clean_name, file)])
        except BaseException:
            self._delete_map_file(world_id, file)
            raise

    def world_map(self, world_id: str, file: str) -> tuple[bytes, str]:
        """The bytes and media type of one map of the world."""
        if file not in {m.file for m in self._worlds.get_world(world_id).maps}:
            raise NotFound(f"{world_id}/{MAPS}")
        return self._store.read_image(map_path(world_id, file))

    def rename_world_map(self, world_id: str, file: str, name: str) -> World:
        """Give a map of the world another name."""
        document = self._store.read(world_path(world_id))
        maps = list(world_from(document).maps)
        clean_name = map_name(name)
        at = _map_index(maps, world_id, file)
        maps[at] = replace(maps[at], name=clean_name)
        return self._write_maps(document, maps)

    def set_map_markers(self, world_id: str, file: str, markers: Sequence[MapMarker]) -> World:
        """Replace the markers of a map."""
        document = self._store.read(world_path(world_id))
        maps = list(world_from(document).maps)
        at = _map_index(maps, world_id, file)
        if len(markers) > MAX_MARKERS_PER_MAP:
            raise InvalidInput(f"Höchstens {MAX_MARKERS_PER_MAP} Markierungen je Karte")
        seen: set[str] = set()
        for marker in markers:
            check_marker(marker)
            if marker.entry in seen:
                raise InvalidInput(f"Eintrag {marker.entry!r} ist schon auf der Karte")
            if self._entries.find_entry_path(world_id, marker.entry) is None:
                raise InvalidInput(f"Eintrag {marker.entry!r} gibt es in dieser Welt nicht")
            seen.add(marker.entry)
        maps[at] = replace(maps[at], markers=tuple(markers))
        return self._write_maps(document, maps)

    def remove_world_map(self, world_id: str, file: str) -> World:
        """Remove a map from the world and delete its file."""
        document = self._store.read(world_path(world_id))
        maps = list(world_from(document).maps)
        del maps[_map_index(maps, world_id, file)]
        updated = self._write_maps(document, maps)
        self._delete_map_file(world_id, file)
        return updated

    def drop_markers(self, world_id: str, entry_id: str) -> None:
        """Remove the markers of a deleted entry from every map of the world (ADR-079)."""
        document = self._store.read(world_path(world_id))
        maps = world_from(document).maps
        if not any(m.entry == entry_id for world_map in maps for m in world_map.markers):
            return
        kept = [
            replace(world_map, markers=tuple(m for m in world_map.markers if m.entry != entry_id))
            for world_map in maps
        ]
        self._write_maps(document, kept)

    def _write_maps(self, document: Document, maps: list[WorldMap]) -> World:
        header = dict(document.header)
        if maps:
            header[MAPS] = list[HeaderValue](map_header(m) for m in maps)
        else:
            header.pop(MAPS, None)
        return world_from(self._store.write(document.path, header, document.body))

    def _delete_map_file(self, world_id: str, file: str) -> None:
        # A file already gone (deleted by hand) is not an error; the world no longer names it.
        with contextlib.suppress(NotFound):
            self._store.delete_image(map_path(world_id, file))


def _map_index(maps: list[WorldMap], world_id: str, file: str) -> int:
    for at, world_map in enumerate(maps):
        if world_map.file == file:
            return at
    raise NotFound(f"{world_id}/{MAPS}")

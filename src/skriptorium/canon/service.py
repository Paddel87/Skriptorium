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

The service is a facade: the work is done by ``WorldStore`` (``worlds``), ``EntryStore``
(``entries``), ``MapStore`` (``maps``), ``ImageStore`` (``images``) and ``ImportStore``
(``imports``); the paths and limits of the files live in ``layout``, their header handling
in ``headers``, the checks of caller input in ``validation``.
"""

from collections.abc import Mapping, Sequence, Set

from skriptorium.canon.categories import Category
from skriptorium.canon.entries import EntryStore
from skriptorium.canon.images import ImageStore
from skriptorium.canon.importers import TranslatedMaterial
from skriptorium.canon.imports import ImportStore
from skriptorium.canon.layout import (
    MAX_IMAGES_PER_ENTRY,
    MAX_MAPS_PER_WORLD,
    MAX_MARKERS_PER_MAP,
)
from skriptorium.canon.maps import MapStore
from skriptorium.canon.models import (
    KEEP,
    CanonEntry,
    ImportItem,
    ImportPreview,
    ImportResult,
    Keep,
    MapMarker,
    World,
    WorldMap,
)
from skriptorium.canon.worlds import WorldStore
from skriptorium.storage import DocumentStore, ImageOrigin

__all__ = [
    "KEEP",
    "MAX_IMAGES_PER_ENTRY",
    "MAX_MAPS_PER_WORLD",
    "MAX_MARKERS_PER_MAP",
    "CanonEntry",
    "CanonService",
    "ImportItem",
    "ImportPreview",
    "ImportResult",
    "Keep",
    "MapMarker",
    "World",
    "WorldMap",
]


class CanonService:
    """Creates, changes, deletes and finds worlds and canon entries."""

    def __init__(self, store: DocumentStore) -> None:
        """Use ``store`` for all files."""
        self._worlds = WorldStore(store)
        self._entries = EntryStore(store, self._worlds)
        self._maps = MapStore(store, self._worlds, self._entries)
        self._images = ImageStore(store, self._entries)
        self._imports = ImportStore(self._worlds, self._entries)

    # --- worlds ---------------------------------------------------------------------------

    def list_worlds(self) -> list[World]:
        """All worlds, sorted by name."""
        return self._worlds.list_worlds()

    def get_world(self, world_id: str) -> World:
        """One world.

        Raises:
            NotFound: The world does not exist.
        """
        return self._worlds.get_world(world_id)

    def create_world(self, name: str, description: str = "") -> World:
        """Create a world; its identifier is derived from ``name``.

        Raises:
            AlreadyExists: A world with the same identifier exists.
            InvalidInput: ``name`` is empty or yields no identifier.
        """
        return self._worlds.create_world(name, description)

    def update_world(
        self,
        world_id: str,
        *,
        name: str | Keep = KEEP,
        description: str | Keep = KEEP,
    ) -> World:
        """Change name or description of a world; the identifier stays.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: ``name`` is empty.
        """
        return self._worlds.update_world(world_id, name=name, description=description)

    # --- maps of a world (step 7.10, ADR-073) -----------------------------------------------

    def add_world_map(
        self, world_id: str, name: str, data: bytes, origin: ImageOrigin | None = None
    ) -> World:
        """Store a map (up to 6,000 pixels per side and 12 MB) and add it to the world.

        A generated map keeps its ``origin`` next to the file (step 9.6, ADR-095).

        Raises:
            NotFound: The world does not exist.
            InvalidInput: Empty or too long name, not a PNG, JPEG or WebP image, too large,
                or the world already has :data:`MAX_MAPS_PER_WORLD` maps.
        """
        return self._maps.add_world_map(world_id, name, data, origin)

    def world_map(self, world_id: str, file: str) -> tuple[bytes, str]:
        """The bytes and media type of one map of the world.

        Raises:
            NotFound: The world or the map does not exist.
        """
        return self._maps.world_map(world_id, file)

    def map_origin(self, world_id: str, file: str) -> ImageOrigin | None:
        """The origin of one map of the world, ``None`` if it has none (ADR-095).

        Raises:
            NotFound: The world or the map does not exist.
            InvalidInput: The origin file is unreadable.
        """
        return self._maps.map_origin(world_id, file)

    def rename_world_map(self, world_id: str, file: str, name: str) -> World:
        """Give a map of the world another name.

        Raises:
            NotFound: The world or the map does not exist.
            InvalidInput: Empty or too long name.
        """
        return self._maps.rename_world_map(world_id, file, name)

    def set_map_markers(self, world_id: str, file: str, markers: Sequence[MapMarker]) -> World:
        """Replace the markers of a map (step 7.14, ADR-079).

        Raises:
            NotFound: The world or the map does not exist.
            InvalidInput: A position outside the map, an entry that does not exist or appears
                twice, or more than :data:`MAX_MARKERS_PER_MAP` markers.
        """
        return self._maps.set_map_markers(world_id, file, markers)

    def remove_world_map(self, world_id: str, file: str) -> World:
        """Remove a map from the world and delete its file.

        Raises:
            NotFound: The world or the map does not exist.
        """
        return self._maps.remove_world_map(world_id, file)

    # --- canon entries --------------------------------------------------------------------

    def list_entries(self, world_id: str, category: Category | None = None) -> list[CanonEntry]:
        """The canon entries of a world, optionally of one category, sorted by name.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: Unknown category.
        """
        return self._entries.list_entries(world_id, category)

    def get_entry(self, world_id: str, entry_id: str) -> CanonEntry:
        """One canon entry.

        Raises:
            NotFound: The world or the entry does not exist.
        """
        return self._entries.get_entry(world_id, entry_id)

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

        A new entry without body gets the empty sections of its category (FR-003, ADR-092):
        a figure Aussehen, Wesen, Fähigkeiten, Geschichte and Beziehungen, a place Lage,
        Aussehen, Bewohner and Geschichte, an item Aussehen, Zweck, Verwendung and Auswirkung,
        a culture Gesellschaft, Glaube und Bräuche and Geschichte; rules and timeline have none.

        Raises:
            NotFound: The world does not exist.
            AlreadyExists: An entry with the same identifier exists in the world.
            InvalidInput: Empty name, unknown category or empty alias.
        """
        return self._entries.create_entry(
            world_id, category, name, aliases=aliases, status=status, body=body
        )

    def update_entry(
        self,
        world_id: str,
        entry_id: str,
        *,
        category: Category | Keep = KEEP,
        name: str | Keep = KEEP,
        aliases: Sequence[str] | Keep = KEEP,
        status: str | Keep | None = KEEP,
        body: str | Keep = KEEP,
    ) -> CanonEntry:
        """Change a canon entry; the identifier stays, other header fields are kept.

        Raises:
            NotFound: The world or the entry does not exist.
            InvalidInput: Empty name, unknown category or empty alias.
        """
        return self._entries.update_entry(
            world_id,
            entry_id,
            category=category,
            name=name,
            aliases=aliases,
            status=status,
            body=body,
        )

    def delete_entry(self, world_id: str, entry_id: str) -> None:
        """Delete a canon entry together with its images.

        Raises:
            NotFound: The world or the entry does not exist.
        """
        for image in self._entries.delete_entry(world_id, entry_id):
            self._images.delete_image_file(world_id, image)
        self._maps.drop_markers(world_id, entry_id)

    # --- images of canon entries (step 7.6, ADR-072) ------------------------------------

    def add_entry_image(
        self, world_id: str, entry_id: str, data: bytes, origin: ImageOrigin | None = None
    ) -> CanonEntry:
        """Store an image and append it to the entry; the first image is the main image.

        A generated image keeps its ``origin`` next to the file (step 9.6, ADR-095).

        Raises:
            NotFound: The world or the entry does not exist.
            InvalidInput: Not a PNG, JPEG or WebP image, too large, or the entry already has
                :data:`MAX_IMAGES_PER_ENTRY` images.
        """
        return self._images.add_entry_image(world_id, entry_id, data, origin)

    def entry_image(self, world_id: str, entry_id: str, image: str) -> tuple[bytes, str]:
        """The bytes and media type of one image of an entry.

        Raises:
            NotFound: World, entry or image (at this entry) does not exist.
        """
        return self._images.entry_image(world_id, entry_id, image)

    def entry_image_origin(self, world_id: str, entry_id: str, image: str) -> ImageOrigin | None:
        """The origin of one image of an entry, ``None`` if it has none (ADR-095).

        Raises:
            NotFound: World, entry or image (at this entry) does not exist.
            InvalidInput: The origin file is unreadable.
        """
        return self._images.entry_image_origin(world_id, entry_id, image)

    def remove_entry_image(self, world_id: str, entry_id: str, image: str) -> CanonEntry:
        """Remove an image from the entry and delete its file.

        Raises:
            NotFound: World, entry or image (at this entry) does not exist.
        """
        return self._images.remove_entry_image(world_id, entry_id, image)

    def set_main_image(self, world_id: str, entry_id: str, image: str) -> CanonEntry:
        """Make one of the entry's images its main image (first place).

        Raises:
            NotFound: World, entry or image (at this entry) does not exist.
        """
        return self._images.set_main_image(world_id, entry_id, image)

    def find_entries(self, world_id: str, text: str) -> list[CanonEntry]:
        """Entries of a world whose name or alias starts with ``text`` (``@`` menu).

        Raises:
            NotFound: The world does not exist.
        """
        return self._entries.find_entries(world_id, text)

    # --- import of world material (ADR-012, rules confirmed in 2.4) ------------------------

    def translate_sillytavern(self, world_id: str, data: bytes) -> TranslatedMaterial:
        """Import Markdown from a SillyTavern card or lorebook (ADR-065); nothing is stored.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: Not a SillyTavern file, broken or larger than 10 MB.
        """
        return self._imports.translate_sillytavern(world_id, data)

    def sillytavern_lorebook(self, world_id: str) -> dict[str, object]:
        """All entries of the world as a SillyTavern lorebook (ADR-066).

        Raises:
            NotFound: The world does not exist.
        """
        return self._imports.sillytavern_lorebook(world_id)

    def sillytavern_card(self, world_id: str, entry_id: str) -> dict[str, object]:
        """A figure as a SillyTavern character card (ADR-066).

        Raises:
            NotFound: World or entry does not exist.
            InvalidInput: The entry is not a figure.
        """
        return self._imports.sillytavern_card(world_id, entry_id)

    def preview_import(self, world_id: str, markdown: str) -> ImportPreview:
        """Split Markdown world material into entries without storing anything.

        Raises:
            NotFound: The world does not exist.
            InvalidInput: A heading yields no identifier.
        """
        return self._imports.preview_import(world_id, markdown)

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
        return self._imports.apply_import(
            world_id, markdown, categories=categories, overwrite=overwrite
        )

"""Canon entries: list, read, create, change, delete and find."""

from collections.abc import Sequence

from skriptorium.canon.categories import CATEGORIES, Category
from skriptorium.canon.headers import entry_from, entry_header, images_of
from skriptorium.canon.layout import CANON, WORLDS, entry_path, is_entry_path
from skriptorium.canon.models import KEEP, CanonEntry, Keep
from skriptorium.canon.sections import template_for
from skriptorium.canon.validation import checked_category, clean_aliases, required_text
from skriptorium.canon.worlds import WorldStore
from skriptorium.storage import (
    AlreadyExists,
    DocumentStore,
    InvalidInput,
    NotFound,
    checked_identifier,
    slugify,
)


class EntryStore:
    """Creates, changes and finds the canon entries of the worlds."""

    def __init__(self, store: DocumentStore, worlds: WorldStore) -> None:
        """Use ``store`` for all files and ``worlds`` to check that a world exists."""
        self._store = store
        self._worlds = worlds

    def list_entries(self, world_id: str, category: Category | None = None) -> list[CanonEntry]:
        """The canon entries of a world, optionally of one category, sorted by name."""
        self._worlds.get_world(world_id)
        prefix = f"{WORLDS}/{world_id}/{CANON}"
        if category is not None:
            prefix = f"{prefix}/{checked_category(category)}"
        entries = [
            entry_from(self._store.read(path))
            for path in self._store.list_paths(prefix)
            if is_entry_path(path)
        ]
        return sorted(entries, key=lambda entry: (entry.name.casefold(), entry.id))

    def get_entry(self, world_id: str, entry_id: str) -> CanonEntry:
        """One canon entry; raises ``NotFound`` if world or entry does not exist."""
        return entry_from(self._store.read(self.existing_path(world_id, entry_id)))

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
        """Create a canon entry; its identifier is derived from ``name``."""
        self._worlds.get_world(world_id)
        checked = checked_category(category)
        clean_name = required_text(name, "Name des Eintrags")
        entry_id = slugify(clean_name)
        if self.find_entry_path(world_id, entry_id) is not None:
            raise AlreadyExists(f"{world_id}/{entry_id}")
        # Items get Zweck, Verwendung, Auswirkung (FR-003); figures Aussehen and, for free text
        # below the looks, Wesen und Geschichte (ADR-078, ADR-083); from the one list (ADR-091).
        template = template_for(checked)
        if template and not body.strip():
            body = template
        header = entry_header({}, clean_name, clean_aliases(aliases), checked, status)
        document = self._store.write(
            entry_path(world_id, checked, entry_id), header, body, create=True
        )
        return entry_from(document)

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
        """Change a canon entry; the identifier stays, other header fields are kept."""
        path = self.existing_path(world_id, entry_id)
        document = self._store.read(path)
        current = entry_from(document)
        new_category = current.category if isinstance(category, Keep) else category
        new_category = checked_category(new_category)
        header = entry_header(
            document.header,
            current.name if isinstance(name, Keep) else required_text(name, "Name des Eintrags"),
            list(current.aliases) if isinstance(aliases, Keep) else clean_aliases(aliases),
            new_category,
            current.status if isinstance(status, Keep) else status,
        )
        new_body = current.body if isinstance(body, Keep) else body
        new_path = entry_path(world_id, new_category, entry_id)
        updated = self._store.write(new_path, header, new_body)
        if new_path != path:
            self._store.delete(path)
        return entry_from(updated)

    def delete_entry(self, world_id: str, entry_id: str) -> tuple[str, ...]:
        """Delete the entry's file; returns the names of its images, which stay to be deleted."""
        path = self.existing_path(world_id, entry_id)
        document = self._store.read(path)
        # Read leniently: an entry whose image list was broken by hand can still be deleted;
        # only names that pass the check are deleted with it.
        try:
            images = images_of(document)
        except InvalidInput:
            images = ()
        self._store.delete(path)
        return images

    def find_entries(self, world_id: str, text: str) -> list[CanonEntry]:
        """Entries of a world whose name or alias starts with ``text`` (``@`` menu)."""
        self._worlds.get_world(world_id)
        return [
            entry_from(self._store.read(hit.path))
            for hit in self._store.search(world_id, text, "name")
            if is_entry_path(hit.path)
        ]

    def existing_path(self, world_id: str, entry_id: str) -> str:
        """Path of an existing entry; raises ``NotFound`` if world or entry does not exist."""
        self._worlds.get_world(world_id)
        path = self.find_entry_path(world_id, entry_id)
        if path is None:
            raise NotFound(f"{world_id}/{entry_id}")
        return path

    def find_entry_path(self, world_id: str, entry_id: str) -> str | None:
        """Path of the entry in whichever category it lies, or ``None``."""
        checked_identifier(entry_id)
        for category in CATEGORIES:
            path = entry_path(world_id, category, entry_id)
            try:
                self._store.read(path)
            except NotFound:
                continue
            return path
        return None

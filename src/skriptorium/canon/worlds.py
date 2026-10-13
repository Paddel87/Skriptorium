"""Worlds: list, read, create and change."""

from pathlib import PurePosixPath

from skriptorium.canon.headers import world_from
from skriptorium.canon.layout import WORLD_FILE, WORLDS, world_path
from skriptorium.canon.models import KEEP, Keep, World
from skriptorium.canon.validation import required_text
from skriptorium.storage import DocumentStore, slugify


class WorldStore:
    """Creates and changes the world files."""

    def __init__(self, store: DocumentStore) -> None:
        """Use ``store`` for all files."""
        self._store = store

    def list_worlds(self) -> list[World]:
        """All worlds, sorted by name."""
        paths = [
            path
            for path in self._store.list_paths(WORLDS)
            if len(PurePosixPath(path).parts) == 3 and path.endswith(f"/{WORLD_FILE}")
        ]
        worlds = [world_from(self._store.read(path)) for path in paths]
        return sorted(worlds, key=lambda world: (world.name.casefold(), world.id))

    def get_world(self, world_id: str) -> World:
        """One world; raises ``NotFound`` if it does not exist."""
        return world_from(self._store.read(world_path(world_id)))

    def create_world(self, name: str, description: str = "") -> World:
        """Create a world; its identifier is derived from ``name``."""
        clean_name = required_text(name, "Name der Welt")
        world_id = slugify(clean_name)
        document = self._store.write(
            world_path(world_id), {"name": clean_name}, description, create=True
        )
        return world_from(document)

    def update_world(
        self,
        world_id: str,
        *,
        name: str | Keep = KEEP,
        description: str | Keep = KEEP,
    ) -> World:
        """Change name or description of a world; the identifier stays."""
        path = world_path(world_id)
        document = self._store.read(path)
        header = dict(document.header)
        if not isinstance(name, Keep):
            header["name"] = required_text(name, "Name der Welt")
        body = document.body if isinstance(description, Keep) else description
        return world_from(self._store.write(path, header, body))

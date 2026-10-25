"""Images of canon entries (step 7.6, ADR-072)."""

import contextlib
import secrets

from skriptorium.canon.entries import EntryStore
from skriptorium.canon.headers import entry_from
from skriptorium.canon.layout import IMAGES, MAX_IMAGES_PER_ENTRY, image_path, image_prefix
from skriptorium.canon.models import CanonEntry
from skriptorium.storage import (
    IMAGE_SUFFIXES,
    Document,
    DocumentStore,
    HeaderValue,
    ImageOrigin,
    InvalidInput,
    NotFound,
    inspect_image,
)


class ImageStore:
    """Adds, reads, orders and removes the images of the canon entries."""

    def __init__(self, store: DocumentStore, entries: EntryStore) -> None:
        """Use ``store`` for all files and ``entries`` to find the entry an image belongs to."""
        self._store = store
        self._entries = entries

    def add_entry_image(
        self, world_id: str, entry_id: str, data: bytes, origin: ImageOrigin | None = None
    ) -> CanonEntry:
        """Store an image and append it to the entry; the first image is the main image."""
        path = self._entries.existing_path(world_id, entry_id)
        document = self._store.read(path)
        current = entry_from(document)
        if len(current.images) >= MAX_IMAGES_PER_ENTRY:
            raise InvalidInput(f"Höchstens {MAX_IMAGES_PER_ENTRY} Bilder je Eintrag")
        suffix = IMAGE_SUFFIXES[inspect_image(data).kind]
        name = f"{image_prefix(entry_id)}{secrets.token_hex(6)}{suffix}"
        self._store.write_image(image_path(world_id, name), data, origin=origin)
        try:
            return self._write_images(document, [*current.images, name])
        except BaseException:
            self.delete_image_file(world_id, name)
            raise

    def entry_image(self, world_id: str, entry_id: str, image: str) -> tuple[bytes, str]:
        """The bytes and media type of one image of an entry."""
        if image not in self._entries.get_entry(world_id, entry_id).images:
            raise NotFound(f"{world_id}/{entry_id}/{IMAGES}")
        return self._store.read_image(image_path(world_id, image))

    def entry_image_origin(self, world_id: str, entry_id: str, image: str) -> ImageOrigin | None:
        """The origin of one image of an entry, ``None`` if it has none (ADR-095)."""
        if image not in self._entries.get_entry(world_id, entry_id).images:
            raise NotFound(f"{world_id}/{entry_id}/{IMAGES}")
        return self._store.read_image_origin(image_path(world_id, image))

    def remove_entry_image(self, world_id: str, entry_id: str, image: str) -> CanonEntry:
        """Remove an image from the entry and delete its file."""
        document = self._store.read(self._entries.existing_path(world_id, entry_id))
        images = list(entry_from(document).images)
        if image not in images:
            raise NotFound(f"{world_id}/{entry_id}/{IMAGES}")
        images.remove(image)
        updated = self._write_images(document, images)
        self.delete_image_file(world_id, image)
        return updated

    def set_main_image(self, world_id: str, entry_id: str, image: str) -> CanonEntry:
        """Make one of the entry's images its main image (first place)."""
        document = self._store.read(self._entries.existing_path(world_id, entry_id))
        images = list(entry_from(document).images)
        if image not in images:
            raise NotFound(f"{world_id}/{entry_id}/{IMAGES}")
        images.remove(image)
        return self._write_images(document, [image, *images])

    def delete_image_file(self, world_id: str, image: str) -> None:
        """Delete an image file; one already gone (deleted by hand) is not an error."""
        with contextlib.suppress(NotFound):
            self._store.delete_image(image_path(world_id, image))

    def _write_images(self, document: Document, images: list[str]) -> CanonEntry:
        header = dict(document.header)
        if images:
            header[IMAGES] = list[HeaderValue](images)
        else:
            header.pop(IMAGES, None)
        return entry_from(self._store.write(document.path, header, document.body))

"""File storage and search index of the Skriptorium (module ``storage``).

Markdown files with a YAML header are the source of truth; the SQLite index is derived
from them and can be rebuilt at any time (ADR-003).
"""

from skriptorium.storage.errors import AlreadyExists, InvalidInput, NotFound, StorageError
from skriptorium.storage.frontmatter import HeaderValue
from skriptorium.storage.identifiers import checked_identifier, slugify
from skriptorium.storage.images import (
    IMAGE_SUFFIXES,
    MAX_IMAGE_BYTES,
    ImageInfo,
    ImageKind,
    inspect_image,
)
from skriptorium.storage.store import Document, DocumentStore, SearchHit, SearchMode

__all__ = [
    "IMAGE_SUFFIXES",
    "MAX_IMAGE_BYTES",
    "AlreadyExists",
    "Document",
    "DocumentStore",
    "HeaderValue",
    "ImageInfo",
    "ImageKind",
    "InvalidInput",
    "NotFound",
    "SearchHit",
    "SearchMode",
    "StorageError",
    "checked_identifier",
    "inspect_image",
    "slugify",
]

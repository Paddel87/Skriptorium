"""Paths and limits of the canon files below the data directory (docs/architecture.md section 7)."""

import re
from pathlib import PurePosixPath
from typing import Final

from skriptorium.canon.categories import CATEGORIES, Category
from skriptorium.storage import checked_identifier

WORLDS: Final = "worlds"
WORLD_FILE: Final = "world.md"
CANON: Final = "canon"
IMAGES: Final = "bilder"
MAPS: Final = "karten"
MARKERS: Final = "marken"
MAX_MAPS_PER_WORLD: Final = 20
MAX_MARKERS_PER_MAP: Final = 200
MAX_IMAGES_PER_ENTRY: Final = 12
# Names of map files as this module creates them; nothing else is ever read or served.
MAP_FILE: Final = re.compile(r"karte-[0-9a-f]{12}\.(?:png|jpg|webp)")
# Names of image files as this module creates them; nothing else is ever read or served.
IMAGE_NAME: Final = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\.(?:png|jpg|webp)")


def world_path(world_id: str) -> str:
    return f"{WORLDS}/{checked_identifier(world_id)}/{WORLD_FILE}"


def entry_path(world_id: str, category: Category, entry_id: str) -> str:
    return f"{WORLDS}/{checked_identifier(world_id)}/{CANON}/{category}/{entry_id}.md"


def map_path(world_id: str, file: str) -> str:
    return f"{WORLDS}/{checked_identifier(world_id)}/{MAPS}/{file}"


def image_path(world_id: str, image: str) -> str:
    return f"{WORLDS}/{checked_identifier(world_id)}/{IMAGES}/{image}"


def is_entry_path(path: str) -> bool:
    parts = PurePosixPath(path).parts
    return len(parts) == 5 and parts[2] == CANON and parts[3] in CATEGORIES


def image_prefix(entry_id: str) -> str:
    """Start of the file names of an entry's images; ties each file to one entry."""
    return f"{entry_id[:60].rstrip('-')}-"

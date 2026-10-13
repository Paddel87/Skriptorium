"""Data classes of the canon module and the marker for "leave unchanged" in updates."""

from dataclasses import dataclass
from enum import Enum
from typing import Final

from skriptorium.canon.categories import Category


class Keep(Enum):
    """Marker for "leave this field unchanged" in updates."""

    KEEP = "keep"


KEEP: Final = Keep.KEEP


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

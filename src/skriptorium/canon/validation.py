"""Checks of caller input: categories, names, aliases and map markers."""

import re
from collections.abc import Sequence
from typing import Final

from skriptorium.canon.categories import CATEGORIES, Category
from skriptorium.canon.models import MapMarker
from skriptorium.storage import InvalidInput, checked_identifier

_MAP_NAME_LENGTH: Final = 200
# Control characters (line breaks included) and the marks that turn the writing direction.
_MAP_NAME_REFUSED = re.compile(r"[\x00-\x1f\x7f-\x9f\u200e\u200f\u202a-\u202e\u2066-\u2069]")


def checked_category(category: str) -> Category:
    if category not in CATEGORIES:
        raise InvalidInput(f"Unbekannte Kategorie: {category!r}")
    return category


def required_text(value: str, label: str) -> str:
    text = value.strip()
    if not text:
        raise InvalidInput(f"{label} darf nicht leer sein")
    return text


def clean_aliases(aliases: Sequence[str]) -> list[str]:
    if isinstance(aliases, str):
        raise InvalidInput("Aliasse müssen eine Liste sein")
    return [required_text(alias, "Alias") for alias in aliases]


def map_name(name: str) -> str:
    clean = required_text(name, "Name der Karte")
    if len(clean) > _MAP_NAME_LENGTH:
        raise InvalidInput(f"Name der Karte ist länger als {_MAP_NAME_LENGTH} Zeichen")
    if _MAP_NAME_REFUSED.search(clean):
        raise InvalidInput("Name der Karte enthält Steuerzeichen")
    return clean


def is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def check_marker(marker: MapMarker) -> None:
    checked_identifier(marker.entry)
    for share in (marker.x, marker.y):
        if not is_number(share):
            raise InvalidInput("Lage einer Markierung muss eine Zahl sein")
        # Also refuses NaN, which compares false with everything.
        if not 0 <= share <= 1:
            raise InvalidInput("Markierung liegt außerhalb der Karte")

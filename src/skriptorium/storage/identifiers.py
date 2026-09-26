"""Identifiers derived from names; they are used as file and directory names."""

import re

from skriptorium.storage.errors import InvalidInput

_TRANSLITERATION = str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"})


def slugify(name: str) -> str:
    """Derive an identifier from a name: ``"Kael der Ältere"`` → ``"kael-der-aeltere"``.

    Raises:
        InvalidInput: The name contains no letters or digits.
    """
    text = name.strip().lower().translate(_TRANSLITERATION)
    slug = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    if not slug:
        raise InvalidInput(f"Aus {name!r} lässt sich keine Kennung bilden")
    return slug


def checked_identifier(identifier: str) -> str:
    """Return ``identifier`` if it is a valid identifier.

    Raises:
        InvalidInput: ``identifier`` is not what :func:`slugify` would produce from it.
    """
    if identifier != slugify(identifier):
        raise InvalidInput(f"Ungültige Kennung: {identifier!r}")
    return identifier

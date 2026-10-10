"""The owner's model favorites, the models of the selection field (roadmap step 5.12, ADR-055).

``system/modelle.md`` holds a header field ``favoriten``: the list of model identifiers in the
chosen order. Without the file the start favorites apply.
"""

import threading
from collections.abc import Collection, Sequence
from typing import Final

from skriptorium.storage import DocumentStore, InvalidInput, NotFound

PATH: Final = "system/modelle.md"
START: Final = ("x-ai/grok-4.6", "qwen/qwen3.8-max-0902")
MAX_FAVORITES: Final = 50


class Favorites:
    """Reads and writes the favorites list."""

    def __init__(self, store: DocumentStore) -> None:
        """Use ``store`` for ``system/modelle.md``."""
        self._store = store
        self._lock = threading.Lock()

    def get(self) -> list[str]:
        """The favorites; the start favorites if none were saved.

        Raises:
            InvalidInput: The file is broken.
        """
        try:
            header = self._store.read(PATH).header
        except NotFound:
            return list(START)
        items = header.get("favoriten")
        if not isinstance(items, list) or not all(isinstance(item, str) for item in items):
            raise InvalidInput(f"{PATH}: Feld 'favoriten' muss eine Liste von Kennungen sein")
        return [item for item in items if isinstance(item, str)]

    def set(self, models: Sequence[str], selectable: Collection[str]) -> list[str]:
        """Save ``models`` without duplicates, keeping the order.

        A model already in the favorites stays allowed even if it is not ``selectable`` now
        (e.g. while the catalog cannot be loaded).

        Raises:
            InvalidInput: Too many models or a model that is neither selectable nor a favorite.
        """
        wanted = list(dict.fromkeys(models))
        if len(wanted) > MAX_FAVORITES:
            raise InvalidInput(f"Höchstens {MAX_FAVORITES} Favoriten")
        with self._lock:
            current = set(self.get())
            unknown = [
                model for model in wanted if model not in selectable and model not in current
            ]
            if unknown:
                raise InvalidInput(f"Unbekanntes Modell: {unknown[0]}")
            self._store.write(PATH, {"favoriten": list(wanted)}, "")
        return wanted

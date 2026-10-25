"""The owner's model favorites and the model per task (roadmap steps 5.12 and 9.7, ADR-055,
ADR-096).

``system/modelle.md`` holds two header fields: ``favoriten``, the list of model identifiers in
the chosen order, and ``aufgaben``, the model each task starts with. Without the file the start
favorites apply and no task has a model of its own.
"""

import threading
from collections.abc import Callable, Collection, Container, Mapping, Sequence
from typing import Any, Final, Literal, get_args

from skriptorium.storage import DocumentStore, InvalidInput, NotFound

PATH: Final = "system/modelle.md"
START: Final = ("x-ai/grok-4.6", "qwen/qwen3.8-max-0902")
MAX_FAVORITES: Final = 50

# The same names as the kinds of consumption (ADR-023).
Task = Literal[
    "schreiben",
    "weltenbau",
    "kurzfassung",
    "gesamtzusammenfassung",
    "bildbeschreibung",
    "aussehen",
    "bilderzeugung",
]
TASKS: Final[tuple[Task, ...]] = get_args(Task)


class Favorites:
    """Reads and writes the favorites list and the model per task."""

    def __init__(self, store: DocumentStore) -> None:
        """Use ``store`` for ``system/modelle.md``."""
        self._store = store
        self._lock = threading.Lock()

    def get(self) -> list[str]:
        """The favorites; the start favorites if none were saved.

        Raises:
            InvalidInput: The file is broken.
        """
        header = self._header()
        if "favoriten" not in header:
            return list(START)
        items = header["favoriten"]
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
            self._write("favoriten", wanted)
        return wanted

    def tasks(self) -> dict[Task, str]:
        """The saved model per task; a task without one is missing (ADR-096).

        Raises:
            InvalidInput: The file is broken.
        """
        items = self._header().get("aufgaben", {})
        if not isinstance(items, dict) or not all(
            isinstance(model, str) for model in items.values()
        ):
            raise InvalidInput(f"{PATH}: Feld 'aufgaben' muss Aufgaben Kennungen zuordnen")
        return {task: items[task] for task in TASKS if task in items}

    def set_tasks(
        self, models: Mapping[Task, str | None], allowed: Callable[[Task, str], bool]
    ) -> dict[Task, str]:
        """Save the model per task; ``None`` or a missing task returns it to the preset.

        A model already saved for a task stays allowed even if ``allowed`` rejects it now
        (e.g. while a catalog cannot be loaded).

        Raises:
            InvalidInput: A model that is neither allowed for its task nor already saved for it.
        """
        wanted = {task: model for task, model in models.items() if model is not None}
        with self._lock:
            current = self.tasks()
            for task, model in wanted.items():
                if current.get(task) != model and not allowed(task, model):
                    raise InvalidInput(f"Modell passt nicht zur Aufgabe {task}: {model}")
            saved = {task: wanted[task] for task in TASKS if task in wanted}
            self._write("aufgaben", saved)
        return saved

    def preset(self, task: Task, selectable: Container[str], fallback: str) -> str:
        """The model ``task`` starts with: the saved one if ``selectable``, else ``fallback``.

        Raises:
            InvalidInput: The file is broken.
        """
        saved = self.tasks().get(task)
        return saved if saved is not None and saved in selectable else fallback

    def _header(self) -> dict[str, Any]:
        try:
            return dict(self._store.read(PATH).header)
        except NotFound:
            return {}

    def _write(self, field: str, value: object) -> None:
        """Replace one header field and keep the others."""
        header = self._header()
        header[field] = value
        self._store.write(PATH, header, "")

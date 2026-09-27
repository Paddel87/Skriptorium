"""Consumption of the AI requests, one file per month (ADR-023, roadmap step 3.9).

``system/verbrauch/JJJJ-MM.md`` holds a header field ``anfragen``: one item per AI request with
``zeit`` (ISO 8601, UTC), ``art`` (schreiben, kurzfassung, gesamtzusammenfassung), ``modell``,
``ergebnis`` (``ok``, an error kind of the writing flow, ``leer`` or ``abgebrochen``),
``token_ein``, ``token_aus`` and ``kosten_usd`` (``null`` if the provider reported nothing).
No text, no world and no story; only metadata, as in the log (ADR-021).
"""

import logging
import re
import threading
from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import Final, Literal

from skriptorium.ai_gateway import Usage
from skriptorium.storage import DocumentStore, HeaderValue, InvalidInput, NotFound, StorageError

DIRECTORY: Final = "system/verbrauch"
_MONTH: Final = re.compile(r"\d{4}-(0[1-9]|1[0-2])")
_log = logging.getLogger("skriptorium.api.usage")

Kind = Literal["schreiben", "kurzfassung", "gesamtzusammenfassung"]


@dataclass(frozen=True)
class MonthUsage:
    """Sums of one month; ``without_cost`` counts requests the provider reported no cost for."""

    month: str
    requests: int
    input_tokens: int
    output_tokens: int
    cost_usd: float
    without_cost: int


class UsageLog:
    """Records every AI request of a month and sums them up."""

    def __init__(self, store: DocumentStore, clock: Callable[[], datetime]) -> None:
        """Use ``store`` for the files below ``system/verbrauch`` and ``clock`` (UTC)."""
        self._store = store
        self._clock = clock
        # Each record is a read-modify-write of the month's file.
        self._lock = threading.Lock()

    def record(self, kind: Kind, model: str, usage: Usage | None, outcome: str) -> None:
        """Add one request to the file of the current month.

        A write error is logged and swallowed: counting must never break writing.
        """
        now = self._clock()
        item: dict[str, HeaderValue] = {
            "zeit": now.isoformat(),
            "art": kind,
            "modell": model,
            "ergebnis": outcome,
            "token_ein": usage.input_tokens if usage else None,
            "token_aus": usage.output_tokens if usage else None,
            "kosten_usd": usage.cost_usd if usage else None,
        }
        path = _path(now.strftime("%Y-%m"))
        try:
            with self._lock:
                self._store.write(path, {"anfragen": [*self._items(path), item]}, "")
        except (StorageError, InvalidInput) as error:
            _log.warning("Verbrauch nicht gespeichert: %s", type(error).__name__)

    def month(self, month: str | None = None) -> MonthUsage:
        """Sums of ``month`` (``JJJJ-MM``), by default the current one.

        Raises:
            InvalidInput: ``month`` is not of the form ``JJJJ-MM`` or the file is broken.
        """
        wanted = month if month is not None else self._clock().strftime("%Y-%m")
        if not _MONTH.fullmatch(wanted):
            raise InvalidInput(f"Monat muss die Form JJJJ-MM haben: {wanted}")
        items = self._items(_path(wanted))
        costs = [item.get("kosten_usd") for item in items]
        return MonthUsage(
            month=wanted,
            requests=len(items),
            input_tokens=sum(_count(item.get("token_ein")) for item in items),
            output_tokens=sum(_count(item.get("token_aus")) for item in items),
            cost_usd=round(sum(_number(cost) for cost in costs), 6),
            without_cost=sum(1 for cost in costs if not _is_number(cost)),
        )

    def _items(self, path: str) -> list[dict[str, HeaderValue]]:
        try:
            header = self._store.read(path).header
        except NotFound:
            return []
        items = header.get("anfragen", [])
        if not isinstance(items, list) or not all(isinstance(item, dict) for item in items):
            raise InvalidInput(f"{path}: Feld 'anfragen' muss eine Liste sein")
        return [item for item in items if isinstance(item, dict)]


def _path(month: str) -> str:
    return f"{DIRECTORY}/{month}.md"


def _is_number(value: HeaderValue) -> bool:
    return isinstance(value, int | float) and not isinstance(value, bool)


def _number(value: HeaderValue) -> float:
    if isinstance(value, bool) or not isinstance(value, int | float):
        return 0.0
    return float(value)


def _count(value: HeaderValue) -> int:
    return value if isinstance(value, int) and not isinstance(value, bool) else 0

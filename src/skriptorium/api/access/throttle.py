"""Limit of failed attempts per client address (ASVS 6.1.1, 6.3.1, ADR-017).

Only the address that failed is blocked; there is no global lockout, so nobody can lock the
owner out by guessing from elsewhere.
"""

import threading
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Final

MAX_FAILURES: Final = 10
WINDOW: Final = timedelta(minutes=15)


class FailureThrottle:
    """Counts failures per client within a sliding window."""

    def __init__(self, clock: Callable[[], datetime]) -> None:
        """Use ``clock`` as the source of the current time."""
        self._clock = clock
        self._lock = threading.Lock()
        self._failures: dict[str, list[datetime]] = {}

    def blocked(self, client: str) -> bool:
        """Whether ``client`` has used up its attempts in the current window."""
        with self._lock:
            return len(self._recent(client)) >= MAX_FAILURES

    def record_failure(self, client: str) -> None:
        """Count one failed attempt of ``client``."""
        with self._lock:
            self._failures[client] = [*self._recent(client), self._clock()]

    def _recent(self, client: str) -> list[datetime]:
        start = self._clock() - WINDOW
        recent = [moment for moment in self._failures.get(client, []) if moment > start]
        if recent:
            self._failures[client] = recent
        else:
            self._failures.pop(client, None)
        return recent

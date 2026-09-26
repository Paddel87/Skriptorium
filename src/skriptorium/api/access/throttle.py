"""Limit of failed attempts per client address (ASVS 6.1.1, 6.3.1, ADR-017).

Only the address that failed is blocked; there is no global lockout, so nobody can lock the
owner out by guessing from elsewhere. Every attempt is counted *before* the password is
checked and taken back on success, so parallel requests cannot exceed the limit.
"""

import threading
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Final

MAX_FAILURES: Final = 10
WINDOW: Final = timedelta(minutes=15)


class FailureThrottle:
    """Counts attempts per client within a sliding window."""

    def __init__(self, clock: Callable[[], datetime]) -> None:
        """Use ``clock`` as the source of the current time."""
        self._clock = clock
        self._lock = threading.Lock()
        self._attempts: dict[str, list[datetime]] = {}

    def begin(self, client: str) -> datetime | None:
        """Reserve one attempt for ``client``; ``None`` if its attempts are used up.

        The reservation counts as a failure until :meth:`succeeded` takes it back.
        """
        with self._lock:
            recent = self._recent(client)
            if len(recent) >= MAX_FAILURES:
                return None
            moment = self._clock()
            self._attempts[client] = [*recent, moment]
            return moment

    def succeeded(self, client: str, moment: datetime) -> None:
        """Take back the attempt reserved at ``moment``: it did not fail."""
        with self._lock:
            attempts = self._attempts.get(client, [])
            if moment in attempts:
                attempts.remove(moment)
            if not attempts:
                self._attempts.pop(client, None)

    def _recent(self, client: str) -> list[datetime]:
        start = self._clock() - WINDOW
        return [moment for moment in self._attempts.get(client, []) if moment > start]

"""Limit of failed attempts per client address (ASVS 6.1.1, 6.3.1, ADR-017).

Only the address that failed is blocked; there is no global lockout, so nobody can lock the
owner out by guessing from elsewhere. Attempts of the same address run one after the other,
so parallel requests can neither exceed the limit nor block correct attempts; only real
failures are counted.
"""

import threading
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from datetime import datetime, timedelta
from typing import Final

MAX_FAILURES: Final = 10
WINDOW: Final = timedelta(minutes=15)


class Blocked(Exception):  # noqa: N818 - name follows the error names of the api module
    """The client has used up its attempts in the current window."""


class Attempt:
    """One attempt; call :meth:`fail` if it failed."""

    def __init__(self) -> None:
        """Start as not failed."""
        self.failed = False

    def fail(self) -> None:
        """Count this attempt as a failure."""
        self.failed = True


class FailureThrottle:
    """Counts failures per client within a sliding window."""

    def __init__(self, clock: Callable[[], datetime]) -> None:
        """Use ``clock`` as the source of the current time."""
        self._clock = clock
        self._lock = threading.Lock()
        self._failures: dict[str, list[datetime]] = {}
        # Per-client lock with the number of requests holding or waiting for it.
        self._client_locks: dict[str, tuple[threading.Lock, int]] = {}

    @contextmanager
    def attempt(self, client: str) -> Iterator[Attempt]:
        """Run one attempt of ``client`` exclusively; a failed one is counted at the end.

        Raises:
            Blocked: ``client`` has used up its attempts; nothing runs.
        """
        client_lock = self._acquire_client_lock(client)
        try:
            with client_lock:
                with self._lock:
                    if len(self._recent(client)) >= MAX_FAILURES:
                        raise Blocked(client)
                current = Attempt()
                try:
                    yield current
                finally:
                    if current.failed:
                        with self._lock:
                            self._failures[client] = [*self._recent(client), self._clock()]
        finally:
            self._release_client_lock(client)

    def _acquire_client_lock(self, client: str) -> threading.Lock:
        with self._lock:
            lock, users = self._client_locks.get(client, (threading.Lock(), 0))
            self._client_locks[client] = (lock, users + 1)
            return lock

    def _release_client_lock(self, client: str) -> None:
        with self._lock:
            lock, users = self._client_locks[client]
            if users == 1:
                del self._client_locks[client]
            else:
                self._client_locks[client] = (lock, users - 1)

    def _recent(self, client: str) -> list[datetime]:
        start = self._clock() - WINDOW
        recent = [moment for moment in self._failures.get(client, []) if moment > start]
        if recent:
            self._failures[client] = recent
        else:
            self._failures.pop(client, None)
        return recent

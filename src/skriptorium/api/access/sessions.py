"""Server-side sessions held in memory (ASVS V7, ADR-017).

A restart of the server ends all sessions. Tokens are reference tokens with 256 bits of
randomness; only their SHA-256 hash is kept, so the store never holds a usable token.
"""

import hashlib
import secrets
import threading
from collections.abc import Callable
from dataclasses import dataclass, replace
from datetime import datetime, timedelta
from typing import Final

IDLE_TIMEOUT: Final = timedelta(days=7)
ABSOLUTE_LIFETIME: Final = timedelta(days=30)
MAX_SESSIONS: Final = 5
_TOKEN_BYTES: Final = 32
_ID_BYTES: Final = 9
_CLIENT_CHARS: Final = 120


@dataclass(frozen=True)
class Session:
    """One active session; ``id`` is public, the token is not stored."""

    id: str
    created: datetime
    last_seen: datetime
    client: str


class SessionStore:
    """Creates, checks and ends sessions."""

    def __init__(self, clock: Callable[[], datetime]) -> None:
        """Use ``clock`` (timezone-aware) as the source of the current time."""
        self._clock = clock
        self._lock = threading.Lock()
        self._by_token: dict[str, Session] = {}

    def create(self, client: str) -> tuple[str, Session]:
        """Start a session; returns the token for the cookie and the session.

        With more than ``MAX_SESSIONS`` sessions the oldest one ends.
        """
        now = self._clock()
        token = secrets.token_urlsafe(_TOKEN_BYTES)
        session = Session(
            id=secrets.token_urlsafe(_ID_BYTES),
            created=now,
            last_seen=now,
            client=client[:_CLIENT_CHARS],
        )
        with self._lock:
            self._drop_expired(now)
            self._by_token[_digest(token)] = session
            while len(self._by_token) > MAX_SESSIONS:
                oldest = min(self._by_token.items(), key=lambda item: item[1].created)
                del self._by_token[oldest[0]]
        return token, session

    def touch(self, token: str) -> Session | None:
        """The session for ``token`` with updated activity, or ``None`` if not valid."""
        now = self._clock()
        key = _digest(token)
        with self._lock:
            session = self._by_token.get(key)
            if session is None:
                return None
            if _expired(session, now):
                del self._by_token[key]
                return None
            session = replace(session, last_seen=now)
            self._by_token[key] = session
            return session

    def renew(self, token: str) -> tuple[str, Session] | None:
        """Replace the token of a valid session by a new one (ASVS 7.2.4)."""
        session = self.touch(token)
        if session is None:
            return None
        new_token = secrets.token_urlsafe(_TOKEN_BYTES)
        with self._lock:
            self._by_token.pop(_digest(token), None)
            self._by_token[_digest(new_token)] = session
        return new_token, session

    def end(self, token: str) -> None:
        """End the session for ``token``; unknown tokens are ignored."""
        with self._lock:
            self._by_token.pop(_digest(token), None)

    def end_by_id(self, session_id: str) -> bool:
        """End the session with public ``session_id``; whether it existed."""
        with self._lock:
            for key, session in list(self._by_token.items()):
                if session.id == session_id:
                    del self._by_token[key]
                    return True
        return False

    def end_all(self, *, except_id: str | None = None) -> None:
        """End all sessions, optionally keeping the one with ``except_id``."""
        with self._lock:
            for key, session in list(self._by_token.items()):
                if session.id != except_id:
                    del self._by_token[key]

    def list(self) -> list[Session]:
        """All valid sessions, newest first."""
        now = self._clock()
        with self._lock:
            self._drop_expired(now)
            sessions = list(self._by_token.values())
        return sorted(sessions, key=lambda session: session.created, reverse=True)

    def _drop_expired(self, now: datetime) -> None:
        for key, session in list(self._by_token.items()):
            if _expired(session, now):
                del self._by_token[key]


def _expired(session: Session, now: datetime) -> bool:
    return now - session.last_seen >= IDLE_TIMEOUT or now - session.created >= ABSOLUTE_LIFETIME


def _digest(token: str) -> str:
    return hashlib.sha256(token.encode("ascii", errors="replace")).hexdigest()

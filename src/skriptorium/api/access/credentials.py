"""Stored credentials in ``system/zugang.md`` (ADR-017, data model section 7).

Header fields: ``passwort_hash``, ``passwort_geaendert``, ``einrichtungscode_hash``,
``einrichtungscode_gueltig_bis``. Times are ISO 8601 text in UTC.
"""

import secrets
import threading
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Final

from skriptorium.api.access.passwords import PasswordHasher
from skriptorium.storage import DocumentStore, HeaderValue, NotFound

PATH: Final = "system/zugang.md"
SETUP_CODE_LIFETIME: Final = timedelta(hours=24)
# Capital letters and digits without look-alikes (0/O, 1/I/L): 31 characters (ADR-041).
SETUP_CODE_ALPHABET: Final = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"
# 12 characters, about 59 bits: enough against online guessing at 10 failures per address
# in 15 minutes over the 24 hours of validity (ASVS 6.4.1, ADR-041).
SETUP_CODE_LENGTH: Final = 12
_SETUP_CODE_GROUP: Final = 3


class SetupCodeInvalid(Exception):  # noqa: N818 - name follows the error names of the api module
    """The setup code is wrong, used or expired."""


class CredentialStore:
    """Reads and changes the stored password hash and the one-time setup code."""

    def __init__(
        self, store: DocumentStore, hasher: PasswordHasher, clock: Callable[[], datetime]
    ) -> None:
        """Use ``store`` for ``system/zugang.md``, ``hasher`` and ``clock``."""
        self._store = store
        self._hasher = hasher
        self._clock = clock
        # Every read-modify-write of the file runs under this lock, so a setup code is
        # used at most once and no change is lost (ASVS 6.4.1).
        self._lock = threading.Lock()

    def has_password(self) -> bool:
        """Whether a password has been set."""
        return bool(self._header().get("passwort_hash"))

    def verify_password(self, password: str) -> bool:
        """Whether ``password`` is the stored password; ``False`` if none is set."""
        stored = self._header().get("passwort_hash")
        if not isinstance(stored, str) or not stored:
            return False
        return self._hasher.verify(password, stored)

    def set_password(self, password: str) -> None:
        """Store the hash of ``password``; an open setup code stays valid."""
        new_hash = self._hasher.hash(password)
        with self._lock:
            header = self._header()
            header["passwort_hash"] = new_hash
            header["passwort_geaendert"] = self._clock().isoformat()
            self._write(header)

    def create_setup_code(self) -> str:
        """Create a new setup code, store its hash and return it once.

        The code is shown in groups of three, e.g. ``K7Q-M3X-RAP-H9D`` (ADR-041).
        """
        raw = "".join(secrets.choice(SETUP_CODE_ALPHABET) for _ in range(SETUP_CODE_LENGTH))
        # scrypt like the password: about 59 bits are too few for a fast hash if the file
        # leaks, e.g. through a backup (ASVS 11.4.2, ADR-041).
        code_hash = self._hasher.hash(raw)
        with self._lock:
            header = self._header()
            header["einrichtungscode_hash"] = code_hash
            valid_until = self._clock() + SETUP_CODE_LIFETIME
            header["einrichtungscode_gueltig_bis"] = valid_until.isoformat()
            self._write(header)
        return "-".join(
            raw[start : start + _SETUP_CODE_GROUP]
            for start in range(0, SETUP_CODE_LENGTH, _SETUP_CODE_GROUP)
        )

    def setup_code_valid(self, code: str) -> bool:
        """Whether ``code`` is the stored, unexpired setup code."""
        return self._code_valid(self._header(), code)

    def set_password_with_code(self, code: str, password: str) -> None:
        """Set the password using the setup code; the code is used up.

        Raises:
            SetupCodeInvalid: No code, wrong code or expired code.
        """
        new_hash = self._hasher.hash(password)
        with self._lock:
            header = self._header()
            if not self._code_valid(header, code):
                raise SetupCodeInvalid
            del header["einrichtungscode_hash"]
            del header["einrichtungscode_gueltig_bis"]
            header["passwort_hash"] = new_hash
            header["passwort_geaendert"] = self._clock().isoformat()
            self._write(header)

    def _code_valid(self, header: dict[str, HeaderValue], code: str) -> bool:
        stored = header.get("einrichtungscode_hash")
        valid_until = header.get("einrichtungscode_gueltig_bis")
        if not isinstance(stored, str) or not isinstance(valid_until, str):
            return False
        if self._clock() >= datetime.fromisoformat(valid_until):
            return False
        return self._hasher.verify(_normalize_code(code), stored)

    def _header(self) -> dict[str, HeaderValue]:
        try:
            return dict(self._store.read(PATH).header)
        except NotFound:
            return {}

    def _write(self, header: dict[str, HeaderValue]) -> None:
        self._store.write(PATH, header, "")


def _normalize_code(code: str) -> str:
    """The code as stored: capital letters, without hyphens and whitespace (ADR-041)."""
    return "".join(char for char in code.upper() if char != "-" and not char.isspace())

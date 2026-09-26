"""Stored credentials in ``system/zugang.md`` (ADR-017, data model section 7).

Header fields: ``passwort_hash``, ``passwort_geaendert``, ``einrichtungscode_hash``,
``einrichtungscode_gueltig_bis``. Times are ISO 8601 text in UTC.
"""

import hashlib
import hmac
import secrets
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import Final

from skriptorium.api.access.passwords import PasswordHasher
from skriptorium.storage import DocumentStore, HeaderValue, NotFound

PATH: Final = "system/zugang.md"
SETUP_CODE_LIFETIME: Final = timedelta(hours=24)
_SETUP_CODE_BYTES: Final = 16


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
        header = self._header()
        header["passwort_hash"] = self._hasher.hash(password)
        header["passwort_geaendert"] = self._clock().isoformat()
        self._write(header)

    def create_setup_code(self) -> str:
        """Create a new setup code (128 bits), store its hash and return it once."""
        code = secrets.token_urlsafe(_SETUP_CODE_BYTES)
        header = self._header()
        header["einrichtungscode_hash"] = _code_digest(code)
        header["einrichtungscode_gueltig_bis"] = (self._clock() + SETUP_CODE_LIFETIME).isoformat()
        self._write(header)
        return code

    def setup_code_valid(self, code: str) -> bool:
        """Whether ``code`` is the stored, unexpired setup code."""
        return self._code_valid(self._header(), code)

    def set_password_with_code(self, code: str, password: str) -> None:
        """Set the password using the setup code; the code is used up.

        Raises:
            SetupCodeInvalid: No code, wrong code or expired code.
        """
        header = self._header()
        if not self._code_valid(header, code):
            raise SetupCodeInvalid
        del header["einrichtungscode_hash"]
        del header["einrichtungscode_gueltig_bis"]
        header["passwort_hash"] = self._hasher.hash(password)
        header["passwort_geaendert"] = self._clock().isoformat()
        self._write(header)

    def _code_valid(self, header: dict[str, HeaderValue], code: str) -> bool:
        stored = header.get("einrichtungscode_hash")
        valid_until = header.get("einrichtungscode_gueltig_bis")
        if not isinstance(stored, str) or not isinstance(valid_until, str):
            return False
        if not hmac.compare_digest(_code_digest(code), stored):
            return False
        return self._clock() < datetime.fromisoformat(valid_until)

    def _header(self) -> dict[str, HeaderValue]:
        try:
            return dict(self._store.read(PATH).header)
        except NotFound:
            return {}

    def _write(self, header: dict[str, HeaderValue]) -> None:
        self._store.write(PATH, header, "")


def _code_digest(code: str) -> str:
    # 128 bits of randomness: a standard hash is sufficient (ASVS 6.5.2).
    return hashlib.sha256(code.encode("utf-8")).hexdigest()

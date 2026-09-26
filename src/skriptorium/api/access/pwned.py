"""Check against breached passwords with Have I Been Pwned "Pwned Passwords" (ADR-017).

Only the first five hex characters of the password's SHA-1 hash leave the server
(k-anonymity); responses are padded. Data licensed under CC BY 4.0 by haveibeenpwned.com.
"""

import hashlib
from typing import Final, Protocol

import httpx

_RANGE_URL: Final = "https://api.pwnedpasswords.com/range/"
_TIMEOUT_SECONDS: Final = 10.0


class PwnedUnavailable(Exception):  # noqa: N818 - name follows the error names of the api module
    """The breached-password service could not be asked."""


class BreachedPasswordCheck(Protocol):
    """Anything that tells whether a password appears in known breaches."""

    def is_breached(self, password: str) -> bool:
        """Whether ``password`` appears in known breaches."""
        ...


class PwnedPasswords:
    """Client for the Pwned Passwords range API."""

    def __init__(self, transport: httpx.BaseTransport | None = None) -> None:
        """Create the client; ``transport`` replaces the network in tests."""
        self._transport = transport

    def is_breached(self, password: str) -> bool:
        """Whether ``password`` appears in Pwned Passwords.

        Raises:
            PwnedUnavailable: The service did not answer with a usable response.
        """
        digest = hashlib.sha1(password.encode("utf-8"), usedforsecurity=False)
        full = digest.hexdigest().upper()
        prefix, suffix = full[:5], full[5:]
        try:
            with httpx.Client(transport=self._transport, timeout=_TIMEOUT_SECONDS) as client:
                response = client.get(
                    _RANGE_URL + prefix,
                    headers={"Add-Padding": "true", "User-Agent": "Skriptorium"},
                )
        except httpx.HTTPError as error:
            raise PwnedUnavailable(type(error).__name__) from error
        if response.status_code != httpx.codes.OK:
            raise PwnedUnavailable(f"HTTP {response.status_code}")
        for line in response.text.splitlines():
            candidate, _, count = line.strip().partition(":")
            if candidate.upper() == suffix and count.strip() not in ("", "0"):
                return True
        return False

"""Password hashing with scrypt from the standard library (ASVS 11.4.2, ADR-017).

Stored form: ``scrypt$n=<N>,r=<r>,p=<p>$<salt>$<hash>`` with URL-safe Base64 without
padding. The parameters are stored with the hash, so a later change of the defaults keeps
old hashes verifiable.
"""

import base64
import hashlib
import hmac
import secrets
import threading
from typing import Final

# ASVS 5.0.0 appendix C: scrypt with p = 1 needs N >= 2^17 and r = 8.
DEFAULT_N: Final = 2**17
DEFAULT_R: Final = 8
DEFAULT_P: Final = 1
_SALT_BYTES: Final = 16
_KEY_BYTES: Final = 32
# At most two hash computations at once; each needs 128 * N * r bytes (128 MiB by default).
_CONCURRENT_HASHES: Final = 2


class PasswordHasher:
    """Hashes and verifies passwords."""

    def __init__(self, n: int = DEFAULT_N, r: int = DEFAULT_R, p: int = DEFAULT_P) -> None:
        """Use the scrypt cost parameters ``n``, ``r``, ``p`` for new hashes."""
        self._n = n
        self._r = r
        self._p = p
        self._slots = threading.BoundedSemaphore(_CONCURRENT_HASHES)

    def hash(self, password: str) -> str:
        """Hash ``password`` with a fresh random salt."""
        salt = secrets.token_bytes(_SALT_BYTES)
        key = self._derive(password, salt, self._n, self._r, self._p)
        return f"scrypt$n={self._n},r={self._r},p={self._p}${_encode(salt)}${_encode(key)}"

    def verify(self, password: str, stored: str) -> bool:
        """Whether ``password`` matches ``stored``; malformed hashes never match."""
        try:
            scheme, params, salt_text, key_text = stored.split("$")
            values = dict(item.split("=", 1) for item in params.split(","))
            n, r, p = int(values["n"]), int(values["r"]), int(values["p"])
            salt, expected = _decode(salt_text), _decode(key_text)
        except ValueError, KeyError:
            return False
        if scheme != "scrypt":
            return False
        return hmac.compare_digest(self._derive(password, salt, n, r, p), expected)

    def _derive(self, password: str, salt: bytes, n: int, r: int, p: int) -> bytes:
        with self._slots:
            return hashlib.scrypt(
                password.encode("utf-8"),
                salt=salt,
                n=n,
                r=r,
                p=p,
                maxmem=129 * n * r * p + 1024 * 1024,
                dklen=_KEY_BYTES,
            )


def _encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _decode(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))

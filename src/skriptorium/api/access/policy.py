"""Rules for new passwords (ASVS 6.1.2, 6.2.1, 6.2.4, 6.2.5, 6.2.9, 6.2.11, 6.2.12)."""

import re
from collections.abc import Iterable
from typing import Final, Literal

from skriptorium.api.access.pwned import BreachedPasswordCheck

MIN_LENGTH: Final = 15
MAX_LENGTH: Final = 128
# Documented context-specific words (ASVS 6.1.2); the names of the own worlds are added.
CONTEXT_WORDS: Final = ("skriptorium", "passwort", "password")
_MIN_CONTEXT_WORD_LENGTH: Final = 4
_WORD_SEPARATORS: Final = re.compile(r"[\W_]+")

RejectionReason = Literal["too_short", "too_long", "context_word", "breached"]


class PasswordRejected(Exception):  # noqa: N818 - name follows the error names of the api module
    """A new password does not satisfy the rules."""

    def __init__(self, reason: RejectionReason) -> None:
        """Remember why the password was rejected."""
        super().__init__(reason)
        self.reason: RejectionReason = reason


class PasswordPolicy:
    """Checks new passwords; any composition of characters is allowed (6.2.5)."""

    def __init__(self, breached: BreachedPasswordCheck) -> None:
        """Use ``breached`` for the check against breached passwords."""
        self._breached = breached

    def check(self, password: str, context_words: Iterable[str] = ()) -> None:
        """Accept ``password`` or raise.

        Length counts Unicode characters; the password is used exactly as given (6.2.8).

        Raises:
            PasswordRejected: The password breaks a rule.
            PwnedUnavailable: The breached-password service could not be asked.
        """
        if len(password) < MIN_LENGTH:
            raise PasswordRejected("too_short")
        if len(password) > MAX_LENGTH:
            raise PasswordRejected("too_long")
        folded = password.casefold()
        if any(word in folded for word in _words(context_words)):
            raise PasswordRejected("context_word")
        if self._breached.is_breached(password):
            raise PasswordRejected("breached")


def _words(context_words: Iterable[str]) -> set[str]:
    """The context words and each of their parts, from 4 characters on (e.g. "salzmark")."""
    words: set[str] = set()
    for phrase in (*CONTEXT_WORDS, *context_words):
        folded = phrase.casefold().strip()
        words.update({folded, *_WORD_SEPARATORS.split(folded)})
    return {word for word in words if len(word) >= _MIN_CONTEXT_WORD_LENGTH}

"""Finding names and aliases of canon entries in a text (step 9.1, ADR-091).

The same rule as ``ui/src/references.ts``; both sides are checked against the shared cases in
``tests/shared/names.json``. A name counts without regard to case and as a whole word: no letter
or digit right before it (before the ``@`` of a mention) and none right after it, except a
genitive "s" in small letters (``Kaels``, not ``KaelS``; step 5.23); an apostrophe after the
name (``Klaus'``) is no letter, so the name counts as well. Of several names starting at the same
place the longest wins (``Gunda Hollt`` before ``Gunda``).
"""

import re
from collections.abc import Iterable
from typing import Final

# A letter or digit; unlike ``\w`` without the underscore, as in the interface.
_LETTER: Final = r"[^\W_]"
_NOTHING: Final = re.compile(r"(?!)")


def name_pattern(labels: Iterable[str], *, mention: bool = False) -> re.Pattern[str]:
    """A pattern that finds any of ``labels``; with ``mention`` only after an ``@``.

    The group ``label`` holds the name as written in the text (without ``@`` and genitive).
    Without labels the pattern finds nothing.
    """
    ordered = sorted({label for label in labels if label}, key=lambda label: (-len(label), label))
    if not ordered:
        return _NOTHING
    alternatives = "|".join(re.escape(label) for label in ordered)
    at = "@" if mention else ""
    return re.compile(
        rf"(?<!{_LETTER}){at}(?P<label>{alternatives})(?-i:s)?(?!{_LETTER})", re.IGNORECASE
    )

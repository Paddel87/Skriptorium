"""Canon categories and the words that name them in imported material."""

from typing import Final, Literal, get_args

Category = Literal["figur", "ort", "gegenstand", "zeitlinie", "regel", "kultur"]
CATEGORIES: Final[tuple[Category, ...]] = get_args(Category)

_WORD_LISTS: Final[dict[Category, str]] = {
    "figur": "figur figuren person personen charakter charaktere",
    "ort": "ort orte geografie geographie schauplatz schauplätze land länder region regionen",
    "gegenstand": "gegenstand gegenstände artefakt artefakte objekt objekte",
    "zeitlinie": "zeitlinie zeitlinien chronik zeittafel",
    "regel": "regel regeln magie magiesystem gesetz gesetze",
    "kultur": "kultur kulturen volk völker religion religionen",
}
_WORDS: Final[dict[str, Category]] = {
    word: category for category, words in _WORD_LISTS.items() for word in words.split()
}


def category_for(text: str) -> Category | None:
    """The category named by ``text`` (e.g. "Figuren", "**Orte:**"), or ``None``."""
    word = text.strip().strip("*_:").strip().casefold()
    return _WORDS.get(word)

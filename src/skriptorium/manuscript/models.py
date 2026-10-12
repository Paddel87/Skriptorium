"""Data types and fixed lists of the module ``manuscript`` (re-exported by ``service``)."""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Final, Literal, get_args

Form = Literal["roman", "kurzgeschichte", "fragment"]
FORMS: Final[tuple[Form, ...]] = get_args(Form)
ChapterStatus = Literal["in-arbeit", "abgeschlossen"]
CHAPTER_STATUSES: Final[tuple[ChapterStatus, ...]] = get_args(ChapterStatus)
SummaryStatus = Literal["fehlt", "erzeugt", "geprüft"]
SUMMARY_STATUSES: Final[tuple[SummaryStatus, ...]] = get_args(SummaryStatus)

# Fixed lists of the atmospheric writing style (step 5.6, ADR-053); the order is the one in
# which the owner chose them. ``ui/src/views/WritingStyle.tsx`` keeps a copy that must match.
GENRES: Final[tuple[str, ...]] = (
    "Dark Romance",
    "Dark Erotic",
    "CNC",
    "Thriller",
    "Psychothriller",
    "düstere Geschichte",
    "Horror",
    "Dark Fantasy",
    "Krimi",
)
TONES: Final[tuple[str, ...]] = (
    "düster",
    "bedrückend",
    "kalt",
    "roh",
    "sinnlich",
    "zärtlich",
    "leidenschaftlich",
    "melancholisch",
    "bedrohlich",
    "nüchtern",
    "ironisch",
)
ATMOSPHERES: Final[tuple[str, ...]] = (
    "beklemmend",
    "angespannt",
    "unheimlich",
    "gefährlich",
    "schwül",
    "intim",
    "eisig",
    "hoffnungslos",
    "still",
    "fiebrig",
)
TEMPOS: Final[tuple[str, ...]] = ("langsam", "gemessen", "zügig", "atemlos")
STYLES: Final[tuple[str, ...]] = (
    "knapp",
    "schlicht",
    "bildhaft",
    "poetisch",
    "ausführlich",
    "dialogreich",
)
EXPLICITNESSES: Final[tuple[str, ...]] = ("angedeutet", "sinnlich", "explizit")
# Longest free text of a writing style. Other texts of the module have no limit; the request
# budget bounds this block, so the limit follows the owner's decision (ADR-053).
FREE_TEXT_MAX: Final = 1000


class Keep(Enum):
    """Marker for "leave this field unchanged" in updates."""

    KEEP = "keep"


KEEP: Final = Keep.KEEP


@dataclass(frozen=True)
class GuestLink:
    """A canon entry of another world bound into one story (FR-017)."""

    world: str
    entry: str


@dataclass(frozen=True)
class StoryFact:
    """A fact that holds only in one story (FR-024)."""

    entry: str
    fact: str


@dataclass(frozen=True)
class InstructionNote:
    """One taken-over exchange (step 5.13, FR-027, ADR-056): the author's instruction and the
    AI's text as it went into the manuscript, with the model that wrote it."""

    at: datetime
    instruction: str
    text: str
    model: str | None = None


@dataclass(frozen=True)
class WritingStyle:
    """Atmospheric writing style (step 5.6, ADR-053); the empty style has nothing set."""

    tone: tuple[str, ...] = ()
    atmosphere: tuple[str, ...] = ()
    style: tuple[str, ...] = ()
    tempo: str | None = None
    explicitness: str | None = None
    free: str = ""


@dataclass(frozen=True)
class Story:
    """A story with its settings and overall summary."""

    world: str
    id: str
    title: str
    form: Form
    perspective: str | None
    controlled_characters: tuple[str, ...]
    guest_links: tuple[GuestLink, ...]
    facts: tuple[StoryFact, ...]
    summary: str
    # Model chosen for this story (step 3.9, ADR-023); ``None`` means the preset model.
    model: str | None = None
    # Genres and the default writing style that new chapters copy (step 5.6, ADR-053).
    genres: tuple[str, ...] = ()
    writing_style: WritingStyle = WritingStyle()
    # File name of the cover in the story's folder (step 7.11, ADR-075); ``None`` without one.
    cover: str | None = None


@dataclass(frozen=True)
class Chapter:
    """One chapter: its text and its short summary."""

    world: str
    story: str
    number: int
    title: str
    status: ChapterStatus
    summary: str
    summary_status: SummaryStatus
    text: str
    # ``None``: the chapter has no style of its own, the default of the story applies.
    writing_style: WritingStyle | None = None

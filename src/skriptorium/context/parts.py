"""Building blocks shared by all request kinds: parts, protocol types, rendering, budget checks."""

import math
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from typing import Final, Literal

from skriptorium.canon import (
    CATEGORIES,
    CanonEntry,
    Category,
    InvalidInput,
    drop_empty_sections,
    nest_headings,
)

MAX_BUDGET: Final = 30_000
CHARS_PER_TOKEN: Final = 3.3
# Estimates differ from provider counts by -6 % to +8 % (step 1.1); 10 % margin keeps the
# real count below the budget.
SAFETY_MARGIN: Final = 1.1

# Heading level of the first headings in an entry's text: one below its name (``##``, ADR-092).
ENTRY_BODY_LEVEL: Final = 3

CATEGORY_LABELS: Final[dict[Category, str]] = {
    "figur": "Figur",
    "ort": "Ort",
    "gegenstand": "Gegenstand",
    "zeitlinie": "Zeitlinie",
    "regel": "Regel",
    "kultur": "Kultur",
}

Role = Literal["system", "user", "assistant"]
BlockKind = Literal[
    "rahmen",
    "welt",
    "schreibweise",
    "schreibweise-atmo",
    "regel",
    "zeitlinie",
    "fundstellen",
    "verweis",
    "gefuehrte-figur",
    "gast",
    "fakten",
    "handlungsstand",
    "kurzfassung",
    "kapitelanfang",
    "kapiteltext",
    "seiten",
    "anweisung",
    "auffuellung",
    "eintraege",
    "gespraech",
]


@dataclass(frozen=True)
class PromptMessage:
    """One message of the request; ``api`` turns it into an ``ai_gateway`` message."""

    role: Role
    content: str


@dataclass(frozen=True)
class ContextBlock:
    """One building block in the protocol: what it is and its estimated size."""

    kind: BlockKind
    label: str
    tokens: int


@dataclass(frozen=True)
class BuiltContext:
    """The request and the protocol of its blocks."""

    messages: tuple[PromptMessage, ...]
    blocks: tuple[ContextBlock, ...]
    estimated_tokens: int
    missing_characters: tuple[str, ...]


class ContextTooLarge(Exception):  # noqa: N818 - named like the error kinds of the other modules
    """Precedence 1-3 and the instruction exceed the budget; names the largest blocks."""

    def __init__(self, budget: int, needed: int, largest: Sequence[ContextBlock]) -> None:
        names = ", ".join(f"{block.label} ({block.tokens} Token)" for block in largest)
        super().__init__(
            f"Der Kontext braucht ca. {needed} Token, das Budget erlaubt {budget}. "
            f"Größte Bausteine: {names}"
        )
        self.budget = budget
        self.needed = needed
        self.largest = tuple(largest)


@dataclass(frozen=True)
class Known:
    """An entry the story may use; ``home`` names the world of a guest, else ``None``."""

    entry: CanonEntry
    home: str | None = None

    @property
    def key(self) -> tuple[str, str]:
        return (self.entry.world, self.entry.id)


def estimate_tokens(text: str) -> int:
    """Estimated tokens of ``text`` (3.3 characters per token, step 1.1)."""
    return math.ceil(len(text) / CHARS_PER_TOKEN)


@dataclass(frozen=True)
class Part:
    kind: BlockKind
    label: str
    text: str

    @property
    def block(self) -> ContextBlock:
        # Counted with the separator that joins it to the next block.
        return ContextBlock(self.kind, self.label, estimate_tokens(self.text + "\n\n"))


def check_budget(budget: int) -> None:
    if not 0 < budget <= MAX_BUDGET:
        raise InvalidInput(f"Budget muss zwischen 1 und {MAX_BUDGET} Token liegen")


def fitted(system: Sequence[Part], user: Sequence[Part], budget: int) -> BuiltContext:
    """A two-message request from parts that must all fit; otherwise ``ContextTooLarge``."""
    parts = [*system, *user]
    needed = sum(part.block.tokens for part in parts)
    if needed > math.floor(budget / SAFETY_MARGIN):
        largest = sorted((part.block for part in parts), key=lambda b: -b.tokens)[:3]
        raise ContextTooLarge(budget, math.ceil(needed * SAFETY_MARGIN), largest)
    return BuiltContext(
        messages=(
            PromptMessage("system", "\n\n".join(part.text for part in system)),
            PromptMessage("user", "\n\n".join(part.text for part in user)),
        ),
        blocks=tuple(part.block for part in parts),
        estimated_tokens=math.ceil(needed * SAFETY_MARGIN),
        missing_characters=(),
    )


def render(entry: CanonEntry, home: str | None = None) -> str:
    """A canon entry as Markdown; item sections and timeline events are part of the body.

    A guest names its home world in the heading (step 3.7). Below the name (level 2) no heading
    of the text is flatter than level 3 (a heading the author wrote on level 1 or 2 moves down
    with all the others), and sections without text are left out, so an empty template does not
    clutter the request (step 9.3, ADR-092).
    """
    label = CATEGORY_LABELS[entry.category]
    if home is not None:
        label = f"{label}, Gast aus der Welt „{home}“"
    heading = f"## {entry.name} ({label})"
    aliases = f"\nAuch: {', '.join(entry.aliases)}" if entry.aliases else ""
    body = nest_headings(drop_empty_sections(entry.body), ENTRY_BODY_LEVEL).strip()
    return f"{heading}{aliases}\n\n{body}".strip()


def render_known(known: Known) -> str:
    return render(known.entry, known.home)


def category_rank(entry: CanonEntry) -> tuple[int, str]:
    """Stable order for filling: category order of the data model, then name."""
    return (CATEGORIES.index(entry.category), entry.name.casefold())


def in_category_order(entries: Iterable[CanonEntry]) -> list[CanonEntry]:
    return sorted(entries, key=category_rank)

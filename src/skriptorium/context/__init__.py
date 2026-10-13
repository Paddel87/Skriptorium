"""Assembly of AI requests under a token budget (module ``context``); reads, never writes."""

from skriptorium.context.appearance import NO_APPEARANCE
from skriptorium.context.builder import ContextBuilder
from skriptorium.context.manuscript_hits import MAX_HITS_TOKENS, HitsQuery, ManuscriptHits
from skriptorium.context.parts import (
    CHARS_PER_TOKEN,
    MAX_BUDGET,
    SAFETY_MARGIN,
    BuiltContext,
    ContextBlock,
    ContextTooLarge,
    PromptMessage,
    Role,
    estimate_tokens,
)
from skriptorium.context.worldbuilder import PROPOSAL_FENCE
from skriptorium.context.writing import (
    CONFLICT_MARKER,
    DEFAULT_LENGTH,
    LENGTHS,
    OPENING_WORDS,
    Length,
)

__all__ = [
    "CHARS_PER_TOKEN",
    "CONFLICT_MARKER",
    "DEFAULT_LENGTH",
    "LENGTHS",
    "MAX_BUDGET",
    "MAX_HITS_TOKENS",
    "NO_APPEARANCE",
    "OPENING_WORDS",
    "PROPOSAL_FENCE",
    "SAFETY_MARGIN",
    "BuiltContext",
    "ContextBlock",
    "ContextBuilder",
    "ContextTooLarge",
    "HitsQuery",
    "Length",
    "ManuscriptHits",
    "PromptMessage",
    "Role",
    "estimate_tokens",
]

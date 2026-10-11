"""Assembly of AI requests under a token budget (module ``context``); reads, never writes."""

from skriptorium.context.builder import (
    CHARS_PER_TOKEN,
    CONFLICT_MARKER,
    DEFAULT_LENGTH,
    LENGTHS,
    MAX_BUDGET,
    OPENING_WORDS,
    SAFETY_MARGIN,
    BuiltContext,
    ContextBlock,
    ContextBuilder,
    ContextTooLarge,
    Length,
    PromptMessage,
    Role,
    estimate_tokens,
)
from skriptorium.context.worldbuilder import PROPOSAL_FENCE

__all__ = [
    "CHARS_PER_TOKEN",
    "CONFLICT_MARKER",
    "DEFAULT_LENGTH",
    "LENGTHS",
    "MAX_BUDGET",
    "OPENING_WORDS",
    "PROPOSAL_FENCE",
    "SAFETY_MARGIN",
    "BuiltContext",
    "ContextBlock",
    "ContextBuilder",
    "ContextTooLarge",
    "Length",
    "PromptMessage",
    "Role",
    "estimate_tokens",
]

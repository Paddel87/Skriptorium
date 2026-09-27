"""Assembly of AI requests under a token budget (module ``context``); reads, never writes."""

from skriptorium.context.builder import (
    CHARS_PER_TOKEN,
    MAX_BUDGET,
    OPENING_WORDS,
    SAFETY_MARGIN,
    BuiltContext,
    ContextBlock,
    ContextBuilder,
    ContextTooLarge,
    PromptMessage,
    estimate_tokens,
)

__all__ = [
    "CHARS_PER_TOKEN",
    "MAX_BUDGET",
    "OPENING_WORDS",
    "SAFETY_MARGIN",
    "BuiltContext",
    "ContextBlock",
    "ContextBuilder",
    "ContextTooLarge",
    "PromptMessage",
    "estimate_tokens",
]

"""Flow "Aussehen herauslösen" (roadmap step 7.16, ADR-078).

1. ``context`` builds the request from the figure's entry.
2. ``ai_gateway`` streams the looks it finds; nothing is stored. The author changes the text
   and takes it over as the section "Aussehen" of the entry.

Every request is counted through ``record`` as ``aussehen`` when the stream ends.
"""

from collections.abc import Mapping
from typing import Final

from skriptorium.ai_gateway import CompletionRequest, Message, ModelConfig
from skriptorium.api.flows.writing import PreparedRequest
from skriptorium.context import ContextBuilder, ContextTooLarge
from skriptorium.storage import InvalidInput

# About 120 words, with room to spare.
MAX_OUTPUT_TOKENS: Final = 600
# Taking out what is written, not inventing.
TEMPERATURE: Final = 0.2


def prepare_appearance(
    builder: ContextBuilder,
    world_id: str,
    entry_id: str,
    model: str,
    models: Mapping[str, ModelConfig],
) -> PreparedRequest:
    """Check the order and build the request; runs before anything streams.

    Raises:
        InvalidInput: Unknown model or an entry too large for the budget.
        NotFound: The world or the entry does not exist.
    """
    if model not in models:
        raise InvalidInput(f"Unbekanntes Modell: {model}")
    try:
        built = builder.build_appearance(world_id, entry_id)
    except ContextTooLarge as error:
        raise InvalidInput(str(error)) from error
    messages = tuple(Message(m.role, m.content) for m in built.messages)
    return PreparedRequest(
        CompletionRequest(model, messages, MAX_OUTPUT_TOKENS, TEMPERATURE),
        built.estimated_tokens,
    )

"""Flow "Weltenbauer" (roadmap step 6.7, ADR-064, FR-029).

1. ``context`` builds the request from the world and the conversation the interface sends.
2. ``ai_gateway`` streams the answer, with the provider's web search if the author asked for it.
3. Nothing is stored: the conversation lives in the interface, proposals reach the canon only
   through the import preview after the author's confirmation.

Every request is counted through ``record`` as ``weltenbau`` when the stream ends.
"""

import json
from collections.abc import AsyncIterator, Callable, Mapping, Sequence
from dataclasses import dataclass
from typing import Final, Literal

from skriptorium.ai_gateway import (
    Completed,
    CompletionRequest,
    GatewayError,
    Message,
    ModelConfig,
    ModelProvider,
    Usage,
)
from skriptorium.api.flows.writing import TEMPERATURE, PreparedRequest, error_kind
from skriptorium.api.usage import Kind
from skriptorium.context import ContextBuilder, ContextTooLarge, HitsQuery
from skriptorium.storage import InvalidInput

# Bounds of what the interface may send; the context budget limits the rest.
MAX_TURNS: Final = 60
MAX_TURN_CHARS: Final = 40_000
# Room for an answer with a proposal of several entries.
MAX_OUTPUT_TOKENS: Final = 4000

UsageRecorder = Callable[[Kind, str, Usage | None, str], None]


@dataclass(frozen=True)
class Turn:
    """One message of the conversation."""

    role: Literal["user", "assistant"]
    content: str


@dataclass(frozen=True)
class WorldOrder:
    """What the author asks the world builder for."""

    world: str
    turns: tuple[Turn, ...]
    references: tuple[str, ...]
    model: str
    web_search: bool
    # Passages of the manuscript about a name go along with every request (step 8.9, ADR-087).
    findings: HitsQuery | None = None


def prepare_worldbuilder(
    builder: ContextBuilder, order: WorldOrder, models: Mapping[str, ModelConfig]
) -> PreparedRequest:
    """Check the order and build the request; runs before anything is streamed.

    Raises:
        InvalidInput: Unknown model, too many or too long messages, the last message is not the
            author's, or the context does not fit the budget.
        NotFound: World, a referenced entry or the story of ``findings`` does not exist.
    """
    if order.model not in models:
        raise InvalidInput(f"Unbekanntes Modell: {order.model}")
    if len(order.turns) > MAX_TURNS:
        raise InvalidInput(f"Höchstens {MAX_TURNS} Nachrichten")
    if any(len(turn.content) > MAX_TURN_CHARS for turn in order.turns):
        raise InvalidInput(f"Eine Nachricht hat mehr als {MAX_TURN_CHARS} Zeichen")
    conversation = [(turn.role, turn.content) for turn in order.turns]
    try:
        built = builder.build_worldbuilder(
            order.world, conversation, order.references, findings=order.findings
        )
    except ContextTooLarge as error:
        raise InvalidInput(str(error)) from error
    messages = tuple(Message(message.role, message.content) for message in built.messages)
    return PreparedRequest(
        CompletionRequest(
            order.model, messages, MAX_OUTPUT_TOKENS, TEMPERATURE, web_search=order.web_search
        ),
        built.estimated_tokens,
    )


async def stream_worldbuilder(
    provider: ModelProvider, prepared: PreparedRequest, record: UsageRecorder | None = None
) -> AsyncIterator[str]:
    """Stream the answer as Server-Sent Events, counted as ``weltenbau``; see
    :func:`stream_answer`."""
    async for event in stream_answer(provider, prepared, "weltenbau", record):
        yield event


async def stream_answer(
    provider: ModelProvider,
    prepared: PreparedRequest,
    kind: Kind,
    record: UsageRecorder | None = None,
) -> AsyncIterator[str]:
    """Stream an answer that is shown to the author, not stored, as Server-Sent Events.

    Events: ``start`` (model, estimated tokens, web search), ``text`` per chunk, at most one
    ``quellen`` (web pages behind the answer), then ``done`` (usage) or ``error`` (kind). The
    request is counted as ``kind`` when the stream ends.
    """
    completion = prepared.completion
    yield _event(
        "start",
        {
            "model": completion.model,
            "estimated_tokens": prepared.estimated_tokens,
            "web_search": completion.web_search,
        },
    )
    usage: Usage | None = None
    outcome = "abgebrochen"
    events = provider.stream(completion)
    try:
        async for event in events:
            if isinstance(event, Completed):
                usage, outcome = event.usage, "ok"
                if event.sources:
                    yield _event("quellen", {"sources": _sources(event)})
                yield _event(
                    "done",
                    {
                        "input_tokens": event.usage.input_tokens,
                        "output_tokens": event.usage.output_tokens,
                        "cost_usd": event.usage.cost_usd,
                        "finish_reason": event.finish_reason,
                    },
                )
            elif event.text:
                yield _event("text", {"text": event.text})
    except GatewayError as error:
        outcome = error_kind(error)
        yield _event("error", {"kind": outcome})
    finally:
        close = getattr(events, "aclose", None)
        if close is not None:
            await close()
        if record is not None:
            record(kind, completion.model, usage, outcome)


def _sources(event: Completed) -> Sequence[Mapping[str, str]]:
    return [{"url": source.url, "title": source.title} for source in event.sources]


def _event(name: str, data: Mapping[str, object]) -> str:
    return f"event: {name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

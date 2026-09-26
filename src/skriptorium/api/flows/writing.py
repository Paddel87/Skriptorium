"""Flow "Weiterschreiben im Wechsel" (docs/architecture.md section 5, roadmap step 3.3).

1. The chapter as saved is the basis: ``context`` builds the request under the token budget.
2. ``ai_gateway`` streams the answer; text chunks go to the caller as Server-Sent Events.
3. Nothing is saved here. The author takes over, changes or discards the proposal, and the
   interface saves taken-over text at the end of the chapter through the chapter endpoint
   (FR-009). An abort or an error therefore leaves the manuscript unchanged.

A new scene (FR-008) is a request like any other: place and characters become ``@``-references,
the goal becomes part of the instruction.
"""

import json
from collections.abc import AsyncIterator, Mapping, Sequence
from dataclasses import dataclass
from typing import Final

from skriptorium.ai_gateway import (
    DEFAULT_MODELS,
    Completed,
    CompletionRequest,
    GatewayError,
    InvalidRequest,
    Message,
    ModelConfig,
    ModelProvider,
    ModelRefused,
    RateLimited,
)
from skriptorium.canon import CanonEntry, CanonService, Category
from skriptorium.context import ContextBuilder, ContextTooLarge
from skriptorium.storage import InvalidInput, NotFound

# First model of the model order grok-4.7 → grok-4.6 → qwen3.8-max (ADR-010, ADR-011).
DEFAULT_MODEL: Final = next(iter(DEFAULT_MODELS))
# Values of the acceptance runs in steps 1.1 and 3.2.
MAX_OUTPUT_TOKENS: Final = 8000
TEMPERATURE: Final = 0.8
CONTINUE: Final = "Setze das Manuskript an seinem Ende fort."


@dataclass(frozen=True)
class Scene:
    """Start of a new scene: place, characters (canon entry identifiers) and goal."""

    place: str | None = None
    characters: tuple[str, ...] = ()
    goal: str = ""


@dataclass(frozen=True)
class WriteOrder:
    """What the author asks for: an instruction, ``@``-references, optionally a new scene."""

    world: str
    story: str
    chapter: int
    instruction: str = ""
    references: tuple[str, ...] = ()
    scene: Scene | None = None
    model: str = DEFAULT_MODEL


@dataclass(frozen=True)
class PreparedRequest:
    """The request for ``ai_gateway`` and the estimated size of its context."""

    completion: CompletionRequest
    estimated_tokens: int


def prepare_request(
    canon: CanonService,
    builder: ContextBuilder,
    order: WriteOrder,
    models: Mapping[str, ModelConfig] = DEFAULT_MODELS,
) -> PreparedRequest:
    """Check the order and build the request; runs before anything is streamed.

    Raises:
        InvalidInput: Unknown model, unknown or unsuitable canon entry, empty scene, or the
            context does not fit the budget (message names the largest blocks).
        NotFound: World, story or chapter does not exist.
    """
    if order.model not in models:
        raise InvalidInput(f"Unbekanntes Modell: {order.model}")
    canon.get_world(order.world)
    instruction = order.instruction.strip()
    references = [_entry(canon, order.world, reference).id for reference in order.references]
    if order.scene is not None:
        scene_refs, instruction = _scene(canon, order.world, order.scene, instruction)
        references += scene_refs
    elif not instruction:
        instruction = CONTINUE
    try:
        built = builder.build(
            order.world,
            order.story,
            order.chapter,
            instruction,
            list(dict.fromkeys(references)),
        )
    except ContextTooLarge as error:
        raise InvalidInput(str(error)) from error
    messages = tuple(Message(message.role, message.content) for message in built.messages)
    return PreparedRequest(
        CompletionRequest(order.model, messages, MAX_OUTPUT_TOKENS, TEMPERATURE),
        built.estimated_tokens,
    )


def _entry(
    canon: CanonService, world: str, entry_id: str, category: Category | None = None
) -> CanonEntry:
    try:
        entry = canon.get_entry(world, entry_id)
    except NotFound as error:
        raise InvalidInput(f"Unbekannter Kanon-Eintrag {entry_id}") from error
    if category is not None and entry.category != category:
        raise InvalidInput(f"{entry.name} ist kein Eintrag der Kategorie {category}")
    return entry


def _scene(canon: CanonService, world: str, scene: Scene, extra: str) -> tuple[list[str], str]:
    """References and instruction for the first paragraph of a new scene (FR-008)."""
    goal = scene.goal.strip()
    if scene.place is None and not scene.characters and not goal:
        raise InvalidInput("Die Szene braucht einen Ort, Figuren oder ein Ziel")
    place = _entry(canon, world, scene.place, "ort") if scene.place is not None else None
    characters = [_entry(canon, world, c, "figur") for c in scene.characters]
    lines = ["Beginne hier eine neue Szene und schreibe ihren ersten Absatz."]
    if place is not None:
        lines.append(f"Ort: {place.name}")
    if characters:
        lines.append(f"Figuren: {', '.join(c.name for c in characters)}")
    if goal:
        lines.append(f"Ziel der Szene: {goal}")
    if extra:
        lines.append(extra)
    references = [e.id for e in ([place] if place is not None else []) + characters]
    return references, "\n".join(lines)


_ERROR_KINDS: Final[Sequence[tuple[type[GatewayError], str]]] = (
    (ModelRefused, "abgelehnt"),
    (RateLimited, "zu_viele_anfragen"),
    (InvalidRequest, "ungueltig"),
)


async def stream_events(provider: ModelProvider, prepared: PreparedRequest) -> AsyncIterator[str]:
    """Stream the answer as Server-Sent Events.

    Events: ``start`` (model, estimated tokens), then ``text`` per chunk, then either ``done``
    (usage) or ``error`` (kind only; texts for the author live in the interface). Closing the
    connection closes the provider stream, which ends the request at the provider.
    """
    completion = prepared.completion
    yield _event(
        "start", {"model": completion.model, "estimated_tokens": prepared.estimated_tokens}
    )
    events = provider.stream(completion)
    try:
        async for event in events:
            if isinstance(event, Completed):
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
        yield _event("error", {"kind": _kind(error)})
    finally:
        close = getattr(events, "aclose", None)
        if close is not None:
            await close()


def _kind(error: GatewayError) -> str:
    for error_type, kind in _ERROR_KINDS:
        if isinstance(error, error_type):
            return kind
    return "nicht_erreichbar"


def _event(name: str, data: Mapping[str, object]) -> str:
    return f"event: {name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

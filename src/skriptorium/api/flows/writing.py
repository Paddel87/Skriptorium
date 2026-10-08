"""Flow "Weiterschreiben im Wechsel" (docs/architecture.md section 5, roadmap step 3.3).

1. The chapter as saved is the basis: ``context`` builds the request under the token budget.
2. ``ai_gateway`` streams the answer; text chunks go to the caller as Server-Sent Events.
3. Nothing is saved here. The author takes over, changes or discards the proposal, and the
   interface saves taken-over text at the end of the chapter through the chapter endpoint
   (FR-009). An abort or an error therefore leaves the manuscript unchanged.

A new scene (FR-008) is a request like any other: place and characters become ``@``-references,
the goal becomes part of the instruction.

References, place and characters are entries of the story's world or guests the story binds in
from other worlds (FR-017, step 3.7); a guest wins over an entry of the world with the same
identifier, as in the checks of the story endpoints.

Every request is counted through ``record`` when the stream ends: finished, failed or aborted
(ADR-023, step 3.9).

If the instruction contradicts the canon, the AI writes in line with the canon and starts its
answer with one line beginning with ``CONFLICT_MARKER``. That line goes to the interface as a
separate ``hinweis`` event, so taking over the proposal never puts it into the manuscript
(step 4.14).
"""

import json
from collections.abc import AsyncIterator, Callable, Mapping, Sequence
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
    Usage,
)
from skriptorium.api.usage import Kind
from skriptorium.canon import CanonEntry, CanonService, Category
from skriptorium.context import (
    CONFLICT_MARKER,
    DEFAULT_LENGTH,
    ContextBuilder,
    ContextTooLarge,
    Length,
)
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import InvalidInput, NotFound

# First model of the model order grok-4.6 → grok-4.7 → qwen3.8-max (ADR-011, ADR-044).
DEFAULT_MODEL: Final = next(iter(DEFAULT_MODELS))
# Values of the acceptance runs in steps 1.1 and 3.2.
MAX_OUTPUT_TOKENS: Final = 8000
TEMPERATURE: Final = 0.8
# "Weiter" without instruction: a small step, then the author's turn (owner, step 5.15).
CONTINUE: Final = (
    "Setze das Manuskript an seinem Ende fort: nur den unmittelbar nächsten Moment der Szene, "
    "ohne Zeitsprung."
)

# Counts one AI request: kind, model, usage reported by the provider, outcome (ADR-023).
UsageRecorder = Callable[[Kind, str, Usage | None, str], None]


@dataclass(frozen=True)
class Scene:
    """Start of a new scene: place, characters (canon entry identifiers) and goal."""

    place: str | None = None
    characters: tuple[str, ...] = ()
    goal: str = ""


@dataclass(frozen=True)
class WriteOrder:
    """What the author asks for: an instruction, ``@``-references, optionally a new scene.

    ``length`` is the length of the proposal the author chose (step 5.15).
    """

    world: str
    story: str
    chapter: int
    instruction: str = ""
    references: tuple[str, ...] = ()
    scene: Scene | None = None
    model: str = DEFAULT_MODEL
    length: Length = DEFAULT_LENGTH


@dataclass(frozen=True)
class PreparedRequest:
    """The request for ``ai_gateway`` and the estimated size of its context."""

    completion: CompletionRequest
    estimated_tokens: int


def prepare_request(
    canon: CanonService,
    manuscripts: ManuscriptService,
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
    story = manuscripts.get_story(order.world, order.story)
    homes = {link.entry: link.world for link in story.guest_links}

    def entry(entry_id: str, category: Category | None = None) -> CanonEntry:
        return _entry(canon, homes.get(entry_id, order.world), entry_id, category)

    instruction = order.instruction.strip()
    references = [entry(reference).id for reference in order.references]
    if order.scene is not None:
        scene_refs, instruction = _scene(entry, order.scene, instruction)
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
            length=order.length,
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


def _scene(
    entry: Callable[[str, Category], CanonEntry], scene: Scene, extra: str
) -> tuple[list[str], str]:
    """References and instruction for the first paragraph of a new scene (FR-008)."""
    goal = scene.goal.strip()
    if scene.place is None and not scene.characters and not goal:
        raise InvalidInput("Die Szene braucht einen Ort, Figuren oder ein Ziel")
    place = entry(scene.place, "ort") if scene.place is not None else None
    characters = [entry(c, "figur") for c in scene.characters]
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


async def stream_events(
    provider: ModelProvider, prepared: PreparedRequest, record: UsageRecorder | None = None
) -> AsyncIterator[str]:
    """Stream the answer as Server-Sent Events.

    Events: ``start`` (model, estimated tokens), then at most one ``hinweis`` (the AI's note on
    a contradiction with the canon, step 4.14) and ``text`` per chunk, then either ``done``
    (usage) or ``error`` (kind only; texts for the author live in the interface). Closing the
    connection closes the provider stream, which ends the request at the provider. At the end
    the request is passed to ``record`` with outcome ``ok``, the error kind or ``abgebrochen``.
    """
    completion = prepared.completion
    yield _event(
        "start", {"model": completion.model, "estimated_tokens": prepared.estimated_tokens}
    )
    usage: Usage | None = None
    outcome = "abgebrochen"
    events = provider.stream(completion)
    split = NoteSplitter()
    try:
        async for event in events:
            if isinstance(event, Completed):
                usage, outcome = event.usage, "ok"
                for name, text in split.finish():
                    yield _event(name, {"text": text})
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
                for name, text in split.feed(event.text):
                    yield _event(name, {"text": text})
    except GatewayError as error:
        outcome = error_kind(error)
        for name, text in split.finish():
            yield _event(name, {"text": text})
        yield _event("error", {"kind": outcome})
    finally:
        close = getattr(events, "aclose", None)
        if close is not None:
            await close()
        if record is not None:
            record("schreiben", completion.model, usage, outcome)


class NoteSplitter:
    """Separates the AI's conflict note from the text while the answer streams (step 4.14).

    The note is the first line if it starts with ``CONFLICT_MARKER`` (ignoring case and leading
    whitespace). Until that is decided, chunks are held back; afterwards they pass unchanged.
    Each call returns ``(event, text)`` pairs with event ``hinweis`` or ``text``.
    """

    def __init__(self) -> None:
        """Start undecided with nothing held back."""
        self._held = ""
        self._decided = False
        # After a note, blank lines up to the first text are dropped, even in later chunks.
        self._skip_blank = False

    def feed(self, chunk: str) -> list[tuple[str, str]]:
        """Pass on ``chunk`` or hold it back until the first line is decided."""
        if self._decided:
            if self._skip_blank:
                chunk = chunk.lstrip("\r\n")
                self._skip_blank = not chunk
            return [("text", chunk)] if chunk else []
        self._held += chunk
        start = self._held.lstrip()
        marker = CONFLICT_MARKER.casefold()
        if len(start) < len(marker) and marker.startswith(start.casefold()):
            return []
        if not start.casefold().startswith(marker):
            return self._release(self._held, "")
        line_end = start.find("\n")
        if line_end == -1:
            return []
        return self._release(start[line_end:].lstrip("\r\n"), start[len(marker) : line_end])

    def finish(self) -> list[tuple[str, str]]:
        """Pass on what is held back when the answer ends, completely or not."""
        if self._decided:
            return []
        start = self._held.lstrip()
        if start.casefold().startswith(CONFLICT_MARKER.casefold()):
            return self._release("", start[len(CONFLICT_MARKER) :])
        return self._release(self._held, "")

    def _release(self, text: str, note: str) -> list[tuple[str, str]]:
        self._decided = True
        self._held = ""
        self._skip_blank = bool(note.strip()) and not text
        pairs = [("hinweis", note.strip())] if note.strip() else []
        return pairs + ([("text", text)] if text else [])


def error_kind(error: GatewayError) -> str:
    """Kind of a provider error as sent to the interface."""
    for error_type, kind in _ERROR_KINDS:
        if isinstance(error, error_type):
            return kind
    return "nicht_erreichbar"


def _event(name: str, data: Mapping[str, object]) -> str:
    return f"event: {name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

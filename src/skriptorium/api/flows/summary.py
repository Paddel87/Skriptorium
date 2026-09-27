"""Flow "Kapitel abschließen" (docs/architecture.md section 5, roadmap step 3.6, FR-010).

1. ``context`` builds the request for the short summary of the chapter; ``ai_gateway`` answers.
2. The summary is saved through ``manuscript`` with status ``erzeugt``.
3. ``context`` builds the request that continues the overall summary; it is saved as well.

Marking the chapter as completed stays a separate call (``manuscript.complete_chapter``); the
interface calls both in turn and can repeat this flow later ("nachholen"). If a step fails,
what was saved before stays saved: the chapter keeps its previous summary (``fehlt`` if there
was none) and ``context`` uses the chapter's opening instead (step 3.6).

Each request sent is counted through ``record`` (ADR-023, step 3.9).
"""

from collections.abc import Callable, Mapping
from dataclasses import dataclass
from typing import Final, Literal

from skriptorium.ai_gateway import (
    DEFAULT_MODELS,
    Completed,
    CompletionRequest,
    GatewayError,
    Message,
    ModelConfig,
    ModelProvider,
    TextChunk,
    Usage,
)
from skriptorium.api.flows.writing import (
    DEFAULT_MODEL,
    MAX_OUTPUT_TOKENS,
    UsageRecorder,
    error_kind,
)
from skriptorium.api.usage import Kind
from skriptorium.context import BuiltContext, ContextBuilder, ContextTooLarge
from skriptorium.manuscript import Chapter, ManuscriptService, Story
from skriptorium.storage import InvalidInput

# Summaries should keep to the text; lower than the 0.8 used for writing.
SUMMARY_TEMPERATURE: Final = 0.3

Stage = Literal["kapitel", "gesamt"]
_KINDS: Final[Mapping[Stage, Kind]] = {"kapitel": "kurzfassung", "gesamt": "gesamtzusammenfassung"}


@dataclass(frozen=True)
class SummaryFailure:
    """Which step failed and why: an error kind of the writing flow, ``leer`` or ``zu_gross``."""

    stage: Stage
    kind: str


@dataclass(frozen=True)
class SummaryOutcome:
    """Chapter and story as saved after the flow, and the failure if a step failed."""

    chapter: Chapter
    story: Story
    failure: SummaryFailure | None


async def summarize_chapter(
    manuscripts: ManuscriptService,
    builder: ContextBuilder,
    provider: ModelProvider,
    world: str,
    story: str,
    number: int,
    model: str = DEFAULT_MODEL,
    models: Mapping[str, ModelConfig] = DEFAULT_MODELS,
    record: UsageRecorder | None = None,
) -> SummaryOutcome:
    """Create the short summary of chapter ``number`` and continue the overall summary.

    Raises:
        InvalidInput: Unknown model or the chapter has no text.
        NotFound: World, story or chapter does not exist.
    """
    if model not in models:
        raise InvalidInput(f"Unbekanntes Modell: {model}")
    failure = await _step(
        provider,
        model,
        "kapitel",
        lambda: builder.build_chapter_summary(world, story, number),
        lambda text: manuscripts.set_chapter_summary(world, story, number, text, "erzeugt"),
        record,
    )
    if failure is None:
        failure = await _step(
            provider,
            model,
            "gesamt",
            lambda: builder.build_story_summary(world, story, number),
            lambda text: manuscripts.set_story_summary(world, story, text),
            record,
        )
    return SummaryOutcome(
        manuscripts.get_chapter(world, story, number),
        manuscripts.get_story(world, story),
        failure,
    )


async def _step(
    provider: ModelProvider,
    model: str,
    stage: Stage,
    build: Callable[[], BuiltContext],
    save: Callable[[str], object],
    record: UsageRecorder | None,
) -> SummaryFailure | None:
    """Build one request, collect the answer and save it; the failure if that did not work."""
    try:
        built = build()
    except ContextTooLarge:
        return SummaryFailure(stage, "zu_gross")
    usage: list[Usage] = []
    outcome = "abgebrochen"
    try:
        text = await _collect(provider, _request(built, model), usage)
        outcome = "ok" if text else "leer"
    except GatewayError as error:
        outcome = error_kind(error)
        return SummaryFailure(stage, outcome)
    finally:
        if record is not None:
            record(_KINDS[stage], model, usage[0] if usage else None, outcome)
    if not text:
        return SummaryFailure(stage, "leer")
    save(text)
    return None


def _request(built: BuiltContext, model: str) -> CompletionRequest:
    messages = tuple(Message(message.role, message.content) for message in built.messages)
    return CompletionRequest(model, messages, MAX_OUTPUT_TOKENS, SUMMARY_TEMPERATURE)


async def _collect(provider: ModelProvider, request: CompletionRequest, usage: list[Usage]) -> str:
    """The whole answer; the reported usage is appended to ``usage``."""
    parts: list[str] = []
    events = provider.stream(request)
    try:
        async for event in events:
            if isinstance(event, TextChunk):
                parts.append(event.text)
            elif isinstance(event, Completed):
                usage.append(event.usage)
    finally:
        close = getattr(events, "aclose", None)
        if close is not None:
            await close()
    return "".join(parts).strip()

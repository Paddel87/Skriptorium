"""Endpoints for writing with the AI, summaries, models and consumption (steps 3.3, 3.6, 3.9).

The routes stay thin; the flow lives in :mod:`skriptorium.api.flows` (ADR-020).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from skriptorium.ai_gateway import DEFAULT_MODELS
from skriptorium.api.context import ServicesDep, current_session
from skriptorium.api.flows import (
    DEFAULT_MODEL,
    Scene,
    SummaryFailure,
    WriteOrder,
    prepare_request,
    stream_events,
    summarize_chapter,
)
from skriptorium.context import DEFAULT_LENGTH, Length
from skriptorium.manuscript import Chapter, Story

router = APIRouter(prefix="/api", dependencies=[Depends(current_session)])


class ModelList(BaseModel):
    """Models of the model order and the preset one."""

    models: list[str]
    default: str


class SceneIn(BaseModel):
    """A new scene: place and characters as canon entry identifiers, goal as free text."""

    place: str | None = None
    characters: list[str] = []
    goal: str = ""


class WriteIn(BaseModel):
    """An instruction to write on; empty means "continue at the end"."""

    instruction: str = ""
    references: list[str] = []
    scene: SceneIn | None = None
    # Missing: the model chosen for the story, otherwise the preset one (step 3.9).
    model: str | None = None
    # Length of the proposal: kurz, mittel or lang (step 5.15).
    length: Length = DEFAULT_LENGTH


class UsageOut(BaseModel):
    """Consumption of one month (ADR-023); ``without_cost`` requests had no reported cost."""

    month: str
    requests: int
    input_tokens: int
    output_tokens: int
    cost_usd: float
    without_cost: int


class SummaryResult(BaseModel):
    """Chapter and story after creating the summaries; ``failure`` names a failed step."""

    chapter: Chapter
    story: Story
    failure: SummaryFailure | None


@router.get("/models")
def list_models() -> ModelList:
    """The selectable models; the one chosen per story is the story's ``model`` (step 3.9)."""
    return ModelList(models=list(DEFAULT_MODELS), default=DEFAULT_MODEL)


@router.post("/worlds/{world_id}/stories/{story_id}/chapters/{number}/write")
def write(
    world_id: str, story_id: str, number: int, body: WriteIn, found: ServicesDep
) -> StreamingResponse:
    """Stream a proposal for the end of the chapter as Server-Sent Events; saves nothing."""
    if found.provider is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "KI-Anbieter nicht eingerichtet")
    scene = None
    if body.scene is not None:
        scene = Scene(body.scene.place, tuple(body.scene.characters), body.scene.goal)
    model = body.model
    if model is None:
        found.canon.get_world(world_id)
        model = found.manuscript.get_story(world_id, story_id).model or DEFAULT_MODEL
    order = WriteOrder(
        world_id,
        story_id,
        number,
        body.instruction,
        tuple(body.references),
        scene,
        model,
        body.length,
    )
    prepared = prepare_request(found.canon, found.manuscript, found.context, order)
    return StreamingResponse(
        stream_events(found.provider, prepared, found.usage.record),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )


@router.post("/worlds/{world_id}/stories/{story_id}/chapters/{number}/summarize")
async def summarize(world_id: str, story_id: str, number: int, found: ServicesDep) -> SummaryResult:
    """Create the chapter's short summary and continue the overall summary (FR-010).

    An AI failure is no HTTP error: what was saved stays saved and ``failure`` says which step
    failed, so the interface can offer to repeat it.
    """
    if found.provider is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "KI-Anbieter nicht eingerichtet")
    outcome = await summarize_chapter(
        found.manuscript,
        found.context,
        found.provider,
        world_id,
        story_id,
        number,
        record=found.usage.record,
    )
    return SummaryResult(chapter=outcome.chapter, story=outcome.story, failure=outcome.failure)


@router.get("/usage")
def usage(found: ServicesDep, month: str | None = None) -> UsageOut:
    """Requests, tokens and cost of ``month`` (``JJJJ-MM``), by default the current month."""
    summed = found.usage.month(month)
    return UsageOut(
        month=summed.month,
        requests=summed.requests,
        input_tokens=summed.input_tokens,
        output_tokens=summed.output_tokens,
        cost_usd=summed.cost_usd,
        without_cost=summed.without_cost,
    )

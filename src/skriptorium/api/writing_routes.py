"""Endpoints for writing with the AI, summaries, models and consumption (steps 3.3, 3.6, 3.9, 5.12).

The routes stay thin; the flow lives in :mod:`skriptorium.api.flows` (ADR-020).
"""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from skriptorium.ai_gateway import CatalogModel, ModelCatalog
from skriptorium.ai_gateway.catalog import CHECKED_MODELS, SLOW_MODELS
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


class CatalogEntry(BaseModel):
    """One model of the catalog; prices in US dollars, ``None`` if OpenRouter names none."""

    id: str
    name: str
    provider: str
    # Per million tokens in and out.
    input_price: float | None
    output_price: float | None
    # One proposal: 30,000 tokens in, 500 out (ADR-055).
    estimated_cost: float | None
    context_length: int | None
    # Inputs are checked by OpenRouter's own moderation.
    moderated: bool
    # "denkt lange" (measured, ADR-052), "denkt vor" (mandatory reasoning) or ``None``.
    thinking: Literal["lange", "vor"] | None
    # Checked with the owner's stories (steps 5.7, 5.26).
    checked: bool


class ModelList(BaseModel):
    """The favorites, the preset model and the catalog (ADR-055).

    ``models`` equals ``favorites`` and stays for older interfaces; ``catalog`` is empty and
    ``catalog_available`` false while OpenRouter's list cannot be loaded.
    """

    models: list[str]
    default: str
    favorites: list[str]
    catalog: list[CatalogEntry]
    catalog_available: bool


class FavoritesIn(BaseModel):
    """The new favorites in the order of the selection field."""

    favorites: list[str]


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
async def list_models(found: ServicesDep) -> ModelList:
    """Favorites and catalog; the model chosen per story is the story's ``model`` (step 3.9)."""
    await found.catalog.refresh()
    return _model_list(found.catalog, found.favorites.get())


@router.put("/models/favoriten")
async def set_favorites(body: FavoritesIn, found: ServicesDep) -> ModelList:
    """Save the favorites (ADR-055); every model must be in the catalog or already a favorite."""
    await found.catalog.refresh()
    favorites = found.favorites.set(body.favorites, found.catalog)
    return _model_list(found.catalog, favorites)


@router.post("/worlds/{world_id}/stories/{story_id}/chapters/{number}/write")
async def write(
    world_id: str, story_id: str, number: int, body: WriteIn, found: ServicesDep
) -> StreamingResponse:
    """Stream a proposal for the end of the chapter as Server-Sent Events; saves nothing."""
    if found.provider is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "KI-Anbieter nicht eingerichtet")
    scene = None
    if body.scene is not None:
        scene = Scene(body.scene.place, tuple(body.scene.characters), body.scene.goal)
    await found.catalog.refresh()
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
    prepared = prepare_request(
        found.canon, found.manuscript, found.context, order, models=found.catalog
    )
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


def _model_list(catalog: ModelCatalog, favorites: list[str]) -> ModelList:
    return ModelList(
        models=favorites,
        default=DEFAULT_MODEL,
        favorites=favorites,
        catalog=[_entry(model) for model in catalog.models()],
        catalog_available=catalog.available,
    )


def _entry(model: CatalogModel) -> CatalogEntry:
    thinking: Literal["lange", "vor"] | None = None
    if model.id in SLOW_MODELS:
        thinking = "lange"
    elif model.reasoning_mandatory:
        thinking = "vor"
    return CatalogEntry(
        id=model.id,
        name=model.name,
        provider=model.provider,
        input_price=model.input_price,
        output_price=model.output_price,
        estimated_cost=model.estimated_cost,
        context_length=model.context_length,
        moderated=model.moderated,
        thinking=thinking,
        checked=model.id in CHECKED_MODELS,
    )

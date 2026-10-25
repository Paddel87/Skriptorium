"""Endpoints for writing with the AI, summaries, models, the world builder and consumption
(steps 3.3, 3.6, 3.9, 5.12, 6.7, 9.7).

The routes stay thin; the flow lives in :mod:`skriptorium.api.flows` (ADR-020).
"""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from skriptorium.ai_gateway import CatalogModel
from skriptorium.ai_gateway.catalog import CHECKED_MODELS, SLOW_MODELS
from skriptorium.api.context import Services, ServicesDep, current_session
from skriptorium.api.favorites import TASKS, Task
from skriptorium.api.flows import (
    DEFAULT_MODEL,
    DescribeOrder,
    Scene,
    SummaryFailure,
    Turn,
    WorldOrder,
    WriteOrder,
    prepare_appearance,
    prepare_description,
    prepare_request,
    prepare_worldbuilder,
    stream_answer,
    stream_events,
    stream_worldbuilder,
    summarize_chapter,
)
from skriptorium.context import DEFAULT_LENGTH, HitsQuery, Length
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
    # Accepts images, for "Von der KI beschreiben lassen" (step 7.13).
    reads_images: bool


class ModelList(BaseModel):
    """The favorites, the preset model, the model per task and the catalog (ADR-055, ADR-096).

    ``models`` equals ``favorites`` and stays for older interfaces; ``catalog`` is empty and
    ``catalog_available`` false while OpenRouter's list cannot be loaded. ``tasks`` names every
    task with its saved model, ``None`` for the preset.
    """

    models: list[str]
    default: str
    favorites: list[str]
    tasks: dict[Task, str | None]
    catalog: list[CatalogEntry]
    catalog_available: bool


class FavoritesIn(BaseModel):
    """The new favorites in the order of the selection field."""

    favorites: list[str]


class TasksIn(BaseModel):
    """The model per task (ADR-096); ``None`` or a missing task means the preset."""

    tasks: dict[Task, str | None]


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


class TurnIn(BaseModel):
    """One message of the world builder's conversation."""

    role: Literal["user", "assistant"]
    content: str


class ManuscriptIn(BaseModel):
    """The name to look for in the manuscript; ``story`` missing: all stories of the world."""

    name: str = Field(min_length=1, max_length=200)
    story: str | None = None


class HitsOut(BaseModel):
    """Numbers of the passages found, no text (ADR-087); ``tokens`` is the share in a request."""

    total: int
    stories: int
    chapters: int
    included: int
    tokens: int


class WorldbuilderIn(BaseModel):
    """The conversation so far, the last message the author's (step 6.7)."""

    messages: list[TurnIn]
    # Identifiers of entries of the world named with ``@`` in the last message.
    references: list[str] = []
    # Missing: the preset model.
    model: str | None = None
    web_search: bool = False
    # Passages of the manuscript about a name (step 8.9, ADR-087).
    manuscript: ManuscriptIn | None = None


class DescribeIn(BaseModel):
    """The model that describes the image (step 7.13); it must read images."""

    model: str


class AppearanceIn(BaseModel):
    """The model that takes out the looks (step 7.16); missing: the preset model."""

    model: str | None = None


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
    return _model_list(found)


@router.put("/models/favoriten")
async def set_favorites(body: FavoritesIn, found: ServicesDep) -> ModelList:
    """Save the favorites (ADR-055); every model must be in the catalog or already a favorite."""
    await found.catalog.refresh()
    found.favorites.set(body.favorites, found.catalog)
    return _model_list(found)


@router.put("/models/aufgaben")
async def set_task_models(body: TasksIn, found: ServicesDep) -> ModelList:
    """Save the model each task starts with (ADR-096).

    Text tasks take models of the catalog, describing an image only models that read images
    (while the catalog is loaded), generating images only image models.
    """
    await found.catalog.refresh()
    await found.image_catalog.refresh()

    def allowed(task: Task, model: str) -> bool:
        if task == "bilderzeugung":
            return model in found.image_catalog
        if task == "bildbeschreibung" and found.catalog.available:
            return found.catalog.reads_images(model)
        return model in found.catalog

    found.favorites.set_tasks(body.tasks, allowed)
    return _model_list(found)


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
        model = found.manuscript.get_story(world_id, story_id).model or _preset(found, "schreiben")
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


@router.post("/worlds/{world_id}/worldbuilder")
async def worldbuilder(
    world_id: str, body: WorldbuilderIn, found: ServicesDep
) -> StreamingResponse:
    """Stream the world builder's answer as Server-Sent Events; saves nothing (ADR-064)."""
    if found.provider is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "KI-Anbieter nicht eingerichtet")
    await found.catalog.refresh()
    order = WorldOrder(
        world_id,
        tuple(Turn(turn.role, turn.content) for turn in body.messages),
        tuple(body.references),
        body.model or _preset(found, "weltenbau"),
        body.web_search,
        None if body.manuscript is None else HitsQuery(body.manuscript.name, body.manuscript.story),
    )
    prepared = prepare_worldbuilder(found.context, order, found.catalog)
    return StreamingResponse(
        stream_worldbuilder(found.provider, prepared, found.usage.record),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )


@router.post("/worlds/{world_id}/worldbuilder/hits")
async def worldbuilder_hits(world_id: str, body: ManuscriptIn, found: ServicesDep) -> HitsOut:
    """Count the passages of the manuscript that mention a name; sends and saves no text."""
    hits = found.context.find_manuscript_hits(world_id, HitsQuery(body.name, body.story))
    return HitsOut(
        total=hits.total,
        stories=hits.stories,
        chapters=hits.chapters,
        included=hits.included,
        tokens=hits.tokens,
    )


@router.post("/worlds/{world_id}/entries/{entry_id}/images/{image}/describe")
async def describe_entry_image(
    world_id: str, entry_id: str, image: str, body: DescribeIn, found: ServicesDep
) -> StreamingResponse:
    """Stream a description of an image of a canon entry; saves nothing (ADR-074)."""
    order = DescribeOrder(world_id, body.model, entry=entry_id, image=image)
    return await _describe(order, found)


@router.post("/worlds/{world_id}/entries/{entry_id}/appearance")
async def appearance(
    world_id: str, entry_id: str, body: AppearanceIn, found: ServicesDep
) -> StreamingResponse:
    """Stream the looks of a figure taken out of its entry; saves nothing (ADR-078)."""
    if found.provider is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "KI-Anbieter nicht eingerichtet")
    await found.catalog.refresh()
    prepared = prepare_appearance(
        found.context, world_id, entry_id, body.model or _preset(found, "aussehen"), found.catalog
    )
    return StreamingResponse(
        stream_answer(found.provider, prepared, "aussehen", found.usage.record),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )


@router.post("/worlds/{world_id}/maps/{file}/describe")
async def describe_map(
    world_id: str, file: str, body: DescribeIn, found: ServicesDep
) -> StreamingResponse:
    """Stream a description of a map of a world; saves nothing (ADR-074)."""
    return await _describe(DescribeOrder(world_id, body.model, map_file=file), found)


async def _describe(order: DescribeOrder, found: Services) -> StreamingResponse:
    if found.provider is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "KI-Anbieter nicht eingerichtet")
    await found.catalog.refresh()
    prepared = prepare_description(found.canon, found.context, found.catalog, order)
    return StreamingResponse(
        stream_answer(found.provider, prepared, "bildbeschreibung", found.usage.record),
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
    await found.catalog.refresh()
    outcome = await summarize_chapter(
        found.manuscript,
        found.context,
        found.provider,
        world_id,
        story_id,
        number,
        model=_preset(found, "kurzfassung"),
        overall_model=_preset(found, "gesamtzusammenfassung"),
        models=found.catalog,
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


def _preset(found: Services, task: Task) -> str:
    """The model ``task`` starts with when the request names none (ADR-096)."""
    return found.favorites.preset(task, found.catalog, DEFAULT_MODEL)


def _model_list(found: Services) -> ModelList:
    favorites = found.favorites.get()
    saved = found.favorites.tasks()
    return ModelList(
        models=favorites,
        default=DEFAULT_MODEL,
        favorites=favorites,
        tasks={task: saved.get(task) for task in TASKS},
        catalog=[_entry(model) for model in found.catalog.models()],
        catalog_available=found.catalog.available,
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
        reads_images=model.reads_images,
    )

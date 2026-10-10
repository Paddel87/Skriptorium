"""Endpoints for stories, chapters, guest links and story facts (module ``manuscript``).

The flow control checks what ``manuscript`` cannot check itself because it does not depend
on ``canon``: the world exists, and referenced canon entries exist in the world or are bound
into the story as guests.
"""

from collections.abc import Iterable
from typing import Any

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from skriptorium.api.context import Services, ServicesDep, current_session
from skriptorium.manuscript import (
    Chapter,
    Form,
    InstructionNote,
    Story,
    SummaryStatus,
    WritingStyle,
)
from skriptorium.storage import InvalidInput, NotFound

router = APIRouter(prefix="/api/worlds/{world_id}/stories", dependencies=[Depends(current_session)])


class WritingStyleIn(BaseModel):
    """Atmospheric writing style; the values are checked against the lists of ``manuscript``."""

    tone: list[str] = []
    atmosphere: list[str] = []
    style: list[str] = []
    tempo: str | None = None
    explicitness: str | None = None
    free: str = ""

    def to_style(self) -> WritingStyle:
        """The value type of ``manuscript``."""
        return WritingStyle(
            tone=tuple(self.tone),
            atmosphere=tuple(self.atmosphere),
            style=tuple(self.style),
            tempo=self.tempo,
            explicitness=self.explicitness,
            free=self.free,
        )


class StoryCreate(BaseModel):
    """A new story."""

    title: str
    form: Form
    perspective: str | None = None
    controlled_characters: list[str] = []


class StoryChange(BaseModel):
    """Changed fields of a story; missing fields stay, ``perspective: null`` clears it."""

    title: str | None = None
    form: Form | None = None
    perspective: str | None = None
    controlled_characters: list[str] | None = None
    # A model of the catalog (``GET /api/models``, ADR-055); ``null`` returns to the preset model
    # (step 3.9, ADR-023).
    model: str | None = None
    # Genres and the default writing style for new chapters (step 5.6, ADR-053); ``null``
    # empties them.
    genres: list[str] | None = None
    writing_style: WritingStyleIn | None = None


class SummaryText(BaseModel):
    """The overall summary of a story."""

    summary: str


class ChapterSave(BaseModel):
    """Title or text of a chapter; missing fields stay."""

    title: str | None = None
    text: str | None = None
    # A style sets one for this chapter; ``null`` takes the chapter back to the default of the
    # story (step 5.6); missing leaves it as it is.
    writing_style: WritingStyleIn | None = None


class ChapterSummary(BaseModel):
    """Short summary of a chapter and its review status."""

    summary: str
    status: SummaryStatus


class InstructionIn(BaseModel):
    """The instruction of a proposal that was taken over (step 5.13)."""

    instruction: str


class GuestLinkIn(BaseModel):
    """A canon entry of another world, bound into this story only."""

    world: str
    entry: str


class FactIn(BaseModel):
    """A fact about a canon entry that holds only in this story."""

    entry: str
    fact: str


@router.get("")
def list_stories(world_id: str, found: ServicesDep) -> list[Story]:
    """All stories of a world."""
    found.canon.get_world(world_id)
    return found.manuscript.list_stories(world_id)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_story(world_id: str, body: StoryCreate, found: ServicesDep) -> Story:
    """Create a story; characters must be entries of the world."""
    found.canon.get_world(world_id)
    _check_entries(found, world_id, body.controlled_characters, guests=())
    return found.manuscript.create_story(
        world_id,
        body.title,
        body.form,
        perspective=body.perspective,
        controlled_characters=body.controlled_characters,
    )


@router.get("/{story_id}")
def get_story(world_id: str, story_id: str, found: ServicesDep) -> Story:
    """One story with guest links and facts."""
    found.canon.get_world(world_id)
    return found.manuscript.get_story(world_id, story_id)


@router.patch("/{story_id}")
async def update_story(
    world_id: str, story_id: str, body: StoryChange, found: ServicesDep
) -> Story:
    """Change title, form, the settings of the character mode (FR-012) or the model."""
    story = _story(found, world_id, story_id)
    if body.model is not None:
        await found.catalog.refresh()
    if body.model is not None and body.model not in found.catalog:
        raise InvalidInput(f"Unbekanntes Modell: {body.model}")
    if body.controlled_characters is not None:
        _check_entries(found, world_id, body.controlled_characters, guests=story.guest_links)
    given = _given(body)
    if "genres" in given:
        given["genres"] = given["genres"] or ()
    if "writing_style" in given:
        given["writing_style"] = _style(body.writing_style) or WritingStyle()
    return found.manuscript.update_story(world_id, story_id, **given)


@router.put("/{story_id}/summary")
def set_story_summary(world_id: str, story_id: str, body: SummaryText, found: ServicesDep) -> Story:
    """Set the overall summary."""
    found.canon.get_world(world_id)
    return found.manuscript.set_story_summary(world_id, story_id, body.summary)


@router.post("/{story_id}/guests", status_code=status.HTTP_201_CREATED)
def add_guest_link(world_id: str, story_id: str, body: GuestLinkIn, found: ServicesDep) -> Story:
    """Bind an entry of another world into this story (FR-017)."""
    found.canon.get_world(world_id)
    try:
        found.canon.get_entry(body.world, body.entry)
    except NotFound as error:
        raise InvalidInput(f"Unbekannter Kanon-Eintrag {body.world}/{body.entry}") from error
    return found.manuscript.add_guest_link(world_id, story_id, body.world, body.entry)


@router.delete("/{story_id}/guests/{guest_world}/{entry}")
def remove_guest_link(
    world_id: str, story_id: str, guest_world: str, entry: str, found: ServicesDep
) -> Story:
    """Remove a guest link."""
    found.canon.get_world(world_id)
    return found.manuscript.remove_guest_link(world_id, story_id, guest_world, entry)


@router.post("/{story_id}/facts", status_code=status.HTTP_201_CREATED)
def add_fact(world_id: str, story_id: str, body: FactIn, found: ServicesDep) -> Story:
    """Add a fact that holds only in this story (FR-024)."""
    story = _story(found, world_id, story_id)
    _check_entries(found, world_id, [body.entry], guests=story.guest_links)
    return found.manuscript.add_fact(world_id, story_id, body.entry, body.fact)


@router.delete("/{story_id}/facts")
def remove_fact(world_id: str, story_id: str, body: FactIn, found: ServicesDep) -> Story:
    """Remove a story fact."""
    found.canon.get_world(world_id)
    return found.manuscript.remove_fact(world_id, story_id, body.entry, body.fact)


@router.get("/{story_id}/chapters")
def list_chapters(world_id: str, story_id: str, found: ServicesDep) -> list[Chapter]:
    """The chapters of a story in order."""
    found.canon.get_world(world_id)
    return found.manuscript.list_chapters(world_id, story_id)


@router.get("/{story_id}/chapters/{number}")
def get_chapter(world_id: str, story_id: str, number: int, found: ServicesDep) -> Chapter:
    """One chapter."""
    found.canon.get_world(world_id)
    return found.manuscript.get_chapter(world_id, story_id, number)


@router.put("/{story_id}/chapters/{number}")
def save_chapter(
    world_id: str, story_id: str, number: int, body: ChapterSave, found: ServicesDep
) -> Chapter:
    """Save a chapter; the next free number creates a new chapter (novels only)."""
    found.canon.get_world(world_id)
    given = _given(body)
    if "writing_style" in given:
        given["writing_style"] = _style(body.writing_style)
    return found.manuscript.save_chapter(world_id, story_id, number, **given)


@router.post("/{story_id}/chapters/{number}/complete")
def complete_chapter(world_id: str, story_id: str, number: int, found: ServicesDep) -> Chapter:
    """Mark a chapter as completed; `…/summarize` then creates its summary (step 3.6)."""
    found.canon.get_world(world_id)
    return found.manuscript.complete_chapter(world_id, story_id, number)


@router.put("/{story_id}/chapters/{number}/summary")
def set_chapter_summary(
    world_id: str, story_id: str, number: int, body: ChapterSummary, found: ServicesDep
) -> Chapter:
    """Set the short summary of a chapter and its review status."""
    found.canon.get_world(world_id)
    return found.manuscript.set_chapter_summary(
        world_id,
        story_id,
        number,
        body.summary,
        body.status,
    )


@router.get("/{story_id}/chapters/{number}/instructions")
def list_instructions(
    world_id: str, story_id: str, number: int, found: ServicesDep
) -> list[InstructionNote]:
    """Taken-over instructions of a chapter, oldest first (step 5.13, FR-027, ADR-056)."""
    found.canon.get_world(world_id)
    return found.manuscript.list_instructions(world_id, story_id, number)


@router.post("/{story_id}/chapters/{number}/instructions", status_code=status.HTTP_201_CREATED)
def add_instruction(
    world_id: str, story_id: str, number: int, body: InstructionIn, found: ServicesDep
) -> list[InstructionNote]:
    """Note the instruction of a proposal that was taken over; the AI never gets this list."""
    found.canon.get_world(world_id)
    return found.manuscript.add_instruction(
        world_id, story_id, number, body.instruction, found.clock()
    )


def _story(found: Services, world_id: str, story_id: str) -> Story:
    found.canon.get_world(world_id)
    return found.manuscript.get_story(world_id, story_id)


def _check_entries(
    found: Services, world_id: str, entries: Iterable[str], *, guests: Iterable[Any]
) -> None:
    guest_entries = {(link.world, link.entry) for link in guests}
    guest_ids = {entry for _, entry in guest_entries}
    for entry in entries:
        if entry in guest_ids:
            continue
        try:
            found.canon.get_entry(world_id, entry)
        except NotFound as error:
            raise InvalidInput(f"Unbekannter Kanon-Eintrag {entry}") from error


def _style(style: WritingStyleIn | None) -> WritingStyle | None:
    return style.to_style() if style is not None else None


def _given(body: BaseModel) -> dict[str, Any]:
    """The fields the client actually sent; the others stay unchanged."""
    return body.model_dump(exclude_unset=True)

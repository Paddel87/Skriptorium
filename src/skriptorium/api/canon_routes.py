"""Endpoints for worlds, canon entries, search and Markdown import (module ``canon``)."""

from typing import Any

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from skriptorium.api.context import ServicesDep, current_session
from skriptorium.canon import CanonEntry, Category, ImportPreview, ImportResult, World

router = APIRouter(prefix="/api/worlds", dependencies=[Depends(current_session)])


class WorldCreate(BaseModel):
    """A new world."""

    name: str
    description: str = ""


class WorldChange(BaseModel):
    """Changed fields of a world; missing fields stay."""

    name: str | None = None
    description: str | None = None


class EntryCreate(BaseModel):
    """A new canon entry."""

    category: Category
    name: str
    aliases: list[str] = []
    status: str | None = None
    body: str = ""


class EntryChange(BaseModel):
    """Changed fields of a canon entry; missing fields stay, ``status: null`` clears it."""

    category: Category | None = None
    name: str | None = None
    aliases: list[str] | None = None
    status: str | None = None
    body: str | None = None


class ImportText(BaseModel):
    """Markdown world material for the preview."""

    markdown: str


class ImportApply(BaseModel):
    """Markdown world material to take over, with the author's choices from the preview."""

    markdown: str
    categories: dict[str, Category] = {}
    overwrite: list[str] = []


@router.get("")
def list_worlds(found: ServicesDep) -> list[World]:
    """All worlds."""
    return found.canon.list_worlds()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_world(body: WorldCreate, found: ServicesDep) -> World:
    """Create a world."""
    return found.canon.create_world(body.name, body.description)


@router.get("/{world_id}")
def get_world(world_id: str, found: ServicesDep) -> World:
    """One world."""
    return found.canon.get_world(world_id)


@router.patch("/{world_id}")
def update_world(world_id: str, body: WorldChange, found: ServicesDep) -> World:
    """Change name or description of a world."""
    return found.canon.update_world(world_id, **_given(body))


@router.get("/{world_id}/entries")
def list_entries(
    world_id: str, found: ServicesDep, category: Category | None = None
) -> list[CanonEntry]:
    """Canon entries of a world, optionally of one category."""
    return found.canon.list_entries(world_id, category)


@router.post("/{world_id}/entries", status_code=status.HTTP_201_CREATED)
def create_entry(world_id: str, body: EntryCreate, found: ServicesDep) -> CanonEntry:
    """Create a canon entry."""
    return found.canon.create_entry(
        world_id,
        body.category,
        body.name,
        aliases=body.aliases,
        status=body.status,
        body=body.body,
    )


@router.get("/{world_id}/entries/{entry_id}")
def get_entry(world_id: str, entry_id: str, found: ServicesDep) -> CanonEntry:
    """One canon entry."""
    return found.canon.get_entry(world_id, entry_id)


@router.patch("/{world_id}/entries/{entry_id}")
def update_entry(world_id: str, entry_id: str, body: EntryChange, found: ServicesDep) -> CanonEntry:
    """Change a canon entry."""
    return found.canon.update_entry(world_id, entry_id, **_given(body))


@router.delete("/{world_id}/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(world_id: str, entry_id: str, found: ServicesDep) -> None:
    """Delete a canon entry."""
    found.canon.delete_entry(world_id, entry_id)


@router.get("/{world_id}/search")
def find_entries(world_id: str, text: str, found: ServicesDep) -> list[CanonEntry]:
    """Entries whose name or alias starts with ``text`` (``@`` menu)."""
    return found.canon.find_entries(world_id, text)


@router.post("/{world_id}/import/preview")
def preview_import(world_id: str, body: ImportText, found: ServicesDep) -> ImportPreview:
    """Split Markdown world material into entries without storing anything."""
    return found.canon.preview_import(world_id, body.markdown)


@router.post("/{world_id}/import")
def apply_import(world_id: str, body: ImportApply, found: ServicesDep) -> ImportResult:
    """Take over Markdown world material as shown in the preview."""
    return found.canon.apply_import(
        world_id,
        body.markdown,
        categories=body.categories,
        overwrite=set(body.overwrite),
    )


def _given(body: BaseModel) -> dict[str, Any]:
    """The fields the client actually sent; the others stay unchanged."""
    return body.model_dump(exclude_unset=True)

"""Paths of the manuscript files below the data directory (docs/architecture.md section 7)."""

from pathlib import PurePosixPath
from typing import Final

from skriptorium.storage import checked_identifier

STYLE_KEY: Final = "schreibweise"
STORY_FILE: Final = "story.md"
FACTS_FILE: Final = "facts.md"
CHAPTERS: Final = "chapters"
HISTORY: Final = "verlauf"


def story_dir(world_id: str, story_id: str) -> str:
    return f"worlds/{checked_identifier(world_id)}/stories/{checked_identifier(story_id)}"


def story_path(world_id: str, story_id: str) -> str:
    return f"{story_dir(world_id, story_id)}/{STORY_FILE}"


def facts_path(world_id: str, story_id: str) -> str:
    return f"{story_dir(world_id, story_id)}/{FACTS_FILE}"


def history_path(world_id: str, story_id: str, number: int) -> str:
    return f"{story_dir(world_id, story_id)}/{HISTORY}/{number:02d}.md"


def chapter_number(path: str) -> int | None:
    parts = PurePosixPath(path).parts
    if len(parts) != 6 or parts[4] != CHAPTERS:
        return None
    prefix = parts[5].split("-", 1)[0]
    return int(prefix) if prefix.isdigit() else None

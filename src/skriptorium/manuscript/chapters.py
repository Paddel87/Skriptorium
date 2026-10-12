"""Chapter files of a story: reading, writing and the short summaries."""

from skriptorium.manuscript.headers import chapter_from, chapter_header
from skriptorium.manuscript.layout import CHAPTERS, chapter_number, story_dir, story_path
from skriptorium.manuscript.models import (
    KEEP,
    SUMMARY_STATUSES,
    Chapter,
    ChapterStatus,
    Keep,
    Story,
    SummaryStatus,
    WritingStyle,
)
from skriptorium.manuscript.validation import required_text
from skriptorium.storage import DocumentStore, HeaderValue, InvalidInput, NotFound, slugify


class ChapterStore:
    """Reads and writes the chapter files of the stories."""

    def __init__(self, store: DocumentStore) -> None:
        """Use ``store`` for all files."""
        self._store = store

    def list_chapters(self, world_id: str, story_id: str) -> list[Chapter]:
        """The chapters of a story in order; the story must exist."""
        self._store.read(story_path(world_id, story_id))
        chapters = [
            chapter_from(self._store.read(path)) for path in self._chapter_paths(world_id, story_id)
        ]
        return sorted(chapters, key=lambda chapter: chapter.number)

    def get_chapter(self, world_id: str, story_id: str, number: int) -> Chapter:
        """One chapter."""
        return chapter_from(self._store.read(self.chapter_path(world_id, story_id, number)))

    def save_chapter(
        self,
        story: Story,
        number: int,
        *,
        title: str | Keep,
        text: str | Keep,
        writing_style: WritingStyle | Keep | None,
    ) -> Chapter:
        """Save a chapter of ``story``; ``writing_style`` is already checked."""
        existing = self.list_chapters(story.world, story.id)
        if number == len(existing) + 1:
            if story.form != "roman" and existing:
                raise InvalidInput("Nur ein Roman kann mehrere Kapitel haben")
            if isinstance(title, Keep):
                raise InvalidInput("Ein neues Kapitel braucht einen Titel")
            new_text = "" if isinstance(text, Keep) else text
            clean = required_text(title, "Kapiteltitel")
            # A new chapter follows the story's default until it gets a style of its own
            # (step 7.3, ADR-070); it no longer copies the default.
            if isinstance(writing_style, Keep):
                writing_style = None
            return self.write_chapter(
                story.world,
                story.id,
                number,
                clean,
                "in-arbeit",
                "",
                "fehlt",
                new_text,
                None,
                writing_style,
            )
        chapter = self.get_chapter(story.world, story.id, number)
        return self._rewrite_chapter(
            chapter,
            title=chapter.title if isinstance(title, Keep) else required_text(title, "Titel"),
            text=chapter.text if isinstance(text, Keep) else text,
            writing_style=writing_style,
        )

    def complete_chapter(self, world_id: str, story_id: str, number: int) -> Chapter:
        """Mark a chapter as completed."""
        chapter = self.get_chapter(world_id, story_id, number)
        return self._rewrite_chapter(chapter, status="abgeschlossen")

    def set_chapter_summary(
        self,
        world_id: str,
        story_id: str,
        number: int,
        summary: str,
        status: SummaryStatus,
    ) -> Chapter:
        """Set the short summary of a chapter and its review status."""
        if status not in SUMMARY_STATUSES:
            raise InvalidInput(f"Unbekannter Status der Kurzfassung: {status!r}")
        chapter = self.get_chapter(world_id, story_id, number)
        return self._rewrite_chapter(chapter, summary=summary, summary_status=status)

    def chapter_path(self, world_id: str, story_id: str, number: int) -> str:
        """Path of chapter ``number``; the story and the chapter must exist."""
        self._store.read(story_path(world_id, story_id))
        for path in self._chapter_paths(world_id, story_id):
            if chapter_number(path) == number:
                return path
        raise NotFound(f"{world_id}/{story_id}/Kapitel {number}")

    def write_chapter(
        self,
        world_id: str,
        story_id: str,
        number: int,
        title: str,
        status: ChapterStatus,
        summary: str,
        summary_status: SummaryStatus,
        text: str,
        previous: dict[str, HeaderValue] | None = None,
        writing_style: WritingStyle | None = None,
    ) -> Chapter:
        """Write the file of a chapter; its name follows number and title."""
        header = chapter_header(
            number, title, status, summary, summary_status, writing_style, previous or {}
        )
        path = f"{story_dir(world_id, story_id)}/{CHAPTERS}/{number:02d}-{slugify(title)}.md"
        return chapter_from(self._store.write(path, header, text))

    def _chapter_paths(self, world_id: str, story_id: str) -> list[str]:
        prefix = f"{story_dir(world_id, story_id)}/{CHAPTERS}"
        return [path for path in self._store.list_paths(prefix) if chapter_number(path)]

    def _rewrite_chapter(
        self,
        chapter: Chapter,
        *,
        title: str | None = None,
        text: str | None = None,
        status: ChapterStatus | None = None,
        summary: str | None = None,
        summary_status: SummaryStatus | None = None,
        writing_style: WritingStyle | Keep | None = KEEP,
    ) -> Chapter:
        old_path = self.chapter_path(chapter.world, chapter.story, chapter.number)
        previous = self._store.read(old_path).header
        updated = self.write_chapter(
            chapter.world,
            chapter.story,
            chapter.number,
            title if title is not None else chapter.title,
            status or chapter.status,
            summary if summary is not None else chapter.summary,
            summary_status or chapter.summary_status,
            text if text is not None else chapter.text,
            previous,
            chapter.writing_style if isinstance(writing_style, Keep) else writing_style,
        )
        if slugify(updated.title) != slugify(chapter.title):
            self._store.delete(old_path)
        return updated

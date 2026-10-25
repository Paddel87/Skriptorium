"""Story files: listing, creating and changing a story with its settings and summary."""

import contextlib
import secrets
from collections.abc import Sequence
from pathlib import PurePosixPath

from skriptorium.manuscript.chapters import ChapterStore
from skriptorium.manuscript.headers import facts_from, story_from, story_header
from skriptorium.manuscript.layout import (
    COVER_KEY,
    STORY_FILE,
    cover_path,
    facts_path,
    story_dir,
    story_path,
)
from skriptorium.manuscript.models import (
    GENRES,
    KEEP,
    Form,
    Keep,
    Story,
    StoryFact,
    WritingStyle,
)
from skriptorium.manuscript.validation import (
    checked_choices,
    checked_form,
    checked_style,
    clean_references,
    required_text,
)
from skriptorium.storage import (
    IMAGE_SUFFIXES,
    Document,
    DocumentStore,
    ImageOrigin,
    InvalidInput,
    NotFound,
    checked_identifier,
    inspect_image,
    slugify,
)


class StoryStore:
    """Reads and writes the story files; the facts file is read with the story."""

    def __init__(self, store: DocumentStore, chapters: ChapterStore) -> None:
        """Use ``store`` for all files and ``chapters`` for the chapters of the stories."""
        self._store = store
        self._chapters = chapters

    def list_stories(self, world_id: str) -> list[Story]:
        """The stories of a world, sorted by title."""
        prefix = f"worlds/{checked_identifier(world_id)}/stories"
        paths = [
            path
            for path in self._store.list_paths(prefix)
            if len(PurePosixPath(path).parts) == 5 and path.endswith(f"/{STORY_FILE}")
        ]
        stories = [self.get_story(world_id, PurePosixPath(path).parts[3]) for path in paths]
        return sorted(stories, key=lambda story: (story.title.casefold(), story.id))

    def get_story(self, world_id: str, story_id: str) -> Story:
        """One story with guest links and story facts."""
        document = self._store.read(story_path(world_id, story_id))
        path = facts_path(world_id, story_id)
        facts: tuple[StoryFact, ...] = ()
        if path in self._store.list_paths(story_dir(world_id, story_id)):
            facts = facts_from(self._store.read(path))
        return story_from(document, facts)

    def create_story(
        self,
        world_id: str,
        title: str,
        form: Form,
        *,
        perspective: str | None,
        controlled_characters: Sequence[str],
    ) -> Story:
        """Create a story; a short story or fragment gets its single chapter at once."""
        clean_title = required_text(title, "Titel")
        story_id = slugify(clean_title)
        header = story_header(
            {},
            clean_title,
            checked_form(form),
            perspective,
            clean_references(controlled_characters),
            (),
            None,
            (),
            WritingStyle(),
        )
        document = self._store.write(story_path(world_id, story_id), header, "", create=True)
        if form != "roman":
            self._chapters.write_chapter(
                world_id, story_id, 1, clean_title, "in-arbeit", "", "fehlt", ""
            )
        return story_from(document, ())

    def update_story(
        self,
        world_id: str,
        story_id: str,
        *,
        title: str | Keep,
        form: Form | Keep,
        perspective: str | Keep | None,
        controlled_characters: Sequence[str] | Keep,
        model: str | Keep | None,
        genres: Sequence[str] | Keep,
        writing_style: WritingStyle | Keep,
    ) -> Story:
        """Change the settings of a story; ``KEEP`` leaves a field as it is.

        A changed default style is followed by the chapters whose own style equals the old
        default - copies from before step 7.3 that were never changed (ADR-070).
        """
        story = self.get_story(world_id, story_id)
        new_form = story.form if isinstance(form, Keep) else checked_form(form)
        if new_form != "roman" and len(self._chapters.list_chapters(world_id, story_id)) > 1:
            raise InvalidInput("Nur ein Roman kann mehrere Kapitel haben")
        document = self._store.read(story_path(world_id, story_id))
        header = story_header(
            document.header,
            story.title if isinstance(title, Keep) else required_text(title, "Titel"),
            new_form,
            story.perspective if isinstance(perspective, Keep) else perspective,
            list(story.controlled_characters)
            if isinstance(controlled_characters, Keep)
            else clean_references(controlled_characters),
            story.guest_links,
            story.model if isinstance(model, Keep) else model,
            story.genres if isinstance(genres, Keep) else checked_choices(genres, GENRES, "Genre"),
            story.writing_style
            if isinstance(writing_style, Keep)
            else checked_style(writing_style),
        )
        self._store.write(document.path, header, document.body)
        changed = self.get_story(world_id, story_id)
        if changed.writing_style != story.writing_style:
            for chapter in self._chapters.list_chapters(world_id, story_id):
                if chapter.writing_style == story.writing_style:
                    self._chapters.save_chapter(
                        changed, chapter.number, title=KEEP, text=KEEP, writing_style=None
                    )
        return changed

    def set_story_cover(
        self, world_id: str, story_id: str, data: bytes, origin: ImageOrigin | None = None
    ) -> Story:
        """Store a cover for the story; it replaces the previous one, whose file is deleted."""
        path = story_path(world_id, story_id)
        document = self._store.read(path)
        previous = self.get_story(world_id, story_id).cover
        file = f"titelbild-{secrets.token_hex(6)}{IMAGE_SUFFIXES[inspect_image(data).kind]}"
        self._store.write_image(cover_path(world_id, story_id, file), data, origin=origin)
        try:
            updated = self._write_cover(document, file, world_id, story_id)
        except BaseException:
            self._delete_cover_file(world_id, story_id, file)
            raise
        if previous is not None:
            self._delete_cover_file(world_id, story_id, previous)
        return updated

    def story_cover(self, world_id: str, story_id: str) -> tuple[bytes, str]:
        """The bytes and media type of the story's cover."""
        cover = self.get_story(world_id, story_id).cover
        if cover is None:
            raise NotFound(f"{world_id}/{story_id}/{COVER_KEY}")
        return self._store.read_image(cover_path(world_id, story_id, cover))

    def story_cover_origin(self, world_id: str, story_id: str) -> ImageOrigin | None:
        """The origin of the story's cover, ``None`` if it has none (ADR-095)."""
        cover = self.get_story(world_id, story_id).cover
        if cover is None:
            raise NotFound(f"{world_id}/{story_id}/{COVER_KEY}")
        return self._store.read_image_origin(cover_path(world_id, story_id, cover))

    def remove_story_cover(self, world_id: str, story_id: str) -> Story:
        """Remove the story's cover and delete its file."""
        cover = self.get_story(world_id, story_id).cover
        if cover is None:
            raise NotFound(f"{world_id}/{story_id}/{COVER_KEY}")
        document = self._store.read(story_path(world_id, story_id))
        updated = self._write_cover(document, None, world_id, story_id)
        self._delete_cover_file(world_id, story_id, cover)
        return updated

    def _write_cover(
        self, document: Document, file: str | None, world_id: str, story_id: str
    ) -> Story:
        header = dict(document.header)
        if file is None:
            header.pop(COVER_KEY, None)
        else:
            header[COVER_KEY] = file
        self._store.write(document.path, header, document.body)
        return self.get_story(world_id, story_id)

    def _delete_cover_file(self, world_id: str, story_id: str, file: str) -> None:
        # A file already gone (deleted by hand) is not an error; the story no longer names it.
        with contextlib.suppress(NotFound):
            self._store.delete_image(cover_path(world_id, story_id, file))

    def set_story_summary(self, world_id: str, story_id: str, summary: str) -> Story:
        """Set the overall summary of a story."""
        document = self._store.read(story_path(world_id, story_id))
        self._store.write(document.path, document.header, summary)
        return self.get_story(world_id, story_id)

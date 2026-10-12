"""Story extras: guest links, story facts and the history of instructions."""

from skriptorium.manuscript.chapters import ChapterStore
from skriptorium.manuscript.headers import (
    facts_header,
    guest_links_header,
    history_header,
    notes_from,
)
from skriptorium.manuscript.layout import HISTORY, facts_path, history_path, story_dir, story_path
from skriptorium.manuscript.models import GuestLink, InstructionNote, Story, StoryFact
from skriptorium.manuscript.stories import StoryStore
from skriptorium.manuscript.validation import required_text
from skriptorium.storage import (
    AlreadyExists,
    DocumentStore,
    InvalidInput,
    NotFound,
    checked_identifier,
)


class StoryExtras:
    """Changes the guest links, facts and instruction history of the stories."""

    def __init__(self, store: DocumentStore, stories: StoryStore, chapters: ChapterStore) -> None:
        """Use ``store`` for all files, ``stories`` and ``chapters`` to find what they belong to."""
        self._store = store
        self._stories = stories
        self._chapters = chapters

    def add_guest_link(self, world_id: str, story_id: str, guest_world: str, entry: str) -> Story:
        """Bind a canon entry of another world into this story only."""
        link = GuestLink(checked_identifier(guest_world), checked_identifier(entry))
        if link.world == world_id:
            raise InvalidInput("Gast-Verbindungen führen in eine andere Welt")
        story = self._stories.get_story(world_id, story_id)
        if link in story.guest_links:
            raise AlreadyExists(f"{link.world}/{link.entry}")
        return self._write_guest_links(story, (*story.guest_links, link))

    def remove_guest_link(
        self, world_id: str, story_id: str, guest_world: str, entry: str
    ) -> Story:
        """Remove a guest link."""
        story = self._stories.get_story(world_id, story_id)
        link = GuestLink(guest_world, entry)
        if link not in story.guest_links:
            raise NotFound(f"{guest_world}/{entry}")
        return self._write_guest_links(story, tuple(g for g in story.guest_links if g != link))

    def add_fact(self, world_id: str, story_id: str, entry: str, fact: str) -> Story:
        """Add a fact about ``entry`` that holds only in this story."""
        new = StoryFact(checked_identifier(entry), required_text(fact, "Fakt"))
        story = self._stories.get_story(world_id, story_id)
        if new in story.facts:
            raise AlreadyExists(f"{new.entry}: {new.fact}")
        return self._write_facts(story, (*story.facts, new))

    def remove_fact(self, world_id: str, story_id: str, entry: str, fact: str) -> Story:
        """Remove a story fact."""
        story = self._stories.get_story(world_id, story_id)
        old = StoryFact(entry, fact.strip())
        if old not in story.facts:
            raise NotFound(f"{entry}: {fact}")
        return self._write_facts(story, tuple(f for f in story.facts if f != old))

    def list_instructions(self, world_id: str, story_id: str, number: int) -> list[InstructionNote]:
        """The taken-over instructions of a chapter, oldest first."""
        self._chapters.chapter_path(world_id, story_id, number)
        path = history_path(world_id, story_id, number)
        if path not in self._store.list_paths(f"{story_dir(world_id, story_id)}/{HISTORY}"):
            return []
        return notes_from(self._store.read(path))

    def add_instruction(
        self,
        world_id: str,
        story_id: str,
        number: int,
        note: InstructionNote,
    ) -> list[InstructionNote]:
        """Note a taken-over exchange; the chapter file stays as it is."""
        checked = InstructionNote(
            note.at,
            required_text(note.instruction, "Anweisung"),
            required_text(note.text, "Text"),
            (note.model.strip() or None) if note.model is not None else None,
        )
        notes = [*self.list_instructions(world_id, story_id, number), checked]
        self._store.write(
            history_path(world_id, story_id, number), history_header(number, notes), ""
        )
        return notes

    def _write_guest_links(self, story: Story, links: tuple[GuestLink, ...]) -> Story:
        document = self._store.read(story_path(story.world, story.id))
        header = dict(document.header)
        header["gast_verbindungen"] = guest_links_header(links)
        self._store.write(document.path, header, document.body)
        return self._stories.get_story(story.world, story.id)

    def _write_facts(self, story: Story, facts: tuple[StoryFact, ...]) -> Story:
        self._store.write(facts_path(story.world, story.id), facts_header(facts), "")
        return self._stories.get_story(story.world, story.id)

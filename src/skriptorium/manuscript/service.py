"""``ManuscriptService``: stories, chapters, summaries, guest links and story facts.

Layout below the data directory (docs/architecture.md section 7)::

    worlds/<world>/stories/<story>/story.md              titel, form, perspektive,
                                                         gefuehrte_figuren, gast_verbindungen,
                                                         modell (ADR-023), genre and schreibweise
                                                         (ADR-053); body: overall summary
    worlds/<world>/stories/<story>/chapters/NN-<t>.md    kapitel, titel, status, kurzfassung,
                                                         kurzfassung_status, schreibweise
                                                         (optional, ADR-053); body: text
    worlds/<world>/stories/<story>/facts.md              fakten: list of eintrag and fakt

A novel (``roman``) has any number of chapters; a short story or fragment has exactly one,
created with the story, because the data model keeps all manuscript text in chapter files.
References to canon entries are stored as given; checking that they exist is the task of
the flow control in ``api`` (``manuscript`` does not depend on ``canon``). The same holds
for the existence of the world.
"""

from collections.abc import Sequence
from dataclasses import dataclass
from enum import Enum
from pathlib import PurePosixPath
from typing import Final, Literal, get_args

from skriptorium.storage import (
    AlreadyExists,
    Document,
    DocumentStore,
    HeaderValue,
    InvalidInput,
    NotFound,
    checked_identifier,
    slugify,
)

Form = Literal["roman", "kurzgeschichte", "fragment"]
FORMS: Final[tuple[Form, ...]] = get_args(Form)
ChapterStatus = Literal["in-arbeit", "abgeschlossen"]
CHAPTER_STATUSES: Final[tuple[ChapterStatus, ...]] = get_args(ChapterStatus)
SummaryStatus = Literal["fehlt", "erzeugt", "geprüft"]
SUMMARY_STATUSES: Final[tuple[SummaryStatus, ...]] = get_args(SummaryStatus)

# Fixed lists of the atmospheric writing style (step 5.6, ADR-053); the order is the one in
# which the owner chose them. ``ui/src/views/WritingStyle.tsx`` keeps a copy that must match.
GENRES: Final[tuple[str, ...]] = (
    "Dark Romance",
    "Dark Erotic",
    "CNC",
    "Thriller",
    "Psychothriller",
    "düstere Geschichte",
    "Horror",
    "Dark Fantasy",
    "Krimi",
)
TONES: Final[tuple[str, ...]] = (
    "düster",
    "bedrückend",
    "kalt",
    "roh",
    "sinnlich",
    "zärtlich",
    "leidenschaftlich",
    "melancholisch",
    "bedrohlich",
    "nüchtern",
    "ironisch",
)
ATMOSPHERES: Final[tuple[str, ...]] = (
    "beklemmend",
    "angespannt",
    "unheimlich",
    "gefährlich",
    "schwül",
    "intim",
    "eisig",
    "hoffnungslos",
    "still",
    "fiebrig",
)
TEMPOS: Final[tuple[str, ...]] = ("langsam", "gemessen", "zügig", "atemlos")
STYLES: Final[tuple[str, ...]] = (
    "knapp",
    "schlicht",
    "bildhaft",
    "poetisch",
    "ausführlich",
    "dialogreich",
)
EXPLICITNESSES: Final[tuple[str, ...]] = ("angedeutet", "sinnlich", "explizit")
# Longest free text of a writing style. Other texts of the module have no limit; the request
# budget bounds this block, so the limit follows the owner's decision (ADR-053).
FREE_TEXT_MAX: Final = 1000

_STYLE_KEY = "schreibweise"
_STORY_FILE = "story.md"
_FACTS_FILE = "facts.md"
_CHAPTERS = "chapters"


class _Keep(Enum):
    """Marker for "leave this field unchanged" in updates."""

    KEEP = "keep"


KEEP: Final = _Keep.KEEP


@dataclass(frozen=True)
class GuestLink:
    """A canon entry of another world bound into one story (FR-017)."""

    world: str
    entry: str


@dataclass(frozen=True)
class StoryFact:
    """A fact that holds only in one story (FR-024)."""

    entry: str
    fact: str


@dataclass(frozen=True)
class WritingStyle:
    """Atmospheric writing style (step 5.6, ADR-053); the empty style has nothing set."""

    tone: tuple[str, ...] = ()
    atmosphere: tuple[str, ...] = ()
    style: tuple[str, ...] = ()
    tempo: str | None = None
    explicitness: str | None = None
    free: str = ""


@dataclass(frozen=True)
class Story:
    """A story with its settings and overall summary."""

    world: str
    id: str
    title: str
    form: Form
    perspective: str | None
    controlled_characters: tuple[str, ...]
    guest_links: tuple[GuestLink, ...]
    facts: tuple[StoryFact, ...]
    summary: str
    # Model chosen for this story (step 3.9, ADR-023); ``None`` means the preset model.
    model: str | None = None
    # Genres and the default writing style that new chapters copy (step 5.6, ADR-053).
    genres: tuple[str, ...] = ()
    writing_style: WritingStyle = WritingStyle()


@dataclass(frozen=True)
class Chapter:
    """One chapter: its text and its short summary."""

    world: str
    story: str
    number: int
    title: str
    status: ChapterStatus
    summary: str
    summary_status: SummaryStatus
    text: str
    # ``None``: the chapter has no style of its own, the default of the story applies.
    writing_style: WritingStyle | None = None


class ManuscriptService:
    """Creates and changes stories and chapters."""

    def __init__(self, store: DocumentStore) -> None:
        """Use ``store`` for all files."""
        self._store = store

    # --- stories --------------------------------------------------------------------------

    def list_stories(self, world_id: str) -> list[Story]:
        """The stories of a world, sorted by title."""
        prefix = f"worlds/{checked_identifier(world_id)}/stories"
        paths = [
            path
            for path in self._store.list_paths(prefix)
            if len(PurePosixPath(path).parts) == 5 and path.endswith(f"/{_STORY_FILE}")
        ]
        stories = [self.get_story(world_id, PurePosixPath(path).parts[3]) for path in paths]
        return sorted(stories, key=lambda story: (story.title.casefold(), story.id))

    def get_story(self, world_id: str, story_id: str) -> Story:
        """One story with guest links and story facts.

        Raises:
            NotFound: The story does not exist.
            InvalidInput: Bad identifier or inconsistent file.
        """
        document = self._store.read(_story_path(world_id, story_id))
        facts_path = _facts_path(world_id, story_id)
        facts: tuple[StoryFact, ...] = ()
        if facts_path in self._store.list_paths(_story_dir(world_id, story_id)):
            facts = _facts_from(self._store.read(facts_path))
        return _story_from(document, facts)

    def create_story(
        self,
        world_id: str,
        title: str,
        form: Form,
        *,
        perspective: str | None = None,
        controlled_characters: Sequence[str] = (),
    ) -> Story:
        """Create a story; a short story or fragment gets its single chapter at once.

        Raises:
            AlreadyExists: A story with the same identifier exists in the world.
            InvalidInput: Empty title, unknown form or bad character reference.
        """
        clean_title = _required_text(title, "Titel")
        story_id = slugify(clean_title)
        header = _story_header(
            {},
            clean_title,
            _checked_form(form),
            perspective,
            _clean_references(controlled_characters),
            (),
            None,
            (),
            WritingStyle(),
        )
        document = self._store.write(_story_path(world_id, story_id), header, "", create=True)
        if form != "roman":
            self._write_chapter(world_id, story_id, 1, clean_title, "in-arbeit", "", "fehlt", "")
        return _story_from(document, ())

    def update_story(
        self,
        world_id: str,
        story_id: str,
        *,
        title: str | _Keep = KEEP,
        form: Form | _Keep = KEEP,
        perspective: str | _Keep | None = KEEP,
        controlled_characters: Sequence[str] | _Keep = KEEP,
        model: str | _Keep | None = KEEP,
        genres: Sequence[str] | _Keep = KEEP,
        writing_style: WritingStyle | _Keep = KEEP,
    ) -> Story:
        """Change title, form, the settings of the character mode (FR-012), the model, the
        genres or the default writing style (step 5.6).

        Which models exist is known to ``api``, not here; ``model`` is stored as given
        (blank or ``None`` clears it). A new default style applies to chapters created
        afterwards; existing chapters keep theirs (ADR-053).

        Raises:
            NotFound: The story does not exist.
            InvalidInput: Empty title, unknown form, bad reference, a value outside the lists
                of genre or writing style, or a form other than ``roman`` for a story with
                more than one chapter.
        """
        story = self.get_story(world_id, story_id)
        new_form = story.form if isinstance(form, _Keep) else _checked_form(form)
        if new_form != "roman" and len(self.list_chapters(world_id, story_id)) > 1:
            raise InvalidInput("Nur ein Roman kann mehrere Kapitel haben")
        document = self._store.read(_story_path(world_id, story_id))
        header = _story_header(
            document.header,
            story.title if isinstance(title, _Keep) else _required_text(title, "Titel"),
            new_form,
            story.perspective if isinstance(perspective, _Keep) else perspective,
            list(story.controlled_characters)
            if isinstance(controlled_characters, _Keep)
            else _clean_references(controlled_characters),
            story.guest_links,
            story.model if isinstance(model, _Keep) else model,
            story.genres
            if isinstance(genres, _Keep)
            else _checked_choices(genres, GENRES, "Genre"),
            story.writing_style
            if isinstance(writing_style, _Keep)
            else _checked_style(writing_style),
        )
        self._store.write(document.path, header, document.body)
        return self.get_story(world_id, story_id)

    def set_story_summary(self, world_id: str, story_id: str, summary: str) -> Story:
        """Set the overall summary of a story.

        Raises:
            NotFound: The story does not exist.
        """
        document = self._store.read(_story_path(world_id, story_id))
        self._store.write(document.path, document.header, summary)
        return self.get_story(world_id, story_id)

    # --- guest links and story facts ------------------------------------------------------

    def add_guest_link(self, world_id: str, story_id: str, guest_world: str, entry: str) -> Story:
        """Bind a canon entry of another world into this story only (FR-017).

        Raises:
            NotFound: The story does not exist.
            AlreadyExists: The link exists.
            InvalidInput: ``guest_world`` is the story's own world or a bad identifier.
        """
        link = GuestLink(checked_identifier(guest_world), checked_identifier(entry))
        if link.world == world_id:
            raise InvalidInput("Gast-Verbindungen führen in eine andere Welt")
        story = self.get_story(world_id, story_id)
        if link in story.guest_links:
            raise AlreadyExists(f"{link.world}/{link.entry}")
        return self._write_guest_links(story, (*story.guest_links, link))

    def remove_guest_link(
        self, world_id: str, story_id: str, guest_world: str, entry: str
    ) -> Story:
        """Remove a guest link.

        Raises:
            NotFound: The story or the link does not exist.
        """
        story = self.get_story(world_id, story_id)
        link = GuestLink(guest_world, entry)
        if link not in story.guest_links:
            raise NotFound(f"{guest_world}/{entry}")
        return self._write_guest_links(story, tuple(g for g in story.guest_links if g != link))

    def add_fact(self, world_id: str, story_id: str, entry: str, fact: str) -> Story:
        """Add a fact about ``entry`` that holds only in this story (FR-024).

        Raises:
            NotFound: The story does not exist.
            AlreadyExists: The same fact exists.
            InvalidInput: Empty fact or bad entry reference.
        """
        new = StoryFact(checked_identifier(entry), _required_text(fact, "Fakt"))
        story = self.get_story(world_id, story_id)
        if new in story.facts:
            raise AlreadyExists(f"{new.entry}: {new.fact}")
        return self._write_facts(story, (*story.facts, new))

    def remove_fact(self, world_id: str, story_id: str, entry: str, fact: str) -> Story:
        """Remove a story fact.

        Raises:
            NotFound: The story or the fact does not exist.
        """
        story = self.get_story(world_id, story_id)
        old = StoryFact(entry, fact.strip())
        if old not in story.facts:
            raise NotFound(f"{entry}: {fact}")
        return self._write_facts(story, tuple(f for f in story.facts if f != old))

    # --- chapters -------------------------------------------------------------------------

    def list_chapters(self, world_id: str, story_id: str) -> list[Chapter]:
        """The chapters of a story in order.

        Raises:
            NotFound: The story does not exist.
        """
        self._store.read(_story_path(world_id, story_id))
        chapters = [
            _chapter_from(self._store.read(path))
            for path in self._chapter_paths(world_id, story_id)
        ]
        return sorted(chapters, key=lambda chapter: chapter.number)

    def get_chapter(self, world_id: str, story_id: str, number: int) -> Chapter:
        """One chapter.

        Raises:
            NotFound: The story or the chapter does not exist.
        """
        return _chapter_from(self._store.read(self._chapter_path(world_id, story_id, number)))

    def save_chapter(
        self,
        world_id: str,
        story_id: str,
        number: int,
        *,
        title: str | _Keep = KEEP,
        text: str | _Keep = KEEP,
        writing_style: WritingStyle | _Keep | None = KEEP,
    ) -> Chapter:
        """Save a chapter; the next free number creates a new chapter (novels only).

        A new chapter copies the default writing style of the story unless that is empty
        (step 5.6, ADR-053). ``writing_style=None`` takes an existing chapter back to the
        default of the story; a style sets one of its own.

        Raises:
            NotFound: The story does not exist.
            InvalidInput: Number is neither existing nor the next one, a new chapter has no
                title, a new chapter is added to a story that is not a novel, or the style
                has a value outside the lists.
        """
        checked = (
            writing_style
            if isinstance(writing_style, _Keep) or writing_style is None
            else _checked_style(writing_style)
        )
        story = self.get_story(world_id, story_id)
        existing = self.list_chapters(world_id, story_id)
        if number == len(existing) + 1:
            if story.form != "roman" and existing:
                raise InvalidInput("Nur ein Roman kann mehrere Kapitel haben")
            if isinstance(title, _Keep):
                raise InvalidInput("Ein neues Kapitel braucht einen Titel")
            new_text = "" if isinstance(text, _Keep) else text
            clean = _required_text(title, "Kapiteltitel")
            if isinstance(checked, _Keep):
                inherited = story.writing_style
                checked = inherited if inherited != WritingStyle() else None
            return self._write_chapter(
                world_id, story_id, number, clean, "in-arbeit", "", "fehlt", new_text, None, checked
            )
        chapter = self.get_chapter(world_id, story_id, number)
        return self._rewrite_chapter(
            chapter,
            title=chapter.title if isinstance(title, _Keep) else _required_text(title, "Titel"),
            text=chapter.text if isinstance(text, _Keep) else text,
            writing_style=checked,
        )

    def complete_chapter(self, world_id: str, story_id: str, number: int) -> Chapter:
        """Mark a chapter as completed; its summary is created by the flow in ``api`` (3.6).

        Raises:
            NotFound: The story or the chapter does not exist.
        """
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
        """Set the short summary of a chapter and its review status.

        Raises:
            NotFound: The story or the chapter does not exist.
            InvalidInput: Unknown status.
        """
        if status not in SUMMARY_STATUSES:
            raise InvalidInput(f"Unbekannter Status der Kurzfassung: {status!r}")
        chapter = self.get_chapter(world_id, story_id, number)
        return self._rewrite_chapter(chapter, summary=summary, summary_status=status)

    # --- helpers --------------------------------------------------------------------------

    def _chapter_paths(self, world_id: str, story_id: str) -> list[str]:
        prefix = f"{_story_dir(world_id, story_id)}/{_CHAPTERS}"
        return [path for path in self._store.list_paths(prefix) if _chapter_number(path)]

    def _chapter_path(self, world_id: str, story_id: str, number: int) -> str:
        self._store.read(_story_path(world_id, story_id))
        for path in self._chapter_paths(world_id, story_id):
            if _chapter_number(path) == number:
                return path
        raise NotFound(f"{world_id}/{story_id}/Kapitel {number}")

    def _write_chapter(
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
        header: dict[str, HeaderValue] = {
            "kapitel": number,
            "titel": title,
            "status": status,
            "kurzfassung": summary,
            "kurzfassung_status": summary_status,
        }
        if writing_style is not None:
            header["schreibweise"] = _style_header(writing_style)
        header.update(
            {k: v for k, v in (previous or {}).items() if k not in header and k != _STYLE_KEY}
        )
        path = f"{_story_dir(world_id, story_id)}/{_CHAPTERS}/{number:02d}-{slugify(title)}.md"
        return _chapter_from(self._store.write(path, header, text))

    def _rewrite_chapter(
        self,
        chapter: Chapter,
        *,
        title: str | None = None,
        text: str | None = None,
        status: ChapterStatus | None = None,
        summary: str | None = None,
        summary_status: SummaryStatus | None = None,
        writing_style: WritingStyle | _Keep | None = KEEP,
    ) -> Chapter:
        old_path = self._chapter_path(chapter.world, chapter.story, chapter.number)
        previous = self._store.read(old_path).header
        updated = self._write_chapter(
            chapter.world,
            chapter.story,
            chapter.number,
            title if title is not None else chapter.title,
            status or chapter.status,
            summary if summary is not None else chapter.summary,
            summary_status or chapter.summary_status,
            text if text is not None else chapter.text,
            previous,
            chapter.writing_style if isinstance(writing_style, _Keep) else writing_style,
        )
        if slugify(updated.title) != slugify(chapter.title):
            self._store.delete(old_path)
        return updated

    def _write_guest_links(self, story: Story, links: tuple[GuestLink, ...]) -> Story:
        document = self._store.read(_story_path(story.world, story.id))
        header = dict(document.header)
        header["gast_verbindungen"] = [{"welt": g.world, "eintrag": g.entry} for g in links]
        self._store.write(document.path, header, document.body)
        return self.get_story(story.world, story.id)

    def _write_facts(self, story: Story, facts: tuple[StoryFact, ...]) -> Story:
        header: dict[str, HeaderValue] = {
            "fakten": [{"eintrag": f.entry, "fakt": f.fact} for f in facts]
        }
        self._store.write(_facts_path(story.world, story.id), header, "")
        return self.get_story(story.world, story.id)


def _story_dir(world_id: str, story_id: str) -> str:
    return f"worlds/{checked_identifier(world_id)}/stories/{checked_identifier(story_id)}"


def _story_path(world_id: str, story_id: str) -> str:
    return f"{_story_dir(world_id, story_id)}/{_STORY_FILE}"


def _facts_path(world_id: str, story_id: str) -> str:
    return f"{_story_dir(world_id, story_id)}/{_FACTS_FILE}"


def _chapter_number(path: str) -> int | None:
    parts = PurePosixPath(path).parts
    if len(parts) != 6 or parts[4] != _CHAPTERS:
        return None
    prefix = parts[5].split("-", 1)[0]
    return int(prefix) if prefix.isdigit() else None


def _checked_form(form: str) -> Form:
    if form not in FORMS:
        raise InvalidInput(f"Unbekannte Form: {form!r}")
    return form


def _required_text(value: str, label: str) -> str:
    text = value.strip()
    if not text:
        raise InvalidInput(f"{label} darf nicht leer sein")
    return text


def _clean_references(references: Sequence[str]) -> list[str]:
    if isinstance(references, str):
        raise InvalidInput("Figuren müssen als Liste angegeben werden")
    return [checked_identifier(reference) for reference in references]


def _story_header(
    previous: dict[str, HeaderValue],
    title: str,
    form: Form,
    perspective: str | None,
    controlled: list[str],
    guest_links: tuple[GuestLink, ...],
    model: str | None,
    genres: Sequence[str],
    writing_style: WritingStyle,
) -> dict[str, HeaderValue]:
    header: dict[str, HeaderValue] = {
        "titel": title,
        "form": form,
        "perspektive": perspective.strip() if perspective and perspective.strip() else None,
        "gefuehrte_figuren": list[HeaderValue](controlled),
        "gast_verbindungen": [{"welt": g.world, "eintrag": g.entry} for g in guest_links],
        "modell": model.strip() if model and model.strip() else None,
        "genre": list[HeaderValue](genres),
        _STYLE_KEY: _style_header(writing_style),
    }
    header.update({k: v for k, v in previous.items() if k not in header})
    return header


def _checked_choices(
    values: Sequence[str], allowed: tuple[str, ...], label: str
) -> tuple[str, ...]:
    """The values without repeats, in the given order; each must be on the list."""
    if isinstance(values, str):
        raise InvalidInput(f"{label}: Werte müssen als Liste angegeben werden")
    for value in values:
        if value not in allowed:
            raise InvalidInput(f"Unbekannter Wert für {label}: {value!r}")
    return tuple(dict.fromkeys(values))


def _checked_single(value: str | None, allowed: tuple[str, ...], label: str) -> str | None:
    if value is None or not value.strip():
        return None
    if value.strip() not in allowed:
        raise InvalidInput(f"Unbekannter Wert für {label}: {value!r}")
    return value.strip()


def _checked_style(style: WritingStyle) -> WritingStyle:
    """``style`` with every value checked against the fixed lists (ADR-053)."""
    free = style.free.strip()
    if len(free) > FREE_TEXT_MAX:
        raise InvalidInput(f"Weitere Angaben dürfen höchstens {FREE_TEXT_MAX} Zeichen lang sein")
    return WritingStyle(
        tone=_checked_choices(style.tone, TONES, "Tonalität"),
        atmosphere=_checked_choices(style.atmosphere, ATMOSPHERES, "Atmosphäre"),
        style=_checked_choices(style.style, STYLES, "Stil"),
        tempo=_checked_single(style.tempo, TEMPOS, "Tempo"),
        explicitness=_checked_single(style.explicitness, EXPLICITNESSES, "Deutlichkeit"),
        free=free,
    )


def _style_header(style: WritingStyle) -> HeaderValue:
    return {
        "tonalitaet": list[HeaderValue](style.tone),
        "atmosphaere": list[HeaderValue](style.atmosphere),
        "stil": list[HeaderValue](style.style),
        "tempo": style.tempo,
        "deutlichkeit": style.explicitness,
        "frei": style.free,
    }


def _style_from(document: Document, value: HeaderValue) -> WritingStyle:
    """Read a ``schreibweise`` mapping; keys that are missing count as empty."""
    if not isinstance(value, dict):
        raise InvalidInput(f"{document.path}: Feld 'schreibweise' muss ein Mapping sein")
    section = Document(document.path, value, "")

    def single(key: str) -> str | None:
        item = value.get(key)
        if item is not None and not isinstance(item, str):
            raise InvalidInput(f"{document.path}: schreibweise.{key} muss ein Text sein")
        return item or None

    free = value.get("frei", "")
    if not isinstance(free, str):
        raise InvalidInput(f"{document.path}: schreibweise.frei muss ein Text sein")
    return WritingStyle(
        tone=tuple(_text_list(section, "tonalitaet")),
        atmosphere=tuple(_text_list(section, "atmosphaere")),
        style=tuple(_text_list(section, "stil")),
        tempo=single("tempo"),
        explicitness=single("deutlichkeit"),
        free=free,
    )


def _text(document: Document, key: str) -> str:
    value = document.header.get(key)
    if not isinstance(value, str):
        raise InvalidInput(f"{document.path}: Feld {key!r} muss ein Text sein")
    return value


def _text_list(document: Document, key: str) -> list[str]:
    value = document.header.get(key, [])
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise InvalidInput(f"{document.path}: Feld {key!r} muss eine Liste von Texten sein")
    return [item for item in value if isinstance(item, str)]


def _pairs(document: Document, key: str, first: str, second: str) -> list[tuple[str, str]]:
    value = document.header.get(key, [])
    pairs: list[tuple[str, str]] = []
    if not isinstance(value, list):
        raise InvalidInput(f"{document.path}: Feld {key!r} muss eine Liste sein")
    for item in value:
        if (
            not isinstance(item, dict)
            or not isinstance(item.get(first), str)
            or not isinstance(item.get(second), str)
        ):
            raise InvalidInput(f"{document.path}: {key} braucht je Eintrag {first} und {second}")
        pairs.append((str(item[first]), str(item[second])))
    return pairs


def _story_from(document: Document, facts: tuple[StoryFact, ...]) -> Story:
    perspective = document.header.get("perspektive")
    if perspective is not None and not isinstance(perspective, str):
        raise InvalidInput(f"{document.path}: Feld 'perspektive' muss ein Text sein")
    model = document.header.get("modell")
    if model is not None and not isinstance(model, str):
        raise InvalidInput(f"{document.path}: Feld 'modell' muss ein Text sein")
    return Story(
        world=PurePosixPath(document.path).parts[1],
        id=PurePosixPath(document.path).parts[3],
        title=_text(document, "titel"),
        form=_checked_form(_text(document, "form")),
        perspective=perspective,
        controlled_characters=tuple(_text_list(document, "gefuehrte_figuren")),
        guest_links=tuple(
            GuestLink(w, e) for w, e in _pairs(document, "gast_verbindungen", "welt", "eintrag")
        ),
        facts=facts,
        summary=document.body,
        model=model,
        genres=tuple(_text_list(document, "genre")),
        writing_style=(
            _style_from(document, document.header[_STYLE_KEY])
            if document.header.get(_STYLE_KEY) is not None
            else WritingStyle()
        ),
    )


def _facts_from(document: Document) -> tuple[StoryFact, ...]:
    return tuple(StoryFact(e, f) for e, f in _pairs(document, "fakten", "eintrag", "fakt"))


def _chapter_from(document: Document) -> Chapter:
    parts = PurePosixPath(document.path).parts
    number = document.header.get("kapitel")
    if (
        not isinstance(number, int)
        or isinstance(number, bool)
        or number != _chapter_number(document.path)
    ):
        raise InvalidInput(f"{document.path}: Feld 'kapitel' passt nicht zum Dateinamen")
    status = _text(document, "status")
    if status not in CHAPTER_STATUSES:
        raise InvalidInput(f"{document.path}: unbekannter Kapitelstatus {status!r}")
    summary_status = _text(document, "kurzfassung_status")
    if summary_status not in SUMMARY_STATUSES:
        raise InvalidInput(f"{document.path}: unbekannter Status {summary_status!r}")
    return Chapter(
        world=parts[1],
        story=parts[3],
        number=number,
        title=_text(document, "titel"),
        status=status,
        summary=_text(document, "kurzfassung"),
        summary_status=summary_status,
        text=document.body,
        writing_style=(
            _style_from(document, document.header[_STYLE_KEY])
            if document.header.get(_STYLE_KEY) is not None
            else None
        ),
    )

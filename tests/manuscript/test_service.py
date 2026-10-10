"""Tests for ManuscriptService (roadmap step 2.5, FR-007)."""

from pathlib import Path

import pytest

from skriptorium.manuscript import (
    ATMOSPHERES,
    EXPLICITNESSES,
    FORMS,
    FREE_TEXT_MAX,
    GENRES,
    STYLES,
    TEMPOS,
    TONES,
    AlreadyExists,
    Form,
    GuestLink,
    InvalidInput,
    ManuscriptService,
    NotFound,
    StoryFact,
    WritingStyle,
)
from skriptorium.storage import DocumentStore

W = "salzmark"


@pytest.fixture
def root(tmp_path: Path) -> Path:
    return tmp_path / "data"


@pytest.fixture
def ms(root: Path) -> ManuscriptService:
    return ManuscriptService(DocumentStore(root))


# --- FR-007: every form can be created, novels have chapters ------------------------------


@pytest.mark.parametrize("form", FORMS)
def test_each_form_can_be_created(ms: ManuscriptService, form: Form) -> None:
    story = ms.create_story(W, f"Geschichte als {form}", form)
    assert ms.get_story(W, story.id) == story
    assert story.form == form
    expected = 0 if form == "roman" else 1
    assert len(ms.list_chapters(W, story.id)) == expected


def test_novel_is_divided_into_chapters(ms: ManuscriptService, root: Path) -> None:
    ms.create_story(W, "Das Salz der Toten", "roman")
    ms.save_chapter(W, "das-salz-der-toten", 1, title="Der Nordkai", text="Nebel.")
    ms.save_chapter(W, "das-salz-der-toten", 2, title="Die Grotte")
    chapters = ms.list_chapters(W, "das-salz-der-toten")
    assert [(c.number, c.title, c.text, c.status) for c in chapters] == [
        (1, "Der Nordkai", "Nebel.", "in-arbeit"),
        (2, "Die Grotte", "", "in-arbeit"),
    ]
    folder = root / "worlds/salzmark/stories/das-salz-der-toten/chapters"
    assert sorted(p.name for p in folder.iterdir()) == ["01-der-nordkai.md", "02-die-grotte.md"]


def test_chapter_numbers_must_be_consecutive(ms: ManuscriptService) -> None:
    ms.create_story(W, "Roman", "roman")
    with pytest.raises(NotFound):
        ms.save_chapter(W, "roman", 3, title="Zu weit")
    with pytest.raises(InvalidInput):
        ms.save_chapter(W, "roman", 1)


def test_short_story_and_fragment_have_exactly_one_chapter(ms: ManuscriptService) -> None:
    story = ms.create_story(W, "Salzeid", "kurzgeschichte")
    assert ms.get_chapter(W, story.id, 1).title == "Salzeid"
    with pytest.raises(InvalidInput, match="Roman"):
        ms.save_chapter(W, story.id, 2, title="Zweites")


def test_saving_text_and_renaming_a_chapter(ms: ManuscriptService, root: Path) -> None:
    ms.create_story(W, "Roman", "roman")
    ms.save_chapter(W, "roman", 1, title="Anfang", text="Erster Satz.")
    ms.save_chapter(W, "roman", 1, text="Erster Satz. Zweiter Satz.")
    renamed = ms.save_chapter(W, "roman", 1, title="Aufbruch")
    assert (renamed.title, renamed.text) == ("Aufbruch", "Erster Satz. Zweiter Satz.")
    folder = root / "worlds/salzmark/stories/roman/chapters"
    assert [p.name for p in folder.iterdir()] == ["01-aufbruch.md"]


def test_complete_chapter_and_summaries(ms: ManuscriptService) -> None:
    ms.create_story(W, "Roman", "roman")
    ms.save_chapter(W, "roman", 1, title="Anfang", text="Text.")
    assert ms.complete_chapter(W, "roman", 1).status == "abgeschlossen"
    chapter = ms.set_chapter_summary(W, "roman", 1, "Tomas findet den Ring.", "erzeugt")
    assert (chapter.summary, chapter.summary_status, chapter.status) == (
        "Tomas findet den Ring.",
        "erzeugt",
        "abgeschlossen",
    )
    with pytest.raises(InvalidInput):
        ms.set_chapter_summary(W, "roman", 1, "x", "gut")  # type: ignore[arg-type]  # unknown on purpose
    assert ms.set_story_summary(W, "roman", "Gesamt.").summary == "Gesamt."


# --- stories: settings of the character mode (fields for FR-012) -------------------------


def test_story_settings(ms: ManuscriptService, root: Path) -> None:
    story = ms.create_story(
        W, "Die Flucht", "fragment", perspective=" Ich ", controlled_characters=["ilka-varn"]
    )
    assert (story.perspective, story.controlled_characters) == ("Ich", ("ilka-varn",))
    changed = ms.update_story(W, story.id, perspective=None, controlled_characters=[])
    assert (changed.perspective, changed.controlled_characters) == (None, ())
    assert ms.update_story(W, story.id, title="Flucht bei Nacht").title == "Flucht bei Nacht"
    assert ms.update_story(W, story.id, form="roman").form == "roman"
    text = (root / "worlds/salzmark/stories/die-flucht/story.md").read_text(encoding="utf-8")
    assert text.startswith("---\ntitel: Flucht bei Nacht\nform: roman\nperspektive: null\n")


def test_story_model(ms: ManuscriptService, root: Path) -> None:
    """Model chosen for the story (step 3.9, ADR-023); stored as given, blank clears it."""
    story = ms.create_story(W, "Die Flucht", "fragment")
    assert story.model is None
    changed = ms.update_story(W, story.id, model=" x-ai/grok-4.6 ")
    assert changed.model == "x-ai/grok-4.6"
    assert ms.update_story(W, story.id, title="Flucht").model == "x-ai/grok-4.6"
    text = (root / "worlds/salzmark/stories/die-flucht/story.md").read_text(encoding="utf-8")
    assert "modell: x-ai/grok-4.6\n" in text
    assert ms.update_story(W, story.id, model=" ").model is None
    assert ms.update_story(W, story.id, model="x").model == "x"
    assert ms.update_story(W, story.id, model=None).model is None


def test_form_change_to_non_novel_needs_at_most_one_chapter(ms: ManuscriptService) -> None:
    ms.create_story(W, "Roman", "roman")
    ms.save_chapter(W, "roman", 1, title="Eins")
    ms.save_chapter(W, "roman", 2, title="Zwei")
    with pytest.raises(InvalidInput):
        ms.update_story(W, "roman", form="fragment")


def test_list_stories_sorted_and_separated_by_world(ms: ManuscriptService) -> None:
    ms.create_story(W, "Zweite", "fragment")
    ms.create_story(W, "Erste", "roman")
    ms.create_story("nebelreich", "Dritte", "roman")
    assert [s.title for s in ms.list_stories(W)] == ["Erste", "Zweite"]
    assert [s.title for s in ms.list_stories("nebelreich")] == ["Dritte"]
    assert ms.list_stories("leer") == []


@pytest.mark.parametrize(
    ("title", "form", "characters"),
    [("  ", "roman", []), ("Titel", "epos", []), ("Titel", "roman", ["Ilka Varn"])],
)
def test_invalid_story_input(
    ms: ManuscriptService, title: str, form: str, characters: list[str]
) -> None:
    with pytest.raises(InvalidInput):
        ms.create_story(W, title, form, controlled_characters=characters)  # type: ignore[arg-type]  # unknown form on purpose


def test_characters_must_be_a_list(ms: ManuscriptService) -> None:
    with pytest.raises(InvalidInput):
        ms.create_story(W, "Titel", "roman", controlled_characters="ilka-varn")


def test_duplicate_and_missing_stories(ms: ManuscriptService) -> None:
    ms.create_story(W, "Roman", "roman")
    with pytest.raises(AlreadyExists):
        ms.create_story(W, "roman", "fragment")
    with pytest.raises(NotFound):
        ms.get_story(W, "fehlt")
    with pytest.raises(NotFound):
        ms.list_chapters(W, "fehlt")
    with pytest.raises(NotFound):
        ms.get_chapter(W, "roman", 1)
    with pytest.raises(InvalidInput):
        ms.get_story("../x", "roman")


# --- guest links (fields for FR-017) and story facts (fields for FR-024) -----------------


def test_guest_links(ms: ManuscriptService) -> None:
    ms.create_story(W, "Begegnung", "kurzgeschichte")
    story = ms.add_guest_link(W, "begegnung", "nebelreich", "kael")
    assert story.guest_links == (GuestLink("nebelreich", "kael"),)
    with pytest.raises(AlreadyExists):
        ms.add_guest_link(W, "begegnung", "nebelreich", "kael")
    with pytest.raises(InvalidInput):
        ms.add_guest_link(W, "begegnung", W, "kael")
    assert ms.remove_guest_link(W, "begegnung", "nebelreich", "kael").guest_links == ()
    with pytest.raises(NotFound):
        ms.remove_guest_link(W, "begegnung", "nebelreich", "kael")
    ms.create_story(W, "Andere", "fragment")
    assert ms.get_story(W, "andere").guest_links == ()


def test_story_facts(ms: ManuscriptService) -> None:
    ms.create_story(W, "Begegnung", "kurzgeschichte")
    story = ms.add_fact(W, "begegnung", "kael", " Kael hat hier eine Narbe. ")
    assert story.facts == (StoryFact("kael", "Kael hat hier eine Narbe."),)
    with pytest.raises(AlreadyExists):
        ms.add_fact(W, "begegnung", "kael", "Kael hat hier eine Narbe.")
    with pytest.raises(InvalidInput):
        ms.add_fact(W, "begegnung", "kael", "  ")
    assert ms.remove_fact(W, "begegnung", "kael", "Kael hat hier eine Narbe.").facts == ()
    with pytest.raises(NotFound):
        ms.remove_fact(W, "begegnung", "kael", "unbekannt")


def test_story_update_keeps_guest_links_and_unknown_fields(
    ms: ManuscriptService, root: Path
) -> None:
    ms.create_story(W, "Begegnung", "kurzgeschichte")
    ms.add_guest_link(W, "begegnung", "nebelreich", "kael")
    path = root / "worlds/salzmark/stories/begegnung/story.md"
    path.write_text(path.read_text(encoding="utf-8").replace("---\n", "---\nnotiz: frei\n", 1))
    ms.update_story(W, "begegnung", perspective="Ich")
    assert ms.get_story(W, "begegnung").guest_links == (GuestLink("nebelreich", "kael"),)
    assert "notiz: frei" in path.read_text(encoding="utf-8")


# --- files edited by hand -----------------------------------------------------------------


@pytest.mark.parametrize(
    "header",
    [
        "titel: T\nform: epos",
        "form: roman",
        "titel: T\nform: roman\nperspektive: 3",
        "titel: T\nform: roman\nmodell: 4",
        "titel: T\nform: roman\ngefuehrte_figuren: ilka",
        "titel: T\nform: roman\ngast_verbindungen: [{welt: x}]",
        "titel: T\nform: roman\ngast_verbindungen: keine",
    ],
)
def test_inconsistent_story_files_are_reported(
    ms: ManuscriptService, root: Path, header: str
) -> None:
    folder = root / "worlds/salzmark/stories/t"
    folder.mkdir(parents=True)
    (folder / "story.md").write_text(f"---\n{header}\n---\n", encoding="utf-8")
    with pytest.raises(InvalidInput):
        ms.get_story(W, "t")


@pytest.mark.parametrize(
    "header",
    [
        "kapitel: 2\ntitel: A\nstatus: in-arbeit\nkurzfassung: ''\nkurzfassung_status: fehlt",
        "kapitel: 1\ntitel: A\nstatus: fertig\nkurzfassung: ''\nkurzfassung_status: fehlt",
        "kapitel: 1\ntitel: A\nstatus: in-arbeit\nkurzfassung: ''\nkurzfassung_status: gut",
        "kapitel: true\ntitel: A\nstatus: in-arbeit\nkurzfassung: ''\nkurzfassung_status: fehlt",
    ],
)
def test_inconsistent_chapter_files_are_reported(
    ms: ManuscriptService, root: Path, header: str
) -> None:
    ms.create_story(W, "Roman", "roman")
    folder = root / "worlds/salzmark/stories/roman/chapters"
    folder.mkdir(parents=True)
    (folder / "01-a.md").write_text(f"---\n{header}\n---\n", encoding="utf-8")
    (folder / "notizen.md").write_text("keine Kapiteldatei", encoding="utf-8")
    with pytest.raises(InvalidInput):
        ms.list_chapters(W, "roman")


def test_other_files_below_chapters_are_ignored(ms: ManuscriptService, root: Path) -> None:
    ms.create_story(W, "Roman", "roman")
    ms.save_chapter(W, "roman", 1, title="Eins")
    ms.save_chapter(W, "roman", 2, title="Zwei", text="Zweiter Text.")
    extra = root / "worlds/salzmark/stories/roman/chapters/entwuerfe"
    extra.mkdir()
    (extra / "03-alt.md").write_text("alter Entwurf", encoding="utf-8")
    assert [c.number for c in ms.list_chapters(W, "roman")] == [1, 2]
    assert ms.get_chapter(W, "roman", 2).text == "Zweiter Text."


# --- step 5.6 (ADR-053): atmospheric writing style ----------------------------------------

STYLE = WritingStyle(
    tone=("düster", "kalt"),
    atmosphere=("angespannt",),
    style=("knapp",),
    tempo="atemlos",
    explicitness="angedeutet",
    free="Kurze Absätze.",
)


def test_old_files_without_style_fields_read_as_empty(ms: ManuscriptService, root: Path) -> None:
    folder = root / "worlds/salzmark/stories/alt"
    (folder / "chapters").mkdir(parents=True)
    (folder / "story.md").write_text("---\ntitel: Alt\nform: roman\n---\n", encoding="utf-8")
    (folder / "chapters/01-eins.md").write_text(
        "---\nkapitel: 1\ntitel: Eins\nstatus: in-arbeit\nkurzfassung: ''\n"
        "kurzfassung_status: fehlt\n---\nText\n",
        encoding="utf-8",
    )
    story = ms.get_story(W, "alt")
    assert story.genres == ()
    assert story.writing_style == WritingStyle()
    assert ms.get_chapter(W, "alt", 1).writing_style is None


def test_story_style_is_saved_and_read(ms: ManuscriptService, root: Path) -> None:
    ms.create_story(W, "Nacht", "roman")
    story = ms.update_story(
        W, "nacht", genres=["Thriller", "Horror", "Thriller"], writing_style=STYLE
    )
    assert story.genres == ("Thriller", "Horror")
    assert story.writing_style == STYLE
    assert ms.get_story(W, "nacht") == story
    header = (root / "worlds/salzmark/stories/nacht/story.md").read_text(encoding="utf-8")
    assert "tonalitaet:" in header
    assert "- düster" in header
    assert "deutlichkeit: angedeutet" in header
    # Other fields stay when only the title changes.
    assert ms.update_story(W, "nacht", title="Nacht II").writing_style == STYLE


def test_new_chapter_copies_the_default_of_the_story(ms: ManuscriptService) -> None:
    ms.create_story(W, "Nacht", "roman")
    ms.save_chapter(W, "nacht", 1, title="Vor der Vorgabe")
    ms.update_story(W, "nacht", writing_style=STYLE)
    second = ms.save_chapter(W, "nacht", 2, title="Nach der Vorgabe")
    assert second.writing_style == STYLE
    assert ms.get_chapter(W, "nacht", 1).writing_style is None
    # A later change of the default does not reach existing chapters (ADR-053).
    ms.update_story(W, "nacht", writing_style=WritingStyle(tempo="langsam"))
    assert ms.get_chapter(W, "nacht", 2).writing_style == STYLE


def test_empty_default_gives_new_chapter_no_style(ms: ManuscriptService, root: Path) -> None:
    ms.create_story(W, "Nacht", "roman")
    chapter = ms.save_chapter(W, "nacht", 1, title="Eins")
    assert chapter.writing_style is None
    text = (root / "worlds/salzmark/stories/nacht/chapters/01-eins.md").read_text("utf-8")
    assert "schreibweise" not in text


def test_chapter_style_can_be_set_kept_and_reset(ms: ManuscriptService) -> None:
    ms.create_story(W, "Nacht", "roman")
    ms.save_chapter(W, "nacht", 1, title="Eins", text="a")
    own = WritingStyle(tone=("zärtlich",), free="  weich  ")
    saved = ms.save_chapter(W, "nacht", 1, writing_style=own)
    assert saved.writing_style == WritingStyle(tone=("zärtlich",), free="weich")
    # Saving the text keeps the style; completing and a summary too.
    ms.save_chapter(W, "nacht", 1, text="b", title="Neu")
    ms.complete_chapter(W, "nacht", 1)
    ms.set_chapter_summary(W, "nacht", 1, "Kurz", "erzeugt")
    assert ms.get_chapter(W, "nacht", 1).writing_style == saved.writing_style
    # An empty style of its own differs from "none": it overrides the default.
    empty = ms.save_chapter(W, "nacht", 1, writing_style=WritingStyle())
    assert empty.writing_style == WritingStyle()
    reset = ms.save_chapter(W, "nacht", 1, writing_style=None)
    assert reset.writing_style is None


def test_new_chapter_can_be_given_a_style_at_once(ms: ManuscriptService) -> None:
    ms.create_story(W, "Nacht", "roman")
    ms.update_story(W, "nacht", writing_style=STYLE)
    other = WritingStyle(tempo="langsam")
    chapter = ms.save_chapter(W, "nacht", 1, title="Eins", writing_style=other)
    assert chapter.writing_style == other
    assert ms.save_chapter(W, "nacht", 2, title="Zwei", writing_style=None).writing_style is None


@pytest.mark.parametrize(
    "bad",
    [
        WritingStyle(tone=("fröhlich",)),
        WritingStyle(atmosphere=("hell",)),
        WritingStyle(style=("lang",)),
        WritingStyle(tempo="rasend"),
        WritingStyle(explicitness="roh"),
        WritingStyle(tone="düster"),  # type: ignore[arg-type]  # a text is not a list
        WritingStyle(free="x" * (FREE_TEXT_MAX + 1)),
    ],
)
def test_values_outside_the_lists_are_refused(ms: ManuscriptService, bad: WritingStyle) -> None:
    ms.create_story(W, "Nacht", "roman")
    ms.save_chapter(W, "nacht", 1, title="Eins")
    with pytest.raises(InvalidInput):
        ms.update_story(W, "nacht", writing_style=bad)
    with pytest.raises(InvalidInput):
        ms.save_chapter(W, "nacht", 1, writing_style=bad)
    assert ms.get_story(W, "nacht").writing_style == WritingStyle()


def test_unknown_genre_is_refused(ms: ManuscriptService) -> None:
    ms.create_story(W, "Nacht", "roman")
    with pytest.raises(InvalidInput, match="Genre"):
        ms.update_story(W, "nacht", genres=["Western"])
    with pytest.raises(InvalidInput):
        ms.update_story(W, "nacht", genres="Thriller")


def test_single_values_may_be_cleared_and_free_text_has_a_limit(ms: ManuscriptService) -> None:
    ms.create_story(W, "Nacht", "roman")
    ms.update_story(W, "nacht", writing_style=STYLE)
    cleared = ms.update_story(
        W, "nacht", writing_style=WritingStyle(tempo=" ", explicitness=None, free="x" * 1000)
    )
    assert cleared.writing_style.tempo is None
    assert cleared.writing_style.explicitness is None
    assert len(cleared.writing_style.free) == FREE_TEXT_MAX


def test_the_lists_are_complete() -> None:
    assert GENRES[0] == "Dark Romance" and len(GENRES) == 9
    assert len(TONES) == 11 and len(ATMOSPHERES) == 10 and len(STYLES) == 6
    assert TEMPOS == ("langsam", "gemessen", "zügig", "atemlos")
    assert EXPLICITNESSES == ("angedeutet", "sinnlich", "explizit")


@pytest.mark.parametrize(
    "block",
    [
        "schreibweise: text",
        "schreibweise:\n  tonalitaet: düster",
        "schreibweise:\n  tempo: [langsam]",
        "schreibweise:\n  frei: [a]",
    ],
)
def test_malformed_style_in_a_file_is_reported(
    ms: ManuscriptService, root: Path, block: str
) -> None:
    folder = root / "worlds/salzmark/stories/kaputt"
    folder.mkdir(parents=True)
    (folder / "story.md").write_text(
        f"---\ntitel: Kaputt\nform: roman\n{block}\n---\n", encoding="utf-8"
    )
    with pytest.raises(InvalidInput):
        ms.get_story(W, "kaputt")


def test_style_missing_keys_count_as_empty(ms: ManuscriptService, root: Path) -> None:
    folder = root / "worlds/salzmark/stories/halb"
    folder.mkdir(parents=True)
    (folder / "story.md").write_text(
        "---\ntitel: Halb\nform: roman\nschreibweise:\n  stil: [knapp]\n---\n", encoding="utf-8"
    )
    assert ms.get_story(W, "halb").writing_style == WritingStyle(style=("knapp",))

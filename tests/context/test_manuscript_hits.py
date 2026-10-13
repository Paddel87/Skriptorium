"""Passages of the manuscript about a name (roadmap step 8.9, ADR-087)."""

from itertools import pairwise
from pathlib import Path

import pytest

from skriptorium.canon import CanonService, InvalidInput, NotFound
from skriptorium.context import (
    MAX_HITS_TOKENS,
    ContextBuilder,
    ContextTooLarge,
    HitsQuery,
    estimate_tokens,
)
from skriptorium.context.manuscript_hits import MAX_PARAGRAPH_CHARS
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

WORLD = "die-salzmark"


class Setup:
    def __init__(self, tmp_path: Path) -> None:
        store = DocumentStore(tmp_path / "data")
        self.canon = CanonService(store)
        self.manuscript = ManuscriptService(store)
        self.canon.create_world("Die Salzmark", "Sieben Inseln.")
        self.canon.create_world("Nebelreich", "Nebel.")
        self.builder = ContextBuilder(self.canon, self.manuscript)

    def story(self, title: str, *chapters: str, world: str = WORLD, summary: str = "") -> str:
        story = self.manuscript.create_story(world, title, "roman")
        for number, text in enumerate(chapters, start=1):
            self.manuscript.save_chapter(
                world, story.id, number, title=f"Kapitel {number}", text=text
            )
            if summary:
                self.manuscript.set_chapter_summary(world, story.id, number, summary, "erzeugt")
        return story.id


@pytest.fixture
def setup(tmp_path: Path) -> Setup:
    return Setup(tmp_path)


def test_whole_word_in_any_case_and_with_umlauts(setup: Setup) -> None:
    setup.story(
        "Am Ufer",
        "Kael band das Boot.\n\nDer KAEL schwieg.\n\nKaels Hut lag da.\n\nKaelchen lief."
        "\n\nNiemand sprach.",
        "Die Bäuerin Grün kam.\n\nGrünschnabel!\n\nDie grün-braune Wiese.",
    )
    kael = setup.builder.find_manuscript_hits(WORLD, HitsQuery("kael"))
    # The genitive counts ("Kaels"), a longer word does not ("Kaelchen").
    assert [p.text for p in kael.passages] == [
        "Kael band das Boot.",
        "Der KAEL schwieg.",
        "Kaels Hut lag da.",
    ]
    assert (kael.total, kael.included, kael.stories, kael.chapters) == (3, 3, 1, 1)

    umlaut = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Grün"))
    assert [p.text for p in umlaut.passages] == ["Die Bäuerin Grün kam.", "Die grün-braune Wiese."]
    assert (umlaut.stories, umlaut.chapters) == (1, 1)


def test_aliases_of_a_canon_entry_are_searched_too(setup: Setup) -> None:
    setup.canon.create_entry(WORLD, "figur", "Gunda Hollt", aliases=("Gunda", "Wirtin"))
    setup.canon.create_entry("nebelreich", "figur", "Gunda", aliases=("Fremde",))
    setup.story(
        "Kai",
        "Gunda Hollt zapfte Bier.\n\nDie Wirtin lachte.\n\nEine Fremde trat ein.\n\nGundas Bier.",
    )

    by_alias = setup.builder.find_manuscript_hits(WORLD, HitsQuery("gunda"))
    assert [p.text for p in by_alias.passages] == [
        "Gunda Hollt zapfte Bier.",
        "Die Wirtin lachte.",
        "Gundas Bier.",
    ]
    by_name = setup.builder.find_manuscript_hits(WORLD, HitsQuery(" Gunda Hollt "))
    assert by_name.total == 3
    no_entry = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Wirtin Lachs"))
    assert no_entry.total == 0


def test_one_story_all_stories_and_never_other_worlds(setup: Setup) -> None:
    first = setup.story("Anfang", "Kael sprach.", "Kael schwieg.")
    setup.story("Ende", "Kael ging.")
    setup.story("Fremd", "Kael im Nebel.", world="nebelreich")

    everything = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael"))
    assert [(p.story, p.number) for p in everything.passages] == [
        ("Anfang", 1),
        ("Anfang", 2),
        ("Ende", 1),
    ]
    assert (everything.stories, everything.chapters) == (2, 3)
    one = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael", first))
    assert (one.total, one.stories, one.chapters) == (2, 1, 2)


def test_errors(setup: Setup) -> None:
    setup.story("Anfang", "Kael sprach.")
    with pytest.raises(InvalidInput):
        setup.builder.find_manuscript_hits(WORLD, HitsQuery("  "))
    with pytest.raises(NotFound):
        setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael", "gibt-es-nicht"))
    with pytest.raises(NotFound):
        setup.builder.find_manuscript_hits("keine-welt", HitsQuery("Kael"))


def test_long_paragraph_is_cut_around_the_first_match(setup: Setup) -> None:
    middle = "a" * 3000 + " Kael " + "b" * 3000
    start = "Kael " + "c" * 3000
    end = "d" * 3000 + " Kael"
    setup.story("Lang", f"{middle}\n\n{start}\n\n{end}")

    texts = [p.text for p in setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael")).passages]

    assert all(len(t) <= MAX_PARAGRAPH_CHARS + 2 for t in texts)
    assert texts[0].startswith("…") and texts[0].endswith("…") and " Kael " in texts[0]
    assert texts[1].startswith("Kael ") and texts[1].endswith("…")
    assert texts[2].startswith("…") and texts[2].endswith(" Kael")
    assert len(texts[2]) == MAX_PARAGRAPH_CHARS + 1


def test_summaries_come_with_the_chapter_once(setup: Setup) -> None:
    setup.story(
        "Mit", "Kael ritt.\n\nKael schlief.\n\nNichts.", "Nur Mira.", summary="Kurz gesagt."
    )
    hits = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael"))

    assert hits.text == (
        "# Fundstellen im Manuskript zu „Kael“\n\n"
        "Aus dem Manuskript des Autors; was hier steht, ist in der Geschichte geschehen. "
        "Nichts dazuerfinden.\n\n"
        "## Mit, Kapitel 1: Kapitel 1\n\nKurzfassung: Kurz gesagt.\n\n"
        "Kael ritt.\n\nKael schlief."
    )
    assert hits.tokens == estimate_tokens(hits.text + "\n\n")


def test_chapter_without_summary_and_no_hits(setup: Setup) -> None:
    story = setup.manuscript.create_story(WORLD, "Roh", "roman")
    setup.manuscript.save_chapter(WORLD, story.id, 1, title="Eins", text="Kael kam.")
    hits = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael"))

    assert hits.text.endswith("## Roh, Kapitel 1: Eins\n\nKael kam.")
    empty = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Niemand"))
    assert (empty.text, empty.tokens, empty.included) == ("", 0, 0)


def _many(setup: Setup, count: int) -> None:
    paragraphs = [f"Absatz {i:04d}: Kael " + "x" * 400 for i in range(count)]
    setup.story("Viele", "\n\n".join(paragraphs))


def test_everything_that_fits_is_taken(setup: Setup) -> None:
    _many(setup, 20)
    hits = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael"))

    assert (hits.total, hits.included) == (20, 20)
    assert hits.tokens <= MAX_HITS_TOKENS


def test_too_many_take_first_last_and_spread_in_text_order(setup: Setup) -> None:
    _many(setup, 400)
    hits = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael"))

    numbers = [int(p.text.split()[1].rstrip(":")) for p in hits.passages]
    assert hits.total == 400 and hits.included == len(numbers) < 400
    assert numbers == sorted(numbers)
    assert numbers[:3] == [0, 1, 2] and numbers[-3:] == [397, 398, 399]
    assert 0 < hits.tokens <= MAX_HITS_TOKENS
    # The middle is spread, not a block at one end.
    middle = [n for n in numbers if 3 <= n < 397]
    assert max(middle) - min(middle) > 300
    gaps = [b - a for a, b in pairwise(middle)]
    assert max(gaps) <= 2 * min(gaps) + 8


def test_summaries_count_against_the_limit(setup: Setup) -> None:
    chapters = [f"Kael lief in Kapitel {i}. " + "y" * 300 for i in range(1, 61)]
    setup.story("Kapitel", *chapters, summary="Zusammenfassung " * 60)
    hits = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael"))

    assert hits.total == 60 and hits.included < 60
    assert hits.tokens <= MAX_HITS_TOKENS
    assert hits.text.count("Kurzfassung:") == hits.included
    assert [p.number for p in hits.passages][:3] == [1, 2, 3]
    assert [p.number for p in hits.passages][-3:] == [58, 59, 60]


def test_few_passages_over_the_limit_keep_what_fits(setup: Setup) -> None:
    setup.story(
        "Dick", *[("Kael " + "z" * 1200 + "\n\n") * 1 + "Kael " + "w" * 1200 for _ in range(1)]
    )
    hits = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael"))
    assert hits.included == hits.total == 2
    # A single chapter summary larger than the limit leaves nothing that fits.
    setup.story("Riesig", "Kael kam.", summary="Wort " * 20_000)
    only = setup.builder.find_manuscript_hits(WORLD, HitsQuery("Kael", "riesig"))
    assert (only.total, only.included) == (1, 0)


def test_hits_are_part_of_the_worldbuilder_request(setup: Setup) -> None:
    setup.canon.create_entry(WORLD, "regel", "Salzbindung", body="Salz bindet Tote.")
    setup.canon.create_entry(WORLD, "figur", "Kael", body="Fährmann.")
    setup.story("Am Ufer", "Kael band das Boot.", summary="Kael am Ufer.")

    context = setup.builder.build_worldbuilder(
        WORLD, [("user", "Schreib @Kael aus.")], ["kael"], findings=HitsQuery("Kael")
    )

    system = context.messages[0].content
    assert system.index("Salz bindet Tote.") < system.index("# Fundstellen im Manuskript zu „Kael“")
    assert system.index("# Fundstellen im Manuskript zu „Kael“") < system.index("## Kael (Figur)")
    assert (
        "## Am Ufer, Kapitel 1: Kapitel 1\n\nKurzfassung: Kael am Ufer.\n\nKael band das Boot."
        in system
    )
    assert [block.kind for block in context.blocks] == [
        "rahmen",
        "welt",
        "eintraege",
        "regel",
        "fundstellen",
        "verweis",
        "gespraech",
    ]


def test_no_hits_add_no_part(setup: Setup) -> None:
    setup.story("Am Ufer", "Mira kam.")

    context = setup.builder.build_worldbuilder(
        WORLD, [("user", "Hallo")], findings=HitsQuery("Kael")
    )

    assert "fundstellen" not in [block.kind for block in context.blocks]
    plain = setup.builder.build_worldbuilder(WORLD, [("user", "Hallo")])
    assert context.messages == plain.messages


def test_hits_that_do_not_fit_the_budget_are_refused(setup: Setup) -> None:
    _many(setup, 400)

    with pytest.raises(ContextTooLarge) as error:
        setup.builder.build_worldbuilder(
            WORLD, [("user", "Hallo")], budget=3000, findings=HitsQuery("Kael")
        )
    assert "Fundstellen zu Kael" in str(error.value)

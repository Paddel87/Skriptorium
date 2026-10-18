"""Tests for splitting Markdown world material (rules confirmed in step 2.4)."""

import time

import pytest

from skriptorium.canon.categories import category_for
from skriptorium.canon.importers import ParsedEntry, parse_markdown

MATERIAL = """Die Salzmark ist eine Inselwelt nach der Großen Flut.

# Figuren

## Anselm Drach
Aliasse: der Vogt, Vogt Drach; Drach
- 56 Jahre, Vogt von Kerrow.

### Aussehen
Hager, kahlköpfig.

## Fenn Asch
- **Auch genannt:** der Schreiber
Schreiber des Vogts.

# Orte

Alle Orte liegen auf den sieben Inseln.

## Kerrow
Hafenstadt im Norden.

# Sonstiges

## Das Salzlicht
Kategorie: Regel
Leuchtet über den Gräbern.

## Der Salzeid
Schwur der Salzgärtner.
"""


def test_entries_names_categories_and_aliases() -> None:
    material = parse_markdown(MATERIAL)
    assert [(e.name, e.category, e.aliases) for e in material.entries] == [
        ("Anselm Drach", "figur", ("der Vogt", "Vogt Drach", "Drach")),
        ("Fenn Asch", "figur", ("der Schreiber",)),
        ("Kerrow", "ort", ()),
        ("Das Salzlicht", "regel", ()),
        ("Der Salzeid", None, ()),
    ]


def test_subheadings_stay_in_the_body_and_field_lines_are_removed() -> None:
    drach = parse_markdown(MATERIAL).entries[0]
    assert drach.body == "- 56 Jahre, Vogt von Kerrow.\n\n### Aussehen\nHager, kahlköpfig.\n"
    assert parse_markdown(MATERIAL).entries[3].body == "Leuchtet über den Gräbern.\n"


def test_introduction_and_group_text() -> None:
    material = parse_markdown(MATERIAL)
    assert material.introduction == "Die Salzmark ist eine Inselwelt nach der Großen Flut.\n"
    assert material.not_taken_over == ("Orte: Alle Orte liegen auf den sieben Inseln.\n",)


def test_top_level_headings_are_entries_without_groups() -> None:
    material = parse_markdown("# Kael\nSchmied.\n# Ilka\n")
    assert material.entries == (
        ParsedEntry("Kael", None, (), "Schmied.\n"),
        ParsedEntry("Ilka", None, (), ""),
    )
    assert material.introduction == ""


def test_headings_in_code_blocks_are_ignored() -> None:
    material = parse_markdown("# Regeln\n## Salzbindung\n```\n# kein Eintrag\n```\n")
    assert [e.name for e in material.entries] == ["Salzbindung"]
    assert material.entries[0].body == "```\n# kein Eintrag\n```\n"


def test_closing_hashes_and_windows_line_endings() -> None:
    material = parse_markdown("## Gegenstände ##\r\n### Siegelring ###\r\nSchwarz.\r\n")
    assert material.entries == (ParsedEntry("Siegelring", "gegenstand", (), "Schwarz.\n"),)


def test_category_line_with_unknown_word_keeps_group_category() -> None:
    material = parse_markdown("# Orte\n## Tolm\nKategorie: Stadt\nSitz des Salzrats.\n")
    assert material.entries[0].category == "ort"


def test_empty_material() -> None:
    material = parse_markdown("")
    assert (material.introduction, material.entries, material.not_taken_over) == ("", (), ())


@pytest.mark.parametrize(
    ("word", "expected"),
    [
        ("Figuren", "figur"),
        ("**Orte:**", "ort"),
        ("Geographie", "ort"),
        ("Artefakte", "gegenstand"),
        ("Chronik", "zeitlinie"),
        ("Magie", "regel"),
        ("Völker", "kultur"),
        ("Sonstiges", None),
    ],
)
def test_category_words(word: str, expected: str | None) -> None:
    assert category_for(word) == expected


# --- items without own text (step 4.16) ----------------------------------------------------

ITEMS = """# Gegenstände

## Runenklinge

### Zweck

Bannt Geister.

### Verwendung

Wird gezogen.

### **Auswirkung:**

Macht müde.

## Glasauge
### Zweck
Sieht Vergangenes.
"""


def test_item_with_only_item_sections_is_one_entry() -> None:
    entries = parse_markdown(ITEMS).entries
    assert [(e.name, e.category) for e in entries] == [
        ("Runenklinge", "gegenstand"),
        ("Glasauge", "gegenstand"),
    ]
    assert entries[0].body == (
        "### Zweck\n\nBannt Geister.\n\n### Verwendung\n\nWird gezogen.\n\n"
        "### **Auswirkung:**\n\nMacht müde.\n"
    )


def test_heading_without_text_and_other_subheadings_stays_a_group() -> None:
    material = "# Figuren\n\n## Hauptfiguren\n\n### Kael\nFährmann.\n\n### Aussehen\nHager.\n"
    entries = parse_markdown(material).entries
    # "Hauptfiguren" stays a group; since step 7.9 "Aussehen" is a section of the entry before
    # (the example said "Zweck" before step 9.3: that is a section of items only, ADR-092).
    assert [e.name for e in entries] == ["Kael"]
    assert entries[0].body == "Fährmann.\n\n#### Aussehen\nHager.\n"


def test_item_sections_beside_an_entry_belong_to_it() -> None:
    """The world builder's model wrote the sections on the entry's level (step 7.9)."""
    material = (
        "# Gegenstände\n\n## Fessel\nAliasse: Acht\n\n## Zweck\nHält.\n\n## Verwendung\n"
        "Anlegen.\n### Vorsicht\nNicht zu eng.\n\n## Auswirkung\nStarr.\n\n## Kerbe\nMesser.\n"
    )
    entries = parse_markdown(material).entries
    assert [(e.name, e.category, e.aliases) for e in entries] == [
        ("Fessel", "gegenstand", ("Acht",)),
        ("Kerbe", "gegenstand", ()),
    ]
    assert entries[0].body == (
        "### Zweck\nHält.\n\n### Verwendung\nAnlegen.\n#### Vorsicht\nNicht zu eng.\n\n"
        "### Auswirkung\nStarr.\n"
    )
    # Deeper sections as asked for, and sections without an entry before them, stay as they were.
    deep = parse_markdown("## Glocke\n### Zweck\nLäutet.\n").entries
    assert [(e.name, e.body) for e in deep] == [("Glocke", "### Zweck\nLäutet.\n")]
    alone = parse_markdown("# Gegenstände\n\n## Zweck\nA.\n\n## Verwendung\nB.\n").entries
    assert [e.name for e in alone] == ["Zweck", "Verwendung"]


def test_category_heading_with_item_sections_stays_a_group() -> None:
    entries = parse_markdown("# Gegenstände\n\n### Zweck\nText.\n").entries
    assert [(e.name, e.category) for e in entries] == [("Zweck", "gegenstand")]


def test_long_runs_of_spaces_in_a_heading_stay_fast() -> None:
    """The closing-hash pattern backtracked cubically (review of step 6.8)."""
    started = time.perf_counter()
    material = parse_markdown("### a" + "\t" * 50_000 + "x\n## " + " \t" * 50_000 + "#")
    assert time.perf_counter() - started < 1
    assert [entry.name for entry in material.entries] == ["a" + "\t" * 50_000 + "x", "#"]
    # A single space after the hashes, nothing behind it: no heading, as before.
    assert parse_markdown("## ").introduction == "## \n"


def test_a_section_aussehen_beside_a_figure_belongs_to_it() -> None:
    """Step 7.16 (ADR-078): rule 5 also for the figure section Aussehen."""
    beside = parse_markdown("# Figuren\n\n## Kael\nFährt.\n\n## Aussehen\nHager.\n")
    assert [(e.name, e.body) for e in beside.entries] == [
        ("Kael", "Fährt.\n\n### Aussehen\nHager.\n")
    ]
    only = parse_markdown("# Figuren\n\n## Kael\n### Aussehen\nHager.\n")
    assert [e.name for e in only.entries] == ["Kael"]


def test_a_figure_in_the_form_of_its_template_stays_one_entry() -> None:
    """Step 9.1 (ADR-091): "Wesen und Geschichte" is a fixed section like "Aussehen"; before, a
    figure with only these two sections fell apart into entries named after them."""
    material = parse_markdown(
        "# Figuren\n## Kael\n### Aussehen\nGroß.\n### Wesen und Geschichte\nTreu.\n"
    )
    assert material.entries == (
        ParsedEntry("Kael", "figur", (), "### Aussehen\nGroß.\n### Wesen und Geschichte\nTreu.\n"),
    )


def test_wesen_und_geschichte_beside_a_figure_belongs_to_it() -> None:
    """Step 9.1: on the level of the name, as the import already does with "Aussehen"."""
    material = parse_markdown("# Figuren\n## Kael\nWirt.\n## Wesen und Geschichte\nTreu.\n")
    assert [entry.name for entry in material.entries] == ["Kael"]
    assert material.entries[0].body == "Wirt.\n### Wesen und Geschichte\nTreu.\n"


FIGURE_SECTIONS = (
    "### Aussehen\nGroß.\n### Wesen\nTreu.\n### Fähigkeiten\nSteuert Kähne.\n"
    "### Geschichte\nKam mit der Flut.\n### Beziehungen\nBruder von Mira.\n"
)


def test_a_figure_with_all_its_sections_and_no_text_of_its_own_is_one_entry() -> None:
    """Step 9.3 (ADR-092): the five sections of a figure are sections, not entries."""
    material = parse_markdown(f"# Figuren\n## Kael\n{FIGURE_SECTIONS}")
    assert material.entries == (ParsedEntry("Kael", "figur", (), FIGURE_SECTIONS),)


def test_a_place_and_a_culture_with_their_sections_are_one_entry_each() -> None:
    place = (
        "### Lage\nIm Norden.\n### Aussehen\nWeit.\n### Bewohner\nKeine.\n### Geschichte\nAlt.\n"
    )
    culture = "### Gesellschaft\nZünfte.\n### Glaube und Bräuche\nSalz.\n### Geschichte\nAlt.\n"
    material = parse_markdown(f"# Orte\n## Salzsee\n{place}\n# Kultur\n## Salzeid\n{culture}")
    assert material.entries == (
        ParsedEntry("Salzsee", "ort", (), place),
        ParsedEntry("Salzeid", "kultur", (), culture),
    )


def test_a_section_of_another_category_is_an_entry_of_its_own() -> None:
    """Step 9.3 (ADR-092): "Lage" under a figure was no section before and is none now."""
    material = parse_markdown("# Figuren\n## Kael\nFährmann.\n## Lage\nEin Ort.\n")
    assert [(e.name, e.category, e.body) for e in material.entries] == [
        ("Kael", "figur", "Fährmann.\n"),
        ("Lage", "figur", "Ein Ort.\n"),
    ]
    # The same name is a section where it belongs: "Geschichte" of a figure, "Zweck" of an item.
    material = parse_markdown("# Figuren\n## Kael\nFährmann.\n## Geschichte\nKam mit der Flut.\n")
    assert [(e.name, e.body) for e in material.entries] == [
        ("Kael", "Fährmann.\n### Geschichte\nKam mit der Flut.\n")
    ]
    material = parse_markdown("# Gegenstände\n## Klinge\nScharf.\n## Geschichte\nGeschmiedet.\n")
    assert [(e.name, e.category) for e in material.entries] == [
        ("Klinge", "gegenstand"),
        ("Geschichte", "gegenstand"),
    ]


def test_a_section_of_a_foreign_category_does_not_hold_an_entry_together() -> None:
    """With only "Zweck" below it, a figure is a group of one entry, as with any other heading."""
    material = parse_markdown("# Figuren\n## Kael\n### Zweck\nKein Gegenstand.\n")
    assert [(e.name, e.category) for e in material.entries] == [("Zweck", "figur")]


def test_a_figure_without_text_keeps_a_section_of_its_own() -> None:
    """One fixed section of its category is enough; "Herkunft" stays a part of it (ADR-092)."""
    material = parse_markdown(
        "# Figuren\n## Kael\n### Aussehen\nHager.\n### Herkunft\nVom Salzsee.\n"
    )
    assert [(e.name, e.category) for e in material.entries] == [("Kael", "figur")]
    assert material.entries[0].body == "### Aussehen\nHager.\n### Herkunft\nVom Salzsee.\n"


def test_without_a_known_category_a_mixed_heading_stays_a_group() -> None:
    """Unknown category: only subheadings that are all fixed sections make an entry."""
    material = parse_markdown("## Sonstiges\n### Geschichte\nAlt.\n### Der Brand\nGroß.\n")
    assert [e.name for e in material.entries] == ["Geschichte", "Der Brand"]


def test_the_category_line_decides_which_names_count() -> None:
    declared = parse_markdown("## Salzsee\nKategorie: Ort\n\n## Lage\nIm Norden.\n")
    assert [(e.name, e.category, e.body) for e in declared.entries] == [
        ("Salzsee", "ort", "### Lage\nIm Norden.\n")
    ]
    # In a group of figures the line of the entry takes precedence, as for its category.
    own = parse_markdown("# Figuren\n## Kael\nKategorie: Ort\n## Lage\nIm Norden.\n")
    assert [(e.name, e.category) for e in own.entries] == [("Kael", "ort")]
    elsewhere = parse_markdown("## Kael\nKategorie: Figur\n## Lage\nIm Norden.\n")
    assert [(e.name, e.category) for e in elsewhere.entries] == [("Kael", "figur"), ("Lage", None)]


def test_without_a_known_category_all_names_count() -> None:
    """Unknown category: as before, every name of every category is a section."""
    material = parse_markdown("## Kael\nFährmann.\n## Lage\nIm Norden.\n## Zweck\nKeiner.\n")
    assert [e.name for e in material.entries] == ["Kael"]
    assert material.entries[0].body == "Fährmann.\n### Lage\nIm Norden.\n### Zweck\nKeiner.\n"


def test_a_group_heading_called_geschichte_stays_a_group() -> None:
    """Step 9.3: material with a group "Geschichte" on the top level behaves as before."""
    material = parse_markdown(
        "# Geschichte\n\n## Gründung\nIm Jahr 12.\n\n## Krieg\nIm Jahr 395.\n"
    )
    assert [(e.name, e.category) for e in material.entries] == [("Gründung", None), ("Krieg", None)]
    after_entries = parse_markdown(
        "# Orte\n## Kerrow\nHafen.\n# Geschichte\n## Gründung\nIm Jahr 12.\n"
    )
    assert [(e.name, e.category) for e in after_entries.entries] == [
        ("Kerrow", "ort"),
        ("Gründung", None),
    ]


def test_the_former_name_is_read_in_a_figure_only() -> None:
    inside = parse_markdown(
        "# Figuren\n## Kael\n### Aussehen\nGroß.\n### Wesen und Geschichte\nTreu.\n"
    )
    assert [e.name for e in inside.entries] == ["Kael"]
    elsewhere = parse_markdown("# Orte\n## Kerrow\nHafen.\n## Wesen und Geschichte\nTreu.\n")
    assert [e.name for e in elsewhere.entries] == ["Kerrow", "Wesen und Geschichte"]

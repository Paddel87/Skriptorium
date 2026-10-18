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
    material = (
        "# Figuren\n\n## Hauptfiguren\n\n### Kael\nFährmann.\n\n### Zweck\nKein Gegenstand.\n"
    )
    entries = parse_markdown(material).entries
    # "Hauptfiguren" stays a group; since step 7.9 "Zweck" is a section of the entry before.
    assert [e.name for e in entries] == ["Kael"]
    assert entries[0].body == "Fährmann.\n\n#### Zweck\nKein Gegenstand.\n"


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

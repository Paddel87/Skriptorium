"""The section rule of the server against the cases it shares with the interface (step 9.1)."""

import json
from pathlib import Path
from typing import Any

import pytest

from skriptorium.canon.categories import Category
from skriptorium.canon.sections import (
    FORMER_SECTIONS,
    SECTIONS,
    append_section,
    drop_empty_sections,
    is_section_name,
    nest_headings,
    put_section,
    read_labelled,
    read_part,
    read_section,
    template_for,
)

CASES: dict[str, Any] = json.loads(
    (Path(__file__).parents[1] / "shared" / "sections.json").read_text(encoding="utf-8")
)


def _about(case: dict[str, Any]) -> str:
    return str(case.get("about", case.get("expected")))


@pytest.mark.parametrize("case", CASES["read"], ids=_about)
def test_read_section(case: dict[str, Any]) -> None:
    assert read_section(case["text"], case["heading"]) == case["expected"]


@pytest.mark.parametrize("case", CASES["labelled"], ids=_about)
def test_read_labelled(case: dict[str, Any]) -> None:
    assert read_labelled(case["text"], case["label"]) == case["expected"]


@pytest.mark.parametrize("case", CASES["part"], ids=_about)
def test_read_part(case: dict[str, Any]) -> None:
    assert read_part(case["text"], case["name"]) == case["expected"]


@pytest.mark.parametrize("case", CASES["append"], ids=_about)
def test_append_section(case: dict[str, Any]) -> None:
    assert append_section(case["text"], case["heading"], case["section"]) == case["expected"]


@pytest.mark.parametrize("case", CASES["put"], ids=_about)
def test_put_section(case: dict[str, Any]) -> None:
    result = put_section(case["text"], case["heading"], case["section"], case["mode"])
    assert result == case["expected"]


def test_the_shared_cases_name_the_sections_of_the_server() -> None:
    assert CASES["categories"] == {key: list(names) for key, names in SECTIONS.items()}


@pytest.mark.parametrize("case", CASES["templates"], ids=_about)
def test_templates_are_the_sections_of_their_category(case: dict[str, Any]) -> None:
    assert template_for(case["category"]) == case["expected"]


def test_every_section_of_a_category_stands_in_its_template_once_and_in_order() -> None:
    for category, names in SECTIONS.items():
        headings = [line for line in template_for(category).split("\n") if line]
        assert headings == [f"## {name}" for name in names]


def test_section_names_are_known_in_any_case_and_with_spaces() -> None:
    assert is_section_name(" AUSSEHEN ")
    assert is_section_name("wesen und geschichte")
    assert is_section_name("Zweck")
    assert is_section_name("Wesen")
    assert is_section_name("lage")
    assert not is_section_name("Erscheinungsbild")


def test_a_category_knows_only_its_own_sections() -> None:
    """Step 9.3 (ADR-092): "Geschichte" of foreign material is no section of a rule or an item."""
    assert is_section_name("Fähigkeiten", "figur")
    assert not is_section_name("Fähigkeiten", "ort")
    assert is_section_name(" LAGE ", "ort")
    assert not is_section_name("Lage", "figur")
    assert is_section_name("Glaube und Bräuche", "kultur")
    assert not is_section_name("Zweck", "kultur")
    assert is_section_name("Geschichte", "figur")
    assert not is_section_name("Geschichte", "gegenstand")
    without: tuple[Category, ...] = ("regel", "zeitlinie")
    for category in without:
        assert not is_section_name("Aussehen", category)


def test_former_names_are_read_in_their_category_but_not_in_templates() -> None:
    assert FORMER_SECTIONS == {"figur": ("Wesen und Geschichte",)}
    assert is_section_name("Wesen und Geschichte", "figur")
    assert not is_section_name("Wesen und Geschichte", "ort")
    assert "Wesen und Geschichte" not in template_for("figur")
    assert "Wesen und Geschichte" not in SECTIONS["figur"]


def test_empty_sections_are_dropped() -> None:
    assert drop_empty_sections("## Aussehen\n\n## Wesen und Geschichte\n") == ""
    text = "Vorn.\n\n## Aussehen\n\n## Wesen\nTreu.\n\n## Geschichte\n\n"
    assert drop_empty_sections(text) == "Vorn.\n\n## Wesen\nTreu.\n\n"
    assert drop_empty_sections("### A\n### B\nText.\n") == "### B\nText.\n"


def test_a_section_with_only_empty_subsections_is_empty_too() -> None:
    text = "## Aussehen\n\n### Kleidung\n\n#### Mantel\n## Wesen\nTreu.\n"
    assert drop_empty_sections(text) == "## Wesen\nTreu.\n"
    # One subsection with text keeps the section and its heading; only the empty one goes.
    text = "## Aussehen\n### Kleidung\n### Haare\nGrau.\n"
    assert drop_empty_sections(text) == "## Aussehen\n### Haare\nGrau.\n"
    # A section is not empty because of a deeper heading of its own: text in the section counts.
    assert drop_empty_sections("## Aussehen\nGroß.\n### Kleidung\n") == "## Aussehen\nGroß.\n"


def test_text_that_is_not_a_heading_makes_a_section_non_empty() -> None:
    kept = "## Aussehen\n```\n## Wesen\n```\n"
    assert drop_empty_sections(kept) == kept
    kept = "## Aussehen\n- groß\n"
    assert drop_empty_sections(kept) == kept
    kept = "##Aussehen\n"  # no space after the hashes: no heading, so text
    assert drop_empty_sections(kept) == kept


def test_dropping_leaves_the_rest_byte_for_byte() -> None:
    text = "Vorn.\r\n\r\n## Leer\r\n\r\n## Voll\r\nText.\r\n\r\n\r\n"
    assert drop_empty_sections(text) == "Vorn.\r\n\r\n## Voll\r\nText.\r\n\r\n\r\n"
    assert drop_empty_sections("") == ""
    assert drop_empty_sections("Nur Text.") == "Nur Text."
    assert drop_empty_sections("## Leer") == ""


def test_headings_move_down_below_the_name_and_keep_their_distances() -> None:
    assert nest_headings("# Eins\n## Zwei\nText.\n### Drei\n", 3) == (
        "### Eins\n#### Zwei\nText.\n##### Drei\n"
    )
    assert nest_headings("## Aussehen\nGroß.\n", 3) == "### Aussehen\nGroß.\n"
    # The flattest decides, whichever heading comes first.
    assert nest_headings("### Tief\n## Flach\n", 3) == "#### Tief\n### Flach\n"


def test_headings_never_go_below_level_six() -> None:
    assert nest_headings("# A\n#### B\n###### C\n", 3) == "### A\n###### B\n###### C\n"


def test_text_without_headings_or_from_the_asked_level_stays_unchanged() -> None:
    for text in (
        "",
        "Nur Text.\n",
        "### Drei\n#### Vier\n",
        "#### Vier\nText.\r\n",
        "####### sieben\n#Nein\n",
    ):
        assert nest_headings(text, 3) is text


def test_moving_headings_leaves_everything_else_alone() -> None:
    text = "# Eins ##\r\nText mit # Raute.\r\n```\n# kein Titel\n```\n\t## Zwei\r\n## Zwei\r\n"
    # "\t## Zwei" is no heading (indented by a tab); closing hashes and line endings stay.
    assert nest_headings(text, 3) == (
        "### Eins ##\r\nText mit # Raute.\r\n```\n# kein Titel\n```\n\t## Zwei\r\n#### Zwei\r\n"
    )
    # Headings in code blocks do not decide the shift.
    assert nest_headings("```\n# Code\n```\n### Echt\n", 3) == "```\n# Code\n```\n### Echt\n"

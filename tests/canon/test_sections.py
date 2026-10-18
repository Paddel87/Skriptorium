"""The section rule of the server against the cases it shares with the interface (step 9.1)."""

import json
from pathlib import Path
from typing import Any

import pytest

from skriptorium.canon.sections import (
    SECTIONS,
    append_section,
    is_section_name,
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


def test_templates_are_the_sections_of_their_category() -> None:
    assert template_for("figur") == "## Aussehen\n\n## Wesen und Geschichte\n"
    assert template_for("gegenstand") == "## Zweck\n\n## Verwendung\n\n## Auswirkung\n"
    assert template_for("ort") == ""


def test_section_names_are_known_in_any_case_and_with_spaces() -> None:
    assert is_section_name(" AUSSEHEN ")
    assert is_section_name("wesen und geschichte")
    assert is_section_name("Zweck")
    assert not is_section_name("Wesen")
    assert not is_section_name("Erscheinungsbild")

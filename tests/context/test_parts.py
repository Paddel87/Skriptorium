"""How an entry stands in the request: heading, sections one level below it (step 9.3, ADR-092)."""

import pytest

from skriptorium.canon import CanonEntry, Category
from skriptorium.context.parts import render


def entry(body: str, *, category: Category = "figur", aliases: tuple[str, ...] = ()) -> CanonEntry:
    return CanonEntry(
        world="die-salzmark",
        id="kael",
        category=category,
        name="Kael",
        aliases=aliases,
        status=None,
        body=body,
    )


def test_heading_aliases_and_text() -> None:
    assert render(entry("Fährmann.\n\n", aliases=("der Fährmann",))) == (
        "## Kael (Figur)\nAuch: der Fährmann\n\nFährmann."
    )
    assert render(entry("Fährmann."), home="Nebelreich") == (
        "## Kael (Figur, Gast aus der Welt „Nebelreich“)\n\nFährmann."
    )
    assert render(entry("")) == "## Kael (Figur)"


def test_sections_written_beside_the_name_move_below_it() -> None:
    """A hand-written `## Aussehen` stood on the level of the name before (ADR-092)."""
    text = "Fährmann.\n\n## Aussehen\nGroß.\n\n## Wesen\nTreu.\n"
    assert render(entry(text)) == (
        "## Kael (Figur)\n\nFährmann.\n\n### Aussehen\nGroß.\n\n### Wesen\nTreu."
    )


def test_the_distances_between_headings_stay() -> None:
    text = "# Kael\n\nFährmann.\n\n## Aussehen\nGroß.\n### Kleidung\nMantel.\n"
    assert render(entry(text)) == (
        "## Kael (Figur)\n\n### Kael\n\nFährmann.\n\n#### Aussehen\nGroß.\n##### Kleidung\nMantel."
    )


def test_headings_never_go_below_level_six() -> None:
    assert render(entry("# A\nText.\n###### B\nTief.\n")) == (
        "## Kael (Figur)\n\n### A\nText.\n###### B\nTief."
    )


@pytest.mark.parametrize(
    "text",
    [
        "Nur Text, kein Titel.",
        "### Aussehen\nGroß.\n### Wesen\nTreu.",
        "#### Tief\nText.",
        "Text mit # Raute.\n```\n# kein Titel\n```",
    ],
)
def test_text_without_headings_or_from_level_three_is_as_it_was(text: str) -> None:
    assert render(entry(text)) == f"## Kael (Figur)\n\n{text}"


def test_headings_in_code_blocks_are_left_alone() -> None:
    text = "```\n# Code\n```\n## Aussehen\nGroß.\n"
    assert render(entry(text)) == "## Kael (Figur)\n\n```\n# Code\n```\n### Aussehen\nGroß."


def test_sections_without_text_are_left_out() -> None:
    text = (
        "Fährmann.\n\n## Aussehen\n\n## Wesen\nTreu.\n\n## Fähigkeiten\n\n"
        "## Geschichte\n\n## Beziehungen\n"
    )
    assert render(entry(text)) == "## Kael (Figur)\n\nFährmann.\n\n### Wesen\nTreu."


def test_a_new_entry_in_the_form_of_its_template_is_only_the_heading() -> None:
    template = "## Aussehen\n\n## Wesen\n\n## Fähigkeiten\n\n## Geschichte\n\n## Beziehungen\n"
    assert render(entry(template)) == "## Kael (Figur)"
    assert render(entry("## Zweck\n\n## Verwendung\n", category="gegenstand")) == (
        "## Kael (Gegenstand)"
    )


def test_a_section_with_only_empty_subsections_is_left_out_with_them() -> None:
    text = "## Aussehen\n\n### Kleidung\n\n### Haare\n\n## Wesen\nTreu.\n"
    assert render(entry(text)) == "## Kael (Figur)\n\n### Wesen\nTreu."
    text = "## Aussehen\n### Kleidung\n### Haare\nGrau.\n"
    assert render(entry(text)) == "## Kael (Figur)\n\n### Aussehen\n#### Haare\nGrau."


def test_a_timeline_and_a_rule_are_rendered_like_every_entry() -> None:
    events = "1. Die Flut.\n2. Der Salzeid."
    assert render(entry(events, category="zeitlinie")) == f"## Kael (Zeitlinie)\n\n{events}"
    assert render(entry("# Regel\nSalz bindet.", category="regel")) == (
        "## Kael (Regel)\n\n### Regel\nSalz bindet."
    )

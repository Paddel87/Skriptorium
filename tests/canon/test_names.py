"""The name rule of the server against the cases it shares with the interface (step 9.1)."""

import json
from pathlib import Path
from typing import Any

import pytest

from skriptorium.canon import name_pattern

CASES: dict[str, Any] = json.loads(
    (Path(__file__).parents[1] / "shared" / "names.json").read_text(encoding="utf-8")
)


def _hits(text: str, labels: list[str], *, mention: bool) -> list[list[str]]:
    spelling = {label.casefold(): label for label in labels}
    return [
        [match.group(0), spelling[match.group("label").casefold()]]
        for match in name_pattern(labels, mention=mention).finditer(text)
    ]


@pytest.mark.parametrize("case", CASES["mentions"], ids=lambda case: case["about"])
def test_mentions(case: dict[str, Any]) -> None:
    assert _hits(case["text"], case["labels"], mention=True) == case["expected"]


@pytest.mark.parametrize("case", CASES["names"], ids=lambda case: case["about"])
def test_names(case: dict[str, Any]) -> None:
    assert _hits(case["text"], case["labels"], mention=False) == case["expected"]


def test_without_names_nothing_is_found() -> None:
    assert name_pattern([]).search("Kael") is None
    assert name_pattern(["", ""], mention=True).search("@") is None

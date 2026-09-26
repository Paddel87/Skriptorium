"""Tests for reading and writing the YAML header (ADR-016)."""

import pytest

from skriptorium.storage import HeaderValue, InvalidInput
from skriptorium.storage.frontmatter import parse, render


def test_round_trip_keeps_header_and_body() -> None:
    header: dict[str, HeaderValue] = {
        "name": "Kael",
        "aliasse": ["No", "On", "012"],
        "kategorie": "figur",
        "kapitel": 3,
        "gast_verbindungen": [{"welt": "salzmark", "eintrag": "ilka"}],
    }
    body = "Kael kam aus dem Norden.\n\nZweiter Absatz: „Zitat“ \u2013 äöüß.\n"
    assert parse(render(header, body)) == (header, body)


def test_written_ambiguous_strings_are_quoted() -> None:
    text = render({"name": "No", "aliasse": ["On", "012"]}, "")
    assert "'No'" in text
    assert "'On'" in text
    assert "'012'" in text


def test_document_without_header_has_empty_header() -> None:
    assert parse("Nur Text.\n") == ({}, "Nur Text.\n")
    assert render({}, "Nur Text.\n") == "Nur Text.\n"


def test_body_starting_with_delimiter_survives_round_trip() -> None:
    body = "---\nkein Kopf, sondern Text\n"
    assert parse(render({}, body)) == ({}, body)


def test_empty_header_block_is_empty_header() -> None:
    assert parse("---\n---\nText") == ({}, "Text")


def test_windows_line_endings_are_accepted() -> None:
    header, body = parse("---\r\nname: Kael\r\n---\r\nText")
    assert header == {"name": "Kael"}
    assert body == "Text"


@pytest.mark.parametrize(
    "value",
    ["No", "yes", "On", "off", "012", "0x1F", "0b101", "1_000", "190:20:30", "1_0.5", ".inf"],
)
def test_ambiguous_hand_written_values_are_rejected(value: str) -> None:
    with pytest.raises(InvalidInput, match="Anführungszeichen"):
        parse(f"---\nwert: {value}\n---\n")


@pytest.mark.parametrize(
    ("value", "expected"),
    [("true", True), ("False", False), ("12", 12), ("-3", -3), ("1.5", 1.5), ("~", None)],
)
def test_plain_values_are_read(value: str, expected: object) -> None:
    assert parse(f"---\nwert: {value}\n---\n")[0] == {"wert": expected}


def test_dates_stay_text() -> None:
    assert parse("---\ndatum: 2026-09-26\n---\n")[0] == {"datum": "2026-09-26"}


@pytest.mark.parametrize(
    "header",
    [
        "name: [nicht geschlossen",
        "- nur\n- eine Liste",
        "1: zahl als Feldname",
        "daten: !!binary aGFsbG8=",
        "menge: !!set {a: null}",
        "objekt: !!python/object:os.system {}",
    ],
)
def test_invalid_headers_are_rejected(header: str) -> None:
    with pytest.raises(InvalidInput):
        parse(f"---\n{header}\n---\n")


def test_unclosed_header_is_rejected() -> None:
    with pytest.raises(InvalidInput, match="nicht mit --- abgeschlossen"):
        parse("---\nname: Kael\nText ohne Ende des Kopfs")

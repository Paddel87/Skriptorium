"""Tests for import preview and take-over in CanonService (FR-005)."""

import time
from pathlib import Path

import pytest

from skriptorium.canon import CanonService, ImportResult, InvalidInput, NotFound
from skriptorium.storage import DocumentStore

MATERIAL = """Sieben Inseln nach der Flut.

# Figuren
## Anselm Drach
Aliasse: der Vogt
Vogt von Kerrow.
## Anselm Drach
Zweite Fassung.

# Orte
## Kerrow
Hafenstadt.

# Sonstiges
## Salzlicht
Leuchtet.
"""


@pytest.fixture
def canon(tmp_path: Path) -> CanonService:
    service = CanonService(DocumentStore(tmp_path / "data"))
    service.create_world("Salzmark", "Welt-Grundregeln.")
    return service


def test_preview_stores_nothing_and_marks_conflicts(canon: CanonService) -> None:
    canon.create_entry("salzmark", "ort", "Kerrow", body="Alter Text.")
    preview = canon.preview_import("salzmark", MATERIAL)
    assert [(i.id, i.category, i.conflict) for i in preview.items] == [
        ("anselm-drach", "figur", None),
        ("anselm-drach", "figur", "doppelt"),
        ("kerrow", "ort", "vorhanden"),
        ("salzlicht", None, None),
    ]
    assert preview.introduction == "Sieben Inseln nach der Flut.\n"
    assert [e.id for e in canon.list_entries("salzmark")] == ["kerrow"]


def test_import_needs_a_category_for_every_stored_entry(canon: CanonService) -> None:
    with pytest.raises(InvalidInput, match="Salzlicht"):
        canon.apply_import("salzmark", MATERIAL)
    assert canon.list_entries("salzmark") == []
    assert canon.get_world("salzmark").description == "Welt-Grundregeln."


def test_import_skips_conflicts_and_appends_introduction(canon: CanonService) -> None:
    canon.create_entry("salzmark", "ort", "Kerrow", body="Alter Text.")
    result = canon.apply_import("salzmark", MATERIAL, categories={"salzlicht": "regel"})
    assert result == ImportResult(
        created=("anselm-drach", "salzlicht"),
        overwritten=(),
        skipped=("anselm-drach", "kerrow"),
    )
    assert canon.get_entry("salzmark", "kerrow").body == "Alter Text."
    drach = canon.get_entry("salzmark", "anselm-drach")
    assert (drach.body, drach.aliases) == ("Vogt von Kerrow.\n", ("der Vogt",))
    assert canon.get_entry("salzmark", "salzlicht").category == "regel"
    assert canon.get_world("salzmark").description == (
        "Welt-Grundregeln.\n\nSieben Inseln nach der Flut.\n"
    )


def test_import_overwrites_chosen_conflicts(canon: CanonService) -> None:
    canon.create_entry("salzmark", "figur", "Kerrow", body="Alter Text.")
    result = canon.apply_import(
        "salzmark",
        MATERIAL,
        categories={"salzlicht": "regel"},
        overwrite={"kerrow", "anselm-drach"},
    )
    assert result.overwritten == ("anselm-drach", "kerrow")
    kerrow = canon.get_entry("salzmark", "kerrow")
    assert (kerrow.category, kerrow.body) == ("ort", "Hafenstadt.\n")
    assert canon.get_entry("salzmark", "anselm-drach").body == "Zweite Fassung.\n"


def test_import_into_empty_description_and_missing_world(canon: CanonService) -> None:
    canon.create_world("Nebelreich")
    canon.apply_import("nebelreich", "Nur Einleitung.\n")
    assert canon.get_world("nebelreich").description == "Nur Einleitung.\n"
    with pytest.raises(NotFound):
        canon.preview_import("atlantis", MATERIAL)


def test_imported_world_is_usable_as_canon(canon: CanonService) -> None:
    canon.apply_import("salzmark", MATERIAL, categories={"salzlicht": "regel"})
    assert [e.name for e in canon.find_entries("salzmark", "der vo")] == ["Anselm Drach"]


def _material(pages: int) -> str:
    """Fictional material: one group per category, about 500 words per page."""
    words = ["Salz", "Flut", "Hafen", "Nebel", "Turm", "Schwur", "Möwe", "Welle", "Grab", "Licht"]
    groups = ["Figuren", "Orte", "Gegenstände", "Zeitlinie", "Regeln", "Kultur"]
    parts: list[str] = []
    for page in range(pages):
        parts.append(f"# {groups[page % len(groups)]}")
        for entry in range(5):
            text = " ".join(words[(page + entry + i) % len(words)] for i in range(100))
            parts.append(f"## Eintrag {page}-{entry}\nAliasse: E{page}x{entry}\n{text}\n")
    return "\n".join(parts)


def test_import_of_material_with_twenty_pages(canon: CanonService) -> None:
    material = _material(pages=20)
    assert len(material.split()) > 10_000
    start = time.perf_counter()
    result = canon.apply_import("salzmark", material)
    elapsed = time.perf_counter() - start
    assert len(result.created) == 100
    assert elapsed < 60, f"Import dauerte {elapsed:.1f} s"

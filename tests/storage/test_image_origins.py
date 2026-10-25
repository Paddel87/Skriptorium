"""Tests for the origin of generated images in a companion file (step 9.6, ADR-095)."""

import os
from pathlib import Path

import pytest

from skriptorium.storage import DocumentStore, ImageOrigin, InvalidInput, NotFound, StorageError
from skriptorium.storage.frontmatter import HeaderValue
from skriptorium.storage.origins import origin_from_mapping, origin_to_mapping
from tests.image_samples import png

IMAGE = "worlds/salzmark/bilder/kael-0a1b2c.png"
COMPANION = IMAGE + ".herkunft.yml"
ORIGIN = ImageOrigin(
    "openai/gpt-image-1",
    "Kael am Hafen, Abendlicht.\nZweite Zeile: „Mantel“ in Grau.",
    "2:3",
    0.04,
    "2026-10-25T18:00:00+00:00",
)


@pytest.fixture
def store(tmp_path: Path) -> DocumentStore:
    return DocumentStore(tmp_path / "data")


def test_writes_and_reads_the_origin_next_to_the_image(
    store: DocumentStore, tmp_path: Path
) -> None:
    store.write_image(IMAGE, png(), origin=ORIGIN)
    assert store.read_image_origin(IMAGE) == ORIGIN
    text = (tmp_path / "data" / COMPANION).read_text(encoding="utf-8")
    assert text.startswith("modell: openai/gpt-image-1\n")
    assert "„Mantel“ in Grau" in text  # readable, not escaped
    # Not a Markdown document: neither listed nor indexed.
    assert store.list_paths() == []
    store.rebuild_index()
    assert store.search("salzmark", "Kael", "fulltext") == []


def test_an_image_without_companion_has_no_origin(store: DocumentStore) -> None:
    store.write_image(IMAGE, png())
    assert store.read_image_origin(IMAGE) is None


def test_deleting_the_image_deletes_its_origin(store: DocumentStore, tmp_path: Path) -> None:
    store.write_image(IMAGE, png(), origin=ORIGIN)
    store.delete_image(IMAGE)
    assert not (tmp_path / "data" / COMPANION).exists()
    assert store.read_image_origin(IMAGE) is None


def test_a_companion_left_without_image_is_removed_on_delete(
    store: DocumentStore, tmp_path: Path
) -> None:
    store.write_image(IMAGE, png(), origin=ORIGIN)
    (tmp_path / "data" / IMAGE).unlink()  # image deleted by hand
    with pytest.raises(NotFound):
        store.delete_image(IMAGE)
    assert not (tmp_path / "data" / COMPANION).exists()


def test_a_failing_origin_write_leaves_no_image(
    store: DocumentStore, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    calls = 0
    real_fsync = os.fsync

    def fail_third(descriptor: int) -> None:
        nonlocal calls
        calls += 1
        if calls == 3:  # file and directory of the image succeed, the companion fails
            raise OSError("Datenträger voll")
        real_fsync(descriptor)

    monkeypatch.setattr(os, "fsync", fail_third)
    with pytest.raises(StorageError, match="Datenträger voll"):
        store.write_image(IMAGE, png(), origin=ORIGIN)
    monkeypatch.undo()
    assert [p for p in (tmp_path / "data" / "worlds").rglob("*") if p.is_file()] == []


def test_an_unreadable_companion_is_invalid_input(store: DocumentStore, tmp_path: Path) -> None:
    store.write_image(IMAGE, png())
    (tmp_path / "data" / COMPANION).write_text("modell: [offen\n", encoding="utf-8")
    with pytest.raises(InvalidInput):
        store.read_image_origin(IMAGE)


def test_reads_origins_only_of_image_paths(store: DocumentStore) -> None:
    with pytest.raises(InvalidInput):
        store.read_image_origin("worlds/w/canon/figur/kael.md")


def test_mapping_round_trip_and_missing_cost() -> None:
    assert origin_from_mapping(origin_to_mapping(ORIGIN)) == ORIGIN
    without_cost = ImageOrigin("m", "p", "1:1", None, "2026-10-25T18:00:00+00:00")
    assert origin_from_mapping(origin_to_mapping(without_cost)) == without_cost
    whole = origin_to_mapping(ORIGIN) | {"kosten_usd": 1}
    assert origin_from_mapping(whole).cost_usd == 1.0


@pytest.mark.parametrize(
    "change",
    [
        {"modell": None},
        {"anweisung": 3},
        {"seitenverhaeltnis": None},
        {"datum": None},
        {"kosten_usd": "teuer"},
        {"kosten_usd": True},
    ],
)
def test_refuses_incomplete_or_wrong_fields(change: dict[str, HeaderValue]) -> None:
    with pytest.raises(InvalidInput):
        origin_from_mapping(origin_to_mapping(ORIGIN) | change)


def test_a_failing_image_delete_after_the_origin_is_a_storage_error(
    store: DocumentStore, monkeypatch: pytest.MonkeyPatch
) -> None:
    store.write_image(IMAGE, png(), origin=ORIGIN)
    real_unlink = Path.unlink

    def refuse_image(self: Path, missing_ok: bool = False) -> None:
        if self.suffix == ".png":
            raise PermissionError("gesperrt")
        real_unlink(self, missing_ok=missing_ok)

    monkeypatch.setattr(Path, "unlink", refuse_image)
    with pytest.raises(StorageError, match="gesperrt"):
        store.delete_image(IMAGE)
    monkeypatch.undo()
    assert store.read_image(IMAGE)[0] == png()

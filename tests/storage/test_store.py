"""Tests for DocumentStore: files, atomic writes and the derived index."""

import os
from pathlib import Path

import pytest

from skriptorium.storage import (
    AlreadyExists,
    DocumentStore,
    InvalidInput,
    NotFound,
    SearchHit,
    SearchMode,
    StorageError,
)

KAEL = "worlds/salzmark/canon/figur/kael.md"
HAFEN = "worlds/salzmark/canon/ort/hafen.md"
OTHER = "worlds/nebelreich/canon/figur/kael.md"


@pytest.fixture
def root(tmp_path: Path) -> Path:
    return tmp_path / "data"


@pytest.fixture
def store(root: Path) -> DocumentStore:
    return DocumentStore(root)


def _fill(store: DocumentStore) -> None:
    store.write(
        KAEL,
        {"name": "Kael", "aliasse": ["der Schmied", "Kae"], "kategorie": "figur"},
        "Kael schmiedet Klingen am Salzhafen.",
    )
    store.write(HAFEN, {"name": "Salzhafen", "kategorie": "ort"}, "Hier legen die Schiffe an.")
    store.write(OTHER, {"name": "Kael"}, "Ein anderer Kael in einer anderen Welt.")
    store.write(
        "worlds/salzmark/stories/flucht/story.md",
        {"titel": "Die Flucht", "form": "kurzgeschichte"},
        "Zusammenfassung.",
    )


def _search_state(store: DocumentStore) -> list[list[SearchHit]]:
    queries: list[tuple[str, str, SearchMode]] = [
        ("salzmark", "ka", "name"),
        ("salzmark", "der sch", "name"),
        ("salzmark", "salzhafen", "fulltext"),
        ("nebelreich", "kael", "fulltext"),
        ("salzmark", "die fl", "name"),
    ]
    return [store.search(world, query, mode) for world, query, mode in queries]


def test_write_and_read_round_trip(store: DocumentStore) -> None:
    written = store.write(KAEL, {"name": "Kael", "aliasse": ["No"]}, "Text\n")
    assert store.read(KAEL) == written
    assert written.header == {"name": "Kael", "aliasse": ["No"]}


def test_create_refuses_existing_document(store: DocumentStore) -> None:
    store.write(KAEL, {"name": "Kael"}, "", create=True)
    with pytest.raises(AlreadyExists):
        store.write(KAEL, {"name": "Kael"}, "", create=True)


def test_read_and_delete_missing_document(store: DocumentStore) -> None:
    with pytest.raises(NotFound):
        store.read(KAEL)
    with pytest.raises(NotFound):
        store.delete(KAEL)


def test_delete_removes_file_and_index_entry(store: DocumentStore) -> None:
    _fill(store)
    store.delete(KAEL)
    assert KAEL not in store.list_paths()
    assert store.search("salzmark", "kael", "fulltext") == []


def test_delete_failure_raises_storage_error(
    store: DocumentStore, monkeypatch: pytest.MonkeyPatch
) -> None:
    store.write(KAEL, {"name": "Kael"}, "")

    def fail(self: Path) -> None:
        raise PermissionError("gesperrt")

    monkeypatch.setattr(Path, "unlink", fail)
    with pytest.raises(StorageError):
        store.delete(KAEL)


def test_list_paths_below_prefix(store: DocumentStore) -> None:
    _fill(store)
    assert store.list_paths("worlds/salzmark/canon") == [KAEL, HAFEN]
    assert store.list_paths("worlds/fehlt") == []
    assert len(store.list_paths()) == 4


@pytest.mark.parametrize(
    "path",
    [
        "",
        "/etc/passwd.md",
        "../aussen.md",
        "worlds/../../aussen.md",
        "worlds//doppelt.md",
        "worlds/./punkt.md",
        "worlds\\salzmark\\kael.md",
        "worlds/salzmark/kael.txt",
        "worlds/salzmark/nul\x00.md",
    ],
)
def test_bad_paths_are_rejected(store: DocumentStore, path: str) -> None:
    with pytest.raises(InvalidInput):
        store.write(path, {}, "")


def test_bad_list_prefix_is_rejected(store: DocumentStore) -> None:
    with pytest.raises(InvalidInput):
        store.list_paths("../")


def test_name_search_matches_names_and_aliases_by_prefix(store: DocumentStore) -> None:
    _fill(store)
    assert store.search("salzmark", "KA") == [SearchHit(KAEL, "Kael")]
    assert store.search("salzmark", "der schm") == [SearchHit(KAEL, "Kael")]
    assert store.search("salzmark", "salz") == [SearchHit(HAFEN, "Salzhafen")]
    assert store.search("salzmark", "  ") == []


def test_name_search_treats_wildcards_literally(store: DocumentStore) -> None:
    _fill(store)
    assert store.search("salzmark", "%") == []
    assert store.search("salzmark", "_ael") == []


def test_worlds_are_separated(store: DocumentStore) -> None:
    _fill(store)
    assert store.search("nebelreich", "kael") == [SearchHit(OTHER, "Kael")]
    assert [hit.path for hit in store.search("salzmark", "kael", "fulltext")] == [KAEL]


def test_fulltext_search_ignores_case_and_diacritics(store: DocumentStore) -> None:
    store.write(KAEL, {"name": "Kael"}, "Er trägt einen Übermantel.")
    assert store.search("salzmark", "UBERMANTEL tragt", "fulltext") == [SearchHit(KAEL, "Kael")]
    assert store.search("salzmark", 'mantel"', "fulltext") == []


def test_name_falls_back_to_title_and_file_stem(store: DocumentStore) -> None:
    _fill(store)
    store.write("worlds/salzmark/canon/regel/ohne-name.md", {}, "Regeltext.")
    assert store.search("salzmark", "die fl") == [
        SearchHit("worlds/salzmark/stories/flucht/story.md", "Die Flucht")
    ]
    assert store.search("salzmark", "ohne") == [
        SearchHit("worlds/salzmark/canon/regel/ohne-name.md", "ohne-name")
    ]


def test_documents_outside_worlds_are_not_indexed(store: DocumentStore) -> None:
    store.write("notizen/kael.md", {"name": "Kael"}, "Kael")
    assert store.list_paths() == ["notizen/kael.md"]
    assert store.search("notizen", "kael") == []


# --- Acceptance criteria of roadmap step 2.2 ---------------------------------------------


def test_failed_replace_leaves_previous_content_unchanged(
    store: DocumentStore, root: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    store.write(KAEL, {"name": "Kael"}, "Alter Stand.")
    before = (root / KAEL).read_bytes()

    def crash(source: str, target: object) -> None:
        raise OSError("Strom weg")

    monkeypatch.setattr(os, "replace", crash)
    with pytest.raises(StorageError):
        store.write(KAEL, {"name": "Kael"}, "Neuer Stand.")
    monkeypatch.undo()
    assert (root / KAEL).read_bytes() == before
    assert store.read(KAEL).body == "Alter Stand."
    assert store.search("salzmark", "alter", "fulltext") == [SearchHit(KAEL, "Kael")]
    leftovers = [p.name for p in (root / KAEL).parent.iterdir() if p.suffix == ".tmp"]
    assert leftovers == []


def test_failed_write_leaves_previous_content_unchanged(
    store: DocumentStore, root: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    store.write(KAEL, {"name": "Kael"}, "Alter Stand.")

    def crash(descriptor: int) -> None:
        raise OSError("Datenträger voll")

    monkeypatch.setattr(os, "fsync", crash)
    with pytest.raises(StorageError):
        store.write(KAEL, {"name": "Kael"}, "Neuer Stand.")
    monkeypatch.undo()
    assert store.read(KAEL).body == "Alter Stand."
    assert sorted(p.name for p in (root / KAEL).parent.iterdir()) == ["kael.md"]


def test_rebuilt_index_gives_same_search_state(store: DocumentStore, root: Path) -> None:
    _fill(store)
    store.write(KAEL, {"name": "Kael", "aliasse": ["der Schmied"]}, "Kael am Salzhafen.")
    store.delete(HAFEN)
    expected = _search_state(store)
    assert any(expected)

    (root / "index.sqlite").unlink()
    rebuilt = DocumentStore(root)
    assert _search_state(rebuilt) != expected
    rebuilt.rebuild_index()
    assert _search_state(rebuilt) == expected


def test_index_holds_nothing_that_is_not_in_the_files(store: DocumentStore, root: Path) -> None:
    _fill(store)
    (root / KAEL).unlink()
    (root / HAFEN).write_text("---\nname: Neuer Hafen\n---\nNeu.", encoding="utf-8")
    store.rebuild_index()
    assert store.search("salzmark", "kael", "fulltext") == []
    assert store.search("salzmark", "der schmied") == []
    assert store.search("salzmark", "neuer") == [SearchHit(HAFEN, "Neuer Hafen")]
    assert store.search("salzmark", "schiffe", "fulltext") == []


def test_rebuild_rejects_unreadable_header(store: DocumentStore, root: Path) -> None:
    _fill(store)
    (root / KAEL).write_text("---\nname: Kael\naliasse: [No]\n---\n", encoding="utf-8")
    with pytest.raises(InvalidInput):
        store.rebuild_index()

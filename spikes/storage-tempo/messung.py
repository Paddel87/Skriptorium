"""Tempo of ``storage`` with a story of the reference size (roadmap step 4.1).

Builds a temporary data directory with one world (500 canon entries) and one novel of
60 chapters x 40,000 characters (2.4 million characters, about 727,000 tokens at 3.3 characters
per token), then times the operations a writing session uses. Median of 7 runs, milliseconds.

Run: uv run python spikes/storage-tempo/messung.py
"""

import statistics
import tempfile
import time
from collections.abc import Callable
from pathlib import Path

from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

WORLD = "die-salzmark"
STORY = "die-lange-flut"
CHAPTERS = 60
CHAPTER_CHARS = 40_000
ENTRIES = 500
RUNS = 7


def _chapter_text(number: int) -> str:
    paragraph = f"Kapitel {number}: Ilka ging durch Salz und Nebel zum Hafen hinab. "
    paragraphs = []
    while sum(len(p) + 2 for p in paragraphs) < CHAPTER_CHARS:
        paragraphs.append(paragraph * 6)
    return "\n\n".join(paragraphs)[:CHAPTER_CHARS]


def _median_ms(action: Callable[[], object]) -> float:
    times = []
    for _ in range(RUNS):
        start = time.perf_counter()
        action()
        times.append((time.perf_counter() - start) * 1000)
    return statistics.median(times)


def main() -> None:
    root = Path(tempfile.mkdtemp()) / "data"
    store = DocumentStore(root)
    canon = CanonService(store)
    manuscripts = ManuscriptService(store)
    canon.create_world("Die Salzmark", "Sieben Inseln nach der Flut.")
    for n in range(ENTRIES):
        canon.create_entry(WORLD, "ort", f"Insel {n}", body="Klippen und Möwen. " * 40)
    manuscripts.create_story(WORLD, "Die lange Flut", "roman")
    texts = [_chapter_text(n) for n in range(1, CHAPTERS + 1)]
    start = time.perf_counter()
    for number, text in enumerate(texts, start=1):
        manuscripts.save_chapter(WORLD, STORY, number, title=f"Kapitel {number}", text=text)
        manuscripts.set_chapter_summary(WORLD, STORY, number, "Ilka sucht. " * 20, "geprüft")
    fill_ms = (time.perf_counter() - start) * 1000
    size = sum(f.stat().st_size for f in root.rglob("*") if f.is_file())
    last = texts[-1] + "\n\nEin neuer Absatz."
    builder = ContextBuilder(canon, manuscripts)

    results = {
        "Kapitel speichern (letztes Kapitel, 40.000 Zeichen)": _median_ms(
            lambda: manuscripts.save_chapter(WORLD, STORY, CHAPTERS, text=last)
        ),
        "Kapitel lesen": _median_ms(lambda: manuscripts.get_chapter(WORLD, STORY, CHAPTERS)),
        "Alle Kapitel lesen": _median_ms(lambda: manuscripts.list_chapters(WORLD, STORY)),
        "Alle Kanon-Einträge lesen": _median_ms(lambda: canon.list_entries(WORLD)),
        "Kontext bauen (Weiterschreiben)": _median_ms(
            lambda: builder.build(WORLD, STORY, CHAPTERS, "Weiter.")
        ),
        "Namenssuche": _median_ms(lambda: store.search(WORLD, "Insel 4", "name")),
        "Volltextsuche": _median_ms(lambda: store.search(WORLD, "Möwen", "fulltext")),
        "Index neu aufbauen": _median_ms(store.rebuild_index),
    }
    print(f"Datenverzeichnis: {size / 1_000_000:.1f} MB, {len(list(root.rglob('*.md')))} Dateien")
    print(f"Befüllen (60 Kapitel mit Kurzfassung): {fill_ms:.0f} ms")
    for label, value in results.items():
        print(f"{label}: {value:.1f} ms")


if __name__ == "__main__":
    main()

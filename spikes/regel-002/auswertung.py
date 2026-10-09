"""Auswertung der Läufe nach Regel-002 (ADR-047, Schritt 5.24): Mittelwert und Spannweite.

Für jede Kette unter ``ergebnisse/<VARIANTE>/<geschichte>/lauf-<n>/`` werden gezählt:

- **wörtlich:** Anteil der 4-Wort-Folgen eines Vorschlags, die schon im Kapitel davor standen
  (Mittel über die sieben Vorschläge, in Prozent) – wie in 5.15/5.22;
- **6er doppelt:** 6-Wort-Folgen, die in mehr als einem Vorschlag der Kette vorkommen;
- **Warte-Enden:** Vorschläge, deren letzter Satz mit Warten, Schweigen oder einem Blick endet
  (Wortliste, nur Anhaltspunkt – Stichproben von Hand prüfen);
- **Motivfolge:** längste Folge aufeinanderfolgender Vorschläge mit demselben Ortsmotiv
  (Wortlisten je Geschichte in ``geschichten.py``);
- **Wörter** je Vorschlag (Mittel) und **Kosten** der Kette.

Vorgriff und die Umsetzung der Anweisungen zur geführten Figur bleiben Bewertung von Hand.

Aufruf: uv run python spikes/regel-002/auswertung.py VARIANTE [VARIANTE …]
Schreibt je Variante ``ergebnisse/<VARIANTE>/auswertung.md`` und gibt die Tabelle aus.
"""

import json
import re
import sys
from pathlib import Path
from statistics import mean

ROOT = Path(__file__).parent
WORD = re.compile(r"\w+", re.UNICODE)
SENTENCE_END = re.compile(r"(?<=[.!?…“\"])\s+")
WAIT = re.compile(
    r"\b(wartet\w*|schwieg\w*|schweigt|sah (mich|sie|ihn|ihr|ihm)\b.*\ban|blick\w*|stille)\b",
    re.IGNORECASE,
)

# Wortlisten der Ortsmotive; dieselben wie in geschichten.py, hier ohne Import der Dienste.
MOTIVE = {
    "salzmark": {
        "Geruch": ["fisch", "tran", "teer", "salzgeruch", "roch", "stank"],
        "Hafendunst": ["dunst", "nebel", "ritze"],
        "Essen": ["linsen", "zwiebel", "schüssel", "brot"],
        "Licht": ["talg", "kerze", "laterne", "salzlicht"],
    },
    "glimmergrund": {
        "Nässe": ["tropfte", "nass", "pfütze", "wasser"],
        "Grubenluft": ["grubenluft", "moder", "schwefel", "roch"],
        "Glimmen": ["glimm", "schimmer"],
        "Kälte": ["kalt", "kälte", "fröstel"],
    },
}


def words(text: str) -> list[str]:
    return [w.lower() for w in WORD.findall(text)]


def grams(tokens: list[str], n: int) -> set[tuple[str, ...]]:
    return {tuple(tokens[i : i + n]) for i in range(len(tokens) - n + 1)}


def last_sentence(text: str) -> str:
    parts = [p for p in SENTENCE_END.split(text.strip()) if p.strip()]
    return parts[-1] if parts else ""


def longest_run(flags: list[bool]) -> int:
    best = run = 0
    for flag in flags:
        run = run + 1 if flag else 0
        best = max(best, run)
    return best


def chain(path: Path, story: str) -> dict[str, float]:
    proposals = [
        (path / f"{step:02d}.txt").read_text(encoding="utf-8") for step in range(1, 8)
    ]
    before = (path / "start.txt").read_text(encoding="utf-8")
    literal = []
    for proposal in proposals:
        own = grams(words(proposal), 4)
        known = grams(words(before), 4)
        literal.append(100 * len(own & known) / len(own) if own else 0.0)
        before = f"{before}\n\n{proposal}"
    sixes: dict[tuple[str, ...], int] = {}
    for proposal in proposals:
        for gram in grams(words(proposal), 6):
            sixes[gram] = sixes.get(gram, 0) + 1
    motive_run = max(
        longest_run([any(key in p.lower() for key in keys) for p in proposals])
        for keys in MOTIVE[story].values()
    )
    metas = [
        json.loads((path / f"{step:02d}.json").read_text(encoding="utf-8")) for step in range(1, 8)
    ]
    return {
        "wörtlich %": mean(literal),
        "6er doppelt": sum(1 for count in sixes.values() if count > 1),
        "Warte-Enden": sum(1 for p in proposals if WAIT.search(last_sentence(p))),
        "Motivfolge": motive_run,
        "Wörter": mean(len(p.split()) for p in proposals),
        "Kosten $": sum(m["kosten_usd"] or 0.0 for m in metas),
    }


def table(variant: str) -> str:
    lines = [f"## {variant}", ""]
    base = ROOT / "ergebnisse" / variant
    for story_dir in sorted(p for p in base.iterdir() if p.is_dir()):
        runs = [chain(run, story_dir.name) for run in sorted(story_dir.glob("lauf-*"))]
        if not runs:
            continue
        lines += [f"### {story_dir.name} ({len(runs)} Läufe)", ""]
        lines += ["| Kennzahl | Mittel | Spannweite |", "|---|---|---|"]
        for key in runs[0]:
            values = [r[key] for r in runs]
            lines.append(
                f"| {key} | {mean(values):.2f} | {min(values):.2f} – {max(values):.2f} |"
            )
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    for variant in sys.argv[1:]:
        text = table(variant)
        (ROOT / "ergebnisse" / variant / "auswertung.md").write_text(text + "\n", encoding="utf-8")
        print(text)


if __name__ == "__main__":
    main()

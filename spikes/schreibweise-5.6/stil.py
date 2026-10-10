"""Stil-Kennzahlen zur Wirkungsprobe 5.6: unterscheiden sich die Texte je Schreibweise?

Je Variante und Geschichte, Mittel und Spannweite über die Ketten:

- **Satzlänge:** Wörter je Satz (knapp → kurz, poetisch → lang);
- **wörtliche Rede %:** Anteil der Wörter in Anführungszeichen („…“ oder "…");
- **Wörter:** Wörter je Vorschlag.

Aufruf: uv run python spikes/schreibweise-5.6/stil.py VARIANTE [VARIANTE …]
(Ergebnisse aus ``spikes/regel-002/ergebnisse/``)
"""

import re
import sys
from pathlib import Path
from statistics import mean

RESULTS = Path(__file__).parent.parent / "regel-002" / "ergebnisse"
SENTENCE = re.compile(r"[^.!?…]+[.!?…]+")
SPEECH = re.compile(r"„[^“]*“|\"[^\"]*\"")


def numbers(text: str) -> dict[str, float]:
    words = text.split()
    sentences = [s for s in SENTENCE.findall(text) if s.split()]
    speech = sum(len(m.split()) for m in SPEECH.findall(text))
    return {
        "Satzlänge": mean(len(s.split()) for s in sentences) if sentences else 0.0,
        "wörtliche Rede %": 100 * speech / len(words) if words else 0.0,
        "Wörter": float(len(words)),
    }


def chain(path: Path) -> dict[str, float]:
    per = [numbers((path / f"{step:02d}.txt").read_text(encoding="utf-8")) for step in range(1, 8)]
    return {key: mean(p[key] for p in per) for key in per[0]}


def main() -> None:
    for variant in sys.argv[1:]:
        print(f"## {variant}\n")
        for story in sorted(p for p in (RESULTS / variant).iterdir() if p.is_dir()):
            runs = [chain(run) for run in sorted(story.glob("lauf-*"))]
            print(f"### {story.name} ({len(runs)} Läufe)\n")
            print("| Kennzahl | Mittel | Spannweite |\n|---|---|---|")
            for key in runs[0]:
                values = [r[key] for r in runs]
                print(f"| {key} | {mean(values):.1f} | {min(values):.1f} – {max(values):.1f} |")
            print()


if __name__ == "__main__":
    main()

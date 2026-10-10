"""Kosten, Antwortzeiten und Länge je Variante und Geschichte (Schritt 5.26).

Aufruf: uv run python spikes/kanon-treue/uebersicht.py VERZEICHNIS...
Jedes VERZEICHNIS ist ein Variantenordner mit ``<geschichte>/lauf-<n>/NN.json``.
"""

import json
import sys
from pathlib import Path


def main() -> None:
    print("# Übersicht Kosten und Antwortzeiten (5.26)\n")
    print("| Variante | Geschichte | Ketten | Kosten je Kette $ | Sekunden je Vorschlag Mittel (max) | Wörter je Vorschlag | Ausgabe-Token je Vorschlag |")
    print("|---|---|---|---|---|---|---|")
    for folder in map(Path, sys.argv[1:]):
        for story in sorted(p for p in folder.iterdir() if p.is_dir()):
            runs = sorted(story.glob("lauf-*"))
            metas = [json.loads(f.read_text(encoding="utf-8")) for r in runs for f in sorted(r.glob("0*.json"))]
            if not metas:
                continue
            cost = sum(m["kosten_usd"] or 0 for m in metas) / len(runs)
            secs = [m["sekunden"] for m in metas]
            words = sum(m["woerter"] for m in metas) / len(metas)
            out = [m["token_aus"] for m in metas if m["token_aus"]]
            print(f"| {folder.name} | {story.name} | {len(runs)} | {cost:.2f} | "
                  f"{sum(secs) / len(secs):.0f} ({max(secs):.0f}) | {words:.0f} | "
                  f"{sum(out) / len(out):.0f} |")


if __name__ == "__main__":
    main()

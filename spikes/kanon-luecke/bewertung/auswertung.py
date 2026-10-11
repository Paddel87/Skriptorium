"""Auswertung des Spikes 6.13: Quoten je Variante, Geschichte und Gruppe aus den verblindeten Urteilen.

Liest die Tabellen aus ``bewertung-<geschichte>.md`` (Zeilen = Proben, Spalten = K1..K6,
Zellen E/N/W), ordnet die Ketten über ``mapping.json`` den Varianten zu und gibt je Gruppe
die Summen und je Kette die Quote E / (E + W) mit Mittel und Spannweite aus.
Aufruf: ``uv run python spikes/kanon-luecke/bewertung/auswertung.py``
"""

import json
import re
from pathlib import Path

HERE = Path(__file__).parent
# Gruppen nach dem Befund ohne KI (README, technik.md): Stichworttreffer im bisherigen Text.
GROUPS = {
    "salzmark": {"nur im Kanon": [1, 2, 3, 4, 8], "auch im Text": [5, 6, 7, 9, 10]},
    "glimmergrund": {
        "auch im Text": [1, 2, 3, 4, 6, 7, 9, 10, 11, 12],
        "Kontrolle (immer in der Anfrage)": [5, 8],
    },
}


def verdicts(story: str) -> dict[int, list[str]]:
    rows: dict[int, list[str]] = {}
    for line in (HERE / f"bewertung-{story}.md").read_text(encoding="utf-8").splitlines():
        cells = [c.strip().strip("*") for c in line.strip().strip("|").split("|")]
        if len(cells) >= 7 and re.fullmatch(r"\d+", cells[0]):
            marks = [c for c in cells[1:] if c in ("E", "N", "W")]
            if len(marks) == 6 and int(cells[0]) not in rows:
                rows[int(cells[0])] = marks
    return rows


def main() -> None:
    mapping = json.loads((HERE / "mapping.json").read_text(encoding="utf-8"))
    for story, groups in GROUPS.items():
        rows = verdicts(story)
        print(f"## {story} ({len(rows)} Proben gelesen)")
        for group, probes in groups.items():
            for variant in ("mit", "ohne"):
                chains = [k for k, v in mapping[story].items() if v.startswith(variant + "/")]
                totals = {"E": 0, "N": 0, "W": 0}
                quotes = []
                for k in chains:
                    col = int(k[1:]) - 1
                    marks = [rows[p][col] for p in probes]
                    e, w = marks.count("E"), marks.count("W")
                    for m in marks:
                        totals[m] += 1
                    quotes.append(e / (e + w) if e + w else None)
                valid = [q for q in quotes if q is not None]
                mean = sum(valid) / len(valid) if valid else float("nan")
                spread = f"{min(valid):.0%}–{max(valid):.0%}" if valid else "–"
                per_chain = ", ".join("–" if q is None else f"{q:.0%}" for q in quotes)
                print(
                    f"{group:34} {variant:4} E {totals['E']:2} N {totals['N']:2} W {totals['W']:2}"
                    f" | Quote je Kette {per_chain} | Mittel {mean:.0%} ({spread})"
                )
        print()


if __name__ == "__main__":
    main()

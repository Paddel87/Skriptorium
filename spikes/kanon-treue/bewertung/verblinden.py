"""Verblindete Kopie der Ketten je Geschichte: Ordner K1..K9 in zufälliger Reihenfolge."""

import json
import random
import shutil
import sys
from pathlib import Path

REPO = Path("/home/user/Skriptorium")
OUT = Path(sys.argv[1])
SOURCES = {
    "salzmark": ["kanon-treue/ergebnisse/g46-ohne-at", "kanon-treue/ergebnisse/g46-mit-at",
                 "kanon-treue/ergebnisse/g47-mit-at"],
    "glimmergrund": ["regel-002/ergebnisse/ausgang-mittel", "kanon-treue/ergebnisse/g46-mit-at",
                     "kanon-treue/ergebnisse/g47-mit-at"],
}
rng = random.Random(526)
mapping: dict[str, dict[str, str]] = json.loads((OUT.parent / "mapping.json").read_text()) if (OUT.parent / "mapping.json").exists() else {}
for story, variants in [(s, SOURCES[s]) for s in sys.argv[2:]]:
    chains = [(v, run) for v in variants for run in (1, 2, 3)]
    rng.shuffle(chains)
    mapping[story] = {}
    for index, (variant, run) in enumerate(chains, start=1):
        src = REPO / "spikes" / variant / story / f"lauf-{run}"
        dst = OUT / story / f"K{index}"
        dst.mkdir(parents=True)
        for step in range(1, 8):
            shutil.copy(src / f"{step:02d}.txt", dst / f"{step:02d}.txt")
        mapping[story][f"K{index}"] = f"{variant}/lauf-{run}"
(OUT.parent / "mapping.json").write_text(json.dumps(mapping, indent=2), encoding="utf-8")
print("ok")

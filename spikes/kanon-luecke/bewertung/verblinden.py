"""Verblindete Kopie der Ketten des Spikes 6.13: je Geschichte Ordner K1..K6 in zufälliger Reihenfolge.

Aufruf: ``uv run python spikes/kanon-luecke/bewertung/verblinden.py <ziel> salzmark glimmergrund``
Das Ziel liegt außerhalb des Repos (Scratchpad); die Zuordnung landet in ``mapping.json``.
"""

import json
import random
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).parent
RESULTS = HERE.parent / "ergebnisse"
OUT = Path(sys.argv[1])
VARIANTS = ("mit", "ohne")

rng = random.Random(613)
mapping: dict[str, dict[str, str]] = {}
for story in sys.argv[2:]:
    chains = [(variant, run) for variant in VARIANTS for run in (1, 2, 3)]
    rng.shuffle(chains)
    mapping[story] = {}
    for index, (variant, run) in enumerate(chains, start=1):
        src = RESULTS / variant / story / f"lauf-{run}"
        dst = OUT / story / f"K{index}"
        dst.mkdir(parents=True)
        for step in range(1, 8):
            shutil.copy(src / f"{step:02d}.txt", dst / f"{step:02d}.txt")
        mapping[story][f"K{index}"] = f"{variant}/lauf-{run}"
(HERE / "mapping.json").write_text(json.dumps(mapping, indent=2) + "\n", encoding="utf-8")
print("ok")

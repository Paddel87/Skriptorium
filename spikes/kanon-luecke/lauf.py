"""KI-Läufe des Spikes 6.13: Ketten mit und ohne Auffüllung (ADR-061).

Gleicher Aufbau wie ``spikes/kanon-treue/lauf.py`` (Testgeschichten aus Regel-002, Anweisungen
ohne ``@`` aus ``proben.py``, Vorschläge werden übernommen, jede Kette in einem frischen
Datenverzeichnis); einziger Unterschied: ``AUFFUELLUNG=ohne`` lässt die Auffüllung leer
(``variante.py``), wie es bei langen Kapiteln geschieht.

Aufruf (Cloud-Session mit gültigem OPENROUTER_API_KEY):
    AUFFUELLUNG=mit|ohne [MODELL=x-ai/grok-4.6] [LAENGE=mittel] [LAEUFE=3]
    [GESCHICHTEN=salzmark,glimmergrund] uv run python spikes/kanon-luecke/lauf.py
Ergebnisse unter ``ergebnisse/<AUFFUELLUNG>/<geschichte>/lauf-<n>/``.
"""

import asyncio
import importlib.util
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT.parent / "regel-002"))
sys.path.insert(0, str(ROOT.parent / "kanon-treue"))
sys.path.insert(0, str(ROOT))

from geschichten import GESCHICHTEN  # noqa: E402
from proben import ANWEISUNGEN  # noqa: E402
from variante import apply  # noqa: E402

from skriptorium.ai_gateway import OpenRouterProvider  # noqa: E402

_spec = importlib.util.spec_from_file_location("kanon_treue_lauf", ROOT.parent / "kanon-treue" / "lauf.py")
assert _spec is not None and _spec.loader is not None
_treue = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_treue)


async def run_story(
    name: str, run: int, variant: str, provider: OpenRouterProvider, model: str, length: str
) -> float:
    with tempfile.TemporaryDirectory() as tmp:
        g = GESCHICHTEN[name](Path(tmp))
        instructions = ANWEISUNGEN[name] or g.instructions
        out = ROOT / "ergebnisse" / variant / name / f"lauf-{run}"
        cost: float = await _treue.chain(g, instructions, False, provider, model, length, out)
        return cost


async def main() -> None:
    variant = apply()
    model = os.environ.get("MODELL", "x-ai/grok-4.6")
    length = os.environ.get("LAENGE", "mittel")
    runs = int(os.environ.get("LAEUFE", "3"))
    names = os.environ.get("GESCHICHTEN", "salzmark,glimmergrund").split(",")
    provider = OpenRouterProvider(os.environ["OPENROUTER_API_KEY"])
    try:
        costs = await asyncio.gather(
            *(
                run_story(name, run, variant, provider, model, length)
                for name in names
                for run in range(1, runs + 1)
            )
        )
        print(f"Kosten gesamt: {sum(costs):.2f} $", flush=True)
    finally:
        await provider.aclose()


if __name__ == "__main__":
    asyncio.run(main())

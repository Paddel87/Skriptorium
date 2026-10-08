"""Probeschreiben für Schritt 5.8: schließt die Fortsetzung nahtlos an (FR-009, FR-011)?

Legt die Testwelt „Die Salzmark“ wie in 3.2/3.3 in einem temporären Datenverzeichnis an und
setzt Kapitel 4 („Die Grotte“) auf den Stand aus dem Probeschreiben 3.3
(``spikes/probeschreiben/ergebnisse/kapitel-4.txt``), abgeschnitten an drei Stellen. An jeder
Stelle fordert es über denselben Weg wie die Oberfläche (``prepare_request`` mit leerer
Anweisung, also „Setze das Manuskript an seinem Ende fort.“) Fortsetzungen bei grok-4.6 und
qwen3.8-max an. Vorhandene Ergebnisse werden übersprungen, ein Anbieter-Fehler wird gemeldet und
der Lauf beim nächsten Aufruf wiederholt. Läuft einmal mit dem alten Rahmen (VARIANTE=vorher) und einmal mit dem neuen
(VARIANTE=nachher); der Rahmen kommt aus dem jeweils installierten Code.

Aufruf: VARIANTE=vorher|nachher uv run python spikes/nahtloser-anschluss/probe.py [WIEDERHOLUNGEN]
Der Schlüssel kommt aus OPENROUTER_API_KEY.
"""

import asyncio
import importlib.util
import json
import os
import sys
import tempfile
import time
from pathlib import Path

from skriptorium.ai_gateway import Completed, GatewayError, OpenRouterProvider
from skriptorium.api.flows.writing import WriteOrder, prepare_request
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

ROOT = Path(__file__).parent
CHAPTER = ROOT.parent / "probeschreiben" / "ergebnisse" / "kapitel-4.txt"
WORLD = "die-salzmark"
STORY = "das-salz-der-toten"
MODELS = {"grok46": "x-ai/grok-4.6", "qwen38max": "qwen/qwen3.8-max-0902"}
# Last paragraph kept (1-based, comment line counted as paragraph 1): mid-dialogue at the
# gate, a sound from above, the standoff over the book.
CUTS = {"a": 22, "b": 43, "c": 70}


def setup(data: Path) -> tuple[CanonService, ManuscriptService, ContextBuilder]:
    spec = importlib.util.spec_from_file_location(
        "abnahme", ROOT.parent / "kontext-abnahme" / "abnahme.py"
    )
    assert spec is not None and spec.loader is not None
    abnahme = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(abnahme)
    abnahme.load_world(data)
    store = DocumentStore(data)
    canon, manuscripts = CanonService(store), ManuscriptService(store)
    return canon, manuscripts, ContextBuilder(canon, manuscripts)


async def main() -> None:
    variant = os.environ["VARIANTE"]
    reps = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    out = ROOT / "ergebnisse" / variant
    out.mkdir(parents=True, exist_ok=True)
    paragraphs = [p for p in CHAPTER.read_text(encoding="utf-8").split("\n\n") if p.strip()]
    provider = OpenRouterProvider(os.environ["OPENROUTER_API_KEY"])
    try:
        with tempfile.TemporaryDirectory() as tmp:
            canon, manuscripts, builder = setup(Path(tmp))
            for cut, last in CUTS.items():
                text = "\n\n".join(paragraphs[1:last])
                manuscripts.save_chapter(WORLD, STORY, 4, title="07-die-grotte", text=text)
                for short, model in MODELS.items():
                    for rep in range(1, reps + 1):
                        name = f"{cut}-{short}-{rep}"
                        if (out / f"{name}.txt").exists():
                            continue
                        order = WriteOrder(WORLD, STORY, 4, model=model)
                        prepared = prepare_request(canon, manuscripts, builder, order)
                        started = time.monotonic()
                        answer, usage, finish = "", None, None
                        try:
                            async for event in provider.stream(prepared.completion):
                                if isinstance(event, Completed):
                                    usage, finish = event.usage, event.finish_reason
                                else:
                                    answer += event.text
                        except GatewayError as error:
                            # Logged, not kept: the run is repeated on the next call.
                            print(name, "Fehler:", error)
                            continue
                        (out / f"{name}.txt").write_text(answer, encoding="utf-8")
                        meta = {
                            "variante": variant,
                            "stelle": cut,
                            "letzter_absatz": paragraphs[last - 1],
                            "modell": model,
                            "sekunden": round(time.monotonic() - started, 1),
                            "token_ein": usage.input_tokens if usage else None,
                            "token_aus": usage.output_tokens if usage else None,
                            "kosten_usd": usage.cost_usd if usage else None,
                            "finish_reason": finish,
                        }
                        (out / f"{name}.json").write_text(
                            json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
                        )
                        print(name, meta["sekunden"], meta["token_ein"], meta["kosten_usd"])
    finally:
        await provider.aclose()


if __name__ == "__main__":
    asyncio.run(main())

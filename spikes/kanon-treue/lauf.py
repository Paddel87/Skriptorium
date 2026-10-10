"""Befolgungs-Teil von Schritt 5.26: Ketten mit Anweisungen, die Kanon-Proben berühren.

Wie ``spikes/regel-002/lauf.py`` (gleiche Testgeschichten, gleiche Schreibstelle, jede Kette in
einem frischen Datenverzeichnis, Vorschläge werden übernommen), aber mit den Anweisungen aus
``proben.py``. In der Fassung ``mit-at`` gehen die per ``@`` genannten Einträge als Verweise mit,
wie die Oberfläche sie schickt; in ``ohne-at`` keine.

Aufruf:
    VARIANTE=NAME FASSUNG=mit-at|ohne-at [MODELL=x-ai/grok-4.6] [LAENGE=mittel] [LAEUFE=3]
    [GESCHICHTEN=salzmark,glimmergrund] [NACHEINANDER=1] uv run python spikes/kanon-treue/lauf.py
Ergebnisse unter ``ergebnisse/<VARIANTE>/<geschichte>/lauf-<n>/``. Schlüssel aus
OPENROUTER_API_KEY.
"""

import asyncio
import json
import os
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT.parent / "regel-002"))
sys.path.insert(0, str(ROOT))

from geschichten import GESCHICHTEN, Geschichte  # noqa: E402
from proben import ANWEISUNGEN, ANWEISUNGEN_MIT_AT  # noqa: E402
from technik import accepted, references  # noqa: E402

from skriptorium.ai_gateway import Completed, GatewayError, OpenRouterProvider  # noqa: E402
from skriptorium.api.flows.writing import WriteOrder, prepare_request  # noqa: E402


async def chain(
    g: Geschichte,
    instructions: list[str],
    with_at: bool,
    provider: OpenRouterProvider,
    model: str,
    length: str,
    out: Path,
) -> float:
    """Eine Kette; gibt die Kosten in US-Dollar zurück (soweit gemeldet)."""
    out.mkdir(parents=True, exist_ok=True)
    start = g.manuscripts.get_chapter(g.world, g.story, g.chapter).text
    (out / "start.txt").write_text(start + "\n", encoding="utf-8")
    cost = 0.0
    for step, instruction in enumerate(instructions, start=1):
        refs = tuple(references(g, instruction)) if with_at else ()
        order = WriteOrder(
            g.world,
            g.story,
            g.chapter,
            instruction=instruction,
            references=refs,
            model=model,
            length=length,  # type: ignore[arg-type]  # Wert aus LAENGE, geprüft vom Builder
        )
        prepared = prepare_request(g.canon, g.manuscripts, g.builder, order)
        started = time.monotonic()
        answer, usage, finish = "", None, None
        for attempt in range(3):
            answer, usage, finish = "", None, None
            try:
                async for event in provider.stream(prepared.completion):
                    if isinstance(event, Completed):
                        usage, finish = event.usage, event.finish_reason
                    else:
                        answer += event.text
                break
            except GatewayError as error:
                print(g.name, step, "Versuch", attempt + 1, "Fehler:", error, flush=True)
        else:
            # Drei Fehlschläge: Kette abbrechen statt einen leeren Schritt anzuhängen.
            (out / "abgebrochen.txt").write_text(f"Schritt {step}\n", encoding="utf-8")
            print(g.name, out.name, step, "abgebrochen", flush=True)
            return cost
        (out / f"{step:02d}.txt").write_text(answer, encoding="utf-8")
        chapter = g.manuscripts.get_chapter(g.world, g.story, g.chapter)
        text = f"{chapter.text.rstrip()}\n\n{accepted(answer)}"
        g.manuscripts.save_chapter(g.world, g.story, g.chapter, title=chapter.title, text=text)
        meta = {
            "geschichte": g.name,
            "schritt": step,
            "anweisung": instruction or "(leer: Weiter)",
            "verweise": list(refs),
            "modell": model,
            "woerter": len(answer.split()),
            "sekunden": round(time.monotonic() - started, 1),
            "token_geschaetzt": prepared.estimated_tokens,
            "token_ein": usage.input_tokens if usage else None,
            "token_aus": usage.output_tokens if usage else None,
            "kosten_usd": usage.cost_usd if usage else None,
            "finish_reason": finish,
        }
        cost += (usage.cost_usd or 0.0) if usage else 0.0
        (out / f"{step:02d}.json").write_text(
            json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(g.name, out.name, step, meta["woerter"], meta["sekunden"], flush=True)
    final = g.manuscripts.get_chapter(g.world, g.story, g.chapter).text
    (out / "kapitel.txt").write_text(final + "\n", encoding="utf-8")
    return cost


async def run_story(
    name: str, run: int, variant: str, with_at: bool, provider: OpenRouterProvider, model: str,
    length: str,
) -> float:
    with tempfile.TemporaryDirectory() as tmp:
        g = GESCHICHTEN[name](Path(tmp))
        if with_at:
            instructions = ANWEISUNGEN_MIT_AT[name]
        else:
            instructions = ANWEISUNGEN[name] or g.instructions
        out = ROOT / "ergebnisse" / variant / name / f"lauf-{run}"
        return await chain(g, instructions, with_at, provider, model, length, out)


async def main() -> None:
    variant = os.environ["VARIANTE"]
    with_at = {"mit-at": True, "ohne-at": False}[os.environ["FASSUNG"]]
    model = os.environ.get("MODELL", "x-ai/grok-4.6")
    length = os.environ.get("LAENGE", "mittel")
    runs = int(os.environ.get("LAEUFE", "3"))
    names = os.environ.get("GESCHICHTEN", "salzmark,glimmergrund").split(",")
    provider = OpenRouterProvider(os.environ["OPENROUTER_API_KEY"])
    try:
        jobs = [(name, run) for name in names for run in range(1, runs + 1)]
        if os.environ.get("NACHEINANDER"):
            # Eine Kette nach der anderen: langsame Modelle nicht zusätzlich belasten.
            costs = [
                await run_story(name, run, variant, with_at, provider, model, length)
                for name, run in jobs
            ]
        else:
            # Ketten unabhängig voneinander: je Geschichte und Lauf parallel.
            costs = list(
                await asyncio.gather(
                    *(
                        run_story(name, run, variant, with_at, provider, model, length)
                        for name, run in jobs
                    )
                )
            )
    finally:
        await provider.aclose()
    print(f"Kosten gesamt: {sum(costs):.3f} $", flush=True)


if __name__ == "__main__":
    asyncio.run(main())

"""Probe zu 8.11 (ADR-088), Teil 2: Wirkung von ``@Name``-Verweisen und ortsgebundener Regel.

Die Salzmark aus ``geschichten.py`` bekommt – nur in diesem Lauf, im frischen Datenverzeichnis –
Verweise in zwei Einträgen und eine Regel, die nur auf Tolm gilt. Die Szene spielt in Kerrow;
die Regel darf dort nicht angewendet werden (Kennwörter siehe ``auswertung_verweise``). Die
erste Anweisung nennt ``@Pell Sund``; Pell verweist auf Gunda Hollt und Zum Nassen Grab.

Läuft auf dem Stand vor 8.11 (``vorher``) und mit 8.11 (``nachher``) gleich: dasselbe Skript,
nur der installierte Code unterscheidet sich. Je Schritt werden die Bausteine der Anfrage
(Art, Name) mitgeschrieben, damit sichtbar ist, was herangezogen wurde.

Aufruf:
    VARIANTE=NAME [LAEUFE=3] [MODELL=x-ai/grok-4.6] uv run python spikes/regel-002/verweise.py
    VARIANTE=NAME BUDGET=6000 uv run python spikes/regel-002/verweise.py   # nur Bausteine, ohne KI
"""

import asyncio
import json
import os
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from geschichten import Geschichte, salzmark  # noqa: E402
from lauf import accepted  # noqa: E402

from skriptorium.ai_gateway import Completed, GatewayError, OpenRouterProvider  # noqa: E402
from skriptorium.api.flows.writing import WriteOrder, prepare_request  # noqa: E402

ROOT = Path(__file__).parent
NAMED = "pell-sund"
RULE = (
    "Gilt nur in: @Tolm\n\n"
    "- Auf Tolm trägt jeder Erwachsene nach Einbruch der Dunkelheit eine rote Wollschnur um das "
    "rechte Handgelenk; wer ohne sie angetroffen wird, zahlt dem Vogt eine Strafe."
)
ADDITIONS = {
    "pell-sund": "- Schläft oft hinter den Fässern im @Zum Nassen Grab; Botengänge für @Gunda Hollt.",
    "vogtshaus": "- Urkunden des Hauses tragen das Siegel aus dem @Siegelring des Vogts.",
}


def prepare(data: Path) -> Geschichte:
    """Die Salzmark mit Verweisen und ortsgebundener Regel."""
    g = salzmark(data)
    for entry_id, line in ADDITIONS.items():
        entry = g.canon.get_entry(g.world, entry_id)
        g.canon.update_entry(g.world, entry_id, body=f"{entry.body.rstrip()}\n{line}\n")
    g.canon.create_entry(g.world, "regel", "Schnurgebot", body=RULE)
    return g


def instructions(g: Geschichte) -> list[str]:
    first, *rest = g.instructions
    return [first.replace("Pell", "@Pell Sund", 1), *rest]


def blocks(g: Geschichte, instruction: str, budget: int | None = None) -> list[list[str]]:
    extra = {"budget": budget} if budget is not None else {}
    built = g.builder.build(g.world, g.story, g.chapter, instruction or "Weiter.", [NAMED], **extra)
    return [[block.kind, block.label] for block in built.blocks]


async def chain(g: Geschichte, provider: OpenRouterProvider, model: str, out: Path) -> float:
    out.mkdir(parents=True, exist_ok=True)
    cost = 0.0
    for step, instruction in enumerate(instructions(g), start=1):
        order = WriteOrder(
            g.world, g.story, g.chapter, instruction=instruction, references=(NAMED,), model=model
        )
        prepared = prepare_request(g.canon, g.manuscripts, g.builder, order)
        used = blocks(g, instruction)
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
                print("verweise", step, "Versuch", attempt + 1, "Fehler:", error, flush=True)
        (out / f"{step:02d}.txt").write_text(answer, encoding="utf-8")
        chapter = g.manuscripts.get_chapter(g.world, g.story, g.chapter)
        text = f"{chapter.text.rstrip()}\n\n{accepted(answer)}"
        g.manuscripts.save_chapter(g.world, g.story, g.chapter, title=chapter.title, text=text)
        meta = {
            "schritt": step,
            "anweisung": instruction or "(leer: Weiter)",
            "modell": model,
            "woerter": len(answer.split()),
            "token_ein": usage.input_tokens if usage else None,
            "kosten_usd": usage.cost_usd if usage else None,
            "finish_reason": finish,
            "bausteine": used,
        }
        cost += (usage.cost_usd or 0.0) if usage else 0.0
        (out / f"{step:02d}.json").write_text(
            json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print("verweise", out.name, step, meta["woerter"], round(time.monotonic() - started, 1))
    return cost


async def main() -> None:
    variant = os.environ["VARIANTE"]
    if "BUDGET" in os.environ:
        with tempfile.TemporaryDirectory() as tmp:
            g = prepare(Path(tmp))
            used = blocks(g, instructions(g)[0], int(os.environ["BUDGET"]))
        out = ROOT / "ergebnisse" / variant / f"bausteine-budget-{os.environ['BUDGET']}.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(used, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(used, ensure_ascii=False))
        return
    model = os.environ.get("MODELL", "x-ai/grok-4.6")
    runs = int(os.environ.get("LAEUFE", "3"))
    provider = OpenRouterProvider(os.environ["OPENROUTER_API_KEY"])
    total = 0.0
    try:
        for run in range(1, runs + 1):
            with tempfile.TemporaryDirectory() as tmp:
                g = prepare(Path(tmp))
                total += await chain(g, provider, model, ROOT / "ergebnisse" / variant / f"lauf-{run}")
    finally:
        await provider.aclose()
    print(f"Kosten gesamt: {total:.3f} $", flush=True)


if __name__ == "__main__":
    asyncio.run(main())

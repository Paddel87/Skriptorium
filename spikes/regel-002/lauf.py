"""Probeschreiben nach Regel-002 (ADR-047, Schritt 5.24): jede Variante mehrfach an beiden
Testgeschichten.

Je Geschichte und Wiederholung läuft eine Kette aus sieben Anweisungen über ``prepare_request``
(wie die Oberfläche); jeder Vorschlag wird übernommen und ans Kapitel gehängt. Ergebnisse unter
``ergebnisse/<VARIANTE>/<geschichte>/lauf-<n>/`` (Texte, Metadaten, Kapitel am Ende).

Aufruf:
    VARIANTE=NAME [MODELL=x-ai/grok-4.6] [LAENGE=kurz|mittel|lang] [LAEUFE=3]
    [GESCHICHTEN=salzmark,glimmergrund] uv run python spikes/regel-002/lauf.py
Der Rahmen kommt aus dem installierten Code. Der Schlüssel kommt aus OPENROUTER_API_KEY.
"""

import asyncio
import json
import os
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from geschichten import GESCHICHTEN, Geschichte  # noqa: E402

from skriptorium.ai_gateway import Completed, GatewayError, OpenRouterProvider  # noqa: E402
from skriptorium.api.flows.writing import WriteOrder, prepare_request  # noqa: E402

ROOT = Path(__file__).parent


def accepted(answer: str) -> str:
    """Der Text, wie „Übernehmen“ ihn anhängt: ohne die Hinweiszeile der KI (Schritt 4.14)."""
    lines = answer.strip().splitlines()
    if lines and lines[0].startswith("HINWEIS:"):
        lines = lines[1:]
    return "\n".join(lines).strip()


async def chain(
    g: Geschichte, provider: OpenRouterProvider, model: str, extra: dict[str, str], out: Path
) -> float:
    """Eine Kette; gibt die Kosten in US-Dollar zurück (soweit gemeldet)."""
    out.mkdir(parents=True, exist_ok=True)
    start = g.manuscripts.get_chapter(g.world, g.story, g.chapter).text
    (out / "start.txt").write_text(start + "\n", encoding="utf-8")
    cost = 0.0
    for step, instruction in enumerate(g.instructions, start=1):
        order = WriteOrder(g.world, g.story, g.chapter, instruction=instruction, model=model, **extra)
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
                # Wie „Neu schreiben“ nach einem Fehler in der Oberfläche.
                print(g.name, step, "Versuch", attempt + 1, "Fehler:", error, flush=True)
        (out / f"{step:02d}.txt").write_text(answer, encoding="utf-8")
        chapter = g.manuscripts.get_chapter(g.world, g.story, g.chapter)
        text = f"{chapter.text.rstrip()}\n\n{accepted(answer)}"
        g.manuscripts.save_chapter(g.world, g.story, g.chapter, title=chapter.title, text=text)
        meta = {
            "geschichte": g.name,
            "schritt": step,
            "anweisung": instruction or "(leer: Weiter)",
            "modell": model,
            "woerter": len(answer.split()),
            "sekunden": round(time.monotonic() - started, 1),
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


async def main() -> None:
    variant = os.environ["VARIANTE"]
    model = os.environ.get("MODELL", "x-ai/grok-4.6")
    runs = int(os.environ.get("LAEUFE", "3"))
    names = os.environ.get("GESCHICHTEN", "salzmark,glimmergrund").split(",")
    extra = {"length": os.environ["LAENGE"]} if "LAENGE" in os.environ else {}
    provider = OpenRouterProvider(os.environ["OPENROUTER_API_KEY"])
    total = 0.0
    try:
        for name in names:
            for run in range(1, runs + 1):
                # Jede Kette in einem frischen Datenverzeichnis: gleicher Aufbau vorher und nachher.
                with tempfile.TemporaryDirectory() as tmp:
                    g = GESCHICHTEN[name](Path(tmp))
                    out = ROOT / "ergebnisse" / variant / name / f"lauf-{run}"
                    total += await chain(g, provider, model, extra, out)
    finally:
        await provider.aclose()
    print(f"Kosten gesamt: {total:.3f} $", flush=True)


if __name__ == "__main__":
    asyncio.run(main())

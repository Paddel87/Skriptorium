"""Abnahme für Schritt 3.9 mit echten KI-Läufen (FR-018, ADR-023).

Eine Geschichte schreibt zuerst mit dem Startmodell grok-4.7 weiter; der Vorschlag wird ans
Kapitel gehängt. Dann wird das Modell der Geschichte auf grok-4.6 gestellt und ohne Angabe eines
Modells weitergeschrieben – wie die Oberfläche es nach dem Wechsel tut. Geprüft wird:

1. Die zweite Anfrage geht an grok-4.6 (Modell der Geschichte).
2. Kein Datenverlust: Der Text aus Lauf 1 steht in der zweiten Anfrage und im Kapitel.
3. Beide Anfragen stehen mit Token und Kosten in der Monatsdatei ``system/verbrauch``.

Die Anfragen laufen durch denselben Ablauf wie der Schreib-Endpunkt (``prepare_request``,
``stream_events`` mit ``UsageLog.record``).

Aufruf (Schlüssel aus OPENROUTER_API_KEY):
    uv run python spikes/modellwahl/abnahme.py
"""

import asyncio
import json
import tempfile
from datetime import UTC, datetime
from pathlib import Path

from skriptorium.ai_gateway import OpenRouterProvider
from skriptorium.api.flows import DEFAULT_MODEL, WriteOrder, prepare_request, stream_events
from skriptorium.api.usage import UsageLog
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

OUT = Path(__file__).parent / "ergebnisse"
WORLD = "moorlande"
STORY = "nebelpfad"
OPENING = "Ilka stand am Rand des Moors. Der Nebel lag so dicht, dass sie den Steg kaum sah."


async def _write(
    provider: OpenRouterProvider,
    canon: CanonService,
    manuscripts: ManuscriptService,
    usage: UsageLog,
) -> tuple[str, str, str]:
    """One request with the story's model; returns model, text and the last user message."""
    story = manuscripts.get_story(WORLD, STORY)
    order = WriteOrder(
        WORLD,
        STORY,
        1,
        "Schreibe zwei bis drei Sätze weiter.",
        model=story.model or DEFAULT_MODEL,
    )
    prepared = prepare_request(canon, manuscripts, ContextBuilder(canon, manuscripts), order)
    parts: list[str] = []
    async for event in stream_events(provider, prepared, usage.record):
        name, data = event.strip().split("\n")
        if name == "event: text":
            parts.append(json.loads(data.removeprefix("data: "))["text"])
    request_text = "\n".join(m.content for m in prepared.completion.messages)
    return prepared.completion.model, "".join(parts).strip(), request_text


async def main() -> None:
    OUT.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        store = DocumentStore(Path(tmp))
        canon, manuscripts = CanonService(store), ManuscriptService(store)
        usage = UsageLog(store, lambda: datetime.now(UTC))
        canon.create_world("Moorlande", "Ein Moor voller Nebel, Stege aus schwarzem Holz.")
        canon.create_entry(WORLD, "figur", "Ilka", body="Moorführerin, vorsichtig.")
        manuscripts.create_story(WORLD, "Nebelpfad", "kurzgeschichte")
        manuscripts.save_chapter(WORLD, STORY, 1, text=OPENING)
        provider = OpenRouterProvider.from_environment()
        try:
            model_1, text_1, _ = await _write(provider, canon, manuscripts, usage)
            manuscripts.save_chapter(WORLD, STORY, 1, text=f"{OPENING}\n\n{text_1}")
            manuscripts.update_story(WORLD, STORY, model="x-ai/grok-4.6")
            model_2, text_2, request_2 = await _write(provider, canon, manuscripts, usage)
        finally:
            await provider.aclose()
        chapter = manuscripts.get_chapter(WORLD, STORY, 1).text
        summed = usage.month()
        records = store.read(f"system/verbrauch/{summed.month}.md").header["anfragen"]
    result = {
        "lauf_1": {"modell": model_1, "text": text_1},
        "lauf_2": {"modell": model_2, "text": text_2},
        "pruefung": {
            "lauf_2_mit_modell_der_geschichte": model_2 == "x-ai/grok-4.6",
            "text_1_in_anfrage_2": bool(text_1) and text_1 in request_2,
            "text_1_im_kapitel": bool(text_1) and text_1 in chapter,
            "anfragen_gezaehlt": summed.requests,
            "kosten_usd": summed.cost_usd,
            "ohne_kosten": summed.without_cost,
        },
        "verbrauchsdatei": records,
    }
    (OUT / "abnahme.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(result["pruefung"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())

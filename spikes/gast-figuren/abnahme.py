"""Abnahme für Schritt 3.7 mit echten KI-Läufen (FR-017).

Die Geschichte „Am Kai" in der Welt „Salzküste" bindet die Figur „Eiskönigin" aus der Welt
„Frostreich" als Gast ein. Ihr Eintrag nennt vier Einzelheiten, die nirgends sonst stehen. Das
Frostreich hat eine Regel („jedes gesprochene Wort gefriert zu Reif"), die nicht im Eintrag
steht und in der Salzküste nicht gelten soll (Entscheidung des Eigentümers, Schritt 3.7). Die
Anfragen laufen durch denselben Ablauf wie der Schreib-Endpunkt (``prepare_request``).

Dass der Gast in anderen Geschichten weder im Menü noch im Kontext erscheint (Szenario 4), ist
durch Tests belegt (``tests/context/test_guests.py``, ``tests/api/test_writing.py``,
``ui/src/views/Guests.test.tsx``) und braucht keinen KI-Lauf.

Aufruf (Schlüssel aus OPENROUTER_API_KEY):
    uv run python spikes/gast-figuren/abnahme.py
"""

import asyncio
import json
import tempfile
from pathlib import Path

from skriptorium.ai_gateway import Completed, OpenRouterProvider
from skriptorium.api.flows import WriteOrder, prepare_request
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

OUT = Path(__file__).parent / "ergebnisse"
WORLD = "salzkueste"
HOME = "frostreich"
STORY = "am-kai"
QUEEN = (
    "Herrscherin des Frostreichs, reist allein.\n\n"
    "- Sie trägt eine silberne Maske, die nur den Mund frei lässt.\n"
    "- Ihre Fingerspitzen sind blau wie Gletschereis.\n"
    "- Sie stützt sich auf einen Stab aus klarem Eis, der nie schmilzt.\n"
    "- Sie spricht nur im Flüsterton."
)
RUNS = {
    "g1-ankunft": "@Eiskönigin betritt den Hafen. Ca. 200 Wörter.",
    "g2-gespraech": (
        "@Eiskönigin spricht mit dem Hafenmeister Oren über ein Schiff nach Süden. "
        "Ca. 200 Wörter."
    ),
    "g3-erster-blick": "Die Reisende sieht @Eiskönigin zum ersten Mal von Nahem. Ca. 200 Wörter.",
}


def load_worlds(data: Path) -> tuple[CanonService, ManuscriptService, ContextBuilder]:
    store = DocumentStore(data)
    canon = CanonService(store)
    manuscripts = ManuscriptService(store)
    canon.create_world("Salzküste", "Eine warme, windige Küste mit Salzgärten und Fischerhäfen.")
    canon.create_entry(WORLD, "ort", "Hafen von Merle", body="Lauter Fischerhafen, warm, Möwen.")
    canon.create_entry(WORLD, "figur", "Oren", body="Hafenmeister von Merle, grob, gutmütig.")
    canon.create_entry(WORLD, "regel", "Wetter", body="An der Salzküste friert es nie.")
    canon.create_world("Frostreich", "Ein Reich aus Eis und Schnee.")
    canon.create_entry(HOME, "figur", "Eiskönigin", body=QUEEN)
    canon.create_entry(
        HOME, "regel", "Gefrorene Worte", body="Im Frostreich gefriert jedes gesprochene Wort zu Reif."
    )
    manuscripts.create_story(WORLD, "Am Kai", "kurzgeschichte")
    manuscripts.save_chapter(
        WORLD,
        STORY,
        1,
        title="Mittag",
        text="Die Reisende saß am Kai von Merle und wartete auf ein Schiff. Die Sonne brannte.",
    )
    manuscripts.add_guest_link(WORLD, STORY, HOME, "eiskoenigin")
    return canon, manuscripts, ContextBuilder(canon, manuscripts)


async def main() -> None:
    OUT.mkdir(exist_ok=True)
    provider = OpenRouterProvider.from_environment()
    total = 0.0
    with tempfile.TemporaryDirectory() as data:
        canon, manuscripts, builder = load_worlds(Path(data))
        for name, instruction in RUNS.items():
            order = WriteOrder(WORLD, STORY, 1, instruction, ("eiskoenigin",))
            prepared = prepare_request(canon, manuscripts, builder, order)
            built = builder.build(WORLD, STORY, 1, instruction, ["eiskoenigin"])
            system = prepared.completion.messages[0].content
            text = ""
            usage: dict[str, object] = {}
            async for event in provider.stream(prepared.completion):
                if isinstance(event, Completed):
                    usage = {
                        "input_tokens": event.usage.input_tokens,
                        "output_tokens": event.usage.output_tokens,
                        "cost_usd": event.usage.cost_usd,
                    }
                else:
                    text += event.text
            total += float(str(usage.get("cost_usd") or 0))
            (OUT / f"{name}.txt").write_text(text.strip() + "\n", encoding="utf-8")
            record = {
                "instruction": instruction,
                "gast_im_kontext": [b.kind for b in built.blocks if b.label == "Eiskönigin"],
                "regel_der_heimatwelt_im_kontext": "Gefrorene Worte" in system,
                "estimated_tokens": prepared.estimated_tokens,
                **usage,
            }
            (OUT / f"{name}.json").write_text(
                json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )
            print(name, record)
    await provider.aclose()
    print(f"Kosten gesamt: {total:.3f} $")


if __name__ == "__main__":
    asyncio.run(main())

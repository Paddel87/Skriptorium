"""Abnahme für Schritt 3.5 mit echten KI-Läufen (FR-013).

Eine Testwelt enthält die Figur „Kael" mit vier Einzelheiten, die nur in ihrem Eintrag stehen,
und so viele weitere Figuren, dass Kael ohne ``@`` nicht mehr ins Token-Budget passt. Die
Anfragen laufen durch denselben Ablauf wie der Schreib-Endpunkt (``prepare_request``); das
Protokoll des ``ContextBuilder`` zeigt, ob der Eintrag im Kontext stand. Die Oberfläche
(Menü, Erkennung von ``@Name``) ist durch Komponenten- und End-to-End-Tests abgedeckt.

Aufruf (Schlüssel aus OPENROUTER_API_KEY):
    uv run python spikes/at-verweis/abnahme.py
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
WORLD = "flusslande"
STORY = "die-ueberfahrt"
KAEL = (
    "Fährmann am Grauen Fluss, etwa fünfzig Jahre alt.\n\n"
    "- Am linken Handgelenk trägt er ein Band aus rotem Seegras, das er nie ablegt.\n"
    "- Der rechten Hand fehlt der kleine Finger.\n"
    "- Als Fährlohn nimmt er nur eine Handvoll Salz, niemals Münzen.\n"
    "- Beim Anlegen pfeift er jedes Mal drei tiefe Töne."
)
NEIGHBOUR = (
    "Bewohnerin des Nordufers. Flickt Netze, handelt mit Salzfisch und kennt jeden Steg "
    "zwischen Mühlenwehr und Mündung. "
)
RUNS = {
    "a1-ueberfahrt": ("@Kael bringt die Reisende über den Grauen Fluss. Ca. 200 Wörter.", True),
    "a2-preis": ("Die Reisende fragt @Kael nach dem Preis der Überfahrt. Ca. 200 Wörter.", True),
    "a3-anlegen": ("@Kael legt am anderen Ufer an. Ca. 200 Wörter.", True),
    "a4-erster-blick": (
        "Die Reisende sieht @Kael zum ersten Mal von Nahem. Ca. 200 Wörter.",
        True,
    ),
    "k1-preis-ohne-at": (
        "Die Reisende fragt Kael nach dem Preis der Überfahrt. Ca. 200 Wörter.",
        False,
    ),
}


def load_world(data: Path) -> tuple[CanonService, ContextBuilder]:
    store = DocumentStore(data)
    canon = CanonService(store)
    manuscripts = ManuscriptService(store)
    canon.create_world("Flusslande", "Ein breiter, grauer Fluss trennt zwei Länder.")
    canon.create_entry(WORLD, "figur", "Kael", body=KAEL)
    canon.create_entry(WORLD, "ort", "Grauer Fluss", body="Breit, langsam, oft im Nebel.")
    # Viele kleine Figuren mit Namen vor „Kael": Sie füllen das Budget, bis weniger Platz
    # bleibt, als Kaels Eintrag braucht – ohne ``@`` fällt Kael dann heraus.
    for number in range(1, 701):
        canon.create_entry(WORLD, "figur", f"Anwohnerin {number:03d}", body=NEIGHBOUR.strip())
    manuscripts.create_story(WORLD, "Die Überfahrt", "kurzgeschichte")
    manuscripts.save_chapter(
        WORLD,
        STORY,
        1,
        title="Am Steg",
        text="Die Reisende erreichte den Grauen Fluss am Abend. Am Steg lag ein flaches Boot.",
    )
    return canon, ContextBuilder(canon, manuscripts)


async def main() -> None:
    OUT.mkdir(exist_ok=True)
    provider = OpenRouterProvider.from_environment()
    total = 0.0
    with tempfile.TemporaryDirectory() as data:
        canon, builder = load_world(Path(data))
        for name, (instruction, with_at) in RUNS.items():
            references = ("kael",) if with_at else ()
            order = WriteOrder(WORLD, STORY, 1, instruction, references)
            prepared = prepare_request(canon, builder, order)
            built = builder.build(WORLD, STORY, 1, instruction, list(references))
            kael_in = [block.kind for block in built.blocks if block.label == "Kael"]
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
                "references": list(references),
                "kael_im_kontext": kael_in,
                "auffuellung": sum(1 for b in built.blocks if b.kind == "auffuellung"),
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

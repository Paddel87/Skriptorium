"""Abnahme für Schritt 3.6 mit echten KI-Läufen (FR-010).

Ein Roman mit drei Kapiteln: Kapitel 1 und 2 enthalten je einen Fakt, der erst nach den ersten
300 Wörtern steht (also nicht im Ersatz-Kapitelanfang); Kapitel 3 ist so lang, dass die
wörtlichen letzten Seiten nur aus Kapitel 3 bestehen. Kapitel 1 und 2 erreichen die KI beim
Weiterschreiben also nur über Kurzfassungen und Gesamtzusammenfassung.

1. Kurzfassungen von Kapitel 1 und 2 über ``api.flows.summarize_chapter`` (echte Anfragen).
2. Drei Fortsetzungen in Kapitel 3 über ``api.flows.prepare_request`` mit Kurzfassungen.
3. Dieselben drei Fortsetzungen ohne Kurzfassungen (Status ``fehlt``, Gesamtzusammenfassung
   leer): ``context`` nutzt dann den Kapitelanfang.

Aufruf (Schlüssel aus OPENROUTER_API_KEY):
    uv run python spikes/kurzfassungen/abnahme.py [nur-mit]

``nur-mit`` wiederholt nur Kurzfassungen und die Läufe mit Kurzfassung.
"""

import asyncio
import json
import sys
import tempfile
from pathlib import Path

from skriptorium.ai_gateway import Completed, OpenRouterProvider
from skriptorium.api.flows import WriteOrder, prepare_request, summarize_chapter
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

OUT = Path(__file__).parent / "ergebnisse"
WORLD = "die-salzmark"
STORY = "die-salzwaechterin"

CHAPTER_1 = """Der Wind kam aus Nordwest, als Ilka Varn den Hafen von Grauwasser verließ. Sie trug den Mantel ihres Vaters, der ihr zu weit war, und in der Innentasche einen eisernen Schlüssel, so lang wie ihre Hand. Niemand hatte ihr gesagt, welches Schloss er öffnete. Ihr Vater hatte ihn ihr in der Nacht vor seinem Verschwinden gegeben und nur gesagt: Lass ihn nicht bei dir, wenn sie kommen.

Tomas Rehl wartete am Ende des Stegs. Der Hafenmeister war älter als ihr Vater, ein breiter Mann mit einer Stimme, die über jedes Wetter trug. Er nickte ihr zu, ohne zu fragen, wohin sie wollte. Zusammen gingen sie über das Watt nach Norden, wo der alte Leuchtturm auf seiner Sandbank stand, seit Jahren ohne Licht.

Der Weg war länger, als Ilka ihn in Erinnerung hatte. Der Schlick zog an den Stiefeln, und zweimal mussten sie stehen bleiben, weil Priele sich mit der auflaufenden Flut füllten. Tomas sprach wenig. Einmal zeigte er auf eine Reihe dunkler Pfähle im Süden und sagte, dort hätten früher die Salzpfannen gestanden, bevor der Vogt sie hatte schleifen lassen. Ilka kannte die Geschichte. Jeder in Grauwasser kannte sie, und niemand erzählte sie laut.

Auf halber Strecke kam ihnen ein Krabbenfischer mit seinem Karren entgegen, den ein struppiges Pony durch den Schlick zog. Er grüßte Tomas mit Namen und sah Ilka neugierig an, fragte aber nichts. Als er vorbei war, sagte Tomas, der Mann rede zu viel in den Schenken, und sie sollten sich beeilen. Ilka drehte sich noch einmal um. Der Karren war schon nur noch ein dunkler Fleck vor dem hellen Wasser, und über ihm kreisten Möwen, die auf den Fang warteten.

Als sie den Leuchtturm erreichten, stand die Sonne schon tief. Die Tür hing schief in den Angeln. Innen roch es nach Tang und kaltem Stein. Eine Wendeltreppe führte nach oben, und Ilka zählte die Stufen, ohne es zu wollen.

Auf der dritten Stufe blieb sie stehen. Der Stein wackelte. Sie kniete sich hin, hob ihn mit beiden Händen an und fand darunter einen Hohlraum, trocken und gerade groß genug. Sie legte den eisernen Schlüssel hinein, in ein Stück Wachstuch gewickelt, und setzte den Stein zurück. Tomas sah ihr dabei zu und sagte nichts.

Auf dem Rückweg verlor Tomas im Schlick seinen linken Stiefel. Er fluchte, lachte dann und ging barfuß weiter. Am Rand des Watts blieb er stehen. Wenn etwas geschieht, sagte er, treffen wir uns an der Mühle am Graben, in der Nacht des nächsten Neumonds. Nicht vorher, nicht im Hafen. Ilka versprach es. Dann trennten sich ihre Wege, und sie ging allein zurück nach Grauwasser, wo in den Fenstern schon die Lampen brannten.
"""

CHAPTER_2 = """Drei Tage später kamen die Männer des Vogts. Ilka hörte sie, bevor sie sie sah: Stiefel auf dem Kopfsteinpflaster, das Klirren von Beschlägen, eine Stimme, die Namen rief. Sie stand am Fenster ihrer Kammer über der Netzmacherei und sah, wie sie an jede Tür klopften.

Sie durchsuchten das Haus ihres Vaters zuerst. Ilka sah von oben zu, wie sie Truhen auf die Gasse trugen und ausleerten, wie sie Papiere in den Wind warfen, wie einer von ihnen die Netze ihres Vaters mit dem Messer zerschnitt, ohne dass jemand ihn darum gebeten hätte. Dann kamen sie zu ihr. Der Hauptmann war jung und höflich, und er fragte nach einem Schlüssel. Ilka sagte, sie wisse von keinem Schlüssel. Er sah sie lange an, dann ließ er die Kammer durchsuchen und fand nichts.

Am Abend saß sie lange im Dunkeln. Sie dachte an das Versteck und daran, dass sie niemandem außer Tomas vertrauen durfte. Sie dachte auch an ihren Vater, von dem es seit neun Tagen kein Zeichen gab, und an die Frage, ob er noch lebte.

Später ging sie hinunter in die Netzmacherei. Die Werkbänke standen so, wie ihr Vater sie verlassen hatte: Garnrollen in ihren Fächern, die hölzernen Nadeln in einer Reihe, ein halb fertiges Stellnetz über dem Bock. Sie strich über die Knoten und erkannte seine Hand darin, die engen, gleichmäßigen Maschen, die er ihr als Kind beigebracht hatte. Draußen zog der Wachtposten des Vogts zweimal an der Tür vorbei. Beim zweiten Mal blieb er stehen, rüttelte an der Klinke und ging weiter. Ilka löschte die Lampe und wartete, bis seine Schritte in der Gasse verklungen waren, dann stieg sie wieder hinauf in ihre Kammer.

Kurz vor Mitternacht klopfte es leise an die Hintertür. Es war nicht der Vogt. Es war Marit, Ilkas jüngere Schwester, die seit dem Frühjahr bei der Tante in Tolm gelebt hatte. Sie war zu Fuß über die Deichstraße gekommen, zwei Tage lang, und sie glühte vor Fieber. Ilka legte sie in ihr eigenes Bett, kühlte ihr die Stirn mit Salzwasser und saß bis zum Morgen neben ihr. Im Fieber sagte Marit immer wieder denselben Satz: Die Tante hat den Brief verbrannt. Als es hell wurde, schlief sie endlich, und Ilka wusste nicht, was der Satz bedeutete.
"""

STORM = (
    "Der Sturm hielt Grauwasser zwei Tage lang fest. Das Wasser stieg über die Kaimauer, "
    "die Boote schlugen gegeneinander, und in den Gassen roch es nach Salz und nassem Holz. "
    "Die Leute blieben in den Häusern, und wer hinausmusste, ging gebückt an den Wänden "
    "entlang. Ilka verbrachte die Stunden am Fenster und beobachtete die Gasse, auf der sich "
    "nichts bewegte außer dem Wasser, das in Rinnen zum Hafen lief."
)
CHAPTER_3_END = (
    "Am dritten Morgen legte sich der Wind. Ilka zog den Mantel ihres Vaters an und trat auf "
    "die Gasse. Die Luft war klar und kalt, und über dem Watt lag ein heller Streifen Licht."
)
# Lang genug, dass die letzten Seiten des Kontexts nur aus Kapitel 3 bestehen.
CHAPTER_3 = "\n\n".join([STORM] * 300 + [CHAPTER_3_END])

INSTRUCTIONS = {
    "w1-versteck": "Ilka geht zu dem Versteck, das sie in Kapitel 1 angelegt hat, und holt, "
    "was sie dort verborgen hat. Ca. 200 Wörter.",
    "w2-verabredung": "Ilka denkt an die Verabredung, die sie getroffen hat, und daran, wann "
    "und wo sie gilt. Ca. 200 Wörter.",
    "w3-kranke": "Ilka kehrt in ihre Kammer zurück und kümmert sich um die Kranke, die dort "
    "liegt. Ca. 200 Wörter.",
}


def load(data: Path) -> tuple[CanonService, ManuscriptService, ContextBuilder]:
    store = DocumentStore(data)
    canon, manuscripts = CanonService(store), ManuscriptService(store)
    canon.create_world("Die Salzmark", "Eine Küste aus Watt, Salzpfannen und Hafenstädten.")
    canon.create_entry(WORLD, "figur", "Ilka Varn", body="Tochter eines Netzmachers, 19.")
    canon.create_entry(WORLD, "figur", "Tomas Rehl", body="Hafenmeister von Grauwasser.")
    canon.create_entry(WORLD, "ort", "Grauwasser", body="Hafenstadt am Watt.")
    manuscripts.create_story(WORLD, "Die Salzwächterin", "roman")
    manuscripts.save_chapter(WORLD, STORY, 1, title="Der Schlüssel", text=CHAPTER_1)
    manuscripts.save_chapter(WORLD, STORY, 2, title="Die Männer des Vogts", text=CHAPTER_2)
    manuscripts.save_chapter(WORLD, STORY, 3, title="Sturm", text=CHAPTER_3)
    return canon, manuscripts, ContextBuilder(canon, manuscripts)


async def write(
    provider: OpenRouterProvider,
    canon: CanonService,
    builder: ContextBuilder,
    name: str,
    instruction: str,
) -> float:
    prepared = prepare_request(canon, builder, WriteOrder(WORLD, STORY, 3, instruction))
    built = builder.build(WORLD, STORY, 3, instruction)
    text, cost = "", 0.0
    async for event in provider.stream(prepared.completion):
        if isinstance(event, Completed):
            cost = event.usage.cost_usd or 0.0
        else:
            text += event.text
    (OUT / f"{name}.txt").write_text(text.strip() + "\n", encoding="utf-8")
    protocol = {
        "instruction": instruction,
        "blocks": sorted({f"{b.kind}: {b.label}" for b in built.blocks if b.kind != "auffuellung"}),
        "estimated_tokens": prepared.estimated_tokens,
        "cost_usd": cost,
    }
    (OUT / f"{name}.json").write_text(
        json.dumps(protocol, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(name, protocol["blocks"], f"{cost:.4f} $")
    return cost


async def main() -> None:
    OUT.mkdir(exist_ok=True)
    provider = OpenRouterProvider.from_environment()
    with tempfile.TemporaryDirectory() as data:
        canon, manuscripts, builder = load(Path(data))
        summaries: dict[str, object] = {}
        for number in (1, 2):
            outcome = await summarize_chapter(manuscripts, builder, provider, WORLD, STORY, number)
            summaries[f"kapitel_{number}"] = {
                "kurzfassung": outcome.chapter.summary,
                "woerter": len(outcome.chapter.summary.split()),
                "fehler": None if outcome.failure is None else vars(outcome.failure),
            }
            summaries[f"gesamt_nach_{number}"] = {
                "text": outcome.story.summary,
                "woerter": len(outcome.story.summary.split()),
            }
        (OUT / "kurzfassungen.json").write_text(
            json.dumps(summaries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        total = 0.0
        for name, instruction in INSTRUCTIONS.items():
            total += await write(provider, canon, builder, f"mit-{name}", instruction)
        if "nur-mit" in sys.argv:
            await provider.aclose()
            print(f"Kosten der drei Fortsetzungen: {total:.3f} $")
            return
        for number in (1, 2):
            manuscripts.set_chapter_summary(WORLD, STORY, number, "", "fehlt")
        manuscripts.set_story_summary(WORLD, STORY, "")
        for name, instruction in INSTRUCTIONS.items():
            total += await write(provider, canon, builder, f"ohne-{name}", instruction)
    await provider.aclose()
    print(f"Kosten der sechs Fortsetzungen: {total:.3f} $ (Kurzfassungen nicht mitgezählt)")


if __name__ == "__main__":
    asyncio.run(main())

"""Probeschreiben zu 5.15 und 5.8: Schreiben an einer frühen Stelle einer fertigen Geschichte.

Befund des Eigentümers (2026-10-08): In einer importierten Welt, deren Geschichte schon viel
weiter ist, schreibt die KI über die Eingabe hinaus stark verkürzt bis zum bekannten Ende, und
nach sechs, sieben übernommenen Vorschlägen beginnt jeder Abschnitt mit derselben Einleitung und
endet mit derselben Atmosphäre.

Aufbau: Testwelt „Die Salzmark“ wie in 3.2/3.3. Die Geschichte gilt als fertig: Die
Gesamtzusammenfassung reicht bis zum (erfundenen) Ende in Kapitel 12, die Zeitlinie nennt die
späteren Ereignisse, Kapitel 2-4 liegen vollständig vor. Geschrieben wird in Kapitel 1 („Das
Nasse Grab“), abgeschnitten nach „Also holten wir Pell.“. Sieben Anweisungen des Autors
nacheinander über ``prepare_request`` (wie die Oberfläche); jeder Vorschlag wird übernommen und
ans Kapitel gehängt.

Aufruf: VARIANTE=NAME [MODELL=x-ai/grok-4.6] [LAENGE=kurz|mittel|lang] uv run python spikes/vorgriff-zeitlinie/probe.py
Den Rahmen liefert der installierte Code (für den Stand von ``main``: ``PYTHONPATH`` auf das
``src`` eines Worktrees von ``main``). Der Schlüssel kommt aus OPENROUTER_API_KEY.
"""

import asyncio
import importlib.util
import json
import os
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
WORLD = "die-salzmark"
STORY = "das-salz-der-toten"
TIMELINE = "zeitlinie-der-salzmark"
GROTTE = ROOT.parent / "probeschreiben" / "ergebnisse" / "kapitel-4.txt"
CUT_AFTER = "Also holten wir Pell."

SUMMARY = """Spätherbst 412 n. d. F. Ilka Varn, eine ungenehmigte Salzbinderin aus Kerrow, will den \
Vogt Anselm Drach stürzen, der ihre Mutter Hedda 401 ertränken ließ. Zusammen mit dem entlassenen \
Zöllner Tomas Rehl sucht sie das „schwarze Buch“, in dem Drachs Schreiber Fenn Asch den \
unterschlagenen Salzzoll verzeichnet. Die Ratsherrin Ysolde Marr in Tolm sagt eine Prüfung Drachs \
zu, sobald das Buch vorliegt. Zurück in Kerrow lassen sie den Hafenjungen Pell fünf Nächte die \
Wachen am Vogtshaus zählen; Gunda warnt Ilka vor Fenn Asch. Gegen Tomas' Rat brechen sie ins \
Vogtshaus ein, finden das Buch aber nicht mehr; bei der Flucht verliert Tomas seine Armbrust. Pell \
erfährt, dass Asch das Buch in den Aschturm gebracht hat. In der Grotte unter dem Turm schwören \
Ilka und Tomas der blinden Äbtissin Sera den Salzeid und finden das Buch zwischen den \
Totenbüchern; Drach kommt mit Wachen dazu, Sera verweigert ihm das Buch. Mit Hilfe der Novizin \
Mai fliehen Ilka und Tomas mit dem Buch über die 312 Stufen und segeln auf Lunds „Möwenschrei“ \
nach Tolm; Tomas wird dabei von einem Armbrustbolzen an der Schulter getroffen. Vor dem Salzrat \
erklärt Drach das Buch für eine Fälschung. Ilka bindet vor dem Rat das Siegel des Vogts, das \
daraufhin nur noch auf echtes Pergament seiner Kanzlei reagiert, und beweist so die Echtheit – \
sie verliert dabei die Erinnerung an die Stimme ihrer Mutter. Marr setzt Drach ab; er flieht nach \
Vell. Zur Mittwinterglocke kehrt er heimlich nach Kerrow zurück, um Ilka im Hafenbecken zu \
ertränken, und ertrinkt selbst, als Ilka das Tau bindet, an dem er sie hinabziehen will. Ilka \
bleibt in Kerrow und bindet fortan mit Genehmigung des Rats; Tomas wird 413 wieder Zöllner."""

LATER_EVENTS = """
- **412, Spätherbst:** Einbruch ins Vogtshaus; das schwarze Buch wird in der Grotte unter dem \
Aschturm gefunden.
- **412, Winteranfang:** Prüfung vor dem Salzrat in Tolm; Drach wird als Vogt abgesetzt und \
flieht nach Vell.
- **412, Mittwinter:** Anselm Drach ertrinkt im Hafenbecken von Kerrow.
- **413:** Tomas Rehl wird wieder Zöllner; Ilka Varn erhält die Genehmigung des Salzrats."""

INSTRUCTIONS = [
    "Pell kommt am nächsten Morgen in Tomas' Kammer. Tomas erklärt ihm, dass er fünf Nächte die "
    "Wachen am Vogtshaus zählen soll. Pell fragt nach dem Lohn.",
    "Ich biete Pell eine Silberschale pro Nacht. Pell fragt, was passiert, wenn sie ihn "
    "erwischen; ich sage ihm, dann sei er eben ein Junge, der hinter Fässern schläft.",
    "Die nächsten Tage schleppe ich Salz für einen Händler aus der Oberstadt, um nicht "
    "aufzufallen. Am dritten Abend kommt Gunda zu mir in die Kammer herauf.",
    "Gunda warnt mich vor Fenn Asch: Er stottert, wenn er lügt, und er stottert viel. Sie sagt, "
    "Asch habe gestern gefragt, ob die Varn wieder in der Stadt ist.",
    "",
    "Nach der fünften Nacht kommt Pell mit seinem Bericht: vier Männer in der Wachstube, "
    "Wachwechsel zur zweiten Glocke nach Mitternacht, und einmal ist Asch nachts mit einem "
    "Bündel aus dem Haus gegangen.",
    "Ich schlage vor, in zwei Nächten einzubrechen und die Riegel der Wachstube zu binden. Tomas "
    "will lieber Marr eine Nachricht schicken. Wir streiten.",
]


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
    timeline = canon.get_entry(WORLD, TIMELINE)
    canon.update_entry(WORLD, TIMELINE, body=timeline.body.rstrip() + LATER_EVENTS)
    manuscripts.set_story_summary(WORLD, STORY, SUMMARY)
    grotte = GROTTE.read_text(encoding="utf-8").split("\n\n", 1)[1].strip()
    manuscripts.save_chapter(WORLD, STORY, 4, title="07-die-grotte", text=grotte)
    first = manuscripts.get_chapter(WORLD, STORY, 1).text
    start = first[: first.index(CUT_AFTER) + len(CUT_AFTER)]
    manuscripts.save_chapter(WORLD, STORY, 1, title="04-das-nasse-grab", text=start)
    return canon, manuscripts, ContextBuilder(canon, manuscripts)


def accepted(answer: str) -> str:
    """The text as „Übernehmen“ adds it: without the AI's note line (step 4.14)."""
    lines = answer.strip().splitlines()
    if lines and lines[0].startswith("HINWEIS:"):
        lines = lines[1:]
    return "\n".join(lines).strip()


async def main() -> None:
    variant = os.environ["VARIANTE"]
    model = os.environ.get("MODELL", "x-ai/grok-4.6")
    # Length of the proposals (step 5.15); unset for code without the setting.
    extra = {"length": os.environ["LAENGE"]} if "LAENGE" in os.environ else {}
    out = ROOT / "ergebnisse" / variant
    out.mkdir(parents=True, exist_ok=True)
    provider = OpenRouterProvider(os.environ["OPENROUTER_API_KEY"])
    try:
        with tempfile.TemporaryDirectory() as tmp:
            canon, manuscripts, builder = setup(Path(tmp))
            for step, instruction in enumerate(INSTRUCTIONS, start=1):
                order = WriteOrder(WORLD, STORY, 1, instruction=instruction, model=model, **extra)
                prepared = prepare_request(canon, manuscripts, builder, order)
                started = time.monotonic()
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
                        # Same as „Neu schreiben“ after an error in the interface.
                        print(step, "Versuch", attempt + 1, "Fehler:", error, flush=True)
                (out / f"{step:02d}.txt").write_text(answer, encoding="utf-8")
                chapter = manuscripts.get_chapter(WORLD, STORY, 1)
                text = f"{chapter.text.rstrip()}\n\n{accepted(answer)}"
                manuscripts.save_chapter(WORLD, STORY, 1, title=chapter.title, text=text)
                meta = {
                    "variante": variant,
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
                (out / f"{step:02d}.json").write_text(
                    json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
                )
                print(step, meta["woerter"], meta["sekunden"], meta["kosten_usd"], flush=True)
            final = manuscripts.get_chapter(WORLD, STORY, 1).text
            (out / "kapitel-1.txt").write_text(final + "\n", encoding="utf-8")
    finally:
        await provider.aclose()


if __name__ == "__main__":
    asyncio.run(main())

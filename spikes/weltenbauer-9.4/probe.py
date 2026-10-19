"""Probe des Weltenbauers mit echter KI-Antwort zu Beziehungen (Schritt 9.4, ADR-093).

Drei Aufträge in der Salzmark laufen wie in ``spikes/weltenbauer-9.3/probe.py`` (dessen Helfer
werden geladen) über ``prepare_worldbuilder`` ohne Websuche; der Vorschlag wird wie in der
Import-Vorschau mit ``parse_markdown`` zerlegt. Geprüft wird je Antwort:

a) Jede Figur im Block hat ``### Beziehungen``; jede Listenzeile dort nennt genau ein ``@Name``
   (Eintrag der Welt oder des Blocks) – sonst erkennt die Oberfläche keine Beziehung.
b) Beide Seiten: Steht eine Beziehung A → B und ist B im Block, hat B eine Beziehung → A.
c) Vorhandene Figur: Ist sie per ``@`` genannt (Text in der Anfrage), kommt sie überarbeitet mit
   der Gegenseite und ohne Verlust ihres Textes (Länge vorher/nachher, Abgleich von Hand); ist sie
   nicht genannt, fehlt sie im Block und die Antwort nennt sie außerhalb des Blocks.
d) ``parse_markdown`` ergibt genau die Einträge des Blocks; nichts zerfällt.

Aufruf:
    [MODELL=x-ai/grok-4.6] uv run python spikes/weltenbauer-9.4/probe.py
    TROCKEN=1 …   (nur Anfragen bauen)     PRUEFEN=1 …   (gespeicherte Antworten neu prüfen)
Der Schlüssel kommt aus OPENROUTER_API_KEY und wird nur im scharfen Lauf gebraucht.
"""

import asyncio
import importlib.util
import json
import os
import re
import tempfile
import time
from pathlib import Path
from types import ModuleType

from skriptorium.ai_gateway import Completed, GatewayError, OpenRouterProvider
from skriptorium.canon import RELATIONS, CanonService, name_pattern, read_section
from skriptorium.canon.importers.markdown import parse_markdown
from skriptorium.context import ContextBuilder


def _lade_93() -> ModuleType:
    pfad = Path(__file__).parent.parent / "weltenbauer-9.3" / "probe.py"
    spec = importlib.util.spec_from_file_location("probe93", pfad)
    assert spec is not None and spec.loader is not None
    modul = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modul)
    return modul


P93 = _lade_93()
ROOT = Path(__file__).parent

# Kurzname, vorhandene Figur (Name) oder None, ob sie im Block stehen soll, Auftrag des Autors.
AUFTRAEGE: tuple[tuple[str, str | None, bool, str], ...] = (
    (
        "paar",
        None,
        False,
        "Entwirf ein Ehepaar aus @Kerrow: eine Netzflickerin und ihren Mann, der als Träger im "
        "Hafen arbeitet. Gib mir beide als Einträge zur Übernahme.",
    ),
    (
        "lehrling",
        "Tomas Rehl",
        True,
        "Entwirf einen jungen Lehrling, dem @Tomas Rehl im Hafen das Rudern beibringt. Gib mir "
        "ihn als Eintrag zur Übernahme, und die Beziehung soll auch bei Tomas stehen.",
    ),
    (
        "freundin",
        "Ilka Varn",
        False,
        "Entwirf eine alte Freundin von Ilka Varn aus Tolm, die heute in @Kerrow lebt. Gib sie "
        "mir als Eintrag zur Übernahme.",
    ),
)
_LISTE = re.compile(r"^\s*(?:[-*]|\d+[.)])\s+(.*)$")


def beziehungen(body: str, namen: dict[str, str]) -> tuple[list[tuple[str, str]], list[str]]:
    """Beziehungen (Ziel, Zeile) des Abschnitts; zweiter Wert: Listenzeilen ohne genau ein Ziel.

    Wie ``relationsOf`` in ``ui/src/relations.ts``; ``namen`` bildet Name und Aliasse
    (kleingeschrieben) auf den Namen des Eintrags ab.
    """
    abschnitt = read_section(body, RELATIONS)
    if abschnitt is None:
        return [], []
    muster = name_pattern(namen, mention=True)
    gefunden, auffaellig = [], []
    for zeile in abschnitt.split("\n"):
        treffer = _LISTE.match(zeile)
        if treffer is None:
            continue
        ziele = [namen[m.group("label").casefold()] for m in muster.finditer(treffer.group(1))]
        if len(ziele) == 1:
            gefunden.append((ziele[0], treffer.group(1).strip()))
        else:
            auffaellig.append(treffer.group(1).strip())
    return gefunden, auffaellig


def bericht(ausgabe: Path, canon: CanonService, world: str) -> str:
    vorhanden = {e.name: e for e in canon.list_entries(world)}
    zeilen = [
        "| Auftrag | Figuren im Block | (a) Beziehungen je Zeile | (b) beide Seiten | "
        "(c) vorhandene Figur | (d) Import | Ende | Kosten ($) |",
        "|---|---|---|---|---|---|---|---|",
    ]
    details = []
    for kurz, figur, im_block, auftrag in AUFTRAEGE:
        antwort = (ausgabe / f"{kurz}.txt").read_text(encoding="utf-8")
        meta = json.loads((ausgabe / f"{kurz}.json").read_text(encoding="utf-8"))
        block = P93.letzter_kanon_block(antwort)
        if block is None:
            zeilen.append(f"| {kurz} | **kein Block** | – | – | – | – | – | – |")
            continue
        block, _ = P93.mit_import_ebenen(block)
        parsed = parse_markdown(block)
        figuren = [e for e in parsed.entries if e.category == "figur"]
        namen = {
            label.casefold(): e.name
            for e in [*vorhanden.values(), *parsed.entries]
            for label in (e.name, *e.aliases)
        }
        a_befunde, kanten = [], set()
        for e in figuren:
            if read_section(e.body, RELATIONS) is None:
                a_befunde.append(f"{e.name}: kein Abschnitt")
            gef, auff = beziehungen(e.body, namen)
            a_befunde += [f"{e.name}: „{z}“" for z in auff]
            kanten |= {(e.name, ziel) for ziel, _ in gef}
            details.append(f"- **{e.name}** ({kurz}): " + "; ".join(z for _, z in gef))
        im = {e.name for e in parsed.entries}
        b_befunde = [f"{a} → {b} ohne Gegenseite" for a, b in kanten if b in im and (b, a) not in kanten]
        c = "–"
        if figur is not None:
            draussen = antwort.replace(block, "")
            if im_block:
                neu = next((e for e in parsed.entries if e.name == figur), None)
                alt = len(vorhanden[figur].body)
                c = (
                    "**fehlt im Block**"
                    if neu is None
                    else f"überarbeitet, {alt} → {len(neu.body)} Zeichen, "
                    + ("Gegenseite ja" if any(a == figur for a, _ in kanten) else "**ohne Gegenseite**")
                )
            else:
                genannt = figur.split()[0] in draussen
                c = ("**im Block**" if figur in im else "nicht im Block") + (
                    ", im Gespräch genannt" if genannt else ", **im Gespräch nicht genannt**"
                )
        d = P93.pruefe_import(P93.gliederung(block)[0], parsed)
        zeilen.append(
            f"| {kurz} | {', '.join(e.name for e in figuren) or '–'} | "
            f"{'ja' if not a_befunde else '**nein**: ' + '; '.join(a_befunde)} | "
            f"{'ja' if not b_befunde else '**nein**: ' + '; '.join(b_befunde)} | {c} | "
            f"{'ganz' if not d else '**zerfällt**'} | {meta.get('finish_reason')} | "
            f"{meta.get('kosten_usd')} |"
        )
    text = (
        "# Prüfung der Weltenbauer-Antworten (9.4)\n\nErzeugt von `probe.py`.\n\n"
        + "\n".join(zeilen)
        + "\n\n## Beziehungen je Figur\n\n"
        + "\n".join(details)
        + "\n"
    )
    (ausgabe / "pruefung.md").write_text(text, encoding="utf-8")
    return text


async def lauf(canon: CanonService, builder: ContextBuilder, world: str, model: str, ausgabe: Path) -> float:
    provider = OpenRouterProvider(os.environ["OPENROUTER_API_KEY"])
    gesamt = 0.0
    try:
        for kurz, _, _, auftrag in AUFTRAEGE:
            prepared = P93.anfrage(canon, builder, world, model, auftrag)
            (ausgabe / f"{kurz}-anfrage.txt").write_text(
                prepared.completion.messages[0].content + "\n", encoding="utf-8"
            )
            started = time.monotonic()
            antwort, usage, finish = "", None, None
            for versuch in range(3):
                antwort, usage, finish = "", None, None
                try:
                    async for event in provider.stream(prepared.completion):
                        if isinstance(event, Completed):
                            usage, finish = event.usage, event.finish_reason
                        else:
                            antwort += event.text
                    break
                except GatewayError as error:
                    print(kurz, "Versuch", versuch + 1, "Fehler:", error, flush=True)
            (ausgabe / f"{kurz}.txt").write_text(antwort, encoding="utf-8")
            meta = {
                "auftrag": auftrag,
                "verweise": list(P93.verweise(canon, world, auftrag)),
                "modell": model,
                "geschaetzte_token": prepared.estimated_tokens,
                "sekunden": round(time.monotonic() - started, 1),
                "token_ein": usage.input_tokens if usage else None,
                "token_aus": usage.output_tokens if usage else None,
                "kosten_usd": usage.cost_usd if usage else None,
                "finish_reason": finish,
            }
            gesamt += (usage.cost_usd or 0.0) if usage else 0.0
            (ausgabe / f"{kurz}.json").write_text(
                json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )
            print(kurz, meta["sekunden"], "s", meta["kosten_usd"], "$", finish, flush=True)
    finally:
        await provider.aclose()
    return gesamt


def main() -> None:
    model = os.environ.get("MODELL", "x-ai/grok-4.6")
    ausgabe = Path(os.environ.get("AUSGABE", ROOT / "ergebnisse"))
    with tempfile.TemporaryDirectory() as tmp:
        canon, builder, world = P93.lade_salzmark(Path(tmp))
        if os.environ.get("TROCKEN"):
            for kurz, _, _, auftrag in AUFTRAEGE:
                prepared = P93.anfrage(canon, builder, world, model, auftrag)
                print(kurz, prepared.estimated_tokens, "Token,", P93.verweise(canon, world, auftrag))
            return
        if not os.environ.get("PRUEFEN"):
            ausgabe.mkdir(parents=True, exist_ok=True)
            gesamt = asyncio.run(lauf(canon, builder, world, model, ausgabe))
            print(f"Kosten gesamt: {gesamt:.4f} $", flush=True)
        print(bericht(ausgabe, canon, world))


if __name__ == "__main__":
    main()

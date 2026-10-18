"""Probe des Weltenbauers mit echter KI-Antwort (Schritt 9.3, ADR-092).

Vier Aufträge in der Salzmark – je eine neue Figur, ein Ort, ein Gegenstand und eine Kultur –
laufen über ``prepare_worldbuilder`` wie ``POST /api/worlds/{id}/worldbuilder`` (ohne Websuche).
Der Vorschlag wird wie in ``ui/src/kanonBlock.ts`` aus der Antwort geholt (letzter
```kanon-Block, Ebenen-Korrektur bei Gruppen auf ``##``) und mit ``parse_markdown`` zerlegt wie in
der Import-Vorschau. Geprüft wird je Antwort:

a) Jeder Eintrag gliedert sich in die Abschnitte seiner Art in der Reihenfolge von ``SECTIONS``
   (``canon/sections.py``), Ebene 3 unter dem Namen.
b) Kein leerer Abschnitt und kein Füllwerk („unbekannt“, „nichts bekannt“ …); fehlende Abschnitte
   werden nur aufgezählt (Weglassen ist erwünscht, wenn nichts bekannt ist).
c) Widersprüche zum Kanon – Bewertung von Hand; das Werkzeug legt den Rahmen der Anfrage ab.
d) ``parse_markdown`` ergibt genau die Einträge des Blocks mit ihrer Art; kein Abschnitt wird
   ein eigener Eintrag, nichts bleibt liegen.

Aufruf:
    [MODELL=x-ai/grok-4.6] uv run python spikes/weltenbauer-9.3/probe.py
    TROCKEN=1 uv run python spikes/weltenbauer-9.3/probe.py   (nur Anfragen bauen, kein Aufruf)
    PRUEFEN=1 uv run python spikes/weltenbauer-9.3/probe.py   (gespeicherte Antworten neu prüfen)
``AUSGABE`` ändert das Ergebnisverzeichnis (Standard ``ergebnisse/`` neben diesem Skript). Der
Schlüssel kommt aus OPENROUTER_API_KEY und wird nur im scharfen Lauf gebraucht.
"""

import asyncio
import json
import os
import re
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path

import yaml

from skriptorium.ai_gateway import DEFAULT_MODELS, Completed, GatewayError, OpenRouterProvider
from skriptorium.api.flows.worldbuilder import Turn, WorldOrder, prepare_worldbuilder
from skriptorium.api.flows.writing import PreparedRequest
from skriptorium.canon import CanonService
from skriptorium.canon.categories import Category
from skriptorium.canon.importers.markdown import ParsedMaterial, parse_markdown
from skriptorium.canon.names import name_pattern
from skriptorium.canon.sections import SECTIONS, is_section_name
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

ROOT = Path(__file__).parent
SALZMARK = ROOT.parent / "modell-eignungstest" / "testwelt" / "salzmark"

# Kurzname, erwartete Art, Auftrag des Autors. Jeder Auftrag nennt vorhandene Einträge mit `@`,
# wie der Autor es in der Oberfläche tut; nur so gehen ihre Texte mit (sonst sieht der Weltenbauer
# nur die Namen) und Widersprüche zum Kanon können auffallen: Nordkai und Hafen, Zollhaus und
# Zöllner, Sanduhren statt Federuhren, Totensitte.
AUFTRAEGE: tuple[tuple[str, Category, str], ...] = (
    (
        "figur",
        "figur",
        "Entwirf eine Fischerin aus @Kerrow, die ihr Boot am Nordkai liegen hat. Gib sie mir als "
        "Eintrag zur Übernahme.",
    ),
    (
        "ort",
        "ort",
        "Entwirf das Zollhaus in der Oberstadt von @Kerrow als eigenen Ort; dort arbeitet "
        "@Tomas Rehl. Gib es mir als Eintrag zur Übernahme.",
    ),
    (
        "gegenstand",
        "gegenstand",
        "Entwirf als neuen Gegenstand die Sanduhr, mit der die Hafenwache von @Kerrow ihre "
        "Wachwechsel misst. Gib sie mir als Eintrag zur Übernahme.",
    ),
    (
        "kultur",
        "kultur",
        "Entwirf als neue Kultur die Gemeinschaft der Fischer vom Nordkai in @Kerrow mit ihren "
        "Bräuchen; beachte die @Totensitte. Gib sie mir als Eintrag zur Übernahme.",
    ),
)

# Gruppen-Überschriften des Importformats (wie im Rahmen des Weltenbauers).
GRUPPEN: dict[str, Category] = {
    "figuren": "figur",
    "orte": "ort",
    "gegenstände": "gegenstand",
    "zeitlinie": "zeitlinie",
    "regeln": "regel",
    "kultur": "kultur",
}
# Wie ``GROUPS`` in ``ui/src/kanonBlock.ts``.
_GRUPPE_EBENE_2 = re.compile(r"^## (Figuren|Orte|Gegenstände|Zeitlinie|Regeln|Kultur)\s*$")
_UEBERSCHRIFT = re.compile(r"^(#{1,6})[ \t]+(.*?)[ \t]*$")
# Ganzer Abschnittstext, der nur sagt, dass nichts bekannt ist.
_FUELLWERK = re.compile(
    r"^(unbekannt|nicht bekannt|nichts bekannt|ist nicht bekannt|noch nicht bekannt|"
    r"keine angaben?|keine bekannt|keine|k\. ?a\.|n/a|offen|noch offen|[-–—]+)[.!]?$",
    re.IGNORECASE,
)


@dataclass
class Abschnitt:
    name: str
    zeilen: list[str] = field(default_factory=list)

    @property
    def text(self) -> str:
        return "\n".join(self.zeilen).strip()


@dataclass
class Eintrag:
    name: str
    art: Category | None
    abschnitte: list[Abschnitt] = field(default_factory=list)
    # Überschriften der Ebene 4 bis 6 vor dem ersten Abschnitt (falsche Ebene).
    zu_tief: list[str] = field(default_factory=list)
    # Feste Abschnitte auf Ebene 2 statt 3 (der Import hängt sie an den Eintrag davor).
    auf_namensebene: list[str] = field(default_factory=list)


def lade_salzmark(data: Path) -> tuple[CanonService, ContextBuilder, str]:
    """Die Testwelt aus ``spikes/modell-eignungstest/testwelt/salzmark`` über die echten Dienste."""
    store = DocumentStore(data)
    canon, manuscripts = CanonService(store), ManuscriptService(store)
    text = (SALZMARK / "world.md").read_text(encoding="utf-8")
    world = canon.create_world("Die Salzmark", text.split("---", 2)[-1].strip())
    for path in sorted((SALZMARK / "canon").rglob("*.md")):
        _, header, body = path.read_text(encoding="utf-8").split("---", 2)
        kopf = yaml.safe_load(header)
        canon.create_entry(
            world.id,
            kopf["kategorie"],
            str(kopf["name"]),
            aliases=[str(alias) for alias in kopf.get("aliasse") or []],
            body=body.strip(),
        )
    return canon, ContextBuilder(canon, manuscripts), world.id


def verweise(canon: CanonService, world: str, text: str) -> tuple[str, ...]:
    """Die mit `@` genannten Einträge nach der gemeinsamen Namensregel (wie die Oberfläche)."""
    return tuple(
        entry.id
        for entry in canon.list_entries(world)
        if name_pattern([entry.name, *entry.aliases], mention=True).search(text)
    )


def anfrage(
    canon: CanonService, builder: ContextBuilder, world: str, model: str, auftrag: str
) -> PreparedRequest:
    references = verweise(canon, world, auftrag)
    order = WorldOrder(world, (Turn("user", auftrag),), references, model, web_search=False)
    return prepare_worldbuilder(builder, order, DEFAULT_MODELS)


def letzter_kanon_block(antwort: str) -> str | None:
    """Wie ``lastKanonBlock`` in ``ui/src/kanonBlock.ts``, ohne die Ebenen-Korrektur."""
    zeilen = antwort.split("\n")
    starts = [i for i, zeile in enumerate(zeilen) if zeile.strip() == "```kanon"]
    if not starts:
        return None
    ende = next((i for i in range(starts[-1] + 1, len(zeilen)) if zeilen[i].strip() == "```"), None)
    if ende is None:
        return None
    block = "\n".join(zeilen[starts[-1] + 1 : ende]).strip()
    return block or None


def mit_import_ebenen(block: str) -> tuple[str, bool]:
    """Wie ``withImportLevels`` in ``ui/src/kanonBlock.ts``; zweiter Wert: korrigiert?"""
    zeilen = block.split("\n")
    if any(zeile.startswith("# ") for zeile in zeilen) or not any(
        _GRUPPE_EBENE_2.match(zeile) for zeile in zeilen
    ):
        return block, False
    return "\n".join(z[1:] if re.match(r"^#{2,6} ", z) else z for z in zeilen), True


def gliederung(block: str) -> tuple[list[Eintrag], list[str]]:
    """Einträge des Blocks nach dem Format des Rahmens, unabhängig vom Import gelesen.

    Ebene 1 Gruppe, Ebene 2 Eintrag, Ebene 3 Abschnitt, tiefer gehört zum Abschnitt; ein fester
    Abschnitt der Art auf Ebene 2 wird vermerkt und dem Eintrag davor zugeordnet (wie der Import).
    Zweiter Wert: Auffälligkeiten (unbekannte Gruppe, Überschrift außerhalb eines Eintrags).
    """
    eintraege: list[Eintrag] = []
    befunde: list[str] = []
    art: Category | None = None
    aktuell: Eintrag | None = None
    for zeile in block.split("\n"):
        treffer = _UEBERSCHRIFT.match(zeile)
        if treffer is None:
            if aktuell is not None and aktuell.abschnitte:
                aktuell.abschnitte[-1].zeilen.append(zeile)
            continue
        ebene, titel = len(treffer.group(1)), treffer.group(2)
        if ebene == 1:
            art = GRUPPEN.get(titel.lower())
            aktuell = None
            if art is None:
                befunde.append(f"unbekannte Gruppe „{titel}“")
        elif ebene == 2 and aktuell is not None and is_section_name(titel, art):
            aktuell.abschnitte.append(Abschnitt(titel))
            aktuell.auf_namensebene.append(titel)
        elif ebene == 2:
            aktuell = Eintrag(titel, art)
            eintraege.append(aktuell)
        elif aktuell is None:
            befunde.append(f"Überschrift außerhalb eines Eintrags: {'#' * ebene} {titel}")
        elif ebene == 3:
            aktuell.abschnitte.append(Abschnitt(titel))
        elif aktuell.abschnitte:
            aktuell.abschnitte[-1].zeilen.append(zeile)
        else:
            aktuell.zu_tief.append(f"{'#' * ebene} {titel}")
    return eintraege, befunde


@dataclass
class Pruefung:
    eintrag: Eintrag
    reihenfolge_ok: bool
    unbekannt: list[str]
    fehlend: list[str]
    leer: list[str]
    fuellwerk: list[str]
    kurz: list[str]


def pruefe_eintrag(eintrag: Eintrag) -> Pruefung:
    erwartet = [n.lower() for n in SECTIONS.get(eintrag.art, ())] if eintrag.art else []
    namen = [a.name.lower() for a in eintrag.abschnitte]
    bekannt = [n for n in namen if n in erwartet]
    stellen = [erwartet.index(n) for n in bekannt]
    return Pruefung(
        eintrag=eintrag,
        reihenfolge_ok=stellen == sorted(set(stellen)) and len(bekannt) == len(namen),
        unbekannt=[a.name for a in eintrag.abschnitte if a.name.lower() not in erwartet],
        fehlend=[n for n in SECTIONS.get(eintrag.art, ()) if n.lower() not in namen]
        if eintrag.art
        else [],
        leer=[a.name for a in eintrag.abschnitte if not a.text],
        fuellwerk=[a.name for a in eintrag.abschnitte if a.text and _FUELLWERK.match(a.text)],
        kurz=[a.name for a in eintrag.abschnitte if 0 < len(a.text.split()) < 5],
    )


def pruefe_import(eintraege: list[Eintrag], parsed: ParsedMaterial) -> list[str]:
    """Abweichungen zwischen Block und Import-Vorschau; leer, wenn nichts zerfällt."""
    befunde = []
    erwartet = [(e.name, e.art) for e in eintraege]
    erhalten = [(e.name, e.category) for e in parsed.entries]
    if erwartet != erhalten:
        befunde.append(f"Einträge erwartet {erwartet}, Import ergab {erhalten}")
    for eintrag, geparst in zip(eintraege, parsed.entries, strict=False):
        for abschnitt in eintrag.abschnitte:
            if not re.search(rf"^#+[ \t]+{re.escape(abschnitt.name)}[ \t]*$", geparst.body, re.M):
                befunde.append(f"{eintrag.name}: Abschnitt „{abschnitt.name}“ fehlt im Text")
    if parsed.introduction:
        befunde.append(f"Einleitung statt Eintrag: {parsed.introduction[:80]!r}")
    if parsed.not_taken_over:
        befunde.append(f"nicht übernommen: {list(parsed.not_taken_over)}")
    return befunde


def zelle(werte: list[str]) -> str:
    return ", ".join(werte) if werte else "–"


def bericht(ausgabe: Path) -> str:
    """Prüft alle gespeicherten Antworten und schreibt ``pruefung.md``; gibt den Text zurück."""
    kopf = [
        "| Auftrag | Block | Ebenen korrigiert | Einträge (Art) | (a) Abschnitte in Reihenfolge "
        "| (b) leer / Füllwerk | (d) Import | finish | Kosten $ |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    details: list[str] = []
    for kurz, art, auftrag in AUFTRAEGE:
        pfad = ausgabe / f"{kurz}.md"
        if not pfad.exists():
            kopf.append(f"| {kurz} | keine Antwort gespeichert | | | | | | | |")
            continue
        meta_pfad = ausgabe / f"{kurz}.json"
        meta = json.loads(meta_pfad.read_text(encoding="utf-8")) if meta_pfad.exists() else {}
        roh = letzter_kanon_block(pfad.read_text(encoding="utf-8"))
        if roh is None:
            kopf.append(f"| {kurz} | **fehlt** | | | | | | {meta.get('finish_reason')} | |")
            continue
        block, korrigiert = mit_import_ebenen(roh)
        eintraege, auffaellig = gliederung(block)
        pruefungen = [pruefe_eintrag(e) for e in eintraege]
        import_befunde = pruefe_import(eintraege, parse_markdown(block))
        falsche_art = [e.name for e in eintraege if e.art != art]
        a_ok = (
            all(
                p.reihenfolge_ok and not p.eintrag.zu_tief and not p.eintrag.auf_namensebene
                for p in pruefungen
            )
            and not auffaellig
        )
        leer = [f"{p.eintrag.name}: {n}" for p in pruefungen for n in p.leer]
        fuell = [f"{p.eintrag.name}: {n}" for p in pruefungen for n in p.fuellwerk]
        kopf.append(
            f"| {kurz} | ja | {'ja' if korrigiert else 'nein'} | "
            + zelle([f"{e.name} ({e.art})" for e in eintraege])
            + f" | {'ja' if a_ok else '**nein**'} | "
            + (zelle(leer + fuell) if leer or fuell else "keine")
            + f" | {'ganz' if not import_befunde else '**zerfällt**'} | "
            + f"{meta.get('finish_reason')} | {meta.get('kosten_usd')} |"
        )
        details.append(f"### {kurz}\n\nAuftrag: „{auftrag}“\n")
        if falsche_art:
            details.append(f"- Andere Art als „{art}“: {zelle(falsche_art)}")
        details.extend(f"- Auffällig: {befund}" for befund in auffaellig)
        for p in pruefungen:
            details.append(
                f"- **{p.eintrag.name}** ({p.eintrag.art}): Abschnitte "
                f"{zelle([a.name for a in p.eintrag.abschnitte])}; Reihenfolge "
                f"{'ja' if p.reihenfolge_ok else 'nein'}; unbekannt {zelle(p.unbekannt)}; "
                f"fehlend {zelle(p.fehlend)}; leer {zelle(p.leer)}; Füllwerk {zelle(p.fuellwerk)}; "
                f"unter 5 Wörtern {zelle(p.kurz)}; zu tief {zelle(p.eintrag.zu_tief)}; "
                f"auf Namensebene {zelle(p.eintrag.auf_namensebene)}"
            )
        details.extend(f"- Import: {befund}" for befund in import_befunde)
        details.append("")
    text = (
        "# Prüfung der Weltenbauer-Antworten (9.3)\n\n"
        "Erzeugt von `probe.py`; (c) Widersprüche zum Kanon von Hand im README.\n\n"
        + "\n".join(kopf)
        + "\n\n## Einzelheiten\n\n"
        + "\n".join(details)
    )
    (ausgabe / "pruefung.md").write_text(text, encoding="utf-8")
    return text


async def lauf(
    canon: CanonService, builder: ContextBuilder, world: str, model: str, ausgabe: Path
) -> float:
    provider = OpenRouterProvider(os.environ["OPENROUTER_API_KEY"])
    gesamt = 0.0
    try:
        for kurz, _, auftrag in AUFTRAEGE:
            prepared = anfrage(canon, builder, world, model, auftrag)
            system = prepared.completion.messages[0].content
            (ausgabe / f"{kurz}-anfrage.txt").write_text(system + "\n", encoding="utf-8")
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
                    # Wie „Neu“ nach einem Fehler in der Oberfläche.
                    print(kurz, "Versuch", versuch + 1, "Fehler:", error, flush=True)
            (ausgabe / f"{kurz}.md").write_text(antwort, encoding="utf-8")
            meta = {
                "auftrag": auftrag,
                "verweise": list(verweise(canon, world, auftrag)),
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
    if os.environ.get("PRUEFEN"):
        print(bericht(ausgabe))
        return
    with tempfile.TemporaryDirectory() as tmp:
        canon, builder, world = lade_salzmark(Path(tmp))
        if os.environ.get("TROCKEN"):
            for kurz, _, auftrag in AUFTRAEGE:
                prepared = anfrage(canon, builder, world, model, auftrag)
                messages = prepared.completion.messages
                print(kurz, prepared.estimated_tokens, "Token,", verweise(canon, world, auftrag))
            print(messages[0].content)
            return
        ausgabe.mkdir(parents=True, exist_ok=True)
        gesamt = asyncio.run(lauf(canon, builder, world, model, ausgabe))
    print(f"Kosten gesamt: {gesamt:.4f} $", flush=True)
    print(bericht(ausgabe))


if __name__ == "__main__":
    main()

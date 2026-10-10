"""Technik-Teil von Schritt 5.26: Kommen die Kanon-Einträge vollständig in der Anfrage an?

Ohne Anbieter, ohne Kosten. Baut die Anfragen der Probe-Ketten über ``prepare_request`` wie die
Oberfläche und prüft je Schritt:

- welche Kanon-Einträge im Text der Anfrage stehen und auf welchem Weg (feste Teile: Regeln und
  Zeitlinie; per ``@`` genannt; geführte Figur; Auffüllung am Ende des Budgets; fehlt);
- ob jeder enthaltene Eintrag **vollständig** (Wort für Wort, mit Aliassen) im Text steht;
- wie viele Token Seiten und Auffüllung bekommen.

Das Kapitel wächst wie in einer echten Kette: Vor Schritt n hängen die übernommenen Vorschläge
1 bis n-1 aus einer vorhandenen Kette (Standard: Ausgangsmessung 5.24, „mittel“, Lauf 1).
Zusätzlich ein Belastungsfall: alle Einträge der Welt per ``@`` am längsten Kapitelstand.

Aufruf:
    uv run python spikes/kanon-treue/technik.py [KETTE=spikes/regel-002/ergebnisse/ausgang-mittel]
Ausgabe: Markdown auf stdout.
"""

import os
import re
import sys
import tempfile
from collections.abc import Sequence
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT.parent / "regel-002"))
sys.path.insert(0, str(ROOT))

from geschichten import GESCHICHTEN, Geschichte  # noqa: E402
from proben import ANWEISUNGEN, ANWEISUNGEN_MIT_AT, PROBEN  # noqa: E402

from skriptorium.api.flows.writing import WriteOrder, prepare_request  # noqa: E402
from skriptorium.canon import CanonEntry, InvalidInput  # noqa: E402
from skriptorium.context import estimate_tokens  # noqa: E402
from skriptorium.context.builder import _render  # noqa: E402

MODEL = "x-ai/grok-4.6"


def accepted(answer: str) -> str:
    lines = answer.strip().splitlines()
    if lines and lines[0].startswith("HINWEIS:"):
        lines = lines[1:]
    return "\n".join(lines).strip()


def way(entry: CanonEntry, system: str, referenced: set[str], led: set[str]) -> str:
    """Auf welchem Weg der Eintrag in der Anfrage steht; prüft die Vollständigkeit."""
    text = _render(entry)
    heading = text.split("\n", 1)[0]
    if heading not in system:
        return "fehlt"
    if text not in system:
        return "UNVOLLSTÄNDIG"
    if entry.category in ("regel", "zeitlinie"):
        return "fest"
    if entry.id in referenced:
        return "@"
    if entry.id in led:
        return "geführt"
    # Auffüllung: steht hinter allen festen Teilen.
    return "Auffüllung"


def references(g: Geschichte, instruction: str) -> list[str]:
    """Die Einträge, die ein ``@`` in der Anweisung nennt – Name oder Alias wie ``references.ts``.

    Ohne Rücksicht auf Groß-/Kleinschreibung, mit Genitiv-s (5.23), nicht mitten in einem Wort.
    """
    found: list[str] = []
    for entry in g.canon.list_entries(g.world):
        for name in (entry.name, *entry.aliases):
            pattern = rf"@{re.escape(name)}s?(?!\w)"
            if re.search(pattern, instruction, re.IGNORECASE) and entry.id not in found:
                found.append(entry.id)
    return found


def step_report(g: Geschichte, instruction: str, refs: Sequence[str]) -> tuple[dict[str, str], int]:
    order = WriteOrder(
        g.world, g.story, g.chapter, instruction=instruction, model=MODEL, references=tuple(refs)
    )
    prepared = prepare_request(g.canon, g.manuscripts, g.builder, order)
    system = prepared.completion.messages[0].content
    story = g.manuscripts.get_story(g.world, g.story)
    result = {
        entry.id: way(entry, system, set(refs), set(story.controlled_characters))
        for entry in g.canon.list_entries(g.world)
    }
    return result, prepared.estimated_tokens


def chain_texts(chain: Path, name: str) -> list[str]:
    folder = chain / name / "lauf-1"
    return [accepted((folder / f"{step:02d}.txt").read_text(encoding="utf-8")) for step in range(1, 8)]


def run(name: str, chain: Path) -> None:
    proposals = chain_texts(chain, name)
    probes = PROBEN[name]
    with tempfile.TemporaryDirectory() as tmp:
        g = GESCHICHTEN[name](Path(tmp))
        start = g.manuscripts.get_chapter(g.world, g.story, g.chapter)
        entries = {entry.id: entry for entry in g.canon.list_entries(g.world)}
        print(f"\n## {name}\n")
        print(f"{len(entries)} Einträge; Kapitel {g.chapter} beginnt mit "
              f"{len(start.text.split())} Wörtern.\n")
        print("Proben-Einträge je Schritt – Weg ohne `@` \\| mit `@`:\n")
        ids = sorted({probe["eintrag"] for probe in probes})
        print("| Schritt | Kapitel Wörter | Token ohne @ | fehlen ohne @ \\| mit @ | " + " | ".join(ids) + " |")
        print("|---" * (len(ids) + 4) + "|")
        text = start.text
        for step in range(1, 8):
            g.manuscripts.save_chapter(g.world, g.story, g.chapter, title=start.title, text=text)
            plain = (ANWEISUNGEN[name] or g.instructions)[step - 1]
            with_at = ANWEISUNGEN_MIT_AT[name][step - 1]
            without, tokens = step_report(g, plain, [])
            refs = references(g, with_at)
            withref, _ = step_report(g, with_at, refs)
            cells = [f"{without[i]} \\| {withref[i]}" for i in ids]
            gone = [sum(w == "fehlt" for w in r.values()) for r in (without, withref)]
            print(
                f"| {step} | {len(text.split())} | {tokens} | {gone[0]} \\| {gone[1]} | "
                + " | ".join(cells)
                + " |"
            )
            text = f"{text.rstrip()}\n\n{proposals[step - 1]}"
        # Belastung: alle Einträge per @ am längsten Stand.
        g.manuscripts.save_chapter(g.world, g.story, g.chapter, title=start.title, text=text)
        all_refs = [i for i, e in entries.items() if e.category not in ("regel", "zeitlinie")]
        try:
            loaded, tokens = step_report(g, "Weiter.", all_refs)
            broken = [i for i, w in loaded.items() if w not in ("fest", "@", "geführt")]
            print(f"\nBelastung: alle {len(all_refs)} Einträge per `@`, Kapitel "
                  f"{len(text.split())} Wörter → geschätzt {tokens} Token; nicht vollständig: "
                  f"{broken or 'keiner'}.")
        except InvalidInput as error:
            print(f"\nBelastung: alle Einträge per `@` → abgelehnt: {error}")
        sizes = sorted(((estimate_tokens(_render(e)), i) for i, e in entries.items()), reverse=True)
        print(f"Größte Einträge (Token): {', '.join(f'{i} {t}' for t, i in sizes[:5])}; "
              f"alle zusammen {sum(t for t, _ in sizes)}.")


def main() -> None:
    chain = Path(os.environ.get("KETTE", ROOT.parent / "regel-002" / "ergebnisse" / "ausgang-mittel"))
    print("# Technik-Befund 5.26 – Kanon-Einträge in der Anfrage")
    print("\nWege: fest = Regeln und Zeitlinie (immer); @ = per `@` genannt; geführt = geführte "
          "Figur; Auffüllung = nach den letzten Manuskript-Seiten, nur bei Restbudget; fehlt = nicht "
          "in der Anfrage; UNVOLLSTÄNDIG = Überschrift da, Text nicht wortgleich.")
    for name in GESCHICHTEN:
        run(name, chain)


if __name__ == "__main__":
    main()

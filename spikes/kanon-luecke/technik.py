"""Ohne Anbieter: Welche Proben-Einträge stehen in der Anfrage – mit und ohne Auffüllung?

Baut für beide Testgeschichten die Anfrage des ersten Schritts (Anweisung ohne ``@``, wie in
``spikes/kanon-treue/proben.py``) einmal mit und einmal ohne Auffüllung und meldet je Probe, ob
ihr Eintrag im Text der Anfrage steht und auf welchem Weg.

Aufruf: uv run python spikes/kanon-luecke/technik.py   (Markdown auf stdout)
"""

import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT.parent / "regel-002"))
sys.path.insert(0, str(ROOT.parent / "kanon-treue"))

import skriptorium.context.builder as builder  # noqa: E402
from geschichten import GESCHICHTEN  # noqa: E402
from proben import ANWEISUNGEN, PROBEN  # noqa: E402
from technik import way  # noqa: E402

ORIGINAL = builder._filler_parts


def presence(name: str, with_filler: bool) -> tuple[dict[str, str], int]:
    builder._filler_parts = ORIGINAL if with_filler else (lambda request, remaining: [])  # type: ignore[assignment]
    with tempfile.TemporaryDirectory() as tmp:
        g = GESCHICHTEN[name](Path(tmp))
        instruction = (ANWEISUNGEN[name] or g.instructions)[0]
        built = g.builder.build(g.world, g.story, g.chapter, instruction)
        system = built.messages[0].content
        story = g.manuscripts.get_story(g.world, g.story)
        led = set(story.controlled_characters)
        found = {
            entry.id: way(entry, system, set(), led) for entry in g.canon.list_entries(g.world)
        }
        return found, built.estimated_tokens


def main() -> None:
    print("# Spike 6.13 – Proben-Einträge in der Anfrage (Schritt 1, ohne `@`)\n")
    for name in ("salzmark", "glimmergrund"):
        mit, tok_mit = presence(name, True)
        ohne, tok_ohne = presence(name, False)
        print(f"## {name}\n")
        print(f"Anfrage geschätzt: mit Auffüllung {tok_mit} Token, ohne {tok_ohne} Token.\n")
        print("| Nr. | Eintrag | mit Auffüllung | ohne Auffüllung |\n|---|---|---|---|")
        for number, probe in enumerate(PROBEN[name], start=1):
            entry = probe["eintrag"]
            print(f"| {number} | {entry} | {mit.get(entry, '?')} | {ohne.get(entry, '?')} |")
        if name == "salzmark":
            print()
    builder._filler_parts = ORIGINAL  # type: ignore[assignment]


if __name__ == "__main__":
    main()

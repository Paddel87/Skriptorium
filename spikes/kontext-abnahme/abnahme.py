"""Abnahme von Schritt 3.2 mit echten KI-Läufen (FR-003, FR-004).

Legt die Testwelt „Die Salzmark“ (spikes/modell-eignungstest/testwelt) über die echten
Dienste in einem temporären Datenverzeichnis an, ergänzt den Gegenstand „Runenklinge“,
baut den Kontext mit ContextBuilder und schickt ihn über OpenRouterProvider an grok-4.7.
Texte und Metadaten landen in ergebnisse/. Der Schlüssel kommt aus OPENROUTER_API_KEY.

Aufruf: OPENROUTER_API_KEY=... uv run python spikes/kontext-abnahme/abnahme.py
"""

import asyncio
import json
import sys
import tempfile
from pathlib import Path

import yaml

from skriptorium.ai_gateway import Completed, CompletionRequest, Message, OpenRouterProvider
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

ROOT = Path(__file__).parent
WORLD_DIR = ROOT.parent / "modell-eignungstest" / "testwelt" / "salzmark"
STORY_DIR = WORLD_DIR / "stories" / "das-salz-der-toten"
OUT = ROOT / "ergebnisse"
MODEL = "x-ai/grok-4.7"
WORLD = "die-salzmark"
STORY = "das-salz-der-toten"

RUNENKLINGE = """## Zweck

Durchtrennt Salzbindungen: Ein gebundener Toter, den die Klinge trifft, fällt sofort als
gewöhnlicher Leichnam zusammen. Gegen Lebende ist sie nicht schärfer als ein gewöhnliches Messer.

## Verwendung

Schneidet nur, wenn ihr Träger sie vorher mit eigenem Blut benetzt hat; ohne Blut gleitet sie
ab wie Holz. Nach jedem Schnitt wird sie eiskalt und lässt sich bis zum nächsten Morgen nicht
erneut benutzen.

## Auswirkung

Jeder Schnitt kostet den Träger eine Erinnerung an einen Menschen, den er geliebt hat; er merkt
den Verlust erst später. Die Klinge liegt seit Kapitel 7 bei Tomas Rehl."""

CASES = {
    "fr003-runenklinge": (
        ["runenklinge"],
        "Am Eingang der Grotte steht ein gebundener Toter als Wache. Tomas zieht @Runenklinge, "
        "um ihn zu lösen. Schreib die Szene weiter (ca. 400 Wörter) und ende an einer Stelle, "
        "an der Ilka handeln muss.",
    ),
    "fr004-zeitlinie": (
        [],
        "Während sie in der Grotte warten, erzählt Tomas Ilka, wie er im Salzkrieg am Knie "
        "verwundet wurde und welche Rolle Anselm Drach damals spielte. Schreib die Szene "
        "(ca. 400 Wörter) und ende an einer Stelle, an der Ilka antworten muss.",
    ),
}


def split(path: Path) -> tuple[dict[str, object], str]:
    text = path.read_text(encoding="utf-8")
    _, header, body = text.split("---", 2)
    loaded = yaml.safe_load(header)
    assert isinstance(loaded, dict)
    return loaded, body.strip()


def load_world(data: Path) -> ContextBuilder:
    store = DocumentStore(data)
    canon = CanonService(store)
    manuscripts = ManuscriptService(store)
    world_text = (WORLD_DIR / "world.md").read_text(encoding="utf-8")
    canon.create_world("Die Salzmark", world_text.split("---", 2)[-1].strip())
    for path in sorted((WORLD_DIR / "canon").rglob("*.md")):
        header, body = split(path)
        aliases = header.get("aliasse") or []
        assert isinstance(aliases, list)
        canon.create_entry(
            WORLD,
            str(header["kategorie"]),  # type: ignore[arg-type]
            str(header["name"]),
            aliases=[str(a) for a in aliases],
            body=body,
        )
    canon.create_entry(WORLD, "gegenstand", "Runenklinge", aliases=["die Klinge"], body=RUNENKLINGE)
    story = (STORY_DIR / "story.md").read_text(encoding="utf-8")
    manuscripts.create_story(
        WORLD,
        "Das Salz der Toten",
        "roman",
        perspective="Ich-Erzählerin (Ilka Varn), Präteritum",
        controlled_characters=["ilka-varn"],
    )
    summary = story.split("## Gesamtzusammenfassung", 1)[1].split("## Kapitel-Kurzfassungen")[0]
    manuscripts.set_story_summary(WORLD, STORY, summary.split("\n", 1)[1].strip())
    for number, path in enumerate(sorted((STORY_DIR / "chapters").glob("*.md")), start=1):
        text = path.read_text(encoding="utf-8")
        body = text.split("---", 2)[2].strip() if text.startswith("---") else text
        manuscripts.save_chapter(WORLD, STORY, number, title=path.stem, text=body)
    return ContextBuilder(canon, manuscripts)


async def run(builder: ContextBuilder, case: str, rep: int, provider: OpenRouterProvider) -> None:
    references, instruction = CASES[case]
    chapters = 4
    context = builder.build(WORLD, STORY, chapters, instruction, references)
    request = CompletionRequest(
        model=MODEL,
        messages=[Message(m.role, m.content) for m in context.messages],
        max_tokens=8000,
        temperature=0.8,
    )
    text = ""
    usage = None
    async for event in provider.stream(request):
        if isinstance(event, Completed):
            usage = event.usage
        else:
            text += event.text
    OUT.mkdir(exist_ok=True)
    (OUT / f"{case}__{rep}.txt").write_text(text, encoding="utf-8")
    meta = {
        "modell": MODEL,
        "fall": case,
        "anweisung": instruction,
        "geschaetzt": context.estimated_tokens,
        "bausteine": [[b.kind, b.label, b.tokens] for b in context.blocks],
        "token_ein": usage.input_tokens if usage else None,
        "token_aus": usage.output_tokens if usage else None,
        "kosten_usd": usage.cost_usd if usage else None,
    }
    (OUT / f"{case}__{rep}.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(case, rep, meta["geschaetzt"], meta["token_ein"], meta["kosten_usd"], len(text))


async def main() -> None:
    provider = OpenRouterProvider.from_environment()
    with tempfile.TemporaryDirectory() as tmp:
        builder = load_world(Path(tmp) / "data")
        try:
            for case in CASES:
                for rep in (1, 2):
                    await run(builder, case, rep, provider)
        finally:
            await provider.aclose()


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))

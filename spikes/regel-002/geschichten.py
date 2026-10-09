"""Die zwei Testgeschichten für Probeschreiben nach Regel-002 (ADR-047, Schritt 5.24).

Jede Geschichte wird über die echten Dienste in ein leeres Datenverzeichnis geladen und an ihrer
Schreibstelle abgeschnitten; spätere Kapitel und die Gesamtzusammenfassung bis zum Ende bleiben
stehen (die Geschichte gilt als fertig geplant). Geschrieben wird mit sieben Anweisungen des
Autors, die fünfte leer („Weiter“).

- ``salzmark``: „Das Salz der Toten“, Ich-Erzählerin, karg, Kapitel um 1.800 Wörter – Aufbau wie
  in ``spikes/vorgriff-zeitlinie/probe.py`` (dieselbe Schreibstelle, dieselben Anweisungen).
- ``glimmergrund``: „Kein Stein glimmt umsonst“, dritte Person, warm und dialogreich, Kapitel um
  3.000 Wörter – Testwelt aus ``spikes/modell-eignungstest/testwelt/glimmergrund``.
"""

import ast
import importlib.util
from dataclasses import dataclass
from pathlib import Path
from types import ModuleType

import yaml

from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore

SPIKES = Path(__file__).parent.parent
GLIMMER = SPIKES / "modell-eignungstest" / "testwelt" / "glimmergrund"
GLIMMER_STORY = GLIMMER / "stories" / "kein-stein-glimmt-umsonst"


@dataclass(frozen=True)
class Geschichte:
    """Eine geladene Testgeschichte, bereit für die Kette."""

    name: str
    canon: CanonService
    manuscripts: ManuscriptService
    builder: ContextBuilder
    world: str
    story: str
    chapter: int
    instructions: list[str]
    # Wörter, die ein Ortsmotiv anzeigen (für die Folge gleicher Motive in der Auswertung).
    motive: dict[str, list[str]]


def _module(path: Path, name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def salzmark(data: Path) -> Geschichte:
    """Die Salzmark wie in 5.15/5.22: Kapitel 1 nach „Also holten wir Pell.“ abgeschnitten."""
    probe = _module(SPIKES / "vorgriff-zeitlinie" / "probe.py", "probe")
    canon, manuscripts, builder = probe.setup(data)
    return Geschichte(
        name="salzmark",
        canon=canon,
        manuscripts=manuscripts,
        builder=builder,
        world=probe.WORLD,
        story=probe.STORY,
        chapter=1,
        instructions=list(probe.INSTRUCTIONS),
        motive={
            "Geruch": ["Fisch", "Tran", "Teer", "Salzgeruch", "roch", "stank"],
            "Hafendunst": ["Dunst", "Nebel", "Ritze"],
            "Essen": ["Linsen", "Zwiebel", "Schüssel", "Brot"],
            "Licht": ["Talg", "Kerze", "Laterne", "Salzlicht"],
        },
    )


def _split(path: Path) -> tuple[dict[str, object], str]:
    text = path.read_text(encoding="utf-8")
    _, header, body = text.split("---", 2)
    loaded = yaml.safe_load(header)
    assert isinstance(loaded, dict)
    return loaded, body.strip()


def _instructions() -> tuple[str, list[str]]:
    """Schreibstelle und Anweisungen aus ``anweisungen.md`` (Python-Liste im Codeblock)."""
    text = (GLIMMER_STORY / "anweisungen.md").read_text(encoding="utf-8")
    cut = text.split("Schreibstelle: „", 1)[1].split("“", 1)[0]
    code = text.split("```python", 1)[1].split("```", 1)[0]
    listing = code.split("=", 1)[1]
    instructions = ast.literal_eval(listing.strip())
    assert isinstance(instructions, list) and len(instructions) == 7
    return cut, [str(item) for item in instructions]


def glimmergrund(data: Path) -> Geschichte:
    """Glimmergrund: Kapitel 3 nach der Schreibstelle abgeschnitten, Kapitel 4 bleibt stehen."""
    store = DocumentStore(data)
    canon, manuscripts = CanonService(store), ManuscriptService(store)
    world = canon.create_world("Glimmergrund", _split(GLIMMER / "world.md")[1]).id
    for path in sorted((GLIMMER / "canon").rglob("*.md")):
        header, body = _split(path)
        aliases = header.get("aliasse") or []
        assert isinstance(aliases, list)
        canon.create_entry(
            world,
            str(header["kategorie"]),  # type: ignore[arg-type]
            str(header["name"]),
            aliases=[str(alias) for alias in aliases],
            body=body,
        )
    story = manuscripts.create_story(
        world,
        "Kein Stein glimmt umsonst",
        "roman",
        perspective="Dritte Person, Präteritum, nah an Konstanze Wendt",
        controlled_characters=["konstanze-wendt"],
    ).id
    text = (GLIMMER_STORY / "story.md").read_text(encoding="utf-8")
    summary = text.split("## Gesamtzusammenfassung", 1)[1].split("## Kapitel-Kurzfassungen")[0]
    manuscripts.set_story_summary(world, story, summary.split("\n", 1)[1].strip())
    cut, instructions = _instructions()
    for number, path in enumerate(sorted((GLIMMER_STORY / "chapters").glob("*.md")), start=1):
        header, body = _split(path)
        if number == 3:
            body = body[: body.index(cut) + len(cut)]
        manuscripts.save_chapter(world, story, number, title=str(header["titel"]), text=body)
    return Geschichte(
        name="glimmergrund",
        canon=canon,
        manuscripts=manuscripts,
        builder=ContextBuilder(canon, manuscripts),
        world=world,
        story=story,
        chapter=3,
        instructions=instructions,
        motive={
            "Nässe": ["tropfte", "nass", "Pfütze", "Wasser"],
            "Grubenluft": ["Grubenluft", "Moder", "Schwefel", "roch"],
            "Glimmen": ["glimm", "Glimmstein", "Schimmer"],
            "Kälte": ["kalt", "Kälte", "fröstel"],
        },
    )


GESCHICHTEN = {"salzmark": salzmark, "glimmergrund": glimmergrund}

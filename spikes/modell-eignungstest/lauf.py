"""Modell-Eignungstest (Fahrplan 1.1) – Wegwerf-Code der Erkundungsphase.

Baut die Anfrage für die Testszene nach dem Kontext-Verfahren aus ADR-003
unter einem Token-Budget zusammen, schickt sie per Streaming an OpenRouter
und legt Text und Kennzahlen unter ergebnisse/ ab.

Voraussetzungen: Python 3.11+, nur Standardbibliothek; Umgebungsvariable KEY
(OpenRouter-Schlüssel). Der Schlüssel wird nie ausgegeben.

Aufruf:
    python3 lauf.py groessen                 # Bausteine und Schätzung zeigen
    python3 lauf.py lauf MODELL BUDGET WDH   # ein Lauf
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
WORLD = ROOT / "testwelt" / "salzmark"
STORY = WORLD / "stories" / "das-salz-der-toten"
OUT = ROOT / "ergebnisse"

# Grobe Schätzung für deutsche Prosa; wird gegen prompt_tokens der Anbieter kalibriert.
CHARS_PER_TOKEN = 3.3

REASONING_MANDATORY = {"z-ai/glm-5.3", "x-ai/grok-4.7", "google/gemini-3.8-flash"}

# Einträge der Szene (Vorrang 2 in ADR-003): Figuren der Szene und berührte Orte/Regeln.
SCENE_ENTRIES = [
    "figuren/ilka-varn.md",
    "figuren/tomas-rehl.md",
    "figuren/sera-kolb.md",
    "figuren/schwester-mai.md",
    "orte/aschturm.md",
    "kultur/salzeid.md",
    "kultur/totensitte.md",
    "kultur/stille-schwestern.md",
    "regeln/salzbindung.md",
    "regeln/salzlicht.md",
    "regeln/monde.md",
    "gegenstaende/kerbe.md",
    "gegenstaende/schwarzes-buch.md",
]

PAGES = [  # neueste zuerst; Kapitel 7 (Anfang) ist immer vollständig dabei
    "chapters/06-der-nordkai.md",
    "chapters/05-das-vogtshaus.md",
    "chapters/04-das-nasse-grab.md",
]


def est(text: str) -> int:
    return int(len(text) / CHARS_PER_TOKEN)


def body(path: Path) -> str:
    """Datei ohne YAML-Kopf."""
    text = path.read_text(encoding="utf-8")
    if text.startswith("---"):
        text = text.split("---", 2)[2]
    return text.strip()


def raw(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip()


def build(budget: int) -> tuple[list[dict[str, str]], dict[str, object]]:
    story = raw(STORY / "story.md")
    schreibweise = story.split("## Gesamtzusammenfassung")[0]
    zusammenfassung = "## Gesamtzusammenfassung" + story.split("## Gesamtzusammenfassung")[1]

    system_parts = [
        "Du bist Co-Autor eines Romans in der Welt „Die Salzmark“. Der Kanon unten ist "
        "verbindlich: Widersprich ihm nie. Erfinde nur, was der Kanon offen lässt.",
        raw(WORLD / "world.md"),
        schreibweise,
    ]
    scene = [raw(WORLD / "canon" / e) for e in SCENE_ENTRIES]
    other = sorted(
        str(p.relative_to(WORLD / "canon"))
        for p in (WORLD / "canon").rglob("*.md")
        if str(p.relative_to(WORLD / "canon")) not in SCENE_ENTRIES
    )
    ch7 = body(STORY / "chapters" / "07-die-grotte.md")
    anweisung = raw(STORY / "anweisung-kapitel-7.md")

    fixed = "\n\n".join(system_parts + scene) + zusammenfassung + ch7 + anweisung
    remaining = budget - est(fixed) - 200  # Rahmen und Überschriften

    # Vorrang 4: letzte Manuskript-Seiten wörtlich, von hinten nach vorn, absatzweise.
    pages: list[str] = []
    pages_tokens = 0
    for rel in PAGES:
        paras = body(STORY / rel).split("\n\n")
        taken: list[str] = []
        for para in reversed(paras):
            t = est(para)
            if pages_tokens + t > remaining:
                break
            taken.insert(0, para)
            pages_tokens += t
        if taken:
            pages.insert(0, "\n\n".join(taken))
        if len(taken) < len(paras):
            break
    remaining -= pages_tokens

    # Rest des Budgets: übrige Kanon-Einträge (Füllmaterial wie in einer echten Welt).
    extra: list[str] = []
    for rel in other:
        text = raw(WORLD / "canon" / rel)
        if est(text) <= remaining:
            extra.append(text)
            remaining -= est(text)

    system = "\n\n".join(system_parts) + "\n\n# Kanon (Auszug)\n\n" + "\n\n".join(scene + extra)
    user = (
        "# Handlungsstand\n\n"
        + zusammenfassung
        + "\n\n# Letzte Manuskript-Seiten (wörtlich)\n\n"
        + "\n\n".join(pages)
        + "\n\n"
        + ch7
        + "\n\n# Anweisung\n\n"
        + anweisung
    )
    info = {
        "budget": budget,
        "geschaetzt_gesamt": est(system) + est(user),
        "geschaetzt_seiten": pages_tokens,
        "kanon_eintraege": len(scene) + len(extra),
        "kanon_zusatz": len(extra),
    }
    return [{"role": "system", "content": system}, {"role": "user", "content": user}], info


def run(model: str, budget: int, rep: int) -> None:
    messages, info = build(budget)
    # Denken aus, wo das Modell es erlaubt; sonst niedrigste Stufe (Befund 2026-09-26:
    # glm-5.3, grok-4.7 und gemini-3.8-flash verlangen Reasoning zwingend).
    reasoning: dict[str, object] = (
        {"effort": "low"} if model in REASONING_MANDATORY else {"enabled": False}
    )
    key = os.environ.get("KEY")
    if not key:
        sys.exit("Umgebungsvariable KEY fehlt")
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "temperature": 0.8,
        "max_tokens": 8000,
        "usage": {"include": True},
        "reasoning": reasoning,
    }
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "X-Title": "Skriptorium Modell-Eignungstest",
        },
    )
    start = time.monotonic()
    first: float | None = None
    text: list[str] = []
    usage: dict[str, object] = {}
    finish = None
    provider = None
    error = None
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            for line in resp:
                line = line.decode("utf-8").strip()
                if not line.startswith("data: "):
                    continue
                data = line[6:]
                if data == "[DONE]":
                    break
                chunk = json.loads(data)
                if "error" in chunk:
                    error = chunk["error"]
                    break
                provider = chunk.get("provider", provider)
                for choice in chunk.get("choices", []):
                    piece = (choice.get("delta") or {}).get("content")
                    if piece:
                        if first is None:
                            first = time.monotonic() - start
                        text.append(piece)
                    if choice.get("finish_reason"):
                        finish = choice["finish_reason"]
                if chunk.get("usage"):
                    usage = chunk["usage"]
    except urllib.error.HTTPError as exc:
        error = {"code": exc.code, "message": exc.read().decode("utf-8", "replace")[:500]}
    total = time.monotonic() - start

    result = {
        "modell": model,
        "anbieter": provider,
        "wiederholung": rep,
        "reasoning": reasoning,
        **info,
        "prompt_tokens": usage.get("prompt_tokens"),
        "completion_tokens": usage.get("completion_tokens"),
        "reasoning_tokens": (usage.get("completion_tokens_details") or {}).get("reasoning_tokens"),
        "kosten_usd": usage.get("cost"),
        "erstes_stueck_s": round(first, 2) if first is not None else None,
        "gesamt_s": round(total, 2),
        "finish_reason": finish,
        "fehler": error,
        "woerter": len("".join(text).split()),
    }
    OUT.mkdir(exist_ok=True)
    stem = f"{model.replace('/', '__')}__{budget}__{rep}"
    (OUT / f"{stem}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    (OUT / f"{stem}.md").write_text("".join(text).strip() + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))


def main() -> None:
    if sys.argv[1:2] == ["groessen"]:
        for b in (8000, 14000, 20000, 30000):
            _, info = build(b)
            print(info)
    elif sys.argv[1:2] == ["lauf"]:
        run(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()

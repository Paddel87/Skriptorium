"""Messreihe für D.16: Warum denkt grok-4.7 an echten Schreib-Anfragen so lange vor? (ADR-051)

Befund 5.26: grok-4.7 braucht an echten Anfragen bis zu 370 s bis zum ersten Textstück, eine
einfache Anfrage mit 25.000 Token Kontext dagegen 4 s. Die Größe des Kontexts allein ist es also
nicht. Gemessen wird an der echten Schreib-Anfrage beider Testgeschichten (Regel-002, Anweisung 2
aus 5.26 mit ``@``, Länge „mittel“), einzeln statt in Ketten, je Variante 3 Wiederholungen je
Geschichte:

- ``voll-46``, ``voll-47``: die Anfrage wie im Produkt (Denken „low“);
- ``ohne-vorgaben-47``: dieselbe Anfrage ohne Anschluss-Hinweis und Vorgaben aus 5.8–5.22;
- ``deckel-47``: Denken auf höchstens 1.024 Token begrenzt statt „low“;
- ``aus-47``: Denken abgeschaltet.

Direkt an OpenRouter wie ``messung.py`` (D.6), damit Denken je Variante wählbar ist und Denk-Token
getrennt sichtbar werden. Keine Texte in der Ausgabe, nur Zeiten und Zählwerte; JSON-Zeilen nach
``ergebnisse/d16-<variante>.jsonl``.

Aufruf: uv run python spikes/reaktionszeit/d16.py VARIANTE [VARIANTE …]
Schlüssel aus OPENROUTER_API_KEY.
"""

import asyncio
import json
import os
import sys
import tempfile
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT.parent / "regel-002"))
sys.path.insert(0, str(ROOT.parent / "kanon-treue"))

from geschichten import GESCHICHTEN  # noqa: E402
from proben import ANWEISUNGEN_MIT_AT  # noqa: E402
from technik import references  # noqa: E402

from skriptorium.context.builder import _requirements, _seam  # noqa: E402

URL = "https://openrouter.ai/api/v1/chat/completions"
STEP = 2  # Anweisung 2: reichste Szene in beiden Geschichten, ohne Sonderfall „Weiter“
REPEATS = 3
LOW = {"effort": "low"}

VARIANTS: dict[str, tuple[str, dict[str, Any], bool]] = {
    "voll-46": ("x-ai/grok-4.6", LOW, True),
    "voll-47": ("x-ai/grok-4.7", LOW, True),
    "ohne-vorgaben-47": ("x-ai/grok-4.7", LOW, False),
    "deckel-47": ("x-ai/grok-4.7", {"max_tokens": 1024}, True),
    "aus-47": ("x-ai/grok-4.7", {"enabled": False}, True),
}


def messages(name: str, with_requirements: bool) -> list[dict[str, str]]:
    """Die Anfrage an der Schreibstelle wie die Oberfläche; optional ohne Vorgaben 5.8–5.22."""
    with tempfile.TemporaryDirectory() as tmp:
        g = GESCHICHTEN[name](Path(tmp))
        instruction = ANWEISUNGEN_MIT_AT[name][STEP - 1]
        built = g.builder.build(
            g.world, g.story, g.chapter, instruction, references(g, instruction), length="mittel"
        )
        msgs = [{"role": m.role, "content": m.content} for m in built.messages]
        if not with_requirements:
            current = g.manuscripts.get_chapter(g.world, g.story, g.chapter)
            user = msgs[-1]["content"]
            for part in (_seam(current), _requirements("mittel")):
                assert part and part in user, "Teil nicht gefunden"
                user = user.replace("\n\n" + part, "").replace(part + "\n\n", "")
            msgs[-1]["content"] = user
    return msgs


async def one(
    client: httpx.AsyncClient, variant: str, story: str, rep: int, msgs: list[dict[str, str]]
) -> dict[str, Any]:
    model, reasoning, _ = VARIANTS[variant]
    payload: dict[str, Any] = {
        "model": model,
        "messages": msgs,
        "stream": True,
        "max_tokens": 8000,
        "temperature": 0.8,
        "usage": {"include": True},
        "reasoning": reasoning,
    }
    row: dict[str, Any] = {
        "variante": variant,
        "geschichte": story,
        "lauf": rep,
        "modell": model,
        "zeitpunkt": datetime.now(UTC).isoformat(timespec="seconds"),
        "zeichen_anfrage": sum(len(m["content"]) for m in msgs),
    }
    started = time.monotonic()
    reasoning_chars = content_chars = 0
    key = os.environ["OPENROUTER_API_KEY"]
    async with client.stream(
        "POST", URL, json=payload, headers={"Authorization": f"Bearer {key}"}
    ) as response:
        row["kopf_s"] = round(time.monotonic() - started, 2)
        row["status"] = response.status_code
        if response.status_code != 200:
            row["fehler"] = (await response.aread()).decode(errors="replace")[:300]
            return row
        async for line in response.aiter_lines():
            if not line.startswith("data: ") or line == "data: [DONE]":
                continue
            chunk = json.loads(line[6:])
            if "error" in chunk:
                row["fehler"] = str(chunk["error"])[:300]
            if isinstance(chunk.get("provider"), str):
                row["anbieter"] = chunk["provider"]
            for choice in chunk.get("choices") or []:
                delta = choice.get("delta") or {}
                if delta.get("reasoning"):
                    row.setdefault("erstes_denken_s", round(time.monotonic() - started, 2))
                    reasoning_chars += len(delta["reasoning"])
                if delta.get("content"):
                    row.setdefault("erstes_textstueck_s", round(time.monotonic() - started, 2))
                    content_chars += len(delta["content"])
                if choice.get("finish_reason"):
                    row["ende_grund"] = choice["finish_reason"]
            usage = chunk.get("usage")
            if isinstance(usage, dict):
                details = usage.get("completion_tokens_details") or {}
                row["token_ein"] = usage.get("prompt_tokens")
                row["token_aus"] = usage.get("completion_tokens")
                row["denk_token"] = details.get("reasoning_tokens")
                row["kosten_usd"] = usage.get("cost")
    row["gesamt_s"] = round(time.monotonic() - started, 2)
    row["denk_zeichen"] = reasoning_chars
    row["text_zeichen"] = content_chars
    return row


async def run(variant: str) -> None:
    out = ROOT / "ergebnisse" / f"d16-{variant}.jsonl"
    timeout = httpx.Timeout(connect=10, read=600, write=10, pool=10)
    with_requirements = VARIANTS[variant][2]
    async with httpx.AsyncClient(timeout=timeout) as client:
        for story in ("salzmark", "glimmergrund"):
            msgs = messages(story, with_requirements)
            for rep in range(1, REPEATS + 1):
                try:
                    row = await one(client, variant, story, rep, msgs)
                except httpx.HTTPError as exc:
                    row = {"variante": variant, "geschichte": story, "lauf": rep,
                           "fehler": type(exc).__name__}
                with out.open("a", encoding="utf-8") as file:
                    file.write(json.dumps(row, ensure_ascii=False) + "\n")
                print(json.dumps(row, ensure_ascii=False), flush=True)


async def main() -> None:
    await asyncio.gather(*(run(v) for v in sys.argv[1:]))


if __name__ == "__main__":
    main_args = sys.argv[1:]
    assert main_args and all(v in VARIANTS for v in main_args), list(VARIANTS)
    asyncio.run(main())

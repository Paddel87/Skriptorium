"""Messreihe für Schritt D.6: Zeit bis zum ersten Textstück (ADR-013, ADR-022).

Baut den Kontext wie die Oberfläche (Testwelt „Die Salzmark“, ContextBuilder, Kapitel 4) und
schickt ihn direkt an OpenRouter – nicht über ``ai_gateway``, damit Reasoning-Einstellung und
Anbieter-Führung je Variante wählbar sind und die Denk-Token getrennt sichtbar werden. Gemessen
beim Aufrufer: Antwortkopf, erstes Denk-Stück, erstes Textstück, Ende. Keine Texte in der
Ausgabe, nur Zeiten und Zählwerte; Ergebnisse als JSON-Zeilen in ``ergebnisse/``.

Aufruf im Skriptorium-Container auf dem VPS (Schlüssel liegt dort schon in der Umgebung; das
Skript braucht nur httpx und schreibt nichts, Ergebnisse gehen auf die Standardausgabe;
ausgeführt auf ausdrücklichen Wunsch des Eigentümers, 2026-09-28):
    uv run python spikes/reaktionszeit/messung.py --paket > PAKET.py
    ssh <host> 'docker exec -i skriptorium python -' < PAKET.py > ergebnisse/messung.jsonl
"""

import argparse
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

URL = "https://openrouter.ai/api/v1/chat/completions"
INSTRUCTION = (
    "Tomas und Ilka erreichen das Ende der Grotte. Schreib die Szene weiter (ca. 400 Wörter) "
    "und ende an einer Stelle, an der Ilka handeln muss."
)
LOW = {"effort": "low"}

# Name → (Modell, Reasoning, Anbieter-Führung, Wiederholungen). "prod-*" entspricht ai_gateway.
VARIANTS: dict[str, tuple[str, dict[str, Any], dict[str, Any] | None, int]] = {
    "prod-47": ("x-ai/grok-4.7", LOW, None, 8),
    "prod-46": ("x-ai/grok-4.6", LOW, None, 6),
    "cap1024-47": ("x-ai/grok-4.7", {"max_tokens": 1024}, None, 6),
    "aus-47": ("x-ai/grok-4.7", {"enabled": False}, None, 4),
    "latenz-47": ("x-ai/grok-4.7", LOW, {"sort": "latency"}, 4),
}


def messages() -> list[dict[str, str]]:
    """Kontext wie die Oberfläche; nur lokal aufrufbar (braucht Repo und Testwelt)."""
    sys.path.insert(0, str(Path(__file__).parent.parent / "kontext-abnahme"))
    from abnahme import STORY, WORLD, load_world  # noqa: PLC0415 - Spike, Hilfsfunktion aus 3.2

    with tempfile.TemporaryDirectory() as tmp:
        builder = load_world(Path(tmp) / "data")
        built = builder.build(WORLD, STORY, 4, INSTRUCTION, [])
    return [{"role": m.role, "content": m.content} for m in built.messages]


async def one(
    client: httpx.AsyncClient, name: str, rep: int, msgs: list[dict[str, str]]
) -> dict[str, Any]:
    model, reasoning, provider, _ = VARIANTS[name]
    payload: dict[str, Any] = {
        "model": model,
        "messages": msgs,
        "stream": True,
        "max_tokens": 8000,
        "temperature": 0.8,
        "usage": {"include": True},
        "reasoning": reasoning,
    }
    if provider:
        payload["provider"] = provider
    key = os.environ["OPENROUTER_API_KEY"]
    row: dict[str, Any] = {
        "variante": name,
        "lauf": rep,
        "modell": model,
        "zeitpunkt": datetime.now(UTC).isoformat(timespec="seconds"),
    }
    started = time.monotonic()
    reasoning_chars = content_chars = 0
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


async def run(names: list[str], msgs: list[dict[str, str]]) -> None:
    timeout = httpx.Timeout(connect=10, read=180, write=10, pool=10)
    async with httpx.AsyncClient(timeout=timeout) as client:
        for name in names:
            for rep in range(1, VARIANTS[name][3] + 1):
                try:
                    row = await one(client, name, rep, msgs)
                except httpx.HTTPError as exc:
                    row = {"variante": name, "lauf": rep, "fehler": type(exc).__name__}
                print(json.dumps(row, ensure_ascii=False), flush=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--paket", action="store_true", help="Skript mit Kontext ausgeben")
    parser.add_argument("varianten", nargs="*", default=list(VARIANTS))
    args = parser.parse_args()
    if args.paket:
        # Self-contained script for stdin: this file with the context appended as a constant.
        source = Path(__file__).read_text(encoding="utf-8").split("\nif __name__")[0]
        print(source)
        print(f"MSGS = json.loads({json.dumps(json.dumps(messages(), ensure_ascii=False))})")
        print(f"asyncio.run(run({args.varianten!r}, MSGS))")
        return
    asyncio.run(run(args.varianten, messages()))


if __name__ == "__main__":
    main()

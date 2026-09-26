"""Prüfung httpx 0.28.1 auf Python 3.14.7 (Fahrplan-Schritt 1.3) – Wegwerf-Code der Erkundung.

Aufruf (Warnungen als Fehler):
    python -X dev -W error pruefung.py [--openrouter]

Voraussetzungen: Python 3.14.7, httpx==0.28.1; für --openrouter die Umgebungsvariable KEY.
Der Schlüssel wird nie ausgegeben.

Prüft synchron und asynchron gegen einen lokalen Testserver:
  1. Streaming von Server-Sent Events (Stück für Stück, nicht erst am Ende)
  2. Zeitüberschreitung beim Lesen (httpx.ReadTimeout)
  3. Abbruch eines laufenden Stroms ohne Warnungen oder offene Verbindungen
Optional: echte Streaming-Anfrage an OpenRouter.
"""

from __future__ import annotations

import asyncio
import gc
import json
import os
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import httpx

RESULTS: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    RESULTS.append((name, ok, detail))
    print(f"[{'OK' if ok else 'FEHLER'}] {name} {detail}", flush=True)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *args: object) -> None:  # keine Zugriffszeilen
        pass

    def do_GET(self) -> None:
        if self.path.startswith("/sse"):
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Transfer-Encoding", "chunked")
            self.end_headers()
            try:
                for i in range(20):
                    data = f"data: {json.dumps({'n': i})}\n\n".encode()
                    self.wfile.write(f"{len(data):x}\r\n".encode() + data + b"\r\n")
                    self.wfile.flush()
                    time.sleep(0.05)
                self.wfile.write(b"0\r\n\r\n")
            except (BrokenPipeError, ConnectionResetError):
                pass  # Client hat abgebrochen – erwartet in Prüfung 3
        elif self.path.startswith("/langsam"):
            time.sleep(3)
            try:
                self.send_response(200)
                self.send_header("Content-Length", "2")
                self.end_headers()
                self.wfile.write(b"ok")
            except (BrokenPipeError, ConnectionResetError):
                pass  # Client hat nach Zeitüberschreitung getrennt – erwartet in Prüfung 2


def start_server() -> tuple[ThreadingHTTPServer, str]:
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f"http://127.0.0.1:{server.server_address[1]}"


def sync_checks(base: str) -> None:
    with httpx.Client(timeout=httpx.Timeout(5.0)) as client:
        # 1. Streaming: Zeitpunkte der Ereignisse müssen gestaffelt sein
        stamps: list[float] = []
        t0 = time.monotonic()
        with client.stream("GET", f"{base}/sse") as resp:
            for line in resp.iter_lines():
                if line.startswith("data: "):
                    stamps.append(time.monotonic() - t0)
        spread = stamps[-1] - stamps[0] if stamps else 0.0
        check("sync Streaming", len(stamps) == 20 and spread > 0.5,
              f"{len(stamps)} Ereignisse, erstes nach {stamps[0]:.2f}s, Spanne {spread:.2f}s")

        # 2. Zeitüberschreitung
        try:
            client.get(f"{base}/langsam", timeout=httpx.Timeout(5.0, read=1.0))
            check("sync ReadTimeout", False, "keine Zeitüberschreitung ausgelöst")
        except httpx.ReadTimeout:
            check("sync ReadTimeout", True, "httpx.ReadTimeout nach 1s")

        # 3. Abbruch mitten im Strom
        n = 0
        with client.stream("GET", f"{base}/sse") as resp:
            for line in resp.iter_lines():
                if line.startswith("data: "):
                    n += 1
                    if n == 3:
                        break
        check("sync Abbruch", n == 3 and resp.is_closed, f"nach {n} Ereignissen, Antwort geschlossen={resp.is_closed}")
        # Verbindung danach weiter nutzbar
        r = client.get(f"{base}/langsam", timeout=5.0)
        check("sync Client nach Abbruch nutzbar", r.status_code == 200)


async def async_checks(base: str) -> None:
    async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
        stamps: list[float] = []
        t0 = time.monotonic()
        async with client.stream("GET", f"{base}/sse") as resp:
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    stamps.append(time.monotonic() - t0)
        spread = stamps[-1] - stamps[0] if stamps else 0.0
        check("async Streaming", len(stamps) == 20 and spread > 0.5,
              f"{len(stamps)} Ereignisse, Spanne {spread:.2f}s")

        try:
            await client.get(f"{base}/langsam", timeout=httpx.Timeout(5.0, read=1.0))
            check("async ReadTimeout", False, "keine Zeitüberschreitung ausgelöst")
        except httpx.ReadTimeout:
            check("async ReadTimeout", True, "httpx.ReadTimeout nach 1s")

        # Abbruch per Task-Cancel (wie beim Schließen des Browser-Tabs)
        received = 0

        async def consume() -> None:
            nonlocal received
            async with client.stream("GET", f"{base}/sse") as r:
                async for line in r.aiter_lines():
                    if line.startswith("data: "):
                        received += 1

        task = asyncio.create_task(consume())
        await asyncio.sleep(0.2)
        task.cancel()
        try:
            await task
            check("async Abbruch (cancel)", False, "Task lief bis zum Ende")
        except asyncio.CancelledError:
            check("async Abbruch (cancel)", 0 < received < 20, f"abgebrochen nach {received} Ereignissen")
        r2 = await client.get(f"{base}/langsam", timeout=5.0)
        check("async Client nach Abbruch nutzbar", r2.status_code == 200)


async def openrouter_check() -> None:
    key = os.environ.get("KEY")
    if not key:
        check("OpenRouter Streaming", False, "Umgebungsvariable KEY fehlt")
        return
    payload = {
        "model": "x-ai/grok-4.6",
        "messages": [{"role": "user", "content": "Zähle langsam von eins bis zwanzig, jede Zahl in eine eigene Zeile."}],
        "stream": True,
        "max_tokens": 400,
        "reasoning": {"effort": "low"},
    }
    chunks = 0
    t0 = time.monotonic()
    first = None
    finish = None
    async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=10.0)) as client:
        async with client.stream(
            "POST",
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}"},
            json=payload,
        ) as resp:
            async for line in resp.aiter_lines():
                if not line.startswith("data: ") or line == "data: [DONE]":
                    continue
                data = json.loads(line[6:])
                for ch in data.get("choices", []):
                    if (ch.get("delta") or {}).get("content"):
                        chunks += 1
                        first = first or time.monotonic() - t0
                    finish = ch.get("finish_reason") or finish
    check("OpenRouter Streaming (async)", chunks > 3 and finish == "stop",
          f"{chunks} Textstücke, erstes nach {first:.2f}s, finish_reason={finish}")


def main() -> int:
    print(f"Python {sys.version.split()[0]}, httpx {httpx.__version__}", flush=True)
    server, base = start_server()
    try:
        sync_checks(base)
        asyncio.run(async_checks(base))
        if "--openrouter" in sys.argv:
            asyncio.run(openrouter_check())
    finally:
        server.shutdown()
        server.server_close()
    gc.collect()  # offene Sockets würden jetzt als ResourceWarning (= Fehler) auffallen
    failed = [r for r in RESULTS if not r[1]]
    print(f"\n{len(RESULTS) - len(failed)}/{len(RESULTS)} Prüfungen bestanden", flush=True)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

"""Probeschreiben für Schritt 3.3 mit echten KI-Läufen über den laufenden Server (FR-008, FR-009,
FR-011, Reaktionszeit nach ADR-013).

Der Autor (hier: der Coding-Agent in der Rolle des Autors) schreibt Ilkas Absätze selbst; die KI
setzt über ``POST …/chapters/{n}/write`` fort. Übernommene Texte werden wie in der Oberfläche
ans Kapitelende gehängt und über ``PUT …/chapters/{n}`` gespeichert.

Aufruf:
    uv run python spikes/probeschreiben/probe.py setup DATENVERZEICHNIS
    SKRIPTORIUM_DATA_DIR=... uv run uvicorn skriptorium.api:create_app --factory --port 8765
    uv run python spikes/probeschreiben/probe.py write NAME --chapter 4 [--instruction ...]
        [--author DATEI] [--scene-place ID --scene-character ID --scene-goal TEXT] [--model M]
        [--abort-after-first-text]
    uv run python spikes/probeschreiben/probe.py take NAME accept|discard|edit [--text DATEI]
    uv run python spikes/probeschreiben/probe.py new-chapter TITEL
    uv run python spikes/probeschreiben/probe.py export

Der Schlüssel kommt aus OPENROUTER_API_KEY (nur im Server-Prozess).
"""

import argparse
import importlib.util
import json
import os
import sys
import tempfile
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx

from skriptorium.api.access import CredentialStore, PasswordHasher
from skriptorium.storage import DocumentStore

ROOT = Path(__file__).parent
OUT = Path(os.environ.get("PROBE_OUT", ROOT / "ergebnisse"))
BASE = "http://localhost:8765"
STORY = "/api/worlds/die-salzmark/stories/das-salz-der-toten"
PASSWORD = "Salzwind über der Mark 7"  # noqa: S105 - Testdaten, kein Geheimnis
# Outside the repository: the session cookie must never be committed.
COOKIE_FILE = Path(tempfile.gettempdir()) / "skriptorium-probe-sitzung"


def setup(data: Path) -> None:
    spec = importlib.util.spec_from_file_location(
        "abnahme", ROOT.parent / "kontext-abnahme" / "abnahme.py"
    )
    assert spec is not None and spec.loader is not None
    abnahme = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(abnahme)
    abnahme.load_world(data)
    store = DocumentStore(data)
    CredentialStore(store, PasswordHasher(), lambda: datetime.now(UTC)).set_password(PASSWORD)
    OUT.mkdir(exist_ok=True)
    print(f"Welt angelegt in {data}")


def client() -> httpx.Client:
    headers = {"Origin": BASE}
    if COOKIE_FILE.exists():
        headers["Cookie"] = COOKIE_FILE.read_text().strip()
    session = httpx.Client(base_url=BASE, headers=headers, timeout=120)
    if session.get("/api/auth/session").status_code == 401:
        response = session.post("/api/auth/login", json={"password": PASSWORD})
        response.raise_for_status()
        cookie = response.headers["set-cookie"].split(";", 1)[0]
        COOKIE_FILE.write_text(cookie)
        session.headers["Cookie"] = cookie
    return session


def chapter_text(session: httpx.Client, number: int) -> dict[str, Any]:
    response = session.get(f"{STORY}/chapters/{number}")
    response.raise_for_status()
    result: dict[str, Any] = response.json()
    return result


def append(session: httpx.Client, number: int, text: str) -> None:
    """Wie die Oberfläche: eigener Text getrimmt, Leerzeile, neuer Text getrimmt."""
    own = chapter_text(session, number)["text"].rstrip()
    new = text.strip() if not own else f"{own}\n\n{text.strip()}"
    session.put(f"{STORY}/chapters/{number}", json={"text": new}).raise_for_status()


def write(args: argparse.Namespace) -> None:
    session = client()
    if args.author:
        append(session, args.chapter, Path(args.author).read_text(encoding="utf-8"))
    before = chapter_text(session, args.chapter)["text"]
    body: dict[str, Any] = {"instruction": args.instruction or "", "model": args.model}
    if args.scene_goal or args.scene_place or args.scene_character:
        body["scene"] = {
            "place": args.scene_place,
            "characters": args.scene_character or [],
            "goal": args.scene_goal or "",
        }
    started = time.monotonic()
    times: dict[str, float] = {}
    text = ""
    events: list[tuple[str, Any]] = []
    aborted = False
    with session.stream("POST", f"{STORY}/chapters/{args.chapter}/write", json=body) as response:
        times["kopf_s"] = time.monotonic() - started
        if response.status_code != 200:
            print(response.status_code, response.read().decode())
            sys.exit(1)
        buffer = ""
        for piece in response.iter_text():
            buffer += piece
            while "\n\n" in buffer:
                block, buffer = buffer.split("\n\n", 1)
                name = block.split("\n")[0].removeprefix("event: ")
                data = json.loads(block.split("\n")[1].removeprefix("data: "))
                if name == "start":
                    times.setdefault("start_s", time.monotonic() - started)
                if name == "text":
                    times.setdefault("erstes_textstueck_s", time.monotonic() - started)
                    text += data["text"]
                else:
                    events.append((name, data))
            if args.abort_after_first_text and text:
                aborted = True
                break
    times["gesamt_s"] = time.monotonic() - started
    after = chapter_text(session, args.chapter)["text"]
    meta = {
        "name": args.name,
        "kapitel": args.chapter,
        "anfrage": body,
        "autor_absatz": Path(args.author).read_text(encoding="utf-8") if args.author else None,
        "zeiten": {k: round(v, 2) for k, v in times.items()},
        "ereignisse": events,
        "abgebrochen": aborted,
        "manuskript_unveraendert": before == after,
        "woerter": len(text.split()),
    }
    OUT.mkdir(exist_ok=True)
    (OUT / f"{args.name}.txt").write_text(text, encoding="utf-8")
    (OUT / f"{args.name}.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps({k: meta[k] for k in ("zeiten", "ereignisse", "abgebrochen", "woerter")},
                     ensure_ascii=False))
    print("-----")
    print(text)


def take(args: argparse.Namespace) -> None:
    session = client()
    meta_path = OUT / f"{args.name}.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    proposal = (OUT / f"{args.name}.txt").read_text(encoding="utf-8")
    if args.action == "edit":
        proposal = Path(args.text).read_text(encoding="utf-8")
        (OUT / f"{args.name}.geaendert.txt").write_text(proposal, encoding="utf-8")
    if args.action in ("accept", "edit"):
        append(session, meta["kapitel"], proposal)
    meta["aktion"] = args.action
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{args.name}: {args.action}")


def new_chapter(args: argparse.Namespace) -> None:
    session = client()
    chapters = session.get(f"{STORY}/chapters").json()
    number = len(chapters) + 1
    session.put(f"{STORY}/chapters/{number}", json={"title": args.title}).raise_for_status()
    print(f"Kapitel {number} angelegt")


def export(_: argparse.Namespace) -> None:
    session = client()
    for chapter in session.get(f"{STORY}/chapters").json():
        if chapter["number"] >= 4:
            path = OUT / f"kapitel-{chapter['number']}.txt"
            path.write_text(
                f"<!-- Kapitel {chapter['number']}: {chapter['title']} -->\n\n{chapter['text']}\n",
                encoding="utf-8",
            )
            print(path)


def main() -> None:
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("setup").add_argument("data", type=Path)
    w = commands.add_parser("write")
    w.add_argument("name")
    w.add_argument("--chapter", type=int, required=True)
    w.add_argument("--instruction")
    w.add_argument("--author")
    w.add_argument("--model", default="x-ai/grok-4.7")
    w.add_argument("--scene-place")
    w.add_argument("--scene-character", action="append")
    w.add_argument("--scene-goal")
    w.add_argument("--abort-after-first-text", action="store_true")
    t = commands.add_parser("take")
    t.add_argument("name")
    t.add_argument("action", choices=["accept", "discard", "edit"])
    t.add_argument("--text")
    commands.add_parser("new-chapter").add_argument("title")
    commands.add_parser("export")
    args = parser.parse_args()
    if args.command == "setup":
        setup(args.data)
    else:
        {"write": write, "take": take, "new-chapter": new_chapter, "export": export}[args.command](
            args
        )


if __name__ == "__main__":
    main()

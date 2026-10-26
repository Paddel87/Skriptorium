"""Contract between the server and the interface (roadmap step 9.2, finding 3 of
``docs/research/bewertung-phase-8.md``).

The TypeScript types of the answers in ``ui/src/api/`` are written by hand, and the tests of the
interface run against fakes (``ui/fake-api.ts``). Nothing checked that the real answers of the
server fit those types. This test closes the gap from the server's side: it builds a small, fixed
data set through the HTTP interface, calls every endpoint whose JSON answer the interface reads
through a type of ``ui/src/api/`` (and one event of every kind of the three streams), and compares
the answers with ``tests/shared/api-responses.json``. ``ui/src/api/contract.test.ts`` then checks
that file against the types with the TypeScript compiler.

The file maps a name to ``{"route", "type", "body"}``: ``body`` is the answer of the server (values
that vary from run to run are replaced by fixed ones of the same shape), ``type`` the TypeScript
type the interface reads it as, ``route`` the call, for the reader of a diff.

If the answers of the server changed (on purpose or not), this test writes the file anew and fails.
Then:

1. Look at the diff of ``tests/shared/api-responses.json``: is every change intended?
2. ``npx prettier --write tests/shared/api-responses.json``
3. ``npx vitest run ui/src/api/contract.test.ts`` checks the file against the types of the
   interface. Fix the types in ``ui/src/api/`` (or the server) if it reports a difference.
4. Commit the file together with the change.
"""

import base64
import json
import re
from collections.abc import AsyncIterator, Collection, Iterator, Sequence
from contextlib import contextmanager
from datetime import timedelta
from pathlib import Path
from typing import Any, Final

import pytest
from fastapi.testclient import TestClient
from httpx import Response

from skriptorium.ai_gateway import (
    Completed,
    CompletionRequest,
    GatewayError,
    InvalidRequest,
    ModelRefused,
    ProviderUnavailable,
    RateLimited,
    Source,
    StreamEvent,
    TextChunk,
    Usage,
)
from skriptorium.context import CONFLICT_MARKER
from tests.api.conftest import FakeClock, FakeImages, FakeProvider, services_of
from tests.image_samples import jpeg, png

RESPONSES: Final = Path(__file__).parents[1] / "shared" / "api-responses.json"
SILLYTAVERN_CARD: Final = Path(__file__).parents[1] / "canon" / "fixtures" / "sillytavern"
WORLD: Final = "/api/worlds/die-salzmark"

CHANGED: Final = (
    "Antworten des Servers geändert – Datei neu geschrieben; Diff prüfen, "  # noqa: RUF001 - German typography of the message
    "`npx prettier --write tests/shared/api-responses.json` ausführen, "
    "`npx vitest run ui/src/api/contract.test.ts` prüft sie gegen die Typen, "
    "dann committen"
)

# Random file names of maps, entry images and covers: "<stem>-" + 12 hex digits + ending.
_FILE_NAME: Final = re.compile(r"(?P<stem>[a-z0-9-]*-)[0-9a-f]{12}(?P<ending>\.(?:png|jpg|webp))")


class _Recorder:
    """Calls the server and records each answer under the name of the interface's call.

    Values that differ between runs are replaced by fixed ones of the same type before the
    answers are compared and written: the random file names of images (``karte-1f3a…``) get a
    number in the order they first appear, and the random identifiers of sessions are named with
    :meth:`name_session`. Times come from the ``FakeClock`` and need no replacement.
    """

    def __init__(self, client: TestClient) -> None:
        """Start without answers."""
        self.client = client
        self.entries: dict[str, dict[str, Any]] = {}
        self._files: dict[str, str] = {}
        self._sessions: dict[str, str] = {}

    def get(self, name: str, ts_type: str, path: str, **options: Any) -> Any:
        """GET ``path`` and record the answer as ``ts_type`` (``params``, ``status`` as in
        :meth:`call`)."""
        return self.call("GET", name, ts_type, path, **options)

    def post(self, name: str, ts_type: str, path: str, body: Any = None, **options: Any) -> Any:
        """POST ``body`` to ``path`` and record the answer."""
        return self.call("POST", name, ts_type, path, body, **options)

    def put(self, name: str, ts_type: str, path: str, body: Any = None, **options: Any) -> Any:
        """PUT ``body`` to ``path`` and record the answer."""
        return self.call("PUT", name, ts_type, path, body, **options)

    def patch(self, name: str, ts_type: str, path: str, body: Any = None, **options: Any) -> Any:
        """PATCH ``body`` to ``path`` and record the answer."""
        return self.call("PATCH", name, ts_type, path, body, **options)

    def delete(self, name: str, ts_type: str, path: str, body: Any = None, **options: Any) -> Any:
        """DELETE ``path`` (with ``body`` if given) and record the answer."""
        return self.call("DELETE", name, ts_type, path, body, **options)

    def call(
        self,
        method: str,
        name: str,
        ts_type: str,
        path: str,
        body: Any = None,
        *,
        params: dict[str, str] | None = None,
        status: int = 200,
    ) -> Any:
        """Send the request, expect ``status`` and record the JSON answer as ``ts_type``.

        Returns the answer as the server sent it (with the real file names), for the calls that
        follow.
        """
        response = self.client.request(method, path, json=body, params=params)
        assert response.status_code == status, response.text
        answer = response.json()
        self._add(name, ts_type, response, answer)
        return answer

    def setup(self, method: str, path: str, body: Any = None, *, status: int = 201) -> Any:
        """Send a request that is only part of the data set; its answer is not recorded."""
        response = self.client.request(method, path, json=body)
        assert response.status_code == status, response.text
        return response.json()

    def stream(
        self,
        prefix: str,
        union: str,
        path: str,
        body: Any,
        *,
        kinds: Collection[str] | None = None,
        suffix: str = "",
    ) -> None:
        """POST ``body`` and record the first event of each kind of the answering stream.

        The interface reads the data of an event as the member of ``union`` with the event's
        name as ``type``, without the ``type`` (it adds that from the name of the event). The
        entries are named ``prefix`` + kind + ``suffix``; only the ``kinds`` given are recorded
        (default: all), and a name that is taken stays with its first event.
        """
        response = self.client.post(path, json=body)
        assert response.status_code == 200, response.text
        for kind, data in _events(response):
            name = f"{prefix}{kind.capitalize()}{suffix}"
            if (kinds is None or kind in kinds) and name not in self.entries:
                ts_type = f'Omit<Extract<{union}, {{ type: "{kind}" }}>, "type">'
                self._add(name, ts_type, response, data)

    def name_session(self, real_id: str, stable_id: str) -> None:
        """Replace the random identifier of a session by ``stable_id``."""
        self._sessions[real_id] = stable_id

    def _add(self, name: str, ts_type: str, response: Response, body: Any) -> None:
        assert name not in self.entries, f"recorded twice: {name}"
        path = _FILE_NAME.sub(self._file, response.request.url.path)
        route = f"{response.request.method} {path}"
        self.entries[name] = {"route": route, "type": ts_type, "body": self._stable(body)}

    def _stable(self, value: Any) -> Any:
        if isinstance(value, dict):
            return {key: self._stable(item) for key, item in value.items()}
        if isinstance(value, list):
            return [self._stable(item) for item in value]
        if isinstance(value, str):
            if value in self._sessions:
                return self._sessions[value]
            if _FILE_NAME.fullmatch(value):
                return _FILE_NAME.sub(self._file, value)
        return value

    def _file(self, found: re.Match[str]) -> str:
        number = self._files.setdefault(found[0], f"{len(self._files) + 1:012x}")
        return f"{found['stem']}{number}{found['ending']}"


def _events(response: Response) -> list[tuple[str, Any]]:
    """The events of a Server-Sent Events answer as (name, data) pairs."""
    events = []
    for block in response.text.strip().split("\n\n"):
        name_line, data_line = block.split("\n")
        events.append((name_line.removeprefix("event: "), json.loads(data_line[len("data: ") :])))
    return events


def _base64(data: bytes) -> str:
    return base64.b64encode(data).decode()


class _SearchingProvider(FakeProvider):
    """Answers with the web pages behind the answer (web search of the world builder)."""

    async def stream(self, request: CompletionRequest) -> AsyncIterator[StreamEvent]:
        self.requests.append(request)
        yield TextChunk("Trocken lagern.")
        yield Completed(
            Usage(900, 30, 0.004),
            "stop",
            sources=(Source("https://a.example/salz", "Salz lagern"),),
        )


@contextmanager
def _answering(
    provider: FakeProvider,
    *,
    chunks: Sequence[str] | None = None,
    error: GatewayError | None = None,
) -> Iterator[None]:
    """Let the fake provider answer with ``chunks`` (default: as before) and then ``error``."""
    saved = provider.chunks, provider.error
    if chunks is not None:
        provider.chunks = chunks
    provider.error = error
    try:
        yield
    finally:
        provider.chunks, provider.error = saved


# --- the data set and the calls ---------------------------------------------------------------


def _canon(rec: _Recorder) -> None:
    """Two worlds, entries of all categories, images, maps with a marker."""
    rec.post(
        "createWorld",
        "World",
        "/api/worlds",
        {"name": "Die Salzmark", "description": "Salz und Nebel."},
        status=201,
    )
    rec.setup("POST", "/api/worlds", {"name": "Nebelreich", "description": "Nebel."})
    for category, name in (("figur", "Nebelkönig"), ("ort", "Reifpalast")):
        rec.setup("POST", "/api/worlds/nebelreich/entries", {"category": category, "name": name})
    rec.post(
        "createEntry",
        "CanonEntry",
        f"{WORLD}/entries",
        {
            "category": "figur",
            "name": "Kael",
            "aliases": ["Fährmann"],
            "status": "lebt",
            "body": "Fährmann, schweigsam.",
        },
        status=201,
    )
    rec.post(
        "createEntryWithoutStatus",
        "CanonEntry",
        f"{WORLD}/entries",
        {"category": "ort", "name": "Hafen von Grauwasser", "body": "Kalter Hafen."},
        status=201,
    )
    for category, name in (
        ("gegenstand", "Runenklinge"),
        ("zeitlinie", "Die Große Flut"),
        ("regel", "Salzgesetz"),
        ("kultur", "Mondvolk"),
    ):
        rec.setup("POST", f"{WORLD}/entries", {"category": category, "name": name})
    rec.patch("updateWorld", "World", WORLD, {"description": "Salz, Nebel, Wind."})
    kael = f"{WORLD}/entries/kael"
    rec.patch("updateEntry", "CanonEntry", kael, {"body": "Fährmann, schweigsam, narbig."})

    first = rec.post(
        "addImage", "CanonEntry", f"{kael}/images", {"content": _base64(png())}, status=201
    )
    second = rec.setup("POST", f"{kael}/images", {"content": _base64(jpeg())})
    rec.post("setMainImage", "CanonEntry", f"{kael}/images/{second['images'][1]}/main")
    rec.delete("removeImage", "CanonEntry", f"{kael}/images/{first['images'][0]}")

    rec.post(
        "addMap",
        "World",
        f"{WORLD}/maps",
        {"name": "Seekarte", "content": _base64(png())},
        status=201,
    )
    maps = rec.setup("POST", f"{WORLD}/maps", {"name": "Festland", "content": _base64(jpeg())})
    sea, land = maps["maps"][0]["file"], maps["maps"][1]["file"]
    rec.patch("renameMap", "World", f"{WORLD}/maps/{land}", {"name": "Das Festland"})
    rec.put(
        "setMarkers",
        "World",
        f"{WORLD}/maps/{sea}/markers",
        {"markers": [{"entry": "hafen-von-grauwasser", "x": 0.25, "y": 0.5}]},
    )
    rec.delete("removeMap", "World", f"{WORLD}/maps/{land}")

    rec.get("worlds", "World[]", "/api/worlds")
    rec.get("entries", "CanonEntry[]", f"{WORLD}/entries")
    rec.get("entry", "CanonEntry", kael)


def _manuscript(rec: _Recorder) -> str:
    """Stories with guests, facts and a cover; chapters; instructions. Returns the story path."""
    created = rec.post(
        "createStory",
        "Story",
        f"{WORLD}/stories",
        {"title": "Die Überfahrt", "form": "roman", "perspective": "ich"},
        status=201,
    )
    story = f"{WORLD}/stories/{created['id']}"
    rec.post(
        "createStoryWithoutPerspective",
        "Story",
        f"{WORLD}/stories",
        {"title": "Am Ufer", "form": "kurzgeschichte"},
        status=201,
    )
    rec.patch(
        "updateStory",
        "Story",
        story,
        {
            "perspective": "er",
            "controlled_characters": ["kael"],
            "model": "x-ai/grok-4.7",
            "genres": ["Thriller"],
            "writing_style": {
                "tone": ["düster", "kalt"],
                "atmosphere": ["angespannt"],
                "style": ["knapp"],
                "tempo": "atemlos",
                "explicitness": "angedeutet",
                "free": "Kurze Absätze.",
            },
        },
    )
    rec.post(
        "addGuest",
        "Story",
        f"{story}/guests",
        {"world": "nebelreich", "entry": "nebelkoenig"},
        status=201,
    )
    rec.setup("POST", f"{story}/guests", {"world": "nebelreich", "entry": "reifpalast"})
    rec.delete("removeGuest", "Story", f"{story}/guests/nebelreich/reifpalast")
    rec.post(
        "addFact",
        "Story",
        f"{story}/facts",
        {"entry": "kael", "fact": "Kael fürchtet das Wasser."},
        status=201,
    )
    rec.setup("POST", f"{story}/facts", {"entry": "kael", "fact": "Kael lügt."})
    rec.delete("removeFact", "Story", f"{story}/facts", {"entry": "kael", "fact": "Kael lügt."})
    rec.put("setStorySummary", "Story", f"{story}/summary", {"summary": "Kael setzt über."})
    rec.post("setCover", "Story", f"{story}/cover", {"content": _base64(jpeg())})
    rec.delete("removeCover", "Story", f"{story}/cover")
    rec.setup("POST", f"{story}/cover", {"content": _base64(png())}, status=200)

    rec.put(
        "saveChapter",
        "Chapter",
        f"{story}/chapters/1",
        {"title": "Aufbruch", "text": "Kael band das Boot fest."},
    )
    rec.put(
        "saveChapterWithStyle",
        "Chapter",
        f"{story}/chapters/1",
        {"writing_style": {"tone": ["zärtlich"], "tempo": "langsam"}},
    )
    rec.setup(
        "PUT", f"{story}/chapters/2", {"title": "Überfahrt", "text": "Es regnete."}, status=200
    )
    rec.post("completeChapter", "Chapter", f"{story}/chapters/1/complete")
    rec.get("summaryRoom", "{ max_chars: number }", f"{story}/chapters/1/summary-room")
    rec.put(
        "setChapterSummary",
        "Chapter",
        f"{story}/chapters/2/summary",
        {"summary": "Kael fährt ab.", "status": "geprüft"},
    )
    rec.post(
        "addInstruction",
        "InstructionNote[]",
        f"{story}/chapters/1/instructions",
        {"instruction": "Weiter", "text": "Der Nebel hob sich.", "model": "x-ai/grok-4.6"},
        status=201,
    )
    rec.setup(
        "POST",
        f"{story}/chapters/1/instructions",
        {"instruction": "Neue Szene", "text": "Mira kam dazu."},
    )
    rec.get("instructions", "InstructionNote[]", f"{story}/chapters/1/instructions")
    rec.get("chapters", "Chapter[]", f"{story}/chapters")
    rec.get("stories", "Story[]", f"{WORLD}/stories")
    return story


def _summaries(rec: _Recorder, provider: FakeProvider, story: str) -> None:
    """The summary of a chapter: done, and each way it can fail without an HTTP error."""
    path = f"{story}/chapters/1/summarize"
    rec.post("summarizeChapter", "SummaryResult", path)
    with _answering(provider, chunks=(), error=ModelRefused("nein")):
        rec.post("summarizeChapterRefused", "SummaryResult", path)
    with _answering(provider, chunks=()):
        rec.post("summarizeChapterEmpty", "SummaryResult", path)


def _streams(rec: _Recorder, provider: FakeProvider, story: str) -> None:
    """One event of every kind of the three streams (proposal, world builder, description)."""
    write = f"{story}/chapters/1/write"
    rec.stream("write", "WriteEvent", write, {"instruction": "Mira kommt dazu."})
    with _answering(provider, chunks=(f"{CONFLICT_MARKER} Kael ist tot.\n", "Der Nebel hob sich.")):
        rec.stream("write", "WriteEvent", write, {})
    for error in (
        ModelRefused("nein"),
        RateLimited("zu viele"),
        InvalidRequest("kaputt"),
        ProviderUnavailable("weg"),
    ):
        with _answering(provider, error=error):
            rec.stream(
                "write", "WriteEvent", write, {}, kinds=("error",), suffix=type(error).__name__
            )

    builder = f"{WORLD}/worldbuilder"
    order = {"messages": [{"role": "user", "content": "Ein Fährmann für den Hafen."}]}
    rec.stream("worldbuilder", "WorldbuilderEvent", builder, order)
    services = services_of(rec.client)
    object.__setattr__(services, "provider", _SearchingProvider())
    searching = {**order, "web_search": True}
    rec.stream(
        "worldbuilder",
        "WorldbuilderEvent",
        builder,
        searching,
        kinds=("start", "quellen"),
        suffix="Search",
    )
    object.__setattr__(services, "provider", provider)
    with _answering(provider, error=RateLimited("zu viele")):
        rec.stream("worldbuilder", "WorldbuilderEvent", builder, order, kinds=("error",))
    rec.post("manuscriptHits", "ManuscriptHits", f"{builder}/hits", {"name": "Kael"})

    kael = f"{WORLD}/entries/kael"
    image = rec.client.get(kael).json()["images"][0]
    sea = rec.client.get(WORLD).json()["maps"][0]["file"]
    for prefix, path in (
        ("describeImage", f"{kael}/images/{image}/describe"),
        ("describeMap", f"{WORLD}/maps/{sea}/describe"),
        ("appearance", f"{kael}/appearance"),
    ):
        rec.stream(prefix, "DescribeEvent", path, {"model": "x-ai/grok-4.6"})


def _models_images_and_usage(rec: _Recorder, images: FakeImages) -> None:
    rec.get("models", "ModelList", "/api/models")
    rec.put(
        "setFavorites",
        "ModelList",
        "/api/models/favoriten",
        {"favorites": ["x-ai/grok-4.6", "deepseek/deepseek-v3.2"]},
    )
    rec.put(
        "setTaskModels",
        "ModelList",
        "/api/models/aufgaben",
        {"tasks": {"weltenbau": "deepseek/deepseek-v3.2", "bilderzeugung": None}},
    )
    rec.get("usage", "MonthUsage", "/api/usage")

    rec.get("imageModels", "ImageModelList", "/api/images/models")
    rec.get(
        "imagePrice",
        "ImagePrice",
        "/api/images/price",
        params={"model": "black-forest-labs/flux.2-pro"},
    )
    order = {
        "model": "black-forest-labs/flux.2-pro",
        "prompt": "Eine Wirtin",
        "aspect_ratio": "2:3",
    }
    rec.post("generateImage", "GeneratedImage", "/api/images/generate", order)
    images.cost = None
    rec.post("generateImageWithoutCost", "GeneratedImage", "/api/images/generate", order)
    kael = rec.client.get(f"{WORLD}/entries/kael").json()["images"][0]
    basis = {"world": "die-salzmark", "entry": "kael", "image": kael}
    rec.post(
        "generateImageFromImage",
        "GeneratedImage",
        "/api/images/generate",
        {**order, "reference": basis},
    )


def _transfer(rec: _Recorder) -> None:
    """The import of world material; it comes last because it adds entries."""
    card = (SILLYTAVERN_CARD / "karte-v2.json").read_bytes()
    translated = rec.post(
        "translateSillyTavern",
        "TranslatedMaterial",
        f"{WORLD}/import/sillytavern",
        {"content": _base64(card)},
    )
    material = (
        translated["markdown"]
        + "\n# Sonstiges\n\n## Kael\nDoppelt.\n\n## Treibgut\nAliasse: Strandgut\nOhne Heimat.\n"
    )
    preview = rec.post(
        "previewImport", "ImportPreview", f"{WORLD}/import/preview", {"markdown": material}
    )
    assert {item["conflict"] for item in preview["items"]} >= {None, "vorhanden"}
    chosen = {item["id"]: "gegenstand" for item in preview["items"] if item["category"] is None}
    assert chosen
    rec.post(
        "applyImport",
        "ImportResult",
        f"{WORLD}/import",
        {"markdown": material, "categories": chosen, "overwrite": ["kael"]},
    )


def _account(rec: _Recorder, clock: FakeClock) -> None:
    """The own session and the overview with a second one."""
    sessions = services_of(rec.client).sessions
    (own,) = sessions.list()
    rec.name_session(own.id, "session-own")
    clock.advance(timedelta(minutes=5))
    _, other = sessions.create("Mozilla/5.0 (X11; Linux x86_64) Firefox")
    rec.name_session(other.id, "session-other")
    rec.get("session", "SessionInfo", "/api/auth/session")
    rec.get("sessions", "SessionInfo[]", "/api/auth/sessions")


def test_the_answers_of_the_server_are_the_recorded_ones(
    logged_in: TestClient, provider: FakeProvider, images: FakeImages, clock: FakeClock
) -> None:
    """Every answer the interface reads equals ``tests/shared/api-responses.json``.

    A difference rewrites the file and fails; the types are checked against the file by
    ``ui/src/api/contract.test.ts`` (see the top of this module).
    """
    rec = _Recorder(logged_in)

    _canon(rec)
    story = _manuscript(rec)
    _summaries(rec, provider, story)
    _streams(rec, provider, story)
    _models_images_and_usage(rec, images)
    _transfer(rec)
    _account(rec, clock)

    if not RESPONSES.exists() or json.loads(RESPONSES.read_text(encoding="utf-8")) != rec.entries:
        RESPONSES.write_text(
            json.dumps(rec.entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        pytest.fail(CHANGED)

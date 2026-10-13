"""The world builder over the API (roadmap step 6.7, ADR-064)."""

import asyncio
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from skriptorium.ai_gateway import (
    Completed,
    CompletionRequest,
    Message,
    Source,
    StreamEvent,
    TextChunk,
    Usage,
)
from skriptorium.ai_gateway.errors import RateLimited
from skriptorium.api import create_app
from skriptorium.api.flows import PreparedRequest, stream_worldbuilder
from skriptorium.api.settings import Settings
from tests.api.conftest import ORIGIN, FakeProvider, services_of
from tests.api.test_writing import _events, writer

__all__ = ["writer"]

URL = "/api/worlds/die-salzmark/worldbuilder"


def _body(**changes: Any) -> dict[str, Any]:
    return {"messages": [{"role": "user", "content": "Ein Fährmann für den Hafen."}], **changes}


def test_answer_streams_without_saving(writer: TestClient, provider: FakeProvider) -> None:
    entries_before = writer.get("/api/worlds/die-salzmark/entries").json()

    response = writer.post(URL, json=_body(references=["kael"]))

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    events = _events(response.text)
    assert [name for name, _ in events] == ["start", "text", "text", "done"]
    start = events[0][1]
    assert (start["model"], start["web_search"]) == ("x-ai/grok-4.6", False)
    request = provider.requests[0]
    assert [m.role for m in request.messages] == ["system", "user"]
    assert "Weltenbauer" in request.messages[0].content
    assert "Fährmann, schweigsam." in request.messages[0].content
    assert request.web_search is False
    assert writer.get("/api/worlds/die-salzmark/entries").json() == entries_before


def test_conversation_model_and_web_search_go_along(
    writer: TestClient, provider: FakeProvider
) -> None:
    response = writer.post(
        URL,
        json={
            "messages": [
                {"role": "user", "content": "Ein Fährmann."},
                {"role": "assistant", "content": "Kael Brann?"},
                {"role": "user", "content": "Wie lagert er Salz?"},
            ],
            "model": "qwen/qwen3.8-max-0902",
            "web_search": True,
        },
    )

    assert response.status_code == 200
    request = provider.requests[0]
    assert request.model == "qwen/qwen3.8-max-0902"
    assert request.web_search is True
    assert [(m.role, m.content) for m in request.messages[1:]] == [
        ("user", "Ein Fährmann."),
        ("assistant", "Kael Brann?"),
        ("user", "Wie lagert er Salz?"),
    ]


class SearchingProvider(FakeProvider):
    """Answers with web pages behind the answer."""

    async def stream(self, request: CompletionRequest) -> AsyncIterator[StreamEvent]:
        self.requests.append(request)
        yield TextChunk("Trocken lagern.")
        yield Completed(
            Usage(900, 30, 0.004),
            "stop",
            sources=(Source("https://a.example/salz", "Salz lagern"),),
        )


def test_sources_come_before_done(writer: TestClient) -> None:
    # Services are frozen; the test swaps the provider in place of a new app.
    object.__setattr__(services_of(writer), "provider", SearchingProvider())

    events = _events(writer.post(URL, json=_body(web_search=True)).text)

    assert [name for name, _ in events] == ["start", "text", "quellen", "done"]
    assert events[2][1] == {"sources": [{"url": "https://a.example/salz", "title": "Salz lagern"}]}


def test_usage_is_counted_as_weltenbau(writer: TestClient) -> None:
    writer.post(URL, json=_body())

    month = services_of(writer).usage.month()
    assert month.requests == 1


def test_provider_error_is_an_event(writer: TestClient, provider: FakeProvider) -> None:
    provider.error = RateLimited("zu viele")

    events = _events(writer.post(URL, json=_body()).text)

    assert events[-1] == ("error", {"kind": "zu_viele_anfragen"})


def test_invalid_orders_are_refused(writer: TestClient) -> None:
    assert writer.post(URL, json=_body(model="erfunden/modell")).status_code == 422
    last_assistant = {"messages": [{"role": "assistant", "content": "Hallo"}]}
    assert writer.post(URL, json=last_assistant).status_code == 422
    many = {"messages": [{"role": "user", "content": "x"}] * 61}
    assert writer.post(URL, json=many).status_code == 422
    long = {"messages": [{"role": "user", "content": "x" * 40_001}]}
    assert writer.post(URL, json=long).status_code == 422
    too_large = {"messages": [{"role": "user", "content": "Wort " * 30_000}]}
    assert writer.post(URL, json=too_large).status_code == 422
    assert writer.post(URL, json=_body(references=["erfunden"])).status_code == 404
    assert writer.post("/api/worlds/erfunden/worldbuilder", json=_body()).status_code == 404
    wrong_role = {"messages": [{"role": "system", "content": "x"}]}
    assert writer.post(URL, json=wrong_role).status_code == 422


def test_without_provider_answers_503(data_dir: Path) -> None:
    app = create_app(Settings(data_dir=data_dir), provider_factory=lambda _: None)
    with TestClient(app, base_url=ORIGIN, headers={"Origin": ORIGIN}) as client:
        code = services_of(client).credentials.create_setup_code()
        client.post("/api/auth/setup", json={"code": code, "password": "Salzwind über der Mark 7"})
        client.post("/api/auth/login", json={"password": "Salzwind über der Mark 7"})

        response = client.post(URL, json=_body())

    assert response.status_code == 503


def test_usage_file_names_the_kind(writer: TestClient, data_dir: Path) -> None:
    writer.post(URL, json=_body())

    text = next((data_dir / "system" / "verbrauch").glob("*.md")).read_text(encoding="utf-8")
    assert "art: weltenbau" in text
    assert "Fährmann" not in text


def test_named_entry_too_large_for_the_budget(writer: TestClient) -> None:
    writer.post(
        "/api/worlds/die-salzmark/entries",
        json={"category": "ort", "name": "Riesenarchiv", "body": "Regal. " * 20_000},
    )

    response = writer.post(URL, json=_body(references=["riesenarchiv"]))

    assert response.status_code == 422
    assert "Riesenarchiv" in response.json()["detail"]


def test_empty_chunks_are_not_sent(writer: TestClient, provider: FakeProvider) -> None:
    provider.chunks = ("", "Text")

    events = _events(writer.post(URL, json=_body()).text)

    assert [name for name, _ in events] == ["start", "text", "done"]


class PlainStream:
    """A provider whose stream has no ``aclose`` (an async iterator, not a generator)."""

    name = "plain"

    def stream(self, request: CompletionRequest) -> AsyncIterator[StreamEvent]:
        events: list[StreamEvent] = [TextChunk("Hallo."), Completed(Usage(1, 1, 0.0), "stop")]

        class Iterator:
            def __aiter__(self) -> Iterator:
                return self

            async def __anext__(self) -> StreamEvent:
                if not events:
                    raise StopAsyncIteration
                return events.pop(0)

        return Iterator()


def test_flow_without_recorder_and_without_aclose() -> None:
    prepared = PreparedRequest(
        CompletionRequest("x-ai/grok-4.6", [Message("user", "Hallo")], 100, 0.8), 10
    )

    async def collect() -> list[str]:
        return [event async for event in stream_worldbuilder(PlainStream(), prepared)]

    names = [chunk.split("\n", 1)[0] for chunk in asyncio.run(collect())]
    assert names == ["event: start", "event: text", "event: done"]


HITS = f"{URL}/hits"


def test_hits_count_without_returning_text(
    writer: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    writer.put(
        "/api/worlds/die-salzmark/stories/am-ufer/chapters/1",
        json={"text": "Kael band das Boot fest.\n\nMira sah zu.\n\nKael ging."},
    )

    with caplog.at_level("DEBUG"):
        response = writer.post(HITS, json={"name": "Kael"})

    assert response.status_code == 200
    body = response.json()
    assert {key: body[key] for key in ("total", "stories", "chapters", "included")} == {
        "total": 2,
        "stories": 1,
        "chapters": 1,
        "included": 2,
    }
    assert body["tokens"] > 0 and set(body) == {
        "total",
        "stories",
        "chapters",
        "included",
        "tokens",
    }
    assert "Kael band" not in response.text and "Kael band" not in caplog.text
    one = writer.post(HITS, json={"name": "Mira", "story": "am-ufer"}).json()
    assert (one["total"], one["included"]) == (1, 1)
    none = writer.post(HITS, json={"name": "Niemand"}).json()
    assert none == {"total": 0, "stories": 0, "chapters": 0, "included": 0, "tokens": 0}


def test_hits_refuse_bad_input(writer: TestClient) -> None:
    assert writer.post(HITS, json={"name": "Kael", "story": "erfunden"}).status_code == 404
    assert (
        writer.post("/api/worlds/erfunden/worldbuilder/hits", json={"name": "Kael"}).status_code
        == 404
    )
    assert writer.post(HITS, json={"name": ""}).status_code == 422
    assert writer.post(HITS, json={"name": "   "}).status_code == 422
    assert writer.post(HITS, json={"name": "x" * 201}).status_code == 422
    assert writer.post(HITS, json={}).status_code == 422


def test_hits_need_session_and_origin(writer: TestClient) -> None:
    wrong = writer.post(HITS, json={"name": "Kael"}, headers={"Origin": "https://evil.example"})
    assert wrong.status_code == 403
    writer.post("/api/auth/logout")
    assert writer.post(HITS, json={"name": "Kael"}).status_code == 401


def test_worldbuilder_takes_passages_of_the_manuscript(
    writer: TestClient, provider: FakeProvider
) -> None:
    response = writer.post(URL, json=_body(manuscript={"name": "Kael", "story": None}))

    assert response.status_code == 200
    system = provider.requests[0].messages[0].content
    assert "# Fundstellen im Manuskript zu „Kael“" in system
    assert "## Am Ufer, Kapitel 1:" in system
    assert "Kael band das Boot fest." in system
    # Every request of the conversation carries them again.
    writer.post(URL, json=_body(manuscript={"name": "Kael", "story": "am-ufer"}))
    assert "Fundstellen im Manuskript" in provider.requests[1].messages[0].content


def test_old_requests_stay_unchanged(writer: TestClient, provider: FakeProvider) -> None:
    writer.post(URL, json=_body())
    writer.post(URL, json=_body(manuscript=None))

    first, second = (request.messages[0].content for request in provider.requests)
    assert "Fundstellen" not in first and first == second


def test_worldbuilder_refuses_a_bad_manuscript_order(writer: TestClient) -> None:
    assert (
        writer.post(URL, json=_body(manuscript={"name": "Kael", "story": "erfunden"})).status_code
        == 404
    )
    assert writer.post(URL, json=_body(manuscript={"name": ""})).status_code == 422
    assert writer.post(URL, json=_body(manuscript={"name": "  "})).status_code == 422
    assert writer.post(URL, json=_body(manuscript={})).status_code == 422

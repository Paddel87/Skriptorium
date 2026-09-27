"""Chapter summaries (roadmap step 3.6): flow ``api.flows.summary`` and its endpoint."""

import asyncio
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from skriptorium.ai_gateway import (
    Completed,
    CompletionRequest,
    ModelRefused,
    RateLimited,
    StreamEvent,
    TextChunk,
    Usage,
)
from skriptorium.ai_gateway.errors import GatewayError
from skriptorium.api import create_app
from skriptorium.api.flows import (
    DEFAULT_MODEL,
    SUMMARY_TEMPERATURE,
    SummaryFailure,
    SummaryOutcome,
    summarize_chapter,
)
from skriptorium.api.settings import Settings
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore, InvalidInput
from tests.api.conftest import ORIGIN, FakeProvider, services_of

STORY = "/api/worlds/die-salzmark/stories/die-flut"
SUMMARIZE = f"{STORY}/chapters/1/summarize"


@dataclass
class ScriptedProvider:
    """Answers each request with the next script item: a text or an error."""

    script: list[str | GatewayError]
    name: str = "scripted"
    requests: list[CompletionRequest] = field(default_factory=list)

    async def stream(self, request: CompletionRequest) -> AsyncIterator[StreamEvent]:
        self.requests.append(request)
        answer = self.script.pop(0)
        if isinstance(answer, GatewayError):
            raise answer
        yield TextChunk(answer)
        yield Completed(Usage(900, 60, 0.001), "stop")

    async def aclose(self) -> None:
        """Nothing to close."""


def _story(client: TestClient) -> None:
    client.post("/api/worlds", json={"name": "Die Salzmark", "description": "Salz."})
    response = client.post(
        "/api/worlds/die-salzmark/stories", json={"title": "Die Flut", "form": "roman"}
    )
    assert response.status_code == 201, response.text
    client.put(f"{STORY}/chapters/1", json={"title": "Aufbruch", "text": "Ilka fand die Klinge."})


@pytest.fixture
def summarizer(logged_in: TestClient) -> TestClient:
    _story(logged_in)
    return logged_in


def test_summaries_are_created_and_saved(summarizer: TestClient, provider: FakeProvider) -> None:
    summarizer.put(f"{STORY}/summary", json={"summary": "Bisher: Sturm."})

    response = summarizer.post(SUMMARIZE)

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["failure"] is None
    assert body["chapter"]["summary"] == "Der Nebel hob sich."
    assert body["chapter"]["summary_status"] == "erzeugt"
    assert body["story"]["summary"] == "Der Nebel hob sich."
    chapter_request, story_request = provider.requests
    assert chapter_request.model == DEFAULT_MODEL
    assert chapter_request.temperature == SUMMARY_TEMPERATURE
    assert "Ilka fand die Klinge." in chapter_request.messages[1].content
    assert "Bisher: Sturm." in chapter_request.messages[1].content
    assert "Bisher: Sturm." in story_request.messages[1].content
    saved = summarizer.get(f"{STORY}/chapters").json()[0]
    assert saved["summary_status"] == "erzeugt"


def _run(
    tmp_path: Path,
    script: list[str | GatewayError],
    text: str = "Text.",
    model: str = DEFAULT_MODEL,
) -> tuple[SummaryOutcome, ScriptedProvider]:
    store = DocumentStore(tmp_path / "data")
    canon, manuscripts = CanonService(store), ManuscriptService(store)
    canon.create_world("Die Salzmark", "Salz.")
    manuscripts.create_story("die-salzmark", "Die Flut", "roman")
    manuscripts.save_chapter("die-salzmark", "die-flut", 1, title="Aufbruch", text=text)
    manuscripts.set_story_summary("die-salzmark", "die-flut", "Alt.")
    provider = ScriptedProvider(script)
    outcome = asyncio.run(
        summarize_chapter(
            manuscripts,
            ContextBuilder(canon, manuscripts),
            provider,
            "die-salzmark",
            "die-flut",
            1,
            model,
        )
    )
    return outcome, provider


def test_failed_chapter_step_leaves_everything_and_skips_the_overall_step(
    tmp_path: Path,
) -> None:
    outcome, provider = _run(tmp_path, [ModelRefused("nein")])

    assert outcome.failure == SummaryFailure("kapitel", "abgelehnt")
    assert outcome.chapter.summary_status == "fehlt"
    assert outcome.story.summary == "Alt."
    assert len(provider.requests) == 1


def test_failed_overall_step_keeps_the_chapter_summary(tmp_path: Path) -> None:
    outcome, _ = _run(tmp_path, ["Kurz.", RateLimited("später")])

    assert outcome.failure == SummaryFailure("gesamt", "zu_viele_anfragen")
    assert outcome.chapter.summary == "Kurz."
    assert outcome.chapter.summary_status == "erzeugt"
    assert outcome.story.summary == "Alt."


def test_empty_answer_is_a_failure(tmp_path: Path) -> None:
    outcome, _ = _run(tmp_path, ["   "])

    assert outcome.failure == SummaryFailure("kapitel", "leer")
    assert outcome.chapter.summary_status == "fehlt"


def test_chapter_too_large_is_a_failure_without_request(tmp_path: Path) -> None:
    outcome, provider = _run(tmp_path, [], text="Wort. " * 20000)

    assert outcome.failure == SummaryFailure("kapitel", "zu_gross")
    assert provider.requests == []


def test_unknown_model_is_refused(tmp_path: Path) -> None:
    with pytest.raises(InvalidInput, match="Unbekanntes Modell"):
        _run(tmp_path, [], model="openai/gpt-9")


def test_chapter_without_text_or_missing_chapter(
    summarizer: TestClient, provider: FakeProvider
) -> None:
    summarizer.put(f"{STORY}/chapters/2", json={"title": "Leer", "text": ""})

    assert summarizer.post(f"{STORY}/chapters/2/summarize").status_code == 422
    assert summarizer.post(f"{STORY}/chapters/9/summarize").status_code == 404
    assert provider.requests == []


def test_summarize_needs_a_session_and_a_provider(client: TestClient, data_dir: Path) -> None:
    assert client.post(SUMMARIZE).status_code == 401
    client.close()
    app = create_app(Settings(data_dir=data_dir), provider_factory=lambda: None)
    with TestClient(app, base_url=ORIGIN, headers={"Origin": ORIGIN}) as other:
        code = services_of(other).credentials.create_setup_code()
        other.post("/api/auth/setup", json={"code": code, "password": "Salzwind über der Mark 7"})
        other.post("/api/auth/login", json={"password": "Salzwind über der Mark 7"})

        assert other.post(SUMMARIZE).status_code == 503

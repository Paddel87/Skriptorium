"""Writing with the AI (roadmap step 3.3): flow ``api.flows.writing`` and its endpoints."""

import asyncio
import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from skriptorium.ai_gateway import (
    InvalidRequest,
    ModelRefused,
    ProviderUnavailable,
    RateLimited,
)
from skriptorium.ai_gateway.errors import GatewayError
from skriptorium.api import create_app
from skriptorium.api.flows import (
    CONTINUE,
    DEFAULT_MODEL,
    MAX_OUTPUT_TOKENS,
    TEMPERATURE,
    Scene,
    WriteOrder,
    prepare_request,
    stream_events,
)
from skriptorium.api.settings import Settings
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore, NotFound
from tests.api.conftest import ORIGIN, FakeProvider, services_of

WRITE = "/api/worlds/die-salzmark/stories/am-ufer/chapters/1/write"


def _events(body: str) -> list[tuple[str, dict[str, Any]]]:
    events = []
    for block in body.strip().split("\n\n"):
        name_line, data_line = block.split("\n")
        events.append((name_line.removeprefix("event: "), json.loads(data_line[len("data: ") :])))
    return events


def _world(client: TestClient) -> None:
    client.post("/api/worlds", json={"name": "Die Salzmark", "description": "Salz und Nebel."})
    for category, name, body in (
        ("ort", "Hafen von Grauwasser", "Kalter Hafen, Nebel am Morgen."),
        ("figur", "Kael", "Fährmann, schweigsam."),
        ("figur", "Mira", "Zöllnerin, misstrauisch."),
        ("gegenstand", "Runenklinge", "Zweck: bannt Geister."),
        ("regel", "Salzgesetz", "Salz bricht jeden Bann."),
    ):
        response = client.post(
            "/api/worlds/die-salzmark/entries",
            json={"category": category, "name": name, "body": body},
        )
        assert response.status_code == 201, response.text
    response = client.post(
        "/api/worlds/die-salzmark/stories", json={"title": "Am Ufer", "form": "kurzgeschichte"}
    )
    assert response.status_code == 201, response.text
    client.put(
        "/api/worlds/die-salzmark/stories/am-ufer/chapters/1",
        json={"text": "Kael band das Boot fest."},
    )


@pytest.fixture
def writer(logged_in: TestClient) -> TestClient:
    _world(logged_in)
    return logged_in


def test_write_streams_proposal_and_saves_nothing(
    writer: TestClient, provider: FakeProvider
) -> None:
    response = writer.post(WRITE, json={"instruction": "Mira kommt dazu."})

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    assert response.headers["cache-control"] == "no-store"
    events = _events(response.text)
    assert [name for name, _ in events] == ["start", "text", "text", "done"]
    assert events[0][1]["model"] == DEFAULT_MODEL
    assert events[0][1]["estimated_tokens"] > 0
    assert "".join(data["text"] for name, data in events if name == "text") == (
        "Der Nebel hob sich."
    )
    assert events[-1][1] == {
        "input_tokens": 1200,
        "output_tokens": 40,
        "cost_usd": 0.0021,
        "finish_reason": "stop",
    }
    request = provider.requests[0]
    assert request.model == DEFAULT_MODEL
    assert (request.max_tokens, request.temperature) == (MAX_OUTPUT_TOKENS, TEMPERATURE)
    assert [message.role for message in request.messages] == ["system", "user"]
    user = request.messages[1].content
    assert "Kael band das Boot fest." in user
    assert user.endswith("Mira kommt dazu.")
    chapter = writer.get("/api/worlds/die-salzmark/stories/am-ufer/chapters/1").json()
    assert chapter["text"] == "Kael band das Boot fest."


def test_saved_text_is_the_basis_of_the_next_request(
    writer: TestClient, provider: FakeProvider
) -> None:
    """FR-009: taken-over, changed or discarded text - whatever is saved counts next time."""
    writer.post(WRITE, json={})
    writer.put(
        "/api/worlds/die-salzmark/stories/am-ufer/chapters/1",
        json={"text": "Kael band das Boot fest.\n\nDer Nebel hob sich, geändert vom Autor."},
    )
    writer.post(WRITE, json={})

    first, second = (request.messages[1].content for request in provider.requests)
    assert first.endswith(CONTINUE)
    assert "geändert vom Autor" not in first
    assert "Der Nebel hob sich, geändert vom Autor." in second


def test_scene_names_place_characters_and_goal(writer: TestClient, provider: FakeProvider) -> None:
    """FR-008: place and characters go into the context as referenced entries."""
    response = writer.post(
        WRITE,
        json={
            "scene": {
                "place": "hafen-von-grauwasser",
                "characters": ["kael", "mira"],
                "goal": "Mira verlangt Zoll.",
            },
            "instruction": "Kurz halten.",
        },
    )

    assert response.status_code == 200, response.text
    system, user = (message.content for message in provider.requests[0].messages)
    assert "Ort: Hafen von Grauwasser" in user
    assert "Figuren: Kael, Mira" in user
    assert "Ziel der Szene: Mira verlangt Zoll." in user
    assert user.endswith("Kurz halten.")
    assert system.index("Kalter Hafen") < system.index("Runenklinge")
    assert system.index("Zöllnerin") < system.index("Runenklinge")


def test_references_and_model_choice(writer: TestClient, provider: FakeProvider) -> None:
    response = writer.post(
        WRITE,
        json={"instruction": "Weiter.", "references": ["runenklinge"], "model": "x-ai/grok-4.6"},
    )

    assert response.status_code == 200
    request = provider.requests[0]
    assert request.model == "x-ai/grok-4.6"
    assert "Zweck: bannt Geister." in request.messages[0].content


@pytest.mark.parametrize(
    ("body", "detail"),
    [
        ({"model": "openai/gpt-9"}, "Unbekanntes Modell"),
        ({"references": ["niemand"]}, "Unbekannter Kanon-Eintrag niemand"),
        ({"scene": {}}, "Die Szene braucht"),
        ({"scene": {"place": "kael"}}, "Kael ist kein Eintrag der Kategorie ort"),
        ({"scene": {"characters": ["hafen-von-grauwasser"]}}, "Kategorie figur"),
    ],
)
def test_invalid_orders_are_refused_before_streaming(
    writer: TestClient, provider: FakeProvider, body: dict[str, object], detail: str
) -> None:
    response = writer.post(WRITE, json=body)

    assert response.status_code == 422
    assert detail in response.json()["detail"]
    assert provider.requests == []


def test_reference_to_an_entry_of_another_world_is_refused(
    writer: TestClient, provider: FakeProvider
) -> None:
    writer.post("/api/worlds", json={"name": "Nebelreich", "description": "Nebel."})
    created = writer.post(
        "/api/worlds/nebelreich/entries",
        json={"category": "figur", "name": "Nebelkönig", "body": "Herrscht im Nebel."},
    )
    assert created.status_code == 201, created.text

    response = writer.post(WRITE, json={"references": ["nebelkoenig"]})

    assert response.status_code == 422
    assert "Unbekannter Kanon-Eintrag nebelkoenig" in response.json()["detail"]
    assert provider.requests == []


def _guest(writer: TestClient) -> None:
    """Der Nebelkönig from Nebelreich as a guest of "Am Ufer" (step 3.7, FR-017)."""
    writer.post("/api/worlds", json={"name": "Nebelreich", "description": "Nebel."})
    for category, name, body in (
        ("figur", "Nebelkönig", "Trägt eine Krone aus Reif."),
        ("ort", "Reifpalast", "Palast aus Eis."),
    ):
        created = writer.post(
            "/api/worlds/nebelreich/entries",
            json={"category": category, "name": name, "body": body},
        )
        assert created.status_code == 201, created.text
    for guest in ("nebelkoenig", "reifpalast"):
        linked = writer.post(
            "/api/worlds/die-salzmark/stories/am-ufer/guests",
            json={"world": "nebelreich", "entry": guest},
        )
        assert linked.status_code == 201, linked.text


def test_reference_to_a_guest_is_taken(writer: TestClient, provider: FakeProvider) -> None:
    _guest(writer)

    response = writer.post(WRITE, json={"references": ["nebelkoenig"]})

    assert response.status_code == 200, response.text
    system = provider.requests[0].messages[0].content
    assert "## Nebelkönig (Figur, Gast aus der Welt „Nebelreich“)" in system
    assert system.index("Krone aus Reif") < system.index("Zöllnerin")  # precedence 2 first


def test_scene_with_guest_place_and_character(writer: TestClient, provider: FakeProvider) -> None:
    _guest(writer)

    response = writer.post(
        WRITE, json={"scene": {"place": "reifpalast", "characters": ["nebelkoenig", "kael"]}}
    )

    assert response.status_code == 200, response.text
    user = provider.requests[0].messages[1].content
    assert "Ort: Reifpalast" in user
    assert "Figuren: Nebelkönig, Kael" in user


def test_guest_of_another_story_is_refused(writer: TestClient, provider: FakeProvider) -> None:
    """The link holds only for its story (FR-017)."""
    _guest(writer)
    writer.post(
        "/api/worlds/die-salzmark/stories", json={"title": "Ohne Gast", "form": "kurzgeschichte"}
    )

    response = writer.post(
        "/api/worlds/die-salzmark/stories/ohne-gast/chapters/1/write",
        json={"references": ["nebelkoenig"]},
    )

    assert response.status_code == 422
    assert "Unbekannter Kanon-Eintrag nebelkoenig" in response.json()["detail"]
    assert provider.requests == []


def test_guest_of_the_wrong_category_is_refused_in_a_scene(
    writer: TestClient, provider: FakeProvider
) -> None:
    _guest(writer)

    response = writer.post(WRITE, json={"scene": {"place": "nebelkoenig"}})

    assert response.status_code == 422
    assert "Nebelkönig ist kein Eintrag der Kategorie ort" in response.json()["detail"]


def test_missing_world_story_or_chapter(writer: TestClient) -> None:
    assert (
        writer.post("/api/worlds/nirgends/stories/am-ufer/chapters/1/write", json={}).status_code
        == 404
    )
    assert (
        writer.post("/api/worlds/die-salzmark/stories/fehlt/chapters/1/write", json={}).status_code
        == 404
    )
    assert (
        writer.post(
            "/api/worlds/die-salzmark/stories/am-ufer/chapters/2/write", json={}
        ).status_code
        == 404
    )


def test_empty_canon_and_empty_chapter_are_written_on(
    logged_in: TestClient, provider: FakeProvider
) -> None:
    """A new world without entries and a story without text (step 4.1)."""
    logged_in.post("/api/worlds", json={"name": "Leere Welt", "description": ""})
    logged_in.post("/api/worlds/leere-welt/stories", json={"title": "Anfang", "form": "fragment"})

    response = logged_in.post("/api/worlds/leere-welt/stories/anfang/chapters/1/write", json={})

    events = _events(response.text)
    assert [name for name, _ in events] == ["start", "text", "text", "done"]
    system, user = (message.content for message in provider.requests[0].messages)
    assert "# Welt: Leere Welt" in system
    assert "Letzte Manuskript-Seiten" not in user
    assert user.endswith(CONTINUE)


def test_context_too_large_is_refused_with_largest_blocks(
    writer: TestClient, provider: FakeProvider
) -> None:
    writer.post(
        "/api/worlds/die-salzmark/entries",
        json={"category": "regel", "name": "Riesenregel", "body": "Salz. " * 20_000},
    )

    response = writer.post(WRITE, json={})

    assert response.status_code == 422
    assert "Riesenregel" in response.json()["detail"]
    assert provider.requests == []


@pytest.mark.parametrize(
    ("error", "kind"),
    [
        (ModelRefused("filter"), "abgelehnt"),
        (RateLimited("429"), "zu_viele_anfragen"),
        (InvalidRequest("400"), "ungueltig"),
        (ProviderUnavailable("netz"), "nicht_erreichbar"),
        (GatewayError("sonst"), "nicht_erreichbar"),
    ],
)
def test_provider_errors_end_the_stream_with_their_kind(
    writer: TestClient, provider: FakeProvider, error: GatewayError, kind: str
) -> None:
    provider.error = error

    events = _events(writer.post(WRITE, json={}).text)

    assert [name for name, _ in events] == ["start", "text", "text", "error"]
    assert events[-1][1] == {"kind": kind}
    chapter = writer.get("/api/worlds/die-salzmark/stories/am-ufer/chapters/1").json()
    assert chapter["text"] == "Kael band das Boot fest."


def test_empty_chunks_are_not_sent(writer: TestClient, provider: FakeProvider) -> None:
    provider.chunks = ("", "Text")

    events = _events(writer.post(WRITE, json={}).text)

    assert [name for name, _ in events] == ["start", "text", "done"]


def test_model_list(logged_in: TestClient) -> None:
    response = logged_in.get("/api/models")

    assert response.json() == {
        "models": ["x-ai/grok-4.7", "x-ai/grok-4.6", "qwen/qwen3.8-max-0902"],
        "default": "x-ai/grok-4.7",
    }


def test_writing_needs_a_session(client: TestClient) -> None:
    assert client.get("/api/models").status_code == 401
    assert client.post(WRITE, json={}).status_code == 401


def test_writing_without_provider_answers_503(data_dir: Path) -> None:
    app = create_app(Settings(data_dir=data_dir), provider_factory=lambda: None)
    with TestClient(app, base_url=ORIGIN, headers={"Origin": ORIGIN}) as client:
        code = services_of(client).credentials.create_setup_code()
        client.post("/api/auth/setup", json={"code": code, "password": "Salzwind über der Mark 7"})
        client.post("/api/auth/login", json={"password": "Salzwind über der Mark 7"})

        response = client.post(WRITE, json={})

    assert response.status_code == 503
    assert response.json() == {"detail": "KI-Anbieter nicht eingerichtet"}


def test_provider_from_environment_missing_key(
    data_dir: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)

    app = create_app(Settings(data_dir=data_dir))

    assert services_of_app(app).provider is None


def test_provider_from_environment_is_closed_on_shutdown(
    data_dir: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("OPENROUTER_API_KEY", "sk-test-nicht-echt")
    app = create_app(Settings(data_dir=data_dir))
    provider = services_of_app(app).provider
    assert provider is not None and provider.name == "openrouter"

    with TestClient(app):
        pass

    assert provider._client.is_closed  # adapter internals; shutdown check only


def services_of_app(app: Any) -> Any:
    return app.state.services


# The flow on its own: abort closes the provider stream.


def _builder(tmp_path: Path) -> tuple[CanonService, ManuscriptService, ContextBuilder]:
    store = DocumentStore(tmp_path)
    canon = CanonService(store)
    manuscripts = ManuscriptService(store)
    canon.create_world("Die Salzmark")
    manuscripts.create_story("die-salzmark", "Am Ufer", "kurzgeschichte")
    return canon, manuscripts, ContextBuilder(canon, manuscripts)


def test_abort_closes_the_provider_stream(tmp_path: Path) -> None:
    """Closing the connection ends the request at the provider (step 3.3, ADR-013)."""
    canon, manuscripts, builder = _builder(tmp_path)
    provider = FakeProvider(chunks=("a", "b", "c"))
    prepared = prepare_request(
        canon, manuscripts, builder, WriteOrder("die-salzmark", "am-ufer", 1)
    )

    async def read_two_then_abort() -> list[str]:
        stream = stream_events(provider, prepared)
        received = [await anext(stream), await anext(stream)]
        await stream.aclose()  # type: ignore[attr-defined]  # async generator
        return received

    received = asyncio.run(read_two_then_abort())

    assert [line.split("\n")[0] for line in received] == ["event: start", "event: text"]
    assert provider.closed == 1
    assert not provider.finished


def test_prepare_request_missing_world(tmp_path: Path) -> None:
    canon, manuscripts, builder = _builder(tmp_path)

    with pytest.raises(NotFound):
        prepare_request(canon, manuscripts, builder, WriteOrder("fehlt", "am-ufer", 1))


def test_prepare_request_scene_goal_only(tmp_path: Path) -> None:
    canon, manuscripts, builder = _builder(tmp_path)

    prepared = prepare_request(
        canon,
        manuscripts,
        builder,
        WriteOrder("die-salzmark", "am-ufer", 1, scene=Scene(goal="Ein Fremder kommt.")),
    )

    assert "Ziel der Szene: Ein Fremder kommt." in prepared.completion.messages[1].content
    assert "Ort:" not in prepared.completion.messages[1].content

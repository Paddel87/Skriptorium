"""Consumption per month and the model per story (roadmap step 3.9, ADR-023)."""

import asyncio
from datetime import timedelta
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from skriptorium.ai_gateway import ModelRefused, ProviderUnavailable, Usage
from skriptorium.api.flows import WriteOrder, prepare_request, stream_events, summarize_chapter
from skriptorium.api.usage import UsageLog
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore, InvalidInput, StorageError
from tests.api.conftest import FakeClock, FakeProvider, services_of
from tests.api.test_summary import ScriptedProvider
from tests.api.test_writing import WRITE, _world

STORY = "/api/worlds/die-salzmark/stories/am-ufer"


@pytest.fixture
def writer(logged_in: TestClient) -> TestClient:
    _world(logged_in)
    return logged_in


def _log(tmp_path: Path, clock: FakeClock) -> tuple[UsageLog, DocumentStore]:
    store = DocumentStore(tmp_path / "data")
    return UsageLog(store, clock), store


# --- UsageLog ---------------------------------------------------------------------------------


def test_records_are_summed_per_month(tmp_path: Path) -> None:
    clock = FakeClock()
    log, store = _log(tmp_path, clock)

    log.record("schreiben", "x-ai/grok-4.7", Usage(1200, 40, 0.0021), "ok")
    log.record("kurzfassung", "x-ai/grok-4.7", Usage(900, 60, 0.00001), "ok")
    log.record("schreiben", "x-ai/grok-4.6", None, "abgebrochen")
    log.record("schreiben", "x-ai/grok-4.6", Usage(100, None, None), "ok")
    clock.advance(timedelta(days=5))  # 2026-10-01
    log.record("schreiben", "x-ai/grok-4.7", Usage(10, 1, 1.5), "ok")

    september = log.month("2026-09")
    assert september.requests == 4
    assert september.input_tokens == 2200
    assert september.output_tokens == 100
    assert september.cost_usd == pytest.approx(0.00211)
    assert september.without_cost == 2
    assert log.month().month == "2026-10"
    assert log.month().cost_usd == 1.5
    stored = store.read("system/verbrauch/2026-09.md").header["anfragen"]
    assert isinstance(stored, list)
    assert stored[2] == {
        "zeit": "2026-09-26T12:00:00+00:00",
        "art": "schreiben",
        "modell": "x-ai/grok-4.6",
        "ergebnis": "abgebrochen",
        "token_ein": None,
        "token_aus": None,
        "kosten_usd": None,
    }


def test_empty_month_and_bad_month(tmp_path: Path) -> None:
    log, _ = _log(tmp_path, FakeClock())

    empty = log.month("2026-01")

    assert (empty.requests, empty.cost_usd, empty.without_cost) == (0, 0.0, 0)
    for bad in ("2026-13", "2026-9", "../zugang", "2026-09-01"):
        with pytest.raises(InvalidInput):
            log.month(bad)


def test_broken_file_is_reported(tmp_path: Path) -> None:
    log, store = _log(tmp_path, FakeClock())
    store.write("system/verbrauch/2026-09.md", {"anfragen": "kaputt"}, "")

    with pytest.raises(InvalidInput):
        log.month("2026-09")


def test_values_of_the_wrong_type_count_as_nothing(tmp_path: Path) -> None:
    log, store = _log(tmp_path, FakeClock())
    item: dict[str, Any] = {"token_ein": True, "token_aus": "viel", "kosten_usd": "0,1"}
    store.write("system/verbrauch/2026-09.md", {"anfragen": [item]}, "")

    summed = log.month("2026-09")

    assert (summed.input_tokens, summed.output_tokens, summed.cost_usd) == (0, 0, 0.0)
    assert summed.without_cost == 1


def test_write_error_does_not_break_the_caller(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    log, store = _log(tmp_path, FakeClock())

    def fail(*args: object, **kwargs: object) -> None:
        raise StorageError("voll")

    monkeypatch.setattr(store, "write", fail)

    log.record("schreiben", "x-ai/grok-4.7", Usage(1, 1, 0.1), "ok")

    assert "Verbrauch nicht gespeichert: StorageError" in caplog.text
    assert "voll" not in caplog.text


# --- flows record every request ---------------------------------------------------------------


def _prepared(tmp_path: Path) -> Any:
    store = DocumentStore(tmp_path / "data")
    canon, manuscripts = CanonService(store), ManuscriptService(store)
    canon.create_world("Die Salzmark")
    manuscripts.create_story("die-salzmark", "Am Ufer", "kurzgeschichte")
    builder = ContextBuilder(canon, manuscripts)
    return prepare_request(canon, manuscripts, builder, WriteOrder("die-salzmark", "am-ufer", 1))


def _drain(provider: FakeProvider, prepared: Any, calls: list[tuple[Any, ...]]) -> None:
    async def run() -> None:
        async for _ in stream_events(provider, prepared, lambda *args: calls.append(args)):
            pass

    asyncio.run(run())


def test_writing_records_success_and_error(tmp_path: Path) -> None:
    prepared = _prepared(tmp_path)
    calls: list[tuple[Any, ...]] = []

    _drain(FakeProvider(), prepared, calls)
    _drain(FakeProvider(error=ModelRefused("nein")), prepared, calls)
    _drain(FakeProvider(error=ProviderUnavailable("weg")), prepared, calls)

    assert calls == [
        ("schreiben", "x-ai/grok-4.7", Usage(1200, 40, 0.0021), "ok"),
        ("schreiben", "x-ai/grok-4.7", None, "abgelehnt"),
        ("schreiben", "x-ai/grok-4.7", None, "nicht_erreichbar"),
    ]


def test_aborted_writing_is_recorded(tmp_path: Path) -> None:
    prepared = _prepared(tmp_path)
    calls: list[tuple[Any, ...]] = []

    async def read_two_then_abort() -> None:
        stream = stream_events(
            FakeProvider(chunks=("a", "b")), prepared, lambda *args: calls.append(args)
        )
        await anext(stream)
        await anext(stream)
        await stream.aclose()  # type: ignore[attr-defined]  # async generator

    asyncio.run(read_two_then_abort())

    assert calls == [("schreiben", "x-ai/grok-4.7", None, "abgebrochen")]


def _summarize(tmp_path: Path, script: list[Any]) -> list[tuple[Any, ...]]:
    store = DocumentStore(tmp_path / "data")
    canon, manuscripts = CanonService(store), ManuscriptService(store)
    canon.create_world("Die Salzmark")
    manuscripts.create_story("die-salzmark", "Die Flut", "roman")
    manuscripts.save_chapter("die-salzmark", "die-flut", 1, title="A", text="Text.")
    calls: list[tuple[Any, ...]] = []
    asyncio.run(
        summarize_chapter(
            manuscripts,
            ContextBuilder(canon, manuscripts),
            ScriptedProvider(script),
            "die-salzmark",
            "die-flut",
            1,
            record=lambda *args: calls.append(args),
        )
    )
    return calls


def test_summaries_record_each_request(tmp_path: Path) -> None:
    assert _summarize(tmp_path, ["Kurz.", ""]) == [
        ("kurzfassung", "x-ai/grok-4.7", Usage(900, 60, 0.001), "ok"),
        ("gesamtzusammenfassung", "x-ai/grok-4.7", Usage(900, 60, 0.001), "leer"),
    ]


def test_failed_summary_is_recorded(tmp_path: Path) -> None:
    assert _summarize(tmp_path, [ModelRefused("nein")]) == [
        ("kurzfassung", "x-ai/grok-4.7", None, "abgelehnt"),
    ]


# --- endpoints --------------------------------------------------------------------------------


def test_usage_endpoint_counts_writing_and_summaries(
    writer: TestClient, provider: FakeProvider
) -> None:
    assert writer.post(WRITE, json={}).status_code == 200
    services_of(writer).usage.record("kurzfassung", "x-ai/grok-4.6", None, "abgelehnt")

    response = writer.get("/api/usage")

    assert response.status_code == 200
    assert response.json() == {
        "month": "2026-09",
        "requests": 2,
        "input_tokens": 1200,
        "output_tokens": 40,
        "cost_usd": 0.0021,
        "without_cost": 1,
    }
    assert writer.get("/api/usage", params={"month": "2026-08"}).json()["requests"] == 0
    assert writer.get("/api/usage", params={"month": "08-2026"}).status_code == 422


def test_story_keeps_its_model_and_writing_uses_it(
    writer: TestClient, provider: FakeProvider
) -> None:
    changed = writer.patch(STORY, json={"model": "x-ai/grok-4.6"})
    assert changed.status_code == 200, changed.text
    assert changed.json()["model"] == "x-ai/grok-4.6"
    assert writer.get(STORY).json()["model"] == "x-ai/grok-4.6"

    assert writer.post(WRITE, json={}).status_code == 200
    assert writer.post(WRITE, json={"model": "x-ai/grok-4.7"}).status_code == 200

    assert [request.model for request in provider.requests] == ["x-ai/grok-4.6", "x-ai/grok-4.7"]
    cleared = writer.patch(STORY, json={"model": None})
    assert cleared.json()["model"] is None
    assert writer.post(WRITE, json={}).status_code == 200
    assert provider.requests[-1].model == "x-ai/grok-4.7"


def test_unknown_model_for_a_story_is_refused(writer: TestClient) -> None:
    response = writer.patch(STORY, json={"model": "fremd/modell"})

    assert response.status_code == 422
    assert writer.get(STORY).json()["model"] is None


def test_writing_without_model_in_a_missing_story(writer: TestClient) -> None:
    response = writer.post("/api/worlds/die-salzmark/stories/fehlt/chapters/1/write", json={})

    assert response.status_code == 404


def test_usage_file_is_not_indexed(writer: TestClient, data_dir: Path) -> None:
    writer.post(WRITE, json={})

    assert (data_dir / "system" / "verbrauch" / "2026-09.md").is_file()
    assert writer.get("/api/worlds/die-salzmark/search", params={"text": "grok"}).json() == []

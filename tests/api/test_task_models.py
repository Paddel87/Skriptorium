"""Tests for the model per task (roadmap step 9.7, ADR-096)."""

import asyncio
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from skriptorium.api.favorites import PATH, TASKS, Favorites
from skriptorium.api.flows import DEFAULT_MODEL, summarize_chapter
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore, InvalidInput
from tests.api.conftest import FakeCatalogServer, FakeProvider
from tests.api.test_writing import WRITE, writer

__all__ = ["writer"]

WORLD = "/api/worlds/die-salzmark"
STORY = f"{WORLD}/stories/am-ufer"
URL = "/api/models/aufgaben"
NO_TASKS = dict.fromkeys(TASKS)


def _set(client: TestClient, **tasks: str | None) -> Any:
    response = client.put(URL, json={"tasks": tasks})
    assert response.status_code == 200, response.text
    return response.json()


def test_no_task_has_a_model_at_first(logged_in: TestClient) -> None:
    assert logged_in.get("/api/models").json()["tasks"] == NO_TASKS


def test_task_models_are_saved_and_listed(logged_in: TestClient, data_dir: Path) -> None:
    body = _set(
        logged_in,
        weltenbau="deepseek/deepseek-v3.2",
        bildbeschreibung="x-ai/grok-4.6",
        bilderzeugung="bytedance-seed/seedream-4.5",
        kurzfassung=None,
    )

    expected = {
        **NO_TASKS,
        "weltenbau": "deepseek/deepseek-v3.2",
        "bildbeschreibung": "x-ai/grok-4.6",
        "bilderzeugung": "bytedance-seed/seedream-4.5",
    }
    assert body["tasks"] == expected
    assert logged_in.get("/api/models").json()["tasks"] == expected
    header = DocumentStore(data_dir).read(PATH).header
    assert header["aufgaben"] == {
        "weltenbau": "deepseek/deepseek-v3.2",
        "bildbeschreibung": "x-ai/grok-4.6",
        "bilderzeugung": "bytedance-seed/seedream-4.5",
    }


def test_a_missing_or_empty_task_returns_to_the_preset(logged_in: TestClient) -> None:
    _set(logged_in, weltenbau="deepseek/deepseek-v3.2", aussehen="x-ai/grok-4.7")

    body = _set(logged_in, aussehen=None)

    assert body["tasks"] == NO_TASKS


def test_favorites_and_task_models_keep_each_other(logged_in: TestClient) -> None:
    _set(logged_in, weltenbau="deepseek/deepseek-v3.2")
    logged_in.put("/api/models/favoriten", json={"favorites": ["openai/gpt-5"]})
    body = _set(logged_in, weltenbau="deepseek/deepseek-v3.2", schreiben="openai/gpt-5")

    assert body["favorites"] == ["openai/gpt-5"]
    assert body["tasks"]["weltenbau"] == "deepseek/deepseek-v3.2"
    assert logged_in.get("/api/models").json()["favorites"] == ["openai/gpt-5"]


@pytest.mark.parametrize(
    "tasks",
    [
        {"schreiben": "erfunden/modell"},
        {"weltenbau": "black-forest-labs/flux.2-pro"},
        # Describing an image needs a model that reads images.
        {"bildbeschreibung": "deepseek/deepseek-v3.2"},
        # Generating images takes only image models.
        {"bilderzeugung": "x-ai/grok-4.6"},
    ],
)
def test_a_model_that_does_not_fit_its_task_is_refused(
    logged_in: TestClient, tasks: dict[str, str]
) -> None:
    response = logged_in.put(URL, json={"tasks": tasks})

    assert response.status_code == 422
    assert "passt nicht zur Aufgabe" in response.text
    assert logged_in.get("/api/models").json()["tasks"] == NO_TASKS


def test_an_unknown_task_is_refused(logged_in: TestClient) -> None:
    response = logged_in.put(URL, json={"tasks": {"zaubern": "x-ai/grok-4.6"}})

    assert response.status_code == 422


def test_saved_models_stay_allowed_without_catalog(
    logged_in: TestClient, catalog_server: FakeCatalogServer, data_dir: Path
) -> None:
    DocumentStore(data_dir).write(
        PATH,
        {"aufgaben": {"bildbeschreibung": "x-ai/grok-4.6", "weltenbau": "deepseek/deepseek-v3.2"}},
        "",
    )
    catalog_server.down = True

    body = _set(logged_in, bildbeschreibung="x-ai/grok-4.6", weltenbau="deepseek/deepseek-v3.2")

    assert body["catalog_available"] is False
    assert body["tasks"]["bildbeschreibung"] == "x-ai/grok-4.6"
    # Without the catalog only the fixed models remain; describing takes one of them unchecked.
    assert _set(logged_in, bildbeschreibung="x-ai/grok-4.7")["tasks"]["bildbeschreibung"] == (
        "x-ai/grok-4.7"
    )


def test_writing_starts_with_the_task_model(writer: TestClient, provider: FakeProvider) -> None:
    _set(writer, schreiben="deepseek/deepseek-v3.2")

    assert writer.post(WRITE, json={}).status_code == 200

    assert provider.requests[-1].model == "deepseek/deepseek-v3.2"


def test_the_model_of_the_story_comes_before_the_task_model(
    writer: TestClient, provider: FakeProvider
) -> None:
    _set(writer, schreiben="deepseek/deepseek-v3.2")
    writer.patch(STORY, json={"model": "x-ai/grok-4.7"})

    writer.post(WRITE, json={})
    writer.post(WRITE, json={"model": "openai/gpt-5"})

    assert [request.model for request in provider.requests] == ["x-ai/grok-4.7", "openai/gpt-5"]


def test_a_saved_model_no_longer_offered_gives_way_to_the_preset(
    writer: TestClient, provider: FakeProvider, data_dir: Path
) -> None:
    DocumentStore(data_dir).write(PATH, {"aufgaben": {"schreiben": "weg/modell"}}, "")

    writer.post(WRITE, json={})

    assert provider.requests[-1].model == DEFAULT_MODEL


def test_world_builder_and_appearance_start_with_their_task_models(
    writer: TestClient, provider: FakeProvider
) -> None:
    _set(writer, weltenbau="deepseek/deepseek-v3.2", aussehen="openai/gpt-5")

    writer.post(
        f"{WORLD}/worldbuilder",
        json={"messages": [{"role": "user", "content": "Ein Fährmann für den Hafen."}]},
    )
    writer.post(f"{WORLD}/entries/kael/appearance", json={})

    assert [request.model for request in provider.requests] == [
        "deepseek/deepseek-v3.2",
        "openai/gpt-5",
    ]


def test_summaries_take_their_own_task_models(writer: TestClient, provider: FakeProvider) -> None:
    _set(writer, kurzfassung="deepseek/deepseek-v3.2", gesamtzusammenfassung="openai/gpt-5")

    response = writer.post(f"{STORY}/chapters/1/summarize")

    assert response.status_code == 200, response.text
    assert response.json()["failure"] is None
    assert [request.model for request in provider.requests] == [
        "deepseek/deepseek-v3.2",
        "openai/gpt-5",
    ]
    usage = writer.get("/api/usage").json()
    assert usage["requests"] == 2


def test_summaries_without_task_models_keep_the_preset(
    writer: TestClient, provider: FakeProvider
) -> None:
    writer.post(f"{STORY}/chapters/1/summarize")

    assert [request.model for request in provider.requests] == [DEFAULT_MODEL, DEFAULT_MODEL]


def test_image_models_preset_the_saved_one(logged_in: TestClient) -> None:
    assert logged_in.get("/api/images/models").json()["default"] == ("black-forest-labs/flux.2-pro")

    _set(logged_in, bilderzeugung="bytedance-seed/seedream-4.5")

    assert logged_in.get("/api/images/models").json()["default"] == "bytedance-seed/seedream-4.5"


def test_image_preset_falls_back_when_the_saved_model_is_gone(
    logged_in: TestClient, data_dir: Path
) -> None:
    DocumentStore(data_dir).write(PATH, {"aufgaben": {"bilderzeugung": "weg/bild"}}, "")

    assert logged_in.get("/api/images/models").json()["default"] == ("black-forest-labs/flux.2-pro")


@pytest.mark.parametrize(
    "header",
    [{"aufgaben": ["x-ai/grok-4.6"]}, {"aufgaben": {"schreiben": 3}}],
)
def test_a_broken_task_field_is_reported(tmp_path: Path, header: dict[str, Any]) -> None:
    store = DocumentStore(tmp_path / "data")
    store.write(PATH, header, "")

    with pytest.raises(InvalidInput, match="aufgaben"):
        Favorites(store).tasks()


def test_unknown_tasks_in_the_file_are_left_out(tmp_path: Path) -> None:
    store = DocumentStore(tmp_path / "data")
    store.write(PATH, {"aufgaben": {"zaubern": "x", "aussehen": "x-ai/grok-4.6"}}, "")

    favorites = Favorites(store)

    assert favorites.tasks() == {"aussehen": "x-ai/grok-4.6"}
    assert favorites.get() == ["x-ai/grok-4.6", "qwen/qwen3.8-max-0902"]


def test_summary_flow_refuses_an_unknown_overall_model(tmp_path: Path) -> None:
    store = DocumentStore(tmp_path / "data")
    canon, manuscripts = CanonService(store), ManuscriptService(store)
    canon.create_world("Die Salzmark", "Salz.")
    manuscripts.create_story("die-salzmark", "Die Flut", "roman")
    provider = FakeProvider()

    with pytest.raises(InvalidInput, match="erfunden/modell"):
        asyncio.run(
            summarize_chapter(
                manuscripts,
                ContextBuilder(canon, manuscripts),
                provider,
                "die-salzmark",
                "die-flut",
                1,
                overall_model="erfunden/modell",
            )
        )
    assert provider.requests == []

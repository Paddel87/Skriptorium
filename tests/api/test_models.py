"""Tests for the model catalog and the favorites over the API (roadmap step 5.12, ADR-055)."""

from fastapi.testclient import TestClient

from skriptorium.api.favorites import PATH
from tests.api.conftest import FakeCatalogServer, FakeProvider, services_of
from tests.api.test_writing import WRITE, writer

__all__ = ["writer"]

STORY = "/api/worlds/die-salzmark/stories/am-ufer"


def test_model_list_has_start_favorites_and_catalog(logged_in: TestClient) -> None:
    body = logged_in.get("/api/models").json()

    assert body["models"] == ["x-ai/grok-4.6", "qwen/qwen3.8-max-0902"]
    assert body["favorites"] == body["models"]
    assert body["default"] == "x-ai/grok-4.6"
    assert body["catalog_available"] is True
    assert [entry["id"] for entry in body["catalog"]] == [
        "deepseek/deepseek-v3.2",
        "openai/gpt-5",
        "x-ai/grok-4.6",
        "x-ai/grok-4.7",
    ]
    grok = body["catalog"][2]
    assert grok == {
        "id": "x-ai/grok-4.6",
        "name": "SpaceXAI: Grok 4.6",
        "provider": "x-ai",
        "input_price": 2.0,
        "output_price": 6.0,
        "estimated_cost": 0.063,
        "context_length": 500000,
        "moderated": False,
        "thinking": "vor",
        "checked": True,
    }
    deepseek, gpt = body["catalog"][0], body["catalog"][1]
    assert (deepseek["thinking"], deepseek["checked"], deepseek["moderated"]) == (
        None,
        False,
        False,
    )
    assert (gpt["thinking"], gpt["moderated"]) == ("vor", True)
    assert (body["catalog"][3]["thinking"], body["catalog"][3]["checked"]) == ("lange", False)


def test_catalog_is_loaded_once_per_hour(
    logged_in: TestClient, catalog_server: FakeCatalogServer
) -> None:
    logged_in.get("/api/models")
    logged_in.get("/api/models")

    assert catalog_server.calls == 1


def test_model_list_without_catalog_keeps_favorites(
    logged_in: TestClient, catalog_server: FakeCatalogServer
) -> None:
    catalog_server.down = True

    body = logged_in.get("/api/models").json()

    assert body["favorites"] == ["x-ai/grok-4.6", "qwen/qwen3.8-max-0902"]
    assert body["catalog"] == []
    assert body["catalog_available"] is False


def test_favorites_are_saved_on_the_server(logged_in: TestClient) -> None:
    response = logged_in.put(
        "/api/models/favoriten",
        json={"favorites": ["deepseek/deepseek-v3.2", "x-ai/grok-4.6", "deepseek/deepseek-v3.2"]},
    )

    assert response.status_code == 200
    assert response.json()["favorites"] == ["deepseek/deepseek-v3.2", "x-ai/grok-4.6"]
    assert logged_in.get("/api/models").json()["models"] == [
        "deepseek/deepseek-v3.2",
        "x-ai/grok-4.6",
    ]
    stored = services_of(logged_in).favorites
    assert stored.get() == ["deepseek/deepseek-v3.2", "x-ai/grok-4.6"]


def test_unknown_favorite_is_refused(logged_in: TestClient) -> None:
    response = logged_in.put("/api/models/favoriten", json={"favorites": ["erfunden/modell"]})

    assert response.status_code == 422
    assert response.json() == {"detail": "Unbekanntes Modell: erfunden/modell"}


def test_favorite_stays_allowed_while_catalog_is_down(
    logged_in: TestClient, catalog_server: FakeCatalogServer
) -> None:
    logged_in.put("/api/models/favoriten", json={"favorites": ["deepseek/deepseek-v3.2"]})
    services_of(logged_in).catalog._loaded_at = None  # catalog internals: forget the load
    catalog_server.down = True

    response = logged_in.put(
        "/api/models/favoriten", json={"favorites": ["x-ai/grok-4.7", "deepseek/deepseek-v3.2"]}
    )

    assert response.status_code == 200
    assert response.json()["favorites"] == ["x-ai/grok-4.7", "deepseek/deepseek-v3.2"]


def test_too_many_favorites_are_refused(logged_in: TestClient) -> None:
    many = [f"a/m{index}" for index in range(51)]

    response = logged_in.put("/api/models/favoriten", json={"favorites": many})

    assert response.status_code == 422
    assert response.json() == {"detail": "Höchstens 50 Favoriten"}


def test_broken_favorites_file_answers_422(logged_in: TestClient) -> None:
    store = services_of(logged_in).favorites._store  # favorites internals: test setup
    store.write(PATH, {"favoriten": "x-ai/grok-4.6"}, "")

    assert logged_in.get("/api/models").status_code == 422


def test_catalog_model_can_write_with_reasoning_from_catalog(
    writer: TestClient, provider: FakeProvider
) -> None:
    response = writer.post(WRITE, json={"model": "openai/gpt-5"})

    assert response.status_code == 200
    assert provider.requests[0].model == "openai/gpt-5"
    catalog = services_of(writer).catalog
    assert dict(catalog["openai/gpt-5"].reasoning) == {"effort": "minimal"}
    assert dict(catalog["deepseek/deepseek-v3.2"].reasoning) == {"enabled": False}
    assert dict(catalog["x-ai/grok-4.7"].reasoning) == {"effort": "low"}


def test_unknown_model_cannot_write(writer: TestClient) -> None:
    response = writer.post(WRITE, json={"model": "erfunden/modell"})

    assert response.status_code == 422
    assert response.json() == {"detail": "Unbekanntes Modell: erfunden/modell"}


def test_story_keeps_a_catalog_model_outside_the_favorites(writer: TestClient) -> None:
    response = writer.patch(STORY, json={"model": "deepseek/deepseek-v3.2"})

    assert response.status_code == 200
    assert response.json()["model"] == "deepseek/deepseek-v3.2"
    assert writer.patch(STORY, json={"model": "erfunden/modell"}).status_code == 422


def test_model_endpoints_need_a_session(client: TestClient) -> None:
    assert client.get("/api/models").status_code == 401
    assert client.put("/api/models/favoriten", json={"favorites": []}).status_code == 401

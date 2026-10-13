"""Without an AI key the flows that call a model answer 503 before touching any data."""

from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from skriptorium.api import create_app
from skriptorium.api.settings import Settings
from tests.api.conftest import ORIGIN, PASSWORD, cheap_hasher, set_up_password

WORLD = "/api/worlds/die-salzmark"


@pytest.fixture
def keyless(data_dir: Path) -> Iterator[TestClient]:
    app = create_app(
        Settings(data_dir=data_dir, ui_dir=data_dir / "no-ui"),
        hasher=cheap_hasher(),
        provider_factory=lambda _: None,
        image_provider_factory=lambda _: None,
    )
    with TestClient(app, base_url=ORIGIN, headers={"Origin": ORIGIN}) as client:
        set_up_password(client)
        assert client.post("/api/auth/login", json={"password": PASSWORD}).status_code == 204
        yield client


@pytest.mark.parametrize(
    "path",
    [
        f"{WORLD}/entries/kael/appearance",
        f"{WORLD}/entries/kael/images/bild-000000000000.png/describe",
        f"{WORLD}/maps/karte-000000000000.png/describe",
    ],
)
def test_models_are_not_called_without_a_key(keyless: TestClient, path: str) -> None:
    response = keyless.post(path, json={"model": "x-ai/grok-4.6"})
    assert response.status_code == 503
    assert response.json()["detail"] == "KI-Anbieter nicht eingerichtet"

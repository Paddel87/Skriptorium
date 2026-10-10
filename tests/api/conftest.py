"""Fixtures for the ``api`` tests: app on a temporary data directory, cheap scrypt, fake time,
a fake AI provider."""

from collections.abc import AsyncIterator, Iterator, Sequence
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import cast

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from skriptorium.ai_gateway import (
    Completed,
    CompletionRequest,
    GatewayError,
    ModelCatalog,
    StreamEvent,
    TextChunk,
    Usage,
)
from skriptorium.api import create_app
from skriptorium.api.access import PasswordHasher, PwnedUnavailable
from skriptorium.api.context import Services
from skriptorium.api.settings import Settings

# 24 characters, no context word
PASSWORD = "Salzwind über der Mark 7"  # noqa: S105 - test data, not a secret
ORIGIN = "https://testserver"


@dataclass
class FakeClock:
    """A clock the tests move forward."""

    now: datetime = field(default_factory=lambda: datetime(2026, 9, 26, 12, 0, tzinfo=UTC))

    def __call__(self) -> datetime:
        return self.now

    def advance(self, delta: timedelta) -> None:
        self.now += delta


@dataclass
class FakeBreached:
    """Stands in for Pwned Passwords."""

    breached: set[str] = field(default_factory=set)
    unavailable: bool = False
    asked: list[str] = field(default_factory=list)

    def is_breached(self, password: str) -> bool:
        self.asked.append(password)
        if self.unavailable:
            raise PwnedUnavailable("test")
        return password in self.breached


@dataclass
class FakeProvider:
    """Stands in for the AI provider: streams ``chunks``, then ``Completed`` or ``error``."""

    name: str = "fake"
    chunks: Sequence[str] = ("Der Nebel ", "hob sich.")
    error: GatewayError | None = None
    requests: list[CompletionRequest] = field(default_factory=list)
    closed: int = 0
    finished: bool = False

    async def stream(self, request: CompletionRequest) -> AsyncIterator[StreamEvent]:
        self.requests.append(request)
        try:
            for chunk in self.chunks:
                yield TextChunk(chunk)
            if self.error is not None:
                raise self.error
            yield Completed(Usage(1200, 40, 0.0021), "stop")
            self.finished = True
        finally:
            self.closed += 1

    async def aclose(self) -> None:
        """Called when the application shuts down."""


def cheap_hasher() -> PasswordHasher:
    """scrypt with small cost; the default parameters are tested separately."""
    return PasswordHasher(n=2**10, r=8, p=1)


@pytest.fixture
def clock() -> FakeClock:
    return FakeClock()


@pytest.fixture
def breached() -> FakeBreached:
    return FakeBreached()


@pytest.fixture
def provider() -> FakeProvider:
    return FakeProvider()


@pytest.fixture
def data_dir(tmp_path: Path) -> Path:
    return tmp_path / "data"


CATALOG = {
    "data": [
        {
            "id": "x-ai/grok-4.6",
            "name": "SpaceXAI: Grok 4.6",
            "context_length": 500000,
            "architecture": {"output_modalities": ["text"]},
            "pricing": {"prompt": "0.000002", "completion": "0.000006"},
            "top_provider": {"is_moderated": False},
            "reasoning": {"mandatory": True, "supported_efforts": ["high", "medium", "low"]},
        },
        {
            "id": "x-ai/grok-4.7",
            "name": "SpaceXAI: Grok 4.7",
            "context_length": 500000,
            "architecture": {"output_modalities": ["text"]},
            "pricing": {"prompt": "0.000002", "completion": "0.000006"},
            "top_provider": {"is_moderated": False},
            "reasoning": {"mandatory": True, "supported_efforts": ["high", "low"]},
        },
        {
            "id": "deepseek/deepseek-v3.2",
            "name": "DeepSeek: DeepSeek V3.2",
            "context_length": 163840,
            "architecture": {"output_modalities": ["text"]},
            "pricing": {"prompt": "0.000000259", "completion": "0.0000008"},
            "top_provider": {"is_moderated": False},
            "reasoning": {"mandatory": False},
        },
        {
            "id": "openai/gpt-5",
            "name": "OpenAI: GPT-5",
            "context_length": 400000,
            "architecture": {"output_modalities": ["text"]},
            "pricing": {"prompt": "0.00000125", "completion": "0.00001"},
            "top_provider": {"is_moderated": True},
            "reasoning": {"mandatory": True, "supported_efforts": ["high", "low", "minimal"]},
        },
    ]
}


@dataclass
class FakeCatalogServer:
    """Stands in for OpenRouter's model list; ``down`` answers 503."""

    down: bool = False
    calls: int = 0

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.calls += 1
        if self.down:
            return httpx.Response(503)
        return httpx.Response(200, json=CATALOG)


@pytest.fixture
def catalog_server() -> FakeCatalogServer:
    return FakeCatalogServer()


@pytest.fixture
def catalog(catalog_server: FakeCatalogServer) -> ModelCatalog:
    return ModelCatalog(transport=httpx.MockTransport(catalog_server))


@pytest.fixture
def client(
    data_dir: Path,
    clock: FakeClock,
    breached: FakeBreached,
    provider: FakeProvider,
    catalog: ModelCatalog,
) -> Iterator[TestClient]:
    app = create_app(
        Settings(data_dir=data_dir, ui_dir=data_dir / "no-ui"),
        hasher=cheap_hasher(),
        breached=breached,
        clock=clock,
        provider_factory=lambda _: provider,
        catalog=catalog,
    )
    with TestClient(app, base_url=ORIGIN, headers={"Origin": ORIGIN}) as test_client:
        yield test_client


def services_of(client: TestClient) -> Services:
    found: Services = cast(FastAPI, client.app).state.services
    return found


def set_up_password(client: TestClient, password: str = PASSWORD) -> None:
    """Set the password with a fresh setup code."""
    code = services_of(client).credentials.create_setup_code()
    response = client.post("/api/auth/setup", json={"code": code, "password": password})
    assert response.status_code == 204, response.text


@pytest.fixture
def logged_in(client: TestClient) -> TestClient:
    """A client with password set and a valid session cookie."""
    set_up_password(client)
    response = client.post("/api/auth/login", json={"password": PASSWORD})
    assert response.status_code == 204, response.text
    return client

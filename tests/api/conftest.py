"""Fixtures for the ``api`` tests: app on a temporary data directory, cheap scrypt, fake time."""

from collections.abc import Iterator
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import cast

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

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
def data_dir(tmp_path: Path) -> Path:
    return tmp_path / "data"


@pytest.fixture
def client(data_dir: Path, clock: FakeClock, breached: FakeBreached) -> Iterator[TestClient]:
    app = create_app(
        Settings(data_dir=data_dir, ui_dir=data_dir / "no-ui"),
        hasher=cheap_hasher(),
        breached=breached,
        clock=clock,
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

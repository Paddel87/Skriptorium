"""HTTP tests of setup, login, logout, password change and session overview (ADR-017)."""

import logging
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from skriptorium.api.access import sessions as sessions_module
from skriptorium.api.access import throttle as throttle_module
from skriptorium.api.context import SESSION_COOKIE
from tests.api.conftest import (
    ORIGIN,
    PASSWORD,
    FakeBreached,
    FakeClock,
    services_of,
    set_up_password,
)

NEW_PASSWORD = "Nebel über dem Hafen von Kiel"  # noqa: S105 - test data, not a secret


def _login(client: TestClient, password: str = PASSWORD) -> int:
    code: int = client.post("/api/auth/login", json={"password": password}).status_code
    return code


def test_login_before_setup_is_refused(client: TestClient) -> None:
    assert _login(client) == 409


def test_setup_login_and_cookie_attributes(client: TestClient) -> None:
    set_up_password(client)
    response = client.post("/api/auth/login", json={"password": PASSWORD})
    assert response.status_code == 204
    cookie = response.headers["set-cookie"]
    assert cookie.startswith(f"{SESSION_COOKIE}=")
    for attribute in ("HttpOnly", "Secure", "SameSite=strict", "Path=/", "Max-Age=2592000"):
        assert attribute in cookie
    assert "Domain" not in cookie
    assert client.get("/api/auth/session").json()["current"] is True


def test_setup_with_wrong_code_and_rejected_password(
    client: TestClient, breached: FakeBreached
) -> None:
    code = services_of(client).credentials.create_setup_code()
    wrong = client.post("/api/auth/setup", json={"code": "falsch", "password": PASSWORD})
    assert wrong.status_code == 403
    short = client.post("/api/auth/setup", json={"code": code, "password": "kurz"})
    assert short.status_code == 422
    assert short.json()["detail"] == {"reason": "too_short"}
    breached.unavailable = True
    down = client.post("/api/auth/setup", json={"code": code, "password": PASSWORD})
    assert down.status_code == 503
    breached.unavailable = False
    assert (
        client.post("/api/auth/setup", json={"code": code, "password": PASSWORD}).status_code == 204
    )
    again = client.post("/api/auth/setup", json={"code": code, "password": NEW_PASSWORD})
    assert again.status_code == 403


def test_world_names_are_context_words(client: TestClient) -> None:
    services_of(client).canon.create_world("Die Salzmark")
    code = services_of(client).credentials.create_setup_code()
    response = client.post(
        "/api/auth/setup", json={"code": code, "password": "Winter in der Salzmark 1"}
    )
    assert response.json()["detail"] == {"reason": "context_word"}


def test_setup_ends_all_sessions(logged_in: TestClient) -> None:
    set_up_password(logged_in, NEW_PASSWORD)
    assert logged_in.get("/api/auth/session").status_code == 401


def test_wrong_password_and_throttle_per_client(client: TestClient, clock: FakeClock) -> None:
    set_up_password(client)
    for _ in range(throttle_module.MAX_FAILURES):
        assert _login(client, "falsches Passwort!!") == 401
    assert _login(client) == 429  # blocked even with the right password
    clock.advance(throttle_module.WINDOW)
    assert _login(client) == 204


def test_login_replaces_old_session_token(logged_in: TestClient) -> None:
    old = logged_in.cookies[SESSION_COOKIE]
    assert _login(logged_in) == 204
    new = logged_in.cookies[SESSION_COOKIE]
    assert new != old
    assert services_of(logged_in).sessions.touch(old) is None


def test_logout_invalidates_session_at_server(logged_in: TestClient) -> None:
    token = logged_in.cookies[SESSION_COOKIE]
    response = logged_in.post("/api/auth/logout")
    assert response.status_code == 204
    assert f'{SESSION_COOKIE}=""' in response.headers["set-cookie"]
    logged_in.cookies.set(SESSION_COOKIE, token, domain="testserver")
    assert logged_in.get("/api/auth/session").status_code == 401


def test_session_expires_after_idle_time(logged_in: TestClient, clock: FakeClock) -> None:
    clock.advance(sessions_module.IDLE_TIMEOUT)
    assert logged_in.get("/api/worlds").status_code == 401


def test_sessions_overview_and_ending(logged_in: TestClient, clock: FakeClock) -> None:
    clock.advance(timedelta(minutes=1))
    other = TestClient(logged_in.app, base_url=ORIGIN, headers={"Origin": ORIGIN})
    other.headers["User-Agent"] = "Handy"
    assert _login(other) == 204
    listed = logged_in.get("/api/auth/sessions").json()
    assert len(listed) == 2
    assert [s["current"] for s in listed] == [False, True]
    assert listed[0]["client"] == "Handy"
    assert logged_in.delete(f"/api/auth/sessions/{listed[0]['id']}").status_code == 204
    assert other.get("/api/auth/session").status_code == 401
    assert logged_in.delete(f"/api/auth/sessions/{listed[0]['id']}").status_code == 404
    assert _login(other) == 204
    assert logged_in.delete("/api/auth/sessions").status_code == 204
    assert other.get("/api/auth/session").status_code == 401
    assert logged_in.get("/api/auth/session").status_code == 200


def test_password_change(logged_in: TestClient, breached: FakeBreached) -> None:
    other = TestClient(logged_in.app, base_url=ORIGIN, headers={"Origin": ORIGIN})
    assert _login(other) == 204
    old_token = logged_in.cookies[SESSION_COOKIE]

    def change(current: str, new: str, end_others: bool = False) -> int:
        response = logged_in.post(
            "/api/auth/password",
            json={
                "current_password": current,
                "new_password": new,
                "end_other_sessions": end_others,
            },
        )
        code: int = response.status_code
        return code

    assert change("falsch", NEW_PASSWORD) == 403
    breached.breached.add(NEW_PASSWORD)
    assert change(PASSWORD, NEW_PASSWORD) == 422
    breached.breached.clear()
    breached.unavailable = True
    assert change(PASSWORD, NEW_PASSWORD) == 503
    breached.unavailable = False
    assert change(PASSWORD, NEW_PASSWORD, end_others=True) == 204
    assert logged_in.cookies[SESSION_COOKIE] != old_token  # new token (ASVS 7.2.4)
    assert logged_in.get("/api/auth/session").status_code == 200
    assert other.get("/api/auth/session").status_code == 401
    assert _login(logged_in, PASSWORD) == 401
    assert _login(logged_in, NEW_PASSWORD) == 204


def test_password_change_keeps_other_sessions_by_default(logged_in: TestClient) -> None:
    other = TestClient(logged_in.app, base_url=ORIGIN, headers={"Origin": ORIGIN})
    assert _login(other) == 204
    response = logged_in.post(
        "/api/auth/password", json={"current_password": PASSWORD, "new_password": NEW_PASSWORD}
    )
    assert response.status_code == 204
    assert other.get("/api/auth/session").status_code == 200


def test_access_log_has_metadata_but_no_secrets(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    caplog.set_level(logging.INFO)
    code = services_of(client).credentials.create_setup_code()
    client.post("/api/auth/setup", json={"code": code, "password": PASSWORD})
    _login(client, "falsches Passwort!!")
    _login(client)
    messages = [record.getMessage() for record in caplog.records]
    assert any("vorgang=einrichtung ergebnis=erfolg absender=testclient" in m for m in messages)
    assert any("vorgang=anmeldung ergebnis=falsches_passwort" in m for m in messages)
    assert any("vorgang=anmeldung ergebnis=erfolg" in m for m in messages)
    token = client.cookies[SESSION_COOKIE]
    for message in messages:
        for secret in (PASSWORD, "falsches Passwort!!", code, token):
            assert secret not in message


def test_blocked_attempts_are_logged(client: TestClient, caplog: pytest.LogCaptureFixture) -> None:
    set_up_password(client)
    for _ in range(throttle_module.MAX_FAILURES + 1):
        _login(client, "falsches Passwort!!")
    assert any("ergebnis=gesperrt" in r.getMessage() for r in caplog.records)


def test_session_lifetime_is_absolute(logged_in: TestClient, clock: FakeClock) -> None:
    for _ in range(5):
        clock.advance(timedelta(days=6))
        logged_in.get("/api/auth/session")
    assert logged_in.get("/api/auth/session").status_code == 401

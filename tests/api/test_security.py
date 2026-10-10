"""Every endpoint except health check, login and setup needs a session; request checks."""

import logging
import re
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import Response

from skriptorium.api import create_app
from skriptorium.api.settings import Settings
from tests.api.conftest import ORIGIN, FakeBreached, cheap_hasher

PUBLIC = {("GET", "/api/health"), ("POST", "/api/auth/login"), ("POST", "/api/auth/setup")}


def _routes(app: FastAPI) -> list[tuple[str, str]]:
    """All routes as listed in the (unpublished) OpenAPI description."""
    return sorted(
        (method.upper(), path)
        for path, operations in app.openapi()["paths"].items()
        for method in operations
    )


def test_route_list_is_complete(client: TestClient) -> None:
    app = client.app
    assert isinstance(app, FastAPI)
    routes = _routes(app)
    assert len(routes) == 42
    assert set(routes) >= PUBLIC


def test_every_protected_endpoint_refuses_without_session(client: TestClient) -> None:
    app = client.app
    assert isinstance(app, FastAPI)
    checked = 0
    for method, path in _routes(app):
        if (method, path) in PUBLIC:
            continue
        url = re.sub(r"\{number\}", "1", path)
        url = re.sub(r"\{[a-z_]+\}", "x", url)
        response = client.request(method, url, json={})
        assert response.status_code == 401, (method, path, response.status_code)
        checked += 1
    assert checked == 39


def test_invalid_session_cookie_is_refused(client: TestClient) -> None:
    client.cookies.set("__Host-sitzung", "erfunden", domain="testserver")
    assert client.get("/api/worlds").status_code == 401


@pytest.mark.parametrize("origin", [None, "https://evil.example", "null"])
def test_changing_requests_need_own_origin(logged_in: TestClient, origin: str | None) -> None:
    headers = {"Origin": origin} if origin else {}
    if origin is None:
        del logged_in.headers["Origin"]
    response = logged_in.post("/api/worlds", json={"name": "Neu"}, headers=headers)
    assert response.status_code == 403
    assert logged_in.get("/api/worlds").status_code == 200  # reading needs no Origin


def test_changing_requests_need_json(logged_in: TestClient) -> None:
    response = logged_in.post(
        "/api/worlds", content=b"name=Neu", headers={"Content-Type": "text/plain"}
    )
    assert response.status_code == 415
    empty = logged_in.post("/api/auth/logout")
    assert empty.status_code == 204  # no body, no content type needed


def test_hsts_and_no_cors_headers(client: TestClient) -> None:
    response = client.get("/api/health", headers={"Origin": "https://evil.example"})
    assert response.headers["strict-transport-security"] == "max-age=31536000; includeSubDomains"
    assert not any(h.lower().startswith("access-control-") for h in response.headers)


_EXPECTED_HEADERS = {
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
}


def _assert_security_headers(response: Response) -> None:
    for name, value in _EXPECTED_HEADERS.items():
        assert response.headers.get_list(name) == [value], name


def test_security_headers_on_answered_and_refused_requests(client: TestClient) -> None:
    _assert_security_headers(client.get("/api/health"))  # public
    _assert_security_headers(client.get("/api/worlds"))  # no session: 401
    refused = client.post("/api/worlds", json={"name": "Neu"}, headers={"Origin": "https://x.io"})
    assert refused.status_code == 403
    _assert_security_headers(refused)
    _assert_security_headers(client.get("/api/unbekannt"))  # 404


def test_security_headers_on_interface_files(tmp_path: Path) -> None:
    ui = tmp_path / "ui"
    (ui / "assets").mkdir(parents=True)
    (ui / "index.html").write_text("<p>Skriptorium</p>", encoding="utf-8")
    (ui / "assets" / "app.js").write_text("export {};", encoding="utf-8")
    (ui / "assets" / "app.css").write_text("p{}", encoding="utf-8")
    app = create_app(
        Settings(data_dir=tmp_path / "data", ui_dir=ui),
        hasher=cheap_hasher(),
        breached=FakeBreached(),
    )
    client = TestClient(app, base_url=ORIGIN)
    expected_types = {
        "/": "text/html",
        "/assets/app.js": "text/javascript",
        "/assets/app.css": "text/css",
    }
    for path, content_type in expected_types.items():
        response = client.get(path)
        _assert_security_headers(response)
        # nosniff makes browsers refuse scripts and styles with a wrong type
        assert response.headers["content-type"].startswith(content_type), path


def test_security_headers_on_unexpected_server_error(tmp_path: Path) -> None:
    app = create_app(
        Settings(data_dir=tmp_path / "data", ui_dir=tmp_path / "no-ui"),
        hasher=cheap_hasher(),
        breached=FakeBreached(),
    )

    @app.get("/api/kaputt")
    def broken() -> None:
        raise RuntimeError("geheimes Detail")

    client = TestClient(app, base_url=ORIGIN, raise_server_exceptions=False)
    response = client.get("/api/kaputt")
    assert response.status_code == 500
    assert response.json() == {"detail": "Interner Fehler"}
    _assert_security_headers(response)


def test_no_api_documentation_published(client: TestClient) -> None:
    for path in ("/docs", "/redoc", "/openapi.json"):
        assert client.get(path).status_code == 404


def test_request_log_shows_route_template_not_names(
    logged_in: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    caplog.set_level(logging.INFO, logger="skriptorium.api")
    logged_in.post("/api/worlds", json={"name": "Geheimland"})
    logged_in.get("/api/worlds/geheimland")
    logged_in.get("/api/unbekannt")
    messages = [r.getMessage() for r in caplog.records if r.name == "skriptorium.api"]
    assert any("route=/api/worlds/{world_id} status=200" in m for m in messages)
    assert any("route=- status=404" in m for m in messages)
    assert not any("eheimland" in m for m in messages)


def test_ui_is_served_without_session(tmp_path: Path) -> None:
    ui = tmp_path / "ui"
    ui.mkdir()
    (ui / "index.html").write_text("<p>Skriptorium</p>", encoding="utf-8")
    app = create_app(
        Settings(data_dir=tmp_path / "data", ui_dir=ui),
        hasher=cheap_hasher(),
        breached=FakeBreached(),
    )
    client = TestClient(app, base_url=ORIGIN)
    assert "Skriptorium" in client.get("/").text
    assert client.get("/api/worlds").status_code == 401


def test_settings_from_environment(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setenv("SKRIPTORIUM_DATA_DIR", str(tmp_path / "d"))
    assert Settings.from_environment().data_dir == tmp_path / "d"
    monkeypatch.delenv("SKRIPTORIUM_DATA_DIR")
    assert Settings.from_environment().data_dir == Path("data")


def test_create_app_from_environment(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setenv("SKRIPTORIUM_DATA_DIR", str(tmp_path / "d"))
    client = TestClient(create_app(), base_url=ORIGIN)
    assert client.get("/api/health").json() == {"status": "ok"}
    assert (tmp_path / "d" / "index.sqlite").exists()


def test_logging_of_skriptorium_is_configured(client: TestClient, tmp_path: Path) -> None:
    logger = logging.getLogger("skriptorium")
    assert logger.level == logging.INFO
    assert len(logger.handlers) == 1
    create_app(Settings(data_dir=tmp_path / "data"), breached=FakeBreached())
    assert len(logger.handlers) == 1

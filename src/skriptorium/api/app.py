"""Application factory: health check, access protection, endpoints of the domain modules.

Requirements from ASVS 5.0.0 (ADR-006, ADR-017) are named where they are implemented.
"""

import logging
import time
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Final
from urllib.parse import urlsplit

from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from skriptorium.ai_gateway import ModelProvider, OpenRouterProvider, ProviderUnavailable
from skriptorium.api import auth_routes, canon_routes, manuscript_routes, writing_routes
from skriptorium.api.access import (
    CredentialStore,
    FailureThrottle,
    PasswordHasher,
    PasswordPolicy,
    PwnedPasswords,
    SessionStore,
)
from skriptorium.api.access.pwned import BreachedPasswordCheck
from skriptorium.api.context import Services
from skriptorium.api.settings import Settings
from skriptorium.canon import CanonService
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import (
    AlreadyExists,
    DocumentStore,
    InvalidInput,
    NotFound,
    StorageError,
)

_SAFE_METHODS: Final = frozenset({"GET", "HEAD", "OPTIONS"})
_HSTS: Final = "max-age=31536000; includeSubDomains"
_log = logging.getLogger("skriptorium.api")

Clock = Callable[[], datetime]
ProviderFactory = Callable[[], ModelProvider | None]


class Health(BaseModel):
    """Response body of the health check."""

    status: str


def create_app(
    settings: Settings | None = None,
    *,
    hasher: PasswordHasher | None = None,
    breached: BreachedPasswordCheck | None = None,
    clock: Clock | None = None,
    provider_factory: ProviderFactory | None = None,
) -> FastAPI:
    """Build the FastAPI application.

    Args:
        settings: Configuration; read from the environment if missing.
        hasher: Password hasher; tests pass cheaper scrypt parameters.
        breached: Check against breached passwords; Pwned Passwords if missing.
        clock: Source of the current time (UTC); tests pass a controllable clock.
        provider_factory: Creates the AI provider; OpenRouter with the key from the environment
            if missing. Without a key the server runs, writing answers 503.
    """
    _configure_logging()
    settings = settings or Settings.from_environment()
    now = clock or (lambda: datetime.now(UTC))
    store = DocumentStore(settings.data_dir)
    canon = CanonService(store)
    manuscript = ManuscriptService(store)
    provider = (provider_factory or _provider_from_environment)()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        yield
        close = getattr(provider, "aclose", None)
        if close is not None:
            await close()

    app = FastAPI(
        title="Skriptorium", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan
    )
    app.state.services = Services(
        canon=canon,
        manuscript=manuscript,
        credentials=CredentialStore(store, hasher or PasswordHasher(), now),
        policy=PasswordPolicy(breached or PwnedPasswords()),
        sessions=SessionStore(now),
        throttle=FailureThrottle(now),
        clock=now,
        context=ContextBuilder(canon, manuscript),
        provider=provider,
    )

    @app.get("/api/health")
    def health() -> Health:
        """Report that the server is running; needs no session."""
        return Health(status="ok")

    app.include_router(auth_routes.public)
    app.include_router(auth_routes.protected)
    app.include_router(canon_routes.router)
    app.include_router(manuscript_routes.router)
    app.include_router(writing_routes.router)
    _add_error_handlers(app)
    app.middleware("http")(_origin_check)
    app.middleware("http")(_security_headers)
    app.middleware("http")(_request_log)
    if settings.ui_dir.is_dir():
        app.mount("/", StaticFiles(directory=settings.ui_dir, html=True), name="ui")
    return app


Next = Callable[[Request], Awaitable[Response]]


def _provider_from_environment() -> ModelProvider | None:
    """OpenRouter with the key from ``OPENROUTER_API_KEY``; ``None`` if the key is missing."""
    try:
        return OpenRouterProvider.from_environment()
    except ProviderUnavailable:
        _log.warning("ki-anbieter nicht eingerichtet schluessel=fehlt")
        return None


def _configure_logging() -> None:
    """Send the INFO lines of ``skriptorium`` to stderr; uvicorn configures only its own."""
    logger = logging.getLogger("skriptorium")
    if logger.handlers:
        return
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


async def _origin_check(request: Request, call_next: Next) -> Response:
    """Refuse cross-site changing requests (ASVS 3.5.1-3.5.3).

    Changing requests need an ``Origin`` that matches the own host; a body must be JSON, which
    a foreign site cannot send without a CORS preflight.
    """
    if request.method not in _SAFE_METHODS:
        origin = request.headers.get("origin", "")
        if not origin or urlsplit(origin).netloc != request.headers.get("host"):
            return _refuse(status.HTTP_403_FORBIDDEN, "Herkunft der Anfrage nicht erlaubt")
        has_body = request.headers.get("content-length", "0") != "0"
        media_type = request.headers.get("content-type", "").split(";")[0].strip().lower()
        if has_body and media_type != "application/json":
            return _refuse(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Nur JSON erlaubt")
    return await call_next(request)


async def _security_headers(request: Request, call_next: Next) -> Response:
    """HSTS on every response (ASVS 3.4.1); no CORS headers are ever sent (3.4.2)."""
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = _HSTS
    return response


async def _request_log(request: Request, call_next: Next) -> Response:
    """Log method, route template, status and duration; never paths with names or content."""
    started = time.perf_counter()
    response = await call_next(request)
    _log.info(
        "anfrage methode=%s route=%s status=%d dauer_ms=%d",
        request.method,
        _route_template(request),
        response.status_code,
        (time.perf_counter() - started) * 1000,
    )
    return response


def _route_template(request: Request) -> str:
    """The matched route pattern, e.g. ``/api/worlds/{world_id}``; ``-`` if none matched."""
    route = request.scope.get("route")
    return str(getattr(route, "path", "-")) or "/"


def _refuse(code: int, detail: str) -> Response:
    return JSONResponse({"detail": detail}, status_code=code)


def _add_error_handlers(app: FastAPI) -> None:
    """Map the common error kinds of the domain modules to HTTP status codes."""

    async def not_found(request: Request, error: Exception) -> Response:
        return _refuse(status.HTTP_404_NOT_FOUND, f"Nicht gefunden: {error}")

    async def already_exists(request: Request, error: Exception) -> Response:
        return _refuse(status.HTTP_409_CONFLICT, f"Existiert bereits: {error}")

    async def invalid_input(request: Request, error: Exception) -> Response:
        return _refuse(status.HTTP_422_UNPROCESSABLE_CONTENT, str(error))

    async def storage_error(request: Request, error: Exception) -> Response:
        _log.error("speicherfehler route=%s", _route_template(request))
        return _refuse(status.HTTP_500_INTERNAL_SERVER_ERROR, "Speichern fehlgeschlagen")

    app.add_exception_handler(NotFound, not_found)
    app.add_exception_handler(AlreadyExists, already_exists)
    app.add_exception_handler(InvalidInput, invalid_input)
    app.add_exception_handler(StorageError, storage_error)

"""Endpoints for setup, login, logout, password change and sessions (ADR-017)."""

import logging
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel

from skriptorium.api.access import (
    PasswordRejected,
    PwnedUnavailable,
    Session,
    SetupCodeInvalid,
)
from skriptorium.api.access.sessions import ABSOLUTE_LIFETIME
from skriptorium.api.access.throttle import Attempt, Blocked
from skriptorium.api.context import (
    SESSION_COOKIE,
    Services,
    ServicesDep,
    SessionDep,
    client_address,
    current_session,
)

_log = logging.getLogger("skriptorium.api.access")

public = APIRouter(prefix="/api/auth")
protected = APIRouter(prefix="/api/auth", dependencies=[Depends(current_session)])


class SetupRequest(BaseModel):
    """Set the password with the one-time setup code."""

    code: str
    password: str


class LoginRequest(BaseModel):
    """Log in with the password."""

    password: str


class PasswordChange(BaseModel):
    """Change the password; ``end_other_sessions`` implements ASVS 7.4.3."""

    current_password: str
    new_password: str
    end_other_sessions: bool = False


class SessionInfo(BaseModel):
    """A session as shown in the session overview."""

    id: str
    created: datetime
    last_seen: datetime
    client: str
    current: bool


@public.post("/setup", status_code=status.HTTP_204_NO_CONTENT)
def setup(body: SetupRequest, request: Request, found: ServicesDep) -> None:
    """Set the password with the setup code; all sessions end (ASVS 6.4.1, 6.4.3)."""
    with _attempt(found, request, "einrichtung") as (client, attempt):
        if not found.credentials.setup_code_valid(body.code):
            _fail(attempt, client, "einrichtung", "code_ungueltig")
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Einrichtungscode ungültig")
        _check_new_password(found, body.password)
        try:
            found.credentials.set_password_with_code(body.code, body.password)
        except SetupCodeInvalid as error:  # used or expired by a parallel request meanwhile
            _fail(attempt, client, "einrichtung", "code_verbraucht")
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Einrichtungscode ungültig") from error
    found.sessions.end_all()
    _log.info("zugang vorgang=einrichtung ergebnis=erfolg absender=%s", client)


@public.post("/login", status_code=status.HTTP_204_NO_CONTENT)
def login(body: LoginRequest, request: Request, response: Response, found: ServicesDep) -> None:
    """Log in; a new session token is issued every time (ASVS 7.2.4)."""
    with _attempt(found, request, "anmeldung") as (client, attempt):
        if not found.credentials.has_password():
            _log.info("zugang vorgang=anmeldung ergebnis=nicht_eingerichtet absender=%s", client)
            raise HTTPException(status.HTTP_409_CONFLICT, "Kein Passwort eingerichtet")
        if not found.credentials.verify_password(body.password):
            _fail(attempt, client, "anmeldung", "falsches_passwort")
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Passwort falsch")
    old_token = request.cookies.get(SESSION_COOKIE)
    if old_token:
        found.sessions.end(old_token)
    token, _ = found.sessions.create(request.headers.get("user-agent", ""))
    _set_cookie(response, token)
    _log.info("zugang vorgang=anmeldung ergebnis=erfolg absender=%s", client)


@protected.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request, response: Response, found: ServicesDep) -> None:
    """End the own session at the server (ASVS 7.4.1)."""
    found.sessions.end(request.cookies.get(SESSION_COOKIE, ""))
    response.delete_cookie(SESSION_COOKIE, path="/", secure=True, httponly=True, samesite="strict")
    _log.info("zugang vorgang=abmeldung ergebnis=erfolg absender=%s", client_address(request))


@protected.get("/session")
def own_session(session: SessionDep) -> SessionInfo:
    """The own session; HTTP 401 without a valid session."""
    return _info(session, current=True)


@protected.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    body: PasswordChange,
    request: Request,
    response: Response,
    session: SessionDep,
    found: ServicesDep,
) -> None:
    """Change the password with the current one (ASVS 6.2.3, 7.5.1)."""
    with _attempt(found, request, "passwortwechsel") as (client, attempt):
        if not found.credentials.verify_password(body.current_password):
            _fail(attempt, client, "passwortwechsel", "falsches_passwort")
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Bisheriges Passwort falsch")
    _check_new_password(found, body.new_password)
    found.credentials.set_password(body.new_password)
    if body.end_other_sessions:
        found.sessions.end_all(except_id=session.id)
    renewed = found.sessions.renew(request.cookies.get(SESSION_COOKIE, ""))
    if renewed is not None:
        _set_cookie(response, renewed[0])
    _log.info("zugang vorgang=passwortwechsel ergebnis=erfolg absender=%s", client)


@protected.get("/sessions")
def list_sessions(session: SessionDep, found: ServicesDep) -> list[SessionInfo]:
    """All active sessions, newest first (ASVS 7.5.2)."""
    return [_info(s, current=s.id == session.id) for s in found.sessions.list()]


@protected.delete("/sessions", status_code=status.HTTP_204_NO_CONTENT)
def end_other_sessions(session: SessionDep, found: ServicesDep) -> None:
    """End all sessions except the own one (ASVS 7.4.5, 7.5.2)."""
    found.sessions.end_all(except_id=session.id)


@protected.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def end_session(session_id: str, found: ServicesDep) -> None:
    """End one session (ASVS 7.4.5, 7.5.2)."""
    if not found.sessions.end_by_id(session_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sitzung nicht gefunden")


@contextmanager
def _attempt(found: Services, request: Request, action: str) -> Iterator[tuple[str, Attempt]]:
    """Run an attempt of the caller's address exclusively; HTTP 429 once it is blocked."""
    client = client_address(request)
    try:
        with found.throttle.attempt(client) as attempt:
            yield client, attempt
    except Blocked as error:
        _log.warning("zugang vorgang=%s ergebnis=gesperrt absender=%s", action, client)
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Zu viele Fehlversuche") from error


def _fail(attempt: Attempt, client: str, action: str, reason: str) -> None:
    """Count ``attempt`` as failed and log it."""
    attempt.fail()
    _log.warning("zugang vorgang=%s ergebnis=%s absender=%s", action, reason, client)


def _check_new_password(found: Services, password: str) -> None:
    world_words = [w for world in found.canon.list_worlds() for w in (world.name, world.id)]
    try:
        found.policy.check(password, world_words)
    except PasswordRejected as error:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, {"reason": error.reason}
        ) from error
    except PwnedUnavailable as error:
        _log.warning("zugang pruefdienst=pwned_passwords ergebnis=nicht_erreichbar")
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "Passwortprüfung nicht erreichbar"
        ) from error


def _set_cookie(response: Response, token: str) -> None:
    # ASVS 3.3.1-3.3.4: __Host- prefix, Secure, HttpOnly, SameSite=Strict, no Domain.
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=int(ABSOLUTE_LIFETIME.total_seconds()),
        path="/",
        secure=True,
        httponly=True,
        samesite="strict",
    )


def _info(session: Session, *, current: bool) -> SessionInfo:
    return SessionInfo(
        id=session.id,
        created=session.created,
        last_seen=session.last_seen,
        client=session.client,
        current=current,
    )

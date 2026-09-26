"""Shared state of the application and the session dependency."""

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import Annotated, Final

from fastapi import Depends, HTTPException, Request, status

from skriptorium.api.access import (
    CredentialStore,
    FailureThrottle,
    PasswordPolicy,
    Session,
    SessionStore,
)
from skriptorium.canon import CanonService
from skriptorium.manuscript import ManuscriptService

SESSION_COOKIE: Final = "__Host-sitzung"


@dataclass(frozen=True)
class Services:
    """Everything the endpoints need; built once in :func:`create_app`."""

    canon: CanonService
    manuscript: ManuscriptService
    credentials: CredentialStore
    policy: PasswordPolicy
    sessions: SessionStore
    throttle: FailureThrottle
    clock: Callable[[], datetime]


def services(request: Request) -> Services:
    """The services of the running application."""
    found: Services = request.app.state.services
    return found


def client_address(request: Request) -> str:
    """Address of the caller; behind the reverse proxy set by uvicorn ``--proxy-headers``."""
    return request.client.host if request.client else "unbekannt"


def current_session(request: Request, found: Annotated[Services, Depends(services)]) -> Session:
    """The valid session of the request; otherwise HTTP 401 (ASVS 7.2.1)."""
    token = request.cookies.get(SESSION_COOKIE)
    session = found.sessions.touch(token) if token else None
    if session is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Anmeldung erforderlich")
    return session


ServicesDep = Annotated[Services, Depends(services)]
SessionDep = Annotated[Session, Depends(current_session)]

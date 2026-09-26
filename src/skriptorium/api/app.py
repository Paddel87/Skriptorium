"""Application factory and health check."""

from fastapi import FastAPI
from pydantic import BaseModel


class Health(BaseModel):
    """Response body of the health check."""

    status: str


def create_app() -> FastAPI:
    """Build the FastAPI application."""
    app = FastAPI(title="Skriptorium")

    @app.get("/api/health")
    def health() -> Health:
        """Report that the server is running; needs no session."""
        return Health(status="ok")

    return app

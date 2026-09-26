"""Configuration of the server from environment variables."""

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    """Server settings.

    Attributes:
        data_dir: Data directory with worlds, stories and ``system/`` (``SKRIPTORIUM_DATA_DIR``,
            default ``data``).
        ui_dir: Built user interface, served at ``/`` if the directory exists.
    """

    data_dir: Path
    ui_dir: Path = Path("dist/ui")

    @classmethod
    def from_environment(cls) -> Settings:
        """Read the settings from the environment."""
        return cls(data_dir=Path(os.environ.get("SKRIPTORIUM_DATA_DIR", "data")))

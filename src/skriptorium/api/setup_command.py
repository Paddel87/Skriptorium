"""Command ``skriptorium-einrichtung``: create a one-time setup code (ADR-017, ASVS 6.4.1).

With the code the password is set in the user interface, the first time or after it was
forgotten. The code is shown once here, valid for 24 hours and only once; only its hash is
stored in ``system/zugang.md``.
"""

import sys
from datetime import UTC, datetime

from skriptorium.api.access import CredentialStore, PasswordHasher
from skriptorium.api.settings import Settings
from skriptorium.storage import DocumentStore


def main() -> int:
    """Create the code for the data directory from the environment and print it."""
    settings = Settings.from_environment()
    credentials = CredentialStore(
        DocumentStore(settings.data_dir), PasswordHasher(), lambda: datetime.now(UTC)
    )
    code = credentials.create_setup_code()
    sys.stdout.write(
        "Einrichtungscode (einmal gültig, 24 Stunden; nicht weitergeben):\n"
        f"{code}\n"
        "Das bisherige Passwort bleibt gültig, bis mit diesem Code ein neues festgelegt wird.\n"
    )
    return 0

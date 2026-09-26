"""Error types shared by the service interfaces (docs/architecture.md section 4)."""


class NotFound(Exception):  # noqa: N818 - name fixed by the interface contract (docs/architecture.md section 4)
    """The requested document does not exist."""


class AlreadyExists(Exception):  # noqa: N818 - name fixed by the interface contract (docs/architecture.md section 4)
    """A document that must be new already exists."""


class InvalidInput(Exception):  # noqa: N818 - name fixed by the interface contract (docs/architecture.md section 4)
    """Input is malformed: bad path, unreadable header or ambiguous header value."""


class StorageError(Exception):
    """Writing failed; the file on disk is left unchanged."""

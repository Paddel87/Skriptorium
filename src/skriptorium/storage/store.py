"""``DocumentStore``: documents on disk plus a derived SQLite search index.

Paths are relative POSIX paths below the data directory, e.g.
``worlds/salzmark/canon/figur/kael.md``. Documents below ``worlds/<world>/`` are indexed
for that world by name (header ``name`` or ``titel``, else the file stem), aliases (header
``aliasse``) and full text.
"""

import contextlib
import os
import sqlite3
import tempfile
from collections.abc import Iterator, Mapping
from dataclasses import dataclass, field
from pathlib import Path, PurePosixPath
from typing import Literal

from skriptorium.storage import frontmatter
from skriptorium.storage.errors import AlreadyExists, InvalidInput, NotFound, StorageError
from skriptorium.storage.frontmatter import HeaderValue

SearchMode = Literal["name", "fulltext"]

_INDEX_FILE = "index.sqlite"
_SUFFIX = ".md"
_SCHEMA = """
CREATE TABLE IF NOT EXISTS documents (
    path TEXT PRIMARY KEY,
    world TEXT NOT NULL,
    name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS aliases (
    path TEXT NOT NULL REFERENCES documents(path) ON DELETE CASCADE,
    alias TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS aliases_by_path ON aliases(path);
CREATE VIRTUAL TABLE IF NOT EXISTS fulltext USING fts5(
    path UNINDEXED, name, body, tokenize = "unicode61 remove_diacritics 2"
);
"""


@dataclass(frozen=True)
class Document:
    """A Markdown document: YAML header plus text body."""

    path: str
    header: dict[str, HeaderValue] = field(default_factory=dict)
    body: str = ""


@dataclass(frozen=True)
class SearchHit:
    """One search result."""

    path: str
    name: str


class DocumentStore:
    """Reads, writes and indexes the documents in one data directory."""

    def __init__(self, root: Path) -> None:
        """Open the store at ``root``; creates the directory and the index if missing."""
        self._root = root
        self._root.mkdir(parents=True, exist_ok=True)
        self._index_path = root / _INDEX_FILE
        with self._connect() as connection:
            connection.executescript(_SCHEMA)

    def read(self, path: str) -> Document:
        """Read one document.

        Raises:
            NotFound: No document at ``path``.
            InvalidInput: Bad path or unreadable header.
        """
        file = self._file(path)
        if not file.is_file():
            raise NotFound(path)
        header, body = frontmatter.parse(file.read_text(encoding="utf-8"))
        return Document(path=path, header=header, body=body)

    def write(
        self,
        path: str,
        header: Mapping[str, HeaderValue],
        body: str,
        *,
        create: bool = False,
    ) -> Document:
        """Write a document atomically and update the index.

        Either the complete new content is on disk or the previous content is unchanged.

        Args:
            create: If true, the document must not exist yet.

        Raises:
            AlreadyExists: ``create`` is set and the document exists.
            InvalidInput: Bad path.
            StorageError: Writing failed; the previous content is unchanged.
        """
        file = self._file(path)
        if create and file.exists():
            raise AlreadyExists(path)
        text = frontmatter.render(header, body)
        try:
            file.parent.mkdir(parents=True, exist_ok=True)
            _write_atomically(file, text)
        except OSError as error:
            raise StorageError(f"{path}: {error}") from error
        document = Document(path=path, header=dict(header), body=body)
        with self._connect() as connection:
            self._index_document(connection, document)
        return document

    def delete(self, path: str) -> None:
        """Delete one document and remove it from the index.

        Raises:
            NotFound: No document at ``path``.
            InvalidInput: Bad path.
            StorageError: Deleting failed.
        """
        file = self._file(path)
        if not file.is_file():
            raise NotFound(path)
        try:
            file.unlink()
        except OSError as error:
            raise StorageError(f"{path}: {error}") from error
        with self._connect() as connection:
            _remove_from_index(connection, path)

    def list_paths(self, prefix: str = "") -> list[str]:
        """List the paths of all documents below ``prefix``, sorted.

        Raises:
            InvalidInput: Bad prefix.
        """
        base = self._directory(prefix)
        if not base.is_dir():
            return []
        return sorted(
            file.relative_to(self._root).as_posix()
            for file in base.rglob(f"*{_SUFFIX}")
            if file.is_file()
        )

    def search(self, world: str, query: str, mode: SearchMode = "name") -> list[SearchHit]:
        """Search the documents of one world.

        ``name`` matches names and aliases by case-insensitive prefix (for the ``@`` menu);
        ``fulltext`` matches all words of ``query`` in name and body.
        """
        words = query.split()
        if not words:
            return []
        with self._connect() as connection:
            if mode == "name":
                pattern = _like_prefix(query.strip())
                rows = connection.execute(
                    """
                    SELECT DISTINCT d.path, d.name FROM documents d
                    LEFT JOIN aliases a ON a.path = d.path
                    WHERE d.world = ?
                      AND (d.name LIKE ? ESCAPE '\\' OR a.alias LIKE ? ESCAPE '\\')
                    ORDER BY d.name, d.path
                    """,
                    (world, pattern, pattern),
                ).fetchall()
            else:
                match = " ".join('"' + word.replace('"', '""') + '"' for word in words)
                rows = connection.execute(
                    """
                    SELECT d.path, d.name FROM fulltext f
                    JOIN documents d ON d.path = f.path
                    WHERE d.world = ? AND fulltext MATCH ?
                    ORDER BY f.rank, d.path
                    """,
                    (world, match),
                ).fetchall()
        return [SearchHit(path=row[0], name=row[1]) for row in rows]

    def rebuild_index(self) -> None:
        """Rebuild the whole index from the files on disk.

        Raises:
            InvalidInput: A document has an unreadable header.
        """
        documents = [self.read(path) for path in self.list_paths()]
        with self._connect() as connection:
            connection.execute("DELETE FROM aliases")
            connection.execute("DELETE FROM documents")
            connection.execute("DELETE FROM fulltext")
            for document in documents:
                self._index_document(connection, document)

    @contextlib.contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self._index_path)
        try:
            connection.execute("PRAGMA foreign_keys = ON")
            with connection:
                yield connection
        finally:
            connection.close()

    def _index_document(self, connection: sqlite3.Connection, document: Document) -> None:
        _remove_from_index(connection, document.path)
        world = _world_of(document.path)
        if world is None:
            return
        name = _name_of(document)
        connection.execute(
            "INSERT INTO documents (path, world, name) VALUES (?, ?, ?)",
            (document.path, world, name),
        )
        connection.executemany(
            "INSERT INTO aliases (path, alias) VALUES (?, ?)",
            [(document.path, alias) for alias in _aliases_of(document)],
        )
        connection.execute(
            "INSERT INTO fulltext (path, name, body) VALUES (?, ?, ?)",
            (document.path, name, document.body),
        )

    def _file(self, path: str) -> Path:
        relative = _checked(path)
        if relative.suffix != _SUFFIX:
            raise InvalidInput(f"Pfad muss auf {_SUFFIX} enden: {path!r}")
        return self._root.joinpath(*relative.parts)

    def _directory(self, prefix: str) -> Path:
        if not prefix:
            return self._root
        return self._root.joinpath(*_checked(prefix).parts)


def _checked(path: str) -> PurePosixPath:
    """Validate a relative path below the data directory."""
    relative = PurePosixPath(path)
    if (
        not path
        or "\\" in path
        or "\x00" in path
        or relative.is_absolute()
        or any(part in {"", ".", ".."} for part in path.split("/"))
    ):
        raise InvalidInput(f"Ungültiger Pfad: {path!r}")
    return relative


def _write_atomically(file: Path, text: str) -> None:
    """Write ``text`` to a temporary file in the same directory, then replace ``file``."""
    descriptor, temporary = tempfile.mkstemp(
        dir=file.parent, prefix=f".{file.name}.", suffix=".tmp"
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, file)
    except BaseException:
        with contextlib.suppress(FileNotFoundError):
            os.unlink(temporary)
        raise
    directory = os.open(file.parent, os.O_RDONLY)
    try:
        os.fsync(directory)
    finally:
        os.close(directory)


def _remove_from_index(connection: sqlite3.Connection, path: str) -> None:
    connection.execute("DELETE FROM documents WHERE path = ?", (path,))
    connection.execute("DELETE FROM fulltext WHERE path = ?", (path,))


def _world_of(path: str) -> str | None:
    parts = PurePosixPath(path).parts
    if len(parts) >= 3 and parts[0] == "worlds":
        return parts[1]
    return None


def _name_of(document: Document) -> str:
    for key in ("name", "titel"):
        value = document.header.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return PurePosixPath(document.path).stem


def _aliases_of(document: Document) -> list[str]:
    value = document.header.get("aliasse")
    if not isinstance(value, list):
        return []
    return [alias.strip() for alias in value if isinstance(alias, str) and alias.strip()]


def _like_prefix(text: str) -> str:
    escaped = text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"{escaped}%"

"""Reading and writing Markdown documents with a YAML header (ADR-016).

Headers are read with a strict safe loader: YAML 1.1 turns hand-written values such as
``No``, ``On`` or ``012`` silently into booleans or octal numbers. The strict loader rejects
those with :class:`InvalidInput` instead, so the author learns to quote them. Written headers
come from ``yaml.safe_dump``, which quotes ambiguous strings and is read identically by
YAML 1.1 and 1.2 parsers.
"""

import re
from collections.abc import Mapping
from typing import Any

import yaml

from skriptorium.storage.errors import InvalidInput

HeaderValue = str | int | float | bool | None | list["HeaderValue"] | dict[str, "HeaderValue"]

_DELIMITER = "---"
_PLAIN_BOOLEANS = {"true", "false"}
_PLAIN_INT = re.compile(r"[-+]?(0|[1-9][0-9]*)")
_PLAIN_FLOAT = re.compile(r"[-+]?([0-9]+\.[0-9]*|\.[0-9]+)([eE][-+]?[0-9]+)?")


class _StrictSafeLoader(yaml.SafeLoader):
    """Safe loader that refuses YAML 1.1 values whose meaning is ambiguous."""


def _construct_bool(loader: yaml.SafeLoader, node: yaml.Node) -> bool:
    text = str(node.value)
    if text.lower() not in _PLAIN_BOOLEANS:
        raise InvalidInput(f"Mehrdeutiger Wert {text!r}, bitte in Anführungszeichen setzen")
    return text.lower() == "true"


def _construct_int(loader: yaml.SafeLoader, node: yaml.Node) -> int:
    text = str(node.value)
    if not _PLAIN_INT.fullmatch(text):
        raise InvalidInput(f"Mehrdeutige Zahl {text!r}, bitte in Anführungszeichen setzen")
    return int(text)


def _construct_float(loader: yaml.SafeLoader, node: yaml.Node) -> float:
    text = str(node.value)
    if not _PLAIN_FLOAT.fullmatch(text):
        raise InvalidInput(f"Mehrdeutige Zahl {text!r}, bitte in Anführungszeichen setzen")
    return float(text)


def _construct_timestamp(loader: yaml.SafeLoader, node: yaml.Node) -> str:
    """Keep dates as written; the header only holds plain values."""
    return str(node.value)


_StrictSafeLoader.add_constructor("tag:yaml.org,2002:bool", _construct_bool)
_StrictSafeLoader.add_constructor("tag:yaml.org,2002:float", _construct_float)
_StrictSafeLoader.add_constructor("tag:yaml.org,2002:timestamp", _construct_timestamp)
_StrictSafeLoader.add_constructor("tag:yaml.org,2002:int", _construct_int)


def parse(text: str) -> tuple[dict[str, HeaderValue], str]:
    """Split a document into header and body.

    A document without a leading ``---`` line has an empty header.

    Raises:
        InvalidInput: The header is not closed, not valid YAML, not a mapping or ambiguous.
    """
    lines = text.split("\n")
    if not lines or lines[0].rstrip("\r") != _DELIMITER:
        return {}, text
    for index, line in enumerate(lines[1:], start=1):
        if line.rstrip("\r") == _DELIMITER:
            header_text = "\n".join(lines[1:index])
            body = "\n".join(lines[index + 1 :])
            return _load_header(header_text), body
    raise InvalidInput("Dateikopf ist nicht mit --- abgeschlossen")


def _load_header(header_text: str) -> dict[str, HeaderValue]:
    loader = _StrictSafeLoader(header_text)
    try:
        loaded: Any = loader.get_single_data()
    except yaml.YAMLError as error:
        raise InvalidInput(f"Dateikopf ist kein gültiges YAML: {error}") from error
    finally:
        loader.dispose()
    if loaded is None:
        return {}
    if not isinstance(loaded, dict) or not all(isinstance(key, str) for key in loaded):
        raise InvalidInput("Dateikopf muss aus Feldern mit Namen bestehen")
    _check_plain(loaded)
    return loaded


def _check_plain(value: object) -> None:
    """Reject values that are not plain header values (e.g. ``!!binary`` or ``!!set``)."""
    if value is None or isinstance(value, str | int | float | bool):
        return
    if isinstance(value, list):
        for item in value:
            _check_plain(item)
        return
    if isinstance(value, dict) and all(isinstance(key, str) for key in value):
        for item in value.values():
            _check_plain(item)
        return
    raise InvalidInput(f"Nicht unterstützter Wert im Dateikopf: {type(value).__name__}")


def render(header: Mapping[str, HeaderValue], body: str) -> str:
    """Build the file text for a header and a body."""
    if not header and body.split("\n", 1)[0].rstrip("\r") != _DELIMITER:
        return body
    header_text = ""
    if header:
        header_text = yaml.safe_dump(
            dict(header), allow_unicode=True, sort_keys=False, default_flow_style=False
        )
    return f"{_DELIMITER}\n{header_text}{_DELIMITER}\n{body}"

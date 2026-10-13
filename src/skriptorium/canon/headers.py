"""Reading and writing the file headers of worlds, maps and canon entries."""

from pathlib import PurePosixPath
from typing import cast

from skriptorium.canon.categories import Category
from skriptorium.canon.layout import IMAGE_NAME, IMAGES, MAP_FILE, MAPS, MARKERS, image_prefix
from skriptorium.canon.models import CanonEntry, MapMarker, World, WorldMap
from skriptorium.canon.validation import check_marker, checked_category, is_number
from skriptorium.storage import Document, HeaderValue, InvalidInput


def map_header(world_map: WorldMap) -> dict[str, HeaderValue]:
    header: dict[str, HeaderValue] = {"name": world_map.name, "datei": world_map.file}
    if world_map.markers:
        header[MARKERS] = list[HeaderValue](
            {"eintrag": m.entry, "x": round(m.x, 4), "y": round(m.y, 4)} for m in world_map.markers
        )
    return header


def markers_of(path: str, value: HeaderValue) -> tuple[MapMarker, ...]:
    if not isinstance(value, list):
        raise InvalidInput(f"{path}: marken muss eine Liste sein")
    markers: list[MapMarker] = []
    for item in value:
        if not isinstance(item, dict):
            raise InvalidInput(f"{path}: marken braucht je Markierung eintrag, x und y")
        entry, x, y = item.get("eintrag"), item.get("x"), item.get("y")
        if not (isinstance(entry, str) and is_number(x) and is_number(y)):
            raise InvalidInput(f"{path}: marken braucht je Markierung eintrag, x und y")
        marker = MapMarker(entry, float(cast(float, x)), float(cast(float, y)))
        check_marker(marker)
        markers.append(marker)
    return tuple(markers)


def maps_of(document: Document) -> tuple[WorldMap, ...]:
    value = document.header.get(MAPS, [])
    if not isinstance(value, list):
        raise InvalidInput(f"{document.path}: karten muss eine Liste sein")
    maps: list[WorldMap] = []
    for item in value:
        name = item.get("name") if isinstance(item, dict) else None
        file = item.get("datei") if isinstance(item, dict) else None
        if not (
            isinstance(name, str)
            and name.strip()
            and isinstance(file, str)
            and MAP_FILE.fullmatch(file)
        ):
            raise InvalidInput(f"{document.path}: karten braucht je Karte name und datei")
        markers = item.get(MARKERS, []) if isinstance(item, dict) else []
        maps.append(WorldMap(name.strip(), file, markers_of(document.path, markers)))
    return tuple(maps)


def world_from(document: Document) -> World:
    parts = PurePosixPath(document.path).parts
    name = header_text(document, "name", required=True)
    return World(
        id=parts[1], name=name or parts[1], description=document.body, maps=maps_of(document)
    )


def entry_header(
    previous: dict[str, HeaderValue],
    name: str,
    aliases: list[str],
    category: Category,
    status: str | None,
) -> dict[str, HeaderValue]:
    header: dict[str, HeaderValue] = {
        "name": name,
        "aliasse": list[HeaderValue](aliases),
        "kategorie": category,
    }
    if status is not None and status.strip():
        header["status"] = status.strip()
    known = {"name", "aliasse", "kategorie", "status"}
    header.update({key: value for key, value in previous.items() if key not in known})
    return header


def entry_from(document: Document) -> CanonEntry:
    parts = PurePosixPath(document.path).parts
    category = checked_category(parts[3])
    written = document.header.get("kategorie", category)
    if written != category:
        raise InvalidInput(f"{document.path}: kategorie {written!r} passt nicht zum Ordner")
    raw_aliases = document.header.get("aliasse", [])
    if not isinstance(raw_aliases, list) or not all(isinstance(a, str) for a in raw_aliases):
        raise InvalidInput(f"{document.path}: aliasse muss eine Liste von Texten sein")
    return CanonEntry(
        world=parts[1],
        id=PurePosixPath(document.path).stem,
        category=category,
        name=header_text(document, "name", required=True) or "",
        aliases=tuple(cast("list[str]", raw_aliases)),
        status=header_text(document, "status", required=False),
        body=document.body,
        images=images_of(document),
    )


def images_of(document: Document) -> tuple[str, ...]:
    value = document.header.get(IMAGES, [])
    prefix = image_prefix(PurePosixPath(document.path).stem)
    if not isinstance(value, list) or not all(
        isinstance(name, str) and IMAGE_NAME.fullmatch(name) and name.startswith(prefix)
        for name in value
    ):
        raise InvalidInput(f"{document.path}: bilder muss eine Liste von Bilddateinamen sein")
    return tuple(cast("list[str]", value))


def header_text(document: Document, key: str, *, required: bool) -> str | None:
    value = document.header.get(key)
    if value is None and not required:
        return None
    if not isinstance(value, str) or not value.strip():
        raise InvalidInput(f"{document.path}: Feld {key!r} muss ein nicht leerer Text sein")
    return value.strip()

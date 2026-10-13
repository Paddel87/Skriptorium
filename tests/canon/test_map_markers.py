"""Tests for markers on the maps of a world (step 7.14, ADR-079, FR-035)."""

from pathlib import Path

import pytest

from skriptorium.canon import (
    MAX_MARKERS_PER_MAP,
    CanonService,
    InvalidInput,
    MapMarker,
    NotFound,
)
from skriptorium.storage import DocumentStore
from tests.image_samples import png

WORLD = "die-salzmark"


@pytest.fixture
def root(tmp_path: Path) -> Path:
    return tmp_path / "data"


@pytest.fixture
def canon(root: Path) -> CanonService:
    service = CanonService(DocumentStore(root))
    service.create_world("Die Salzmark", "Sieben Inseln.")
    service.create_entry(WORLD, "ort", "Karst")
    service.create_entry(WORLD, "ort", "Tiefmoor")
    service.create_entry(WORLD, "figur", "Ilka")
    return service


def _map(canon: CanonService, name: str = "Festland") -> str:
    return canon.add_world_map(WORLD, name, png()).maps[-1].file


def test_a_new_map_has_no_markers(canon: CanonService, root: Path) -> None:
    _map(canon)
    assert canon.get_world(WORLD).maps[0].markers == ()
    assert "marken" not in (root / "worlds" / WORLD / "world.md").read_text()


def test_sets_markers_and_keeps_them_in_the_world_file(canon: CanonService, root: Path) -> None:
    file = _map(canon)
    markers = [MapMarker("karst", 0.2, 0.36), MapMarker("ilka", 0, 1)]
    world = canon.set_map_markers(WORLD, file, markers)
    assert world.maps[0].markers == tuple(markers)
    assert canon.get_world(WORLD).maps[0].markers == tuple(markers)
    text = (root / "worlds" / WORLD / "world.md").read_text()
    assert "marken:" in text and "eintrag: karst" in text
    assert canon.get_world(WORLD).description == "Sieben Inseln."


def test_positions_are_rounded_to_four_places(canon: CanonService) -> None:
    file = _map(canon)
    world = canon.set_map_markers(WORLD, file, [MapMarker("karst", 1 / 3, 2 / 3)])
    assert world.maps[0].markers == (MapMarker("karst", 0.3333, 0.6667),)


def test_markers_survive_renaming_and_other_maps(canon: CanonService) -> None:
    first = _map(canon)
    canon.set_map_markers(WORLD, first, [MapMarker("karst", 0.5, 0.5)])
    second = _map(canon, "Seekarte")
    world = canon.rename_world_map(WORLD, first, "Das Festland")
    assert world.maps[0].markers == (MapMarker("karst", 0.5, 0.5),)
    world = canon.remove_world_map(WORLD, second)
    assert world.maps[0].markers == (MapMarker("karst", 0.5, 0.5),)
    assert canon.update_world(WORLD, description="Neu").maps[0].markers != ()


def test_an_empty_list_removes_all_markers(canon: CanonService, root: Path) -> None:
    file = _map(canon)
    canon.set_map_markers(WORLD, file, [MapMarker("karst", 0.5, 0.5)])
    assert canon.set_map_markers(WORLD, file, []).maps[0].markers == ()
    assert "marken" not in (root / "worlds" / WORLD / "world.md").read_text()


@pytest.mark.parametrize(
    "marker",
    [
        MapMarker("karst", -0.01, 0.5),
        MapMarker("karst", 0.5, 1.01),
        MapMarker("karst", float("nan"), 0.5),
        MapMarker("karst", 0.5, float("inf")),
        MapMarker("karst", True, 0.5),
        MapMarker("unbekannt", 0.5, 0.5),
        MapMarker("../world", 0.5, 0.5),
        MapMarker("Karst", 0.5, 0.5),
    ],
)
def test_refuses_markers_off_the_map_or_without_entry(
    canon: CanonService, marker: MapMarker
) -> None:
    file = _map(canon)
    with pytest.raises(InvalidInput):
        canon.set_map_markers(WORLD, file, [marker])
    assert canon.get_world(WORLD).maps[0].markers == ()


def test_an_entry_is_on_a_map_at_most_once(canon: CanonService) -> None:
    file = _map(canon)
    twice = [MapMarker("karst", 0.1, 0.1), MapMarker("karst", 0.9, 0.9)]
    with pytest.raises(InvalidInput, match="schon auf der Karte"):
        canon.set_map_markers(WORLD, file, twice)


def test_limits_the_number_of_markers(canon: CanonService) -> None:
    file = _map(canon)
    too_many = [MapMarker("karst", 0.5, 0.5)] * (MAX_MARKERS_PER_MAP + 1)
    with pytest.raises(InvalidInput, match=str(MAX_MARKERS_PER_MAP)):
        canon.set_map_markers(WORLD, file, too_many)


def test_markers_need_an_existing_map(canon: CanonService) -> None:
    with pytest.raises(NotFound):
        canon.set_map_markers(WORLD, "karte-0a1b2c3d4e5f.png", [])
    with pytest.raises(NotFound):
        canon.set_map_markers("andere-welt", "karte-0a1b2c3d4e5f.png", [])


def test_deleting_an_entry_removes_its_markers_on_all_maps(canon: CanonService) -> None:
    first, second = _map(canon), _map(canon, "Seekarte")
    canon.set_map_markers(
        WORLD, first, [MapMarker("karst", 0.1, 0.1), MapMarker("tiefmoor", 0.8, 0.8)]
    )
    canon.set_map_markers(WORLD, second, [MapMarker("karst", 0.3, 0.3)])
    canon.delete_entry(WORLD, "karst")
    first_map, second_map = canon.get_world(WORLD).maps
    assert first_map.markers == (MapMarker("tiefmoor", 0.8, 0.8),)
    assert second_map.markers == ()


def test_deleting_an_entry_without_markers_leaves_the_world_file(
    canon: CanonService, root: Path
) -> None:
    file = _map(canon)
    canon.set_map_markers(WORLD, file, [MapMarker("karst", 0.1, 0.1)])
    world_file = root / "worlds" / WORLD / "world.md"
    before = world_file.read_bytes()
    canon.delete_entry(WORLD, "ilka")
    assert world_file.read_bytes() == before


@pytest.mark.parametrize(
    "markers",
    [
        '"karst"',
        "\n      - karst",
        "\n      - eintrag: karst\n        x: 0.5",
        "\n      - eintrag: karst\n        x: true\n        y: 0.5",
        '\n      - eintrag: karst\n        x: "0.5"\n        y: 0.5',
        "\n      - eintrag: karst\n        x: 2\n        y: 0.5",
        "\n      - eintrag: ../x\n        x: 0.5\n        y: 0.5",
    ],
)
def test_refuses_a_hand_written_marker_list_that_is_not_one(
    canon: CanonService, root: Path, markers: str
) -> None:
    (root / "worlds" / WORLD / "world.md").write_text(
        "---\nname: Die Salzmark\nkarten:\n  - name: A\n    datei: karte-0a1b2c3d4e5f.png\n"
        f"    marken: {markers}\n---\nText\n"
    )
    with pytest.raises(InvalidInput):
        canon.get_world(WORLD)


def test_reads_hand_written_whole_numbers(canon: CanonService, root: Path) -> None:
    (root / "worlds" / WORLD / "world.md").write_text(
        "---\nname: Die Salzmark\nkarten:\n  - name: A\n    datei: karte-0a1b2c3d4e5f.png\n"
        "    marken:\n      - eintrag: karst\n        x: 0\n        y: 1\n---\nText\n"
    )
    assert canon.get_world(WORLD).maps[0].markers == (MapMarker("karst", 0.0, 1.0),)

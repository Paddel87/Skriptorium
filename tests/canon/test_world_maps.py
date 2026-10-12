"""Tests for the maps of a world (step 7.10, ADR-073, FR-035)."""

from pathlib import Path

import pytest

from skriptorium.canon import CanonService, InvalidInput, NotFound, WorldMap
from skriptorium.canon.service import MAX_MAPS_PER_WORLD
from skriptorium.storage import MAX_MAP_BYTES, DocumentStore
from tests.image_samples import jpeg, png, webp_lossy

WORLD = "die-salzmark"


@pytest.fixture
def root(tmp_path: Path) -> Path:
    return tmp_path / "data"


@pytest.fixture
def canon(root: Path) -> CanonService:
    service = CanonService(DocumentStore(root))
    service.create_world("Die Salzmark", "Sieben Inseln.")
    return service


def test_a_new_world_has_no_maps(canon: CanonService) -> None:
    assert canon.get_world(WORLD).maps == ()


def test_adds_maps_with_names_and_serves_them(canon: CanonService, root: Path) -> None:
    canon.add_world_map(WORLD, "  Die Salzmark ", png())
    world = canon.add_world_map(WORLD, "Hafenviertel", jpeg())
    first, second = world.maps
    assert first.name == "Die Salzmark"
    assert first.file.startswith("karte-") and first.file.endswith(".png")
    assert second == WorldMap("Hafenviertel", second.file)
    assert canon.world_map(WORLD, second.file) == (jpeg(), "image/jpeg")
    assert (root / "worlds" / WORLD / "karten" / first.file).read_bytes() == png()
    assert canon.get_world(WORLD).description == "Sieben Inseln."
    assert canon.list_worlds()[0].maps == world.maps


def test_maps_may_be_larger_than_entry_images(canon: CanonService) -> None:
    world = canon.add_world_map(WORLD, "Groß", png(6000, 4000))
    assert len(world.maps) == 1
    with pytest.raises(InvalidInput, match="6000"):
        canon.add_world_map(WORLD, "Zu groß", png(6001, 10))
    with pytest.raises(InvalidInput, match="12 MB"):
        canon.add_world_map(WORLD, "Zu schwer", png() + b"\x00" * MAX_MAP_BYTES)


@pytest.mark.parametrize("name", ["", "   ", "x" * 201])
def test_a_map_needs_a_name(canon: CanonService, root: Path, name: str) -> None:
    with pytest.raises(InvalidInput):
        canon.add_world_map(WORLD, name, png())
    assert not (root / "worlds" / WORLD / "karten").exists()


def test_refuses_what_is_not_an_image(canon: CanonService, root: Path) -> None:
    with pytest.raises(InvalidInput):
        canon.add_world_map(WORLD, "Karte", b"<svg onload='alert(1)'/>")
    assert canon.get_world(WORLD).maps == ()


def test_limits_the_number_of_maps(canon: CanonService) -> None:
    for number in range(MAX_MAPS_PER_WORLD):
        canon.add_world_map(WORLD, f"Karte {number}", webp_lossy())
    with pytest.raises(InvalidInput, match="Höchstens"):
        canon.add_world_map(WORLD, "Eine zu viel", webp_lossy())


def test_renames_and_removes_maps(canon: CanonService, root: Path) -> None:
    canon.add_world_map(WORLD, "A", png())
    a, b = canon.add_world_map(WORLD, "B", jpeg()).maps
    renamed = canon.rename_world_map(WORLD, b.file, "Seekarte")
    assert [m.name for m in renamed.maps] == ["A", "Seekarte"]
    with pytest.raises(InvalidInput):
        canon.rename_world_map(WORLD, b.file, " ")
    assert canon.remove_world_map(WORLD, a.file).maps == (WorldMap("Seekarte", b.file),)
    assert not (root / "worlds" / WORLD / "karten" / a.file).exists()
    canon.remove_world_map(WORLD, b.file)
    assert "karten" not in (root / "worlds" / WORLD / "world.md").read_text()


def test_only_maps_of_the_world_are_reachable(canon: CanonService) -> None:
    canon.create_world("Nebelreich")
    (own,) = canon.add_world_map(WORLD, "Karte", png()).maps
    for call in (canon.world_map, canon.remove_world_map):
        with pytest.raises(NotFound):
            call("nebelreich", own.file)
        with pytest.raises(NotFound):
            call(WORLD, "../world.md")
    with pytest.raises(NotFound):
        canon.rename_world_map(WORLD, "karte-000000000000.png", "x")


def test_maps_survive_changes_to_the_world(canon: CanonService) -> None:
    maps = canon.add_world_map(WORLD, "Karte", png()).maps
    assert canon.update_world(WORLD, name="Salzmark", description="Neu").maps == maps


def test_a_missing_map_file_does_not_block_removal(canon: CanonService, root: Path) -> None:
    (only,) = canon.add_world_map(WORLD, "Karte", png()).maps
    (root / "worlds" / WORLD / "karten" / only.file).unlink()
    with pytest.raises(NotFound):
        canon.world_map(WORLD, only.file)
    assert canon.remove_world_map(WORLD, only.file).maps == ()


@pytest.mark.parametrize(
    "value",
    [
        '"karte.png"',
        "\n  - name: A\n    datei: ../world.md",
        "\n  - name: A\n    datei: gunda-hollt-0a1b2c3d4e5f.png",
        "\n  - datei: karte-0a1b2c3d4e5f.png",
        "\n  - karte-0a1b2c3d4e5f.png",
    ],
)
def test_refuses_a_hand_written_map_list_that_is_not_one(
    canon: CanonService, root: Path, value: str
) -> None:
    (root / "worlds" / WORLD / "world.md").write_text(
        f"---\nname: Die Salzmark\nkarten: {value}\n---\nText\n"
    )
    with pytest.raises(InvalidInput, match="karten"):
        canon.get_world(WORLD)

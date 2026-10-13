"""Tests for the images of canon entries (step 7.6, ADR-072, FR-035)."""

from pathlib import Path

import pytest

from skriptorium.canon import CanonService, InvalidInput, NotFound
from skriptorium.canon.service import MAX_IMAGES_PER_ENTRY
from skriptorium.storage import DocumentStore, StorageError
from tests.image_samples import jpeg, png, webp_lossy

WORLD = "die-salzmark"


@pytest.fixture
def root(tmp_path: Path) -> Path:
    return tmp_path / "data"


@pytest.fixture
def canon(root: Path) -> CanonService:
    service = CanonService(DocumentStore(root))
    service.create_world("Die Salzmark")
    service.create_entry(WORLD, "figur", "Gunda Hollt", body="Wirtin.")
    return service


def test_a_new_entry_has_no_images(canon: CanonService) -> None:
    assert canon.get_entry(WORLD, "gunda-hollt").images == ()


def test_adds_images_in_order_and_serves_them(canon: CanonService, root: Path) -> None:
    first = canon.add_entry_image(WORLD, "gunda-hollt", png())
    second = canon.add_entry_image(WORLD, "gunda-hollt", jpeg())
    assert len(first.images) == 1
    assert second.images[0] == first.images[0]
    main, other = second.images
    assert main.startswith("gunda-hollt-") and main.endswith(".png")
    assert other.endswith(".jpg")
    assert canon.entry_image(WORLD, "gunda-hollt", other) == (jpeg(), "image/jpeg")
    assert (root / "worlds" / WORLD / "bilder" / main).read_bytes() == png()
    text = (root / "worlds" / WORLD / "canon" / "figur" / "gunda-hollt.md").read_text()
    assert f"- {main}" in text
    assert canon.get_entry(WORLD, "gunda-hollt").body == "Wirtin."


def test_refuses_what_is_not_an_image(canon: CanonService, root: Path) -> None:
    with pytest.raises(InvalidInput):
        canon.add_entry_image(WORLD, "gunda-hollt", b"<svg onload='alert(1)'/>")
    assert canon.get_entry(WORLD, "gunda-hollt").images == ()
    assert not (root / "worlds" / WORLD / "bilder").exists()


def test_limits_the_number_of_images(canon: CanonService) -> None:
    for _ in range(MAX_IMAGES_PER_ENTRY):
        canon.add_entry_image(WORLD, "gunda-hollt", webp_lossy())
    with pytest.raises(InvalidInput, match="Höchstens"):
        canon.add_entry_image(WORLD, "gunda-hollt", webp_lossy())


def test_makes_an_image_the_main_image(canon: CanonService) -> None:
    canon.add_entry_image(WORLD, "gunda-hollt", png())
    canon.add_entry_image(WORLD, "gunda-hollt", jpeg())
    entry = canon.add_entry_image(WORLD, "gunda-hollt", webp_lossy())
    a, b, c = entry.images
    assert canon.set_main_image(WORLD, "gunda-hollt", c).images == (c, a, b)
    assert canon.get_entry(WORLD, "gunda-hollt").images == (c, a, b)


def test_removes_an_image_and_its_file(canon: CanonService, root: Path) -> None:
    canon.add_entry_image(WORLD, "gunda-hollt", png())
    a, b = canon.add_entry_image(WORLD, "gunda-hollt", jpeg()).images
    assert canon.remove_entry_image(WORLD, "gunda-hollt", a).images == (b,)
    assert not (root / "worlds" / WORLD / "bilder" / a).exists()
    canon.remove_entry_image(WORLD, "gunda-hollt", b)
    text = (root / "worlds" / WORLD / "canon" / "figur" / "gunda-hollt.md").read_text()
    assert "bilder" not in text


def test_only_images_of_the_entry_are_reachable(canon: CanonService) -> None:
    canon.create_entry(WORLD, "ort", "Grauhang")
    (image,) = canon.add_entry_image(WORLD, "gunda-hollt", png()).images
    for call in (canon.entry_image, canon.remove_entry_image, canon.set_main_image):
        with pytest.raises(NotFound):
            call(WORLD, "grauhang", image)
        with pytest.raises(NotFound):
            call(WORLD, "gunda-hollt", "../../world.md")
        with pytest.raises(NotFound):
            call(WORLD, "gunda-hollt", "fremd.png")


def test_images_survive_changes_to_the_entry(canon: CanonService) -> None:
    images = canon.add_entry_image(WORLD, "gunda-hollt", png()).images
    changed = canon.update_entry(
        WORLD, "gunda-hollt", category="kultur", name="Gunda", body="Neu.", aliases=["G"]
    )
    assert changed.images == images
    assert canon.entry_image(WORLD, "gunda-hollt", images[0])[0] == png()


def test_deleting_the_entry_deletes_its_images(canon: CanonService, root: Path) -> None:
    (image,) = canon.add_entry_image(WORLD, "gunda-hollt", png()).images
    (root / "worlds" / WORLD / "bilder" / "andere.png").write_bytes(png())
    canon.delete_entry(WORLD, "gunda-hollt")
    assert sorted(p.name for p in (root / "worlds" / WORLD / "bilder").iterdir()) == ["andere.png"]
    assert image != "andere.png"


def test_a_missing_image_file_does_not_block_removal(canon: CanonService, root: Path) -> None:
    (image,) = canon.add_entry_image(WORLD, "gunda-hollt", png()).images
    (root / "worlds" / WORLD / "bilder" / image).unlink()
    with pytest.raises(NotFound):
        canon.entry_image(WORLD, "gunda-hollt", image)
    assert canon.remove_entry_image(WORLD, "gunda-hollt", image).images == ()


@pytest.mark.parametrize(
    "value",
    [
        '"bild.png"',
        "\n  - ../world.md",
        "\n  - gunda-hollt-a.svg",
        "\n  - 3",
        "\n  - grauhang-0a1b.png",  # another entry's image
    ],
)
def test_refuses_a_hand_written_image_list_that_is_not_one(
    canon: CanonService, root: Path, value: str
) -> None:
    path = root / "worlds" / WORLD / "canon" / "figur" / "gunda-hollt.md"
    path.write_text(f"---\nname: Gunda Hollt\nkategorie: figur\nbilder: {value}\n---\nWirtin.\n")
    with pytest.raises(InvalidInput, match="bilder"):
        canon.get_entry(WORLD, "gunda-hollt")


def test_an_entry_with_a_broken_image_list_can_still_be_deleted(
    canon: CanonService, root: Path
) -> None:
    (image,) = canon.add_entry_image(WORLD, "gunda-hollt", png()).images
    path = root / "worlds" / WORLD / "canon" / "figur" / "gunda-hollt.md"
    path.write_text("---\nname: Gunda Hollt\nkategorie: figur\nbilder: kaputt\n---\n")
    canon.delete_entry(WORLD, "gunda-hollt")
    assert not path.exists()
    assert (root / "worlds" / WORLD / "bilder" / image).exists()


def test_a_failed_header_write_takes_the_new_image_file_back(
    canon: CanonService, root: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    def fail(*_: object, **__: object) -> None:
        raise StorageError("Datenträger voll")

    monkeypatch.setattr(DocumentStore, "write", fail)
    with pytest.raises(StorageError):
        canon.add_entry_image(WORLD, "gunda-hollt", png())
    monkeypatch.undo()
    assert [p for p in (root / "worlds" / WORLD).rglob("*.png")] == []
    assert canon.get_entry(WORLD, "gunda-hollt").images == ()

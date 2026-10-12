"""Requests that describe an image once (roadmap step 7.13, ADR-074)."""

from pathlib import Path

import pytest

from skriptorium.canon import CanonService, InvalidInput, NotFound
from skriptorium.context import ContextBuilder
from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore
from tests.image_samples import png

WORLD = "die-salzmark"


@pytest.fixture
def canon(tmp_path: Path) -> CanonService:
    service = CanonService(DocumentStore(tmp_path / "data"))
    service.create_world("Die Salzmark")
    service.create_entry(WORLD, "figur", "Gunda Hollt", body="Wirtin. Geheimnis: schmuggelt.")
    service.create_entry(WORLD, "ort", "Grauhang")
    return service


@pytest.fixture
def builder(canon: CanonService, tmp_path: Path) -> ContextBuilder:
    return ContextBuilder(canon, ManuscriptService(DocumentStore(tmp_path / "data")))


def test_a_figure_is_described_by_its_looks_without_its_text(
    canon: CanonService, builder: ContextBuilder
) -> None:
    (image,) = canon.add_entry_image(WORLD, "gunda-hollt", png()).images
    built = builder.build_entry_image_description(WORLD, "gunda-hollt", image)
    system, user = built.messages
    assert "Figur „Gunda Hollt“" in system.content
    assert "Gesicht, Haare" in system.content
    assert "Erfinde keine" in system.content
    assert "schmuggelt" not in system.content + user.content
    assert user.content == "Beschreibe das Bild."
    assert 0 < built.estimated_tokens < 400


def test_other_entries_by_their_appearance(canon: CanonService, builder: ContextBuilder) -> None:
    (image,) = canon.add_entry_image(WORLD, "grauhang", png()).images
    system, _ = builder.build_entry_image_description(WORLD, "grauhang", image).messages
    assert "Eintrag „Grauhang“ (Ort)" in system.content
    assert "Form, Farben" in system.content


def test_a_map_by_its_geography(canon: CanonService, builder: ContextBuilder) -> None:
    (found,) = canon.add_world_map(WORLD, "Seekarte", png()).maps
    system, _ = builder.build_map_description(WORLD, found.file).messages
    assert "Karte „Seekarte“ der Welt „Die Salzmark“" in system.content
    assert "Beschriftungen" in system.content


def test_unknown_images_maps_and_budget(canon: CanonService, builder: ContextBuilder) -> None:
    (image,) = canon.add_entry_image(WORLD, "gunda-hollt", png()).images
    with pytest.raises(NotFound):
        builder.build_entry_image_description(WORLD, "grauhang", image)
    with pytest.raises(NotFound):
        builder.build_map_description(WORLD, "karte-000000000000.png")
    with pytest.raises(InvalidInput):
        builder.build_entry_image_description(WORLD, "gunda-hollt", image, budget=0)

"""The cover of a story, also in the e-book (step 7.11, ADR-075)."""

import zipfile
from datetime import UTC, datetime
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree

import pytest

from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore, InvalidInput, NotFound
from tests.image_samples import jpeg, png

W = "salzmark"
S = "das-salz"
WHEN = datetime(2026, 10, 12, 14, 30, tzinfo=UTC)
OPF = "{http://www.idpf.org/2007/opf}"


@pytest.fixture
def root(tmp_path: Path) -> Path:
    return tmp_path / "data"


@pytest.fixture
def ms(root: Path) -> ManuscriptService:
    service = ManuscriptService(DocumentStore(root))
    service.create_story(W, "Das Salz", "roman")
    service.save_chapter(W, S, 1, title="Nebel", text="Nebel lag über dem Kai.")
    return service


def _parse(xml: bytes | str) -> ElementTree.Element:
    return ElementTree.fromstring(xml)  # noqa: S314 - own output, not untrusted data


def test_a_new_story_has_no_cover(ms: ManuscriptService) -> None:
    assert ms.get_story(W, S).cover is None
    with pytest.raises(NotFound):
        ms.story_cover(W, S)


def test_sets_serves_replaces_and_removes_a_cover(ms: ManuscriptService, root: Path) -> None:
    first = ms.set_story_cover(W, S, png()).cover
    assert first is not None and first.startswith("titelbild-") and first.endswith(".png")
    assert ms.story_cover(W, S) == (png(), "image/png")
    folder = root / "worlds" / W / "stories" / S
    assert (folder / first).read_bytes() == png()
    second = ms.set_story_cover(W, S, jpeg()).cover
    assert second is not None and second.endswith(".jpg")
    assert not (folder / first).exists()
    assert ms.story_cover(W, S)[1] == "image/jpeg"
    assert ms.remove_story_cover(W, S).cover is None
    assert not (folder / second).exists()
    assert "titelbild" not in (folder / "story.md").read_text()
    with pytest.raises(NotFound):
        ms.remove_story_cover(W, S)


def test_refuses_what_is_not_an_image(ms: ManuscriptService, root: Path) -> None:
    with pytest.raises(InvalidInput):
        ms.set_story_cover(W, S, b"<svg onload='x'/>")
    assert ms.get_story(W, S).cover is None
    assert not list((root / "worlds" / W / "stories" / S).glob("titelbild-*"))


def test_the_cover_survives_changes_to_the_story(ms: ManuscriptService) -> None:
    cover = ms.set_story_cover(W, S, png()).cover
    assert ms.update_story(W, S, title="Neuer Titel", perspective="Ich").cover == cover
    assert ms.set_story_summary(W, S, "Zusammenfassung").cover == cover


@pytest.mark.parametrize("value", ["../story.md", "titelbild.png", "bild-0a1b2c3d4e5f.png", "3"])
def test_refuses_a_hand_written_cover_that_is_not_one(
    ms: ManuscriptService, root: Path, value: str
) -> None:
    path = root / "worlds" / W / "stories" / S / "story.md"
    text = path.read_text()
    path.write_text(text.replace("titel: Das Salz", f"titel: Das Salz\ntitelbild: '{value}'"))
    with pytest.raises(InvalidInput, match="titelbild"):
        ms.get_story(W, S)


def test_the_ebook_shows_the_cover_first(ms: ManuscriptService) -> None:
    ms.set_story_cover(W, S, jpeg())
    data = ms.epub(W, S, author=None, only_completed=False, modified=WHEN)
    book = zipfile.ZipFile(BytesIO(data))
    assert book.infolist()[0].filename == "mimetype"
    image = book.getinfo("OEBPS/umschlag.jpg")
    assert image.compress_type == zipfile.ZIP_STORED
    assert book.read("OEBPS/umschlag.jpg") == jpeg()
    for name in book.namelist():
        if name.endswith((".xhtml", ".opf", ".ncx", ".xml")):
            _parse(book.read(name))
    package = _parse(book.read("OEBPS/content.opf"))
    items = {item.get("id"): item for item in package.iter(f"{OPF}item")}
    assert items["umschlag-bild"].get("properties") == "cover-image"
    assert items["umschlag-bild"].get("media-type") == "image/jpeg"
    assert items["umschlag-bild"].get("href") == "umschlag.jpg"
    metas = [m for m in package.iter(f"{OPF}meta") if m.get("name") == "cover"]
    assert [m.get("content") for m in metas] == ["umschlag-bild"]
    spine = [ref.get("idref") for ref in package.iter(f"{OPF}itemref")]
    assert spine[:3] == ["umschlag", "titel", "nav"]
    page = book.read("OEBPS/umschlag.xhtml").decode()
    assert 'src="umschlag.jpg"' in page
    assert 'alt="Das Salz"' in page


def test_the_ebook_without_cover_stays_as_before(ms: ManuscriptService) -> None:
    data = ms.epub(W, S, author=None, only_completed=False, modified=WHEN)
    book = zipfile.ZipFile(BytesIO(data))
    assert not any("umschlag" in name for name in book.namelist())
    assert b"cover" not in book.read("OEBPS/content.opf")

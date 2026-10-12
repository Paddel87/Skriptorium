"""A story as an EPUB file (step 7.4, ADR-071): container, documents, Markdown, escaping."""

import zipfile
from datetime import UTC, datetime
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree

import pytest

from skriptorium.manuscript import ManuscriptService
from skriptorium.storage import DocumentStore, InvalidInput, NotFound

W = "salzmark"
WHEN = datetime(2026, 10, 12, 14, 30, 5, 123, tzinfo=UTC)
OPF = "{http://www.idpf.org/2007/opf}"
XHTML = "{http://www.w3.org/1999/xhtml}"
DC = "{http://purl.org/dc/elements/1.1/}"


@pytest.fixture
def ms(tmp_path: Path) -> ManuscriptService:
    service = ManuscriptService(DocumentStore(tmp_path / "data"))
    service.create_story(W, "Das Salz <der> Toten", "roman")
    return service


def _parse(xml: bytes | str) -> ElementTree.Element:
    # Parses the module's own output in a test, not data from outside.
    return ElementTree.fromstring(xml)  # noqa: S314 - own output, not untrusted data


def _book(data: bytes) -> zipfile.ZipFile:
    return zipfile.ZipFile(BytesIO(data))


def _text(book: zipfile.ZipFile, name: str) -> str:
    return book.read(name).decode("utf-8")


def test_container_and_documents_follow_the_epub_rules(ms: ManuscriptService) -> None:
    ms.save_chapter(W, "das-salz-der-toten", 1, title="Das nasse Grab", text="Nebel.")
    ms.save_chapter(W, "das-salz-der-toten", 2, title="Das Vogtshaus", text="Rauch.")
    data = ms.epub(W, "das-salz-der-toten", author="A & B", only_completed=False, modified=WHEN)
    book = _book(data)
    first = book.infolist()[0]
    assert (first.filename, first.compress_type) == ("mimetype", zipfile.ZIP_STORED)
    assert _text(book, "mimetype") == "application/epub+zip"
    # Every XML document is well-formed.
    for name in book.namelist():
        if name.endswith((".xml", ".opf", ".xhtml", ".ncx")):
            _parse(book.read(name))
    container = _parse(book.read("META-INF/container.xml"))
    assert container[0][0].get("full-path") == "OEBPS/content.opf"
    package = _parse(book.read("OEBPS/content.opf"))
    manifest = {item.get("id"): item.get("href") for item in package.iter(f"{OPF}item")}
    for href in manifest.values():
        assert f"OEBPS/{href}" in book.namelist()
    spine = [ref.get("idref") for ref in package.iter(f"{OPF}itemref")]
    assert [manifest[ref] for ref in spine] == [
        "titel.xhtml",
        "nav.xhtml",
        "kapitel-01.xhtml",
        "kapitel-02.xhtml",
    ]
    metadata = package.find(f"{OPF}metadata")
    assert metadata is not None
    assert metadata.findtext(f"{DC}title") == "Das Salz <der> Toten"
    assert metadata.findtext(f"{DC}creator") == "A & B"
    assert metadata.findtext(f"{DC}language") == "de"
    assert metadata.findtext(f"{OPF}meta") == "2026-10-12T14:30:05Z"
    identifier = metadata.findtext(f"{DC}identifier")
    assert identifier is not None and identifier.startswith("urn:uuid:")
    nav = _parse(book.read("OEBPS/nav.xhtml"))
    assert [a.text for a in nav.iter(f"{XHTML}a")] == ["1. Das nasse Grab", "2. Das Vogtshaus"]
    assert "Das Vogtshaus" in _text(book, "OEBPS/toc.ncx")
    # The same story at the same time gives the same file.
    again = ms.epub(W, "das-salz-der-toten", author="A & B", only_completed=False, modified=WHEN)
    assert again == data


def test_chapter_markdown_becomes_escaped_xhtml(ms: ManuscriptService) -> None:
    text = (
        "Der Nebel lag\nschwer über dem See.\n\n"
        "„Komm“, sagte *Gunda* und **lachte** _leise_.\n\n"
        "* * *\n\n"
        "## Am Morgen\n"
        "<script>alert(1)</script> & 3 < 4\x00\x07\n\n"
        "---\n"
        "Ende_mit_Unterstrich und 2 * 3 * 4."
    )
    ms.save_chapter(W, "das-salz-der-toten", 1, title="Eins & <zwei>", text=text)
    book = _book(ms.epub(W, "das-salz-der-toten", author=None, only_completed=False, modified=WHEN))
    chapter = _text(book, "OEBPS/kapitel-01.xhtml")
    _parse(chapter)
    assert "<h2>1. Eins &amp; &lt;zwei&gt;</h2>" in chapter
    assert "<p>Der Nebel lag schwer über dem See.</p>" in chapter
    assert "<em>Gunda</em> und <strong>lachte</strong> <em>leise</em>" in chapter
    assert chapter.count('<p class="break">⁂</p>') == 2
    assert "<h3>Am Morgen</h3>" in chapter
    assert "&lt;script&gt;alert(1)&lt;/script&gt; &amp; 3 &lt; 4</p>" in chapter
    assert "<script>" not in chapter
    assert "Ende_mit_Unterstrich und 2 * 3 * 4." in chapter
    # Without an author the title page and the metadata name nobody.
    assert "author" not in _text(book, "OEBPS/titel.xhtml")
    assert "dc:creator" not in _text(book, "OEBPS/content.opf")


def test_only_completed_chapters_and_refusals(ms: ManuscriptService) -> None:
    with pytest.raises(InvalidInput, match="keine Kapitel"):
        ms.epub(W, "das-salz-der-toten", author=None, only_completed=False, modified=WHEN)
    ms.save_chapter(W, "das-salz-der-toten", 1, title="Fertig", text="a")
    ms.save_chapter(W, "das-salz-der-toten", 2, title="Offen", text="b")
    with pytest.raises(InvalidInput, match="Kein abgeschlossenes Kapitel"):
        ms.epub(W, "das-salz-der-toten", author=None, only_completed=True, modified=WHEN)
    ms.complete_chapter(W, "das-salz-der-toten", 1)
    book = _book(ms.epub(W, "das-salz-der-toten", author=" ", only_completed=True, modified=WHEN))
    assert [n for n in book.namelist() if n.startswith("OEBPS/kapitel")] == [
        "OEBPS/kapitel-01.xhtml"
    ]
    assert "dc:creator" not in _text(book, "OEBPS/content.opf")
    with pytest.raises(NotFound):
        ms.epub(W, "niemand", author=None, only_completed=False, modified=WHEN)

"""Tests for the image checks and the image files of DocumentStore (step 7.6, ADR-072)."""

from pathlib import Path

import pytest

from skriptorium.storage import (
    MAX_IMAGE_BYTES,
    AlreadyExists,
    DocumentStore,
    ImageInfo,
    InvalidInput,
    NotFound,
    inspect_image,
)
from tests.image_samples import jpeg, png, webp_extended, webp_lossless, webp_lossy

IMAGE = "worlds/salzmark/bilder/kael-0a1b2c.png"


@pytest.fixture
def store(tmp_path: Path) -> DocumentStore:
    return DocumentStore(tmp_path / "data")


@pytest.mark.parametrize(
    ("data", "expected"),
    [
        (png(2, 3), ImageInfo("png", 2, 3)),
        (jpeg(4, 5), ImageInfo("jpeg", 4, 5)),
        (jpeg(40, 50, exif=b"Exif\x00\x00" + b"\x00" * 30), ImageInfo("jpeg", 40, 50)),
        (webp_lossy(6, 7), ImageInfo("webp", 6, 7)),
        (webp_lossless(8, 9), ImageInfo("webp", 8, 9)),
        (webp_extended(10, 11), ImageInfo("webp", 10, 11)),
        (png(4096, 1), ImageInfo("png", 4096, 1)),
    ],
)
def test_recognises_raster_images_by_their_first_bytes(data: bytes, expected: ImageInfo) -> None:
    assert inspect_image(data) == expected


@pytest.mark.parametrize(
    "data",
    [
        b"",
        b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
        b"GIF89a\x01\x00\x01\x00",
        b"<html><body>kein Bild</body></html>",
        b"\x89PNG\r\n\x1a\n",  # signature without header
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\x0dXXXX" + b"\x00" * 13,
        b"\xff\xd8\xff\xe0\x00\x10JFIF",  # cut off before the frame header
        b"\xff\xd8\xff\xda\x00\x02",  # scan before any frame header
        b"\xff\xd8\xff\xe0\x00\x00",  # segment length below two
        b"RIFF\x00\x00\x00\x00WEBPVP8 ",  # cut off
        b"RIFF\x00\x00\x00\x00WEBPALPH" + b"\x00" * 20,
        png(0, 3),
        png(4097, 10),
        jpeg(5000, 10),
    ],
)
def test_refuses_everything_else(data: bytes) -> None:
    with pytest.raises(InvalidInput):
        inspect_image(data)


def test_refuses_images_above_the_size_limit() -> None:
    data = png() + b"\x00" * MAX_IMAGE_BYTES
    with pytest.raises(InvalidInput, match="5 MB"):
        inspect_image(data)


def test_writes_reads_and_deletes_an_image(store: DocumentStore, tmp_path: Path) -> None:
    store.write_image(IMAGE, png())
    assert store.read_image(IMAGE) == (png(), "image/png")
    assert (tmp_path / "data" / IMAGE).read_bytes() == png()
    assert store.list_paths() == []
    store.delete_image(IMAGE)
    with pytest.raises(NotFound):
        store.read_image(IMAGE)
    with pytest.raises(NotFound):
        store.delete_image(IMAGE)


def test_media_type_follows_the_ending(store: DocumentStore) -> None:
    store.write_image("worlds/w/bilder/a.jpg", jpeg())
    store.write_image("worlds/w/bilder/b.webp", webp_lossy())
    assert store.read_image("worlds/w/bilder/a.jpg")[1] == "image/jpeg"
    assert store.read_image("worlds/w/bilder/b.webp")[1] == "image/webp"


def test_an_image_is_never_overwritten(store: DocumentStore) -> None:
    store.write_image(IMAGE, png())
    with pytest.raises(AlreadyExists):
        store.write_image(IMAGE, png(5, 5))
    assert store.read_image(IMAGE)[0] == png()


@pytest.mark.parametrize(
    ("path", "data"),
    [
        ("worlds/w/bilder/a.jpg", png()),  # ending does not match the content
        ("worlds/w/bilder/a.svg", png()),
        ("worlds/w/bilder/a.md", png()),
        ("worlds/w/bilder/a", png()),
        ("../a.png", png()),
        ("/etc/a.png", png()),
        ("worlds/w/../../a.png", png()),
        ("worlds/w/bilder/a.png", b"<svg/>"),
    ],
)
def test_refuses_bad_paths_and_contents(store: DocumentStore, path: str, data: bytes) -> None:
    with pytest.raises(InvalidInput):
        store.write_image(path, data)


@pytest.mark.parametrize("path", ["worlds/w/canon/figur/kael.md", "../a.png", "worlds/w/a.svg"])
def test_reads_only_image_files(store: DocumentStore, path: str) -> None:
    with pytest.raises(InvalidInput):
        store.read_image(path)
    with pytest.raises(InvalidInput):
        store.delete_image(path)

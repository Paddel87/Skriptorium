"""Checks for image files kept next to the documents (step 7.6, ADR-072).

Only raster formats are accepted: PNG, JPEG and WebP, recognised by their first bytes, never by
a name or a type the sender claims. SVG and everything else are refused, because a browser may
run scripts inside them. The width and height are read from the file header; nothing is decoded.
"""

from dataclasses import dataclass
from typing import Final, Literal

from skriptorium.storage.errors import InvalidInput

ImageKind = Literal["png", "jpeg", "webp"]

MAX_IMAGE_BYTES: Final = 5 * 1024 * 1024
"""Largest accepted image file; the browser shrinks photos well below this before upload."""

MAX_IMAGE_SIDE: Final = 4096
"""Longest accepted side in pixels."""

IMAGE_SUFFIXES: Final[dict[ImageKind, str]] = {"png": ".png", "jpeg": ".jpg", "webp": ".webp"}
MEDIA_TYPES: Final[dict[str, str]] = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
}

_PNG_SIGNATURE: Final = b"\x89PNG\r\n\x1a\n"
# JPEG start-of-frame markers that carry the image size (not DHT C4, JPG C8, DAC CC).
_JPEG_FRAMES: Final = frozenset(
    {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
)
# Markers without a length field.
_JPEG_STANDALONE: Final = frozenset({0x01, *range(0xD0, 0xD8)})
_JPEG_START_OF_SCAN: Final = 0xDA


@dataclass(frozen=True)
class ImageInfo:
    """Format and size of an accepted image."""

    kind: ImageKind
    width: int
    height: int


def inspect_image(data: bytes) -> ImageInfo:
    """Recognise a PNG, JPEG or WebP image and read its size from the header.

    Raises:
        InvalidInput: Too large, another format, a broken header, or a side of zero or above
            :data:`MAX_IMAGE_SIDE` pixels.
    """
    if len(data) > MAX_IMAGE_BYTES:
        raise InvalidInput("Das Bild ist größer als 5 MB")
    if data.startswith(_PNG_SIGNATURE):
        info = _png(data)
    elif data.startswith(b"\xff\xd8\xff"):
        info = _jpeg(data)
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        info = _webp(data)
    else:
        raise InvalidInput("Nur Bilder im Format PNG, JPEG oder WebP")
    if not (0 < info.width <= MAX_IMAGE_SIDE and 0 < info.height <= MAX_IMAGE_SIDE):
        raise InvalidInput(f"Bildgröße nicht erlaubt (höchstens {MAX_IMAGE_SIDE} Pixel je Seite)")
    return info


def _png(data: bytes) -> ImageInfo:
    if len(data) < 24 or data[12:16] != b"IHDR":
        raise InvalidInput("Bild beschädigt")
    return ImageInfo("png", _big(data, 16, 4), _big(data, 20, 4))


def _jpeg(data: bytes) -> ImageInfo:
    at = 2
    while at + 4 <= len(data):
        if data[at] != 0xFF:
            break
        marker = data[at + 1]
        if marker == 0xFF:  # fill byte before a marker
            at += 1
            continue
        if marker in _JPEG_STANDALONE:
            at += 2
            continue
        if marker == _JPEG_START_OF_SCAN:
            break
        length = _big(data, at + 2, 2)
        if length < 2:
            break
        if marker in _JPEG_FRAMES:
            if at + 9 > len(data):
                break
            return ImageInfo("jpeg", _big(data, at + 7, 2), _big(data, at + 5, 2))
        at += 2 + length
    raise InvalidInput("Bild beschädigt")


def _webp(data: bytes) -> ImageInfo:
    chunk = data[12:16]
    if chunk == b"VP8 " and len(data) >= 30 and data[23:26] == b"\x9d\x01\x2a":
        return ImageInfo("webp", _little(data, 26, 2) & 0x3FFF, _little(data, 28, 2) & 0x3FFF)
    if chunk == b"VP8L" and len(data) >= 25 and data[20] == 0x2F:
        bits = _little(data, 21, 4)
        return ImageInfo("webp", (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1)
    if chunk == b"VP8X" and len(data) >= 30:
        return ImageInfo("webp", _little(data, 24, 3) + 1, _little(data, 27, 3) + 1)
    raise InvalidInput("Bild beschädigt")


def _big(data: bytes, at: int, size: int) -> int:
    return int.from_bytes(data[at : at + size], "big")


def _little(data: bytes, at: int, size: int) -> int:
    return int.from_bytes(data[at : at + size], "little")

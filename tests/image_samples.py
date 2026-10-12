"""Smallest headers of PNG, JPEG and WebP files, as the image checks read them (step 7.6)."""

import struct
import zlib


def png(width: int = 2, height: int = 3) -> bytes:
    """A PNG signature with its IHDR chunk."""
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    crc = struct.pack(">I", zlib.crc32(b"IHDR" + ihdr))
    return b"\x89PNG\r\n\x1a\n" + struct.pack(">I", len(ihdr)) + b"IHDR" + ihdr + crc


def jpeg(width: int = 4, height: int = 5, *, exif: bytes = b"") -> bytes:
    """SOI, an APP0 segment, optionally an APP1 (Exif) segment, then the frame header SOF0."""
    app0 = b"\xff\xe0" + struct.pack(">H", 16) + b"JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    app1 = b"\xff\xe1" + struct.pack(">H", len(exif) + 2) + exif if exif else b""
    sof0 = b"\xff\xc0" + struct.pack(">HBHHB", 11, 8, height, width, 1) + b"\x01\x11\x00"
    return b"\xff\xd8" + app0 + app1 + sof0 + b"\xff\xda\x00\x02"


def webp_lossy(width: int = 6, height: int = 7) -> bytes:
    """RIFF/WEBP with a VP8 chunk."""
    frame = b"\x00\x00\x00" + b"\x9d\x01\x2a" + struct.pack("<HH", width, height)
    chunk = b"VP8 " + struct.pack("<I", len(frame)) + frame
    return b"RIFF" + struct.pack("<I", 4 + len(chunk)) + b"WEBP" + chunk


def webp_lossless(width: int = 8, height: int = 9) -> bytes:
    """RIFF/WEBP with a VP8L chunk."""
    bits = (width - 1) | ((height - 1) << 14)
    frame = b"\x2f" + struct.pack("<I", bits)
    chunk = b"VP8L" + struct.pack("<I", len(frame)) + frame
    return b"RIFF" + struct.pack("<I", 4 + len(chunk)) + b"WEBP" + chunk


def webp_extended(width: int = 10, height: int = 11) -> bytes:
    """RIFF/WEBP with a VP8X chunk."""
    frame = (
        b"\x00\x00\x00\x00" + (width - 1).to_bytes(3, "little") + (height - 1).to_bytes(3, "little")
    )
    chunk = b"VP8X" + struct.pack("<I", len(frame)) + frame
    return b"RIFF" + struct.pack("<I", 4 + len(chunk)) + b"WEBP" + chunk

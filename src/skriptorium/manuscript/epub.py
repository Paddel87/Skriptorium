"""A story as an EPUB 3 file (step 7.4, ADR-071), built with the standard library only.

The book holds a title page (title, author if given), a table of contents (``nav.xhtml`` and,
for older readers, ``toc.ncx``) and one document per chapter. From the chapter's Markdown it
takes paragraphs (lines joined as in Markdown), headings, ``*italic*``/``_italic_``,
``**bold**`` and scene breaks (``***``, ``* * *``, ``---``, ``___``, ``⁂``). Every text is
escaped; nothing in the manuscript becomes markup. Characters that XML does not allow are
dropped, so each document stays well-formed.
"""

import html
import re
import uuid
import zipfile
from collections.abc import Sequence
from datetime import UTC, datetime
from io import BytesIO
from typing import Final

from skriptorium.manuscript.models import Chapter, Story

MEDIA_TYPE: Final = "application/epub+zip"
_HEADING: Final = re.compile(r"^(#{1,6})\s+(.*)$")
_BREAK: Final = re.compile(r"^\s*(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,}|⁂)\s*$")
_BOLD: Final = re.compile(r"\*\*(.+?)\*\*")
_ITALIC: Final = re.compile(
    r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])|(?<!\w)_(?!\s)(.+?)(?<!\s)_(?!\w)"
)
# Characters outside XML 1.0 (control characters except tab, line feed, carriage return).
_NOT_XML: Final = re.compile("[\x00-\x08\x0b\x0c\x0e-\x1f￾￿]")
_STYLE: Final = """body { font-family: serif; line-height: 1.5; margin: 0 5%; }
h1, h2 { text-align: center; font-weight: normal; }
h1 { margin-top: 30%; }
p { margin: 0; text-indent: 1.2em; }
h2 + p, h3 + p, p.break + p { text-indent: 0; }
p.break { text-align: center; margin: 1em 0; text-indent: 0; }
p.author { text-align: center; text-indent: 0; margin-top: 1em; }
"""


def epub_for(
    story: Story, chapters: Sequence[Chapter], author: str | None, modified: datetime
) -> bytes:
    """The EPUB file of ``story`` with ``chapters`` in their order; ``modified`` stamps it."""
    title = _clean(story.title)
    writer = _clean(author or "").strip() or None
    stamp = modified.astimezone(UTC).replace(microsecond=0)
    identifier = (
        f"urn:uuid:{uuid.uuid5(uuid.NAMESPACE_URL, f'skriptorium:{story.world}/{story.id}')}"
    )
    names = [f"kapitel-{chapter.number:02d}.xhtml" for chapter in chapters]
    heads = [f"{chapter.number}. {_clean(chapter.title)}" for chapter in chapters]
    files: list[tuple[str, str]] = [
        ("META-INF/container.xml", _CONTAINER),
        ("OEBPS/content.opf", _package(title, writer, identifier, stamp, names)),
        ("OEBPS/nav.xhtml", _nav(title, names, heads)),
        ("OEBPS/toc.ncx", _ncx(title, identifier, names, heads)),
        ("OEBPS/style.css", _STYLE),
        ("OEBPS/titel.xhtml", _title_page(title, writer)),
    ]
    for name, head, chapter in zip(names, heads, chapters, strict=True):
        files.append(
            (f"OEBPS/{name}", _document(head, f"<h2>{_escape(head)}</h2>\n{_body(chapter.text)}"))
        )
    buffer = BytesIO()
    when = stamp.timetuple()[:6]
    with zipfile.ZipFile(buffer, "w") as book:
        # The media type comes first and uncompressed, as the EPUB container demands.
        book.writestr(zipfile.ZipInfo("mimetype", when), MEDIA_TYPE, zipfile.ZIP_STORED)
        for name, content in files:
            book.writestr(
                zipfile.ZipInfo(name, when), content.encode("utf-8"), zipfile.ZIP_DEFLATED
            )
    return buffer.getvalue()


def _body(markdown: str) -> str:
    """XHTML of a chapter's Markdown: headings, paragraphs and scene breaks."""
    blocks: list[str] = []
    paragraph: list[str] = []

    def close() -> None:
        if paragraph:
            blocks.append(f"<p>{_inline(' '.join(paragraph))}</p>")
            paragraph.clear()

    for raw in _clean(markdown).replace("\r\n", "\n").split("\n"):
        line = raw.strip()
        heading = _HEADING.match(line)
        if not line:
            close()
        elif _BREAK.match(line):
            close()
            blocks.append('<p class="break">⁂</p>')
        elif heading is not None:
            close()
            blocks.append(f"<h3>{_inline(heading.group(2))}</h3>")
        else:
            paragraph.append(line)
    close()
    return "\n".join(blocks)


def _inline(text: str) -> str:
    escaped = _BOLD.sub(r"<strong>\1</strong>", _escape(text))
    return _ITALIC.sub(lambda m: f"<em>{m.group(1) or m.group(2)}</em>", escaped)


def _escape(text: str) -> str:
    return html.escape(text, quote=True)


def _clean(text: str) -> str:
    return _NOT_XML.sub("", text)


def _document(title: str, body: str) -> str:
    return f"""<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"
 xml:lang="de" lang="de">
<head>
<meta charset="utf-8"/>
<title>{_escape(title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
{body}
</body>
</html>
"""


def _title_page(title: str, author: str | None) -> str:
    byline = f'\n<p class="author">{_escape(author)}</p>' if author else ""
    return _document(title, f"<h1>{_escape(title)}</h1>{byline}")


def _nav(title: str, names: Sequence[str], heads: Sequence[str]) -> str:
    items = "\n".join(
        f'<li><a href="{name}">{_escape(head)}</a></li>'
        for name, head in zip(names, heads, strict=True)
    )
    return _document(
        title,
        f'<nav epub:type="toc" id="toc">\n<h2>Inhalt</h2>\n<ol>\n{items}\n</ol>\n</nav>',
    )


def _ncx(title: str, identifier: str, names: Sequence[str], heads: Sequence[str]) -> str:
    points = "\n".join(
        f'<navPoint id="p{index}" playOrder="{index}"><navLabel><text>{_escape(head)}</text>'
        f'</navLabel><content src="{name}"/></navPoint>'
        for index, (name, head) in enumerate(zip(names, heads, strict=True), start=1)
    )
    return f"""<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head><meta name="dtb:uid" content="{_escape(identifier)}"/></head>
<docTitle><text>{_escape(title)}</text></docTitle>
<navMap>
{points}
</navMap>
</ncx>
"""


def _package(
    title: str, author: str | None, identifier: str, stamp: datetime, names: Sequence[str]
) -> str:
    creator = f"\n<dc:creator>{_escape(author)}</dc:creator>" if author else ""
    chapters = "\n".join(
        f'<item id="k{index}" href="{name}" media-type="application/xhtml+xml"/>'
        for index, name in enumerate(names, start=1)
    )
    spine = "\n".join(f'<itemref idref="k{index}"/>' for index in range(1, len(names) + 1))
    return f"""<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id" xml:lang="de">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="id">{_escape(identifier)}</dc:identifier>
<dc:title>{_escape(title)}</dc:title>
<dc:language>de</dc:language>{creator}
<meta property="dcterms:modified">{stamp.strftime("%Y-%m-%dT%H:%M:%SZ")}</meta>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
<item id="css" href="style.css" media-type="text/css"/>
<item id="titel" href="titel.xhtml" media-type="application/xhtml+xml"/>
{chapters}
</manifest>
<spine toc="ncx">
<itemref idref="titel"/>
<itemref idref="nav"/>
{spine}
</spine>
</package>
"""


_CONTAINER: Final = """<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles>
<rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
</rootfiles>
</container>
"""

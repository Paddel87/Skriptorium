"""Translating SillyTavern cards and lorebooks into import Markdown (step 6.8, ADR-065).

The fixtures follow what SillyTavern writes on export (``charaFormatData`` and
``convertWorldInfoToCharacterBook`` in ``src/endpoints/characters.js``, the world info entry
template in ``public/scripts/world-info.js``; checked 2026-10-11). The PNG is built like
SillyTavern's ``character-card-parser.write``: tEXt chunks ``chara`` and ``ccv3`` before IEND.
"""

import base64
import json
import struct
import zlib
from pathlib import Path

import pytest

from skriptorium.canon.importers import parse_markdown, translate_sillytavern
from skriptorium.canon.importers.sillytavern import MAX_BYTES, MAX_ENTRIES
from skriptorium.storage import InvalidInput

FIXTURES = Path(__file__).parent / "fixtures" / "sillytavern"
ZWSP = "​"


def _fixture(name: str) -> bytes:
    return (FIXTURES / name).read_bytes()


def _chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data))


def png(*texts: tuple[str, bytes], extra: bytes = b"") -> bytes:
    """A real 1x1 PNG with the given tEXt chunks before IEND."""
    header = _chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    pixels = _chunk(b"IDAT", zlib.compress(b"\x00\xff\xff\xff"))
    texts_ = b"".join(_chunk(b"tEXt", key.encode() + b"\x00" + value) for key, value in texts)
    return b"\x89PNG\r\n\x1a\n" + header + pixels + extra + texts_ + _chunk(b"IEND", b"")


def card_png(card: dict[str, object]) -> bytes:
    """Like SillyTavern: ``chara`` with the V2 card, ``ccv3`` with the spec set to V3."""
    v3 = {**card, "spec": "chara_card_v3", "spec_version": "3.0"}
    return png(
        ("chara", base64.b64encode(json.dumps(card).encode())),
        ("ccv3", base64.b64encode(json.dumps(v3).encode())),
    )


def test_a_card_becomes_a_figure_with_its_lorebook() -> None:
    result = translate_sillytavern(_fixture("karte-v2.json"))
    parsed = parse_markdown(result.markdown)
    names = [entry.name for entry in parsed.entries]
    assert names == ["Mira Ostwind", "Die Rote Laterne", "Zollhaus"]
    figure, inn, customs = parsed.entries
    assert figure.category == "figur"
    assert figure.aliases == ()
    assert figure.body.startswith("Schmugglerin aus dem Hafenviertel")
    # The heading in the description stays inside the entry, below "Wesen" in level.
    assert "### Herkunft\nGeboren auf einem Salzkahn." in figure.body
    assert (
        "### Wesen\nMisstrauisch, schlagfertig, loyal zu wenigen. Mira Ostwind lacht selten."
        in (figure.body)
    )
    # Nothing made for the chat.
    for chat in ("Poller", "Erst das Geld", "Rollenspiele", "Kai.", "Münzen"):
        assert chat not in result.markdown
    assert inn.category is None
    assert inn.aliases == ("Rote Laterne", "Laterne", "Hafenkneipe")
    # {{char}} in an embedded lorebook is the card's figure; a field line stays text.
    assert (
        inn.body
        == f"Kneipe am Kai, in der Mira Ostwind ihre Geschäfte macht.\n{ZWSP}Kategorie: Ort\n"
    )
    # No name: the first key; a comma inside a key would split the aliases.
    assert customs.aliases == ("Zoll Wache",)
    # The open code fence is closed, its heading stays text.
    assert customs.body == "```\nalter Aushang\n# Steuern\n```\n"
    assert result.not_taken_over == (
        "Nicht übernommen (Chat-Zubehör): Szenario, Begrüßung, weitere Begrüßungen, "
        "Beispieldialoge, Notizen des Erstellers, Schlagwörter.",
        "1 Lorebook-Eintrag ist in SillyTavern abgeschaltet und fehlt.",
        "„{{user}}“ steht 1-mal im Text; bitte selbst passend umschreiben.",
    )


def test_a_png_card_reads_ccv3_before_chara() -> None:
    card = json.loads(_fixture("karte-v2.json"))
    older = {**card, "data": {**card["data"], "name": "Alt"}}
    image = png(
        ("chara", base64.b64encode(json.dumps(older).encode())),
        ("ccv3", base64.b64encode(json.dumps({**card, "spec": "chara_card_v3"}).encode())),
    )
    assert parse_markdown(translate_sillytavern(image).markdown).entries[0].name == "Mira Ostwind"
    assert translate_sillytavern(card_png(card)) == translate_sillytavern(_fixture("karte-v2.json"))


def test_a_png_with_only_chara_and_other_chunks() -> None:
    card = {"spec": "chara_card_v2", "data": {"name": "Kael", "description": "Fährmann."}}
    image = png(
        ("Comment", b"made with paint"),
        ("CHARA", base64.b64encode(json.dumps(card).encode())),
        extra=_chunk(b"zTXt", b"chara\x00\x00" + zlib.compress(b"ignored")),
    )
    assert translate_sillytavern(image).markdown == "# Figuren\n\n## Kael\nFährmann.\n"
    # Without the closing IEND chunk the card is still found.
    assert translate_sillytavern(image[:-12]).markdown == "# Figuren\n\n## Kael\nFährmann.\n"


def test_v3_nickname_is_an_alias_and_v1_cards_work() -> None:
    v3 = {"spec": "chara_card_v3", "data": {"name": "Mira", "nickname": "Ostwind"}}
    assert translate_sillytavern(json.dumps(v3).encode()).markdown == (
        "# Figuren\n\n## Mira\nAliasse: Ostwind\n"
    )
    v1 = {"name": "Kael", "description": "Fährmann.", "first_mes": "Hallo."}
    result = translate_sillytavern(json.dumps(v1).encode())
    assert result.markdown == "# Figuren\n\n## Kael\nFährmann.\n"
    assert result.not_taken_over == ("Nicht übernommen (Chat-Zubehör): Begrüßung.",)


def test_a_sillytavern_lorebook() -> None:
    result = translate_sillytavern(_fixture("lorebook-st.json"))
    parsed = parse_markdown(result.markdown)
    assert [(e.name, e.category, e.aliases) for e in parsed.entries] == [
        ("Der Salzsee", None, ("Salzsee", "der See")),
        # A name that names a category would turn into a group heading.
        ("Orte (Lorebook)", None, ("Orte",)),
    ]
    assert parsed.not_taken_over == ()
    assert result.not_taken_over == (
        "1 Lorebook-Eintrag ist in SillyTavern abgeschaltet und fehlt.",
        "1 Lorebook-Eintrag hat keinen Text und fehlt.",
        "„{{char}}“ steht im Text, ohne dass eine Figur dazugehört.",
    )


def test_a_v3_lorebook_and_odd_entries() -> None:
    book = {
        "spec": "lorebook_v3",
        "data": {
            "entries": [
                {"keys": [], "content": "Ohne Namen.", "enabled": True},
                {"keys": ["Glocke", 7, "glocke"], "name": "## Glocke #", "content": "Läutet."},
                "kein Eintrag",
                {"keys": "kein Array", "comment": "Aliasse: x", "content": "- **Aliasse:** y"},
            ]
        },
    }
    parsed = parse_markdown(translate_sillytavern(json.dumps(book).encode()).markdown)
    assert [(e.name, e.aliases, e.body) for e in parsed.entries] == [
        ("Eintrag 1", (), "Ohne Namen.\n"),
        ("Glocke", (), "Läutet.\n"),
        ("Aliasse: x", (), f"{ZWSP}- **Aliasse:** y\n"),
    ]


@pytest.mark.parametrize(
    ("data", "message"),
    [
        (b"x" * (MAX_BYTES + 1), "größer als 10 MB"),
        (b"\xff\xfe", "kein lesbares JSON"),
        (b"[" * 100_000 + b"]" * 100_000, "kein lesbares JSON"),
        (b"[1, 2]", "Keine Figurenkarte"),
        (b'{"spec": "chara_card_v2", "data": "x"}', "Keine Figurenkarte"),
        (b'{"spec": "lorebook_v3", "data": []}', "Keine Figurenkarte"),
        (b'{"title": "x"}', "Keine Figurenkarte"),
        (b'{"entries": {"0": {"content": ""}}}', "keine übernehmbaren"),
        (png(), "keine Figurenkarte aus SillyTavern"),
        (png(("ccv3", b"!!kein base64!!")), "beschädigt"),
        (png(("chara", base64.b64encode(b"{kaputt"))), "kein lesbares JSON"),
        (png()[:20], "keine Figurenkarte aus SillyTavern"),
    ],
)
def test_broken_files_are_refused_without_content(data: bytes, message: str) -> None:
    with pytest.raises(InvalidInput, match=message) as raised:
        translate_sillytavern(data)
    assert "kaputt" not in str(raised.value)


def test_counts_several_left_out_entries() -> None:
    book = {
        "entries": [
            {"keys": ["a"], "content": "x"},
            {"keys": ["b"], "content": "", "enabled": True},
            {"keys": ["c"], "content": " "},
            {"keys": ["d"], "content": "y", "enabled": False},
            {"keys": ["e"], "content": "z", "disable": True},
        ]
    }
    assert translate_sillytavern(json.dumps(book).encode()).not_taken_over == (
        "2 Lorebook-Einträge sind in SillyTavern abgeschaltet und fehlen.",
        "2 Lorebook-Einträge haben keinen Text und fehlen.",
    )


def test_too_many_lorebook_entries() -> None:
    book = {"entries": [{"keys": ["a"], "content": "x"}] * (MAX_ENTRIES + 1)}
    with pytest.raises(InvalidInput, match="Mehr als 1000"):
        translate_sillytavern(json.dumps(book).encode())


def _parsed(document: object) -> list[tuple[str, str | None, tuple[str, ...], str]]:
    markdown = translate_sillytavern(json.dumps(document).encode()).markdown
    return [(e.name, e.category, e.aliases, e.body) for e in parse_markdown(markdown).entries]


def test_field_lines_inside_code_fences_stay_text() -> None:
    card = {"name": "Mira", "description": "```\nKategorie: Orte\nAliasse: Evil\n```\ntext"}
    assert _parsed(card) == [
        ("Mira", "figur", (), f"```\n{ZWSP}Kategorie: Orte\n{ZWSP}Aliasse: Evil\n```\ntext\n")
    ]


def test_headings_in_the_text_do_not_split_or_swallow_an_entry() -> None:
    book = {"entries": [{"comment": "Alpha", "content": "# A\nx\n# B\ny"}]}
    assert _parsed(book) == [("Alpha", None, (), f"{ZWSP}\n### A\nx\n### B\ny\n")]
    card = {"name": "Mira", "description": "", "personality": "Ruhig."}
    assert _parsed(card) == [("Mira", "figur", (), f"{ZWSP}\n### Wesen\nRuhig.\n")]


def test_names_that_name_a_category_or_yield_no_identifier() -> None:
    assert [e[0] for e in _parsed({"name": "Orte", "description": "x"})] == ["Orte (Figur)"]
    result = translate_sillytavern(
        json.dumps({"entries": [{"comment": "日本語", "content": "x"}]}).encode()
    )
    assert [e.name for e in parse_markdown(result.markdown).entries] == ["Eintrag 1"]
    assert result.not_taken_over == (
        "Ein Name ohne Buchstaben oder Ziffern heißt jetzt „Eintrag 1“.",
    )

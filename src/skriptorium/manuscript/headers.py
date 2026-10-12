"""Reading and writing the headers of the Markdown files (story, facts, chapters, history)."""

from collections.abc import Sequence
from datetime import datetime
from pathlib import PurePosixPath

from skriptorium.manuscript.layout import COVER_FILE, COVER_KEY, STYLE_KEY, chapter_number
from skriptorium.manuscript.models import (
    CHAPTER_STATUSES,
    SUMMARY_STATUSES,
    Chapter,
    ChapterStatus,
    Form,
    GuestLink,
    InstructionNote,
    Story,
    StoryFact,
    SummaryStatus,
    WritingStyle,
)
from skriptorium.manuscript.validation import checked_form
from skriptorium.storage import Document, HeaderValue, InvalidInput


def style_header(style: WritingStyle) -> HeaderValue:
    return {
        "tonalitaet": list[HeaderValue](style.tone),
        "atmosphaere": list[HeaderValue](style.atmosphere),
        "stil": list[HeaderValue](style.style),
        "tempo": style.tempo,
        "deutlichkeit": style.explicitness,
        "frei": style.free,
    }


def style_from(document: Document, value: HeaderValue) -> WritingStyle:
    """Read a ``schreibweise`` mapping; keys that are missing count as empty."""
    if not isinstance(value, dict):
        raise InvalidInput(f"{document.path}: Feld 'schreibweise' muss ein Mapping sein")
    section = Document(document.path, value, "")

    def single(key: str) -> str | None:
        item = value.get(key)
        if item is not None and not isinstance(item, str):
            raise InvalidInput(f"{document.path}: schreibweise.{key} muss ein Text sein")
        return item or None

    free = value.get("frei", "")
    if not isinstance(free, str):
        raise InvalidInput(f"{document.path}: schreibweise.frei muss ein Text sein")
    return WritingStyle(
        tone=tuple(header_text_list(section, "tonalitaet")),
        atmosphere=tuple(header_text_list(section, "atmosphaere")),
        style=tuple(header_text_list(section, "stil")),
        tempo=single("tempo"),
        explicitness=single("deutlichkeit"),
        free=free,
    )


def header_text(document: Document, key: str) -> str:
    value = document.header.get(key)
    if not isinstance(value, str):
        raise InvalidInput(f"{document.path}: Feld {key!r} muss ein Text sein")
    return value


def header_text_list(document: Document, key: str) -> list[str]:
    value = document.header.get(key, [])
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise InvalidInput(f"{document.path}: Feld {key!r} muss eine Liste von Texten sein")
    return [item for item in value if isinstance(item, str)]


def header_pairs(document: Document, key: str, first: str, second: str) -> list[tuple[str, str]]:
    value = document.header.get(key, [])
    pairs: list[tuple[str, str]] = []
    if not isinstance(value, list):
        raise InvalidInput(f"{document.path}: Feld {key!r} muss eine Liste sein")
    for item in value:
        if (
            not isinstance(item, dict)
            or not isinstance(item.get(first), str)
            or not isinstance(item.get(second), str)
        ):
            raise InvalidInput(f"{document.path}: {key} braucht je Eintrag {first} und {second}")
        pairs.append((str(item[first]), str(item[second])))
    return pairs


def story_from(document: Document, facts: tuple[StoryFact, ...]) -> Story:
    perspective = document.header.get("perspektive")
    if perspective is not None and not isinstance(perspective, str):
        raise InvalidInput(f"{document.path}: Feld 'perspektive' muss ein Text sein")
    model = document.header.get("modell")
    if model is not None and not isinstance(model, str):
        raise InvalidInput(f"{document.path}: Feld 'modell' muss ein Text sein")
    return Story(
        world=PurePosixPath(document.path).parts[1],
        id=PurePosixPath(document.path).parts[3],
        title=header_text(document, "titel"),
        form=checked_form(header_text(document, "form")),
        perspective=perspective,
        controlled_characters=tuple(header_text_list(document, "gefuehrte_figuren")),
        guest_links=tuple(
            GuestLink(w, e)
            for w, e in header_pairs(document, "gast_verbindungen", "welt", "eintrag")
        ),
        facts=facts,
        summary=document.body,
        model=model,
        genres=tuple(header_text_list(document, "genre")),
        writing_style=(
            style_from(document, document.header[STYLE_KEY])
            if document.header.get(STYLE_KEY) is not None
            else WritingStyle()
        ),
        cover=_cover_of(document),
    )


def _cover_of(document: Document) -> str | None:
    value = document.header.get(COVER_KEY)
    if value is None:
        return None
    if not isinstance(value, str) or not COVER_FILE.fullmatch(value):
        raise InvalidInput(f"{document.path}: Feld 'titelbild' muss ein Bilddateiname sein")
    return value


def facts_from(document: Document) -> tuple[StoryFact, ...]:
    return tuple(StoryFact(e, f) for e, f in header_pairs(document, "fakten", "eintrag", "fakt"))


def chapter_from(document: Document) -> Chapter:
    parts = PurePosixPath(document.path).parts
    number = document.header.get("kapitel")
    if (
        not isinstance(number, int)
        or isinstance(number, bool)
        or number != chapter_number(document.path)
    ):
        raise InvalidInput(f"{document.path}: Feld 'kapitel' passt nicht zum Dateinamen")
    status = header_text(document, "status")
    if status not in CHAPTER_STATUSES:
        raise InvalidInput(f"{document.path}: unbekannter Kapitelstatus {status!r}")
    summary_status = header_text(document, "kurzfassung_status")
    if summary_status not in SUMMARY_STATUSES:
        raise InvalidInput(f"{document.path}: unbekannter Status {summary_status!r}")
    return Chapter(
        world=parts[1],
        story=parts[3],
        number=number,
        title=header_text(document, "titel"),
        status=status,
        summary=header_text(document, "kurzfassung"),
        summary_status=summary_status,
        text=document.body,
        writing_style=(
            style_from(document, document.header[STYLE_KEY])
            if document.header.get(STYLE_KEY) is not None
            else None
        ),
    )


def story_header(
    previous: dict[str, HeaderValue],
    title: str,
    form: Form,
    perspective: str | None,
    controlled: list[str],
    guest_links: tuple[GuestLink, ...],
    model: str | None,
    genres: Sequence[str],
    writing_style: WritingStyle,
) -> dict[str, HeaderValue]:
    header: dict[str, HeaderValue] = {
        "titel": title,
        "form": form,
        "perspektive": perspective.strip() if perspective and perspective.strip() else None,
        "gefuehrte_figuren": list[HeaderValue](controlled),
        "gast_verbindungen": guest_links_header(guest_links),
        "modell": model.strip() if model and model.strip() else None,
        "genre": list[HeaderValue](genres),
        STYLE_KEY: style_header(writing_style),
    }
    header.update({k: v for k, v in previous.items() if k not in header})
    return header


def notes_from(document: Document) -> list[InstructionNote]:
    value = document.header.get("anweisungen", [])
    if not isinstance(value, list):
        raise InvalidInput(f"{document.path}: Feld 'anweisungen' muss eine Liste sein")
    notes: list[InstructionNote] = []
    for item in value:
        at = item.get("zeit") if isinstance(item, dict) else None
        instruction = item.get("anweisung") if isinstance(item, dict) else None
        text = item.get("text", "") if isinstance(item, dict) else None
        model = item.get("modell") if isinstance(item, dict) else None
        if (
            not isinstance(at, str)
            or not isinstance(instruction, str)
            or not isinstance(text, str)
            or not (model is None or isinstance(model, str))
        ):
            raise InvalidInput(
                f"{document.path}: anweisungen braucht je Eintrag zeit und anweisung"
            )
        try:
            moment = datetime.fromisoformat(at)
        except ValueError as error:
            raise InvalidInput(f"{document.path}: ungültige Zeit {at!r}") from error
        notes.append(InstructionNote(moment, instruction, text, model))
    return notes


def chapter_header(
    number: int,
    title: str,
    status: ChapterStatus,
    summary: str,
    summary_status: SummaryStatus,
    writing_style: WritingStyle | None,
    previous: dict[str, HeaderValue],
) -> dict[str, HeaderValue]:
    """Header of a chapter file; fields of ``previous`` that are not known here are kept."""
    header: dict[str, HeaderValue] = {
        "kapitel": number,
        "titel": title,
        "status": status,
        "kurzfassung": summary,
        "kurzfassung_status": summary_status,
    }
    if writing_style is not None:
        header["schreibweise"] = style_header(writing_style)
    header.update({k: v for k, v in previous.items() if k not in header and k != STYLE_KEY})
    return header


def guest_links_header(links: Sequence[GuestLink]) -> HeaderValue:
    """The ``gast_verbindungen`` value of a story header."""
    return [{"welt": g.world, "eintrag": g.entry} for g in links]


def facts_header(facts: Sequence[StoryFact]) -> dict[str, HeaderValue]:
    """Header of the facts file."""
    return {"fakten": [{"eintrag": f.entry, "fakt": f.fact} for f in facts]}


def history_header(number: int, notes: Sequence[InstructionNote]) -> dict[str, HeaderValue]:
    """Header of the instruction history file of one chapter."""
    return {
        "kapitel": number,
        "anweisungen": [
            {
                "zeit": n.at.isoformat(timespec="seconds"),
                "anweisung": n.instruction,
                "modell": n.model,
                "text": n.text,
            }
            for n in notes
        ],
    }

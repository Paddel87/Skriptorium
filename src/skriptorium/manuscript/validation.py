"""Checks of caller input: forms, texts, references and the fixed lists of the writing style."""

from collections.abc import Sequence

from skriptorium.manuscript.models import (
    ATMOSPHERES,
    EXPLICITNESSES,
    FORMS,
    FREE_TEXT_MAX,
    STYLES,
    TEMPOS,
    TONES,
    Form,
    Keep,
    WritingStyle,
)
from skriptorium.storage import InvalidInput, checked_identifier


def checked_form(form: str) -> Form:
    if form not in FORMS:
        raise InvalidInput(f"Unbekannte Form: {form!r}")
    return form


def required_text(value: str, label: str) -> str:
    text = value.strip()
    if not text:
        raise InvalidInput(f"{label} darf nicht leer sein")
    return text


def clean_references(references: Sequence[str]) -> list[str]:
    if isinstance(references, str):
        raise InvalidInput("Figuren müssen als Liste angegeben werden")
    return [checked_identifier(reference) for reference in references]


def checked_choices(values: Sequence[str], allowed: tuple[str, ...], label: str) -> tuple[str, ...]:
    """The values without repeats, in the given order; each must be on the list."""
    if isinstance(values, str):
        raise InvalidInput(f"{label}: Werte müssen als Liste angegeben werden")
    for value in values:
        if value not in allowed:
            raise InvalidInput(f"Unbekannter Wert für {label}: {value!r}")
    return tuple(dict.fromkeys(values))


def checked_single(value: str | None, allowed: tuple[str, ...], label: str) -> str | None:
    if value is None or not value.strip():
        return None
    if value.strip() not in allowed:
        raise InvalidInput(f"Unbekannter Wert für {label}: {value!r}")
    return value.strip()


def checked_style(style: WritingStyle) -> WritingStyle:
    """``style`` with every value checked against the fixed lists (ADR-053)."""
    free = style.free.strip()
    if len(free) > FREE_TEXT_MAX:
        raise InvalidInput(f"Weitere Angaben dürfen höchstens {FREE_TEXT_MAX} Zeichen lang sein")
    return WritingStyle(
        tone=checked_choices(style.tone, TONES, "Tonalität"),
        atmosphere=checked_choices(style.atmosphere, ATMOSPHERES, "Atmosphäre"),
        style=checked_choices(style.style, STYLES, "Stil"),
        tempo=checked_single(style.tempo, TEMPOS, "Tempo"),
        explicitness=checked_single(style.explicitness, EXPLICITNESSES, "Deutlichkeit"),
        free=free,
    )


def checked_chapter_style(
    style: WritingStyle | Keep | None,
) -> WritingStyle | Keep | None:
    """``style`` checked as the optional style of a chapter; ``KEEP`` and ``None`` pass."""
    if isinstance(style, Keep) or style is None:
        return style
    return checked_style(style)

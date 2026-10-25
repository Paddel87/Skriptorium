"""Origin of a generated image, kept in a companion file next to it (step 9.6, ADR-095).

The companion ``<image>.herkunft.yml`` holds plain YAML, not a Markdown document, so the
search index (which reads every ``.md`` file) never sees it. Images without a companion
(uploaded, or generated before step 9.6) simply have no origin.
"""

from dataclasses import dataclass
from typing import Final

from skriptorium.storage.errors import InvalidInput
from skriptorium.storage.frontmatter import HeaderValue

ORIGIN_SUFFIX: Final = ".herkunft.yml"


@dataclass(frozen=True)
class ImageOrigin:
    """How an image was generated: model, prompt, aspect ratio, reported cost, date taken over."""

    model: str
    prompt: str
    aspect_ratio: str
    cost_usd: float | None
    date: str


def origin_to_mapping(origin: ImageOrigin) -> dict[str, HeaderValue]:
    """The fields as written to the companion file."""
    return {
        "modell": origin.model,
        "anweisung": origin.prompt,
        "seitenverhaeltnis": origin.aspect_ratio,
        "kosten_usd": origin.cost_usd,
        "datum": origin.date,
    }


def origin_from_mapping(mapping: dict[str, HeaderValue]) -> ImageOrigin:
    """Read the fields of a companion file.

    Raises:
        InvalidInput: A field is missing or has the wrong type.
    """
    model = mapping.get("modell")
    prompt = mapping.get("anweisung")
    aspect_ratio = mapping.get("seitenverhaeltnis")
    cost = mapping.get("kosten_usd")
    date = mapping.get("datum")
    if not (
        isinstance(model, str)
        and isinstance(prompt, str)
        and isinstance(aspect_ratio, str)
        and isinstance(date, str)
    ):
        raise InvalidInput("Herkunft des Bildes unvollständig")
    if cost is not None and (isinstance(cost, bool) or not isinstance(cost, int | float)):
        raise InvalidInput("Kosten in der Herkunft des Bildes keine Zahl")
    return ImageOrigin(model, prompt, aspect_ratio, None if cost is None else float(cost), date)

"""Endpoints for generating images with the AI (roadmap steps 7.12, 9.8, ADR-077, ADR-097).

Nothing is stored here: ``generate`` returns the image for a preview. Taking it over goes the
way of an uploaded image (the browser shrinks it, the canon or manuscript routes check and store
it), so every check of steps 7.6, 7.10 and 7.11 applies unchanged. The delivered image is checked
by its first bytes before it reaches the browser; SVG and anything else is refused. An image to
build on is named by where it is stored; the server reads it itself (ADR-097).
"""

import base64
from datetime import UTC, datetime
from typing import Annotated, Final, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from skriptorium.ai_gateway import (
    DEFAULT_IMAGE_MODEL,
    GatewayError,
    ImageOrder,
    ImageReference,
    ModelRefused,
    RateLimited,
    Usage,
)
from skriptorium.api.context import Services, ServicesDep, current_session
from skriptorium.canon import ImageOrigin
from skriptorium.storage import InvalidInput, inspect_image

router = APIRouter(prefix="/api/images", dependencies=[Depends(current_session)])

# What a provider may deliver; the browser shrinks it before it is stored.
_MAX_DELIVERED_BYTES: Final = 25 * 1024 * 1024
_MAX_DELIVERED_SIDE: Final = 8192
_MEDIA_TYPES: Final = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}

AspectRatio = Literal["2:3", "1:1", "3:2", "16:9", "9:16", "3:4", "4:3"]


class ImageModelOut(BaseModel):
    """One image model; ``references`` is how many images it takes as a basis (ADR-097)."""

    id: str
    name: str
    references: int


class ImageModelList(BaseModel):
    """The image models, the preset one, and whether the list could be loaded."""

    default: str
    models: list[ImageModelOut]
    available: bool
    # False if no key is set up; generating then answers 503.
    ready: bool


class ImagePriceOut(BaseModel):
    """The price of one image; ``unit`` is image, megapixel or token, ``None`` if unknown.

    ``input_cost_usd`` and ``input_unit`` price an image given as the basis, if the provider
    names it (ADR-097).
    """

    cost_usd: float | None
    unit: str | None
    input_cost_usd: float | None = None
    input_unit: str | None = None


_Id = Annotated[str, Field(min_length=1, max_length=200)]


class ReferenceIn(BaseModel):
    """A stored image as the basis: an image of an entry, a map or the cover of a story."""

    world: _Id
    entry: _Id | None = None
    image: _Id | None = None
    map_file: _Id | None = None
    story: _Id | None = None


class GenerateIn(BaseModel):
    """What to generate."""

    model: str
    prompt: Annotated[str, Field(min_length=1, max_length=4000)]
    aspect_ratio: AspectRatio = "1:1"
    # One stored image to build on (ADR-097).
    reference: ReferenceIn | None = None

    @field_validator("prompt")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Bildbeschreibung fehlt")
        return value.strip()


class GeneratedOut(BaseModel):
    """The generated image for the preview, base64-encoded, with the reported cost."""

    content: str
    media_type: str
    cost_usd: float | None
    model: str


class ImageOriginIn(BaseModel):
    """How a taken-over image was generated; sent along by the browser (step 9.6, ADR-095)."""

    model: Annotated[str, Field(min_length=1, max_length=200)]
    prompt: Annotated[str, Field(min_length=1, max_length=4000)]
    aspect_ratio: AspectRatio
    cost_usd: Annotated[float | None, Field(ge=0)] = None
    # A short description of the image it was made from, e.g. "Bild 1 von Kael" (ADR-097).
    basis: Annotated[str | None, Field(min_length=1, max_length=200)] = None


class ImageOriginOut(BaseModel):
    """The stored origin of an image, with the date it was taken over."""

    model: str
    prompt: str
    aspect_ratio: str
    cost_usd: float | None
    date: str
    basis: str | None


def origin_from(given: ImageOriginIn | None) -> ImageOrigin | None:
    """The origin to store, dated now; ``None`` for an uploaded image."""
    if given is None:
        return None
    now = datetime.now(UTC).isoformat(timespec="seconds")
    return ImageOrigin(
        given.model, given.prompt, given.aspect_ratio, given.cost_usd, now, given.basis
    )


def origin_out(origin: ImageOrigin | None) -> ImageOriginOut | None:
    """The stored origin for the browser; ``None`` if the image has none."""
    if origin is None:
        return None
    return ImageOriginOut(
        model=origin.model,
        prompt=origin.prompt,
        aspect_ratio=origin.aspect_ratio,
        cost_usd=origin.cost_usd,
        date=origin.date,
        basis=origin.basis,
    )


@router.get("/models")
async def list_image_models(found: ServicesDep) -> ImageModelList:
    """The image models of the catalog (step 7.12); ``default`` is the saved one (ADR-096)."""
    await found.image_catalog.refresh()
    return ImageModelList(
        default=found.favorites.preset("bilderzeugung", found.image_catalog, DEFAULT_IMAGE_MODEL),
        models=[
            ImageModelOut(id=m.id, name=m.name, references=m.references)
            for m in found.image_catalog.models()
        ],
        available=found.image_catalog.available,
        ready=found.images is not None,
    )


@router.get("/price")
async def image_price(model: str, found: ServicesDep) -> ImagePriceOut:
    """The price of one image of ``model`` at its first provider."""
    await found.image_catalog.refresh()
    if model not in found.image_catalog:
        raise InvalidInput(f"Unbekanntes Bildmodell: {model}")
    price = await found.image_catalog.price(model)
    given = await found.image_catalog.input_price(model)
    return ImagePriceOut(
        cost_usd=price.cost_usd if price else None,
        unit=price.unit if price else None,
        input_cost_usd=given.cost_usd if given else None,
        input_unit=given.unit if given else None,
    )


@router.post("/generate")
async def generate_image(body: GenerateIn, found: ServicesDep) -> GeneratedOut:
    """Generate one image for the preview; stores nothing (ADR-077)."""
    if found.images is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "KI-Anbieter nicht eingerichtet")
    await found.image_catalog.refresh()
    if body.model not in found.image_catalog:
        raise InvalidInput(f"Unbekanntes Bildmodell: {body.model}")
    reference = None
    if body.reference is not None:
        if found.image_catalog.references(body.model) < 1:
            raise InvalidInput("Dieses Bildmodell nimmt kein Ausgangsbild an")
        reference = ImageReference(*_basis(body.reference, found))
    order = ImageOrder(body.model, body.prompt, body.aspect_ratio, reference)
    try:
        image = await found.images.generate(order)
    except GatewayError as error:
        found.usage.record("bilderzeugung", body.model, None, _outcome(error))
        raise _http_error(error) from None
    found.usage.record("bilderzeugung", body.model, Usage(None, None, image.cost_usd), "ok")
    try:
        info = inspect_image(
            image.data, max_bytes=_MAX_DELIVERED_BYTES, max_side=_MAX_DELIVERED_SIDE
        )
    except InvalidInput:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, "Das Modell hat kein verwendbares Bild geliefert"
        ) from None
    return GeneratedOut(
        content=base64.b64encode(image.data).decode("ascii"),
        media_type=_MEDIA_TYPES[info.kind],
        cost_usd=image.cost_usd,
        model=body.model,
    )


def _basis(reference: ReferenceIn, found: Services) -> tuple[bytes, str]:
    """Bytes and media type of the stored image to build on.

    Raises:
        InvalidInput: Not exactly one of entry image, map or cover named.
        NotFound: World, entry, image, map, story or cover does not exist.
    """
    named = [
        reference.entry is not None or reference.image is not None,
        reference.map_file is not None,
        reference.story is not None,
    ]
    if sum(named) != 1:
        raise InvalidInput("Grundlage: genau ein Eintragsbild, eine Karte oder ein Titelbild")
    if reference.map_file is not None:
        return found.canon.world_map(reference.world, reference.map_file)
    if reference.story is not None:
        return found.manuscript.story_cover(reference.world, reference.story)
    if reference.entry is None or reference.image is None:
        raise InvalidInput("Grundlage: Eintrag und Bild angeben")
    return found.canon.entry_image(reference.world, reference.entry, reference.image)


def _outcome(error: GatewayError) -> str:
    if isinstance(error, ModelRefused):
        return "abgelehnt"
    if isinstance(error, RateLimited):
        return "zu_viele_anfragen"
    return "fehler"


def _http_error(error: GatewayError) -> HTTPException:
    """A refusal or failure as an answer the interface shows; it names no prompt."""
    if isinstance(error, ModelRefused):
        return HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Das Modell hat das Bild abgelehnt. Probier ein anderes Modell oder ändere die "
            "Beschreibung. Abgelehnte Bilder kosten nichts.",
        )
    if isinstance(error, RateLimited):
        return HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Der Anbieter meldet zu viele Anfragen. Bitte kurz warten.",
        )
    return HTTPException(
        status.HTTP_502_BAD_GATEWAY,
        f"{error}. Probier ein anderes Modell oder ändere die Beschreibung.",
    )

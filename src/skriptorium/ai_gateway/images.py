"""Generating images (roadmap steps 7.12, 9.8, ADR-077, ADR-097): the provider interface and the
catalog.

Image providers are a building block of their own, next to the text providers: an adapter
implements :class:`ImageProvider`, so further providers (V.24) are added without changing the
callers. The catalog reads OpenRouter's public list of image models (no key needed), keeps it for
an hour and leaves out vector models, whose SVG output may carry scripts.
"""

import logging
import re
import time
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from typing import Final, Protocol

import httpx

MODELS_URL: Final = "https://openrouter.ai/api/v1/images/models"
DEFAULT_IMAGE_MODEL: Final = "black-forest-labs/flux.2-pro"
_KEEP_SECONDS: Final = 3600.0
_RETRY_SECONDS: Final = 60.0
_TIMEOUT_SECONDS: Final = 10.0
# Identifiers as OpenRouter forms them; anything else is never put into an address.
_MODEL_ID: Final = re.compile(r"[a-z0-9._-]+/[a-z0-9._:-]+")

_log = logging.getLogger("skriptorium.ai_gateway")


@dataclass(frozen=True)
class ImageModel:
    """One model that generates images."""

    id: str
    name: str
    aspect_ratios: tuple[str, ...]
    # How many images it takes as a basis (``input_references``), 0 for none (ADR-097).
    references: int = 0


@dataclass(frozen=True)
class ImagePrice:
    """What one image costs at the model's first provider; ``unit`` is image, megapixel or token."""

    cost_usd: float
    unit: str


@dataclass(frozen=True)
class ImageEndpoint:
    """One provider of a model: its key for passthrough options, those options, its prices."""

    provider: str
    passthrough: frozenset[str]
    price: ImagePrice | None
    # What an image given as a basis costs, if the provider names it (ADR-097).
    input_price: ImagePrice | None = None


@dataclass(frozen=True)
class ImageReference:
    """An image given as the basis of a new one (ADR-097)."""

    data: bytes
    media_type: str

    def __repr__(self) -> str:
        """Representation without the image."""
        return f"ImageReference(media_type={self.media_type!r}, bytes={len(self.data)})"


@dataclass(frozen=True)
class ImageOrder:
    """What the caller asks for: model, prompt, aspect ratio such as ``2:3`` and, optionally,
    one image as the basis."""

    model: str
    prompt: str
    aspect_ratio: str
    reference: ImageReference | None = None


@dataclass(frozen=True)
class GeneratedImage:
    """The image as the provider delivered it, with its media type and the reported cost."""

    data: bytes
    media_type: str
    cost_usd: float | None


class ImageProvider(Protocol):
    """An adapter that generates one image per order."""

    name: str

    async def generate(self, order: ImageOrder) -> GeneratedImage:
        """Generate an image.

        Raises:
            GatewayError: One of its kinds (refused, rate limited, invalid, unavailable).
        """
        ...

    async def aclose(self) -> None:
        """Release the connection."""
        ...


class ImageCatalog:
    """Image models of OpenRouter, with their providers loaded on demand."""

    def __init__(
        self,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        """``transport`` replaces the network and ``clock`` the time in tests."""
        self._transport = transport
        self._clock = clock
        self._models: dict[str, ImageModel] = {}
        self._endpoints: dict[str, tuple[float, tuple[ImageEndpoint, ...]]] = {}
        self._loaded_at: float | None = None
        self._next_attempt = 0.0

    @property
    def available(self) -> bool:
        """Whether the list was loaded at least once."""
        return self._loaded_at is not None

    def models(self) -> list[ImageModel]:
        """The image models, sorted by name; empty before the first load."""
        return sorted(self._models.values(), key=lambda m: (m.name.casefold(), m.id))

    def __contains__(self, model: object) -> bool:
        """Whether ``model`` can be chosen."""
        return model in self._models

    def references(self, model: str) -> int:
        """How many images ``model`` takes as a basis; 0 if none or unknown."""
        found = self._models.get(model)
        return 0 if found is None else found.references

    async def refresh(self) -> None:
        """Load the list unless it is younger than an hour; a failure keeps the old state."""
        now = self._clock()
        fresh = self._loaded_at is not None and now - self._loaded_at < _KEEP_SECONDS
        if fresh or now < self._next_attempt:
            return
        try:
            body = await self._get(MODELS_URL)
            models = _models(body)
        except (httpx.HTTPError, ValueError) as error:
            self._next_attempt = now + _RETRY_SECONDS
            _log.warning("bildmodell-katalog nicht geladen fehler=%s", type(error).__name__)
            return
        self._models = models
        self._loaded_at = now
        _log.info("bildmodell-katalog geladen modelle=%d", len(models))

    async def endpoints(self, model: str) -> tuple[ImageEndpoint, ...]:
        """The providers of ``model``, kept for an hour; empty if they cannot be loaded."""
        now = self._clock()
        kept = self._endpoints.get(model)
        if kept is not None and now - kept[0] < _KEEP_SECONDS:
            return kept[1]
        if model not in self._models:
            return ()
        try:
            body = await self._get(f"{MODELS_URL}/{model}/endpoints")
            found = _endpoints(body)
        except (httpx.HTTPError, ValueError) as error:
            _log.warning("bildmodell-anbieter nicht geladen fehler=%s", type(error).__name__)
            return ()
        self._endpoints[model] = (now, found)
        return found

    async def price(self, model: str) -> ImagePrice | None:
        """The price of the model's first provider that names one."""
        return next((e.price for e in await self.endpoints(model) if e.price), None)

    async def input_price(self, model: str) -> ImagePrice | None:
        """What an image given as a basis costs at the first provider that names it."""
        return next((e.input_price for e in await self.endpoints(model) if e.input_price), None)

    async def _get(self, url: str) -> object:
        async with httpx.AsyncClient(transport=self._transport, timeout=_TIMEOUT_SECONDS) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()


def _models(body: object) -> dict[str, ImageModel]:
    data = body.get("data") if isinstance(body, dict) else None
    if not isinstance(data, list):
        raise ValueError("Bildmodelle ohne Liste 'data'")
    found: dict[str, ImageModel] = {}
    for item in data:
        model = _model(item) if isinstance(item, dict) else None
        if model is not None:
            found[model.id] = model
    return found


def _model(item: Mapping[str, object]) -> ImageModel | None:
    """One image model; ``None`` without identifier or if it can deliver vector graphics."""
    model_id = item.get("id")
    if not isinstance(model_id, str) or not _MODEL_ID.fullmatch(model_id):
        return None
    parameters = _mapping(item.get("supported_parameters"))
    formats = _values(parameters.get("output_format"))
    if "vector" in model_id or "svg" in formats:
        return None
    name = item.get("name")
    most = _mapping(parameters.get("input_references")).get("max")
    return ImageModel(
        id=model_id,
        name=name if isinstance(name, str) and name else model_id,
        aspect_ratios=tuple(_values(parameters.get("aspect_ratio"))),
        references=most if isinstance(most, int) and not isinstance(most, bool) and most > 0 else 0,
    )


def _endpoints(body: object) -> tuple[ImageEndpoint, ...]:
    raw = body.get("endpoints") if isinstance(body, dict) else None
    if not isinstance(raw, list):
        raise ValueError("Anbieter ohne Liste 'endpoints'")
    found: list[ImageEndpoint] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        provider = item.get("provider_slug")
        if not isinstance(provider, str) or not provider:
            continue
        passthrough = item.get("allowed_passthrough_parameters")
        keys = (
            frozenset(k for k in passthrough if isinstance(k, str))
            if isinstance(passthrough, list)
            else frozenset()
        )
        pricing = item.get("pricing")
        found.append(
            ImageEndpoint(provider, keys, _price(pricing), _price(pricing, billable="input_image"))
        )
    return tuple(found)


def _price(value: object, billable: str = "output_image") -> ImagePrice | None:
    """The base price of ``billable``: its first entry without a variant, else its first entry.

    Entries without ``billable`` count as the output image (the form before 9.8).
    """
    if not isinstance(value, list):
        return None
    entries = [
        e for e in value if isinstance(e, dict) and e.get("billable", "output_image") == billable
    ]
    plain = [e for e in entries if not e.get("variant")]
    for entry in plain + entries:
        cost, unit = entry.get("cost_usd"), entry.get("unit")
        if isinstance(cost, int | float) and cost >= 0 and isinstance(unit, str):
            return ImagePrice(float(cost), unit)
    return None


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, dict) else {}


def _values(value: object) -> list[str]:
    """The allowed values of an enum parameter."""
    values = _mapping(value).get("values")
    return [v for v in values if isinstance(v, str)] if isinstance(values, list) else []

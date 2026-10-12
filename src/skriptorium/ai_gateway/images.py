"""Generating images (roadmap step 7.12, ADR-077): the provider interface and the catalog.

Image providers are a building block of their own, next to the text providers: an adapter
implements :class:`ImageProvider`, so further providers (V.24) are added without changing the
callers. The catalog reads OpenRouter's public list of image models (no key needed), keeps it for
an hour and leaves out vector models, whose SVG output may carry scripts.
"""

import logging
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

_log = logging.getLogger("skriptorium.ai_gateway")


@dataclass(frozen=True)
class ImageModel:
    """One model that generates images."""

    id: str
    name: str
    aspect_ratios: tuple[str, ...]


@dataclass(frozen=True)
class ImagePrice:
    """What one image costs at the model's first provider; ``unit`` is image, megapixel or token."""

    cost_usd: float
    unit: str


@dataclass(frozen=True)
class ImageEndpoint:
    """One provider of a model: its key for passthrough options, those options, its price."""

    provider: str
    passthrough: frozenset[str]
    price: ImagePrice | None


@dataclass(frozen=True)
class ImageOrder:
    """What the caller asks for: model, prompt and aspect ratio such as ``2:3``."""

    model: str
    prompt: str
    aspect_ratio: str


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
    if not isinstance(model_id, str) or "/" not in model_id:
        return None
    parameters = _mapping(item.get("supported_parameters"))
    formats = _values(parameters.get("output_format"))
    if "vector" in model_id or "svg" in formats:
        return None
    name = item.get("name")
    return ImageModel(
        id=model_id,
        name=name if isinstance(name, str) and name else model_id,
        aspect_ratios=tuple(_values(parameters.get("aspect_ratio"))),
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
        found.append(ImageEndpoint(provider, keys, _price(item.get("pricing"))))
    return tuple(found)


def _price(value: object) -> ImagePrice | None:
    """The base price: the first entry without a variant, else the first entry."""
    if not isinstance(value, list):
        return None
    entries = [e for e in value if isinstance(e, dict)]
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

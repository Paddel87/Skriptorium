"""Adapter for generating images through OpenRouter (roadmap step 7.12, ADR-077).

``POST /api/v1/images`` answers with the image as base64, its media type and the cost; billing is
all or nothing, a failed image costs nothing. The filter settings are fixed here, not
configurable (ADR-077): FLUX ``safety_tolerance`` 5 (FLUX.3 at most 4), GPT Image
``moderation: low``. They go to each provider of the model that accepts them, keyed by its slug.
"""

import base64
import binascii
import logging
import os
import time
from collections.abc import Mapping
from typing import Final

import httpx

from skriptorium.ai_gateway.errors import ProviderUnavailable
from skriptorium.ai_gateway.images import GeneratedImage, ImageCatalog, ImageEndpoint, ImageOrder
from skriptorium.ai_gateway.openrouter import KEY_VARIABLE, check_status

_URL: Final = "https://openrouter.ai/api/v1/images"
_CONNECT_TIMEOUT_SECONDS: Final = 10.0
# Image models take from seconds to a few minutes.
_READ_TIMEOUT_SECONDS: Final = 180.0
# Bounds of the prompt the adapter sends.
MAX_PROMPT_CHARS: Final = 4000
# Fixed filter settings (ADR-077); the owner plans no pornographic content.
SAFETY_TOLERANCE: Final = 5
SAFETY_TOLERANCE_FLUX_3: Final = 4
MODERATION: Final = "low"

_log = logging.getLogger("skriptorium.ai_gateway")


class OpenRouterImageProvider:
    """Generates images through OpenRouter; one client is created at start and reused."""

    name: str = "openrouter"

    def __init__(
        self,
        api_key: str,
        catalog: ImageCatalog,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        """Create the adapter; ``transport`` replaces the network in tests."""
        if not api_key:
            raise ProviderUnavailable(f"{KEY_VARIABLE} ist nicht gesetzt")
        self._headers = {"Authorization": f"Bearer {api_key}", "X-Title": "Skriptorium"}
        self._catalog = catalog
        self._client = httpx.AsyncClient(
            transport=transport,
            timeout=httpx.Timeout(
                connect=_CONNECT_TIMEOUT_SECONDS,
                read=_READ_TIMEOUT_SECONDS,
                write=_CONNECT_TIMEOUT_SECONDS,
                pool=_CONNECT_TIMEOUT_SECONDS,
            ),
        )

    @classmethod
    def from_environment(
        cls,
        catalog: ImageCatalog,
        environ: Mapping[str, str] = os.environ,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> OpenRouterImageProvider:
        """Create the adapter with the key from ``OPENROUTER_API_KEY``.

        Raises:
            ProviderUnavailable: The variable is missing or empty.
        """
        return cls(environ.get(KEY_VARIABLE, ""), catalog, transport=transport)

    def __repr__(self) -> str:
        """Representation without the key."""
        return "OpenRouterImageProvider()"

    async def aclose(self) -> None:
        """Close the reused client."""
        await self._client.aclose()

    async def generate(self, order: ImageOrder) -> GeneratedImage:
        """Generate one image; see :class:`ImageProvider`."""
        start = time.monotonic()
        result = "erfolg"
        cost: float | None = None
        try:
            payload = _payload(order, await self._catalog.endpoints(order.model))
            failure: str | None = None
            try:
                response = await self._client.post(_URL, json=payload, headers=self._headers)
            except httpx.HTTPError as exc:
                failure = type(exc).__name__
            if failure is not None:
                # Raised outside the except clause: the httpx error carries the request with its
                # authorization header and must not stay reachable via __context__.
                raise ProviderUnavailable(f"Verbindung fehlgeschlagen ({failure})")
            if response.status_code == httpx.codes.BAD_GATEWAY:
                # OpenRouter's answer when a generation did not complete; nothing is billed.
                raise ProviderUnavailable(
                    "Das Bild wurde nicht fertig erzeugt (HTTP 502), oft wegen des "
                    "Inhaltsfilters des Modells"
                )
            check_status(response.status_code)
            image = _image(response)
            cost = image.cost_usd
            return image
        except Exception as error:
            result = type(error).__name__
            raise
        finally:
            _log.info(
                "bild_anfrage anbieter=openrouter modell=%s ergebnis=%s kosten_usd=%s dauer_ms=%d",
                "".join(c if c.isalnum() or c in "._/:-" else "_" for c in order.model),
                result,
                "-" if cost is None else cost,
                int((time.monotonic() - start) * 1000),
            )


def filter_options(model: str, endpoint: ImageEndpoint) -> dict[str, object]:
    """The fixed filter settings this provider of ``model`` accepts (ADR-077)."""
    options: dict[str, object] = {}
    if "safety_tolerance" in endpoint.passthrough:
        options["safety_tolerance"] = (
            SAFETY_TOLERANCE_FLUX_3 if "flux-3" in model else SAFETY_TOLERANCE
        )
    if "moderation" in endpoint.passthrough:
        options["moderation"] = MODERATION
    return options


def _payload(order: ImageOrder, endpoints: tuple[ImageEndpoint, ...]) -> dict[str, object]:
    payload: dict[str, object] = {
        "model": order.model,
        "prompt": order.prompt[:MAX_PROMPT_CHARS],
        "aspect_ratio": order.aspect_ratio,
        "n": 1,
    }
    options = {
        endpoint.provider: chosen
        for endpoint in endpoints
        if (chosen := filter_options(order.model, endpoint))
    }
    if options:
        payload["provider"] = {"options": options}
    return payload


def _image(response: httpx.Response) -> GeneratedImage:
    """The first image of the answer.

    Raises:
        ProviderUnavailable: The answer holds no readable image.
    """
    try:
        body = response.json()
    except ValueError:
        raise ProviderUnavailable("Antwort des Anbieters nicht lesbar") from None
    data = body.get("data") if isinstance(body, dict) else None
    first = data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else None
    encoded = first.get("b64_json") if first else None
    if not isinstance(encoded, str):
        raise ProviderUnavailable("Der Anbieter hat kein Bild geliefert")
    try:
        image = base64.b64decode(encoded, validate=True)
    except binascii.Error, ValueError:
        raise ProviderUnavailable("Bild des Anbieters nicht lesbar") from None
    media_type = first.get("media_type") if first else None
    usage = body.get("usage") if isinstance(body, dict) else None
    cost = usage.get("cost") if isinstance(usage, dict) else None
    return GeneratedImage(
        data=image,
        media_type=media_type if isinstance(media_type, str) else "",
        cost_usd=float(cost) if isinstance(cost, int | float) else None,
    )

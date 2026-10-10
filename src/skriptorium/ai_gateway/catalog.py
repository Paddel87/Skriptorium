"""The model catalog of OpenRouter (roadmap step 5.12, ADR-055).

Reads the public list ``https://openrouter.ai/api/v1/models`` (no key needed), keeps the models
with text output and holds them for an hour. If the list cannot be loaded, the fixed model order
:data:`DEFAULT_MODELS` stays usable. The catalog is a mapping of model identifiers to
:class:`ModelConfig` and can stand in wherever a model order is expected: proven settings from
:data:`DEFAULT_MODELS` come first, other models get their reasoning setting from the catalog
(mandatory reasoning → lowest offered effort, otherwise off).
"""

import logging
import time
from collections.abc import Callable, Iterator, Mapping
from dataclasses import dataclass
from types import MappingProxyType
from typing import Final

import httpx

from skriptorium.ai_gateway.models import DEFAULT_MODELS, ModelConfig

URL: Final = "https://openrouter.ai/api/v1/models"
# Size of one proposal for the cost estimate: the context budget in, a medium proposal out.
ESTIMATE_INPUT_TOKENS: Final = 30_000
ESTIMATE_OUTPUT_TOKENS: Final = 500
_KEEP_SECONDS: Final = 3600.0
# After a failed load the next attempt waits this long, so a missing network does not slow
# every request down.
_RETRY_SECONDS: Final = 60.0
_TIMEOUT_SECONDS: Final = 10.0
# Models whose long reasoning was measured (ADR-052); others with mandatory reasoning only
# "think first" without a measurement.
SLOW_MODELS: Final = frozenset({"x-ai/grok-4.7"})
# Models checked for canon fidelity and refusals with the owner's stories (steps 5.7, 5.26).
CHECKED_MODELS: Final = frozenset({"x-ai/grok-4.6", "qwen/qwen3.8-max-0902"})

_log = logging.getLogger("skriptorium.ai_gateway")


@dataclass(frozen=True)
class CatalogModel:
    """One model of the catalog; prices in US dollars per million tokens, ``None`` if unknown."""

    id: str
    name: str
    provider: str
    input_price: float | None
    output_price: float | None
    context_length: int | None
    moderated: bool
    reasoning_mandatory: bool
    lowest_effort: str | None

    @property
    def estimated_cost(self) -> float | None:
        """Estimated cost of one proposal in US dollars (30,000 tokens in, 500 out)."""
        if self.input_price is None or self.output_price is None:
            return None
        return (
            ESTIMATE_INPUT_TOKENS * self.input_price + ESTIMATE_OUTPUT_TOKENS * self.output_price
        ) / 1_000_000

    @property
    def config(self) -> ModelConfig:
        """Reasoning setting derived from the catalog."""
        if not self.reasoning_mandatory:
            return ModelConfig()
        if self.lowest_effort is None:
            return ModelConfig(reasoning=MappingProxyType({"enabled": True}))
        return ModelConfig(reasoning=MappingProxyType({"effort": self.lowest_effort}))


class ModelCatalog(Mapping[str, ModelConfig]):
    """Selectable models: the fixed model order plus, once loaded, the catalog of OpenRouter."""

    def __init__(
        self,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
        clock: Callable[[], float] = time.monotonic,
        known: Mapping[str, ModelConfig] = DEFAULT_MODELS,
    ) -> None:
        """``transport`` replaces the network and ``clock`` the time in tests."""
        self._transport = transport
        self._clock = clock
        self._known = known
        self._models: dict[str, CatalogModel] = {}
        self._loaded_at: float | None = None
        self._next_attempt = 0.0

    @property
    def available(self) -> bool:
        """Whether the catalog of OpenRouter was loaded at least once."""
        return self._loaded_at is not None

    def models(self) -> list[CatalogModel]:
        """The loaded catalog models, sorted by identifier; empty before the first load."""
        return [self._models[key] for key in sorted(self._models)]

    async def refresh(self) -> None:
        """Load the catalog unless it is younger than an hour or a failed load was just now.

        A failure is logged and keeps the previous state; it never raises.
        """
        now = self._clock()
        fresh = self._loaded_at is not None and now - self._loaded_at < _KEEP_SECONDS
        if fresh or now < self._next_attempt:
            return
        try:
            async with httpx.AsyncClient(
                transport=self._transport, timeout=_TIMEOUT_SECONDS
            ) as client:
                response = await client.get(URL)
                response.raise_for_status()
                models = _parse(response.json())
        except (httpx.HTTPError, ValueError) as error:
            self._next_attempt = now + _RETRY_SECONDS
            _log.warning("modell-katalog nicht geladen fehler=%s", type(error).__name__)
            return
        self._models = models
        self._loaded_at = now
        _log.info("modell-katalog geladen modelle=%d", len(models))

    def __getitem__(self, model: str) -> ModelConfig:
        """Proven setting from the fixed order, otherwise the one derived from the catalog."""
        if model in self._known:
            return self._known[model]
        return self._models[model].config

    def __iter__(self) -> Iterator[str]:
        """The fixed order first, then the catalog models not in it."""
        yield from self._known
        yield from (key for key in sorted(self._models) if key not in self._known)

    def __len__(self) -> int:
        """Number of selectable models."""
        return len(self._known) + sum(1 for key in self._models if key not in self._known)

    def __contains__(self, model: object) -> bool:
        """Whether ``model`` can be selected."""
        return model in self._known or model in self._models


def _parse(body: object) -> dict[str, CatalogModel]:
    """The models with text output from the body of ``/api/v1/models``.

    Raises:
        ValueError: The body has no list ``data``.
    """
    data = body.get("data") if isinstance(body, dict) else None
    if not isinstance(data, list):
        raise ValueError("Katalog ohne Liste 'data'")
    found: dict[str, CatalogModel] = {}
    for item in data:
        model = _model(item) if isinstance(item, dict) else None
        if model is not None:
            found[model.id] = model
    return found


def _model(item: dict[str, object]) -> CatalogModel | None:
    """One catalog model; ``None`` without identifier or without text output."""
    model_id = item.get("id")
    architecture = _mapping(item.get("architecture"))
    if not isinstance(model_id, str) or "/" not in model_id:
        return None
    if architecture.get("output_modalities") != ["text"]:
        return None
    pricing = _mapping(item.get("pricing"))
    top = _mapping(item.get("top_provider"))
    reasoning = _mapping(item.get("reasoning"))
    efforts = [
        effort
        for effort in _list(reasoning.get("supported_efforts"))
        if isinstance(effort, str) and effort != "none"
    ]
    name = item.get("name")
    context = item.get("context_length")
    return CatalogModel(
        id=model_id,
        name=name if isinstance(name, str) and name else model_id,
        provider=model_id.split("/", 1)[0],
        input_price=_price(pricing.get("prompt")),
        output_price=_price(pricing.get("completion")),
        context_length=context if isinstance(context, int) and context > 0 else None,
        moderated=top.get("is_moderated") is True,
        reasoning_mandatory=reasoning.get("mandatory") is True,
        # OpenRouter lists the efforts from highest to lowest.
        lowest_effort=efforts[-1] if efforts else None,
    )


def _price(value: object) -> float | None:
    """Price per token as text → US dollars per million tokens; negative means unknown."""
    try:
        per_token = float(value) if isinstance(value, str | int | float) else -1.0
    except ValueError:
        return None
    return round(per_token * 1_000_000, 6) if per_token >= 0 else None


def _mapping(value: object) -> Mapping[str, object]:
    return value if isinstance(value, dict) else {}


def _list(value: object) -> list[object]:
    return value if isinstance(value, list) else []

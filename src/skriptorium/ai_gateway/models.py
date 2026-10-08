"""Per-model configuration: reasoning setting and excluded executing providers.

Values from roadmap step 1.1/1.5 (``spikes/modell-eignungstest``): the models grok-4.6, grok-4.7
and qwen3.8-max (ADR-010, ADR-011) require reasoning, so they run at the lowest effort. The order
is the model order: grok-4.6 is preset because grok-4.7 refuses the owner's real stories, grok-4.7
stays selectable, qwen3.8-max is the emergency reserve (step 5.7, ADR-044). Models not listed
here run with reasoning switched off, as in the suitability test.
"""

from collections.abc import Mapping
from dataclasses import dataclass, field
from types import MappingProxyType
from typing import Final


@dataclass(frozen=True)
class ModelConfig:
    """Settings the caller does not choose."""

    reasoning: Mapping[str, object] = field(
        default_factory=lambda: MappingProxyType({"enabled": False})
    )
    # Executing providers to avoid, e.g. those training on inputs (StreamLake for deepseek models,
    # docs/research/modell-eignungstest.md); empty for the current model order.
    ignored_providers: tuple[str, ...] = ()


_LOWEST_REASONING: Final = MappingProxyType({"effort": "low"})

DEFAULT_MODELS: Final[Mapping[str, ModelConfig]] = MappingProxyType(
    {
        "x-ai/grok-4.6": ModelConfig(reasoning=_LOWEST_REASONING),
        "x-ai/grok-4.7": ModelConfig(reasoning=_LOWEST_REASONING),
        "qwen/qwen3.8-max-0902": ModelConfig(reasoning=_LOWEST_REASONING),
    }
)


def config_for(model: str, models: Mapping[str, ModelConfig] = DEFAULT_MODELS) -> ModelConfig:
    """Configuration of ``model``; unknown models get the default (reasoning off)."""
    return models.get(model, ModelConfig())

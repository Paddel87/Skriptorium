"""Common interface to AI providers (module ``ai_gateway``).

Knows messages, models and tokens - no worlds, canon or stories.
"""

from skriptorium.ai_gateway.errors import (
    GatewayError,
    InvalidRequest,
    ModelRefused,
    ProviderUnavailable,
    RateLimited,
)
from skriptorium.ai_gateway.models import DEFAULT_MODELS, ModelConfig, config_for
from skriptorium.ai_gateway.openrouter import KEY_VARIABLE, OpenRouterProvider
from skriptorium.ai_gateway.provider import (
    Completed,
    CompletionRequest,
    Message,
    ModelProvider,
    StreamEvent,
    TextChunk,
    Usage,
)

__all__ = [
    "DEFAULT_MODELS",
    "KEY_VARIABLE",
    "Completed",
    "CompletionRequest",
    "GatewayError",
    "InvalidRequest",
    "Message",
    "ModelConfig",
    "ModelProvider",
    "ModelRefused",
    "OpenRouterProvider",
    "ProviderUnavailable",
    "RateLimited",
    "StreamEvent",
    "TextChunk",
    "Usage",
    "config_for",
]

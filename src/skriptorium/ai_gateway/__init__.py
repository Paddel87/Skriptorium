"""Common interface to AI providers (module ``ai_gateway``).

Knows messages, models and tokens - no worlds, canon or stories.
"""

from skriptorium.ai_gateway.catalog import CatalogModel, ModelCatalog
from skriptorium.ai_gateway.errors import (
    GatewayError,
    InvalidRequest,
    ModelRefused,
    ProviderUnavailable,
    RateLimited,
)
from skriptorium.ai_gateway.images import (
    DEFAULT_IMAGE_MODEL,
    GeneratedImage,
    ImageCatalog,
    ImageModel,
    ImageOrder,
    ImagePrice,
    ImageProvider,
)
from skriptorium.ai_gateway.models import DEFAULT_MODELS, ModelConfig, config_for
from skriptorium.ai_gateway.openrouter import KEY_VARIABLE, OpenRouterProvider
from skriptorium.ai_gateway.openrouter_images import OpenRouterImageProvider
from skriptorium.ai_gateway.provider import (
    Completed,
    CompletionRequest,
    ImagePart,
    Message,
    ModelProvider,
    Source,
    StreamEvent,
    TextChunk,
    Usage,
)

__all__ = [
    "DEFAULT_IMAGE_MODEL",
    "DEFAULT_MODELS",
    "KEY_VARIABLE",
    "CatalogModel",
    "Completed",
    "CompletionRequest",
    "GatewayError",
    "GeneratedImage",
    "ImageCatalog",
    "ImageModel",
    "ImageOrder",
    "ImagePart",
    "ImagePrice",
    "ImageProvider",
    "InvalidRequest",
    "Message",
    "ModelCatalog",
    "ModelConfig",
    "ModelProvider",
    "ModelRefused",
    "OpenRouterImageProvider",
    "OpenRouterProvider",
    "ProviderUnavailable",
    "RateLimited",
    "Source",
    "StreamEvent",
    "TextChunk",
    "Usage",
    "config_for",
]

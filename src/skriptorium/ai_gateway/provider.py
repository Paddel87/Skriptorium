"""The provider interface ``ModelProvider`` and its data types (docs/architecture.md section 4).

Every provider is an adapter implementing :class:`ModelProvider`; further providers are added
as new adapters without changing existing ones (FR-025).
"""

from collections.abc import AsyncIterator, Sequence
from dataclasses import dataclass
from typing import Literal, Protocol

Role = Literal["system", "user", "assistant"]


@dataclass(frozen=True)
class Message:
    """One message of a request."""

    role: Role
    content: str


@dataclass(frozen=True)
class CompletionRequest:
    """What the caller decides; reasoning and exclusions come from the model configuration."""

    model: str
    messages: Sequence[Message]
    max_tokens: int
    temperature: float


@dataclass(frozen=True)
class Usage:
    """Consumption of one request as reported by the provider."""

    input_tokens: int | None
    output_tokens: int | None
    cost_usd: float | None


@dataclass(frozen=True)
class TextChunk:
    """A piece of generated text, forwarded as it arrives."""

    text: str


@dataclass(frozen=True)
class Completed:
    """Last event of a successful stream."""

    usage: Usage
    finish_reason: str | None


StreamEvent = TextChunk | Completed


class ModelProvider(Protocol):
    """One AI provider behind a common interface."""

    name: str

    def stream(self, request: CompletionRequest) -> AsyncIterator[StreamEvent]:
        """Stream the answer: zero or more :class:`TextChunk`, then exactly one :class:`Completed`.

        Raises:
            ProviderUnavailable: Network, timeout, HTTP 5xx, stream error without filter reference.
            ModelRefused: Content filter of the model or provider.
            RateLimited: HTTP 429, also after one retry.
            InvalidRequest: HTTP 400 and similar rejections of the request itself.
        """
        ...

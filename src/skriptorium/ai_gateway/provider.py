"""The provider interface ``ModelProvider`` and its data types (docs/architecture.md section 4).

Every provider is an adapter implementing :class:`ModelProvider`; further providers are added
as new adapters without changing existing ones (FR-025).
"""

from collections.abc import AsyncIterator, Sequence
from dataclasses import dataclass
from typing import Literal, Protocol

Role = Literal["system", "user", "assistant"]


@dataclass(frozen=True)
class ImagePart:
    """An image sent with a message (step 7.13, ADR-074): its media type and bytes."""

    media_type: str
    data: bytes


@dataclass(frozen=True)
class Message:
    """One message of a request; ``images`` only where a flow asks for it (ADR-074)."""

    role: Role
    content: str
    images: tuple[ImagePart, ...] = ()


@dataclass(frozen=True)
class CompletionRequest:
    """What the caller decides; reasoning and exclusions come from the model configuration."""

    model: str
    messages: Sequence[Message]
    max_tokens: int
    temperature: float
    # Let the provider search the web for this request (step 6.7, ADR-064).
    web_search: bool = False


@dataclass(frozen=True)
class Source:
    """A web page the provider's search used for the answer (step 6.7)."""

    url: str
    title: str


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
    # Web pages behind the answer, if the request searched the web (step 6.7).
    sources: tuple[Source, ...] = ()


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

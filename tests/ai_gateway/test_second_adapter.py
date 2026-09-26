"""FR-025: a further provider is a new adapter; OpenRouter code and callers stay unchanged."""

import asyncio
from collections.abc import AsyncIterator

from skriptorium.ai_gateway import (
    Completed,
    CompletionRequest,
    Message,
    ModelProvider,
    OpenRouterProvider,
    StreamEvent,
    TextChunk,
    Usage,
)


class EchoProvider:
    """Test adapter for a second provider, written only against the ``ModelProvider`` contract."""

    name: str = "echo"

    async def stream(self, request: CompletionRequest) -> AsyncIterator[StreamEvent]:
        last = request.messages[-1].content
        for word in last.split():
            yield TextChunk(word + " ")
        yield Completed(Usage(input_tokens=len(last), output_tokens=None, cost_usd=0.0), "stop")


async def write_with(provider: ModelProvider, request: CompletionRequest) -> str:
    """A caller that only knows the contract, like the writing functions of ``api``."""
    text = ""
    async for event in provider.stream(request):
        if isinstance(event, TextChunk):
            text += event.text
    return text


def test_second_provider_works_through_the_same_contract() -> None:
    providers: list[ModelProvider] = [EchoProvider()]
    request = CompletionRequest(
        model="echo-1", messages=[Message("user", "Der Wind drehte")], max_tokens=10, temperature=0
    )

    text = asyncio.run(write_with(providers[0], request))

    assert text == "Der Wind drehte "


def test_openrouter_satisfies_the_same_contract() -> None:
    adapter: ModelProvider = OpenRouterProvider("key")

    assert adapter.name == "openrouter"
    asyncio.run(OpenRouterProvider("key").aclose())

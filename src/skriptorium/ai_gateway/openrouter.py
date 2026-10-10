"""OpenRouter as first adapter of :class:`ModelProvider` (roadmap step 3.1).

Streaming over the OpenAI-compatible chat interface with Server-Sent Events. Timeouts and the
retry rule follow the ``ModelProvider`` contract (docs/architecture.md section 4). Every request
writes exactly one log line with metadata only (ADR-021) - never message text, response text
or the key.
"""

import asyncio
import json
import logging
import os
import re
import time
from collections.abc import AsyncIterator, Awaitable, Callable, Mapping
from dataclasses import dataclass
from typing import Final

import httpx

from skriptorium.ai_gateway.errors import (
    InvalidRequest,
    ModelRefused,
    ProviderUnavailable,
    RateLimited,
)
from skriptorium.ai_gateway.models import DEFAULT_MODELS, ModelConfig, config_for
from skriptorium.ai_gateway.provider import (
    Completed,
    CompletionRequest,
    StreamEvent,
    TextChunk,
    Usage,
)

KEY_VARIABLE: Final = "OPENROUTER_API_KEY"

_URL: Final = "https://openrouter.ai/api/v1/chat/completions"
_CONNECT_TIMEOUT_SECONDS: Final = 10.0
_FIRST_CHUNK_TIMEOUT_SECONDS: Final = 90.0
_CHUNK_TIMEOUT_SECONDS: Final = 30.0
_DEFAULT_RETRY_AFTER_SECONDS: Final = 5.0
_MAX_RETRY_AFTER_SECONDS: Final = 60.0
# Longest accepted line of the event stream; guards memory against a broken provider (review 3.1).
MAX_LINE_CHARS: Final = 1_000_000
# Characters kept in model and provider names of the log line; others become "_" (review 3.1).
_LOG_NAME: Final = re.compile(r"[^A-Za-z0-9._/:@+-]")
_FILTER_HINTS: Final = ("moderation", "content_filter", "content filter", "flagged", "policy")

_log = logging.getLogger("skriptorium.ai_gateway")

Sleep = Callable[[float], Awaitable[None]]


@dataclass
class _Outcome:
    """What the log line of one request reports."""

    result: str = "erfolg"
    upstream: str | None = None
    usage: Usage | None = None
    first_chunk_ms: int | None = None


class OpenRouterProvider:
    """Adapter for OpenRouter; one client is created at start and reused."""

    name: str = "openrouter"

    def __init__(
        self,
        api_key: str,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
        models: Mapping[str, ModelConfig] = DEFAULT_MODELS,
        sleep: Sleep = asyncio.sleep,
        first_chunk_timeout: float = _FIRST_CHUNK_TIMEOUT_SECONDS,
        chunk_timeout: float = _CHUNK_TIMEOUT_SECONDS,
    ) -> None:
        """Create the adapter; ``transport`` and ``sleep`` replace network and waiting in tests."""
        if not api_key:
            raise ProviderUnavailable(f"{KEY_VARIABLE} ist nicht gesetzt")
        self._headers = {"Authorization": f"Bearer {api_key}", "X-Title": "Skriptorium"}
        self._models = models
        self._sleep = sleep
        self._first_chunk_timeout = first_chunk_timeout
        self._chunk_timeout = chunk_timeout
        self._client = httpx.AsyncClient(
            transport=transport,
            timeout=httpx.Timeout(
                connect=_CONNECT_TIMEOUT_SECONDS,
                read=first_chunk_timeout,
                write=_CONNECT_TIMEOUT_SECONDS,
                pool=_CONNECT_TIMEOUT_SECONDS,
            ),
        )

    @classmethod
    def from_environment(
        cls,
        environ: Mapping[str, str] = os.environ,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
        models: Mapping[str, ModelConfig] = DEFAULT_MODELS,
    ) -> OpenRouterProvider:
        """Create the adapter with the key from ``OPENROUTER_API_KEY`` (only source of the key).

        Raises:
            ProviderUnavailable: The variable is missing or empty.
        """
        return cls(environ.get(KEY_VARIABLE, ""), transport=transport, models=models)

    def __repr__(self) -> str:
        """Representation without the key."""
        return "OpenRouterProvider()"

    async def aclose(self) -> None:
        """Close the reused client."""
        await self._client.aclose()

    async def stream(self, request: CompletionRequest) -> AsyncIterator[StreamEvent]:
        """Stream the answer of ``request``; see :class:`ModelProvider`."""
        outcome = _Outcome()
        start = time.monotonic()
        try:
            async for event in self._attempts(request, outcome, start):
                yield event
        except RateLimited:
            outcome.result = "zu_viele_anfragen"
            raise
        except ModelRefused:
            outcome.result = "abgelehnt"
            raise
        except InvalidRequest:
            outcome.result = "ungueltig"
            raise
        except ProviderUnavailable:
            outcome.result = "nicht_erreichbar"
            raise
        except GeneratorExit, asyncio.CancelledError:
            outcome.result = "abgebrochen"
            raise
        finally:
            _log_request(request.model, outcome, start)

    async def _attempts(
        self, request: CompletionRequest, outcome: _Outcome, start: float
    ) -> AsyncIterator[StreamEvent]:
        """At most two attempts: one retry after HTTP 429, never after the stream has begun."""
        payload = _payload(request, config_for(request.model, self._models))
        for attempt in range(2):
            failure: str | None = None
            try:
                async with self._client.stream(
                    "POST", _URL, json=payload, headers=self._headers
                ) as response:
                    if response.status_code == httpx.codes.TOO_MANY_REQUESTS and attempt == 0:
                        delay = _retry_after(response.headers)
                    else:
                        _check_status(response.status_code)
                        async for event in self._events(response, outcome, start):
                            yield event
                        return
            except httpx.HTTPError as exc:
                failure = type(exc).__name__
            if failure is not None:
                # Raised outside the except clause: the httpx error carries the request with its
                # authorization header and must not stay reachable via __context__ (review 3.1).
                raise ProviderUnavailable(f"Verbindung fehlgeschlagen ({failure})")
            await self._sleep(delay)

    async def _events(
        self, response: httpx.Response, outcome: _Outcome, start: float
    ) -> AsyncIterator[StreamEvent]:
        """Turn the Server-Sent Events of one response into stream events."""
        lines = _bounded_lines(response.aiter_text())
        deadline = time.monotonic() + self._first_chunk_timeout
        finish_reason: str | None = None
        usage = Usage(input_tokens=None, output_tokens=None, cost_usd=None)
        while True:
            line = await _next_line(lines, deadline)
            if line is None:
                break
            chunk = _parse(line)
            if chunk is None:
                continue
            _raise_for_stream_error(chunk)
            provider = chunk.get("provider")
            if isinstance(provider, str):
                outcome.upstream = provider
            text, reason = _choice(chunk)
            if text:
                if outcome.first_chunk_ms is None:
                    outcome.first_chunk_ms = _elapsed_ms(start)
                deadline = time.monotonic() + self._chunk_timeout
                yield TextChunk(text)
            if reason is not None:
                finish_reason = reason
            reported = chunk.get("usage")
            if isinstance(reported, dict):
                usage = _usage(reported)
                outcome.usage = usage
        if finish_reason == "content_filter":
            raise ModelRefused("Das Modell hat die Anfrage abgelehnt (Inhaltsfilter)")
        if finish_reason is None or finish_reason == "error":
            raise ProviderUnavailable("Der Strom des Anbieters endete ohne Abschluss")
        yield Completed(usage=usage, finish_reason=finish_reason)


def _payload(request: CompletionRequest, config: ModelConfig) -> dict[str, object]:
    """Request body; reasoning and exclusions come from the model configuration."""
    payload: dict[str, object] = {
        "model": request.model,
        "messages": [{"role": m.role, "content": m.content} for m in request.messages],
        "stream": True,
        "max_tokens": request.max_tokens,
        "temperature": request.temperature,
        "usage": {"include": True},
        "reasoning": dict(config.reasoning),
    }
    if config.ignored_providers:
        payload["provider"] = {"ignore": list(config.ignored_providers)}
    return payload


async def _bounded_lines(chunks: AsyncIterator[str]) -> AsyncIterator[str]:
    """Lines of the decoded stream without their line breaks.

    Raises:
        ProviderUnavailable: A line grows beyond :data:`MAX_LINE_CHARS`.
    """
    pending = ""
    async for chunk in chunks:
        pending += chunk
        *complete, pending = pending.split("\n")
        if any(len(line) > MAX_LINE_CHARS for line in (*complete, pending)):
            raise ProviderUnavailable("Antwortzeile des Anbieters zu lang")
        for line in complete:
            yield line.removesuffix("\r")
    if pending:
        yield pending.removesuffix("\r")


async def _next_line(lines: AsyncIterator[str], deadline: float) -> str | None:
    """Next line of the stream, ``None`` at its end or after ``data: [DONE]``.

    Raises:
        ProviderUnavailable: No text arrived before ``deadline`` (keep-alive comments do not count).
    """
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise ProviderUnavailable("Zeitüberschreitung beim Warten auf Text")
    timed_out = False
    try:
        async with asyncio.timeout(remaining):
            line = await anext(lines)
    except StopAsyncIteration:
        return None
    except TimeoutError:
        timed_out = True
    if timed_out:
        raise ProviderUnavailable("Zeitüberschreitung beim Warten auf Text")
    return None if line.strip() == "data: [DONE]" else line


def _parse(line: str) -> dict[str, object] | None:
    """JSON payload of a ``data:`` line; ``None`` for empty lines and comments."""
    if not line.startswith("data:"):
        return None
    try:
        chunk = json.loads(line.removeprefix("data:").strip())
    except json.JSONDecodeError:
        # The decode error holds the raw response line; it must not stay reachable (ADR-021).
        chunk = None
    if not isinstance(chunk, dict):
        raise ProviderUnavailable("Unlesbare Antwort des Anbieters")
    return chunk


def _choice(chunk: Mapping[str, object]) -> tuple[str, str | None]:
    """Text delta and finish reason of the first choice."""
    choices = chunk.get("choices")
    if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
        return "", None
    first = choices[0]
    delta = first.get("delta")
    content = delta.get("content") if isinstance(delta, dict) else None
    reason = first.get("finish_reason")
    return (
        content if isinstance(content, str) else "",
        reason if isinstance(reason, str) else None,
    )


def _usage(reported: Mapping[str, object]) -> Usage:
    """Usage data as reported; missing or malformed values stay ``None``."""

    def number(key: str) -> int | None:
        value = reported.get(key)
        return value if isinstance(value, int) and not isinstance(value, bool) else None

    cost = reported.get("cost")
    return Usage(
        input_tokens=number("prompt_tokens"),
        output_tokens=number("completion_tokens"),
        cost_usd=float(cost)
        if isinstance(cost, int | float) and not isinstance(cost, bool)
        else None,
    )


def _raise_for_stream_error(chunk: Mapping[str, object]) -> None:
    """Map an ``error`` object inside the stream to an error kind."""
    error = chunk.get("error")
    if error is None:
        return
    details = error if isinstance(error, dict) else {}
    code = details.get("code")
    message = str(details.get("message", "")).lower()
    if code == httpx.codes.FORBIDDEN or any(hint in message for hint in _FILTER_HINTS):
        raise ModelRefused("Das Modell hat die Anfrage abgelehnt (Inhaltsfilter)")
    if code == httpx.codes.TOO_MANY_REQUESTS:
        raise RateLimited("Zu viele Anfragen beim Anbieter")
    raise ProviderUnavailable(f"Fehler im Strom des Anbieters (Code {code})")


def _check_status(status: int) -> None:
    """Map an HTTP status before the stream to an error kind (OpenRouter error codes)."""
    if status == httpx.codes.OK:
        return
    if status == httpx.codes.TOO_MANY_REQUESTS:
        raise RateLimited("Zu viele Anfragen beim Anbieter, auch nach einer Wiederholung")
    if status == httpx.codes.FORBIDDEN:
        # OpenRouter answers 403 when the moderation of a model flags the input.
        raise ModelRefused(
            "Die Eingabe wurde von der Moderation des Anbieters abgelehnt (HTTP 403)"
        )
    if status in (httpx.codes.UNAUTHORIZED, httpx.codes.PAYMENT_REQUIRED):
        raise ProviderUnavailable(
            f"Schlüssel abgelehnt oder Guthaben bzw. Ausgabengrenze erschöpft (HTTP {status})"
        )
    if status in (
        httpx.codes.BAD_REQUEST,
        httpx.codes.NOT_FOUND,
        httpx.codes.REQUEST_ENTITY_TOO_LARGE,
        httpx.codes.UNPROCESSABLE_ENTITY,
    ):
        raise InvalidRequest(f"Der Anbieter hat die Anfrage zurückgewiesen (HTTP {status})")
    raise ProviderUnavailable(f"Der Anbieter ist nicht erreichbar (HTTP {status})")


def _retry_after(headers: httpx.Headers) -> float:
    """Wait time the provider asks for, bounded; a default if it names none."""
    try:
        seconds = float(headers.get("retry-after", _DEFAULT_RETRY_AFTER_SECONDS))
    except ValueError:
        seconds = _DEFAULT_RETRY_AFTER_SECONDS
    return min(max(seconds, 0.0), _MAX_RETRY_AFTER_SECONDS)


def _elapsed_ms(start: float) -> int:
    return int((time.monotonic() - start) * 1000)


def _log_request(model: str, outcome: _Outcome, start: float) -> None:
    """Exactly one line per request, metadata only (ADR-021)."""
    usage = outcome.usage or Usage(input_tokens=None, output_tokens=None, cost_usd=None)
    _log.info(
        "ki_anfrage anbieter=openrouter modell=%s ausfuehrend=%s ergebnis=%s token_ein=%s "
        "token_aus=%s kosten_usd=%s dauer_ms=%d erstes_textstueck_ms=%s",
        _LOG_NAME.sub("_", model),
        _LOG_NAME.sub("_", outcome.upstream or "-"),
        outcome.result,
        _or_dash(usage.input_tokens),
        _or_dash(usage.output_tokens),
        _or_dash(usage.cost_usd),
        _elapsed_ms(start),
        _or_dash(outcome.first_chunk_ms),
    )


def _or_dash(value: object) -> str:
    return "-" if value is None else str(value)

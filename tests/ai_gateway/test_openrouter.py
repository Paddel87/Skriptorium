"""OpenRouter adapter: streaming, error kinds, timeouts, retry, logging (roadmap step 3.1)."""

import asyncio
import json
import logging
from collections.abc import AsyncGenerator, AsyncIterator, Mapping, Sequence

import httpx
import pytest

from skriptorium.ai_gateway import (
    DEFAULT_MODELS,
    Completed,
    CompletionRequest,
    InvalidRequest,
    Message,
    ModelConfig,
    ModelRefused,
    OpenRouterProvider,
    ProviderUnavailable,
    RateLimited,
    StreamEvent,
    TextChunk,
    Usage,
)
from skriptorium.ai_gateway.openrouter import MAX_LINE_CHARS

KEY = "sk-or-test-key-not-real"
STORY_TEXT = "Ilka zieht die Runenklinge"


class Body(httpx.AsyncByteStream):
    """Response body sent line by line; a float pauses for that many seconds."""

    def __init__(self, parts: Sequence[str | float]) -> None:
        self._parts = parts

    async def __aiter__(self) -> AsyncIterator[bytes]:
        for part in self._parts:
            if isinstance(part, float):
                await asyncio.sleep(part)
            else:
                yield f"{part}\n".encode()


def data(payload: object) -> str:
    return f"data: {json.dumps(payload)}\n"


def text(content: str) -> str:
    return data({"provider": "xAI", "choices": [{"delta": {"content": content}}]})


def finish(reason: str | None = "stop", usage: object = None) -> str:
    chunk: dict[str, object] = {"choices": [{"delta": {}, "finish_reason": reason}]}
    if usage is not None:
        chunk["usage"] = usage
    return data(chunk)


USAGE = {"prompt_tokens": 1200, "completion_tokens": 80, "cost": 0.0042}
SUCCESS: list[str | float] = [
    ": OPENROUTER PROCESSING\n",
    text("Der Wind "),
    text("drehte."),
    finish("stop", USAGE),
    "data: [DONE]\n",
]


def request(model: str = "x-ai/grok-4.7") -> CompletionRequest:
    return CompletionRequest(
        model=model,
        messages=[Message("system", "Regeln"), Message("user", STORY_TEXT)],
        max_tokens=800,
        temperature=0.8,
    )


class Recorder:
    """Transport answering with prepared responses and remembering the requests."""

    def __init__(self, *responses: httpx.Response | Exception) -> None:
        self._responses = list(responses)
        self.requests: list[httpx.Request] = []

    def __call__(self, req: httpx.Request) -> httpx.Response:
        self.requests.append(req)
        answer = self._responses.pop(0)
        if isinstance(answer, Exception):
            raise answer
        return answer

    def payload(self, index: int = 0) -> dict[str, object]:
        body = json.loads(self.requests[index].content)
        assert isinstance(body, dict)
        return body


def ok(parts: Sequence[str | float] = SUCCESS) -> httpx.Response:
    return httpx.Response(200, stream=Body(parts))


def status(code: int, headers: dict[str, str] | None = None) -> httpx.Response:
    return httpx.Response(code, headers=headers, json={"error": {"code": code, "message": "x"}})


def provider(
    recorder: Recorder,
    *,
    models: Mapping[str, ModelConfig] = DEFAULT_MODELS,
    first_chunk_timeout: float = 90.0,
    chunk_timeout: float = 30.0,
) -> tuple[OpenRouterProvider, list[float]]:
    waits: list[float] = []

    async def sleep(seconds: float) -> None:
        waits.append(seconds)

    adapter = OpenRouterProvider(
        KEY,
        transport=httpx.MockTransport(recorder),
        models=models,
        sleep=sleep,
        first_chunk_timeout=first_chunk_timeout,
        chunk_timeout=chunk_timeout,
    )
    return adapter, waits


def run(
    adapter: OpenRouterProvider, req: CompletionRequest | None = None
) -> tuple[list[StreamEvent], BaseException | None]:
    """All events until the end or the first error, and that error."""
    events: list[StreamEvent] = []

    async def consume() -> BaseException | None:
        try:
            async for event in adapter.stream(req or request()):
                events.append(event)
        except Exception as exc:
            return exc
        finally:
            await adapter.aclose()
        return None

    return events, asyncio.run(consume())


def test_streams_text_and_usage() -> None:
    recorder = Recorder(ok())
    adapter, _ = provider(recorder)

    events, error = run(adapter)

    assert error is None
    assert events == [
        TextChunk("Der Wind "),
        TextChunk("drehte."),
        Completed(Usage(input_tokens=1200, output_tokens=80, cost_usd=0.0042), "stop"),
    ]


def test_request_uses_model_configuration_and_key_header() -> None:
    recorder = Recorder(ok())
    adapter, _ = provider(recorder)

    run(adapter)

    sent = recorder.requests[0]
    assert sent.url == "https://openrouter.ai/api/v1/chat/completions"
    assert sent.headers["authorization"] == f"Bearer {KEY}"
    assert recorder.payload() == {
        "model": "x-ai/grok-4.7",
        "messages": [
            {"role": "system", "content": "Regeln"},
            {"role": "user", "content": STORY_TEXT},
        ],
        "stream": True,
        "max_tokens": 800,
        "temperature": 0.8,
        "usage": {"include": True},
        "reasoning": {"effort": "low"},
    }


def test_unknown_model_runs_without_reasoning() -> None:
    recorder = Recorder(ok())
    adapter, _ = provider(recorder)

    run(adapter, request("some/other-model"))

    assert recorder.payload()["reasoning"] == {"enabled": False}


def test_excluded_providers_are_sent_as_routing_rule() -> None:
    recorder = Recorder(ok())
    models = {"deepseek/deepseek-v4-pro": ModelConfig(ignored_providers=("StreamLake",))}
    adapter, _ = provider(recorder, models=models)

    run(adapter, request("deepseek/deepseek-v4-pro"))

    assert recorder.payload()["provider"] == {"ignore": ["StreamLake"]}


def test_content_filter_finish_is_model_refused_after_partial_text() -> None:
    adapter, _ = provider(Recorder(ok([text("Anfang"), finish("content_filter")])))

    events, error = run(adapter)

    assert events == [TextChunk("Anfang")]
    assert isinstance(error, ModelRefused)


@pytest.mark.parametrize(
    ("stream_error", "kind"),
    [
        ({"code": 403, "message": "Input flagged"}, ModelRefused),
        ({"code": 400, "message": "Blocked by content filter"}, ModelRefused),
        ({"code": 502, "message": "Provider returned error"}, ProviderUnavailable),
        ({"code": 429, "message": "Rate limit exceeded"}, RateLimited),
        ("unexpected", ProviderUnavailable),
    ],
)
def test_errors_inside_the_stream(stream_error: object, kind: type[Exception]) -> None:
    adapter, _ = provider(Recorder(ok([text("x"), data({"error": stream_error})])))

    _, error = run(adapter)

    assert type(error) is kind


@pytest.mark.parametrize(
    ("code", "kind"),
    [
        (400, InvalidRequest),
        (404, InvalidRequest),
        (413, InvalidRequest),
        (422, InvalidRequest),
        (401, ProviderUnavailable),
        (402, ProviderUnavailable),
        (403, ModelRefused),
        (500, ProviderUnavailable),
        (503, ProviderUnavailable),
    ],
)
def test_http_status_before_the_stream(code: int, kind: type[Exception]) -> None:
    adapter, _ = provider(Recorder(status(code)))

    events, error = run(adapter)

    assert events == []
    assert type(error) is kind


def test_rate_limit_is_retried_once_after_the_providers_wait() -> None:
    recorder = Recorder(status(429, {"retry-after": "3"}), ok())
    adapter, waits = provider(recorder)

    events, error = run(adapter)

    assert error is None
    assert waits == [3.0]
    assert len(recorder.requests) == 2
    assert isinstance(events[-1], Completed)


def test_second_rate_limit_is_raised() -> None:
    adapter, waits = provider(Recorder(status(429), status(429)))

    _, error = run(adapter)

    assert isinstance(error, RateLimited)
    assert waits == [5.0]


@pytest.mark.parametrize(("header", "wait"), [("abc", 5.0), ("600", 60.0), ("-4", 0.0)])
def test_retry_wait_is_bounded(header: str, wait: float) -> None:
    adapter, waits = provider(Recorder(status(429, {"retry-after": header}), ok()))

    run(adapter)

    assert waits == [wait]


def test_network_failure_is_provider_unavailable() -> None:
    adapter, _ = provider(Recorder(httpx.ConnectError("refused")))

    _, error = run(adapter)

    assert isinstance(error, ProviderUnavailable)


def test_waiting_for_the_first_text_times_out_despite_keep_alive() -> None:
    keep_alive: list[str | float] = [": OPENROUTER PROCESSING\n", 0.05]
    parts = keep_alive * 6 + [text("zu spät")]
    adapter, _ = provider(Recorder(ok(parts)), first_chunk_timeout=0.15)

    events, error = run(adapter)

    assert events == []
    assert isinstance(error, ProviderUnavailable)


def test_pause_between_text_chunks_times_out() -> None:
    adapter, _ = provider(Recorder(ok([text("eins"), 0.3, text("zwei")])), chunk_timeout=0.1)

    events, error = run(adapter)

    assert events == [TextChunk("eins")]
    assert isinstance(error, ProviderUnavailable)


@pytest.mark.parametrize(
    "parts",
    [
        [text("ohne Abschluss")],
        [text("x"), finish("error")],
        ["data: {kein json\n"],
        ['data: ["liste"]\n'],
    ],
)
def test_broken_streams_are_provider_unavailable(parts: list[str | float]) -> None:
    adapter, _ = provider(Recorder(ok(parts)))

    _, error = run(adapter)

    assert isinstance(error, ProviderUnavailable)


def test_malformed_usage_and_choices_are_tolerated() -> None:
    parts: list[str | float] = [
        data({"choices": []}),
        data({"choices": [{"delta": "kaputt"}]}),
        data({"choices": ["kaputt"]}),
        finish("length", {"prompt_tokens": "viele", "completion_tokens": True, "cost": "1"}),
    ]
    adapter, _ = provider(Recorder(ok(parts)))

    events, error = run(adapter)

    assert error is None
    assert events == [Completed(Usage(None, None, None), "length")]


def test_key_comes_only_from_the_environment() -> None:
    with pytest.raises(ProviderUnavailable, match="OPENROUTER_API_KEY"):
        OpenRouterProvider.from_environment({})
    with pytest.raises(ProviderUnavailable):
        OpenRouterProvider.from_environment({"OPENROUTER_API_KEY": ""})

    recorder = Recorder(ok())
    adapter = OpenRouterProvider.from_environment(
        {"OPENROUTER_API_KEY": KEY}, transport=httpx.MockTransport(recorder)
    )
    run(adapter)

    assert recorder.requests[0].headers["authorization"] == f"Bearer {KEY}"
    assert KEY not in repr(adapter)


def log_lines(caplog: pytest.LogCaptureFixture) -> list[str]:
    return [r.getMessage() for r in caplog.records if r.name == "skriptorium.ai_gateway"]


def test_one_log_line_with_metadata_only(caplog: pytest.LogCaptureFixture) -> None:
    caplog.set_level(logging.INFO, logger="skriptorium.ai_gateway")
    adapter, _ = provider(Recorder(ok()))

    run(adapter)

    lines = log_lines(caplog)
    assert len(lines) == 1
    line = lines[0]
    for field in (
        "anbieter=openrouter",
        "modell=x-ai/grok-4.7",
        "ausfuehrend=xAI",
        "ergebnis=erfolg",
        "token_ein=1200",
        "token_aus=80",
        "kosten_usd=0.0042",
        "dauer_ms=",
        "erstes_textstueck_ms=",
    ):
        assert field in line
    assert KEY not in caplog.text
    assert STORY_TEXT not in caplog.text
    assert "Der Wind" not in caplog.text


@pytest.mark.parametrize(
    ("answer", "result"),
    [
        (status(403), "abgelehnt"),
        (status(400), "ungueltig"),
        (status(503), "nicht_erreichbar"),
    ],
)
def test_log_line_names_the_error_kind(
    caplog: pytest.LogCaptureFixture, answer: httpx.Response, result: str
) -> None:
    caplog.set_level(logging.INFO, logger="skriptorium.ai_gateway")
    adapter, _ = provider(Recorder(answer))

    run(adapter)

    lines = log_lines(caplog)
    assert len(lines) == 1
    assert f"ergebnis={result}" in lines[0]
    assert "token_ein=- token_aus=- kosten_usd=-" in lines[0]


def test_log_line_after_retry_exhausted(caplog: pytest.LogCaptureFixture) -> None:
    caplog.set_level(logging.INFO, logger="skriptorium.ai_gateway")
    adapter, _ = provider(Recorder(status(429), status(429)))

    run(adapter)

    assert ["ergebnis=zu_viele_anfragen" in line for line in log_lines(caplog)] == [True]


def test_cancelled_stream_is_logged_as_cancelled(caplog: pytest.LogCaptureFixture) -> None:
    caplog.set_level(logging.INFO, logger="skriptorium.ai_gateway")
    adapter, _ = provider(Recorder(ok()))

    async def first_chunk_only() -> None:
        stream = adapter.stream(request())
        assert isinstance(stream, AsyncGenerator)
        await anext(stream)
        await stream.aclose()
        await adapter.aclose()

    asyncio.run(first_chunk_only())

    lines = log_lines(caplog)
    assert len(lines) == 1
    assert "ergebnis=abgebrochen" in lines[0]


def test_expired_deadline_stops_before_reading() -> None:
    adapter, _ = provider(Recorder(ok()), first_chunk_timeout=0.0)

    events, error = run(adapter)

    assert events == []
    assert isinstance(error, ProviderUnavailable)


def chained(error: BaseException) -> list[BaseException]:
    found: list[BaseException] = []
    current: BaseException | None = error
    while current is not None:
        found.append(current)
        current = current.__cause__ or current.__context__
    return found


def test_network_error_does_not_keep_the_key_reachable() -> None:
    adapter, _ = provider(Recorder(httpx.ConnectError("refused")))

    _, error = run(adapter)

    assert error is not None
    assert chained(error) == [error]


def test_unreadable_line_is_not_kept_in_the_error() -> None:
    adapter, _ = provider(Recorder(ok([f"data: {{{STORY_TEXT}\n"])))

    _, error = run(adapter)

    assert error is not None
    assert chained(error) == [error]
    assert STORY_TEXT not in str(error)


def test_timeout_error_has_no_chain() -> None:
    adapter, _ = provider(Recorder(ok([0.3, text("spät")])), first_chunk_timeout=0.1)

    _, error = run(adapter)

    assert isinstance(error, ProviderUnavailable)
    assert chained(error) == [error]


class Pieces(httpx.AsyncByteStream):
    """Response body sent exactly as given, without added line breaks."""

    def __init__(self, *pieces: str) -> None:
        self._pieces = pieces

    async def __aiter__(self) -> AsyncIterator[bytes]:
        for piece in self._pieces:
            yield piece.encode()


@pytest.mark.parametrize("line_break", ["", "\n"])
def test_overlong_line_is_rejected_without_its_content(line_break: str) -> None:
    half = "A" * (MAX_LINE_CHARS // 2 + 10)
    body = Pieces(text("x"), "data: " + half, half + line_break, finish())
    adapter, _ = provider(Recorder(httpx.Response(200, stream=body)))

    events, error = run(adapter)

    assert events == [TextChunk("x")]
    assert isinstance(error, ProviderUnavailable)
    assert str(error) == "Antwortzeile des Anbieters zu lang"


def test_lines_split_across_chunks_and_crlf_are_joined() -> None:
    whole = text("zusammen").rstrip("\n")
    parts: list[str | float] = [whole[:10], whole[10:] + "\r\n", finish(), "data: [DONE]"]

    class Raw(httpx.AsyncByteStream):
        async def __aiter__(self) -> AsyncIterator[bytes]:
            for part in parts:
                assert isinstance(part, str)
                yield part.encode()

    adapter, _ = provider(Recorder(httpx.Response(200, stream=Raw())))

    events, error = run(adapter)

    assert error is None
    assert events[0] == TextChunk("zusammen")


def test_log_line_cannot_be_forged_through_names(caplog: pytest.LogCaptureFixture) -> None:
    caplog.set_level(logging.INFO, logger="skriptorium.ai_gateway")
    forged = data({"provider": "Evil\nergebnis=erfolg", "choices": [{"delta": {"content": "x"}}]})
    adapter, _ = provider(Recorder(ok([forged, finish()])))

    run(adapter, request("a/b\nki_anfrage ergebnis=erfolg"))

    line = log_lines(caplog)[0]
    assert "\n" not in line
    assert "modell=a/b_ki_anfrage_ergebnis_erfolg" in line
    assert "ausfuehrend=Evil_ergebnis_erfolg" in line

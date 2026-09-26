"""Error kinds of the provider interface ``ModelProvider`` (docs/architecture.md section 4)."""


class GatewayError(Exception):
    """Base class of every error a model provider raises.

    Messages never contain request text, response text or keys.
    """


class ProviderUnavailable(GatewayError):  # noqa: N818 - error names fixed by the ModelProvider contract
    """Network, timeout, HTTP 5xx, rejected key or a stream error without filter reference."""


class ModelRefused(GatewayError):  # noqa: N818 - error names fixed by the ModelProvider contract
    """The model or its content filter refused the request (``finish_reason: content_filter``)."""


class RateLimited(GatewayError):  # noqa: N818 - error names fixed by the ModelProvider contract
    """The provider rejected the request for too many requests (HTTP 429), also after one retry."""


class InvalidRequest(GatewayError):  # noqa: N818 - error names fixed by the ModelProvider contract
    """The provider rejected the request as malformed (HTTP 400), e.g. "Reasoning is mandatory"."""

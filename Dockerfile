# Container image of the Skriptorium for operation on the VPS (ADR-027, ADR-029).
# Three stages: build the user interface with Node, install the Python dependencies with uv,
# run with plain Python as an unprivileged user. Node and uv are not part of the final image.

FROM node:24.21.0-slim AS ui
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json vite.config.ts ./
COPY ui ./ui
# Type checking is a CI gate; the image only needs the bundle (as in the README).
RUN npx vite build

FROM ghcr.io/astral-sh/uv:0.12.19 AS uv

FROM python:3.14.7-slim AS python
COPY --from=uv /uv /usr/local/bin/uv
ENV UV_PYTHON_DOWNLOADS=never \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy
WORKDIR /app
COPY pyproject.toml uv.lock README.md LICENSE ./
COPY src ./src
RUN uv sync --frozen --no-dev --no-editable

FROM python:3.14.7-slim
RUN useradd --system --uid 10001 --no-create-home --shell /usr/sbin/nologin skriptorium \
    && mkdir /data && chown skriptorium /data
WORKDIR /app
COPY --from=python /app/.venv /app/.venv
COPY --from=ui /build/dist/ui /app/dist/ui
ENV PATH="/app/.venv/bin:$PATH" \
    SKRIPTORIUM_DATA_DIR=/data \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
USER skriptorium
VOLUME ["/data"]
EXPOSE 8000
HEALTHCHECK --interval=60s --timeout=5s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=4)"]
# Exactly one process, no access log (ADR-017). FORWARDED_ALLOW_IPS is set by the operator to the
# network shared with the reverse proxy only (ADR-030); without it uvicorn trusts 127.0.0.1 only.
CMD ["uvicorn", "skriptorium.api:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--no-access-log"]

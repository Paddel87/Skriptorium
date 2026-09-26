#!/usr/bin/env bash
# Zweck: Richtet eine Cloud-Session des Coding-Agents für Skriptorium ein – feste Werkzeug-
#   Versionen (uv, Python, Node), Projekt-Abhängigkeiten und den Pre-Commit-Hook (ADR-015).
#   Aufgerufen als SessionStart-Hook aus .claude/settings.json; lokal ohne Wirkung.
# Voraussetzungen: bash 4+, curl, tar (mit xz), sha256sum, python3 mit venv, git;
#   ENV: CLAUDE_CODE_REMOTE (nur bei "true" aktiv), CLAUDE_PROJECT_DIR, CLAUDE_ENV_FILE
#   (beide vom Werkzeug gesetzt); Netz zu pypi.org, nodejs.org, registry.npmjs.org.
# Plattformen: Linux x86_64 (Cloud-Session). macOS und Windows nicht unterstützt – dort
#   entwickelt niemand (docs/project-context.md Abschnitt 3).
# Idempotenz: ja – vorhandene Werkzeuge mit passender Version werden nicht neu geladen;
#   `uv sync`, `npm install` und `pre-commit install` sind wiederholbar.
# Reproduzierbarkeit: Werkzeug-Versionen fest, Node-Archiv per SHA-256 geprüft,
#   Abhängigkeiten aus uv.lock und package-lock.json; wiederholte Aufrufe ergeben denselben Stand.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

UV_VERSION="0.12.19"
PYTHON_VERSION="3.14.7"
NODE_VERSION="24.21.0"
NODE_SHA256="fd8e59d5a511510f6a298afb548f18c7d2b1be404d8b4a27d94fbe49f56cb2d6"

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
tools_dir="${HOME}/.cache/skriptorium-tools"
uv_venv="${tools_dir}/uv-${UV_VERSION}"
node_dir="${tools_dir}/node-v${NODE_VERSION}-linux-x64"
mkdir -p "${tools_dir}"

# Die Umgebung setzt UV_NATIVE_TLS, das uv 0.12 als abgekündigt meldet; Ersatz UV_SYSTEM_CERTS.
unset UV_NATIVE_TLS
export UV_SYSTEM_CERTS=1

if [ ! -x "${uv_venv}/bin/uv" ] || [ "$("${uv_venv}/bin/uv" --version | cut -d' ' -f2)" != "${UV_VERSION}" ]; then
  rm -rf "${uv_venv}"
  python3 -m venv "${uv_venv}"
  "${uv_venv}/bin/pip" install --quiet --disable-pip-version-check "uv==${UV_VERSION}"
fi

if [ ! -x "${node_dir}/bin/node" ]; then
  archive="${tools_dir}/node-v${NODE_VERSION}-linux-x64.tar.xz"
  curl -sSfL -o "${archive}" "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz"
  echo "${NODE_SHA256}  ${archive}" | sha256sum --check --quiet
  tar -xJf "${archive}" -C "${tools_dir}"
  rm -f "${archive}"
fi

export PATH="${uv_venv}/bin:${node_dir}/bin:${PATH}"

cd "${project_dir}"
uv python install "${PYTHON_VERSION}"
uv sync --frozen --python "${PYTHON_VERSION}"
npm install --no-audit --no-fund
uv run --frozen pre-commit install

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export PATH=\"${uv_venv}/bin:${node_dir}/bin:\${PATH}\""
    echo "unset UV_NATIVE_TLS"
    echo "export UV_SYSTEM_CERTS=1"
  } >> "${CLAUDE_ENV_FILE}"
fi

#!/usr/bin/env bash
set -euo pipefail

L4_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
VENV_DIR="$CACHE_HOME/sc-copilotkit-l4-e2e-venv"
PORT="${LESSON_BACKEND_PORT:-8000}"
BACKEND_ROOT="$L4_ROOT/backend-dynamic"

choose_python() {
  if command -v python3.11 >/dev/null 2>&1; then
    echo "python3.11"
    return
  fi
  if command -v python3.10 >/dev/null 2>&1; then
    echo "python3.10"
    return
  fi
  if command -v python3 >/dev/null 2>&1; then
    echo "python3"
    return
  fi
  echo "No Python interpreter found." >&2
  exit 1
}

PYTHON_BIN="$(choose_python)"

"$PYTHON_BIN" - <<'PY'
import sys
if sys.version_info < (3, 10):
    raise SystemExit("Lesson 4 backend e2e requires Python 3.10+")
PY

if [ ! -x "$VENV_DIR/bin/python" ]; then
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

"$VENV_DIR/bin/python" -m pip install --disable-pip-version-check -q \
  "copilotkit>=0.1.77" \
  "ag-ui-langgraph[fastapi]>=0.0.24" \
  "langgraph==1.0.5" \
  "langchain==1.2.0" \
  "langchain-openai>=1.1.0" \
  "python-dotenv>=1.0.0" \
  "uvicorn>=0.29,<1"

cd "$BACKEND_ROOT"
LESSON_BACKEND_PORT="$PORT" "$VENV_DIR/bin/python" main.py \
  --host 127.0.0.1 \
  --port "$PORT" \
  --log-level warning

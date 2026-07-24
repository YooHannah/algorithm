#!/usr/bin/env bash
set -euo pipefail

L5_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
VENV_DIR="$CACHE_HOME/sc-copilotkit-l5-e2e-venv"
PORT="${LESSON_BACKEND_PORT:-8006}"

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
    raise SystemExit("Lesson 5 backend e2e requires Python 3.10+")
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

cd "$L5_ROOT"
OPENAI_API_KEY="${OPENAI_API_KEY:-test-key}" LESSON_BACKEND_PORT="$PORT" "$VENV_DIR/bin/python" - <<'PY'
import os
import signal
import sys
from pathlib import Path

repo_root = Path.cwd().parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from backend.server import start_backend

status = start_backend(
    host="127.0.0.1",
    port=int(os.environ["LESSON_BACKEND_PORT"]),
    log_level="warning",
)
print(f"Lesson backend ready at {status['url']}", flush=True)
signal.pause()
PY

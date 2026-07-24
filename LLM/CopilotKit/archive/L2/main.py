from __future__ import annotations

import os
import subprocess as _sp
import sys
import threading
import time
import warnings
from pathlib import Path
from typing import Any

warnings.filterwarnings("ignore")

import uvicorn
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from fastapi import FastAPI
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

HOST = "0.0.0.0"
PORT = 8000
MODEL = "gpt-4.1"

app = FastAPI()
agent = LangGraphAGUIAgent(
    name="lesson2_agent",
    description="Lesson 2 chart agent",
    graph=None,
)
add_langgraph_fastapi_endpoint(app=app, agent=agent, path="/")

_server_started = False
_server_lock = threading.Lock()


def _kill_port(port: int) -> None:
    """Kill any process currently listening on *port*."""
    try:
        result = _sp.run(["lsof", "-ti", f":{port}"], capture_output=True, text=True)
        for pid in result.stdout.strip().split():
            if pid:
                print(f"⚠ Found existing process (PID {pid}) on port {port} — killing it")
                os.kill(int(pid), 9)
        if result.stdout.strip():
            time.sleep(0.5)
    except Exception:
        pass


def _ensure_openai_api_key() -> None:
    if os.environ.get("OPENAI_API_KEY"):
        return

    repo_root = Path(__file__).resolve().parents[1]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))

    from helper import get_openai_api_key

    os.environ["OPENAI_API_KEY"] = get_openai_api_key()


def build_graph(model_name: str = MODEL):
    _ensure_openai_api_key()
    return create_agent(
        model=ChatOpenAI(model=model_name),
        tools=[],
        middleware=[CopilotKitMiddleware()],
        checkpointer=MemorySaver(),
        system_prompt=(
            "You are a helpful assistant for a demo app with a few available UI tools. "
            "Prefer using a matching frontend tool when it would present the answer clearly. "
            "For chart requests, use concise made-up demo data when the user does not provide data. "
            "Use pieChart for category distributions "
            "and flightCard for a single flight summary when relevant. "
            "Tool arguments must match the provided schema exactly."
        ),
    )


def load_graph(model_name: str = MODEL):
    agent.graph = build_graph(model_name=model_name)
    return agent.graph


def start_backend(host: str = HOST, port: int = PORT, log_level: str = "warning") -> str:
    global _server_started

    with _server_lock:
        if not _server_started:
            _kill_port(port)
            threading.Thread(
                target=lambda: uvicorn.run(app, host=host, port=port, log_level=log_level),
                daemon=True,
            ).start()
            _server_started = True

    return f"http://localhost:{port}"


def main() -> None:
    load_graph()
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")


if __name__ == "__main__":
    main()

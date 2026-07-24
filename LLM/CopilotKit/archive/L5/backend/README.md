# Lesson 5 Backend

Backend for Lesson 5 open-ended generative UI with MCP Apps.

The agent uses `gpt-4.1` with `CopilotKitMiddleware()`. No backend tools are
defined — MCP app tools are discovered on the frontend via `MCPAppsMiddleware`.
Ensure `OPENAI_API_KEY` is set (for example in the repo root `.env`).

## Install Dependencies

```bash
cd L5/backend
python3 -m pip install -r ../../requirements.txt
```

## Run Server

```bash
cd L5/backend
python3 -c "from server import start_backend; start_backend(); import threading; threading.Event().wait()"
```

This starts the backend on `http://localhost:8000`.

The agent graph is defined in [server.py](./server.py).

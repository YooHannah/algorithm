# Lesson 6 Backend

Backend for Lesson 6 fullstack agent with shared state and todo management.

The agent uses `gpt-4.1` with three tools (`add_todo`, `set_todo_status`,
`remove_todo`) that mutate shared `TodoAgentState` via `Command(update={...})`.
Ensure `OPENAI_API_KEY` is set (for example in the repo root `.env`).

## Install Dependencies

```bash
cd L6/backend
python3 -m pip install -r ../../requirements.txt
```

## Run Server

```bash
cd L6/backend
python3 -c "from server import start_backend; start_backend(); import threading; threading.Event().wait()"
```

This starts the backend on `http://localhost:8000`.

The agent graph, state schema, and tools are defined in [server.py](./server.py).

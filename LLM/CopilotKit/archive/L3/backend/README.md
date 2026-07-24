# Lesson 3 Backend

Backend for Lesson 3 controlled generative UI with data querying.

The agent uses `gpt-4.1` with a `query_data` tool that loads rows from
`db.csv`. Ensure `OPENAI_API_KEY` is set (for example in the repo root `.env`,
which the helper loads automatically).

## Install Dependencies

```bash
cd L3/backend
python3 -m pip install -r ../../requirements.txt
```

## Run Server

```bash
cd L3/backend
python3 -c "from server import start_backend; start_backend(); import threading; threading.Event().wait()"
```

This starts the backend on `http://localhost:8000`.

The agent graph and `query_data` tool are defined in [server.py](./server.py).

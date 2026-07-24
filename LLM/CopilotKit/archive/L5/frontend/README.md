# Lesson 5 Frontend

Next.js frontend for Lesson 5 open-ended generative UI with MCP Apps.

Uses `MCPAppsMiddleware` to connect to MCP servers (Excalidraw whiteboard by
default). The agent can discover and launch MCP app tools during a conversation.

## Install Dependencies

```bash
cd L5/frontend
npm install
```

## Run Dev Server

```bash
npm run dev
```

This starts the frontend on `http://localhost:3000`.

Expects the L5 backend running on port 8000. Set `LANGGRAPH_DEPLOYMENT_URL` to
override (e.g., `LANGGRAPH_DEPLOYMENT_URL=http://localhost:8005 npm run dev`).

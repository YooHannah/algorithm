# Lesson 6 Frontend

Next.js frontend for Lesson 6 fullstack agent with shared state.

Features a chat interface and an App Mode panel for managing todos. Uses
`useFrontendTool` to register an `openTodoApp` tool, and `useAgent` to
synchronize shared state between the agent and the React UI.

## Install Dependencies

```bash
cd L6/frontend
npm install
```

## Run Dev Server

```bash
npm run dev
```

This starts the frontend on `http://localhost:3000`.

Expects the L6 backend running on port 8000. Set `LANGGRAPH_DEPLOYMENT_URL` to
override (e.g., `LANGGRAPH_DEPLOYMENT_URL=http://localhost:8006 npm run dev`).

# Lesson 3 Frontend

Next.js frontend for Lesson 3 controlled generative UI.

Registers three frontend tools via `useComponent()`: pie chart, bar chart, and
flight card. The agent chooses which to render based on the user's prompt.

## Install Dependencies

```bash
cd L3/frontend
npm install
```

## Run Dev Server

```bash
npm run dev
```

This starts the frontend on `http://localhost:3000`.

Expects the L3 backend running on port 8000. Set `LANGGRAPH_DEPLOYMENT_URL` to
override (e.g., `LANGGRAPH_DEPLOYMENT_URL=http://localhost:8002 npm run dev`).


import { serve } from "@hono/node-server";
import {
  CopilotRuntime,
  createCopilotEndpoint,
} from "@copilotkit/runtime/v2";
import { LangGraphHttpAgent } from "@copilotkit/runtime/langgraph";

const appAgent = new LangGraphHttpAgent({
  url: process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8005",
});

const runtime = new CopilotRuntime({
  agents: { default: appAgent },
  mcpApps: {
    servers: [
      {
        type: "http",
        url: "https://mcp.excalidraw.com", // <- Exalidraw MCP Server
        serverId: "example_mcp_server",
      },
    ],
  },
});

const app = createCopilotEndpoint({
  runtime,
  basePath: "/api/copilotkit",
});

serve({ fetch: app.fetch, port: 4005 }, () => {
  console.log("✓ CopilotKit API server running at http://localhost:4005");
});

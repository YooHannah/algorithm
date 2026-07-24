
import { serve } from "@hono/node-server";
import {
  CopilotRuntime,
  createCopilotEndpoint,
} from "@copilotkit/runtime/v2";
import { LangGraphHttpAgent } from "@copilotkit/runtime/langgraph";

const langGraphAgent = new LangGraphHttpAgent({ url: "http://localhost:8004" });

const runtime = new CopilotRuntime({
  agents: { default: langGraphAgent },
  a2ui: { injectA2UITool: true },
});

const app = createCopilotEndpoint({
  runtime,
  basePath: "/api/copilotkit",
});

serve({ fetch: app.fetch, port: 4004 }, () => {
  console.log("\u2713 CopilotKit API server running at http://localhost:4004");
});

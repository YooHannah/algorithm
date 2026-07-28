import { HttpAgent } from "@ag-ui/client";
import { LangGraphHttpAgent } from "@copilotkit/runtime/langgraph";
import { CopilotRuntime, createCopilotEndpoint } from "@copilotkit/runtime/v2";
import { serve } from "@hono/node-server";

const langGraphAgent = new LangGraphHttpAgent({
  url: process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8002",
});

const adkAgent = new HttpAgent({
  url: process.env.ADK_AGENT_URL || "http://localhost:8009",
});

const arkAgent = new HttpAgent({
  url: process.env.ARK_AGENT_URL || "http://localhost:8010",
});

// The CopilotRuntime is the secure bridge between your frontend and agent backend
// 将不同的agent 注册到runtime 中 方便前端调用
const runtime = new CopilotRuntime({
  agents: {
    default: langGraphAgent, // Register  LangChain agent as the default agent
    gemini: adkAgent,
    ark: arkAgent,
  },
});

const app = createCopilotEndpoint({
  runtime,
  basePath: "/api/copilotkit",
});

serve({ fetch: app.fetch, port: 4002 }, () => {
  console.log("CopilotKit API server running at http://localhost:4002");
});
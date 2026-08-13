import { LangGraphHttpAgent } from "@copilotkit/runtime/langgraph";
import {
  CopilotRuntime,
  createCopilotEndpoint,
} from "@copilotkit/runtime/v2";
import { serve } from "@hono/node-server";

const appAgent = new LangGraphHttpAgent({
  url: process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8005",
});

/***
 * A few things to note about the mcpApps configuration:
关于 mcpApps 配置的几点说明：

mcpApps.servers connects the runtime to one or more MCP servers that expose app tools.
mcpApps.servers 将运行时连接到一个或多个提供应用程序工具的 MCP 服务器。
Each entry tells the runtime where to discover compatible MCP Apps. Here, you connect to Excalidraw over HTTP.
每个条目都指明了运行时应该在哪里找到兼容的 MCP 应用程序。在这里，你可以通过 HTTP 连接到 Excalidraw。
CopilotKit automatically augments the agent with MCP app discovery so it can surface those tools during a run.
CopilotKit 会自动为代理添加 MCP 应用程序识别功能，从而在运行时能够自动调用这些工具。
 */
const runtime = new CopilotRuntime({
  agents: { default: appAgent },
  // Make a card with an animation of raining taco emojis
  openGenerativeUI: true, // 启用开放生成式UI 代理可以生成任意类型的用户界面——包括 HTML、CSS、JavaScript 等代码，并可以直接在聊天界面中展示
  mcpApps: { // 注册 MCP 应用程序
    servers: [ // Show me a simple network diagram of three routers, two laptops and a server using excalidraw
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
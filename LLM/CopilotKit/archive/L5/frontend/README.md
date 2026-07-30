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

Open-ended generative UI is the most flexible pattern in the stack: the agent is not limited to a small set of pre-registered components or a declarative schema, either fixed or dynamically generated.
开放式的生成 UI 是最灵活的模式：该工具并不局限于一组预先注册好的组件，也不依赖于固定的或动态生成的声明式架构。

That flexibility comes from MCP Apps. The agent discovers app tools from an MCP server and can open those apps when they fit the user's request.
这种灵活性源自 MCP 应用程序。代理可以从 MCP 服务器上获取应用程序工具，并在这些工具符合用户需求时将其打开使用。

Your frontend acts as a host. It does not need to hand-author every possible UI surface ahead of time; instead, it connects the chat runtime to compatible external apps.
你的前端部分充当了主机角色。它无需提前手动编写所有可能的用户界面界面；相反，它只需将聊天运行时与兼容的外部应用程序连接起来即可。

Why use Open-Ended UI?
为什么使用开放式用户界面？¶
Open-ended UI is useful when the long tail of user requests is too broad to cover with a fixed component library.
当用户的请求范围过于广泛，无法用固定的组件库来涵盖时，开放式用户界面就非常有用。

Pros  优点

Extremely flexible: the agent can route users into richer app experiences, not just inline widgets.
极其灵活：该代理能够引导用户体验更丰富的应用程序功能，而不仅仅是简单的内嵌小部件。
Lower frontend coupling: your host app can gain new capabilities by connecting to MCP servers.
降低前端耦合度：通过连接到 MCP 服务器，宿主应用程序可以获得新的功能。
Good fit for workflows like whiteboarding, design, planning, and other tool-shaped tasks.
非常适合用于白板演示、设计工作、计划制定等需要使用工具来完成的任务。
Cons  消费

Less control over the final UI than controlled or declarative approaches.
与那些需要手动配置或声明式的方法相比，这种方式对最终的用户界面控制较少。
Quality depends on the connected MCP apps and how well the agent selects them.
质量取决于所连接的 MCP 应用程序，以及代理程序选择这些应用程序的精准程度。
Requires stronger trust, permissions, and integration guardrails.
这需要更强的信任机制、权限管理，以及更严格的集成规范。

The MCP Apps Specification
MCP 应用程序规范¶
MCP Apps are an extension to the Model Context Protocol that lets MCP servers deliver interactive UI to supported hosts.
MCP 应用程序是模型上下文协议的扩展，它使得 MCP 服务器能够向支持的设备提供交互式用户界面。

The architecture has three parts:
这种架构由三部分组成：

Server: exposes tools and UI resources.
服务器：提供工具和用户界面资源。
Host: embeds the UI in a sandboxed iframe and proxies communication.
主持人：将用户界面嵌入到沙盒中的 iframe 中，并负责代理双方的通信过程。
View: the app running inside the iframe.
视图：在 iframe 内部运行的应用程序。
A key design point is progressive enhancement: if the host supports MCP Apps, the tool renders rich UI; if not, it still works as a normal MCP tool with text output.
一个重要的设计原则是渐进式增强：如果主机支持 MCP 应用程序，那么工具会呈现丰富的用户界面；否则，它仍然可以作为普通的 MCP 工具使用，仅提供文本输出。

CopilotKit handles the hosting — you just point it at an MCP server URL.
CopilotKit 负责托管工作——你只需要将其指向一个 MCP 服务器的 URL 地址即可。

[ the official repository of MCP App examples.](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples)

注意：开放生成的用户界面是不可预测的

Because the agent generates the UI from scratch on every request, results may not match what you expect on the first try. You may need to iterate on the prompt a few times before the diagram looks the way you want.
因为代理在每次请求时都会从零开始生成用户界面，所以结果可能不会完全符合你的预期。你可能需要多次调整提示语，直到得到你想要的效果。

This is one of the core trade-offs of fully open Generative UI: you get maximum flexibility, but you sacrifice consistency and predictability. For UIs that need to be reliable every time, controlled or declarative approaches are the better fit.
这是完全开放式的生成式用户界面所面临的核心权衡之一：虽然可以获得最大的灵活性，但必须牺牲一致性和可预测性。对于那些需要始终保持可靠性的用户界面来说，采用控制性或声明式的方法更为合适。
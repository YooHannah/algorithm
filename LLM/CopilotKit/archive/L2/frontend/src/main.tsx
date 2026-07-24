import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { CopilotKit } from "@copilotkit/react-core/v2";
import App from "./App";

import "./globals.css";
import "@copilotkit/react-core/v2/styles.css";

// 通过CopilotKit provider runtimeUrl 连接到agent
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="h-screen w-screen">
      <CopilotKit runtimeUrl="/api/copilotkit" useSingleEndpoint={false}>
        <App />
      </CopilotKit>
    </main>
  </StrictMode>,
);
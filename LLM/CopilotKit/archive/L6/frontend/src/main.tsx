import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CopilotKit } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { ErrorBoundary } from "./error-boundary";
import "./globals.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <CopilotKit runtimeUrl="/api/copilotkit" useSingleEndpoint={false}>
        <App />
      </CopilotKit>
    </ErrorBoundary>
  </StrictMode>,
);

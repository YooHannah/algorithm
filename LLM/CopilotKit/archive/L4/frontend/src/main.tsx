
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CopilotKit } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { demonstrationCatalog } from "./catalog/renderers";
import "./globals.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="h-screen w-screen">
      <CopilotKit
        useSingleEndpoint={false}
        runtimeUrl="/api/copilotkit"

        // 🪁 Enable A2UI using the demonstration catalog
        a2ui={{ catalog: demonstrationCatalog }}
      >
        <App />
      </CopilotKit>
    </main>
  </StrictMode>,
);

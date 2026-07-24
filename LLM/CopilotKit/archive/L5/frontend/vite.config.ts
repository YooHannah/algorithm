import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["@ag-ui/client", "fast-json-patch"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    strictPort: true,
    proxy: {
      "/api/copilotkit": "http://localhost:4005",
    },
    watch: {
      ignored: ["**/dev-logs.txt"],
    },
  },
});

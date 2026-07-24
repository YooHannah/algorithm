import { CopilotChat } from "@copilotkit/react-core/v2";

export const agentId = "default";

export default function App() {
  return <CopilotChat agentId={agentId} />;
}

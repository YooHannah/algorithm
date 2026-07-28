import { CopilotChat } from "@copilotkit/react-core/v2";

export const agentId = "ark"; // 指定用哪个agent

export default function App() {
  return <CopilotChat agentId={agentId} />;
}
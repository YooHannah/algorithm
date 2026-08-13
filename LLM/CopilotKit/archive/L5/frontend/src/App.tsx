import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";

export const agentId = "default";

export default function App() {
  const agent = useAgent();
  console.log('agent', agent?.agent?.messages);
  return <CopilotChat agentId={agentId} />;
}
import { useExampleDynamicSuggestions, useExampleFixedSuggestions } from "@/hooks/use-example-suggestions";
import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";

export default function App() {
  const agent = useAgent();
  console.log('agent', agent?.agent?.messages);
  useExampleDynamicSuggestions();
  useExampleFixedSuggestions();
  return <CopilotChat />;
}
import { useExampleDynamicSuggestions, useExampleFixedSuggestions } from "@/hooks/use-example-suggestions";
import { CopilotChat } from "@copilotkit/react-core/v2";

export default function App() {
  useExampleDynamicSuggestions();
  useExampleFixedSuggestions();
  return <CopilotChat />;
}
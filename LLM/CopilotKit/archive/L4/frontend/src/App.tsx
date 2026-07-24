
import { CopilotChat } from "@copilotkit/react-core/v2";
import { useExampleSuggestions } from "@/hooks/use-example-suggestions";

export default function App() {
  useExampleSuggestions();
  return <CopilotChat />;
}

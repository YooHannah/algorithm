import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export const useExampleSuggestions = () => {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Add todos",
        message: "Add three todos about learning CopilotKit",
      },
      {
        title: "Check my list",
        message: "What's on my todo list right now?",
      },
      {
        title: "Wrap up",
        message: "Mark all todos as completed and summarize what we did.",
      },
    ],
    available: "always",
  });
};

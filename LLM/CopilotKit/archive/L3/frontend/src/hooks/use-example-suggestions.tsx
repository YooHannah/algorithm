import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export const useExampleSuggestions = () => {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Show my name",
        message:
          "Please show my name in the chat.",
      },
      {
        title: "Pie chart",
        message:
          "Please show me the distribution of our revenue by category in a pie chart.",
      },
      {
        title: "Flight card",
        message:
          "Show a flight card for Pacific Air from SFO to JFK departing at 08:30 for $249.",
      },
    ],
    available: "always",
  });
};

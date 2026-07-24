import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export const useExampleDynamicSuggestions = () => {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Sales Dashboard",
        message:
          "Show me a sales dashboard with total revenue, new customers, and conversion rate metrics. Include a pie chart of revenue by category and a bar chart of monthly sales.",
      },
    ],
    available: "always",
  });
};


export const useExampleFixedSuggestions = () => {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Search flights",
        message:
          "Find flights from San Francisco (SFO) to New York (JFK) for next Friday. Show me options from different airlines.",
      },
    ],
    available: "always",
  });
};

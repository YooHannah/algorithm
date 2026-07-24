import { z } from "zod"
import { CopilotChat } from "@copilotkit/react-core/v2";
import { useComponent } from "@copilotkit/react-core/v2";

import { FlightCard, FlightCardProps } from "@/components/flight-card";
import { PieChart, PieChartProps } from "@/components/pie-chart";

import { useExampleSuggestions } from "@/hooks/use-example-suggestions";

export default function App() {

  // 🪁 Register a component that shows the name of the user
  useComponent({
    name: "showMyName",
    description: "Show the user's name in a card",
    parameters: z.object({ name: z.string() }),
    render: ({ name }) => <div className="bg-blue-500 p-4">Hi, {name}!</div>,
  });

  // 🪁 Resgister a pieChart component to show structured data
  useComponent({
    name: "pieChart",
    description: "Controlled Generative UI that displays data as a pie chart.",
    parameters: PieChartProps,
    render: PieChart,
  });

  // 🪁 Resgister a flightCard component to show flight data
  useComponent({
    name: "flightCard",
    description: "Controlled Generative UI that displays a single flight summary card.",
    parameters: FlightCardProps,
    render: FlightCard,
  });

  // 🪁 Add suggestions to our CopilotChat, will display through buttons
  useExampleSuggestions();

  return <CopilotChat />;

};

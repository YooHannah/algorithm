import { z } from "zod"
import { useComponent, useDefaultRenderTool } from "@copilotkit/react-core/v2";
import { BarChart, BarChartProps } from "@/components/bar-chart";
import { FlightCard, FlightCardProps } from "@/components/flight-card";
import { PieChart, PieChartProps } from "@/components/pie-chart";

export const useControlledComponents = () => {

  useComponent({
    name: "showMyName",
    description: "Simplest example of Controlled Generative UI",
    parameters: z.object({ name: z.string() }),
    render: ({ name }) => <div className="bg-blue-500 p-4">Hi, {name}!</div>,
  });

  useComponent({
    name: "pieChart",
    description: "Controlled Generative UI that displays data as a pie chart.",
    parameters: PieChartProps,
    render: PieChart,
  });

  useComponent({
    name: "flightCard",
    description:
      "Controlled Generative UI that displays a single flight summary card.",
    parameters: FlightCardProps,
    render: FlightCard,
  });

};

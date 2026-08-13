import { z } from "zod"

import { FlightCard, FlightCardProps } from "@/components/flight-card";
import { PieChart, PieChartProps } from "@/components/pie-chart";
import { useExampleSuggestions } from "@/hooks/use-example-suggestions";
import { CopilotChat, useCopilotKit } from "@copilotkit/react-core/v2";
import { useComponent, useAgent } from "@copilotkit/react-core/v2";

/************ 使用useComponent 注册组件 ************ */
/*
 * 将react 组件直接注册为 a generative UI tool ，在响应中直接渲染组件
 * 注册组件[useComponent](https://docs.copilotkit.ai/generative-ui/your-components/display-only) 
registers a React component as a tool the agent can call inside `<CopilotChat />`. 
You define what's available; the agent picks when to use it.
useComponent({
  name: "component_name",
  description: "description for the agent to know about this component",
  parameters: z.object({ ... }),
  render: MyComponent,
});

- `name` (required `string`): tool name exposed to the model.
- `description` (optional `string`): tells the model when to call this tool.
- `parameters` (optional Zod schema): structured props passed in as arguments.
- `render` (required): a React component (rendered as `<Component {...args} />`), or a function receiving `{ args, status }` for custom rendering (loading states, wrappers, conditional display).
 */
export default function App() {
  const agent = useAgent();
  console.log('agent', agent?.agent?.messages);

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

  return <>
  <CopilotChat />
  </>;

};
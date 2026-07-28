import { useState } from "react";
import { z } from "zod"

import { TodoAppLayout } from "@/components/todo-app-layout";
import { TodoList } from "@/components/todo-list";
import { CopilotChat, useAgent, useFrontendTool } from "@copilotkit/react-core/v2";

/**
 * useAgent() gives you a live handle to the agent's shared state: agent.state.todos reflects the current list, and agent.setState({ todos: updated }) pushes changes back.
 * useFrontendTool registers a tool that runs in the browser — the agent calls it like any backend tool, but the handler executes client-side and can update React state directly.
 */
export default function App() {
  const [todosOpen, setTodosOpen] = useState(false);

  // 🪁 Register a frontend tool the agent can call to control the UI
  useFrontendTool({
    name: "openOrCloseTodos",
    description: "Open or close the todo panel.",
    parameters: z.object({ open: z.boolean()}),
    handler: async ({open}) => {
      setTodosOpen(open);
      return `Todos are ${ open ? 'open' : 'closed'}.`;
    },
  });

  // 🪁 Subscribe to shared agent state
  const { agent } = useAgent();

  return (
    <TodoAppLayout
      chat={<CopilotChat />}
      open={todosOpen}
      onOpenChange={setTodosOpen}
      panel={(onClose) => (
        <TodoList
          // 🪁 Read shared state
          todos={agent.state.todos || []} 

          // 🪁 Write shared state
          onUpdate={(updated) => agent.setState({ todos: updated })}

          isRunning={agent.isRunning}
          onClose={onClose}
        />
      )}
    />
  );
}
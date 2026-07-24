import { useRef } from "react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

type TodoListProps = {
  todos: Todo[];
  onUpdate: (todos: Todo[]) => void;
  isRunning: boolean;
  onClose?: () => void;
};

export function TodoList({ todos, onUpdate, isRunning, onClose }: TodoListProps) {
  const pending = todos.filter((t) => !t.completed);
  const done = todos.filter((t) => t.completed);

  const addTodo = () => {
    onUpdate([
      ...todos,
      {
        id: crypto.randomUUID(),
        title: "New Todo",
        completed: false,
      },
    ]);
  };

  const toggleTodo = (id: string) => {
    onUpdate(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTodo = (id: string) => {
    onUpdate(todos.filter((t) => t.id !== id));
  };

  const renameTodo = (id: string, title: string) => {
    if (title.trim()) {
      onUpdate(todos.map((t) => (t.id === id ? { ...t, title: title.trim() } : t)));
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b-1 border-rose-300 ">
        <span className="text-sm font-medium text-red-500 tracking-wider">Todos</span>
        <div className="flex items-center gap-1 ml-auto">
          <button
            className="cursor-pointer inline-flex items-center justify-center rounded-md bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 h-7 w-7 text-sm transition-colors disabled:opacity-40 disabled:cursor-default"
            onClick={addTodo}
            disabled={isRunning}
            type="button"
            aria-label="Add todo"
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
            </svg>
          </button>
          {onClose && (
            <button
              className="cursor-pointer inline-flex items-center justify-center rounded-md bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 h-7 w-7 transition-colors"
              onClick={onClose}
              type="button"
              aria-label="Close panel"
            >
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-base text-zinc-400">
          No todos yet
          <button
            className="cursor-pointer rounded-md bg-red-50 text-red-500 px-4 py-2 text-sm font-medium hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-default"
            onClick={addTodo}
            disabled={isRunning}
            type="button"
          >
            Add a task
          </button>
        </div>
      ) : (
        <>
          <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
            {pending.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => toggleTodo(todo.id)}
                onDelete={() => deleteTodo(todo.id)}
                onRename={(title) => renameTodo(todo.id, title)}
              />
            ))}
            {pending.length === 0 && (
              <li className="text-center text-sm text-zinc-400 py-6">All done</li>
            )}
          </ul>

          {done.length > 0 && (
            <div className="mt-auto pt-4 border-t border-zinc-200">
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Done</span>
              <ul className="list-none m-0 mt-2 p-0 flex flex-col gap-0.5">
                {done.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    done
                    onToggle={() => toggleTodo(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onRename={(title) => renameTodo(todo.id, title)}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TodoItem({ todo, done, onToggle, onDelete, onRename }: {
  todo: { id: string; title: string; completed: boolean };
  done?: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);

  return (
    <li className={`group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 hover:bg-white hover:border-red-300 transition-colors ${done ? "opacity-50" : ""}`}>
      <button
        className={`cursor-pointer w-5 h-5 rounded border shrink-0 p-0 flex items-center justify-center transition-colors ${
          done
            ? "border-red-500 bg-red-500 text-white text-[11px] font-bold"
            : "border-zinc-400 bg-white hover:border-red-400"
        }`}
        onClick={onToggle}
        type="button"
        aria-label={done ? "Mark active" : "Mark done"}
      >
        {done && "✓"}
      </button>
      <span
        ref={spanRef}
        className={`text-base flex-1 min-w-0 outline-none ${done ? "line-through text-zinc-400" : "text-zinc-900"}`}
        contentEditable={!done}
        suppressContentEditableWarning
        onBlur={() => {
          const text = spanRef.current?.textContent ?? "";
          onRename(text);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            spanRef.current?.blur();
          }
        }}
      >
        {todo.title}
      </span>
      <button
        className="cursor-pointer bg-transparent border-none text-zinc-300 hover:text-zinc-600 text-sm p-1 opacity-0 group-hover:opacity-100 transition-all"
        onClick={onDelete}
        type="button"
      >
        ✕
      </button>
    </li>
  );
}

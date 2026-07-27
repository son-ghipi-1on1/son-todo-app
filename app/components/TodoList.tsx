import type { Todo, TodoTab } from "@/lib/types";
import TodoItem from "./TodoItem";

const EMPTY_MESSAGE: Record<TodoTab, string> = {
  todo: "未完了のタスクはありません。新しいタスクを追加しましょう。",
  done: "完了済みのタスクはまだありません。",
};

function EmptyIcon({ activeTab }: { activeTab: TodoTab }) {
  if (activeTab === "done") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
        className="h-10 w-10 text-zinc-300 dark:text-zinc-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 9h16.5m-16.5 0a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h16.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5m-16.5 0V6.75A1.5 1.5 0 0 1 5.25 5.25h13.5a1.5 1.5 0 0 1 1.5 1.5V9"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      className="h-10 w-10 text-zinc-300 dark:text-zinc-700"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

export default function TodoList({
  todos,
  activeTab,
}: {
  todos: Todo[];
  activeTab: TodoTab;
}) {
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <EmptyIcon activeTab={activeTab} />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {EMPTY_MESSAGE[activeTab]}
        </p>
      </div>
    );
  }

  return (
    <ul className="py-1">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} activeTab={activeTab} />
      ))}
    </ul>
  );
}

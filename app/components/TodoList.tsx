import type { Todo, TodoTab } from "@/lib/types";
import TodoItem from "./TodoItem";

const EMPTY_MESSAGE: Record<TodoTab, string> = {
  todo: "未完了のタスクはありません。新しいタスクを追加しましょう。",
  done: "完了済みのタスクはまだありません。",
};

export default function TodoList({
  todos,
  activeTab,
}: {
  todos: Todo[];
  activeTab: TodoTab;
}) {
  if (todos.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500 dark:text-zinc-400">
        {EMPTY_MESSAGE[activeTab]}
      </p>
    );
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} activeTab={activeTab} />
      ))}
    </ul>
  );
}

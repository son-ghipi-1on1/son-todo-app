import { getTodos } from "@/lib/supabase";
import { resolveSortOrder, resolveTodoTab } from "@/lib/types";
import SortSelect from "@/app/components/SortSelect";
import TabSwitcher from "@/app/components/TabSwitcher";
import TodoForm from "@/app/components/TodoForm";
import TodoList from "@/app/components/TodoList";

export default async function Home(props: PageProps<"/">) {
  const { tab, sort } = await props.searchParams;
  const activeTab = resolveTodoTab(tab);
  const activeSort = resolveSortOrder(sort);

  const todos = await getTodos(activeSort);
  const todoTodos = todos.filter((todo) => !todo.is_done);
  const doneTodos = todos.filter((todo) => todo.is_done);
  const visibleTodos = activeTab === "done" ? doneTodos : todoTodos;

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-2xl px-4 py-10 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-black dark:text-zinc-50">
          Todo
        </h1>
        <TodoForm />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabSwitcher
            activeTab={activeTab}
            sort={activeSort}
            todoCount={todoTodos.length}
            doneCount={doneTodos.length}
          />
          <SortSelect tab={activeTab} sort={activeSort} />
        </div>
        <div className="mt-4 rounded-2xl bg-white px-4 dark:bg-zinc-900">
          <TodoList todos={visibleTodos} activeTab={activeTab} />
        </div>
      </main>
    </div>
  );
}

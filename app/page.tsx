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
    <div className="relative flex flex-1 justify-center overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-10 dark:from-zinc-950 dark:via-black dark:to-black sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-600/10"
      />

      <main className="relative w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Todo
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            今日やることを、ひとつずつ片づけよう。
          </p>
        </header>

        <TodoForm />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabSwitcher
            activeTab={activeTab}
            sort={activeSort}
            todoCount={todoTodos.length}
            doneCount={doneTodos.length}
          />
          <SortSelect tab={activeTab} sort={activeSort} />
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/80 px-4 shadow-sm shadow-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60">
          <TodoList todos={visibleTodos} activeTab={activeTab} />
        </div>
      </main>
    </div>
  );
}

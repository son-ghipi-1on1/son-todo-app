"use client";

import Link from "next/link";
import type { SortOrder, TodoTab } from "@/lib/types";

const TABS: { tab: TodoTab; label: string }[] = [
  { tab: "todo", label: "未完了" },
  { tab: "done", label: "完了済み" },
];

export default function TabSwitcher({
  activeTab,
  sort,
  todoCount,
  doneCount,
}: {
  activeTab: TodoTab;
  sort: SortOrder;
  todoCount: number;
  doneCount: number;
}) {
  const counts: Record<TodoTab, number> = {
    todo: todoCount,
    done: doneCount,
  };

  return (
    <div
      role="tablist"
      aria-label="タスクの表示切り替え"
      className="flex flex-wrap gap-1 rounded-full bg-zinc-100 p-1 dark:bg-white/5"
    >
      {TABS.map(({ tab, label }) => {
        const isActive = tab === activeTab;
        const params = new URLSearchParams();
        if (tab === "done") params.set("tab", "done");
        if (sort === "created_at") params.set("sort", "created_at");
        const query = params.toString();

        return (
          <Link
            key={tab}
            href={query ? `/?${query}` : "/"}
            role="tab"
            aria-selected={isActive}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                isActive
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
                  : "bg-zinc-200/70 text-zinc-500 dark:bg-white/10 dark:text-zinc-400"
              }`}
            >
              {counts[tab]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

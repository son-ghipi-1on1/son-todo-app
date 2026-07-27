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
      className="flex flex-wrap gap-2"
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
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-black/5 text-zinc-700 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-70">
              {counts[tab]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

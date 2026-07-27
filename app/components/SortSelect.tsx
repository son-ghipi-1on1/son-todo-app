"use client";

import { useRouter } from "next/navigation";
import type { SortOrder, TodoTab } from "@/lib/types";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "due_date", label: "期限が近い順" },
  { value: "created_at", label: "作成が新しい順" },
];

export default function SortSelect({
  tab,
  sort,
}: {
  tab: TodoTab;
  sort: SortOrder;
}) {
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextSort = event.target.value as SortOrder;
    const params = new URLSearchParams();

    if (tab === "done") {
      params.set("tab", "done");
    }
    if (nextSort === "created_at") {
      params.set("sort", "created_at");
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div className="relative">
      <select
        value={sort}
        onChange={handleChange}
        aria-label="並び替え"
        className="appearance-none rounded-full border border-black/10 bg-white py-1.5 pr-8 pl-3 text-sm text-zinc-600 shadow-sm transition-colors hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/50 dark:focus:ring-indigo-500/20"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-zinc-400"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.148l3.71-3.918a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

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
    <select
      value={sort}
      onChange={handleChange}
      aria-label="並び替え"
      className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm dark:border-white/10 dark:bg-zinc-900"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

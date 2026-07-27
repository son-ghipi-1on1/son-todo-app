export type Todo = {
  id: string;
  title: string;
  is_done: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type TodoTab = "todo" | "done";

export function resolveTodoTab(tab: string | string[] | undefined): TodoTab {
  return tab === "done" ? "done" : "todo";
}

export type SortOrder = "due_date" | "created_at";

export function resolveSortOrder(
  sort: string | string[] | undefined,
): SortOrder {
  return sort === "created_at" ? "created_at" : "due_date";
}

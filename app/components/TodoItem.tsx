"use client";

import {
  useOptimistic,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { deleteTodo, toggleTodo, updateTodo } from "@/app/actions";
import type { Todo, TodoTab } from "@/lib/types";

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "期限なし";
  const [year, month, day] = dueDate.split("-");
  return `${year}/${Number(month)}/${Number(day)}`;
}

function todayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// The system clock isn't a reactive store, so there is nothing to
// subscribe to; this hook is used purely to defer reading "today" until
// after hydration, avoiding a server/client mismatch from timezone drift.
function subscribeNever(): () => void {
  return () => {};
}

function getServerToday(): string | null {
  return null;
}

type DueStatus = "overdue" | "today" | "soon" | "later" | "none" | "unknown";

function getDueStatus(dueDate: string | null, today: string | null): DueStatus {
  if (!dueDate) return "none";
  if (!today) return "unknown";
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";

  const [ty, tm, td] = today.split("-").map(Number);
  const [dy, dmo, dd] = dueDate.split("-").map(Number);
  const todayMs = new Date(ty, tm - 1, td).getTime();
  const dueMs = new Date(dy, dmo - 1, dd).getTime();
  const diffDays = Math.round((dueMs - todayMs) / 86400000);

  return diffDays <= 3 ? "soon" : "later";
}

const DUE_STATUS_CLASSNAME: Record<DueStatus, string> = {
  overdue: "font-medium text-red-600 dark:text-red-400",
  today: "font-medium text-orange-600 dark:text-orange-400",
  soon: "font-bold",
  later: "",
  none: "text-zinc-400 dark:text-zinc-500",
  unknown: "",
};

export default function TodoItem({
  todo,
  activeTab,
}: {
  todo: Todo;
  activeTab: TodoTab;
}) {
  const [optimisticIsDone, setOptimisticIsDone] = useOptimistic(
    todo.is_done,
    (_state: boolean, next: boolean) => next,
  );
  const [, startToggleTransition] = useTransition();

  // Read only after hydration so due-date status always reflects the
  // viewer's local date rather than the server's timezone.
  const today = useSyncExternalStore(
    subscribeNever,
    todayLocalDateString,
    getServerToday,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const [draftDueDate, setDraftDueDate] = useState(todo.due_date ?? "");
  const [editError, setEditError] = useState<string | null>(null);
  const [, startSaveTransition] = useTransition();
  const [, startDeleteTransition] = useTransition();

  const isEditingRef = useRef(false);
  const skipBlurCommitRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleToggle() {
    const next = !optimisticIsDone;
    startToggleTransition(async () => {
      setOptimisticIsDone(next);
      try {
        await toggleTodo(todo.id, next);
      } catch {
        // toggleTodo failed: the underlying `todo.is_done` prop never
        // changes, so the optimistic value reverts once this transition
        // settles.
      }
    });
  }

  function startEditing() {
    setDraftTitle(todo.title);
    setDraftDueDate(todo.due_date ?? "");
    setEditError(null);
    isEditingRef.current = true;
    setIsEditing(true);
  }

  function cancelEditing() {
    isEditingRef.current = false;
    skipBlurCommitRef.current = true;
    setEditError(null);
    setIsEditing(false);
  }

  function commitEditing() {
    if (!isEditingRef.current) return;

    const title = draftTitle;
    const dueDate = draftDueDate === "" ? null : draftDueDate;

    startSaveTransition(async () => {
      const result = await updateTodo(todo.id, title, dueDate);
      if (result.error) {
        setEditError(result.error);
        return;
      }
      isEditingRef.current = false;
      setEditError(null);
      setIsEditing(false);
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteTodo(todo.id);
    });
  }

  function handleEditKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEditing();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  function handleContainerBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false;
      return;
    }
    if (containerRef.current?.contains(event.relatedTarget as Node | null)) {
      return;
    }
    commitEditing();
  }

  const belongsToActiveTab =
    activeTab === "done" ? optimisticIsDone : !optimisticIsDone;

  if (!belongsToActiveTab) {
    return null;
  }

  if (isEditing) {
    return (
      <li className="border-b border-black/10 py-3 last:border-b-0 dark:border-white/10">
        <div
          ref={containerRef}
          onBlur={handleContainerBlur}
          className="flex items-center gap-3"
        >
          <input
            type="checkbox"
            checked={optimisticIsDone}
            disabled
            aria-label={`${todo.title}を${optimisticIsDone ? "未完了" : "完了"}にする`}
            className="h-5 w-5 shrink-0 opacity-50"
          />
          <div className="flex flex-1 flex-col gap-1">
            <input
              type="text"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onKeyDown={handleEditKeyDown}
              maxLength={200}
              autoFocus
              aria-label="タスク名"
              aria-invalid={editError ? true : undefined}
              aria-describedby={editError ? `${todo.id}-edit-error` : undefined}
              className="w-full rounded border border-black/20 bg-white px-2 py-1 text-sm dark:border-white/20 dark:bg-zinc-900"
            />
            {editError && (
              <p
                id={`${todo.id}-edit-error`}
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {editError}
              </p>
            )}
          </div>
          <input
            type="date"
            value={draftDueDate}
            onChange={(event) => setDraftDueDate(event.target.value)}
            onKeyDown={handleEditKeyDown}
            aria-label="期限日"
            className="shrink-0 rounded border border-black/20 bg-white px-2 py-1 text-sm dark:border-white/20 dark:bg-zinc-900"
          />
        </div>
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-3 border-b border-black/10 py-3 last:border-b-0 dark:border-white/10">
      <input
        type="checkbox"
        checked={optimisticIsDone}
        onChange={handleToggle}
        aria-label={`${todo.title}を${optimisticIsDone ? "未完了" : "完了"}にする`}
        className="h-5 w-5 shrink-0"
      />
      <button
        type="button"
        onClick={startEditing}
        className={`flex-1 truncate border-0 bg-transparent p-0 text-left ${
          optimisticIsDone
            ? "text-zinc-400 line-through dark:text-zinc-500"
            : ""
        }`}
      >
        {todo.title}
      </button>
      <span
        className={`flex shrink-0 items-center gap-1 text-sm ${DUE_STATUS_CLASSNAME[getDueStatus(todo.due_date, today)]}`}
      >
        {getDueStatus(todo.due_date, today) === "overdue" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.198 0l6.517 11.26c1.155 2-.289 4.5-2.599 4.5H5.483c-2.31 0-3.754-2.5-2.599-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {formatDueDate(todo.due_date)}
      </span>
      <button
        type="button"
        onClick={handleDelete}
        aria-label={`${todo.title}を削除`}
        className="shrink-0 rounded p-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-red-600 focus-visible:opacity-100 dark:text-zinc-500 dark:hover:text-red-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.75 1a.75.75 0 0 0-.75.75V3H4a.75.75 0 0 0 0 1.5h.31l.68 10.2A2.25 2.25 0 0 0 7.24 17h5.52a2.25 2.25 0 0 0 2.25-2.3l.68-10.2H16A.75.75 0 0 0 16 3h-3.25V1.75a.75.75 0 0 0-.75-.75h-3.25Zm2.5 2V2.5h-2.5V3h2.5ZM8 7.25a.75.75 0 0 1 1.5 0v6.5a.75.75 0 0 1-1.5 0v-6.5Zm3.5 0a.75.75 0 0 1 1.5 0v6.5a.75.75 0 0 1-1.5 0v-6.5Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </li>
  );
}

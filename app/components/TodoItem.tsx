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
  const [, month, day] = dueDate.split("-");
  return `${Number(month)}/${Number(day)}`;
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
  overdue:
    "rounded-full bg-red-50 px-2.5 py-1 font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400",
  today:
    "rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  soon: "rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
  later: "px-1 text-zinc-500 dark:text-zinc-400",
  none: "px-1 text-zinc-400 dark:text-zinc-500",
  unknown: "px-1 text-zinc-500 dark:text-zinc-400",
};

function Checkbox({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <label className="relative flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={label}
        className="peer absolute inset-0 h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-zinc-300 transition-colors checked:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600"
      />
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 opacity-0 transition-opacity peer-checked:opacity-100" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none relative h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
      >
        <path
          fillRule="evenodd"
          d="M16.704 5.29a.75.75 0 0 1 .006 1.06l-7.25 7.5a.75.75 0 0 1-1.073.006l-3.25-3.25a.75.75 0 1 1 1.06-1.06l2.72 2.72 6.716-6.945a.75.75 0 0 1 1.071-.03Z"
          clipRule="evenodd"
        />
      </svg>
      <span className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-indigo-400 opacity-0 peer-focus-visible:opacity-100" />
    </label>
  );
}

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
      <li className="border-b border-black/5 py-2.5 last:border-b-0 dark:border-white/10">
        <div
          ref={containerRef}
          onBlur={handleContainerBlur}
          className="flex items-center gap-3"
        >
          <Checkbox
            checked={optimisticIsDone}
            disabled
            label={`${todo.title}を${optimisticIsDone ? "未完了" : "完了"}にする`}
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
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:focus:ring-indigo-500/20"
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
            className="shrink-0 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none dark:border-white/10 dark:bg-zinc-900 dark:focus:ring-indigo-500/20"
          />
        </div>
      </li>
    );
  }

  return (
    <li className="group -mx-2 flex items-center gap-3 rounded-xl border-b border-black/5 px-2 py-2.5 transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5">
      <Checkbox
        checked={optimisticIsDone}
        onChange={handleToggle}
        label={`${todo.title}を${optimisticIsDone ? "未完了" : "完了"}にする`}
      />
      <button
        type="button"
        onClick={startEditing}
        className={`flex-1 truncate rounded-lg border-0 bg-transparent py-0.5 text-left transition-colors ${
          optimisticIsDone
            ? "text-zinc-400 line-through dark:text-zinc-500"
            : "text-zinc-800 dark:text-zinc-100"
        }`}
      >
        {todo.title}
      </button>
      <span
        className={`flex shrink-0 items-center gap-1 text-xs ${DUE_STATUS_CLASSNAME[getDueStatus(todo.due_date, today)]}`}
      >
        {getDueStatus(todo.due_date, today) === "overdue" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 shrink-0"
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
        className="shrink-0 rounded-full p-1.5 text-zinc-400 opacity-0 transition-all group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 dark:text-zinc-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
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

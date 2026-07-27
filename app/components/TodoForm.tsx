"use client";

import { useActionState, useState } from "react";
import { createTodo, type CreateTodoState } from "@/app/actions";

const initialState: CreateTodoState = { error: null };

function validateTitle(title: string): string | null {
  if (title.trim().length === 0) {
    return "タイトルを入力してください。";
  }
  if (title.length > 200) {
    return "タイトルは200文字以内で入力してください。";
  }
  return null;
}

export default function TodoForm() {
  const [state, formAction, pending] = useActionState(
    createTodo,
    initialState,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const errorMessage = clientError ?? state.error;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "");
    const validationError = validateTitle(title);

    if (validationError) {
      event.preventDefault();
      setClientError(validationError);
      return;
    }

    setClientError(null);
  }

  return (
    <div className="mb-5">
      <form
        action={formAction}
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-white/70 p-2 shadow-sm shadow-black/5 backdrop-blur-sm sm:flex-row sm:items-center dark:border-white/10 dark:bg-zinc-900/70"
      >
        <div className="flex flex-1 items-center gap-2 px-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 shrink-0 text-indigo-400 dark:text-indigo-500"
            aria-hidden="true"
          >
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          <label htmlFor="todo-title" className="sr-only">
            タスク名
          </label>
          <input
            id="todo-title"
            type="text"
            name="title"
            maxLength={200}
            placeholder="タスクを追加"
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={errorMessage ? "todo-title-error" : undefined}
            className="w-full bg-transparent py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
        <input
          type="date"
          name="due_date"
          aria-label="期限日"
          className="shrink-0 rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm text-zinc-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-white/10 dark:text-zinc-300 dark:focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          追加
        </button>
      </form>
      {errorMessage && (
        <p
          id="todo-title-error"
          role="alert"
          className="mt-1.5 pl-2 text-sm text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

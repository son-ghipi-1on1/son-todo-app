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
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
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
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
        />
        {errorMessage && (
          <p
            id="todo-title-error"
            role="alert"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {errorMessage}
          </p>
        )}
      </div>
      <input
        type="date"
        name="due_date"
        aria-label="期限日"
        className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        追加
      </button>
    </form>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export type CreateTodoState = {
  error: string | null;
};

export async function createTodo(
  _prevState: CreateTodoState,
  formData: FormData,
): Promise<CreateTodoState> {
  const rawTitle = formData.get("title");
  const rawDueDate = formData.get("due_date");

  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const dueDate =
    typeof rawDueDate === "string" && rawDueDate !== "" ? rawDueDate : null;

  if (title.length === 0) {
    return { error: "タイトルを入力してください。" };
  }
  if (title.length > 200) {
    return { error: "タイトルは200文字以内で入力してください。" };
  }

  const { error } = await supabase
    .from("todos")
    .insert({ title, due_date: dueDate });

  if (error) {
    throw error;
  }

  revalidatePath("/");

  return { error: null };
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
}

export async function toggleTodo(id: string, isDone: boolean): Promise<void> {
  const { error } = await supabase
    .from("todos")
    .update({ is_done: isDone })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");
}

export type UpdateTodoResult = {
  error: string | null;
};

export async function updateTodo(
  id: string,
  title: string,
  dueDate: string | null,
): Promise<UpdateTodoResult> {
  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    return { error: "タイトルを入力してください。" };
  }
  if (trimmedTitle.length > 200) {
    return { error: "タイトルは200文字以内で入力してください。" };
  }

  const { error } = await supabase
    .from("todos")
    .update({ title: trimmedTitle, due_date: dueDate })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/");

  return { error: null };
}

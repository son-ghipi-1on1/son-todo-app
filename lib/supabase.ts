import { createClient } from "@supabase/supabase-js";
import type { SortOrder, Todo } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getTodos(sort: SortOrder = "due_date"): Promise<Todo[]> {
  const baseQuery = supabase.from("todos").select("*");

  const { data, error } =
    sort === "created_at"
      ? await baseQuery.order("created_at", { ascending: false })
      : await baseQuery
          .order("due_date", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

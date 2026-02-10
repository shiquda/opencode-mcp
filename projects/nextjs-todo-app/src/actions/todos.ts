"use server";

import { revalidatePath } from "next/cache";
import {
  createTodo as dbCreateTodo,
  updateTodo as dbUpdateTodo,
  deleteTodo as dbDeleteTodo,
  bulkMarkDone as dbBulkMarkDone,
  bulkDelete as dbBulkDelete,
} from "@/db/todos";
import type { CreateTodoInput, UpdateTodoInput } from "@/lib/types";

export async function createTodoAction(input: CreateTodoInput) {
  dbCreateTodo(input);
  revalidatePath("/");
}

export async function updateTodoAction(id: number, patch: UpdateTodoInput) {
  dbUpdateTodo(id, patch);
  revalidatePath("/");
}

export async function deleteTodoAction(id: number) {
  dbDeleteTodo(id);
  revalidatePath("/");
}

export async function bulkMarkDoneAction(ids: number[]) {
  dbBulkMarkDone(ids);
  revalidatePath("/");
}

export async function bulkDeleteAction(ids: number[]) {
  dbBulkDelete(ids);
  revalidatePath("/");
}

export async function upsertTodoAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const idRaw = fd.get("id");
  const title = (fd.get("title") as string | null)?.trim() ?? "";
  const description = (fd.get("description") as string | null)?.trim() || null;
  const priority = (fd.get("priority") as string | null) ?? "medium";
  const status = (fd.get("status") as string | null) ?? "pending";
  const dueDateRaw = (fd.get("due_date") as string | null)?.trim() || null;

  if (!title) return { ok: false, error: "Title is required." };

  try {
    if (idRaw) {
      const id = Number(idRaw);
      if (Number.isNaN(id)) return { ok: false, error: "Invalid todo ID." };
      dbUpdateTodo(id, {
        title,
        description,
        priority: priority as CreateTodoInput["priority"],
        status: status as CreateTodoInput["status"],
        due_date: dueDateRaw as CreateTodoInput["due_date"],
      });
    } else {
      dbCreateTodo({
        title,
        description,
        priority: priority as CreateTodoInput["priority"],
        status: status as CreateTodoInput["status"],
        due_date: dueDateRaw as CreateTodoInput["due_date"],
      });
    }

    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}

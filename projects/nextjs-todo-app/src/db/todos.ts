import { getDb } from "@/db/index";
import type {
  Todo,
  TodoCreateInput,
  TodoListParams,
  TodoPriority,
  TodoSortBy,
  TodoStatus,
  TodoUpdateInput,
} from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Todo {
  return {
    id: Number(row.id),
    title: String(row.title),
    description: row.description === null || row.description === undefined ? null : String(row.description),
    priority: row.priority as TodoPriority,
    status: row.status as TodoStatus,
    due_date: row.due_date === null || row.due_date === undefined ? null : (String(row.due_date) as Todo["due_date"]),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function getTodoById(id: number): Todo | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  return row ? mapRow(row) : null;
}

export function createTodo(input: TodoCreateInput): Todo {
  const db = getDb();

  const title = input.title.trim();
  if (!title) throw new Error("Title is required");

  const stmt = db.prepare(
    `INSERT INTO todos (title, description, priority, status, due_date)
     VALUES (@title, @description, @priority, @status, @due_date)`
  );

  const info = stmt.run({
    title,
    description: input.description ?? null,
    priority: input.priority ?? "medium",
    status: input.status ?? "pending",
    due_date: input.due_date ?? null,
  });

  const created = getTodoById(Number(info.lastInsertRowid));
  if (!created) throw new Error("Failed to create todo");
  return created;
}

export function updateTodo(id: number, patch: TodoUpdateInput): Todo {
  const db = getDb();

  const sets: string[] = [];
  const params: Record<string, unknown> = { id };

  if (patch.title !== undefined) {
    const title = patch.title.trim();
    if (!title) throw new Error("Title is required");
    sets.push("title = @title");
    params.title = title;
  }
  if (patch.description !== undefined) {
    sets.push("description = @description");
    params.description = patch.description;
  }
  if (patch.priority !== undefined) {
    sets.push("priority = @priority");
    params.priority = patch.priority;
  }
  if (patch.status !== undefined) {
    sets.push("status = @status");
    params.status = patch.status;
  }
  if (patch.due_date !== undefined) {
    sets.push("due_date = @due_date");
    params.due_date = patch.due_date;
  }

  if (sets.length === 0) {
    const existing = getTodoById(id);
    if (!existing) throw new Error("Todo not found");
    return existing;
  }

  sets.push("updated_at = CURRENT_TIMESTAMP");
  const sql = `UPDATE todos SET ${sets.join(", ")} WHERE id = @id`;
  const info = db.prepare(sql).run(params);
  if (info.changes === 0) throw new Error("Todo not found");

  const updated = getTodoById(id);
  if (!updated) throw new Error("Todo not found");
  return updated;
}

export function deleteTodo(id: number): boolean {
  const db = getDb();
  const info = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  return info.changes > 0;
}

function buildOrderBy(sortBy: TodoSortBy, sortDir: "asc" | "desc"): string {
  const dir = sortDir.toUpperCase();
  switch (sortBy) {
    case "created_at":
      return `created_at ${dir}, id ${dir}`;
    case "due_date":
      if (dir === "ASC") return "(due_date IS NULL) ASC, due_date ASC, created_at DESC";
      return "(due_date IS NULL) ASC, due_date DESC, created_at DESC";
    case "priority":
      return `CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 ELSE 0 END ${dir}, created_at DESC`;
  }

  return "created_at DESC";
}

export function listTodos(params: TodoListParams = {}): Todo[] {
  const db = getDb();

  const where: string[] = [];
  const bindings: Record<string, unknown> = {};

  if (params.status) {
    where.push("status = @status");
    bindings.status = params.status;
  }
  if (params.priority) {
    where.push("priority = @priority");
    bindings.priority = params.priority;
  }
  if (params.search && params.search.trim().length > 0) {
    where.push("(title LIKE @q COLLATE NOCASE OR description LIKE @q COLLATE NOCASE)");
    bindings.q = `%${params.search.trim()}%`;
  }

  const sortBy = params.sortBy ?? "created_at";
  const sortDir = params.sortDir ?? "desc";
  const orderBy = buildOrderBy(sortBy, sortDir);

  const sql = `SELECT * FROM todos${where.length ? " WHERE " + where.join(" AND ") : ""} ORDER BY ${orderBy}`;
  const rows = db.prepare(sql).all(bindings);
  return rows.map(mapRow);
}

export function bulkMarkDone(ids: number[]): number {
  if (ids.length === 0) return 0;
  const db = getDb();
  const placeholders = ids.map(() => "?").join(",");
  const sql = `UPDATE todos SET status = 'done', updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`;
  const info = db.prepare(sql).run(...ids);
  return info.changes;
}

export function bulkDelete(ids: number[]): number {
  if (ids.length === 0) return 0;
  const db = getDb();
  const placeholders = ids.map(() => "?").join(",");
  const sql = `DELETE FROM todos WHERE id IN (${placeholders})`;
  const info = db.prepare(sql).run(...ids);
  return info.changes;
}

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { __resetDbForTests } from "@/db/index";
import {
  bulkDelete,
  bulkMarkDone,
  createTodo,
  deleteTodo,
  getTodoById,
  listTodos,
  updateTodo,
} from "@/db/todos";

beforeEach(() => {
  process.env.TODO_DB_PATH = ":memory:";
  __resetDbForTests();
});

afterEach(() => {
  __resetDbForTests();
  delete process.env.TODO_DB_PATH;
});

describe("db/todos", () => {
  it("creates a todo with defaults", () => {
    const todo = createTodo({ title: "Test" });
    expect(todo.id).toBe(1);
    expect(todo.title).toBe("Test");
    expect(todo.description).toBeNull();
    expect(todo.priority).toBe("medium");
    expect(todo.status).toBe("pending");
    expect(todo.due_date).toBeNull();
  });

  it("trims title on create", () => {
    const todo = createTodo({ title: "  Trim me  " });
    expect(todo.title).toBe("Trim me");
  });

  it("gets todo by id", () => {
    const created = createTodo({ title: "Find me" });
    const found = getTodoById(created.id);
    expect(found?.id).toBe(created.id);
    expect(found?.title).toBe("Find me");
  });

  it("returns null for missing id", () => {
    expect(getTodoById(999)).toBeNull();
  });

  it("lists todos and supports search (title + description)", () => {
    createTodo({ title: "Buy groceries" });
    createTodo({ title: "Read", description: "Read a book" });
    createTodo({ title: "Workout" });

    const byTitle = listTodos({ search: "Buy" });
    expect(byTitle).toHaveLength(1);
    expect(byTitle[0].title).toBe("Buy groceries");

    const byDesc = listTodos({ search: "book" });
    expect(byDesc).toHaveLength(1);
    expect(byDesc[0].title).toBe("Read");
  });

  it("filters by status and priority", () => {
    createTodo({ title: "A", status: "pending", priority: "low" });
    createTodo({ title: "B", status: "done", priority: "high" });
    createTodo({ title: "C", status: "done", priority: "low" });

    const done = listTodos({ status: "done" });
    expect(done.map((t) => t.title).sort()).toEqual(["B", "C"]);

    const high = listTodos({ priority: "high" });
    expect(high).toHaveLength(1);
    expect(high[0].title).toBe("B");
  });

  it("sorts by priority", () => {
    createTodo({ title: "Low", priority: "low" });
    createTodo({ title: "High", priority: "high" });
    createTodo({ title: "Medium", priority: "medium" });

    const desc = listTodos({ sortBy: "priority", sortDir: "desc" });
    expect(desc.map((t) => t.priority)).toEqual(["high", "medium", "low"]);

    const asc = listTodos({ sortBy: "priority", sortDir: "asc" });
    expect(asc.map((t) => t.priority)).toEqual(["low", "medium", "high"]);
  });

  it("sorts by due_date with nulls last", () => {
    createTodo({ title: "No due" });
    createTodo({ title: "Later", due_date: "2030-02-01" });
    createTodo({ title: "Soon", due_date: "2030-01-15" });

    const todos = listTodos({ sortBy: "due_date", sortDir: "asc" });
    expect(todos[0].title).toBe("Soon");
    expect(todos[1].title).toBe("Later");
    expect(todos[2].title).toBe("No due");
  });

  it("updates fields and bumps updated_at", async () => {
    const created = createTodo({ title: "Original", description: "x" });
    await new Promise((r) => setTimeout(r, 1100));
    const updated = updateTodo(created.id, { title: "Changed", description: null, status: "done" });
    expect(updated.title).toBe("Changed");
    expect(updated.description).toBeNull();
    expect(updated.status).toBe("done");
    expect(updated.updated_at).not.toBe(created.updated_at);
  });

  it("deletes a todo", () => {
    const created = createTodo({ title: "Delete me" });
    expect(deleteTodo(created.id)).toBe(true);
    expect(getTodoById(created.id)).toBeNull();
    expect(deleteTodo(created.id)).toBe(false);
  });

  it("bulk marks selected todos as done", () => {
    const a = createTodo({ title: "A" });
    const b = createTodo({ title: "B" });
    const c = createTodo({ title: "C" });
    const changes = bulkMarkDone([a.id, b.id]);
    expect(changes).toBe(2);
    const done = listTodos({ status: "done" });
    expect(done.map((t) => t.id).sort()).toEqual([a.id, b.id].sort());
    expect(getTodoById(c.id)?.status).toBe("pending");
  });

  it("bulk deletes selected todos", () => {
    const a = createTodo({ title: "A" });
    const b = createTodo({ title: "B" });
    createTodo({ title: "C" });
    const deleted = bulkDelete([a.id, b.id]);
    expect(deleted).toBe(2);
    expect(listTodos()).toHaveLength(1);
  });
});

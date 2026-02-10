import { beforeEach, describe, expect, it, vi } from "vitest"

const cacheMocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}))

const dbMocks = vi.hoisted(() => ({
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  bulkMarkDone: vi.fn(),
  bulkDelete: vi.fn(),
}))

vi.mock("next/cache", () => cacheMocks)
vi.mock("@/db/todos", () => dbMocks)

import {
  bulkDeleteAction,
  bulkMarkDoneAction,
  createTodoAction,
  deleteTodoAction,
  updateTodoAction,
  upsertTodoAction,
} from "@/actions/todos"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("actions/todos", () => {
  it("createTodoAction calls db + revalidate", async () => {
    await createTodoAction({ title: "T" })
    expect(dbMocks.createTodo).toHaveBeenCalledWith({ title: "T" })
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith("/")
  })

  it("updateTodoAction calls db + revalidate", async () => {
    await updateTodoAction(123, { status: "done" })
    expect(dbMocks.updateTodo).toHaveBeenCalledWith(123, { status: "done" })
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith("/")
  })

  it("deleteTodoAction calls db + revalidate", async () => {
    await deleteTodoAction(5)
    expect(dbMocks.deleteTodo).toHaveBeenCalledWith(5)
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith("/")
  })

  it("bulk actions call db + revalidate", async () => {
    await bulkMarkDoneAction([1, 2])
    await bulkDeleteAction([3])
    expect(dbMocks.bulkMarkDone).toHaveBeenCalledWith([1, 2])
    expect(dbMocks.bulkDelete).toHaveBeenCalledWith([3])
    expect(cacheMocks.revalidatePath).toHaveBeenCalledTimes(2)
  })

  it("upsertTodoAction validates missing title", async () => {
    const fd = new FormData()
    fd.set("title", "")
    const result = await upsertTodoAction(fd)
    expect(result.ok).toBe(false)
    expect(dbMocks.createTodo).not.toHaveBeenCalled()
  })

  it("upsertTodoAction creates when no id", async () => {
    const fd = new FormData()
    fd.set("title", "Hello")
    fd.set("description", "")
    fd.set("priority", "high")
    fd.set("status", "pending")
    fd.set("due_date", "2026-02-10")

    const result = await upsertTodoAction(fd)
    expect(result).toEqual({ ok: true })
    expect(dbMocks.createTodo).toHaveBeenCalledWith({
      title: "Hello",
      description: null,
      priority: "high",
      status: "pending",
      due_date: "2026-02-10",
    })
  })

  it("upsertTodoAction updates when id present", async () => {
    const fd = new FormData()
    fd.set("id", "7")
    fd.set("title", "Updated")
    fd.set("description", "d")
    fd.set("priority", "low")
    fd.set("status", "done")
    fd.set("due_date", "")

    const result = await upsertTodoAction(fd)
    expect(result).toEqual({ ok: true })
    expect(dbMocks.updateTodo).toHaveBeenCalledWith(7, {
      title: "Updated",
      description: "d",
      priority: "low",
      status: "done",
      due_date: null,
    })
  })

  it("upsertTodoAction rejects invalid id", async () => {
    const fd = new FormData()
    fd.set("id", "nope")
    fd.set("title", "Valid")
    const result = await upsertTodoAction(fd)
    expect(result.ok).toBe(false)
    expect(dbMocks.updateTodo).not.toHaveBeenCalled()
  })
})

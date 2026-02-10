import Header from "@/components/header"
import TodoFilters from "@/components/todo-filters"
import TodoList from "@/components/todo-list"
import TodoSearch from "@/components/todo-search"
import { listTodos } from "@/db/todos"
import type { SortDir, TodoListParams, TodoPriority, TodoStatus, TodoSortBy } from "@/lib/types"

type SearchParams = Record<string, string | string[] | undefined>

function first(sp: SearchParams, key: string): string | undefined {
  const v = sp[key]
  if (Array.isArray(v)) return v[0]
  return v
}

function isStatus(v: string | undefined): v is TodoStatus {
  return v === "pending" || v === "in-progress" || v === "done"
}

function isPriority(v: string | undefined): v is TodoPriority {
  return v === "low" || v === "medium" || v === "high"
}

function isSort(v: string | undefined): v is TodoSortBy {
  return v === "created_at" || v === "due_date" || v === "priority"
}

function isOrder(v: string | undefined): v is SortDir {
  return v === "asc" || v === "desc"
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const sp = (await searchParams) ?? {}

  const statusRaw = first(sp, "status")
  const priorityRaw = first(sp, "priority")
  const query = first(sp, "q")
  const sortRaw = first(sp, "sort")
  const orderRaw = first(sp, "dir")

  const params: TodoListParams = {
    status: isStatus(statusRaw) ? statusRaw : undefined,
    priority: isPriority(priorityRaw) ? priorityRaw : undefined,
    search: query?.trim() ? query.trim() : undefined,
    sortBy: isSort(sortRaw) ? sortRaw : "created_at",
    sortDir: isOrder(orderRaw) ? orderRaw : "desc",
  }

  const todos = listTodos(params)

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-4 rounded-2xl border bg-card/60 p-4 shadow-sm backdrop-blur sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <TodoSearch initialValue={query ?? ""} />
            <TodoFilters
              status={isStatus(statusRaw) ? statusRaw : ""}
              priority={isPriority(priorityRaw) ? priorityRaw : ""}
              sortBy={isSort(sortRaw) ? sortRaw : "created_at"}
              sortDir={isOrder(orderRaw) ? orderRaw : "desc"}
            />
          </div>
        </div>

        <TodoList todos={todos} />
      </main>
    </>
  )
}

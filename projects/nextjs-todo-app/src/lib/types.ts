export type TodoPriority = "low" | "medium" | "high";
export type TodoStatus = "pending" | "in-progress" | "done";

export type TodoSortBy = "created_at" | "due_date" | "priority";
export type SortDir = "asc" | "desc";

export type ISODate = `${number}-${number}-${number}`;
export type ISOTimestamp = string;

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  priority: TodoPriority;
  status: TodoStatus;
  due_date: ISODate | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  priority?: TodoPriority;
  status?: TodoStatus;
  due_date?: ISODate | null;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  priority?: TodoPriority;
  status?: TodoStatus;
  due_date?: ISODate | null;
}

export interface ListTodosOptions {
  status?: TodoStatus;
  priority?: TodoPriority;
  query?: string;
  sort?: TodoSortBy;
  order?: SortDir;
}

export interface TodoListParams {
  status?: TodoStatus;
  priority?: TodoPriority;
  search?: string;
  sortBy?: TodoSortBy;
  sortDir?: SortDir;
}

// Backwards-compatible aliases
export type TodoCreateInput = CreateTodoInput;
export type TodoUpdateInput = UpdateTodoInput;

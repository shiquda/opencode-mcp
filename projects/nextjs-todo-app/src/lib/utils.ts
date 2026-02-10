import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ISODate, SortDir, TodoPriority, TodoSortBy, TodoStatus } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function coerceSortDir(value: unknown): SortDir {
  return value === "asc" || value === "desc" ? value : "desc";
}

export function coerceSortBy(value: unknown): TodoSortBy {
  return value === "created_at" || value === "due_date" || value === "priority"
    ? value
    : "created_at";
}

export function isTodoPriority(value: unknown): value is TodoPriority {
  return value === "low" || value === "medium" || value === "high";
}

export function isTodoStatus(value: unknown): value is TodoStatus {
  return value === "pending" || value === "in-progress" || value === "done";
}

export function priorityRank(priority: TodoPriority): number {
  switch (priority) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}

export function priorityBadgeClass(priority: TodoPriority): string {
  switch (priority) {
    case "high":
      return "bg-red-600 text-white dark:bg-red-500";
    case "medium":
      return "bg-amber-500 text-black dark:bg-amber-400";
    case "low":
      return "bg-emerald-600 text-white dark:bg-emerald-500";
  }
}

export function statusBadgeClass(status: TodoStatus): string {
  switch (status) {
    case "pending":
      return "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100";
    case "in-progress":
      return "bg-sky-600 text-white dark:bg-sky-500";
    case "done":
      return "bg-violet-600 text-white dark:bg-violet-500";
  }
}

export function formatStatus(status: TodoStatus): string {
  switch (status) {
    case "in-progress":
      return "In progress";
    case "pending":
      return "Pending";
    case "done":
      return "Done";
  }
}

export function formatPriority(priority: TodoPriority): string {
  switch (priority) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
  }
}

export function toIsoDate(date: Date): ISODate {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}` as ISODate;
}

// Note: store due dates as YYYY-MM-DD (UTC) strings.

"use client";

import * as React from "react";
import { ArrowDownAZ, ArrowUpAZ, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SortDir, TodoPriority, TodoSortBy, TodoStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  status: TodoStatus | "";
  priority: TodoPriority | "";
  sortBy: TodoSortBy;
  sortDir: SortDir;
};

export default function TodoFilters({ status, priority, sortBy, sortDir }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | "") {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("priority");
    params.delete("sort");
    params.delete("dir");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <Select
          value={status || "all"}
          onValueChange={(v) => setParam("status", v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priority || "all"}
          onValueChange={(v) => setParam("priority", v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select value={sortBy} onValueChange={(v) => setParam("sort", v)}>
          <SelectTrigger className="h-10 w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created date</SelectItem>
            <SelectItem value="due_date">Due date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className={cn("h-10", sortDir === "asc" && "bg-muted")}
          onClick={() => setParam("dir", sortDir === "asc" ? "desc" : "asc")}
          title={sortDir === "asc" ? "Ascending" : "Descending"}
        >
          {sortDir === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
          <span className="sr-only">Toggle sort direction</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="h-10">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearAll}>Clear filters</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

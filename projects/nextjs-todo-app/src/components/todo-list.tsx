"use client";

import * as React from "react";
import { CheckCheck, Trash2 } from "lucide-react";

import { bulkDeleteAction, bulkMarkDoneAction } from "@/actions/todos";
import TodoItem from "@/components/todo-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  todos: Todo[];
};

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <svg
          width="220"
          height="140"
          viewBox="0 0 220 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-muted-foreground"
        >
          <rect x="22" y="18" width="176" height="104" rx="16" className="fill-muted" />
          <rect x="40" y="38" width="140" height="12" rx="6" className="fill-background" opacity="0.6" />
          <rect x="40" y="62" width="96" height="12" rx="6" className="fill-background" opacity="0.55" />
          <rect x="40" y="86" width="120" height="12" rx="6" className="fill-background" opacity="0.5" />
          <path
            d="M64 112c18 18 74 18 92 0"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        <div className="max-w-md">
          <h2 className="text-lg font-semibold">No todos yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first task and start building momentum.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TodoList({ todos }: Props) {
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [pending, startTransition] = React.useTransition();

  const allSelected = todos.length > 0 && selectedIds.length === todos.length;

  React.useEffect(() => {
    // Keep selection in sync when list changes (filters/search).
    setSelectedIds((prev) => prev.filter((id) => todos.some((t) => t.id === id)));
  }, [todos]);

  function setAll(next: boolean) {
    setSelectedIds(next ? todos.map((t) => t.id) : []);
  }

  function toggle(id: number, next: boolean) {
    setSelectedIds((prev) => {
      if (next) return Array.from(new Set([...prev, id]));
      return prev.filter((x) => x !== id);
    });
  }

  function bulkDone() {
    const ids = selectedIds;
    startTransition(async () => {
      await bulkMarkDoneAction(ids);
      setSelectedIds([]);
    });
  }

  function bulkDelete() {
    const ids = selectedIds;
    startTransition(async () => {
      await bulkDeleteAction(ids);
      setSelectedIds([]);
    });
  }

  if (todos.length === 0) return <EmptyState />;

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Checkbox checked={allSelected} onCheckedChange={(v) => setAll(Boolean(v))} aria-label="Select all" />
          <div className="text-sm">
            <span className="font-medium">{selectedIds.length}</span> selected
            <span className="text-muted-foreground"> / {todos.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="secondary" disabled={selectedIds.length === 0 || pending} onClick={bulkDone}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark done
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={selectedIds.length === 0 || pending}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete selected todos?</DialogTitle>
                <DialogDescription>
                  This will permanently remove {selectedIds.length} todo{selectedIds.length === 1 ? "" : "s"}.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive" type="button" onClick={bulkDelete} disabled={pending}>
                    Delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableBody>
            {todos.map((todo) => (
              <TableRow key={todo.id} className="border-0">
                <TableCell className="p-0 pb-3 last:pb-0">
                  <TodoItem
                    todo={todo}
                    selected={selectedIds.includes(todo.id)}
                    onSelectedChange={(next) => toggle(todo.id, next)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className={cn("grid gap-3 md:hidden")}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            selected={selectedIds.includes(todo.id)}
            onSelectedChange={(next) => toggle(todo.id, next)}
          />
        ))}
      </div>
    </div>
  );
}

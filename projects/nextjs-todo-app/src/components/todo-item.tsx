"use client";

import * as React from "react";
import { CalendarClock, MoreHorizontal, Trash2 } from "lucide-react";

import { bulkMarkDoneAction, deleteTodoAction } from "@/actions/todos";
import TodoFormDialog from "@/components/todo-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Todo } from "@/lib/types";
import { cn, formatPriority, formatStatus, priorityBadgeClass, statusBadgeClass } from "@/lib/utils";

type Props = {
  todo: Todo;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
};

export default function TodoItem({ todo, selected, onSelectedChange }: Props) {
  const [pending, startTransition] = React.useTransition();

  function markDone() {
    startTransition(async () => {
      await bulkMarkDoneAction([todo.id]);
    });
  }

  function deleteOne() {
    startTransition(async () => {
      await deleteTodoAction(todo.id);
    });
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-shadow hover:shadow-md",
        todo.status === "done" && "opacity-[0.92]"
      )}
    >
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelectedChange(Boolean(v))}
            aria-label="Select todo"
            className="mt-1"
          />
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-6">{todo.title}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={cn("border-0", priorityBadgeClass(todo.priority))}>{formatPriority(todo.priority)}</Badge>
              <Badge className={cn("border-0", statusBadgeClass(todo.status))}>{formatStatus(todo.status)}</Badge>
              {todo.due_date ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {todo.due_date}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={pending}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Todo actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={markDone} disabled={todo.status === "done" || pending}>
              Mark done
            </DropdownMenuItem>
            <TodoFormDialog
              mode="edit"
              todo={todo}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              }
            />
            <DropdownMenuSeparator />
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete todo?</DialogTitle>
                  <DialogDescription>
                    This will permanently remove <span className="font-medium">{todo.title}</span>.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" type="button" onClick={deleteOne} disabled={pending}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {todo.description ? (
        <CardContent className="pt-0">
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{todo.description}</p>
        </CardContent>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-1 opacity-0 transition-opacity group-hover:opacity-100",
          todo.priority === "high" && "bg-red-600/70",
          todo.priority === "medium" && "bg-amber-500/70",
          todo.priority === "low" && "bg-emerald-600/70"
        )}
      />
    </Card>
  );
}

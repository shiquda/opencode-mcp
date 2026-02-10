"use client";

import * as React from "react";
import { CalendarIcon, Pencil } from "lucide-react";
import { format } from "date-fns";

import { upsertTodoAction } from "@/actions/todos";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Todo, TodoPriority, TodoStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  mode: "create" | "edit";
  todo?: Todo;
  trigger?: React.ReactNode;
};

export default function TodoFormDialog({ mode, todo, trigger }: Props) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState(todo?.title ?? "");
  const [description, setDescription] = React.useState(todo?.description ?? "");
  const [priority, setPriority] = React.useState<TodoPriority>(todo?.priority ?? "medium");
  const [status, setStatus] = React.useState<TodoStatus>(todo?.status ?? "pending");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(
    todo?.due_date ? new Date(todo.due_date + "T00:00:00") : undefined
  );

  React.useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  function resetToInitial() {
    setTitle(todo?.title ?? "");
    setDescription(todo?.description ?? "");
    setPriority(todo?.priority ?? "medium");
    setStatus(todo?.status ?? "pending");
    setDueDate(todo?.due_date ? new Date(todo.due_date + "T00:00:00") : undefined);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    if (mode === "edit" && todo) fd.set("id", String(todo.id));
    fd.set("title", title);
    fd.set("description", description);
    fd.set("priority", priority);
    fd.set("status", status);
    fd.set("due_date", dueDate ? format(dueDate, "yyyy-MM-dd") : "");

    startTransition(async () => {
      const result = await upsertTodoAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (mode === "create") {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setStatus("pending");
        setDueDate(undefined);
      }
      setOpen(false);
    });
  }

  const titleText = mode === "create" ? "New todo" : "Edit todo";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) resetToInitial();
      }}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "edit" ? <Pencil className="h-4 w-4" /> : null}
            {titleText}
          </DialogTitle>
          <DialogDescription>Capture the essentials, then refine as you go.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="todo-title">
              Title
            </label>
            <Input
              id="todo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Plan weekly groceries"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="todo-description">
              Description (optional)
            </label>
            <Textarea
              id="todo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A few details to help future-you."
              className="min-h-[90px]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <span className="text-sm font-medium">Priority</span>
              <Select value={priority} onValueChange={(v) => setPriority(v as TodoPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Status</span>
              <Select value={status} onValueChange={(v) => setStatus(v as TodoStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">Due date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "MMM d, yyyy") : "No due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(d) => setDueDate(d ?? undefined)}
                    initialFocus
                  />
                  <div className="flex items-center justify-between border-t p-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDueDate(undefined)}>
                      Clear
                    </Button>
                    <Button type="button" size="sm" onClick={() => (document.activeElement as HTMLElement | null)?.blur()}>
                      Done
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetToInitial();
                setOpen(false);
              }}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TodoFormDialog from "@/components/todo-form";

function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light{theme === "light" ? " (active)" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark{theme === "dark" ? " (active)" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System{theme === "system" ? " (active)" : ""}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Todo Studio</p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">Your tasks, thoughtfully organized.</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <TodoFormDialog
          trigger={<Button className="shadow-sm">New todo</Button>}
          mode="create"
        />
      </div>
    </header>
  );
}

# Next.js Todo App (SQLite + shadcn/ui)

A clean, modern Todo application built with Next.js App Router + Server Actions and a lightweight SQLite database (better-sqlite3). Designed to feel fast and deliberate, with filtering, search, sorting, and bulk actions.

## Features

- CRUD todos: create, edit, delete
- Properties: title, optional description, priority (low/medium/high), status (pending/in-progress/done), optional due date
- Filtering: by status and priority
- Search: by title/description
- Sorting: created date, due date, priority
- Bulk actions: mark selected as done, delete selected
- Beautiful shadcn/ui-based UI with responsive layout and dark mode support

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript (strict)
- Server Actions for mutations
- SQLite persistence via `better-sqlite3` (no Prisma)
- shadcn/ui + Tailwind CSS
- Vitest for unit tests

## Setup

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Run tests:

```bash
npm test
```

Build:

```bash
npm run build
```

## Persistence

- The SQLite DB is created automatically at `data/todos.db`.
- `data/` is gitignored.

## Screenshots

- (placeholder) Add screenshots here.

## Project Structure

```
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    todo-list.tsx
    todo-item.tsx
    todo-form.tsx
    todo-filters.tsx
    todo-search.tsx
    header.tsx
  db/
    index.ts
    init.ts
    todos.ts
    __tests__/
      todos.test.ts
  actions/
    todos.ts
  lib/
    utils.ts
    types.ts
```

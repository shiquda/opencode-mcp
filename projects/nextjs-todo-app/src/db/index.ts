import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { initSchema } from "@/db/init";

let _db: Database.Database | null = null;

function resolveDbPath(): string {
  if (process.env.TODO_DB_PATH && process.env.TODO_DB_PATH.trim().length > 0) {
    return process.env.TODO_DB_PATH;
  }
  return path.join(process.cwd(), "data", "todos.db");
}

export function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = resolveDbPath();
  if (dbPath !== ":memory:") {
    const dir = path.dirname(dbPath);
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(dbPath);
  initSchema(_db);
  return _db;
}

export function __resetDbForTests() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

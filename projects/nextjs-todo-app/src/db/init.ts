import type Database from "better-sqlite3";

export function initSchema(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
    CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
    CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
    CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
  `);
}

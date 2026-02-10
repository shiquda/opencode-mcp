import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(import.meta.dirname, '..', '..', 'data');

export function createDatabase(dbPath?: string): Database.Database {
  const resolvedPath = dbPath ?? path.join(DATA_DIR, 'scores.db');
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      mode TEXT NOT NULL CHECK(mode IN ('single', 'multi')),
      duration_seconds INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  return db;
}

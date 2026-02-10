import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

function createTestApp() {
  const app = express();
  app.use(express.json());

  const dbPath = path.join(import.meta.dirname, '..', 'data', 'test-scores.db');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    DROP TABLE IF EXISTS scores;
    CREATE TABLE scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      mode TEXT NOT NULL CHECK(mode IN ('single', 'multi')),
      duration_seconds INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  app.get('/api/scores', (req, res) => {
    const mode = (req.query.mode as string) || 'single';
    const limit = parseInt(req.query.limit as string) || 10;
    if (mode !== 'single' && mode !== 'multi') {
      res.status(400).json({ error: 'Invalid mode' });
      return;
    }
    const stmt = db.prepare(
      'SELECT id, player_name, score, mode, duration_seconds, created_at FROM scores WHERE mode = ? ORDER BY score DESC LIMIT ?'
    );
    res.json(stmt.all(mode, Math.min(limit, 100)));
  });

  app.post('/api/scores', (req, res) => {
    const { player_name, score, mode, duration_seconds } = req.body;
    if (!player_name || typeof player_name !== 'string' || player_name.trim().length === 0) {
      res.status(400).json({ error: 'player_name is required' });
      return;
    }
    if (typeof score !== 'number' || score < 0) {
      res.status(400).json({ error: 'score must be a non-negative number' });
      return;
    }
    if (mode !== 'single' && mode !== 'multi') {
      res.status(400).json({ error: 'mode must be "single" or "multi"' });
      return;
    }
    const stmt = db.prepare(
      'INSERT INTO scores (player_name, score, mode, duration_seconds) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(player_name.trim(), score, mode, duration_seconds ?? null);
    const inserted = db.prepare('SELECT * FROM scores WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(inserted);
  });

  app.get('/api/scores/stats', (_req, res) => {
    const totalGames = db.prepare('SELECT COUNT(*) as count FROM scores').get() as { count: number };
    const avgScore = db.prepare('SELECT AVG(score) as avg FROM scores').get() as { avg: number | null };
    const bestPlayer = db.prepare(
      'SELECT player_name, SUM(score) as total_score FROM scores GROUP BY player_name ORDER BY total_score DESC LIMIT 1'
    ).get() as { player_name: string } | undefined;
    const highestScore = db.prepare('SELECT MAX(score) as max FROM scores').get() as { max: number | null };

    res.json({
      total_games: totalGames.count,
      average_score: avgScore.avg ?? 0,
      best_player: bestPlayer?.player_name ?? null,
      highest_score: highestScore.max ?? 0,
    });
  });

  return { app, db, dbPath };
}

describe('API Endpoints', () => {
  let testApp: ReturnType<typeof createTestApp>;

  beforeAll(() => {
    testApp = createTestApp();
  });

  afterAll(() => {
    testApp.db.close();
    try {
      fs.unlinkSync(testApp.dbPath);
      fs.unlinkSync(testApp.dbPath + '-wal');
      fs.unlinkSync(testApp.dbPath + '-shm');
    } catch {
      // Ignore cleanup errors
    }
  });

  it('GET /api/scores should return empty array initially', async () => {
    const res = await request(testApp.app).get('/api/scores?mode=single');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/scores should save a score', async () => {
    const res = await request(testApp.app)
      .post('/api/scores')
      .send({ player_name: 'TestPlayer', score: 42, mode: 'single', duration_seconds: 120 });
    expect(res.status).toBe(201);
    expect(res.body.player_name).toBe('TestPlayer');
    expect(res.body.score).toBe(42);
    expect(res.body.mode).toBe('single');
    expect(res.body.id).toBeDefined();
  });

  it('GET /api/scores should return saved scores', async () => {
    const res = await request(testApp.app).get('/api/scores?mode=single');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].player_name).toBe('TestPlayer');
  });

  it('POST /api/scores should reject missing player_name', async () => {
    const res = await request(testApp.app)
      .post('/api/scores')
      .send({ score: 10, mode: 'single' });
    expect(res.status).toBe(400);
  });

  it('POST /api/scores should reject invalid mode', async () => {
    const res = await request(testApp.app)
      .post('/api/scores')
      .send({ player_name: 'Test', score: 10, mode: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('POST /api/scores should reject negative score', async () => {
    const res = await request(testApp.app)
      .post('/api/scores')
      .send({ player_name: 'Test', score: -5, mode: 'single' });
    expect(res.status).toBe(400);
  });

  it('GET /api/scores/stats should return correct stats', async () => {
    // Add another score
    await request(testApp.app)
      .post('/api/scores')
      .send({ player_name: 'Player2', score: 100, mode: 'single', duration_seconds: 60 });

    const res = await request(testApp.app).get('/api/scores/stats');
    expect(res.status).toBe(200);
    expect(res.body.total_games).toBe(2);
    expect(res.body.average_score).toBe(71);
    expect(res.body.best_player).toBe('Player2');
    expect(res.body.highest_score).toBe(100);
  });

  it('GET /api/scores should respect limit parameter', async () => {
    const res = await request(testApp.app).get('/api/scores?mode=single&limit=1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].score).toBe(100); // Highest score first
  });

  it('GET /api/scores should filter by mode', async () => {
    await request(testApp.app)
      .post('/api/scores')
      .send({ player_name: 'MultiPlayer', score: 50, mode: 'multi', duration_seconds: 30 });

    const singleRes = await request(testApp.app).get('/api/scores?mode=single');
    const multiRes = await request(testApp.app).get('/api/scores?mode=multi');

    expect(singleRes.body).toHaveLength(2);
    expect(multiRes.body).toHaveLength(1);
    expect(multiRes.body[0].player_name).toBe('MultiPlayer');
  });

  it('GET /api/scores should reject invalid mode parameter', async () => {
    const res = await request(testApp.app).get('/api/scores?mode=invalid');
    expect(res.status).toBe(400);
  });
});

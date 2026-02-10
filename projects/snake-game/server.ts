import express from 'express';
import cors from 'cors';
import { createDatabase } from './src/db/index.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

const db = createDatabase();

// GET /api/scores — get top scores
app.get('/api/scores', (req, res) => {
  const mode = req.query.mode as string || 'single';
  const limit = parseInt(req.query.limit as string) || 10;

  if (mode !== 'single' && mode !== 'multi') {
    res.status(400).json({ error: 'Invalid mode. Must be "single" or "multi".' });
    return;
  }

  const stmt = db.prepare(
    'SELECT id, player_name, score, mode, duration_seconds, created_at FROM scores WHERE mode = ? ORDER BY score DESC LIMIT ?'
  );
  const scores = stmt.all(mode, Math.min(limit, 100));
  res.json(scores);
});

// POST /api/scores — save a new score
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

// GET /api/scores/stats — get stats
app.get('/api/scores/stats', (_req, res) => {
  const totalGames = db.prepare('SELECT COUNT(*) as count FROM scores').get() as { count: number };
  const avgScore = db.prepare('SELECT AVG(score) as avg FROM scores').get() as { avg: number | null };
  const bestPlayer = db.prepare(
    'SELECT player_name, SUM(score) as total_score FROM scores GROUP BY player_name ORDER BY total_score DESC LIMIT 1'
  ).get() as { player_name: string; total_score: number } | undefined;
  const highestScore = db.prepare('SELECT MAX(score) as max FROM scores').get() as { max: number | null };

  res.json({
    total_games: totalGames.count,
    average_score: avgScore.avg ?? 0,
    best_player: bestPlayer?.player_name ?? null,
    highest_score: highestScore.max ?? 0,
  });
});

app.listen(PORT, () => {
  console.log(`Snake Game API server running on http://localhost:${PORT}`);
});

export { app, db };

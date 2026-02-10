import { API_BASE } from './constants';
import type { ScoreEntry, ScoreStats, GameMode } from './types';

export async function getScores(mode: GameMode, limit = 10): Promise<ScoreEntry[]> {
  const res = await fetch(`${API_BASE}/scores?mode=${mode}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch scores');
  return res.json() as Promise<ScoreEntry[]>;
}

export async function saveScore(entry: Omit<ScoreEntry, 'id' | 'created_at'>): Promise<ScoreEntry> {
  const res = await fetch(`${API_BASE}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to save score');
  return res.json() as Promise<ScoreEntry>;
}

export async function getStats(): Promise<ScoreStats> {
  const res = await fetch(`${API_BASE}/scores/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json() as Promise<ScoreStats>;
}

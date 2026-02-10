import { useState, useEffect } from 'react';
import type { ScoreEntry, GameMode, ScoreStats } from '../lib/types';
import { getScores, getStats } from '../lib/api';

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<GameMode>('single');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [stats, setStats] = useState<ScoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getScores(activeTab, 10), getStats()])
      .then(([scoresData, statsData]) => {
        setScores(scoresData);
        setStats(statsData);
      })
      .catch(() => {
        setError('Failed to load scores. Make sure the server is running.');
      })
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #ffaa00, #ff4466)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer text-xl"
          >
            &times;
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {(['single', 'multi'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveTab(mode)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === mode
                  ? 'bg-gray-700 text-white'
                  : 'bg-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {mode === 'single' ? 'Single Player' : 'Multiplayer'}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-gray-500 py-8">Loading...</p>}
        {error && <p className="text-center text-red-400 py-8">{error}</p>}

        {!loading && !error && (
          <>
            {scores.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No scores yet. Be the first!</p>
            ) : (
              <div className="space-y-2">
                {scores.map((entry, i) => (
                  <div
                    key={entry.id ?? i}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50"
                  >
                    <span className={`font-bold w-8 text-center ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-600'
                    }`}>
                      #{i + 1}
                    </span>
                    <span className="flex-1 text-gray-200 truncate">{entry.player_name}</span>
                    <span className="font-bold text-green-400">{entry.score}</span>
                    <span className="text-xs text-gray-600">
                      {entry.duration_seconds ? `${Math.floor(entry.duration_seconds / 60)}:${(entry.duration_seconds % 60).toString().padStart(2, '0')}` : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {stats && stats.total_games > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-800 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Total Games</p>
                  <p className="text-lg font-bold text-white">{stats.total_games}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Score</p>
                  <p className="text-lg font-bold text-white">{Math.round(stats.average_score)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Best Player</p>
                  <p className="text-lg font-bold text-yellow-400 truncate">{stats.best_player ?? '-'}</p>
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}

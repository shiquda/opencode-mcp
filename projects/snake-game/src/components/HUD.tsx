import type { SnakeState, GameMode } from '../lib/types';

interface HUDProps {
  player1: SnakeState;
  player2: SnakeState | null;
  mode: GameMode;
  elapsedTime: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function HUD({ player1, player2, mode, elapsedTime }: HUDProps) {
  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-900/80 border-b border-gray-800 text-sm font-mono">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: player1.color }} />
        <span style={{ color: player1.color }}>{player1.name}</span>
        <span className="text-white font-bold ml-2">{player1.score}</span>
        {!player1.alive && <span className="text-red-500 text-xs ml-1">DEAD</span>}
      </div>

      <div className="text-gray-400">
        {formatTime(elapsedTime)}
      </div>

      {mode === 'multi' && player2 && (
        <div className="flex items-center gap-2">
          {!player2.alive && <span className="text-red-500 text-xs mr-1">DEAD</span>}
          <span className="text-white font-bold mr-2">{player2.score}</span>
          <span style={{ color: player2.color }}>{player2.name}</span>
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: player2.color }} />
        </div>
      )}

      {mode === 'single' && (
        <div className="text-gray-500 text-xs">
          Speed: {Math.floor(8 + player1.score * 0.5)}
        </div>
      )}
    </div>
  );
}

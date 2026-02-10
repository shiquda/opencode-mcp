import type { SnakeState, GameMode } from '../lib/types';

interface GameOverProps {
  player1: SnakeState;
  player2: SnakeState | null;
  mode: GameMode;
  elapsedTime: number;
  onSaveScore: () => void;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function GameOver({
  player1,
  player2,
  mode,
  elapsedTime,
  onSaveScore,
  onPlayAgain,
  onMainMenu,
}: GameOverProps) {
  const winner = mode === 'multi' && player2
    ? (player1.alive ? player1 : player2.alive ? player2 : (player1.score >= player2.score ? player1 : player2))
    : player1;

  const isDraw = mode === 'multi' && player2 && !player1.alive && !player2.alive && player1.score === player2.score;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center max-w-md w-full mx-4 shadow-2xl"
           style={{ boxShadow: '0 0 60px rgba(255, 68, 102, 0.15)' }}>
        <h2 className="text-4xl font-bold text-red-500 mb-6">GAME OVER</h2>

        {mode === 'multi' && player2 ? (
          <div className="mb-6">
            {isDraw ? (
              <p className="text-2xl text-yellow-400 font-bold">It&apos;s a Draw!</p>
            ) : (
              <p className="text-2xl font-bold" style={{ color: winner.color }}>
                {winner.name} Wins!
              </p>
            )}
            <div className="flex justify-between mt-4 text-gray-300">
              <div>
                <p style={{ color: player1.color }}>{player1.name}</p>
                <p className="text-2xl font-bold">{player1.score}</p>
              </div>
              <div className="text-gray-600">vs</div>
              <div>
                <p style={{ color: player2.color }}>{player2.name}</p>
                <p className="text-2xl font-bold">{player2.score}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-gray-400">Score</p>
            <p className="text-5xl font-bold" style={{ color: player1.color }}>{player1.score}</p>
          </div>
        )}

        <p className="text-gray-500 mb-6">
          Time: {Math.floor(elapsedTime / 60)}:{Math.floor(elapsedTime % 60).toString().padStart(2, '0')}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSaveScore}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Save Score
          </button>
          <button
            onClick={onPlayAgain}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Play Again
          </button>
          <button
            onClick={onMainMenu}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

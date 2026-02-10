import { useState } from 'react';
import type { GameMode } from '../lib/types';

interface StartScreenProps {
  onStart: (mode: GameMode) => void;
  onShowLeaderboard: () => void;
}

export function StartScreen({ onStart, onShowLeaderboard }: StartScreenProps) {
  const [hoveredMode, setHoveredMode] = useState<GameMode | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-2 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00aaff, #ff44aa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0, 255, 136, 0.3)',
            }}>
          SNAKE
        </h1>
        <p className="text-gray-400 text-lg tracking-widest uppercase">Arcade Edition</p>
      </div>

      <div className="flex flex-col gap-4 w-72">
        <button
          className="relative px-8 py-4 text-xl font-bold rounded-lg border-2 transition-all duration-300 cursor-pointer"
          style={{
            borderColor: hoveredMode === 'single' ? '#00ff88' : '#00ff8844',
            backgroundColor: hoveredMode === 'single' ? '#00ff8815' : 'transparent',
            color: '#00ff88',
            boxShadow: hoveredMode === 'single' ? '0 0 30px rgba(0, 255, 136, 0.2)' : 'none',
          }}
          onMouseEnter={() => setHoveredMode('single')}
          onMouseLeave={() => setHoveredMode(null)}
          onClick={() => onStart('single')}
        >
          Single Player
          <span className="block text-xs font-normal text-gray-500 mt-1">WASD or Arrow Keys</span>
        </button>

        <button
          className="relative px-8 py-4 text-xl font-bold rounded-lg border-2 transition-all duration-300 cursor-pointer"
          style={{
            borderColor: hoveredMode === 'multi' ? '#00aaff' : '#00aaff44',
            backgroundColor: hoveredMode === 'multi' ? '#00aaff15' : 'transparent',
            color: '#00aaff',
            boxShadow: hoveredMode === 'multi' ? '0 0 30px rgba(0, 170, 255, 0.2)' : 'none',
          }}
          onMouseEnter={() => setHoveredMode('multi')}
          onMouseLeave={() => setHoveredMode(null)}
          onClick={() => onStart('multi')}
        >
          Multiplayer
          <span className="block text-xs font-normal text-gray-500 mt-1">P1: WASD &middot; P2: Arrows</span>
        </button>

        <button
          className="px-8 py-3 text-lg font-semibold rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all duration-300 mt-4 cursor-pointer"
          onClick={onShowLeaderboard}
        >
          Leaderboard
        </button>
      </div>

      <div className="mt-12 text-gray-600 text-sm">
        Press <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400">ESC</kbd> to pause during game
      </div>
    </div>
  );
}

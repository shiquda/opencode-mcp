import { useState } from 'react';
import type { GameMode, GameState } from './lib/types';
import { StartScreen } from './components/StartScreen';
import { Game } from './components/Game';
import { Leaderboard } from './components/Leaderboard';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const handleStart = (mode: GameMode) => {
    setGameMode(mode);
    setGameState('playing');
    setGameKey((k) => k + 1);
  };

  const handleMainMenu = () => {
    setGameState('menu');
    setShowLeaderboard(false);
  };

  if (showLeaderboard) {
    return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  if (gameState === 'menu') {
    return (
      <StartScreen
        onStart={handleStart}
        onShowLeaderboard={() => setShowLeaderboard(true)}
      />
    );
  }

  return (
    <Game
      key={gameKey}
      mode={gameMode}
      onMainMenu={handleMainMenu}
    />
  );
}

export default App;

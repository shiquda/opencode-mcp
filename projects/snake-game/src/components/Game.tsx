import { useRef, useState, useCallback } from 'react';
import type { SnakeState, GameMode, FoodItem, Particle, Direction } from '../lib/types';
import {
  GAME_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT,
  PLAYER_1_CONFIG, PLAYER_2_CONFIG,
  FOOD_COLORS, KEYS_PLAYER_1, KEYS_PLAYER_2,
} from '../lib/constants';
import {
  createSnake, setDirection, moveSnake,
  checkWallCollision, checkSelfCollision, checkSnakeCollision,
  checkFoodCollision, spawnFood, getSpeed,
} from './Snake';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboard } from '../hooks/useKeyboard';
import { HUD } from './HUD';
import { GameOver } from './GameOver';
import { NameDialog } from './NameDialog';
import { saveScore } from '../lib/api';

interface GameProps {
  mode: GameMode;
  onMainMenu: () => void;
}

function createParticles(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    particles.push({
      x: x * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2,
      y: y * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2,
      vx: Math.cos(angle) * (60 + Math.random() * 40),
      vy: Math.sin(angle) * (60 + Math.random() * 40),
      life: 1,
      maxLife: 1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  return particles;
}

export function Game({ mode, onMainMenu }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player1Ref = useRef<SnakeState>(
    createSnake(PLAYER_1_CONFIG.startX, PLAYER_1_CONFIG.startY, PLAYER_1_CONFIG.startDirection, PLAYER_1_CONFIG.color, PLAYER_1_CONFIG.glowColor, PLAYER_1_CONFIG.name)
  );
  const player2Ref = useRef<SnakeState | null>(
    mode === 'multi'
      ? createSnake(PLAYER_2_CONFIG.startX, PLAYER_2_CONFIG.startY, PLAYER_2_CONFIG.startDirection, PLAYER_2_CONFIG.color, PLAYER_2_CONFIG.glowColor, PLAYER_2_CONFIG.name)
      : null
  );
  const foodRef = useRef<FoodItem>({
    position: spawnFood([player1Ref.current, ...(player2Ref.current ? [player2Ref.current] : [])]),
    color: FOOD_COLORS[0],
    value: 1,
  });
  const particlesRef = useRef<Particle[]>([]);
  const tickAccRef = useRef(0);
  const timeRef = useRef(0);

  const [gameOver, setGameOver] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [, setRenderTick] = useState(0);

  const snapshotP1 = useRef<SnakeState>(player1Ref.current);
  const snapshotP2 = useRef<SnakeState | null>(player2Ref.current);
  const snapshotTime = useRef(0);

  const handleKeyboard = useCallback((code: string) => {
    if (code === 'Escape') return;

    const p1Dir = KEYS_PLAYER_1[code];
    if (p1Dir && (mode === 'single' || mode === 'multi')) {
      player1Ref.current = setDirection(player1Ref.current, p1Dir as Direction);
    }

    if (mode === 'single') {
      const arrowDir = KEYS_PLAYER_2[code];
      if (arrowDir) {
        player1Ref.current = setDirection(player1Ref.current, arrowDir as Direction);
      }
    }

    if (mode === 'multi') {
      const p2Dir = KEYS_PLAYER_2[code];
      if (p2Dir && player2Ref.current) {
        player2Ref.current = setDirection(player2Ref.current, p2Dir as Direction);
      }
    }
  }, [mode]);

  useKeyboard(handleKeyboard, !gameOver);

  const gameTick = useCallback(() => {
    let p1 = player1Ref.current;
    let p2 = player2Ref.current;
    const food = foodRef.current;

    const snakes = [p1, ...(p2 ? [p2] : [])];

    // Move snakes
    const p1Eating = p1.alive && checkFoodCollision(
      { x: p1.body[0].x + (p1.nextDirection === 'RIGHT' ? 1 : p1.nextDirection === 'LEFT' ? -1 : 0),
        y: p1.body[0].y + (p1.nextDirection === 'DOWN' ? 1 : p1.nextDirection === 'UP' ? -1 : 0) },
      food.position
    );
    if (p1.alive) {
      p1 = moveSnake(p1, p1Eating);
    }

    let p2Eating = false;
    if (p2 && p2.alive) {
      p2Eating = checkFoodCollision(
        { x: p2.body[0].x + (p2.nextDirection === 'RIGHT' ? 1 : p2.nextDirection === 'LEFT' ? -1 : 0),
          y: p2.body[0].y + (p2.nextDirection === 'DOWN' ? 1 : p2.nextDirection === 'UP' ? -1 : 0) },
        food.position
      );
      p2 = moveSnake(p2, p2Eating);
    }

    // Check collisions for P1
    if (p1.alive) {
      if (checkWallCollision(p1.body[0]) || checkSelfCollision(p1)) {
        p1 = { ...p1, alive: false };
      }
      if (p2 && p2.alive && checkSnakeCollision(p1, p2)) {
        p1 = { ...p1, alive: false };
      }
    }

    // Check collisions for P2
    if (p2 && p2.alive) {
      if (checkWallCollision(p2.body[0]) || checkSelfCollision(p2)) {
        p2 = { ...p2, alive: false };
      }
      if (p1.alive && checkSnakeCollision(p2, p1)) {
        p2 = { ...p2, alive: false };
      }
    }

    // Handle food eating
    if (p1Eating && p1.alive) {
      p1 = { ...p1, score: p1.score + food.value };
      particlesRef.current.push(...createParticles(food.position.x, food.position.y, food.color));
      const allSnakes = [p1, ...(p2 ? [p2] : [])];
      foodRef.current = {
        position: spawnFood(allSnakes),
        color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)],
        value: 1,
      };
    } else if (p2Eating && p2 && p2.alive) {
      p2 = { ...p2, score: p2.score + food.value };
      particlesRef.current.push(...createParticles(food.position.x, food.position.y, food.color));
      const allSnakes = [p1, p2];
      foodRef.current = {
        position: spawnFood(allSnakes),
        color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)],
        value: 1,
      };
    }

    player1Ref.current = p1;
    player2Ref.current = p2;

    // Check game over
    const isGameOver = mode === 'single'
      ? !p1.alive
      : !p1.alive && (!p2 || !p2.alive);

    const multiGameOver = mode === 'multi' && ((!p1.alive) || (p2 && !p2.alive));

    if (isGameOver || multiGameOver) {
      snapshotP1.current = p1;
      snapshotP2.current = p2;
      snapshotTime.current = timeRef.current;
      setGameOver(true);
    }

    void snakes;
  }, [mode]);

  const render = useCallback((delta: number) => {
    if (gameOver) return;

    timeRef.current += delta;
    const speed = getSpeed(Math.max(player1Ref.current.score, player2Ref.current?.score ?? 0));
    tickAccRef.current += delta;
    const tickInterval = 1 / speed;

    if (tickAccRef.current >= tickInterval) {
      tickAccRef.current -= tickInterval;
      gameTick();
    }

    // Update particles
    particlesRef.current = particlesRef.current
      .map((p) => ({
        ...p,
        x: p.x + p.vx * delta,
        y: p.y + p.vy * delta,
        life: p.life - delta * 2,
      }))
      .filter((p) => p.life > 0);

    // Draw
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    ctx.strokeStyle = '#ffffff08';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GAME_CONFIG.gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GAME_CONFIG.cellSize, 0);
      ctx.lineTo(x * GAME_CONFIG.cellSize, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_CONFIG.gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GAME_CONFIG.cellSize);
      ctx.lineTo(CANVAS_WIDTH, y * GAME_CONFIG.cellSize);
      ctx.stroke();
    }

    // Draw snakes
    const drawSnake = (snake: SnakeState) => {
      if (!snake.alive) {
        ctx.globalAlpha = 0.3;
      }
      snake.body.forEach((seg, i) => {
        const x = seg.x * GAME_CONFIG.cellSize;
        const y = seg.y * GAME_CONFIG.cellSize;
        const s = GAME_CONFIG.cellSize;
        const progress = i / snake.body.length;

        // Glow
        if (i === 0) {
          ctx.shadowColor = snake.color;
          ctx.shadowBlur = 15;
        } else {
          ctx.shadowBlur = 0;
        }

        // Gradient body
        const alpha = 1 - progress * 0.5;
        ctx.fillStyle = snake.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        const padding = i === 0 ? 1 : 2;
        ctx.beginPath();
        ctx.roundRect(x + padding, y + padding, s - padding * 2, s - padding * 2, 4);
        ctx.fill();

        // Eyes on head
        if (i === 0) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          const eyeSize = 3;
          const ex1 = x + s * 0.3;
          const ex2 = x + s * 0.7;
          const ey = y + s * 0.35;
          ctx.beginPath();
          ctx.arc(ex1, ey, eyeSize, 0, Math.PI * 2);
          ctx.arc(ex2, ey, eyeSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(ex1, ey, 1.5, 0, Math.PI * 2);
          ctx.arc(ex2, ey, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    drawSnake(player1Ref.current);
    if (player2Ref.current) {
      drawSnake(player2Ref.current);
    }

    // Draw food
    const food = foodRef.current;
    const fx = food.position.x * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;
    const fy = food.position.y * GAME_CONFIG.cellSize + GAME_CONFIG.cellSize / 2;
    const fPulse = 1 + Math.sin(timeRef.current * 6) * 0.15;
    const fRadius = (GAME_CONFIG.cellSize / 2 - 2) * fPulse;

    ctx.shadowColor = food.color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.arc(fx, fy, fRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw particles
    particlesRef.current.forEach((p) => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    setRenderTick((t) => t + 1);
  }, [gameOver, gameTick]);

  useGameLoop(render, !gameOver);

  const handlePlayAgain = useCallback(() => {
    player1Ref.current = createSnake(
      PLAYER_1_CONFIG.startX, PLAYER_1_CONFIG.startY, PLAYER_1_CONFIG.startDirection,
      PLAYER_1_CONFIG.color, PLAYER_1_CONFIG.glowColor, PLAYER_1_CONFIG.name
    );
    player2Ref.current = mode === 'multi'
      ? createSnake(
          PLAYER_2_CONFIG.startX, PLAYER_2_CONFIG.startY, PLAYER_2_CONFIG.startDirection,
          PLAYER_2_CONFIG.color, PLAYER_2_CONFIG.glowColor, PLAYER_2_CONFIG.name
        )
      : null;
    const allSnakes = [player1Ref.current, ...(player2Ref.current ? [player2Ref.current] : [])];
    foodRef.current = {
      position: spawnFood(allSnakes),
      color: FOOD_COLORS[0],
      value: 1,
    };
    particlesRef.current = [];
    tickAccRef.current = 0;
    timeRef.current = 0;
    setGameOver(false);
    setShowNameDialog(false);
  }, [mode]);

  const handleSaveScore = useCallback(() => {
    setShowNameDialog(true);
  }, []);

  const handleNameSubmit = useCallback(async (name: string) => {
    const p1 = snapshotP1.current;
    const p2 = snapshotP2.current;

    try {
      await saveScore({
        player_name: name,
        score: p1.score,
        mode,
        duration_seconds: Math.floor(snapshotTime.current),
      });

      if (mode === 'multi' && p2) {
        await saveScore({
          player_name: name + ' (P2)',
          score: p2.score,
          mode,
          duration_seconds: Math.floor(snapshotTime.current),
        });
      }
    } catch {
      // Silently fail if server not running
    }

    setShowNameDialog(false);
  }, [mode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
      <HUD
        player1={gameOver ? snapshotP1.current : player1Ref.current}
        player2={gameOver ? snapshotP2.current : player2Ref.current}
        mode={mode}
        elapsedTime={gameOver ? snapshotTime.current : timeRef.current}
      />
      <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-gray-800 rounded-lg"
          style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.3)' }}
        />
        {gameOver && !showNameDialog && (
          <GameOver
            player1={snapshotP1.current}
            player2={snapshotP2.current}
            mode={mode}
            elapsedTime={snapshotTime.current}
            onSaveScore={handleSaveScore}
            onPlayAgain={handlePlayAgain}
            onMainMenu={onMainMenu}
          />
        )}
        {showNameDialog && (
          <NameDialog
            score={snapshotP1.current.score}
            onSubmit={handleNameSubmit}
            onCancel={() => setShowNameDialog(false)}
          />
        )}
      </div>
    </div>
  );
}

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'single' | 'multi';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface SnakeState {
  body: Position[];
  direction: Direction;
  nextDirection: Direction;
  alive: boolean;
  score: number;
  color: string;
  glowColor: string;
  name: string;
}

export interface FoodItem {
  position: Position;
  color: string;
  value: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  initialSpeed: number;
  speedIncrement: number;
  maxSpeed: number;
}

export interface ScoreEntry {
  id?: number;
  player_name: string;
  score: number;
  mode: GameMode;
  duration_seconds: number;
  created_at?: string;
}

export interface ScoreStats {
  total_games: number;
  average_score: number;
  best_player: string | null;
  highest_score: number;
}

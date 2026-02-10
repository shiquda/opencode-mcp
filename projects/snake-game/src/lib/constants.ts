import type { GameConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  gridWidth: 30,
  gridHeight: 20,
  cellSize: 24,
  initialSpeed: 8,
  speedIncrement: 0.5,
  maxSpeed: 25,
};

export const CANVAS_WIDTH = GAME_CONFIG.gridWidth * GAME_CONFIG.cellSize;
export const CANVAS_HEIGHT = GAME_CONFIG.gridHeight * GAME_CONFIG.cellSize;

export const PLAYER_1_CONFIG = {
  color: '#00ff88',
  glowColor: '#00ff8855',
  name: 'Player 1',
  startX: 5,
  startY: Math.floor(GAME_CONFIG.gridHeight / 2),
  startDirection: 'RIGHT' as const,
};

export const PLAYER_2_CONFIG = {
  color: '#00aaff',
  glowColor: '#00aaff55',
  name: 'Player 2',
  startX: GAME_CONFIG.gridWidth - 6,
  startY: Math.floor(GAME_CONFIG.gridHeight / 2),
  startDirection: 'LEFT' as const,
};

export const FOOD_COLORS = ['#ff4466', '#ffaa00', '#ff66cc', '#ffee00'];

export const KEYS_PLAYER_1: Record<string, string> = {
  KeyW: 'UP',
  KeyS: 'DOWN',
  KeyA: 'LEFT',
  KeyD: 'RIGHT',
};

export const KEYS_PLAYER_2: Record<string, string> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
};

export const API_BASE = '/api';

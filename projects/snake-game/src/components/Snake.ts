import type { Position, Direction, SnakeState } from '../lib/types';
import { GAME_CONFIG } from '../lib/constants';

const OPPOSITE: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const DIRECTION_DELTA: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function createSnake(
  startX: number,
  startY: number,
  direction: Direction,
  color: string,
  glowColor: string,
  name: string,
): SnakeState {
  const body: Position[] = [];
  const delta = DIRECTION_DELTA[OPPOSITE[direction]];
  for (let i = 0; i < 3; i++) {
    body.push({ x: startX + delta.x * i, y: startY + delta.y * i });
  }
  return {
    body,
    direction,
    nextDirection: direction,
    alive: true,
    score: 0,
    color,
    glowColor,
    name,
  };
}

export function setDirection(snake: SnakeState, newDirection: Direction): SnakeState {
  if (OPPOSITE[newDirection] === snake.direction) {
    return snake;
  }
  return { ...snake, nextDirection: newDirection };
}

export function moveSnake(snake: SnakeState, grow: boolean): SnakeState {
  if (!snake.alive) return snake;

  const direction = snake.nextDirection;
  const head = snake.body[0];
  const delta = DIRECTION_DELTA[direction];
  const newHead: Position = {
    x: head.x + delta.x,
    y: head.y + delta.y,
  };

  const newBody = [newHead, ...snake.body];
  if (!grow) {
    newBody.pop();
  }

  return {
    ...snake,
    body: newBody,
    direction,
  };
}

export function checkWallCollision(head: Position): boolean {
  return (
    head.x < 0 ||
    head.x >= GAME_CONFIG.gridWidth ||
    head.y < 0 ||
    head.y >= GAME_CONFIG.gridHeight
  );
}

export function checkSelfCollision(snake: SnakeState): boolean {
  const head = snake.body[0];
  return snake.body.slice(1).some((seg) => seg.x === head.x && seg.y === head.y);
}

export function checkSnakeCollision(snake: SnakeState, otherSnake: SnakeState): boolean {
  const head = snake.body[0];
  return otherSnake.body.some((seg) => seg.x === head.x && seg.y === head.y);
}

export function checkFoodCollision(head: Position, food: Position): boolean {
  return head.x === food.x && head.y === food.y;
}

export function isPositionOnSnake(pos: Position, ...snakes: SnakeState[]): boolean {
  return snakes.some((snake) => snake.body.some((seg) => seg.x === pos.x && seg.y === pos.y));
}

export function spawnFood(snakes: SnakeState[]): Position {
  let pos: Position;
  let attempts = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * GAME_CONFIG.gridWidth),
      y: Math.floor(Math.random() * GAME_CONFIG.gridHeight),
    };
    attempts++;
    if (attempts > 1000) break;
  } while (isPositionOnSnake(pos, ...snakes));
  return pos;
}

export function getSpeed(score: number): number {
  const speed = GAME_CONFIG.initialSpeed + score * GAME_CONFIG.speedIncrement;
  return Math.min(speed, GAME_CONFIG.maxSpeed);
}

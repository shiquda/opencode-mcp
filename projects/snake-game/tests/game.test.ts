import { describe, it, expect } from 'vitest';
import {
  createSnake,
  moveSnake,
  setDirection,
  checkWallCollision,
  checkSelfCollision,
} from '../src/components/Snake';
import { GAME_CONFIG } from '../src/lib/constants';

describe('Game mechanics', () => {
  it('should simulate a full game turn', () => {
    let snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    snake = moveSnake(snake, false);
    expect(snake.body[0]).toEqual({ x: 6, y: 10 });
    expect(snake.alive).toBe(true);
  });

  it('should handle direction change then move', () => {
    let snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    snake = setDirection(snake, 'DOWN');
    snake = moveSnake(snake, false);
    expect(snake.body[0]).toEqual({ x: 5, y: 11 });
    expect(snake.direction).toBe('DOWN');
  });

  it('should detect game over when hitting wall', () => {
    let snake = createSnake(0, 10, 'LEFT', '#00ff88', '#00ff8855', 'P1');
    snake = moveSnake(snake, false);
    const hitWall = checkWallCollision(snake.body[0]);
    expect(hitWall).toBe(true);
  });

  it('should detect game over when snake hits itself', () => {
    // Create a snake long enough to loop
    const snake = createSnake(10, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const longSnake = {
      ...snake,
      body: [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 11, y: 11 },
        { x: 10, y: 11 },
        { x: 10, y: 10 },
      ],
    };
    expect(checkSelfCollision(longSnake)).toBe(true);
  });

  it('should grow snake body when eating', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const initial = snake.body.length;
    const grown = moveSnake(snake, true);
    expect(grown.body.length).toBe(initial + 1);
  });

  it('should maintain body length when not eating', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const initial = snake.body.length;
    const moved = moveSnake(snake, false);
    expect(moved.body.length).toBe(initial);
  });

  it('should correctly compute grid boundaries', () => {
    expect(GAME_CONFIG.gridWidth).toBe(30);
    expect(GAME_CONFIG.gridHeight).toBe(20);
    // Valid positions
    expect(checkWallCollision({ x: 0, y: 0 })).toBe(false);
    expect(checkWallCollision({ x: 29, y: 19 })).toBe(false);
    // Invalid positions
    expect(checkWallCollision({ x: 30, y: 0 })).toBe(true);
    expect(checkWallCollision({ x: 0, y: 20 })).toBe(true);
  });
});

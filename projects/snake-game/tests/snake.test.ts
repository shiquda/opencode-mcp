import { describe, it, expect } from 'vitest';
import {
  createSnake,
  setDirection,
  moveSnake,
  checkWallCollision,
  checkSelfCollision,
  checkSnakeCollision,
  checkFoodCollision,
  isPositionOnSnake,
  spawnFood,
  getSpeed,
} from '../src/components/Snake';
import { GAME_CONFIG } from '../src/lib/constants';

describe('Snake creation', () => {
  it('should create a snake with correct initial state', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'Player 1');
    expect(snake.body).toHaveLength(3);
    expect(snake.body[0]).toEqual({ x: 5, y: 10 });
    expect(snake.direction).toBe('RIGHT');
    expect(snake.nextDirection).toBe('RIGHT');
    expect(snake.alive).toBe(true);
    expect(snake.score).toBe(0);
    expect(snake.color).toBe('#00ff88');
    expect(snake.name).toBe('Player 1');
  });

  it('should create body segments behind the head based on direction', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    // Moving right means body extends to the left
    expect(snake.body[1]).toEqual({ x: 4, y: 10 });
    expect(snake.body[2]).toEqual({ x: 3, y: 10 });
  });

  it('should create body segments for UP direction', () => {
    const snake = createSnake(5, 10, 'UP', '#00ff88', '#00ff8855', 'P1');
    // Moving up means body extends downward
    expect(snake.body[1]).toEqual({ x: 5, y: 11 });
    expect(snake.body[2]).toEqual({ x: 5, y: 12 });
  });
});

describe('Snake movement', () => {
  it('should move right correctly', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const moved = moveSnake(snake, false);
    expect(moved.body[0]).toEqual({ x: 6, y: 10 });
    expect(moved.body).toHaveLength(3);
  });

  it('should move left correctly', () => {
    const snake = createSnake(5, 10, 'LEFT', '#00ff88', '#00ff8855', 'P1');
    const moved = moveSnake(snake, false);
    expect(moved.body[0]).toEqual({ x: 4, y: 10 });
  });

  it('should move up correctly', () => {
    const snake = createSnake(5, 10, 'UP', '#00ff88', '#00ff8855', 'P1');
    const moved = moveSnake(snake, false);
    expect(moved.body[0]).toEqual({ x: 5, y: 9 });
  });

  it('should move down correctly', () => {
    const snake = createSnake(5, 10, 'DOWN', '#00ff88', '#00ff8855', 'P1');
    const moved = moveSnake(snake, false);
    expect(moved.body[0]).toEqual({ x: 5, y: 11 });
  });

  it('should grow when eating food', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const moved = moveSnake(snake, true);
    expect(moved.body).toHaveLength(4);
    expect(moved.body[0]).toEqual({ x: 6, y: 10 });
  });

  it('should not move if dead', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const dead = { ...snake, alive: false };
    const moved = moveSnake(dead, false);
    expect(moved.body).toEqual(dead.body);
  });
});

describe('Direction changes', () => {
  it('should change direction', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const changed = setDirection(snake, 'UP');
    expect(changed.nextDirection).toBe('UP');
  });

  it('should not allow reversing direction', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const changed = setDirection(snake, 'LEFT');
    expect(changed.nextDirection).toBe('RIGHT');
  });

  it('should not allow reversing UP to DOWN', () => {
    const snake = createSnake(5, 10, 'UP', '#00ff88', '#00ff8855', 'P1');
    const changed = setDirection(snake, 'DOWN');
    expect(changed.nextDirection).toBe('UP');
  });
});

describe('Collision detection', () => {
  it('should detect wall collision on left', () => {
    expect(checkWallCollision({ x: -1, y: 5 })).toBe(true);
  });

  it('should detect wall collision on right', () => {
    expect(checkWallCollision({ x: GAME_CONFIG.gridWidth, y: 5 })).toBe(true);
  });

  it('should detect wall collision on top', () => {
    expect(checkWallCollision({ x: 5, y: -1 })).toBe(true);
  });

  it('should detect wall collision on bottom', () => {
    expect(checkWallCollision({ x: 5, y: GAME_CONFIG.gridHeight })).toBe(true);
  });

  it('should not detect collision for valid position', () => {
    expect(checkWallCollision({ x: 5, y: 5 })).toBe(false);
  });

  it('should detect self collision', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    // Manually create a snake that collides with itself
    const selfColliding = {
      ...snake,
      body: [
        { x: 5, y: 10 },
        { x: 6, y: 10 },
        { x: 6, y: 11 },
        { x: 5, y: 11 },
        { x: 5, y: 10 }, // loops back to head
      ],
    };
    expect(checkSelfCollision(selfColliding)).toBe(true);
  });

  it('should not detect self collision for normal snake', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    expect(checkSelfCollision(snake)).toBe(false);
  });

  it('should detect collision between two snakes', () => {
    const snake1 = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const snake2 = createSnake(6, 10, 'LEFT', '#00aaff', '#00aaff55', 'P2');
    // Move snake1 to position of snake2's head
    const moved = moveSnake(snake1, false);
    expect(checkSnakeCollision(moved, snake2)).toBe(true);
  });

  it('should detect food collision', () => {
    expect(checkFoodCollision({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(true);
  });

  it('should not detect food collision for different positions', () => {
    expect(checkFoodCollision({ x: 5, y: 5 }, { x: 6, y: 5 })).toBe(false);
  });
});

describe('Food spawning', () => {
  it('should spawn food not on any snake', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    const food = spawnFood([snake]);
    expect(isPositionOnSnake(food, snake)).toBe(false);
  });

  it('should spawn within grid bounds', () => {
    const snake = createSnake(5, 10, 'RIGHT', '#00ff88', '#00ff8855', 'P1');
    for (let i = 0; i < 100; i++) {
      const food = spawnFood([snake]);
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(GAME_CONFIG.gridWidth);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(GAME_CONFIG.gridHeight);
    }
  });
});

describe('Speed calculation', () => {
  it('should return initial speed for score 0', () => {
    expect(getSpeed(0)).toBe(GAME_CONFIG.initialSpeed);
  });

  it('should increase speed with score', () => {
    expect(getSpeed(10)).toBeGreaterThan(GAME_CONFIG.initialSpeed);
  });

  it('should not exceed max speed', () => {
    expect(getSpeed(1000)).toBe(GAME_CONFIG.maxSpeed);
  });
});

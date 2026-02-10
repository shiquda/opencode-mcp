# Snake Game - Arcade Edition

A classic Snake game built with React 19, TypeScript, Vite, and Tailwind CSS v4. Features local multiplayer, persistent high scores with SQLite, and a retro neon arcade aesthetic.

## Features

- **Single Player Mode** — WASD or Arrow Keys
- **Local 2-Player Mode** — Player 1 (WASD, green) vs Player 2 (Arrows, blue)
- **Persistent Leaderboard** — SQLite-backed high score tracking
- **Visual Effects** — Gradient snake bodies, glow effects, particle effects on food pickup
- **Responsive UI** — Dark neon theme with smooth 60fps canvas rendering

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite 7 with Hot Module Replacement
- Tailwind CSS v4 via `@tailwindcss/vite`
- HTML5 Canvas for game rendering
- Express.js API server
- better-sqlite3 for persistent storage
- Vitest for testing

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
npm install
```

### Development

Run both the Vite dev server and the API server simultaneously:

```bash
npm run dev:full
```

This starts:
- Vite dev server at `http://localhost:5173`
- API server at `http://localhost:3001`

Or run them separately:

```bash
# Frontend only
npm run dev

# API server only
npm run dev:server
```

### Build

```bash
npm run build
```

### Test

```bash
npm test

# Watch mode
npm run test:watch
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scores?mode=single&limit=10` | Get top scores by mode |
| POST | `/api/scores` | Save a new score |
| GET | `/api/scores/stats` | Get aggregate statistics |

### POST /api/scores body

```json
{
  "player_name": "PlayerName",
  "score": 42,
  "mode": "single",
  "duration_seconds": 120
}
```

## Project Structure

```
snake-game/
├── server.ts              # Express + better-sqlite3 API server
├── src/
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # App state management
│   ├── index.css          # Tailwind CSS
│   ├── components/
│   │   ├── Game.tsx       # Main game canvas + logic
│   │   ├── Snake.ts       # Snake functions (pure logic)
│   │   ├── StartScreen.tsx
│   │   ├── GameOver.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── HUD.tsx
│   │   └── NameDialog.tsx
│   ├── hooks/
│   │   ├── useGameLoop.ts # requestAnimationFrame loop
│   │   └── useKeyboard.ts # Keyboard input
│   ├── lib/
│   │   ├── constants.ts   # Config values
│   │   ├── types.ts       # TypeScript types
│   │   └── api.ts         # Fetch wrapper
│   └── db/
│       └── index.ts       # SQLite setup
├── tests/
│   ├── snake.test.ts      # 19 snake logic tests
│   ├── game.test.ts       # 7 game mechanic tests
│   └── api.test.ts        # 10 API endpoint tests
├── data/                  # SQLite DB (gitignored)
├── vitest.config.ts
├── vite.config.ts
└── package.json
```

## Controls

| Action | Player 1 | Player 2 |
|--------|----------|----------|
| Up | W | Arrow Up |
| Down | S | Arrow Down |
| Left | A | Arrow Left |
| Right | D | Arrow Right |

In single player mode, both WASD and Arrow keys control the snake.

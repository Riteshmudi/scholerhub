# ScholarHub

AI-powered study assistant with document analysis, smart notes, quizzes, study planner, and chat.

## Prerequisites

- Node.js 18+ (Node 20+ recommended)

## Quick Start (both frontend + backend together)

```bash
npm install
npm run dev
```

This starts the Vite dev server (frontend) on port 3000 and automatically launches the Express backend on port 4000. Open http://localhost:3000 in your browser.

> The `postinstall` hook automatically installs server dependencies, generates the Prisma client, and creates the SQLite database. If it doesn't run, execute `npm run setup` manually.

## Manual Start (frontend and backend separately)

**Terminal 1 - Backend:**
```bash
cd server
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push --schema=prisma/schema.prisma
npm run dev
```
The backend runs on http://localhost:4000

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev:client
```
The frontend runs on http://localhost:3000 and proxies `/api` requests to port 4000.

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in values:

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` | SQLite database path |
| `SESSION_SECRET` | Yes | `dev-secret-change-me` | Secret for session cookies |
| `PORT` | No | `4000` | Backend server port |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed frontend origin |
| `GEMINI_API_KEY` | AI features only | _(empty)_ | Google Gemini API key |

**`GEMINI_API_KEY` is only needed for AI features** (document summaries, chat, quizzes, notes, study planner). Login, registration, and session management work without it. Get a key at https://aistudio.google.com/apikey.

## How Authentication Works

- **Register:** `POST /api/auth/register` with `{ name, email, password }` - creates user, sets httpOnly session cookie
- **Login:** `POST /api/auth/login` with `{ email, password }` - validates credentials, sets httpOnly session cookie
- **Current user:** `GET /api/auth/me` - returns the logged-in user from the session cookie
- **Logout:** `POST /api/auth/logout` - deletes session, clears cookie
- Sessions are stored in SQLite via Prisma and expire after 30 days
- Passwords are hashed with bcrypt (12 rounds)

## Testing the Backend Directly

With the backend running on port 4000:

```bash
# Health check
curl http://localhost:4000/api/health

# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -b cookies.txt -c cookies.txt

# Get current user (authenticated)
curl http://localhost:4000/api/auth/me -b cookies.txt

# Logout
curl -X POST http://localhost:4000/api/auth/logout -b cookies.txt
```

## Testing Login Through the UI

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Click "Sign In" or "Get Started"
4. Register a new account or sign in with existing credentials
5. You should be redirected to the Dashboard

## API Architecture

- Frontend (React + Vite) runs on port 3000
- Backend (Express + Prisma) runs on port 4000
- Vite proxies all `/api/*` requests to the backend (see `vite.config.ts`)
- Session cookies use `sameSite: 'lax'` and `httpOnly: true`

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Motion
- **Backend:** Express, Prisma (SQLite), bcryptjs
- **AI:** Google Gemini (optional - only for AI features)

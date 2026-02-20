# Studio — Creative Pipeline Engine

## Project Structure
- `src/` — Next.js App Router frontend (TypeScript, Tailwind CSS v4)
- `api/` — Python FastAPI backend (image processing, video processing, AI)
- `storage/` — Local asset storage (gitignored)
- `studio.db` — SQLite database (gitignored)

## Tech Stack
- **Frontend:** Next.js 15+, TypeScript, Tailwind CSS v4, Konva.js, Zustand
- **Backend:** Python 3.12+, FastAPI, Pillow, librosa, FFmpeg
- **AI:** Claude API (Anthropic SDK) for style analysis, NL direction, brief generation
- **Database:** SQLite (dev) via better-sqlite3 (Node) and aiosqlite (Python)
- **Assets:** Local filesystem at ./storage/

## Commands
- `npm run dev` — Start Next.js dev server (port 3000)
- `cd api && python -m uvicorn main:app --reload --port 8000` — Start FastAPI
- `npm test` — Run frontend tests
- `cd api && pytest` — Run backend tests

## Conventions
- No `any` types in TypeScript
- Zod for all API input validation
- All Python endpoints return JSON with consistent error format
- Assets stored at `./storage/{asset_type}/{filename}`
- Database migrations in `api/migrations/`

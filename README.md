# Studio

Zone-based creative pipeline engine. Compose marketing content from briefs through grid layouts, style profiles, and intelligent assembly.

## Quick Start

```bash
# Frontend
npm install
npm run dev

# Backend (separate terminal)
python3 -m venv .venv
source .venv/bin/activate
pip install -r api/requirements.txt
uvicorn api.main:app --reload --port 8000
```

Open http://localhost:3000

## How It Works

1. **Brief** — Describe what you're creating, attach reference images
2. **Format** — Pick dimensions (Instagram post, story, A4, custom)
3. **Grid** — Split the canvas into zones (2h, 2v, 3-row, 4-quad, asymmetric)
4. **Assign** — Give each zone a role (image, text, texture, pattern, solid)
5. **Compose** — Fill each zone independently with content
6. **Compile** — Pillow renders all zones into a single image
7. **Export** — Download the final PNG

## Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS v4 + react-konva + Zustand
- **Backend:** Python FastAPI + SQLite + Pillow + Anthropic Claude API
- **Canvas:** Konva.js for interactive grid editing
- **Composition:** Pillow for server-side zone rendering

## Style Profiles

Upload reference images to extract your design DNA:
- K-means colour clustering (k=8)
- Claude Vision analysis for typography, composition, texture, mood
- Profiles inform future compositions

## Project Structure

```
src/                    # Next.js frontend
  app/                  # Pages (dashboard, project, profiles)
  components/           # UI components
    layout/             # Shell (header, workspace, pipeline nav, canvas)
    pipeline/           # Step components (brief, format, grid, zones, compile, export)
    canvas/             # Konva grid editor
  store/                # Zustand stores (pipeline, app)
  types/                # TypeScript types
  lib/                  # API client, utilities

api/                    # FastAPI backend
  routers/              # Endpoints (assets, projects, profiles, compose)
  services/             # Business logic (style extraction, compositor)
  database.py           # SQLite schema
  config.py             # Environment config
```

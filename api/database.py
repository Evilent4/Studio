import aiosqlite
from config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS style_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    colours TEXT NOT NULL DEFAULT '{}',
    typography TEXT NOT NULL DEFAULT '{}',
    composition TEXT NOT NULL DEFAULT '{}',
    textures TEXT NOT NULL DEFAULT '{}',
    mood TEXT NOT NULL DEFAULT '{}',
    source_images TEXT NOT NULL DEFAULT '[]',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    style_profile_id TEXT,
    pipeline_type TEXT NOT NULL CHECK (pipeline_type IN ('static', 'photo_direction', 'video_reel')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
    brief TEXT NOT NULL DEFAULT '',
    reference_images TEXT NOT NULL DEFAULT '[]',
    format TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (style_profile_id) REFERENCES style_profiles(id)
);

CREATE TABLE IF NOT EXISTS pipeline_states (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL UNIQUE,
    current_step INTEGER NOT NULL DEFAULT 0,
    steps TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS zones (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    grid_position TEXT NOT NULL DEFAULT '{}',
    bounds TEXT NOT NULL DEFAULT '{}',
    role TEXT NOT NULL DEFAULT 'empty' CHECK (role IN ('image', 'text', 'texture', 'pattern', 'solid', 'empty')),
    content TEXT NOT NULL DEFAULT '{}',
    effects TEXT NOT NULL DEFAULT '[]',
    zone_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'font', 'texture')),
    path TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL DEFAULT 0,
    metadata TEXT NOT NULL DEFAULT '{}',
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(str(DB_PATH))
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def init_db():
    db = await get_db()
    await db.executescript(SCHEMA)
    await db.commit()
    await db.close()

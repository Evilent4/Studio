import uuid
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import aiosqlite
from database import get_db_dep

router = APIRouter(prefix="/projects", tags=["projects"])

STATIC_STEPS = [
    {"step_number": 0, "name": "Brief", "type": "input", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 1, "name": "Format", "type": "input", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 2, "name": "Grid", "type": "tweak", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 3, "name": "Zone Assignment", "type": "propose", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 4, "name": "Zone Composition", "type": "input", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 5, "name": "Zone Refinement", "type": "tweak", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 6, "name": "Compile", "type": "auto", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 7, "name": "Export", "type": "export", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
]

PHOTO_STEPS = [
    {"step_number": 0, "name": "Brief", "type": "input", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 1, "name": "Analysis", "type": "auto", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 2, "name": "Shot List", "type": "propose", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 3, "name": "Mood Board", "type": "auto", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 4, "name": "Technical Notes", "type": "auto", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 5, "name": "Export", "type": "export", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
]

VIDEO_STEPS = [
    {"step_number": 0, "name": "Upload", "type": "input", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 1, "name": "Scan", "type": "auto", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 2, "name": "Clip Selection", "type": "propose", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 3, "name": "Sequence", "type": "propose", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 4, "name": "Timing", "type": "tweak", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 5, "name": "Transitions", "type": "tweak", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 6, "name": "Grade", "type": "tweak", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 7, "name": "Text/Titles", "type": "input", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 8, "name": "Preview", "type": "review", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
    {"step_number": 9, "name": "Export", "type": "export", "status": "pending", "input": {}, "output": {}, "user_overrides": {}},
]

PIPELINE_STEPS = {
    "static": STATIC_STEPS,
    "photo_direction": PHOTO_STEPS,
    "video_reel": VIDEO_STEPS,
}


class CreateProjectRequest(BaseModel):
    name: str
    pipeline_type: str
    style_profile_id: str | None = None
    brief: str = ""


@router.post("/")
async def create_project(req: CreateProjectRequest, db: aiosqlite.Connection = Depends(get_db_dep)):
    if req.pipeline_type not in PIPELINE_STEPS:
        raise HTTPException(400, f"Invalid pipeline type: {req.pipeline_type}")

    project_id = str(uuid.uuid4())
    pipeline_id = str(uuid.uuid4())
    steps = PIPELINE_STEPS[req.pipeline_type]

    await db.execute(
        """INSERT INTO projects (id, name, pipeline_type, style_profile_id, brief)
           VALUES (?, ?, ?, ?, ?)""",
        (project_id, req.name, req.pipeline_type, req.style_profile_id, req.brief),
    )
    await db.execute(
        """INSERT INTO pipeline_states (id, project_id, current_step, steps)
           VALUES (?, ?, 0, ?)""",
        (pipeline_id, project_id, json.dumps(steps)),
    )
    await db.commit()

    return {"id": project_id, "name": req.name, "pipeline_type": req.pipeline_type}


@router.get("/")
async def list_projects(db: aiosqlite.Connection = Depends(get_db_dep)):
    rows = await db.execute("SELECT * FROM projects ORDER BY created_at DESC")
    projects = [dict(row) async for row in rows]
    return projects


@router.get("/{project_id}")
async def get_project(project_id: str, db: aiosqlite.Connection = Depends(get_db_dep)):
    row = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    project = await row.fetchone()
    if not project:
        raise HTTPException(404, "Project not found")

    pipe_row = await db.execute(
        "SELECT * FROM pipeline_states WHERE project_id = ?", (project_id,)
    )
    pipeline = await pipe_row.fetchone()

    zones_rows = await db.execute(
        "SELECT * FROM zones WHERE project_id = ? ORDER BY zone_order", (project_id,)
    )
    zones = [dict(z) async for z in zones_rows]

    return {
        **dict(project),
        "pipeline": dict(pipeline) if pipeline else None,
        "zones": zones,
    }

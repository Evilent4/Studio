import re
import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from services.compositor import compose_zones
from config import STORAGE_DIR

router = APIRouter(prefix="/compose", tags=["compose"])


class ZoneBounds(BaseModel):
    x: int
    y: int
    width: int
    height: int


class ZoneInput(BaseModel):
    bounds: ZoneBounds
    content: dict
    zone_order: int = 0


class ComposeRequest(BaseModel):
    project_id: str
    canvas_width: int = Field(gt=0, le=8192)
    canvas_height: int = Field(gt=0, le=8192)
    zones: list[ZoneInput]


@router.post("/render")
async def render_composition(req: ComposeRequest):
    zones_dicts = [z.model_dump() for z in req.zones]
    canvas = compose_zones(zones_dicts, req.canvas_width, req.canvas_height)

    output_dir = STORAGE_DIR / "renders"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_id = str(uuid.uuid4())
    output_path = output_dir / f"{output_id}.png"
    canvas.save(str(output_path), "PNG", quality=95)

    return {
        "render_id": output_id,
        "width": req.canvas_width,
        "height": req.canvas_height,
    }


@router.get("/render/{render_id}")
async def get_render(render_id: str):
    if not re.match(r'^[a-f0-9\-]+$', render_id):
        raise HTTPException(status_code=400, detail="Invalid render ID")
    output_path = STORAGE_DIR / "renders" / f"{render_id}.png"
    if not output_path.exists():
        raise HTTPException(404, "Render not found")
    return FileResponse(str(output_path), media_type="image/png")

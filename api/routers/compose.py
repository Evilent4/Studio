import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from services.compositor import compose_zones
from config import STORAGE_DIR

router = APIRouter(prefix="/compose", tags=["compose"])


class ComposeRequest(BaseModel):
    project_id: str
    canvas_width: int
    canvas_height: int
    zones: list[dict]


@router.post("/render")
async def render_composition(req: ComposeRequest):
    canvas = compose_zones(req.zones, req.canvas_width, req.canvas_height)

    output_dir = STORAGE_DIR / "renders"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_id = str(uuid.uuid4())
    output_path = output_dir / f"{output_id}.png"
    canvas.save(str(output_path), "PNG", quality=95)

    return {
        "render_id": output_id,
        "path": str(output_path),
        "width": req.canvas_width,
        "height": req.canvas_height,
    }


@router.get("/render/{render_id}")
async def get_render(render_id: str):
    output_path = STORAGE_DIR / "renders" / f"{render_id}.png"
    if not output_path.exists():
        raise HTTPException(404, "Render not found")
    return FileResponse(str(output_path), media_type="image/png")

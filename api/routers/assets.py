import uuid
import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from config import STORAGE_DIR
from database import get_db

router = APIRouter(prefix="/assets", tags=["assets"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/webm"}
ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/wav", "audio/aac", "audio/mp4"}

MIME_TO_ASSET_TYPE = {}
for t in ALLOWED_IMAGE_TYPES:
    MIME_TO_ASSET_TYPE[t] = "image"
for t in ALLOWED_VIDEO_TYPES:
    MIME_TO_ASSET_TYPE[t] = "video"
for t in ALLOWED_AUDIO_TYPES:
    MIME_TO_ASSET_TYPE[t] = "audio"


@router.post("/upload")
async def upload_asset(file: UploadFile = File(...)):
    if file.content_type not in MIME_TO_ASSET_TYPE:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")

    asset_type = MIME_TO_ASSET_TYPE[file.content_type]
    asset_id = str(uuid.uuid4())
    ext = Path(file.filename or "file").suffix
    storage_path = STORAGE_DIR / asset_type / f"{asset_id}{ext}"
    storage_path.parent.mkdir(parents=True, exist_ok=True)

    content = await file.read()
    storage_path.write_bytes(content)

    metadata = {"original_filename": file.filename}
    if asset_type == "image":
        from PIL import Image
        img = Image.open(storage_path)
        metadata["width"] = img.width
        metadata["height"] = img.height
        metadata["path"] = str(storage_path)
        img.close()

    db = await get_db()
    await db.execute(
        """INSERT INTO assets (id, type, path, filename, mime_type, size_bytes, metadata)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (asset_id, asset_type, str(storage_path), file.filename or "file",
         file.content_type, len(content), json.dumps(metadata)),
    )
    await db.commit()
    await db.close()

    return {
        "id": asset_id,
        "type": asset_type,
        "filename": file.filename,
        "size_bytes": len(content),
        "metadata": metadata,
    }


@router.get("/{asset_id}")
async def get_asset(asset_id: str):
    db = await get_db()
    row = await db.execute("SELECT * FROM assets WHERE id = ?", (asset_id,))
    asset = await row.fetchone()
    await db.close()

    if not asset:
        raise HTTPException(404, "Asset not found")

    return dict(asset)


@router.get("/{asset_id}/file")
async def serve_asset(asset_id: str):
    from fastapi.responses import FileResponse

    db = await get_db()
    row = await db.execute("SELECT path, mime_type FROM assets WHERE id = ?", (asset_id,))
    asset = await row.fetchone()
    await db.close()

    if not asset:
        raise HTTPException(404, "Asset not found")

    return FileResponse(asset["path"], media_type=asset["mime_type"])

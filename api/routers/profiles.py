import uuid
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import aiosqlite
from api.database import get_db_dep
from api.services.style_extraction import extract_colours, analyze_with_vision, synthesize_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])


class CreateProfileRequest(BaseModel):
    name: str
    source_image_paths: list[str]


@router.post("/")
async def create_profile(req: CreateProfileRequest, db: aiosqlite.Connection = Depends(get_db_dep)) -> dict:
    profile_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO style_profiles (id, name, source_images) VALUES (?, ?, ?)",
        (profile_id, req.name, json.dumps(req.source_image_paths)),
    )
    await db.commit()
    return {"id": profile_id, "name": req.name, "status": "created"}


@router.post("/{profile_id}/analyze")
async def analyze_profile(profile_id: str, db: aiosqlite.Connection = Depends(get_db_dep)) -> dict:
    row = await db.execute("SELECT * FROM style_profiles WHERE id = ?", (profile_id,))
    profile = await row.fetchone()
    if not profile:
        raise HTTPException(404, "Profile not found")

    source_images = json.loads(profile["source_images"])
    if not source_images:
        raise HTTPException(400, "No source images to analyze")

    colour_results = []
    vision_results = []

    for img_path in source_images:
        try:
            colours = extract_colours(img_path)
            colour_results.append(colours)
        except Exception as e:
            colour_results.append({"primary": [], "accent": [], "background": [], "text": [], "error": str(e)})
        try:
            vision = analyze_with_vision(img_path)
            vision_results.append(vision)
        except Exception as e:
            vision_results.append({"error": str(e)})

    valid_vision = [v for v in vision_results if "error" not in v]
    valid_colours = [c for c in colour_results if "error" not in c]

    if not valid_vision and not valid_colours:
        raise HTTPException(500, "All image analyses failed")

    # If no valid vision results, create a minimal profile from colours only
    if not valid_vision:
        synthesized = {
            "colours": {"primary": [], "accent": [], "background": [], "text": []},
            "typography": {
                "headline": {"family": "Inter", "weight": 700, "size_ratio": 2.5},
                "body": {"family": "Inter", "weight": 400, "size_ratio": 1.0},
                "accent": {"family": "Inter", "weight": 400, "size_ratio": 1.5},
                "caption": {"family": "Inter", "weight": 400, "size_ratio": 0.75},
            },
            "composition": {"text_image_ratio": 0.3, "alignment": ["centre"], "whitespace": 0.5, "density": 0.0},
            "textures": {"grain_intensity": 0.0, "contrast": 0.5, "halftone": False, "pattern_density": 0.0},
            "mood": {"warmth": 0.0, "density": 0.0, "brightness": 0.0, "formality": 0.0},
        }
        if valid_colours:
            from collections import Counter
            all_primary = [c for r in valid_colours for c in r.get("primary", [])]
            all_accent = [c for r in valid_colours for c in r.get("accent", [])]
            all_bg = [c for r in valid_colours for c in r.get("background", [])]
            all_text = [c for r in valid_colours for c in r.get("text", [])]

            def most_common(lst, n=4):
                return [c for c, _ in Counter(lst).most_common(n)]

            synthesized["colours"] = {
                "primary": most_common(all_primary),
                "accent": most_common(all_accent),
                "background": most_common(all_bg),
                "text": most_common(all_text),
            }
    else:
        synthesized = synthesize_profile(valid_vision, valid_colours)

    await db.execute(
        """UPDATE style_profiles SET
           colours = ?, typography = ?, composition = ?,
           textures = ?, mood = ?, updated_at = datetime('now')
           WHERE id = ?""",
        (json.dumps(synthesized["colours"]), json.dumps(synthesized["typography"]),
         json.dumps(synthesized["composition"]), json.dumps(synthesized["textures"]),
         json.dumps(synthesized["mood"]), profile_id),
    )
    await db.commit()

    return {"id": profile_id, "status": "analyzed", "profile": synthesized}


@router.get("/")
async def list_profiles(db: aiosqlite.Connection = Depends(get_db_dep)):
    rows = await db.execute("SELECT * FROM style_profiles ORDER BY updated_at DESC")
    profiles = []
    async for row in rows:
        p = dict(row)
        for field in ("colours", "typography", "composition", "textures", "mood", "source_images"):
            if isinstance(p.get(field), str):
                p[field] = json.loads(p[field])
        profiles.append(p)
    return profiles


@router.get("/{profile_id}")
async def get_profile(profile_id: str, db: aiosqlite.Connection = Depends(get_db_dep)):
    row = await db.execute("SELECT * FROM style_profiles WHERE id = ?", (profile_id,))
    profile = await row.fetchone()
    if not profile:
        raise HTTPException(404, "Profile not found")
    p = dict(profile)
    for field in ("colours", "typography", "composition", "textures", "mood", "source_images"):
        if isinstance(p.get(field), str):
            p[field] = json.loads(p[field])
    return p

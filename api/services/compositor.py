import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from config import STORAGE_DIR


def compose_zones(zones: list[dict], canvas_width: int, canvas_height: int) -> Image.Image:
    canvas = Image.new("RGB", (canvas_width, canvas_height), color=(26, 26, 26))

    for zone in sorted(zones, key=lambda z: z.get("zone_order", 0)):
        bounds = zone["bounds"]
        x, y = int(bounds["x"]), int(bounds["y"])
        w, h = int(bounds["width"]), int(bounds["height"])
        content = zone["content"]
        if isinstance(content, str):
            content = json.loads(content)

        content_type = content.get("type", "empty")

        if content_type == "image" and content.get("asset_id"):
            _compose_image(canvas, content, x, y, w, h)
        elif content_type == "text" and content.get("text"):
            _compose_text(canvas, content, x, y, w, h)
        elif content_type == "solid":
            _compose_solid(canvas, content, x, y, w, h)

    return canvas


def _compose_image(canvas: Image.Image, content: dict, x: int, y: int, w: int, h: int):
    asset_id = content["asset_id"]
    asset_dir = STORAGE_DIR / "image"
    matching = list(asset_dir.glob(f"{asset_id}.*")) if asset_dir.exists() else []
    if not matching:
        return

    img = Image.open(matching[0]).convert("RGB")
    img_ratio = img.width / img.height
    zone_ratio = w / h

    if img_ratio > zone_ratio:
        new_h = h
        new_w = int(h * img_ratio)
    else:
        new_w = w
        new_h = int(w / img_ratio)

    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - w) // 2
    top = (new_h - h) // 2
    img = img.crop((left, top, left + w, top + h))
    canvas.paste(img, (x, y))


def _compose_text(canvas: Image.Image, content: dict, x: int, y: int, w: int, h: int):
    draw = ImageDraw.Draw(canvas)
    text = content.get("text", "")
    size = content.get("size", 24)
    colour = content.get("colour", "#e8e8e8")
    alignment = content.get("alignment", "center")

    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
    except OSError:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
        except OSError:
            font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    if alignment == "center":
        tx = x + (w - text_w) // 2
    elif alignment == "right":
        tx = x + w - text_w - 10
    else:
        tx = x + 10

    ty = y + (h - text_h) // 2
    draw.text((tx, ty), text, fill=colour, font=font)


def _compose_solid(canvas: Image.Image, content: dict, x: int, y: int, w: int, h: int):
    draw = ImageDraw.Draw(canvas)
    colour = content.get("colour", "#1a1a1a")
    draw.rectangle([x, y, x + w, y + h], fill=colour)

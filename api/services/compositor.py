import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from api.config import STORAGE_DIR


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
    padding = 10

    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
    except OSError:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
        except OSError:
            font = ImageFont.load_default()

    max_width = w - padding * 2
    lines = _wrap_text(draw, text, font, max_width)

    # Measure each line and total block height
    line_metrics = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_w = bbox[2] - bbox[0]
        line_h = bbox[3] - bbox[1]
        line_metrics.append((line, line_w, line_h))

    total_height = sum(m[2] for m in line_metrics)
    line_spacing = max(int(size * 0.25), 2)
    total_height += line_spacing * (len(line_metrics) - 1) if len(line_metrics) > 1 else 0

    # Center the text block vertically in the zone
    ty = y + (h - total_height) // 2

    for line, line_w, line_h in line_metrics:
        if alignment == "center":
            tx = x + (w - line_w) // 2
        elif alignment == "right":
            tx = x + w - line_w - padding
        else:
            tx = x + padding

        draw.text((tx, ty), line, fill=colour, font=font)
        ty += line_h + line_spacing


def _wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    """Break text into lines that fit within max_width using word wrapping."""
    words = text.split()
    if not words:
        return [""]

    lines: list[str] = []
    current_line = words[0]

    for word in words[1:]:
        test_line = current_line + " " + word
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if (bbox[2] - bbox[0]) <= max_width:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word

    lines.append(current_line)
    return lines


def _compose_solid(canvas: Image.Image, content: dict, x: int, y: int, w: int, h: int):
    draw = ImageDraw.Draw(canvas)
    colour = content.get("colour", "#1a1a1a")
    draw.rectangle([x, y, x + w, y + h], fill=colour)

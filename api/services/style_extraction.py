import json
import base64
from pathlib import Path
from PIL import Image
import numpy as np
from anthropic import Anthropic
from api.config import ANTHROPIC_API_KEY

client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None


def extract_colours(image_path: str) -> dict:
    img = Image.open(image_path).convert("RGB")
    img = img.resize((256, int(256 * img.height / img.width)))
    pixels = np.array(img).reshape(-1, 3).astype(float)

    k = 8
    rng = np.random.default_rng(42)
    centroids = pixels[rng.choice(len(pixels), k, replace=False)]

    for _ in range(20):
        distances = np.linalg.norm(pixels[:, None] - centroids[None], axis=2)
        labels = distances.argmin(axis=1)
        for i in range(k):
            mask = labels == i
            if mask.any():
                centroids[i] = pixels[mask].mean(axis=0)

    colours = []
    for c in centroids:
        r, g, b = int(c[0]), int(c[1]), int(c[2])
        hex_val = f"#{r:02x}{g:02x}{b:02x}"
        brightness = 0.299 * r + 0.587 * g + 0.114 * b
        saturation = (max(r, g, b) - min(r, g, b)) / max(max(r, g, b), 1)
        colours.append({"hex": hex_val, "brightness": brightness, "saturation": saturation})

    colours.sort(key=lambda c: c["brightness"])

    background = [c["hex"] for c in colours[:2]]
    text_colours = [c["hex"] for c in colours[-2:]]
    accents = [c["hex"] for c in colours if c["saturation"] > 0.3][:3]
    primary = [c["hex"] for c in colours[2:-2] if c["hex"] not in accents][:3]

    return {
        "primary": primary or [colours[len(colours) // 2]["hex"]],
        "accent": accents or [colours[len(colours) // 2]["hex"]],
        "background": background,
        "text": text_colours,
    }


def analyze_with_vision(image_path: str) -> dict:
    if not client:
        return {"error": "No API key configured"}

    img_bytes = Path(image_path).read_bytes()
    b64 = base64.b64encode(img_bytes).decode()
    ext = Path(image_path).suffix.lower()
    media_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
                 ".webp": "image/webp", ".gif": "image/gif"}
    media_type = media_map.get(ext, "image/jpeg")

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64}},
                {"type": "text", "text": """Analyze this design image and return a JSON object with these fields:

{
  "typography": {
    "headline": {"style": "serif|sans|mono|display", "weight": "light|regular|bold|black", "size": "large|medium|small"},
    "body": {"style": "serif|sans|mono|display", "weight": "light|regular|bold|black", "size": "large|medium|small"},
    "has_text": true/false
  },
  "composition": {
    "layout": "grid|freeform|centred|asymmetric",
    "text_placement": "top|bottom|overlay|sidebar|centred|none",
    "text_image_ratio": 0.0 to 1.0,
    "whitespace": "minimal|moderate|generous",
    "alignment": "left|centre|right|mixed"
  },
  "textures": {
    "grain": 0.0 to 1.0,
    "contrast": 0.0 to 1.0,
    "halftone": true/false,
    "pattern_density": 0.0 to 1.0
  },
  "mood": {
    "warmth": -1.0 to 1.0,
    "density": -1.0 to 1.0,
    "brightness": -1.0 to 1.0,
    "formality": -1.0 to 1.0
  }
}

Return ONLY the JSON, no other text."""}
            ]
        }]
    )

    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]

    return json.loads(text)


def synthesize_profile(analyses: list[dict], colour_results: list[dict]) -> dict:
    from collections import Counter

    all_primary = [c for r in colour_results for c in r.get("primary", [])]
    all_accent = [c for r in colour_results for c in r.get("accent", [])]
    all_bg = [c for r in colour_results for c in r.get("background", [])]
    all_text = [c for r in colour_results for c in r.get("text", [])]

    def most_common(lst, n=4):
        return [c for c, _ in Counter(lst).most_common(n)]

    headline_styles = [a["typography"]["headline"]["style"] for a in analyses if a.get("typography", {}).get("has_text")]
    body_styles = [a["typography"]["body"]["style"] for a in analyses if a.get("typography", {}).get("has_text")]

    def mode(lst, default="sans"):
        if not lst:
            return default
        return Counter(lst).most_common(1)[0][0]

    weight_map = {"light": 300, "regular": 400, "bold": 700, "black": 900}
    headline_weights = [weight_map.get(a["typography"]["headline"].get("weight", "bold"), 700) for a in analyses if a.get("typography", {}).get("has_text")]
    body_weights = [weight_map.get(a["typography"]["body"].get("weight", "regular"), 400) for a in analyses if a.get("typography", {}).get("has_text")]

    mood_keys = ["warmth", "density", "brightness", "formality"]
    mood = {}
    for key in mood_keys:
        values = [a["mood"][key] for a in analyses if "mood" in a]
        mood[key] = round(sum(values) / len(values), 2) if values else 0.0

    textures = {
        "grain_intensity": round(float(np.mean([a["textures"]["grain"] for a in analyses if "textures" in a])), 2),
        "contrast": round(float(np.mean([a["textures"]["contrast"] for a in analyses if "textures" in a])), 2),
        "halftone": any(a["textures"].get("halftone") for a in analyses if "textures" in a),
        "pattern_density": round(float(np.mean([a["textures"]["pattern_density"] for a in analyses if "textures" in a])), 2),
    }

    whitespace_map = {"minimal": 0.2, "moderate": 0.5, "generous": 0.8}
    whitespace_values = [whitespace_map.get(a["composition"]["whitespace"], 0.5) for a in analyses if "composition" in a]
    text_ratios = [a["composition"]["text_image_ratio"] for a in analyses if "composition" in a]

    family_map = {"serif": "Cormorant Garamond", "sans": "Inter", "mono": "JetBrains Mono", "display": "Instrument Serif"}

    return {
        "colours": {
            "primary": most_common(all_primary),
            "accent": most_common(all_accent),
            "background": most_common(all_bg),
            "text": most_common(all_text),
        },
        "typography": {
            "headline": {"family": family_map.get(mode(headline_styles, "serif"), "Cormorant Garamond"), "weight": int(np.mean(headline_weights)) if headline_weights else 700, "size_ratio": 2.5},
            "body": {"family": family_map.get(mode(body_styles, "sans"), "Inter"), "weight": int(np.mean(body_weights)) if body_weights else 400, "size_ratio": 1.0},
            "accent": {"family": "Instrument Serif", "weight": 400, "size_ratio": 1.5},
            "caption": {"family": "Inter", "weight": 400, "size_ratio": 0.75},
        },
        "composition": {
            "text_image_ratio": round(float(np.mean(text_ratios)), 2) if text_ratios else 0.3,
            "alignment": list(set(a["composition"]["alignment"] for a in analyses if "composition" in a)),
            "whitespace": round(float(np.mean(whitespace_values)), 2) if whitespace_values else 0.5,
            "density": mood.get("density", 0.0),
        },
        "textures": textures,
        "mood": mood,
    }

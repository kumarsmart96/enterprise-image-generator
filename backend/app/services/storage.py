import os
import json
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime

IMAGES_DIR   = "outputs/images"
ASSETS_DIR   = "outputs/assets"
PREVIEW_DIR  = "outputs/previews"
HISTORY_FILE = "outputs/history.json"

for d in [IMAGES_DIR, ASSETS_DIR, PREVIEW_DIR]:
    os.makedirs(d, exist_ok=True)

# ── Image save ────────────────────────────────────────────────
def save_image(image: Image.Image, job_id: str, index: int) -> str:
    path = os.path.join(IMAGES_DIR, f"{job_id}_{index}.png")
    image.save(path)
    return path

def get_image_path(image_id: str) -> str:
    path = os.path.join(IMAGES_DIR, f"{image_id}.png")
    return path if os.path.exists(path) else None

def list_all_images() -> list:
    return os.listdir(IMAGES_DIR)

def save_asset(file_bytes: bytes, filename: str) -> str:
    path = os.path.join(ASSETS_DIR, filename)
    with open(path, "wb") as f:
        f.write(file_bytes)
    return path

# ── Watermark ─────────────────────────────────────────────────
def add_watermark(image: Image.Image) -> Image.Image:
    preview = image.copy().convert("RGBA")
    overlay = Image.new("RGBA", preview.size, (0, 0, 0, 0))
    draw    = ImageDraw.Draw(overlay)

    text     = "PREVIEW"
    fontsize = max(preview.width // 8, 24)

    # Diagonal tiled watermark
    for x in range(0, preview.width, 180):
        for y in range(0, preview.height, 120):
            draw.text(
                (x, y),
                text,
                fill=(255, 255, 255, 55),
                font=None
            )

    combined = Image.alpha_composite(preview, overlay)
    return combined.convert("RGB")

def save_preview(image: Image.Image, job_id: str, index: int) -> str:
    watermarked = add_watermark(image)
    path = os.path.join(PREVIEW_DIR, f"{job_id}_{index}_preview.png")
    watermarked.save(path)
    return path

def get_preview_path(preview_id: str) -> str:
    path = os.path.join(PREVIEW_DIR, f"{preview_id}_preview.png")
    return path if os.path.exists(path) else None

# ── Prompt history ────────────────────────────────────────────
def load_history() -> list:
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, "r") as f:
        return json.load(f)

def save_history_item(job_id: str, prompt: str, mode: str, image_urls: list):
    history = load_history()
    history.insert(0, {
        "job_id"    : job_id,
        "prompt"    : prompt,
        "mode"      : mode,
        "image_urls": image_urls,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    # Keep only last 50 entries
    history = history[:50]
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)
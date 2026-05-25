from pydantic import BaseModel
from typing import List, Optional

class GenerateRequest(BaseModel):
    prompt: str
    n_images: int = 2
    steps: int = 30
    guidance_scale: float = 7.5
    width: int = 512
    height: int = 512
    style_strength: float = 0.5
    mode: str = "text2img"   # "text2img" | "img2img_style" | "img2img_content"

class GenerateResponse(BaseModel):
    job_id: str
    status: str
    image_urls: List[str]
    watermark_urls: List[str]   # preview with watermark
    prompt: str
    mode: str

class UploadResponse(BaseModel):
    status: str
    filename: str
    message: str
    mode: str                   # "style" or "content"

class HistoryItem(BaseModel):
    job_id: str
    prompt: str
    mode: str
    image_urls: List[str]
    created_at: str

class HistoryResponse(BaseModel):
    history: List[HistoryItem]
    total: int
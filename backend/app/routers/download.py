from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.services.storage import (
    get_image_path, get_preview_path,
    list_all_images, load_history
)
from app.models.schemas import HistoryResponse

router = APIRouter()

@router.get("/download/{image_id}")
async def download_image(image_id: str):
    """Download final clean image (no watermark)"""
    path = get_image_path(image_id)
    if not path:
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path, media_type="image/png", filename=f"{image_id}.png")

@router.get("/preview/{image_id}")
async def preview_image(image_id: str):
    """View watermarked preview image"""
    path = get_preview_path(image_id)
    if not path:
        raise HTTPException(status_code=404, detail="Preview not found")
    return FileResponse(path, media_type="image/png")

@router.get("/images")
async def list_images():
    files = list_all_images()
    return {"images": files, "count": len(files)}

@router.get("/history", response_model=HistoryResponse)
async def get_history():
    """Get all past generation jobs"""
    history = load_history()
    return HistoryResponse(history=history, total=len(history))
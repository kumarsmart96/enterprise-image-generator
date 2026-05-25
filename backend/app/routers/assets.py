from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import UploadResponse
from app.services.sd_service import sd_service
from app.services.storage import save_asset

router = APIRouter()

ALLOWED = ["image/png", "image/jpeg", "image/jpg"]

@router.post("/upload_assets", response_model=UploadResponse)
async def upload_style_image(file: UploadFile = File(...)):
    """Upload a brand/style reference image"""
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Only PNG/JPG allowed")
    file_bytes = await file.read()
    path = save_asset(file_bytes, file.filename)
    sd_service.set_style_image(path)
    return UploadResponse(
        status   = "uploaded",
        filename = file.filename,
        message  = "Style image set. Use mode=img2img_style in /generate",
        mode     = "style"
    )

@router.post("/upload_content", response_model=UploadResponse)
async def upload_content_image(file: UploadFile = File(...)):
    """Upload an image to be transformed into a new version"""
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Only PNG/JPG allowed")
    file_bytes = await file.read()
    path = save_asset(file_bytes, f"content_{file.filename}")
    sd_service.set_content_image(path)
    return UploadResponse(
        status   = "uploaded",
        filename = file.filename,
        message  = "Content image set. Use mode=img2img_content in /generate",
        mode     = "content"
    )
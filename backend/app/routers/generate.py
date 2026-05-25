from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateRequest, GenerateResponse
from app.services.sd_service import sd_service
from app.services.storage import save_history_item

router = APIRouter()

@router.post("/generate", response_model=GenerateResponse)
async def generate_images(req: GenerateRequest):
    try:
        job_id, paths, preview_paths = sd_service.generate(
            prompt         = req.prompt,
            mode           = req.mode,
            n_images       = req.n_images,
            steps          = req.steps,
            guidance_scale = req.guidance_scale,
            width          = req.width,
            height         = req.height,
            style_strength = req.style_strength
        )

        image_urls     = [f"/download/{job_id}_{i}"         for i in range(len(paths))]
        watermark_urls = [f"/preview/{job_id}_{i}"          for i in range(len(preview_paths))]

        # Save to history
        save_history_item(job_id, req.prompt, req.mode, image_urls)

        return GenerateResponse(
            job_id         = job_id,
            status         = "done",
            image_urls     = image_urls,
            watermark_urls = watermark_urls,
            prompt         = req.prompt,
            mode           = req.mode
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
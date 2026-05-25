import torch
import uuid
from PIL import Image
from diffusers import (
    DiffusionPipeline,
    LCMScheduler,
    AutoPipelineForText2Image,
    AutoPipelineForImage2Image,
)
from app.services.storage import save_image, save_preview

class SDService:
    def __init__(self):
        self.device        = "cuda" if torch.cuda.is_available() else "cpu"
        self.dtype         = torch.float16 if self.device == "cuda" else torch.float32
        self.pipe          = None
        self.img2img       = None
        self.brand_image   = None
        self.content_image = None

    def load_model(self):
        print(f"Loading LCM model on {self.device}...")

        # LCM model — only 4-8 steps needed!
        self.pipe = AutoPipelineForText2Image.from_pretrained(
            "SimianLuo/LCM_Dreamshaper_v7",
            torch_dtype    = torch.float32,  # float32 for CPU
            safety_checker = None,
        ).to(self.device)

        # LCM Scheduler — makes it ultra fast
        self.pipe.scheduler = LCMScheduler.from_config(
            self.pipe.scheduler.config
        )

        # Speed optimizations
        self.pipe.enable_attention_slicing(1)

        # img2img pipeline
        self.img2img = AutoPipelineForImage2Image.from_pretrained(
            "SimianLuo/LCM_Dreamshaper_v7",
            torch_dtype    = torch.float32,
            safety_checker = None,
        ).to(self.device)
        self.img2img.scheduler = LCMScheduler.from_config(
            self.img2img.scheduler.config
        )
        self.img2img.enable_attention_slicing(1)

        print(f"LCM Model ready on {self.device}!")
        print("Speed: 4-8 steps (vs 30 steps before) = 4x faster!")

    def set_style_image(self, path: str):
        self.brand_image = Image.open(path).convert("RGB").resize((512, 512))
        print(f"Style image set: {path}")

    def set_content_image(self, path: str):
        self.content_image = Image.open(path).convert("RGB").resize((512, 512))
        print(f"Content image set: {path}")

    def generate(
        self,
        prompt         : str,
        mode           : str   = "text2img",
        n_images       : int   = 1,
        steps          : int   = 6,        # LCM only needs 4-8 steps!
        guidance_scale : float = 1.0,      # LCM uses low guidance (1.0-2.0)
        width          : int   = 512,
        height         : int   = 512,
        style_strength : float = 0.5,
    ):
        job_id   = str(uuid.uuid4())[:8]
        saved    = []
        previews = []

        # Force small size on CPU for speed
        if self.device == "cpu":
            width  = 512
            height = 512

        if mode == "text2img":
            result = self.pipe(
                prompt                = prompt,
                num_inference_steps   = steps,
                guidance_scale        = guidance_scale,
                width                 = width,
                height                = height,
                num_images_per_prompt = n_images,
            )

        elif mode == "img2img_style":
            if not self.brand_image:
                raise ValueError("Upload style image first via /upload_assets")
            result = self.img2img(
                prompt                = prompt,
                image                 = self.brand_image,
                num_inference_steps   = steps,
                guidance_scale        = guidance_scale,
                strength              = style_strength,
                num_images_per_prompt = n_images,
            )

        elif mode == "img2img_content":
            if not self.content_image:
                raise ValueError("Upload content image first via /upload_content")
            result = self.img2img(
                prompt                = prompt,
                image                 = self.content_image,
                num_inference_steps   = steps,
                guidance_scale        = guidance_scale,
                strength              = style_strength,
                num_images_per_prompt = n_images,
            )
        else:
            raise ValueError(f"Unknown mode: {mode}")

        for i, img in enumerate(result.images):
            saved.append(save_image(img, job_id, i))
            previews.append(save_preview(img, job_id, i))

        return job_id, saved, previews

sd_service = SDService()
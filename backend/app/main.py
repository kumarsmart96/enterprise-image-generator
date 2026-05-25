from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import generate, assets, download
from app.services.sd_service import sd_service
import torch

@asynccontextmanager
async def lifespan(app: FastAPI):
    sd_service.load_model()
    yield

app = FastAPI(
    title="Enterprise Branded Image Generator",
    version="2.0.0",
    lifespan=lifespan
)

# ── Fix CORS — allow all origins ─────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],        # allow all origins
    allow_credentials = False,        # must be False when allow_origins=["*"]
    allow_methods     = ["*"],        # allow all methods including OPTIONS
    allow_headers     = ["*"],        # allow all headers
)

app.include_router(generate.router)
app.include_router(assets.router)
app.include_router(download.router)

@app.get("/")
async def root():
    return {"status": "running", "docs": "http://localhost:8000/docs"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "gpu"   : torch.cuda.is_available(),
        "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu"
    }
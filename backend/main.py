from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

# Import routers
from routers import prompts, files, voice

# Import database initialization
from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    init_db()
    yield
    # Shutdown: cleanup if needed
    pass


app = FastAPI(
    title="LUKTHAN - AI Prompt Agent",
    description="Transform rough ideas into optimized AI prompts",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - read from environment for production
allowed_origins = os.getenv("ALLOWED_HOSTS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prompts.router, prefix="/api/prompts", tags=["prompts"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])


@app.get("/")
def read_root():
    return {
        "message": "Welcome to LUKTHAN - AI Prompt Agent API",
        "version": "1.0.0",
        "endpoints": {
            "prompts": "/api/prompts/optimize",
            "files": "/api/files/upload",
            "voice": "/api/voice/transcribe"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

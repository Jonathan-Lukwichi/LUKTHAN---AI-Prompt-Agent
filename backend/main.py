from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import time
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

# Import routers
from routers import prompts, files, voice

# Import database initialization
from database import init_db


# Simple in-memory rate limiter
class RateLimiter:
    def __init__(self, requests_per_minute: int = 30):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        minute_ago = now - 60

        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if req_time > minute_ago
        ]

        # Check if under limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return False

        # Add new request
        self.requests[client_ip].append(now)
        return True

    def get_retry_after(self, client_ip: str) -> int:
        if not self.requests[client_ip]:
            return 0
        oldest_request = min(self.requests[client_ip])
        return max(0, int(60 - (time.time() - oldest_request)))


rate_limiter = RateLimiter(requests_per_minute=30)


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


# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Skip rate limiting for health checks and static files
    if request.url.path in ["/", "/health", "/docs", "/openapi.json"]:
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"

    if not rate_limiter.is_allowed(client_ip):
        retry_after = rate_limiter.get_retry_after(client_ip)
        return JSONResponse(
            status_code=429,
            content={
                "detail": "Too many requests. Please slow down.",
                "retry_after": retry_after
            },
            headers={"Retry-After": str(retry_after)}
        )

    return await call_next(request)


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

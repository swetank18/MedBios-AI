"""
MedBios AI — FastAPI Application Entrypoint
AI-powered clinical report intelligence platform
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import APP_NAME, APP_VERSION, CORS_ORIGINS, API_PREFIX
from database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="AI-powered clinical report intelligence platform",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
from routers.reports import router as reports_router  # noqa: E402
app.include_router(reports_router, prefix=f"{API_PREFIX}/reports", tags=["Reports"])


@app.get("/")
async def root():
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "endpoints": {
            "upload_report": f"{API_PREFIX}/reports/upload",
            "list_reports": f"{API_PREFIX}/reports",
            "docs": "/docs",
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

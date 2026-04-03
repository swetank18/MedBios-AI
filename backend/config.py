"""
MedBios AI — Configuration
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Paths
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# Database
# Render gives postgresql:// or postgres://, asyncpg needs postgresql+asyncpg://
_raw_url = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{BASE_DIR / 'medbios.db'}")
if _raw_url.startswith("postgres://"):
    _raw_url = _raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _raw_url.startswith("postgresql://") and "+asyncpg" not in _raw_url:
    _raw_url = _raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
DATABASE_URL = _raw_url

# API
API_PREFIX = "/api"
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,https://med-bios-ai-djn7.vercel.app,https://medbios-ai-backend.onrender.com"
).split(",")

# OCR
TESSERACT_CMD = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")

# App
APP_NAME = "MedBios AI"
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

"""
MedBios AI — OCR Service
Extracts text from PDF medical reports using:
  1. pdfplumber (text-based PDFs)
  2. pytesseract / Tesseract (scanned PDFs — fallback)
  3. Gemini Vision LLM (complex / low-quality scans — fallback)
"""
import base64
import io
import logging
import os
from pathlib import Path

import pdfplumber

logger = logging.getLogger(__name__)

# ── Tesseract (optional) ────────────────────────────────────────────────────
try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_bytes
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract/pdf2image not available — scanned PDF OCR disabled")

# ── Gemini Vision (optional) ─────────────────────────────────────────────────
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai not installed — Gemini Vision OCR disabled")

# Minimum character threshold to consider OCR successful
_MIN_TEXT_CHARS = 50


def _configure_gemini():
    """Configure Gemini client from environment."""
    api_key = os.getenv("GOOGLE_API_KEY", "")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    model_name = os.getenv("LLM_MODEL", "gemini-2.0-flash")
    return genai.GenerativeModel(model_name)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from a PDF file using a 3-tier strategy:
      1. pdfplumber   — fast, accurate for text PDFs
      2. Tesseract    — scanned / image PDFs (if installed)
      3. Gemini Vision — complex / low-quality scans (if API key set)
    """
    # Tier 1: pdfplumber
    text = _extract_with_pdfplumber(file_bytes)
    if len(text.strip()) >= _MIN_TEXT_CHARS:
        return text.strip()

    # Tier 2: Tesseract
    if TESSERACT_AVAILABLE:
        logger.info("Low text yield from pdfplumber, attempting Tesseract OCR...")
        ocr_text = _extract_with_ocr(file_bytes)
        if len(ocr_text.strip()) > len(text.strip()):
            text = ocr_text
        if len(text.strip()) >= _MIN_TEXT_CHARS:
            return text.strip()

    # Tier 3: Gemini Vision
    if GEMINI_AVAILABLE and os.getenv("GOOGLE_API_KEY"):
        logger.info("Low text yield from Tesseract, attempting Gemini Vision OCR...")
        vision_text = _extract_with_gemini_vision(file_bytes)
        if len(vision_text.strip()) > len(text.strip()):
            text = vision_text

    return text.strip()


def _extract_with_pdfplumber(file_bytes: bytes) -> str:
    """Extract text from text-based PDF using pdfplumber."""
    text_parts = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

                # Also extract tables
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if row:
                            cleaned = [str(cell).strip() if cell else "" for cell in row]
                            text_parts.append(" | ".join(cleaned))
    except Exception as e:
        logger.error(f"pdfplumber extraction failed: {e}")

    return "\n".join(text_parts)


def _extract_with_ocr(file_bytes: bytes) -> str:
    """Extract text from scanned PDF using Tesseract OCR."""
    if not TESSERACT_AVAILABLE:
        return ""

    text_parts = []
    try:
        images = convert_from_bytes(file_bytes, dpi=300)
        for img in images:
            page_text = pytesseract.image_to_string(img, lang="eng")
            if page_text:
                text_parts.append(page_text)
    except Exception as e:
        logger.error(f"Tesseract OCR extraction failed: {e}")

    return "\n".join(text_parts)


def _extract_with_gemini_vision(file_bytes: bytes) -> str:
    """
    Extract text from a scanned/complex PDF using Gemini Vision LLM.
    Converts each page to a JPEG image and sends it to Gemini with a
    structured prompt asking for verbatim lab value extraction.
    """
    if not GEMINI_AVAILABLE:
        return ""

    model = _configure_gemini()
    if model is None:
        logger.warning("Gemini Vision skipped — no GOOGLE_API_KEY")
        return ""

    prompt = (
        "You are a medical OCR assistant. Extract ALL text from this lab report image "
        "exactly as it appears, preserving test names, values, units, and reference ranges. "
        "Output plain text only — no markdown, no commentary. "
        "Use the format: 'TestName: Value Unit' on each line where possible."
    )

    pages_text = []

    # Try to convert PDF pages to images
    if TESSERACT_AVAILABLE:
        try:
            images = convert_from_bytes(file_bytes, dpi=200)
        except Exception as e:
            logger.error(f"pdf2image conversion failed for Gemini Vision: {e}")
            images = []
    else:
        # Fallback: treat file_bytes as a single image
        images = []
        try:
            from PIL import Image as PILImage
            img = PILImage.open(io.BytesIO(file_bytes))
            images = [img]
        except Exception:
            pass

    for i, img in enumerate(images[:5]):  # cap at 5 pages to control token usage
        try:
            # Convert PIL Image to JPEG bytes → base64
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85)
            img_bytes = buf.getvalue()
            img_b64 = base64.b64encode(img_bytes).decode("utf-8")

            response = model.generate_content([
                {"mime_type": "image/jpeg", "data": img_b64},
                prompt,
            ])
            page_text = response.text or ""
            if page_text.strip():
                pages_text.append(page_text.strip())
                logger.info(f"Gemini Vision extracted {len(page_text)} chars from page {i+1}")
        except Exception as e:
            logger.error(f"Gemini Vision failed on page {i+1}: {e}")

    return "\n".join(pages_text)


def extract_text_from_image(file_bytes: bytes) -> str:
    """Extract text from a medical report image (PNG, JPG, etc.)."""
    # Try Gemini Vision first (better accuracy for complex images)
    if GEMINI_AVAILABLE and os.getenv("GOOGLE_API_KEY"):
        try:
            model = _configure_gemini()
            if model:
                from PIL import Image as PILImage
                img = PILImage.open(io.BytesIO(file_bytes))
                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=85)
                img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
                prompt = (
                    "Extract all text from this medical lab report image verbatim. "
                    "Preserve test names, values, units, and reference ranges. Plain text only."
                )
                response = model.generate_content([
                    {"mime_type": "image/jpeg", "data": img_b64},
                    prompt,
                ])
                text = response.text or ""
                if len(text.strip()) >= _MIN_TEXT_CHARS:
                    return text.strip()
        except Exception as e:
            logger.warning(f"Gemini Vision image OCR failed, falling back to Tesseract: {e}")

    # Fallback to Tesseract
    if not TESSERACT_AVAILABLE:
        raise RuntimeError("Tesseract OCR is not available and Gemini Vision failed")

    try:
        from PIL import Image
        image = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(image, lang="eng")
    except Exception as e:
        logger.error(f"Image OCR failed: {e}")
        raise

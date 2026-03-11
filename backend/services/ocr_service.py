"""
MedBios AI — OCR Service
Extracts text from PDF medical reports using pdfplumber (text) and pytesseract (scanned).
"""
import io
import logging
from pathlib import Path

import pdfplumber

logger = logging.getLogger(__name__)

# Try to import pytesseract; graceful fallback if Tesseract not installed
try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_bytes
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract/pdf2image not available — scanned PDF OCR disabled")


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from a PDF file.
    
    Strategy:
    1. Try pdfplumber (works for text-based PDFs)
    2. Fall back to pytesseract OCR (works for scanned/image PDFs)
    """
    text = _extract_with_pdfplumber(file_bytes)

    # If very little text was extracted, try OCR
    if len(text.strip()) < 50 and TESSERACT_AVAILABLE:
        logger.info("Low text yield from pdfplumber, attempting OCR...")
        ocr_text = _extract_with_ocr(file_bytes)
        if len(ocr_text.strip()) > len(text.strip()):
            text = ocr_text

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

                # Also try to extract tables
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
        logger.error(f"OCR extraction failed: {e}")

    return "\n".join(text_parts)


def extract_text_from_image(file_bytes: bytes) -> str:
    """Extract text from a medical report image (PNG, JPG, etc.)."""
    if not TESSERACT_AVAILABLE:
        raise RuntimeError("Tesseract OCR is not available")

    try:
        image = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(image, lang="eng")
    except Exception as e:
        logger.error(f"Image OCR failed: {e}")
        raise

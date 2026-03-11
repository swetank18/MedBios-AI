"""
MedBios AI — NLP Service
Extracts lab values and classifies document types from medical report text.
"""
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Lab Value Extraction Patterns ──────────────────────────────────────────

# Pattern: "Test Name: 8.9 g/dL" or "Test Name  8.9  g/dL" or "Test Name - 8.9 g/dL"
# Also handles "Test Name: 8.9 (ref: 12.0 - 17.5) g/dL"
LAB_PATTERNS = [
    # Pattern 1: "Test Name : Value Unit" or "Test Name: Value Unit"
    re.compile(
        r"(?P<name>[A-Za-z][A-Za-z0-9\s\.\-\(\)/]+?)"
        r"\s*[:=\-]\s*"
        r"(?P<value>\d+\.?\d*)\s*"
        r"(?P<unit>[a-zA-Z/%µμ][a-zA-Z/µμ\s%\.]*?)?"
        r"(?:\s*[\(\[]?\s*(?:ref|reference|normal|range)?\s*[:=]?\s*(?P<ref_min>\d+\.?\d*)\s*[-–]\s*(?P<ref_max>\d+\.?\d*)\s*[\)\]]?)?"
        r"\s*$",
        re.MULTILINE | re.IGNORECASE,
    ),
    # Pattern 2: Table format "Test Name | Value | Unit | Ref Range"
    re.compile(
        r"(?P<name>[A-Za-z][A-Za-z0-9\s\.\-\(\)/]+?)"
        r"\s*\|\s*"
        r"(?P<value>\d+\.?\d*)\s*"
        r"\|?\s*(?P<unit>[a-zA-Z/%µμ][a-zA-Z/µμ\s%\.]*?)?"
        r"(?:\s*\|?\s*(?P<ref_min>\d+\.?\d*)\s*[-–]\s*(?P<ref_max>\d+\.?\d*))?"
        r"\s*$",
        re.MULTILINE | re.IGNORECASE,
    ),
]

# Known test names to look for specifically (improves recall)
KNOWN_TESTS = [
    "hemoglobin", "hb", "hgb", "haemoglobin",
    "hematocrit", "hct", "pcv",
    "rbc", "red blood cell", "red blood cells",
    "wbc", "white blood cell", "white blood cells",
    "platelets", "platelet count", "plt",
    "mcv", "mch", "mchc", "rdw",
    "glucose", "fasting glucose", "fbs", "blood sugar", "random glucose",
    "hba1c", "a1c", "glycated hemoglobin", "glycosylated hemoglobin",
    "bun", "blood urea nitrogen", "urea",
    "creatinine", "serum creatinine", "creat",
    "egfr", "estimated gfr", "glomerular filtration rate",
    "sodium", "na", "potassium", "k", "chloride", "cl", "co2", "calcium", "ca",
    "total cholesterol", "cholesterol",
    "ldl", "ldl cholesterol", "ldl-c", "low density lipoprotein",
    "hdl", "hdl cholesterol", "hdl-c", "high density lipoprotein",
    "triglycerides", "tg", "trigs",
    "vldl",
    "alt", "sgpt", "alanine aminotransferase",
    "ast", "sgot", "aspartate aminotransferase",
    "alp", "alkaline phosphatase",
    "bilirubin", "total bilirubin", "direct bilirubin",
    "albumin", "total protein",
    "ggt", "gamma gt",
    "tsh", "thyroid stimulating hormone",
    "t3", "t4", "free t3", "free t4",
    "ferritin", "iron", "serum iron", "tibc",
    "transferrin saturation", "tsat",
    "crp", "c-reactive protein", "hs-crp",
    "esr", "sed rate", "sedimentation rate",
    "vitamin d", "vit d", "25-oh vitamin d",
    "vitamin b12", "vit b12", "cobalamin",
    "folate", "folic acid",
    "uric acid",
]


def extract_lab_values(text: str) -> list[dict]:
    """
    Extract lab test values from medical report text.
    
    Returns: [{"test_name": str, "value": float, "unit": str|None, "raw_text": str}, ...]
    """
    if not text:
        return []

    results = []
    seen = set()

    # Strategy 1: Pattern-based extraction
    for pattern in LAB_PATTERNS:
        for match in pattern.finditer(text):
            name = match.group("name").strip()
            try:
                value = float(match.group("value"))
            except (ValueError, TypeError):
                continue

            unit = (match.group("unit") or "").strip() if match.group("unit") else None
            
            # Skip if name is too short or looks like noise
            if len(name) < 2 or name.lower() in ("page", "date", "time", "no", "sr", "age", "sex", "name", "id"):
                continue

            key = (name.lower().strip(), value)
            if key not in seen:
                seen.add(key)
                entry = {
                    "test_name": name.strip(),
                    "value": value,
                    "unit": unit,
                    "raw_text": match.group(0).strip(),
                }
                # Add reference range if captured
                try:
                    ref_min = match.group("ref_min")
                    ref_max = match.group("ref_max")
                    if ref_min and ref_max:
                        entry["reported_ref_min"] = float(ref_min)
                        entry["reported_ref_max"] = float(ref_max)
                except (IndexError, ValueError):
                    pass
                results.append(entry)

    # Strategy 2: Targeted extraction for known test names
    for test_name in KNOWN_TESTS:
        # Already extracted?
        if any(test_name.lower() in r["test_name"].lower() for r in results):
            continue

        pattern = re.compile(
            rf"(?:^|\s){re.escape(test_name)}\s*[:=\-\|]?\s*(\d+\.?\d*)\s*([a-zA-Z/%µμ][a-zA-Z/µμ\s%\.]*)?",
            re.IGNORECASE | re.MULTILINE,
        )
        match = pattern.search(text)
        if match:
            try:
                value = float(match.group(1))
            except (ValueError, TypeError):
                continue

            key = (test_name.lower(), value)
            if key not in seen:
                seen.add(key)
                results.append({
                    "test_name": test_name,
                    "value": value,
                    "unit": (match.group(2) or "").strip() or None,
                    "raw_text": match.group(0).strip(),
                })

    logger.info(f"Extracted {len(results)} lab values from text")
    return results


# ── Document Classification ───────────────────────────────────────────────

DOCUMENT_SIGNATURES = {
    "lab_report": [
        "hemoglobin", "hematocrit", "cbc", "complete blood count",
        "lipid panel", "metabolic panel", "glucose", "creatinine",
        "cholesterol", "triglycerides", "laboratory report", "blood test",
        "lab results", "pathology report", "hematology",
    ],
    "radiology_report": [
        "x-ray", "ct scan", "mri", "ultrasound", "impression",
        "findings", "radiology", "imaging", "radiograph",
        "contrast", "modality", "scan report",
    ],
    "prescription": [
        "rx", "prescription", "tablet", "capsule", "mg daily",
        "twice daily", "once daily", "before meals", "after meals",
        "medications", "dosage", "refill",
    ],
    "clinical_note": [
        "chief complaint", "history of present illness", "physical examination",
        "assessment", "plan", "follow up", "review of systems",
        "past medical history", "hpi", "ros",
    ],
    "discharge_summary": [
        "discharge summary", "admitted", "discharged", "hospital course",
        "discharge diagnosis", "discharge medications",
    ],
}


def classify_document_type(text: str) -> str:
    """
    Classify the type of medical document from its text content.
    Returns: one of 'lab_report', 'radiology_report', 'prescription', 
             'clinical_note', 'discharge_summary', 'unknown'
    """
    text_lower = text.lower()
    scores = {}

    for doc_type, keywords in DOCUMENT_SIGNATURES.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        scores[doc_type] = score

    if not scores or max(scores.values()) == 0:
        return "unknown"

    return max(scores, key=scores.get)


def extract_patient_info(text: str) -> dict:
    """Attempt to extract patient information from report text."""
    info = {"name": None, "age": None, "gender": None}

    # Name patterns
    name_patterns = [
        r"(?:patient\s*name|name)\s*[:=]\s*([A-Za-z\s\.]+?)(?:\n|$|\s{2,})",
        r"(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Za-z\s]+?)(?:\n|$|\s{2,})",
    ]
    for pat in name_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            info["name"] = m.group(1).strip()[:200]
            break

    # Age
    age_match = re.search(r"(?:age|aged?)\s*[:=]?\s*(\d{1,3})\s*(?:yrs?|years?|y)?", text, re.IGNORECASE)
    if age_match:
        age = int(age_match.group(1))
        if 0 < age < 150:
            info["age"] = age

    # Gender
    gender_match = re.search(r"(?:sex|gender)\s*[:=]\s*(male|female|m|f)", text, re.IGNORECASE)
    if gender_match:
        g = gender_match.group(1).lower()
        info["gender"] = "male" if g in ("male", "m") else "female"

    return info

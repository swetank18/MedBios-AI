"""
MedBios AI — Reference Ranges for Common Lab Tests
Normal ranges + abnormality detection with severity classification.
"""

# Reference ranges: {test_name: (min, max, unit, critical_low, critical_high)}
# critical_low/critical_high are thresholds for "critical" status (None = no critical threshold)
REFERENCE_RANGES = {
    # Complete Blood Count (CBC)
    "hemoglobin": {"min": 12.0, "max": 17.5, "unit": "g/dL", "critical_low": 7.0, "critical_high": 20.0},
    "hematocrit": {"min": 36.0, "max": 50.0, "unit": "%", "critical_low": 20.0, "critical_high": 60.0},
    "rbc": {"min": 4.0, "max": 6.0, "unit": "M/uL", "critical_low": 2.5, "critical_high": 7.5},
    "wbc": {"min": 4.0, "max": 11.0, "unit": "K/uL", "critical_low": 2.0, "critical_high": 30.0},
    "platelets": {"min": 150.0, "max": 400.0, "unit": "K/uL", "critical_low": 50.0, "critical_high": 1000.0},
    "mcv": {"min": 80.0, "max": 100.0, "unit": "fL", "critical_low": None, "critical_high": None},
    "mch": {"min": 27.0, "max": 33.0, "unit": "pg", "critical_low": None, "critical_high": None},
    "mchc": {"min": 32.0, "max": 36.0, "unit": "g/dL", "critical_low": None, "critical_high": None},
    "rdw": {"min": 11.5, "max": 14.5, "unit": "%", "critical_low": None, "critical_high": None},

    # Metabolic Panel
    "glucose": {"min": 70.0, "max": 100.0, "unit": "mg/dL", "critical_low": 40.0, "critical_high": 400.0},
    "fasting_glucose": {"min": 70.0, "max": 100.0, "unit": "mg/dL", "critical_low": 40.0, "critical_high": 400.0},
    "hba1c": {"min": 4.0, "max": 5.6, "unit": "%", "critical_low": None, "critical_high": 10.0},
    "bun": {"min": 7.0, "max": 20.0, "unit": "mg/dL", "critical_low": None, "critical_high": 100.0},
    "creatinine": {"min": 0.6, "max": 1.2, "unit": "mg/dL", "critical_low": None, "critical_high": 10.0},
    "egfr": {"min": 90.0, "max": 120.0, "unit": "mL/min", "critical_low": 15.0, "critical_high": None},
    "sodium": {"min": 136.0, "max": 145.0, "unit": "mEq/L", "critical_low": 120.0, "critical_high": 160.0},
    "potassium": {"min": 3.5, "max": 5.0, "unit": "mEq/L", "critical_low": 2.5, "critical_high": 6.5},
    "calcium": {"min": 8.5, "max": 10.5, "unit": "mg/dL", "critical_low": 6.0, "critical_high": 13.0},
    "chloride": {"min": 98.0, "max": 106.0, "unit": "mEq/L", "critical_low": None, "critical_high": None},
    "co2": {"min": 23.0, "max": 29.0, "unit": "mEq/L", "critical_low": 10.0, "critical_high": 40.0},

    # Lipid Panel
    "total_cholesterol": {"min": 0.0, "max": 200.0, "unit": "mg/dL", "critical_low": None, "critical_high": 300.0},
    "ldl": {"min": 0.0, "max": 100.0, "unit": "mg/dL", "critical_low": None, "critical_high": 190.0},
    "hdl": {"min": 40.0, "max": 100.0, "unit": "mg/dL", "critical_low": None, "critical_high": None},
    "triglycerides": {"min": 0.0, "max": 150.0, "unit": "mg/dL", "critical_low": None, "critical_high": 500.0},
    "vldl": {"min": 5.0, "max": 40.0, "unit": "mg/dL", "critical_low": None, "critical_high": None},

    # Iron Studies
    "ferritin": {"min": 12.0, "max": 300.0, "unit": "ng/mL", "critical_low": None, "critical_high": 1000.0},
    "iron": {"min": 60.0, "max": 170.0, "unit": "mcg/dL", "critical_low": None, "critical_high": None},
    "tibc": {"min": 250.0, "max": 370.0, "unit": "mcg/dL", "critical_low": None, "critical_high": None},
    "transferrin_saturation": {"min": 20.0, "max": 50.0, "unit": "%", "critical_low": None, "critical_high": None},

    # Liver Function
    "alt": {"min": 7.0, "max": 56.0, "unit": "U/L", "critical_low": None, "critical_high": 1000.0},
    "ast": {"min": 10.0, "max": 40.0, "unit": "U/L", "critical_low": None, "critical_high": 1000.0},
    "alp": {"min": 44.0, "max": 147.0, "unit": "U/L", "critical_low": None, "critical_high": None},
    "bilirubin_total": {"min": 0.1, "max": 1.2, "unit": "mg/dL", "critical_low": None, "critical_high": 15.0},
    "bilirubin_direct": {"min": 0.0, "max": 0.3, "unit": "mg/dL", "critical_low": None, "critical_high": None},
    "albumin": {"min": 3.4, "max": 5.4, "unit": "g/dL", "critical_low": 1.5, "critical_high": None},
    "total_protein": {"min": 6.0, "max": 8.3, "unit": "g/dL", "critical_low": None, "critical_high": None},
    "ggt": {"min": 9.0, "max": 48.0, "unit": "U/L", "critical_low": None, "critical_high": None},

    # Thyroid
    "tsh": {"min": 0.4, "max": 4.0, "unit": "mIU/L", "critical_low": 0.01, "critical_high": 100.0},
    "t3": {"min": 80.0, "max": 200.0, "unit": "ng/dL", "critical_low": None, "critical_high": None},
    "t4": {"min": 5.0, "max": 12.0, "unit": "mcg/dL", "critical_low": 2.0, "critical_high": 20.0},
    "free_t4": {"min": 0.8, "max": 1.8, "unit": "ng/dL", "critical_low": None, "critical_high": None},
    "free_t3": {"min": 2.3, "max": 4.2, "unit": "pg/mL", "critical_low": None, "critical_high": None},

    # Inflammatory Markers
    "crp": {"min": 0.0, "max": 3.0, "unit": "mg/L", "critical_low": None, "critical_high": None},
    "esr": {"min": 0.0, "max": 20.0, "unit": "mm/hr", "critical_low": None, "critical_high": None},

    # Vitamins
    "vitamin_d": {"min": 30.0, "max": 100.0, "unit": "ng/mL", "critical_low": None, "critical_high": 150.0},
    "vitamin_b12": {"min": 200.0, "max": 900.0, "unit": "pg/mL", "critical_low": None, "critical_high": None},
    "folate": {"min": 2.7, "max": 17.0, "unit": "ng/mL", "critical_low": None, "critical_high": None},

    # Uric Acid
    "uric_acid": {"min": 3.0, "max": 7.0, "unit": "mg/dL", "critical_low": None, "critical_high": 12.0},
}

# Aliases — map common name variants to canonical names
ALIASES = {
    "hb": "hemoglobin", "hgb": "hemoglobin", "haemoglobin": "hemoglobin",
    "hct": "hematocrit", "pcv": "hematocrit",
    "red blood cells": "rbc", "red blood cell count": "rbc",
    "white blood cells": "wbc", "white blood cell count": "wbc",
    "plt": "platelets", "platelet count": "platelets",
    "mean corpuscular volume": "mcv",
    "mean corpuscular hemoglobin": "mch",
    "blood urea nitrogen": "bun", "urea": "bun",
    "serum creatinine": "creatinine", "creat": "creatinine",
    "estimated gfr": "egfr", "glomerular filtration rate": "egfr",
    "fbs": "fasting_glucose", "fasting blood sugar": "fasting_glucose",
    "blood sugar": "glucose", "random glucose": "glucose",
    "glycated hemoglobin": "hba1c", "a1c": "hba1c", "glycosylated hemoglobin": "hba1c",
    "cholesterol": "total_cholesterol", "total chol": "total_cholesterol",
    "ldl cholesterol": "ldl", "ldl-c": "ldl", "low density lipoprotein": "ldl",
    "hdl cholesterol": "hdl", "hdl-c": "hdl", "high density lipoprotein": "hdl",
    "tg": "triglycerides", "trigs": "triglycerides",
    "sgpt": "alt", "alanine aminotransferase": "alt", "alanine transaminase": "alt",
    "sgot": "ast", "aspartate aminotransferase": "ast", "aspartate transaminase": "ast",
    "alkaline phosphatase": "alp",
    "total bilirubin": "bilirubin_total", "t. bilirubin": "bilirubin_total",
    "direct bilirubin": "bilirubin_direct", "d. bilirubin": "bilirubin_direct",
    "gamma gt": "ggt", "gamma glutamyl transferase": "ggt",
    "thyroid stimulating hormone": "tsh",
    "triiodothyronine": "t3",
    "thyroxine": "t4",
    "c-reactive protein": "crp", "hs-crp": "crp",
    "sed rate": "esr", "sedimentation rate": "esr",
    "vit d": "vitamin_d", "25-oh vitamin d": "vitamin_d", "25 hydroxy vitamin d": "vitamin_d",
    "vit b12": "vitamin_b12", "cobalamin": "vitamin_b12",
    "folic acid": "folate",
    "serum iron": "iron",
    "total iron binding capacity": "tibc",
    "tsat": "transferrin_saturation",
}


def normalize_test_name(raw_name: str) -> str:
    """Normalize a test name to its canonical form."""
    cleaned = raw_name.strip().lower().replace("_", " ").replace("-", " ")
    # Direct match
    if cleaned.replace(" ", "_") in REFERENCE_RANGES:
        return cleaned.replace(" ", "_")
    # Alias match
    if cleaned in ALIASES:
        return ALIASES[cleaned]
    # Partial match
    for alias, canonical in ALIASES.items():
        if alias in cleaned or cleaned in alias:
            return canonical
    return cleaned.replace(" ", "_")


def detect_abnormals(lab_values: list[dict]) -> list[dict]:
    """
    Detect abnormal lab values by comparing against reference ranges.

    Input:  [{"test_name": "hemoglobin", "value": 8.9, "unit": "g/dL"}, ...]
    Output: Same list with added fields: status, reference_min, reference_max
    """
    results = []
    for lab in lab_values:
        canonical = normalize_test_name(lab.get("test_name", ""))
        ref = REFERENCE_RANGES.get(canonical)

        entry = {
            **lab,
            "canonical_name": canonical,
            "status": "normal",
            "reference_min": None,
            "reference_max": None,
        }

        if ref and lab.get("value") is not None:
            entry["reference_min"] = ref["min"]
            entry["reference_max"] = ref["max"]
            entry["expected_unit"] = ref["unit"]
            value = lab["value"]

            if ref["critical_low"] is not None and value <= ref["critical_low"]:
                entry["status"] = "critical_low"
            elif ref["critical_high"] is not None and value >= ref["critical_high"]:
                entry["status"] = "critical_high"
            elif value < ref["min"]:
                entry["status"] = "low"
            elif value > ref["max"]:
                entry["status"] = "high"
            else:
                entry["status"] = "normal"

        results.append(entry)

    return results

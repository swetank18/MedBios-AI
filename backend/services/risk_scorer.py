"""
MedBios AI — Risk Scoring System
Computes composite risk scores per organ system based on lab values and clinical insights.
"""
import logging

logger = logging.getLogger(__name__)


def compute_risk_scores(lab_values: list[dict], insights: list[dict]) -> dict:
    """
    Compute composite risk scores per organ system.
    
    Returns: {
        "overall": float (0-100),
        "organ_systems": {
            "cardiovascular": {"score": float, "level": str, "factors": list},
            ...
        }
    }
    """
    organ_systems = {}

    # Confidence to numeric weight
    conf_weight = {"high": 3.0, "medium": 2.0, "low": 1.0}

    # Status severity weight
    status_weight = {
        "critical_low": 4.0, "critical_high": 4.0,
        "low": 2.0, "high": 2.0,
        "normal": 0.0,
    }

    # ── Compute insight-based scores ──
    category_map = {
        "Hematology": "hematological",
        "Cardiovascular": "cardiovascular",
        "Nephrology": "renal",
        "Endocrinology": "metabolic",
        "Hepatology": "hepatic",
        "Electrolytes": "electrolyte",
        "Immunology": "inflammatory",
        "Nutrition": "nutritional",
        "Rheumatology": "inflammatory",
    }

    for insight in insights:
        cat = insight.get("category", "General")
        system = category_map.get(cat, cat.lower())

        if system not in organ_systems:
            organ_systems[system] = {"raw_score": 0, "factors": [], "max_possible": 0}

        weight = conf_weight.get(insight.get("confidence", "low"), 1.0)
        organ_systems[system]["raw_score"] += weight
        organ_systems[system]["max_possible"] += 3.0
        organ_systems[system]["factors"].append(insight["condition"])

    # ── Add abnormal lab severity ──
    for lab in lab_values:
        status = lab.get("status", "normal")
        if status == "normal":
            continue
        sw = status_weight.get(status, 0)
        # Map lab tests to organ systems
        canonical = lab.get("canonical_name", "")
        system = _lab_to_system(canonical)
        if system:
            if system not in organ_systems:
                organ_systems[system] = {"raw_score": 0, "factors": [], "max_possible": 0}
            organ_systems[system]["raw_score"] += sw * 0.5
            organ_systems[system]["max_possible"] += 2.0

    # ── Normalize scores to 0-100 ──
    result = {}
    total_score = 0
    total_max = 0

    for system, data in organ_systems.items():
        max_p = max(data["max_possible"], 1)
        score = min((data["raw_score"] / max_p) * 100, 100)
        level = _score_to_level(score)
        result[system] = {
            "score": round(score, 1),
            "level": level,
            "factors": data["factors"],
        }
        total_score += score
        total_max += 100

    overall = round(total_score / max(len(organ_systems), 1), 1)

    return {
        "overall": overall,
        "overall_level": _score_to_level(overall),
        "organ_systems": result,
    }


def _lab_to_system(canonical_name: str) -> str | None:
    """Map a lab test to its organ system."""
    mapping = {
        "hemoglobin": "hematological", "hematocrit": "hematological",
        "rbc": "hematological", "wbc": "hematological", "platelets": "hematological",
        "mcv": "hematological", "mch": "hematological",
        "ldl": "cardiovascular", "hdl": "cardiovascular",
        "total_cholesterol": "cardiovascular", "triglycerides": "cardiovascular",
        "creatinine": "renal", "bun": "renal", "egfr": "renal",
        "glucose": "metabolic", "fasting_glucose": "metabolic", "hba1c": "metabolic",
        "alt": "hepatic", "ast": "hepatic", "alp": "hepatic",
        "bilirubin_total": "hepatic", "albumin": "hepatic",
        "tsh": "metabolic", "t3": "metabolic", "t4": "metabolic",
        "sodium": "electrolyte", "potassium": "electrolyte", "calcium": "electrolyte",
        "crp": "inflammatory", "esr": "inflammatory",
        "ferritin": "hematological", "iron": "hematological",
        "vitamin_d": "nutritional", "vitamin_b12": "nutritional",
    }
    return mapping.get(canonical_name)


def _score_to_level(score: float) -> str:
    """Convert numeric score to risk level."""
    if score >= 70:
        return "critical"
    elif score >= 50:
        return "high"
    elif score >= 30:
        return "moderate"
    elif score >= 10:
        return "low"
    return "minimal"

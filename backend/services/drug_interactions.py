"""
MedBios AI — Drug Interaction Detection Engine
Detects potential drug-drug and drug-lab interactions from medications and lab values.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════
# Drug Interaction Knowledge Base
# ═══════════════════════════════════════════════════════════════

DRUG_INTERACTIONS = {
    # (drug_a, drug_b) -> interaction details
    ("warfarin", "aspirin"): {
        "severity": "high",
        "effect": "Increased bleeding risk",
        "mechanism": "Both drugs inhibit clotting through different mechanisms. Combined use significantly increases hemorrhage risk.",
        "recommendation": "Monitor INR closely. Consider alternative antiplatelet agent.",
    },
    ("warfarin", "ibuprofen"): {
        "severity": "high",
        "effect": "Increased bleeding risk + GI bleeding",
        "mechanism": "NSAIDs inhibit platelet function and can cause GI ulceration, compounding warfarin's anticoagulant effect.",
        "recommendation": "Avoid combination. Use acetaminophen for pain if possible.",
    },
    ("metformin", "contrast dye"): {
        "severity": "high",
        "effect": "Lactic acidosis risk",
        "mechanism": "Iodinated contrast can impair renal function, reducing metformin clearance and causing dangerous lactic acid buildup.",
        "recommendation": "Discontinue metformin 48h before and after contrast procedures. Check renal function before resuming.",
    },
    ("ace inhibitor", "potassium supplement"): {
        "severity": "high",
        "effect": "Hyperkalemia risk",
        "mechanism": "ACE inhibitors reduce aldosterone, decreasing potassium excretion. Additional potassium can cause dangerous hyperkalemia.",
        "recommendation": "Monitor serum potassium closely. Avoid potassium supplements unless serum K+ is documented low.",
    },
    ("ace inhibitor", "spironolactone"): {
        "severity": "high",
        "effect": "Severe hyperkalemia",
        "mechanism": "Both drugs increase serum potassium through different mechanisms. Combined use can cause life-threatening hyperkalemia.",
        "recommendation": "If combination is necessary, monitor potassium every 1-2 weeks. Start spironolactone at lowest dose.",
    },
    ("statin", "gemfibrozil"): {
        "severity": "high",
        "effect": "Rhabdomyolysis risk",
        "mechanism": "Gemfibrozil inhibits glucuronidation of statins, greatly increasing statin plasma levels and muscle toxicity risk.",
        "recommendation": "Avoid combination. Use fenofibrate instead if fibrate therapy is needed.",
    },
    ("methotrexate", "nsaid"): {
        "severity": "high",
        "effect": "Methotrexate toxicity",
        "mechanism": "NSAIDs reduce renal clearance of methotrexate, leading to toxic accumulation causing bone marrow suppression.",
        "recommendation": "Avoid NSAIDs during methotrexate therapy. Monitor CBC and renal function.",
    },
    ("ssri", "maoi"): {
        "severity": "critical",
        "effect": "Serotonin syndrome",
        "mechanism": "Both drug classes increase serotonergic activity. Combined use can cause fatal serotonin syndrome (hyperthermia, rigidity, autonomic instability).",
        "recommendation": "CONTRAINDICATED. Allow 14-day washout between SSRI and MAOI.",
    },
    ("lithium", "nsaid"): {
        "severity": "high",
        "effect": "Lithium toxicity",
        "mechanism": "NSAIDs reduce renal lithium clearance, increasing serum lithium levels to potentially toxic concentrations.",
        "recommendation": "Monitor lithium levels. Consider sulindac as a potentially safer NSAID alternative.",
    },
    ("digoxin", "amiodarone"): {
        "severity": "high",
        "effect": "Digoxin toxicity",
        "mechanism": "Amiodarone inhibits P-glycoprotein and CYP3A4, reducing digoxin clearance and increasing serum levels by 70-100%.",
        "recommendation": "Reduce digoxin dose by 50% when initiating amiodarone. Monitor digoxin levels.",
    },
    ("ciprofloxacin", "theophylline"): {
        "severity": "moderate",
        "effect": "Theophylline toxicity",
        "mechanism": "Ciprofloxacin inhibits CYP1A2, the primary enzyme metabolizing theophylline, leading to elevated theophylline levels.",
        "recommendation": "Monitor theophylline levels. Consider dose reduction or alternative antibiotic.",
    },
    ("metformin", "alcohol"): {
        "severity": "moderate",
        "effect": "Lactic acidosis and hypoglycemia",
        "mechanism": "Alcohol impairs gluconeogenesis and can potentiate metformin's effects on lactate metabolism.",
        "recommendation": "Limit alcohol intake. Educate patient on signs of lactic acidosis.",
    },
    ("insulin", "beta blocker"): {
        "severity": "moderate",
        "effect": "Masked hypoglycemia symptoms",
        "mechanism": "Beta blockers mask tachycardia and tremor — key warning signs of hypoglycemia. Can also impair glucose recovery.",
        "recommendation": "Educate patient on alternative hypoglycemia symptoms (sweating, hunger). Use cardioselective beta blockers.",
    },
    ("clopidogrel", "omeprazole"): {
        "severity": "moderate",
        "effect": "Reduced antiplatelet efficacy",
        "mechanism": "Omeprazole inhibits CYP2C19, the enzyme that converts clopidogrel to its active metabolite.",
        "recommendation": "Use pantoprazole instead — it has less CYP2C19 inhibition.",
    },
    ("levothyroxine", "calcium"): {
        "severity": "low",
        "effect": "Reduced thyroid hormone absorption",
        "mechanism": "Calcium supplements chelate levothyroxine in the GI tract, reducing its bioavailability.",
        "recommendation": "Separate administration by at least 4 hours.",
    },
    ("levothyroxine", "iron"): {
        "severity": "low",
        "effect": "Reduced thyroid hormone absorption",
        "mechanism": "Iron supplements chelate levothyroxine, decreasing absorption.",
        "recommendation": "Separate administration by at least 4 hours.",
    },
}

# ═══════════════════════════════════════════════════════════════
# Drug-Lab Interactions (medications affecting lab values)
# ═══════════════════════════════════════════════════════════════

DRUG_LAB_INTERACTIONS = {
    "warfarin": [
        {"lab": "inr", "effect": "elevated", "note": "Expected therapeutic effect. Monitor INR every 2-4 weeks."},
        {"lab": "pt", "effect": "prolonged", "note": "Expected. PT/INR should remain in target range."},
    ],
    "metformin": [
        {"lab": "glucose", "effect": "decreased", "note": "Expected therapeutic effect for diabetes management."},
        {"lab": "hba1c", "effect": "decreased", "note": "Expected therapeutic effect. Target < 7% for most patients."},
        {"lab": "vitamin b12", "effect": "decreased", "note": "Metformin can reduce B12 absorption. Monitor annually."},
        {"lab": "creatinine", "effect": "monitoring required", "note": "Check renal function before prescribing. Contraindicated if eGFR < 30."},
    ],
    "statin": [
        {"lab": "ldl cholesterol", "effect": "decreased", "note": "Expected therapeutic effect."},
        {"lab": "total cholesterol", "effect": "decreased", "note": "Expected therapeutic effect."},
        {"lab": "alt", "effect": "elevated", "note": "Statins can cause mild transaminase elevation. Check LFTs at baseline and if symptoms arise."},
        {"lab": "ast", "effect": "elevated", "note": "Mild elevation possible. Clinically significant hepatotoxicity is rare."},
        {"lab": "creatine kinase", "effect": "elevated", "note": "May indicate myopathy. Evaluate if patient reports muscle pain."},
    ],
    "ace inhibitor": [
        {"lab": "potassium", "effect": "elevated", "note": "ACE inhibitors reduce aldosterone, causing potassium retention. Monitor K+."},
        {"lab": "creatinine", "effect": "mildly elevated", "note": "Up to 30% rise in creatinine is acceptable upon initiation. Greater rises warrant evaluation."},
        {"lab": "bun", "effect": "mildly elevated", "note": "May increase due to reduced renal perfusion pressure."},
    ],
    "diuretic": [
        {"lab": "sodium", "effect": "decreased", "note": "Hyponatremia risk, especially with thiazides in elderly."},
        {"lab": "potassium", "effect": "decreased", "note": "Hypokalemia risk with loop/thiazide diuretics. Monitor electrolytes."},
        {"lab": "uric acid", "effect": "elevated", "note": "Diuretics reduce uric acid excretion. May precipitate gout."},
        {"lab": "glucose", "effect": "elevated", "note": "Thiazides can impair glucose tolerance."},
    ],
    "corticosteroid": [
        {"lab": "glucose", "effect": "elevated", "note": "Steroids cause insulin resistance. Monitor blood glucose."},
        {"lab": "wbc count", "effect": "elevated", "note": "Steroid-induced leukocytosis (demargination). Does not indicate infection."},
        {"lab": "potassium", "effect": "decreased", "note": "Mineralocorticoid effects deplete potassium."},
        {"lab": "calcium", "effect": "decreased", "note": "Long-term steroids impair calcium absorption and increase bone loss."},
    ],
    "levothyroxine": [
        {"lab": "tsh", "effect": "decreased", "note": "Expected therapeutic effect. Target TSH 0.5-2.5 mIU/L for most patients."},
        {"lab": "free t4", "effect": "increased", "note": "Expected therapeutic effect."},
    ],
    "heparin": [
        {"lab": "platelet count", "effect": "decreased", "note": "Heparin-induced thrombocytopenia (HIT) risk. Monitor platelets every 2-3 days."},
        {"lab": "ptt", "effect": "prolonged", "note": "Expected therapeutic effect. Monitor aPTT."},
    ],
    "iron supplement": [
        {"lab": "ferritin", "effect": "increased", "note": "Expected therapeutic effect."},
        {"lab": "serum iron", "effect": "increased", "note": "Expected. Avoid testing iron levels morning after supplement dose."},
        {"lab": "hemoglobin", "effect": "increased", "note": "Expected response to iron therapy over 4-8 weeks."},
    ],
}

# Common medication name aliases
DRUG_ALIASES = {
    "lisinopril": "ace inhibitor", "enalapril": "ace inhibitor", "ramipril": "ace inhibitor",
    "captopril": "ace inhibitor", "benazepril": "ace inhibitor", "perindopril": "ace inhibitor",
    "atorvastatin": "statin", "rosuvastatin": "statin", "simvastatin": "statin",
    "pravastatin": "statin", "lovastatin": "statin", "fluvastatin": "statin",
    "furosemide": "diuretic", "hydrochlorothiazide": "diuretic", "chlorthalidone": "diuretic",
    "spironolactone": "diuretic", "bumetanide": "diuretic", "indapamide": "diuretic",
    "prednisone": "corticosteroid", "prednisolone": "corticosteroid", "dexamethasone": "corticosteroid",
    "methylprednisolone": "corticosteroid", "hydrocortisone": "corticosteroid",
    "fluoxetine": "ssri", "sertraline": "ssri", "paroxetine": "ssri",
    "escitalopram": "ssri", "citalopram": "ssri", "fluvoxamine": "ssri",
    "ibuprofen": "nsaid", "naproxen": "nsaid", "diclofenac": "nsaid",
    "celecoxib": "nsaid", "indomethacin": "nsaid", "meloxicam": "nsaid",
    "phenelzine": "maoi", "tranylcypromine": "maoi", "selegiline": "maoi",
    "synthroid": "levothyroxine", "eltroxin": "levothyroxine",
}


def normalize_drug_name(name: str) -> str:
    """Normalize a medication name to its canonical drug class or name."""
    lower = name.strip().lower()
    return DRUG_ALIASES.get(lower, lower)


def detect_drug_interactions(medications: list[str]) -> dict:
    """
    Detect potential drug-drug interactions from a list of medications.

    Args:
        medications: List of medication names

    Returns:
        Dict with interactions found, severity counts, and recommendations.
    """
    if not medications or len(medications) < 2:
        return {
            "interactions": [],
            "total": 0,
            "by_severity": {"critical": 0, "high": 0, "moderate": 0, "low": 0},
        }

    # Normalize all drug names
    normalized = [(med, normalize_drug_name(med)) for med in medications]
    interactions = []

    # Check all pairs
    for i in range(len(normalized)):
        for j in range(i + 1, len(normalized)):
            orig_a, norm_a = normalized[i]
            orig_b, norm_b = normalized[j]

            # Check both orderings
            key1 = (norm_a, norm_b)
            key2 = (norm_b, norm_a)

            interaction = DRUG_INTERACTIONS.get(key1) or DRUG_INTERACTIONS.get(key2)
            if interaction:
                interactions.append({
                    "drug_a": orig_a,
                    "drug_b": orig_b,
                    "drug_a_class": norm_a,
                    "drug_b_class": norm_b,
                    **interaction,
                })

    # Count by severity
    severity_counts = {"critical": 0, "high": 0, "moderate": 0, "low": 0}
    for inter in interactions:
        sev = inter.get("severity", "low")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

    return {
        "interactions": sorted(interactions, key=lambda x: {"critical": 0, "high": 1, "moderate": 2, "low": 3}.get(x["severity"], 4)),
        "total": len(interactions),
        "by_severity": severity_counts,
    }


def detect_drug_lab_interactions(medications: list[str], lab_values: list[dict]) -> list[dict]:
    """
    Detect drugs that may be affecting lab results.

    Args:
        medications: List of medication names
        lab_values: List of lab value dicts with test_name, value, status

    Returns:
        List of drug-lab interaction findings.
    """
    findings = []

    for med in medications:
        norm_drug = normalize_drug_name(med)
        lab_effects = DRUG_LAB_INTERACTIONS.get(norm_drug, [])

        for effect in lab_effects:
            # Find matching lab value
            for lab in lab_values:
                lab_name = (lab.get("test_name") or lab.get("canonical_name", "")).lower()
                if effect["lab"].lower() in lab_name or lab_name in effect["lab"].lower():
                    findings.append({
                        "medication": med,
                        "medication_class": norm_drug,
                        "affected_lab": lab.get("test_name") or lab.get("canonical_name"),
                        "lab_value": lab.get("value"),
                        "lab_status": lab.get("status"),
                        "expected_effect": effect["effect"],
                        "clinical_note": effect["note"],
                        "is_expected": _is_expected_effect(effect["effect"], lab.get("status", "")),
                    })

    return findings


def _is_expected_effect(expected_effect: str, lab_status: str) -> bool:
    """Check if the lab result matches the drug's expected effect."""
    effect_lower = expected_effect.lower()
    if "elevated" in effect_lower or "increased" in effect_lower:
        return lab_status in ("high", "critical_high")
    elif "decreased" in effect_lower:
        return lab_status in ("low", "critical_low")
    elif "prolonged" in effect_lower:
        return lab_status in ("high", "critical_high")
    return False


def run_full_interaction_check(medications: list[str], lab_values: list[dict] = None) -> dict:
    """
    Run complete drug interaction analysis:
    1. Drug-drug interactions
    2. Drug-lab interactions (if lab values provided)
    """
    result = {
        "drug_drug_interactions": detect_drug_interactions(medications),
        "medications_analyzed": len(medications),
    }

    if lab_values:
        result["drug_lab_interactions"] = detect_drug_lab_interactions(medications, lab_values)
        result["drug_lab_count"] = len(result["drug_lab_interactions"])

    # Calculate total alert level
    dd = result["drug_drug_interactions"]
    if dd["by_severity"]["critical"] > 0:
        result["alert_level"] = "critical"
    elif dd["by_severity"]["high"] > 0:
        result["alert_level"] = "high"
    elif dd["by_severity"]["moderate"] > 0:
        result["alert_level"] = "moderate"
    elif dd["total"] > 0:
        result["alert_level"] = "low"
    else:
        result["alert_level"] = "none"

    return result

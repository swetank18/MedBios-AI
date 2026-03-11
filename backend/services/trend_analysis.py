"""
MedBios AI — Trend Analysis Service
Tracks lab values over time and detects clinically significant trends.
"""
import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)


def analyze_trends(patient_history: list[dict]) -> dict:
    """
    Analyze longitudinal trends for a patient across multiple reports.

    Args:
        patient_history: List of reports sorted by date, each containing:
            - report_date (str/datetime)
            - lab_values (list of dicts with test_name, value, status)

    Returns:
        Dict with trend analysis per test:
            - direction: improving / worsening / stable / fluctuating
            - change_rate: percentage change per period
            - alert: bool if trend is clinically significant
            - values_over_time: list of (date, value) points
            - clinical_note: interpretation string
    """
    if len(patient_history) < 2:
        return {"status": "insufficient_data", "message": "Need at least 2 reports for trend analysis", "trends": {}}

    # Collect all test values across time
    test_timeline = {}  # test_name -> [(date, value, status)]

    for report in patient_history:
        report_date = report.get("report_date") or report.get("created_at")
        if isinstance(report_date, str):
            try:
                report_date = datetime.fromisoformat(report_date.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                report_date = datetime.now()

        for lab in report.get("lab_values", []):
            test_name = lab.get("test_name", lab.get("canonical_name", ""))
            value = lab.get("value")

            if not test_name or value is None:
                continue

            try:
                value = float(value)
            except (ValueError, TypeError):
                continue

            if test_name not in test_timeline:
                test_timeline[test_name] = []
            test_timeline[test_name].append({
                "date": report_date.isoformat() if hasattr(report_date, 'isoformat') else str(report_date),
                "value": value,
                "status": lab.get("status", "normal"),
            })

    # Analyze each test
    trends = {}
    alerts = []

    for test_name, data_points in test_timeline.items():
        if len(data_points) < 2:
            continue

        # Sort chronologically
        data_points.sort(key=lambda x: x["date"])

        values = [p["value"] for p in data_points]
        first_val = values[0]
        last_val = values[-1]

        # Direction analysis
        direction = _compute_direction(values)

        # Rate of change (total % change)
        pct_change = ((last_val - first_val) / first_val * 100) if first_val != 0 else 0

        # Detect clinically significant trend
        is_alert = _is_clinically_significant(test_name, direction, pct_change, data_points)

        # Generate clinical note
        clinical_note = _generate_trend_note(test_name, direction, pct_change, first_val, last_val)

        trend_entry = {
            "test_name": test_name,
            "direction": direction,
            "change_rate_pct": round(pct_change, 1),
            "first_value": first_val,
            "latest_value": last_val,
            "data_points": data_points,
            "num_readings": len(data_points),
            "alert": is_alert,
            "clinical_note": clinical_note,
        }

        trends[test_name] = trend_entry
        if is_alert:
            alerts.append(trend_entry)

    return {
        "status": "analyzed",
        "total_tests_tracked": len(trends),
        "alerts": alerts,
        "alert_count": len(alerts),
        "trends": trends,
    }


def _compute_direction(values: list[float]) -> str:
    """Determine if a series is improving, worsening, stable, or fluctuating."""
    if len(values) < 2:
        return "stable"

    # Simple linear trend via successive differences
    diffs = [values[i+1] - values[i] for i in range(len(values)-1)]
    positive = sum(1 for d in diffs if d > 0)
    negative = sum(1 for d in diffs if d < 0)
    total = len(diffs)

    if total == 0:
        return "stable"

    # Check for fluctuation (frequent direction changes)
    direction_changes = sum(1 for i in range(len(diffs)-1) if (diffs[i] > 0) != (diffs[i+1] > 0))
    if total >= 3 and direction_changes >= total * 0.6:
        return "fluctuating"

    pct_change = abs(values[-1] - values[0]) / abs(values[0]) * 100 if values[0] != 0 else 0

    if pct_change < 5:
        return "stable"
    elif positive > negative:
        return "increasing"
    else:
        return "decreasing"


# Tests where INCREASING is BAD
_BAD_IF_INCREASING = {
    "creatinine", "bun", "glucose", "hba1c", "ldl cholesterol", "ldl",
    "total cholesterol", "triglycerides", "alt", "ast", "ggt",
    "tsh", "crp", "esr", "uric acid", "potassium", "bilirubin",
    "wbc count", "rdw", "tibc", "vldl",
}

# Tests where DECREASING is BAD
_BAD_IF_DECREASING = {
    "hemoglobin", "hematocrit", "rbc count", "platelet count",
    "hdl cholesterol", "hdl", "egfr", "calcium", "albumin",
    "ferritin", "serum iron", "transferrin saturation",
    "free t4", "free t3", "vitamin d", "vitamin b12",
    "sodium", "mcv", "mch", "mchc",
}


def _is_clinically_significant(test_name: str, direction: str, pct_change: float, data_points: list[dict]) -> bool:
    """Determine if a trend is clinically significant (worth alerting on)."""
    name_lower = test_name.lower()

    # >20% change is always significant
    if abs(pct_change) > 20:
        return True

    # Check if trend is going in a bad direction
    if direction == "increasing" and name_lower in _BAD_IF_INCREASING and abs(pct_change) > 10:
        return True
    if direction == "decreasing" and name_lower in _BAD_IF_DECREASING and abs(pct_change) > 10:
        return True

    # Status worsening: last reading is worse than first
    if len(data_points) >= 2:
        first_status = data_points[0]["status"]
        last_status = data_points[-1]["status"]
        severity = {"normal": 0, "low": 1, "high": 1, "critical_low": 2, "critical_high": 2}
        if severity.get(last_status, 0) > severity.get(first_status, 0):
            return True

    return False


def _generate_trend_note(test_name: str, direction: str, pct_change: float,
                         first_val: float, last_val: float) -> str:
    """Generate a human-readable clinical note about the trend."""
    name_lower = test_name.lower()
    abs_change = round(abs(pct_change), 1)

    if direction == "stable":
        return f"{test_name} has remained stable at approximately {last_val}."

    if direction == "fluctuating":
        return f"{test_name} shows fluctuating values between {min(first_val, last_val)} and {max(first_val, last_val)}. Consider more frequent monitoring."

    verb = "increased" if direction == "increasing" else "decreased"

    # Determine if the change is concerning
    is_bad_direction = (
        (direction == "increasing" and name_lower in _BAD_IF_INCREASING) or
        (direction == "decreasing" and name_lower in _BAD_IF_DECREASING)
    )

    if is_bad_direction and abs_change > 10:
        return f"⚠️ {test_name} has {verb} by {abs_change}% ({first_val} → {last_val}). This trend warrants clinical attention."
    elif is_bad_direction:
        return f"{test_name} has {verb} slightly by {abs_change}% ({first_val} → {last_val}). Monitor on next visit."
    else:
        return f"✅ {test_name} has {verb} by {abs_change}% ({first_val} → {last_val}), trending in a favorable direction."


def get_patient_trends(reports_data: list[dict]) -> dict:
    """
    Convenience wrapper: accepts a list of report dicts from the database
    and returns trend analysis.
    """
    # Build patient_history from DB reports
    patient_history = []
    for report in reports_data:
        patient_history.append({
            "report_date": report.get("created_at"),
            "lab_values": report.get("lab_values", []),
        })

    return analyze_trends(patient_history)

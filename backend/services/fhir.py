"""
MedBios AI — FHIR R4 Integration Service
Pure functions for constructing and parsing FHIR R4 JSON bundles.
No external FHIR libraries — plain dict construction only.
"""
import uuid
from datetime import datetime, timezone


def _new_uuid() -> str:
    return str(uuid.uuid4())


def _iso(dt) -> str:
    """Return ISO-8601 string from datetime or string, or empty string."""
    if dt is None:
        return ""
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    return str(dt)


def build_fhir_bundle(report, lab_values: list, patient_info: dict | None = None) -> dict:
    """
    Build a valid FHIR R4 Bundle (type=collection) from a report and its lab values.

    Parameters
    ----------
    report      : ORM Report object (or any object with .id, .status, .created_at)
    lab_values  : list of dicts with keys: test_name, value, unit,
                  reference_min, reference_max, status
    patient_info: optional dict with keys: name, age, gender

    Returns
    -------
    dict  — a FHIR R4 Bundle ready for JSON serialisation
    """
    entries = []

    # ── Patient resource (optional) ────────────────────────────────────────
    patient_resource_id = _new_uuid()
    patient_full_url = f"urn:uuid:{patient_resource_id}"

    if patient_info:
        name_text = patient_info.get("name") or "Unknown"
        patient_resource = {
            "resourceType": "Patient",
            "id": patient_resource_id,
            "name": [{"use": "official", "text": name_text}],
        }
        age = patient_info.get("age")
        if age is not None:
            patient_resource["extension"] = [
                {
                    "url": "http://hl7.org/fhir/StructureDefinition/patient-age",
                    "valueInteger": int(age),
                }
            ]
        gender = patient_info.get("gender")
        if gender:
            patient_resource["gender"] = gender.lower()

        entries.append({"fullUrl": patient_full_url, "resource": patient_resource})

    # ── Observation resources (one per lab value) ──────────────────────────
    observation_refs = []
    for lab in lab_values:
        obs_id = _new_uuid()
        obs_full_url = f"urn:uuid:{obs_id}"
        test_name = lab.get("test_name") or lab.get("canonical_name") or "Unknown"

        obs = {
            "resourceType": "Observation",
            "id": obs_id,
            "status": "final",
            "code": {
                "text": test_name,
                "coding": [{"display": test_name}],
            },
        }

        # valueQuantity
        value = lab.get("value")
        unit = lab.get("unit") or ""
        if value is not None:
            obs["valueQuantity"] = {
                "value": value,
                "unit": unit,
            }

        # referenceRange
        ref_min = lab.get("reference_min")
        ref_max = lab.get("reference_max")
        if ref_min is not None or ref_max is not None:
            ref_range = {}
            if ref_min is not None:
                ref_range["low"] = {"value": ref_min, "unit": unit}
            if ref_max is not None:
                ref_range["high"] = {"value": ref_max, "unit": unit}
            obs["referenceRange"] = [ref_range]

        # interpretation: H / L / N based on status field
        status = (lab.get("status") or "normal").lower()
        if status in ("high", "critical_high"):
            interp_code, interp_display = "H", "High"
        elif status in ("low", "critical_low"):
            interp_code, interp_display = "L", "Low"
        else:
            interp_code, interp_display = "N", "Normal"

        obs["interpretation"] = [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                        "code": interp_code,
                        "display": interp_display,
                    }
                ]
            }
        ]

        # subject reference (only when patient resource is present)
        if patient_info:
            obs["subject"] = {"reference": patient_full_url}

        entries.append({"fullUrl": obs_full_url, "resource": obs})
        observation_refs.append({"reference": obs_full_url})

    # ── DiagnosticReport resource ──────────────────────────────────────────
    dr_id = str(report.id)
    dr_full_url = f"urn:uuid:{dr_id}"

    # Map internal status to FHIR DiagnosticReport status
    internal_status = getattr(report, "status", "completed") or "completed"
    fhir_status_map = {
        "completed": "final",
        "processing": "registered",
        "error": "cancelled",
    }
    fhir_status = fhir_status_map.get(internal_status, "final")

    diagnostic_report = {
        "resourceType": "DiagnosticReport",
        "id": dr_id,
        "status": fhir_status,
        "code": {
            "text": "Laboratory Report",
            "coding": [{"display": "Laboratory Report"}],
        },
        "result": observation_refs,
    }

    created_at = getattr(report, "created_at", None)
    if created_at:
        diagnostic_report["issued"] = _iso(created_at)

    if patient_info:
        diagnostic_report["subject"] = {"reference": patient_full_url}

    entries.append({"fullUrl": dr_full_url, "resource": diagnostic_report})

    bundle = {
        "resourceType": "Bundle",
        "id": _new_uuid(),
        "type": "collection",
        "entry": entries,
    }
    return bundle


def parse_fhir_bundle(bundle_dict: dict) -> dict:
    """
    Extract patient info and lab values from a FHIR R4 Bundle.

    Returns
    -------
    {
        "patient_info": {"name": ..., "age": ..., "gender": ...},
        "lab_values": [
            {
                "test_name": ...,
                "value": ...,
                "unit": ...,
                "reference_min": ...,
                "reference_max": ...,
                "status": "normal" | "high" | "low",
            },
            ...
        ]
    }
    """
    patient_info = {}
    lab_values = []

    entries = bundle_dict.get("entry", [])

    for entry in entries:
        resource = entry.get("resource", {})
        resource_type = resource.get("resourceType")

        if resource_type == "Patient":
            names = resource.get("name", [])
            if names:
                patient_info["name"] = names[0].get("text") or names[0].get("family", "")
            patient_info["gender"] = resource.get("gender")
            for ext in resource.get("extension", []):
                if "patient-age" in ext.get("url", ""):
                    patient_info["age"] = ext.get("valueInteger")

        elif resource_type == "Observation":
            lab = {}

            code = resource.get("code", {})
            lab["test_name"] = code.get("text") or (
                code.get("coding", [{}])[0].get("display", "Unknown")
            )

            vq = resource.get("valueQuantity", {})
            lab["value"] = vq.get("value")
            lab["unit"] = vq.get("unit", "")

            ref_ranges = resource.get("referenceRange", [])
            if ref_ranges:
                rr = ref_ranges[0]
                lab["reference_min"] = rr.get("low", {}).get("value")
                lab["reference_max"] = rr.get("high", {}).get("value")
            else:
                lab["reference_min"] = None
                lab["reference_max"] = None

            # Map FHIR interpretation back to internal status
            interp_list = resource.get("interpretation", [])
            status = "normal"
            if interp_list:
                codings = interp_list[0].get("coding", [])
                if codings:
                    code_val = codings[0].get("code", "N")
                    if code_val == "H":
                        status = "high"
                    elif code_val == "L":
                        status = "low"
            lab["status"] = status

            lab_values.append(lab)

    return {"patient_info": patient_info, "lab_values": lab_values}

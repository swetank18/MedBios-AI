"""
MedBios AI — Notifications Router
Endpoints for email alert preferences and test email delivery.
"""
import json
import os
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from services.email_service import send_critical_alert, SMTP_USER, SMTP_PASS

logger = logging.getLogger(__name__)

router = APIRouter()

# Preferences are stored in data/notification_prefs.json keyed by user_id.
# "global" is used when no auth token is present.
_PREFS_FILE = Path(__file__).parent.parent / "data" / "notification_prefs.json"


def _load_prefs() -> dict:
    if _PREFS_FILE.exists():
        try:
            return json.loads(_PREFS_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def _save_prefs(prefs: dict) -> None:
    _PREFS_FILE.parent.mkdir(parents=True, exist_ok=True)
    _PREFS_FILE.write_text(json.dumps(prefs, indent=2), encoding="utf-8")


def _default_prefs() -> dict:
    return {
        "email_on_critical": True,
        "email_on_complete": False,
        "alert_email": "",
    }


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class TestEmailRequest(BaseModel):
    email: str


class NotificationPrefs(BaseModel):
    email_on_critical: bool = True
    email_on_complete: bool = False
    alert_email: str = ""


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/test-email")
async def test_email(body: TestEmailRequest):
    """Send a test email to verify SMTP configuration."""
    if not SMTP_USER or not SMTP_PASS:
        return {"sent": False, "reason": "SMTP not configured"}

    try:
        await send_critical_alert(
            to_email=body.email,
            patient_name="Test Patient",
            report_id="TEST-001",
            critical_findings=[
                {
                    "test_name": "Hemoglobin",
                    "value": "6.2",
                    "unit": "g/dL",
                    "direction": "Low",
                    "reference": "13.5–17.5 g/dL",
                }
            ],
        )
        return {"sent": True}
    except Exception as exc:
        logger.error(f"[Notifications] Test email failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/preferences")
async def get_preferences():
    """Return current notification preferences."""
    prefs = _load_prefs()
    user_prefs = prefs.get("global", _default_prefs())
    return user_prefs


@router.put("/preferences")
async def update_preferences(body: NotificationPrefs):
    """Update notification preferences."""
    prefs = _load_prefs()
    prefs["global"] = body.model_dump()
    _save_prefs(prefs)
    return prefs["global"]

"""
MedBios AI — Audit Logging Service
Records user actions for compliance and security auditing.
"""
import json
import logging
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


async def log_action(
    db: AsyncSession,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    user_id: str = "anonymous",
    request=None,
    status: str = "success",
    detail=None,
) -> None:
    """
    Create an AuditLog record.

    Audit failure never breaks the main flow — all exceptions are caught and logged.
    """
    try:
        from models import AuditLog  # local import to avoid circular imports

        ip_address = None
        user_agent = None
        if request is not None:
            # FastAPI Request: client.host and headers
            try:
                ip_address = request.client.host if request.client else None
            except Exception:
                pass
            try:
                user_agent = request.headers.get("user-agent")
            except Exception:
                pass

        detail_str: str | None = None
        if detail is not None:
            try:
                detail_str = json.dumps(detail) if not isinstance(detail, str) else detail
            except Exception:
                detail_str = str(detail)

        entry = AuditLog(
            timestamp=datetime.now(timezone.utc),
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
            detail=detail_str,
        )
        db.add(entry)
        await db.commit()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Audit log write failed (non-fatal): %s", exc)

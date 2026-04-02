"""
MedBios AI — Audit Log Router
Provides read access to the immutable audit trail.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import AuditLog

router = APIRouter()


@router.get("")
async def list_audit_logs(
    limit: int = Query(50, ge=1, le=500, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Records to skip"),
    action: str = Query("", description="Filter by action (partial match)"),
    resource_type: str = Query("", description="Filter by resource_type (exact match)"),
    db: AsyncSession = Depends(get_db),
):
    """
    Return paginated audit log entries, newest first.

    Query params:
      - limit / offset  — pagination
      - action          — optional substring filter on the action field
      - resource_type   — optional exact filter on resource_type
    """
    query = select(AuditLog).order_by(AuditLog.timestamp.desc())

    if action:
        query = query.where(AuditLog.action.contains(action))
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)

    # Total count (with same filters)
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    rows = (await db.execute(query.offset(offset).limit(limit))).scalars().all()

    return {
        "items": [
            {
                "id": row.id,
                "timestamp": row.timestamp.isoformat() if row.timestamp else None,
                "user_id": row.user_id,
                "action": row.action,
                "resource_type": row.resource_type,
                "resource_id": row.resource_id,
                "ip_address": row.ip_address,
                "status": row.status,
                "detail": row.detail,
            }
            for row in rows
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }

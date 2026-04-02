"""
MedBios AI — FastAPI Application Entrypoint
AI-powered clinical report intelligence platform
"""
import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from config import APP_NAME, APP_VERSION, CORS_ORIGINS, API_PREFIX
from database import init_db, get_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="AI-powered clinical report intelligence platform",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
from routers.reports import router as reports_router, _pending_uploads  # noqa: E402
from routers.audit import router as audit_router                        # noqa: E402
app.include_router(reports_router, prefix=f"{API_PREFIX}/reports", tags=["Reports"])
app.include_router(audit_router, prefix=f"{API_PREFIX}/audit-logs", tags=["Audit"])


# ── WebSocket: real-time pipeline streaming ──────────────────────────────────

@app.websocket("/ws/pipeline/{report_id}")
async def pipeline_ws(websocket: WebSocket, report_id: str):
    """
    Stream pipeline progress for a pending report.

    The client opens this socket immediately after POST /upload returns {report_id}.
    The socket runs the full pipeline, emitting a JSON progress message after each stage,
    then a final {done: true} message, and closes.
    """
    await websocket.accept()

    async def send(payload: dict):
        try:
            await websocket.send_text(json.dumps(payload))
        except Exception:
            pass

    # Retrieve the stashed file bytes
    entry = _pending_uploads.pop(report_id, None)
    if entry is None:
        await send({"error": "No pending upload found for this report_id", "done": True})
        await websocket.close()
        return

    file_bytes, filename = entry

    # Progress callback — called after every pipeline stage
    async def progress_callback(stage_num: int, stage_name: str, status: str, progress_pct: int, message: str):
        payload = {
            "stage": stage_num,
            "name": stage_name,
            "status": status,
            "progress": progress_pct,
            "message": message,
        }
        await send(payload)

    # Run the pipeline
    from services.pipeline import run_pipeline_with_progress
    result = None
    try:
        result = await run_pipeline_with_progress(
            file_bytes,
            filename=filename,
            progress_callback=progress_callback,
        )
    except Exception as exc:
        logger.error(f"[WS pipeline] Unhandled error for report {report_id}: {exc}")
        await send({"stage": 0, "name": "Pipeline", "status": "error", "progress": 0,
                    "message": str(exc), "done": True})
        await websocket.close()
        return

    if result.get("status") == "error":
        await send({"stage": 0, "name": "Pipeline", "status": "error", "progress": 0,
                    "message": result.get("error", "Analysis failed"), "done": True})
        await websocket.close()
        return

    # Persist results to database
    async for db in get_db():
        try:
            from sqlalchemy import select
            from models import Patient, Report, LabResult, ClinicalInsight

            # Fetch the pre-created pending records
            report_row = (await db.execute(
                select(Report).where(Report.id == report_id)
            )).scalar_one_or_none()

            if report_row is None:
                logger.warning(f"[WS pipeline] Report row {report_id} not found for DB update")
            else:
                patient_info = result.get("patient_info", {})

                # Update patient stub
                patient_row = (await db.execute(
                    select(Patient).where(Patient.id == report_row.patient_id)
                )).scalar_one_or_none()
                if patient_row:
                    patient_row.name = patient_info.get("name")
                    patient_row.age = patient_info.get("age")
                    patient_row.gender = patient_info.get("gender")

                # Update report
                report_row.document_type = result.get("document_type", "unknown")
                report_row.raw_text = result.get("raw_text", "")
                report_row.status = "completed"
                report_row.analysis_result = result.get("clinical_report")

                # Store lab results
                for lab in result.get("lab_values", []):
                    db.add(LabResult(
                        report_id=report_id,
                        test_name=lab.get("canonical_name", lab.get("test_name", "")),
                        value=lab.get("value"),
                        unit=lab.get("unit") or lab.get("expected_unit"),
                        reference_min=lab.get("reference_min"),
                        reference_max=lab.get("reference_max"),
                        status=lab.get("status", "normal"),
                        raw_text=lab.get("raw_text", ""),
                    ))

                # Store clinical insights
                for insight in result.get("insights", []):
                    db.add(ClinicalInsight(
                        report_id=report_id,
                        condition=insight.get("condition", ""),
                        confidence=insight.get("confidence", "low"),
                        category=insight.get("category", ""),
                        evidence=insight.get("evidence"),
                        reasoning=insight.get("reasoning", ""),
                        recommendation=insight.get("recommendation", ""),
                    ))

                await db.commit()
        except Exception as db_exc:
            logger.error(f"[WS pipeline] DB save failed for {report_id}: {db_exc}")
            await db.rollback()
        break  # get_db is an async generator; only one iteration needed

    # Final done message
    await send({
        "stage": 8,
        "name": "Report Generation",
        "status": "completed",
        "progress": 100,
        "message": "Analysis complete",
        "done": True,
        "report_id": report_id,
    })

    try:
        await websocket.close()
    except Exception:
        pass


@app.get("/")
async def root():
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "endpoints": {
            "upload_report": f"{API_PREFIX}/reports/upload",
            "list_reports": f"{API_PREFIX}/reports",
            "docs": "/docs",
        }
    }


@app.get("/health")
async def health():
    import platform
    import sys
    from services.knowledge_graph import get_full_graph_stats
    from services.reasoning_engine import _load_custom_rules, ALL_RULES
    kg = get_full_graph_stats()
    custom_rules = _load_custom_rules()
    total_rules = len(ALL_RULES) + len(custom_rules)
    db_status = "connected"
    try:
        from database import async_engine
        async with async_engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
    except Exception:
        db_status = "unavailable"
    return {
        "status": "healthy",
        "version": APP_VERSION,
        "python": sys.version.split()[0],
        "platform": platform.system(),
        "database": db_status,
        "custom_rules_loaded": len(custom_rules),
        "services": {
            "ocr": "active (pdfplumber + tesseract fallback)",
            "nlp": "active (100+ lab test aliases)",
            "reasoning_engine": f"active ({len(ALL_RULES)} built-in + {len(custom_rules)} custom rules)",
            "risk_scorer": "active (age/gender-aware)",
            "knowledge_graph": f"active ({kg.get('total_nodes', 0)} nodes, {kg.get('total_edges', 0)} edges)",
            "drug_interactions": "active (25+ pairs, 65+ aliases)",
            "trend_analysis": "active",
            "pdf_export": "active",
            "chat": "active (context-aware)",
        },
    }

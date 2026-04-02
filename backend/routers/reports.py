"""
MedBios AI — Reports API Router
Handles report upload, analysis, and retrieval.
"""
import logging
import io
import json
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query, Form
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List

from fastapi import Request
from database import get_db
from models import Patient, Report, LabResult, ClinicalInsight
from services.pipeline import run_full_pipeline_async
from services.audit import log_action

# In-memory store: report_id -> (file_bytes, filename)
# Consumed once by the WebSocket pipeline endpoint then cleared.
_pending_uploads: dict[str, tuple[bytes, str]] = {}

# In-memory batch registry: batch_id -> list of report_ids
_batches: dict[str, list[str]] = {}
from services.knowledge_graph import get_full_graph_stats, get_subgraph, query_related
from services.trend_analysis import get_patient_trends
from services.drug_interactions import run_full_interaction_check
from services.fhir import build_fhir_bundle, parse_fhir_bundle

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload")
async def upload_report(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a medical report PDF.

    Creates a pending Report record immediately and returns {report_id, status: "pending"}.
    The caller should then open WebSocket /ws/pipeline/{report_id} to stream analysis progress.
    """
    # Validate file type
    allowed_types = [
        "application/pdf",
        "image/png", "image/jpeg", "image/jpg",
        "application/octet-stream",  # Some clients send this for PDFs
    ]
    if file.content_type not in allowed_types and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Please upload a PDF or image file."
        )

    # Read file
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(file_bytes) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum 50MB.")

    # Create a pending patient + report record right away
    try:
        patient = Patient(name=None, age=None, gender=None)
        db.add(patient)
        await db.flush()

        report = Report(
            patient_id=patient.id,
            filename=file.filename,
            document_type="unknown",
            raw_text=None,
            status="pending",
            analysis_result=None,
        )
        db.add(report)
        await db.flush()
        await db.commit()
        report_id = report.id
        patient_id = patient.id
    except Exception as e:
        logger.error(f"Failed to create pending report record: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to initialise report record.")

    # Stash file bytes for the WebSocket pipeline to pick up
    _pending_uploads[report_id] = (file_bytes, file.filename)

    await log_action(
        db,
        action="report.upload",
        resource_type="report",
        resource_id=report_id,
        request=request,
        detail={"filename": file.filename},
    )

    return {"report_id": report_id, "patient_id": patient_id, "status": "pending"}


@router.get("/")
async def list_reports(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
):
    """List all analyzed reports with pagination."""
    # Get total count
    total = (await db.execute(select(func.count(Report.id)))).scalar() or 0

    # Paginated query
    offset = (page - 1) * page_size
    query = select(Report).order_by(Report.created_at.desc()).offset(offset).limit(page_size)
    results = await db.execute(query)
    reports = results.scalars().all()

    return {
        "items": [
            {
                "id": r.id,
                "filename": r.filename,
                "document_type": r.document_type,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reports
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/{report_id}")
async def get_report(report_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Get full analysis results for a specific report."""
    query = select(Report).where(Report.id == report_id)
    result = await db.execute(query)
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Get lab results
    lab_query = select(LabResult).where(LabResult.report_id == report_id)
    lab_results = (await db.execute(lab_query)).scalars().all()

    # Get insights
    insight_query = select(ClinicalInsight).where(ClinicalInsight.report_id == report_id)
    insights = (await db.execute(insight_query)).scalars().all()

    # Get patient
    patient = None
    if report.patient_id:
        patient_query = select(Patient).where(Patient.id == report.patient_id)
        patient = (await db.execute(patient_query)).scalar_one_or_none()

    # Build lab values in same shape as pipeline output
    lab_values = [
        {
            "test_name": lr.test_name,
            "canonical_name": lr.test_name,
            "value": lr.value,
            "unit": lr.unit,
            "status": lr.status,
            "reference_min": lr.reference_min,
            "reference_max": lr.reference_max,
        }
        for lr in lab_results
    ]

    abnormal_count = sum(1 for lv in lab_values if lv["status"] != "normal")

    # Extract risk_scores and other data from stored clinical_report
    clinical_report = report.analysis_result or {}
    risk_scores_data = clinical_report.get("risk_scores", {})

    # Build risk_scores in same shape as pipeline output
    risk_scores = {
        "overall": clinical_report.get("summary", {}).get("overall_risk", 0),
        "overall_level": "high" if clinical_report.get("summary", {}).get("overall_risk", 0) > 60 else "moderate",
        "organ_systems": risk_scores_data,
    }

    # Get knowledge graph subgraph for tests found in this report
    test_names = [lr.test_name for lr in lab_results if lr.status != "normal"]
    kg_data = None
    graph_risks = []
    try:
        if test_names:
            kg_data = get_subgraph(test_names[:10], depth=2)
    except Exception:
        pass  # KG is optional

    insights_list = [
        {
            "condition": ins.condition,
            "confidence": ins.confidence,
            "category": ins.category,
            "evidence": ins.evidence,
            "reasoning": ins.reasoning,
            "recommendation": ins.recommendation,
        }
        for ins in insights
    ]

    await log_action(
        db,
        action="report.view",
        resource_type="report",
        resource_id=report_id,
        request=request,
    )

    return {
        "id": report.id,
        "filename": report.filename,
        "document_type": report.document_type,
        "status": report.status,
        "created_at": report.created_at.isoformat() if report.created_at else None,
        "patient_info": {
            "name": patient.name if patient else None,
            "age": patient.age if patient else None,
            "gender": patient.gender if patient else None,
        },
        "clinical_report": clinical_report,
        "lab_values": lab_values,
        "abnormal_count": abnormal_count,
        "insights": insights_list,
        "risk_scores": risk_scores,
        "knowledge_graph": kg_data,
        "graph_risks": graph_risks,
    }



# ── FHIR R4 Export / Import ─────────────────────────────────

@router.get("/{report_id}/fhir")
async def export_report_fhir(report_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Export a report as a FHIR R4 Bundle (application/fhir+json)."""
    query = select(Report).where(Report.id == report_id)
    result = await db.execute(query)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    lab_query = select(LabResult).where(LabResult.report_id == report_id)
    lab_results = (await db.execute(lab_query)).scalars().all()

    patient_info = None
    if report.patient_id:
        patient_query = select(Patient).where(Patient.id == report.patient_id)
        patient = (await db.execute(patient_query)).scalar_one_or_none()
        if patient:
            patient_info = {
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
            }

    lab_values = [
        {
            "test_name": lr.test_name,
            "value": lr.value,
            "unit": lr.unit,
            "reference_min": lr.reference_min,
            "reference_max": lr.reference_max,
            "status": lr.status,
        }
        for lr in lab_results
    ]

    bundle = build_fhir_bundle(report, lab_values, patient_info)
    await log_action(
        db,
        action="report.export_fhir",
        resource_type="report",
        resource_id=report_id,
        request=request,
    )
    return Response(
        content=json.dumps(bundle, indent=2),
        media_type="application/fhir+json",
        headers={"Content-Disposition": f"attachment; filename=report_{report_id}_fhir.json"},
    )


@router.post("/fhir-import")
async def import_fhir_bundle(bundle: dict, db: AsyncSession = Depends(get_db)):
    """Import a FHIR R4 Bundle and create a new Report with extracted lab values."""
    try:
        extracted = parse_fhir_bundle(bundle)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid FHIR bundle: {e}")

    patient_info = extracted.get("patient_info", {})
    lab_values = extracted.get("lab_values", [])

    try:
        # Create patient if info is present
        patient = None
        if patient_info.get("name") or patient_info.get("gender"):
            patient = Patient(
                name=patient_info.get("name"),
                age=patient_info.get("age"),
                gender=patient_info.get("gender"),
            )
            db.add(patient)
            await db.flush()

        report = Report(
            patient_id=patient.id if patient else None,
            filename="fhir_import.json",
            document_type="lab_report",
            status="completed",
            analysis_result={"source": "fhir_import"},
        )
        db.add(report)
        await db.flush()

        for lab in lab_values:
            lab_result = LabResult(
                report_id=report.id,
                test_name=lab.get("test_name", ""),
                value=lab.get("value"),
                unit=lab.get("unit"),
                reference_min=lab.get("reference_min"),
                reference_max=lab.get("reference_max"),
                status=lab.get("status", "normal"),
            )
            db.add(lab_result)

        await db.commit()
    except Exception as e:
        logger.error(f"FHIR import DB save failed: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database save failed: {e}")

    return {"report_id": report.id, "lab_values_imported": len(lab_values)}


@router.get("/knowledge-graph/stats")
async def knowledge_graph_stats():
    """Get knowledge graph statistics."""
    return get_full_graph_stats()


@router.get("/knowledge-graph/query/{entity}")
async def knowledge_graph_query(entity: str, depth: int = 2):
    """Query related entities in the knowledge graph."""
    related = query_related(entity, max_depth=depth)
    subgraph = get_subgraph([entity], depth=depth)
    return {
        "entity": entity,
        "related": related,
        "graph": subgraph,
    }


# ── Trend Analysis ──────────────────────────────────────────

@router.get("/patient/{patient_id}/trends")
async def patient_trends(patient_id: str, db: AsyncSession = Depends(get_db)):
    """Get longitudinal trend analysis for a patient across all their reports."""
    # Get all reports for this patient
    report_query = select(Report).where(Report.patient_id == patient_id).order_by(Report.created_at)
    reports = (await db.execute(report_query)).scalars().all()

    if not reports:
        raise HTTPException(status_code=404, detail="No reports found for this patient")

    # Build report data with lab values (include reference ranges for frontend charts)
    reports_data = []
    for report in reports:
        lab_query = select(LabResult).where(LabResult.report_id == report.id)
        lab_results = (await db.execute(lab_query)).scalars().all()

        reports_data.append({
            "created_at": report.created_at.isoformat() if report.created_at else None,
            "report_id": report.id,
            "lab_values": [
                {
                    "test_name": lr.test_name,
                    "value": lr.value,
                    "status": lr.status,
                    "reference_min": lr.reference_min,
                    "reference_max": lr.reference_max,
                    "unit": lr.unit,
                }
                for lr in lab_results
            ],
        })

    raw = get_patient_trends(reports_data)

    # Reshape trends dict → lab_trends array expected by the frontend,
    # and attach reference range from any data point that has it.
    trends_dict = raw.get("trends", {})
    lab_trends = []
    for test_name, trend in trends_dict.items():
        # Pull reference range from data points (first point that has it)
        ref_min = ref_max = unit = None
        for report in reports_data:
            for lv in report.get("lab_values", []):
                if lv["test_name"] == test_name and lv.get("reference_min") is not None:
                    ref_min = lv["reference_min"]
                    ref_max = lv["reference_max"]
                    unit = lv.get("unit")
                    break
            if ref_min is not None:
                break

        lab_trends.append({
            **trend,
            "reference_min": ref_min,
            "reference_max": ref_max,
            "unit": unit,
        })

    # Sort: alerts first, then by num_readings desc
    lab_trends.sort(key=lambda t: (-int(t.get("alert", False)), -t.get("num_readings", 0)))

    return {
        **raw,
        "lab_trends": lab_trends,
        "patient_id": patient_id,
        "report_count": len(reports),
    }


# ── Drug Interaction Detection ──────────────────────────────

from schemas import DrugInteractionRequest, DrugLabInteractionRequest

@router.post("/drug-interactions/check")
async def check_drug_interactions(
    payload: DrugInteractionRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Check for drug-drug interactions.
    Body: { "medications": ["warfarin", "aspirin", "metformin"] }
    """
    result = run_full_interaction_check(payload.medications)
    await log_action(
        db,
        action="drug.check",
        resource_type="drug_interaction",
        request=request,
        detail={"medications": payload.medications},
    )
    return result


@router.post("/drug-interactions/lab-check")
async def check_drug_lab_interactions(
    payload: DrugLabInteractionRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Check for drug-lab interactions with patient's current lab values.
    Body: {
        "medications": ["metformin", "lisinopril"],
        "lab_values": [{"test_name": "potassium", "value": 5.4, "status": "high"}]
    }
    """
    result = run_full_interaction_check(payload.medications, payload.lab_values)
    await log_action(
        db,
        action="drug.check",
        resource_type="drug_interaction",
        request=request,
        detail={"medications": payload.medications},
    )
    return result


# ── Analytics Dashboard ─────────────────────────────────────

@router.get("/analytics/dashboard")
async def analytics_dashboard(db: AsyncSession = Depends(get_db)):
    """Get aggregate analytics for the dashboard."""
    # Total counts
    total_reports = (await db.execute(select(func.count(Report.id)))).scalar() or 0
    total_patients = (await db.execute(select(func.count(Patient.id)))).scalar() or 0
    total_lab_tests = (await db.execute(select(func.count(LabResult.id)))).scalar() or 0
    total_insights = (await db.execute(select(func.count(ClinicalInsight.id)))).scalar() or 0

    # Abnormal count
    abnormal_count = (await db.execute(
        select(func.count(LabResult.id)).where(LabResult.status != "normal")
    )).scalar() or 0

    # Category breakdown (insights by category)
    cat_query = select(
        ClinicalInsight.category,
        func.count(ClinicalInsight.id).label("count"),
    ).group_by(ClinicalInsight.category)
    cat_results = (await db.execute(cat_query)).all()
    category_breakdown = {row[0]: row[1] for row in cat_results}

    # Confidence breakdown
    conf_query = select(
        ClinicalInsight.confidence,
        func.count(ClinicalInsight.id).label("count"),
    ).group_by(ClinicalInsight.confidence)
    conf_results = (await db.execute(conf_query)).all()
    confidence_breakdown = {row[0]: row[1] for row in conf_results}

    # Recent reports (last 5)
    recent_query = select(Report).order_by(Report.created_at.desc()).limit(5)
    recent = (await db.execute(recent_query)).scalars().all()
    recent_reports = [
        {
            "id": r.id,
            "filename": r.filename,
            "document_type": r.document_type,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in recent
    ]

    # Average risk score — only fetch analysis_result column, paginate to avoid memory issues
    risk_scores = []
    risk_q = select(Report.analysis_result).where(Report.analysis_result.isnot(None)).limit(500)
    risk_rows = (await db.execute(risk_q)).all()
    for (analysis_result,) in risk_rows:
        if analysis_result and isinstance(analysis_result, dict):
            summary = analysis_result.get("summary", {})
            risk = summary.get("overall_risk", 0)
            if risk:
                risk_scores.append(risk)

    avg_risk = round(sum(risk_scores) / len(risk_scores), 1) if risk_scores else 0

    # Knowledge graph stats
    kg_stats = get_full_graph_stats()

    return {
        "total_reports": total_reports,
        "total_patients": total_patients,
        "total_lab_tests": total_lab_tests,
        "total_insights": total_insights,
        "abnormal_count": abnormal_count,
        "abnormal_rate": round(abnormal_count / max(total_lab_tests, 1) * 100, 1),
        "category_breakdown": category_breakdown,
        "confidence_breakdown": confidence_breakdown,
        "avg_risk_score": avg_risk,
        "recent_reports": recent_reports,
        "knowledge_graph": kg_stats,
    }


# ── PDF Clinical Report Export ──────────────────────────────

@router.get("/export/{report_id}/pdf")
async def export_report_pdf(report_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Generate and download a clinical report as PDF."""
    # Fetch report data
    query = select(Report).where(Report.id == report_id)
    result = await db.execute(query)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Get related data
    lab_query = select(LabResult).where(LabResult.report_id == report_id)
    lab_results = (await db.execute(lab_query)).scalars().all()

    insight_query = select(ClinicalInsight).where(ClinicalInsight.report_id == report_id)
    insights = (await db.execute(insight_query)).scalars().all()

    patient = None
    if report.patient_id:
        patient_query = select(Patient).where(Patient.id == report.patient_id)
        patient = (await db.execute(patient_query)).scalar_one_or_none()

    # Generate PDF
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.graphics.shapes import Drawing, String, Rect
        from reportlab.graphics.charts.barcharts import HorizontalBarChart
        from reportlab.graphics import renderPDF
    except ImportError:
        raise HTTPException(status_code=500, detail="reportlab not installed")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=72)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Heading1'],
        fontSize=20, spaceAfter=20, textColor=colors.HexColor('#1e40af'),
    )
    heading_style = ParagraphStyle(
        'CustomHeading', parent=styles['Heading2'],
        fontSize=14, spaceAfter=10, textColor=colors.HexColor('#1e40af'),
        spaceBefore=15,
    )
    normal_style = styles['Normal']
    disclaimer_style = ParagraphStyle(
        'Disclaimer', parent=styles['Normal'],
        fontSize=8, textColor=colors.gray, spaceBefore=20,
    )

    story = []

    # Title
    story.append(Paragraph("MedBios AI — Clinical Analysis Report", title_style))
    story.append(Spacer(1, 12))

    # Patient info
    if patient:
        patient_data = [
            ["Patient Name", patient.name or "N/A"],
            ["Age", str(patient.age) if patient.age else "N/A"],
            ["Gender", patient.gender or "N/A"],
            ["Report File", report.filename or "N/A"],
            ["Document Type", report.document_type or "N/A"],
            ["Analysis Date", report.created_at.strftime("%Y-%m-%d %H:%M") if report.created_at else "N/A"],
        ]
        t = Table(patient_data, colWidths=[2 * inch, 4 * inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f9ff')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(t)
        story.append(Spacer(1, 16))

    # Summary stats
    abnormal = [lr for lr in lab_results if lr.status != "normal"]
    clinical_report = report.analysis_result or {}
    overall_risk = clinical_report.get("summary", {}).get("overall_risk", 0)

    story.append(Paragraph("Summary", heading_style))
    summary_data = [
        ["Lab Values Extracted", str(len(lab_results))],
        ["Abnormal Values", str(len(abnormal))],
        ["Clinical Insights", str(len(insights))],
        ["Overall Risk Score", f"{overall_risk}%"],
    ]
    t = Table(summary_data, colWidths=[3 * inch, 3 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dbeafe')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
    ]))
    story.append(t)
    story.append(Spacer(1, 16))

    # ── Risk Score Bar Chart ──
    clinical_result = report.analysis_result or {}
    risk_scores_data = clinical_result.get("risk_scores", {})
    ORGAN_KEYS = [
        "hematological", "cardiovascular", "renal", "metabolic",
        "hepatic", "electrolyte", "inflammatory", "nutritional",
    ]
    chart_rows = [(k.capitalize(), float(risk_scores_data.get(k, 0))) for k in ORGAN_KEYS
                  if risk_scores_data.get(k, 0) > 0]

    if chart_rows:
        story.append(Paragraph("Organ System Risk Scores", heading_style))
        drawing_width = 450
        bar_height = 16
        chart_height = len(chart_rows) * (bar_height + 6) + 40
        d = Drawing(drawing_width, chart_height)

        chart = HorizontalBarChart()
        chart.x = 100
        chart.y = 10
        chart.width = drawing_width - 120
        chart.height = chart_height - 20
        chart.data = [[row[1] for row in chart_rows]]
        chart.valueAxis.valueMin = 0
        chart.valueAxis.valueMax = 100
        chart.valueAxis.valueStep = 25
        chart.categoryAxis.categoryNames = [row[0] for row in chart_rows]
        chart.categoryAxis.labels.fontSize = 8
        chart.valueAxis.labels.fontSize = 8
        chart.bars[0].fillColor = colors.HexColor("#10b981")

        # Colour bars red/orange for high risk
        for i, (_, score) in enumerate(chart_rows):
            if score >= 70:
                chart.bars[(0, i)].fillColor = colors.HexColor("#dc2626")
            elif score >= 50:
                chart.bars[(0, i)].fillColor = colors.HexColor("#ea580c")
            elif score >= 30:
                chart.bars[(0, i)].fillColor = colors.HexColor("#f59e0b")

        d.add(chart)
        story.append(d)
        story.append(Spacer(1, 16))

    # Abnormal findings
    if abnormal:
        story.append(Paragraph("Abnormal Findings", heading_style))
        table_data = [["Test", "Value", "Status", "Reference Range"]]
        for lr in abnormal:
            ref_range = f"{lr.reference_min} - {lr.reference_max}" if lr.reference_min else "N/A"
            table_data.append([
                lr.test_name,
                f"{lr.value} {lr.unit or ''}",
                lr.status.upper(),
                ref_range,
            ])
        t = Table(table_data, colWidths=[2 * inch, 1.5 * inch, 1 * inch, 1.5 * inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        story.append(t)
        story.append(Spacer(1, 16))

    # Clinical insights
    if insights:
        story.append(Paragraph("Clinical Insights", heading_style))
        for i, ins in enumerate(insights, 1):
            conf_color = {"high": "#dc2626", "medium": "#ea580c", "low": "#2563eb"}.get(ins.confidence, "#6b7280")
            story.append(Paragraph(
                f"<b>{i}. {ins.condition}</b> "
                f"<font color='{conf_color}'>[{ins.confidence.upper()}]</font> "
                f"— {ins.category}",
                normal_style,
            ))
            if ins.reasoning:
                story.append(Paragraph(f"<i>{ins.reasoning}</i>", normal_style))
            if ins.recommendation:
                story.append(Paragraph(f"→ {ins.recommendation}", normal_style))
            story.append(Spacer(1, 8))

    # Disclaimer
    story.append(Paragraph(
        "DISCLAIMER: This report is generated by MedBios AI for informational purposes only. "
        "It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified "
        "healthcare provider for clinical decisions. AI-generated insights should be verified by "
        "a licensed physician before any clinical action.",
        disclaimer_style,
    ))

    doc.build(story)
    buffer.seek(0)

    filename = f"medbios_report_{report_id[:8]}.pdf"
    await log_action(
        db,
        action="report.export_pdf",
        resource_type="report",
        resource_id=report_id,
        request=request,
    )
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

import asyncio
from schemas import ChatMessage

@router.post("/{report_id}/chat")
async def chat_with_report(report_id: str, payload: ChatMessage, db: AsyncSession = Depends(get_db)):
    """Context-aware AI chat that uses actual report data to answer questions."""
    report_result = await db.execute(select(Report).where(Report.id == report_id))
    report = report_result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Fetch actual lab values and insights for this report
    lab_results = (await db.execute(
        select(LabResult).where(LabResult.report_id == report_id)
    )).scalars().all()
    insights = (await db.execute(
        select(ClinicalInsight).where(ClinicalInsight.report_id == report_id)
    )).scalars().all()

    msg = payload.message.lower()
    clinical_report = report.analysis_result or {}

    # Build context from actual data
    abnormal_labs = [lr for lr in lab_results if lr.status != "normal"]
    abnormal_names = {lr.test_name.lower() for lr in abnormal_labs}
    insight_conditions = [ins.condition for ins in insights]
    risk_scores = clinical_report.get("risk_scores", {})

    answer = _build_chat_response(msg, abnormal_labs, insights, risk_scores, insight_conditions)

    return {"answer": answer}


def _build_chat_response(msg, abnormal_labs, insights, risk_scores, conditions):
    """Build a context-aware response using actual report data."""

    # Greetings
    if any(w in msg for w in ("hello", "hi ", "hey", "greetings")):
        abnormal_count = len(abnormal_labs)
        if abnormal_count:
            return (f"Hello! I've analyzed your report and found {abnormal_count} abnormal value(s). "
                    "Feel free to ask about any specific test, condition, or recommendation.")
        return "Hello! Your report looks good overall. Ask me about any specific test or concern."

    # Check if user is asking about a specific lab test
    for lab in abnormal_labs:
        test_lower = lab.test_name.lower()
        if test_lower in msg or test_lower.replace("_", " ") in msg:
            status_desc = {"high": "above", "low": "below", "critical_high": "critically above",
                           "critical_low": "critically below"}.get(lab.status, lab.status)
            ref_range = f"{lab.reference_min}-{lab.reference_max}" if lab.reference_min else "standard range"
            answer = (f"Your {lab.test_name.replace('_', ' ').title()} is {lab.value} {lab.unit or ''}, "
                      f"which is {status_desc} the reference range ({ref_range}).")
            # Attach related insights
            related = [ins for ins in insights
                       if lab.test_name.lower() in (ins.reasoning or "").lower()
                       or lab.test_name.lower() in (ins.condition or "").lower()]
            if related:
                answer += f" This is associated with: {related[0].condition}. {related[0].reasoning}"
            return answer

    # Topic-based responses using actual data
    if any(w in msg for w in ("glucose", "sugar", "diabetes", "hba1c", "a1c")):
        relevant = [ins for ins in insights if "diabet" in (ins.condition or "").lower()
                     or "glucose" in (ins.condition or "").lower()]
        if relevant:
            ins = relevant[0]
            return f"{ins.condition} ({ins.confidence} confidence): {ins.reasoning} Recommendation: {ins.recommendation}"
        return "No glucose-related abnormalities were detected in your report."

    if any(w in msg for w in ("cholesterol", "lipid", "heart", "cardiovascular", "ldl", "hdl")):
        relevant = [ins for ins in insights if ins.category == "Cardiovascular"]
        if relevant:
            parts = [f"- {ins.condition} ({ins.confidence}): {ins.reasoning}" for ins in relevant]
            return "Cardiovascular findings:\n" + "\n".join(parts)
        cv_risk = risk_scores.get("cardiovascular", {})
        if cv_risk:
            return f"Your cardiovascular risk score is {cv_risk.get('score', 'N/A')}% ({cv_risk.get('level', 'N/A')})."
        return "No significant cardiovascular concerns were found in your report."

    if any(w in msg for w in ("kidney", "renal", "creatinine", "egfr")):
        relevant = [ins for ins in insights if ins.category == "Nephrology"
                     or "kidney" in (ins.condition or "").lower()]
        if relevant:
            ins = relevant[0]
            return f"{ins.condition}: {ins.reasoning} Recommendation: {ins.recommendation}"
        return "No kidney-related abnormalities were detected in your report."

    if any(w in msg for w in ("risk", "danger", "score", "overall")):
        overall = risk_scores.get("overall", 0) if isinstance(risk_scores, dict) else 0
        high_systems = [
            f"{sys}: {data.get('score', 0)}% ({data.get('level', 'N/A')})"
            for sys, data in (risk_scores if isinstance(risk_scores, dict) else {}).items()
            if isinstance(data, dict) and data.get("score", 0) >= 40
        ]
        answer = f"Your overall risk score is {overall}%."
        if high_systems:
            answer += " Elevated risk areas: " + "; ".join(high_systems) + "."
        return answer

    if any(w in msg for w in ("abnormal", "problem", "wrong", "issue", "concern")):
        if abnormal_labs:
            items = [f"- {lr.test_name.replace('_', ' ').title()}: {lr.value} ({lr.status})"
                     for lr in abnormal_labs[:8]]
            return "Abnormal findings in your report:\n" + "\n".join(items)
        return "No abnormal values were found in your report."

    if any(w in msg for w in ("diet", "food", "eat", "nutrition", "exercise")):
        nutrition_insights = [ins for ins in insights
                              if ins.category in ("Nutrition", "Endocrinology")]
        if nutrition_insights:
            recs = [ins.recommendation for ins in nutrition_insights if ins.recommendation]
            if recs:
                return "Based on your results, here are relevant recommendations:\n" + "\n".join(f"- {r}" for r in recs)
        return ("Based on your clinical profile, a balanced diet and regular exercise are recommended. "
                "Check the Recommendations tab for personalized guidance.")

    if any(w in msg for w in ("summary", "overview", "explain", "report")):
        summary = clinical_report_summary(conditions, abnormal_labs, risk_scores)
        return summary

    # Fallback with actual context
    if conditions:
        return (f"Your report identified {len(conditions)} clinical finding(s): "
                f"{', '.join(conditions[:3])}. "
                "Ask about any specific condition, lab test, or recommendation for more details.")
    return ("I'm your MedBios AI assistant. Your report has been analyzed. "
            "Ask about specific tests, conditions, risk scores, or recommendations.")


def clinical_report_summary(conditions, abnormal_labs, risk_scores):
    """Generate a text summary from report data."""
    parts = [f"Your report summary: {len(abnormal_labs)} abnormal value(s) detected."]
    if conditions:
        parts.append(f"Clinical findings: {', '.join(conditions[:5])}.")
    if isinstance(risk_scores, dict):
        overall = risk_scores.get("overall", 0)
        if overall:
            parts.append(f"Overall risk score: {overall}%.")
    parts.append("Consult your physician for personalized medical advice.")
    return " ".join(parts)


# ── Health Recommendations ──
from services.recommendations import generate_recommendations

@router.get("/{report_id}/recommendations")
async def get_recommendations(report_id: str, db: AsyncSession = Depends(get_db)):
    """Generate personalized health recommendations based on report lab values."""
    report_result = await db.execute(select(Report).where(Report.id == report_id))
    report = report_result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    lab_result = await db.execute(select(LabResult).where(LabResult.report_id == report_id))
    lab_values = lab_result.scalars().all()

    lab_dicts = [
        {
            "test_name": lr.test_name,
            "value": lr.value,
            "unit": lr.unit,
            "status": lr.status,
            "reference_min": lr.reference_min,
            "reference_max": lr.reference_max,
        }
        for lr in lab_values
    ]

    return generate_recommendations(lab_dicts)


# ── Batch Upload ─────────────────────────────────────────────

@router.post("/batch-upload")
async def batch_upload_reports(
    request: Request,
    files: List[UploadFile] = File(...),
    patient_name: Optional[str] = Form(None),
    patient_age: Optional[int] = Form(None),
    patient_gender: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload multiple PDF reports in one request.

    Creates a pending Report record for each file immediately and returns a
    batch_id that can be used to open the batch WebSocket for concurrent processing.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 files per batch.")

    allowed_types = [
        "application/pdf",
        "image/png", "image/jpeg", "image/jpg",
        "application/octet-stream",
    ]

    batch_id = str(uuid.uuid4())
    report_entries = []

    for file in files:
        if file.content_type not in allowed_types and not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type for {file.filename}: {file.content_type}",
            )

        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail=f"Empty file: {file.filename}")
        if len(file_bytes) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File too large (max 50MB): {file.filename}")

        try:
            patient = Patient(
                name=patient_name,
                age=patient_age,
                gender=patient_gender,
            )
            db.add(patient)
            await db.flush()

            report = Report(
                patient_id=patient.id,
                filename=file.filename,
                document_type="unknown",
                raw_text=None,
                status="pending",
                analysis_result=None,
            )
            db.add(report)
            await db.flush()
            await db.commit()
        except Exception as e:
            logger.error(f"Failed to create pending record for {file.filename}: {e}")
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to initialise record for {file.filename}")

        _pending_uploads[report.id] = (file_bytes, file.filename)
        report_entries.append({"report_id": report.id, "filename": file.filename, "status": "pending"})

    _batches[batch_id] = [e["report_id"] for e in report_entries]

    await log_action(
        db,
        action="report.batch_upload",
        resource_type="report",
        request=request,
        detail={"batch_id": batch_id, "file_count": len(files)},
    )

    return {"batch_id": batch_id, "reports": report_entries}


@router.get("/batch/{batch_id}/status")
async def batch_status(batch_id: str, db: AsyncSession = Depends(get_db)):
    """Get the processing status of all reports in a batch."""
    report_ids = _batches.get(batch_id)
    if report_ids is None:
        raise HTTPException(status_code=404, detail="Batch not found")

    reports_info = []
    completed = 0
    failed = 0
    pending = 0

    for report_id in report_ids:
        result = await db.execute(select(Report).where(Report.id == report_id))
        report = result.scalar_one_or_none()
        if report:
            status = report.status
            if status == "completed":
                completed += 1
            elif status == "error":
                failed += 1
            else:
                pending += 1
            reports_info.append({
                "report_id": report.id,
                "filename": report.filename,
                "status": status,
            })

    return {
        "batch_id": batch_id,
        "total": len(report_ids),
        "completed": completed,
        "failed": failed,
        "pending": pending,
        "reports": reports_info,
    }


# ── Shareable Report Links ───────────────────────────────────────────────────

import secrets
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel


def _utcnow():
    return datetime.now(timezone.utc)


class ShareRequest(BaseModel):
    mode: str = "link"
    expires_in_days: int = 7


@router.post("/{report_id}/share")
async def share_report(
    report_id: str,
    body: ShareRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Generate a shareable link token for the given report."""
    query = select(Report).where(Report.id == report_id)
    result = await db.execute(query)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    token = secrets.token_urlsafe(32)
    expires_at = _utcnow() + timedelta(days=body.expires_in_days)

    report.share_token = token
    report.share_expires_at = expires_at
    report.share_mode = body.mode
    await db.commit()

    await log_action(
        db,
        action="report.share",
        resource_type="report",
        resource_id=report_id,
        request=request,
        detail={"mode": body.mode, "expires_in_days": body.expires_in_days},
    )

    return {
        "share_token": token,
        "share_url": f"/shared/{token}",
        "expires_at": expires_at.isoformat(),
    }


@router.get("/shared/{token}")
async def get_shared_report(token: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Public endpoint — returns full report data for a valid, non-expired share token."""
    query = select(Report).where(Report.share_token == token)
    result = await db.execute(query)
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Shared report not found")

    if report.share_expires_at and report.share_expires_at < _utcnow():
        raise HTTPException(status_code=410, detail="This shared link has expired")

    # Increment view counter
    report.share_views = (report.share_views or 0) + 1
    await db.commit()

    report_id = report.id

    # Reuse the same response shape as GET /{report_id}
    lab_query = select(LabResult).where(LabResult.report_id == report_id)
    lab_results = (await db.execute(lab_query)).scalars().all()

    insight_query = select(ClinicalInsight).where(ClinicalInsight.report_id == report_id)
    insights = (await db.execute(insight_query)).scalars().all()

    patient = None
    if report.patient_id:
        patient_query = select(Patient).where(Patient.id == report.patient_id)
        patient = (await db.execute(patient_query)).scalar_one_or_none()

    lab_values = [
        {
            "test_name": lr.test_name,
            "canonical_name": lr.test_name,
            "value": lr.value,
            "unit": lr.unit,
            "status": lr.status,
            "reference_min": lr.reference_min,
            "reference_max": lr.reference_max,
        }
        for lr in lab_results
    ]

    abnormal_count = sum(1 for lv in lab_values if lv["status"] != "normal")
    clinical_report = report.analysis_result or {}
    risk_scores_data = clinical_report.get("risk_scores", {})
    risk_scores = {
        "overall": clinical_report.get("summary", {}).get("overall_risk", 0),
        "overall_level": "high" if clinical_report.get("summary", {}).get("overall_risk", 0) > 60 else "moderate",
        "organ_systems": risk_scores_data,
    }

    test_names = [lr.test_name for lr in lab_results if lr.status != "normal"]
    kg_data = None
    try:
        if test_names:
            kg_data = get_subgraph(test_names[:10], depth=2)
    except Exception:
        pass

    insights_list = [
        {
            "condition": ins.condition,
            "confidence": ins.confidence,
            "category": ins.category,
            "evidence": ins.evidence,
            "reasoning": ins.reasoning,
            "recommendation": ins.recommendation,
        }
        for ins in insights
    ]

    await log_action(
        db,
        action="report.shared_view",
        resource_type="report",
        resource_id=report_id,
        request=request,
    )

    return {
        "id": report.id,
        "filename": report.filename,
        "document_type": report.document_type,
        "status": report.status,
        "created_at": report.created_at.isoformat() if report.created_at else None,
        "patient_info": {
            "name": patient.name if patient else None,
            "age": patient.age if patient else None,
            "gender": patient.gender if patient else None,
        },
        "clinical_report": clinical_report,
        "lab_values": lab_values,
        "abnormal_count": abnormal_count,
        "insights": insights_list,
        "risk_scores": risk_scores,
        "knowledge_graph": kg_data,
        "graph_risks": [],
        "share_views": report.share_views,
    }


@router.delete("/{report_id}/share")
async def revoke_share(
    report_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Revoke the share link for a report."""
    query = select(Report).where(Report.id == report_id)
    result = await db.execute(query)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.share_token = None
    report.share_expires_at = None
    report.share_mode = "private"
    await db.commit()

    await log_action(
        db,
        action="report.share_revoke",
        resource_type="report",
        resource_id=report_id,
        request=request,
    )

    return {"revoked": True}

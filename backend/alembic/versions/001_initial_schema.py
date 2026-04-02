"""Initial schema — patients, reports, lab_results, clinical_insights

Revision ID: 001
Revises:
Create Date: 2026-04-03
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "patients",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(200), nullable=True),
        sa.Column("age", sa.Integer, nullable=True),
        sa.Column("gender", sa.String(20), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("patients.id"), nullable=True),
        sa.Column("filename", sa.String(500), nullable=False),
        sa.Column("document_type", sa.String(50), server_default="lab_report"),
        sa.Column("raw_text", sa.Text, nullable=True),
        sa.Column("status", sa.String(20), server_default="processing"),
        sa.Column("analysis_result", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "lab_results",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("report_id", sa.String(36), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("test_name", sa.String(200), nullable=False),
        sa.Column("value", sa.Float, nullable=True),
        sa.Column("unit", sa.String(50), nullable=True),
        sa.Column("reference_min", sa.Float, nullable=True),
        sa.Column("reference_max", sa.Float, nullable=True),
        sa.Column("status", sa.String(20), server_default="normal"),
        sa.Column("raw_text", sa.Text, nullable=True),
    )

    op.create_table(
        "clinical_insights",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("report_id", sa.String(36), sa.ForeignKey("reports.id"), nullable=False),
        sa.Column("condition", sa.String(300), nullable=False),
        sa.Column("confidence", sa.String(20), nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("evidence", sa.JSON, nullable=True),
        sa.Column("reasoning", sa.Text, nullable=True),
        sa.Column("recommendation", sa.Text, nullable=True),
    )

    # Indexes for common query patterns
    op.create_index("ix_reports_patient_id", "reports", ["patient_id"])
    op.create_index("ix_reports_created_at", "reports", ["created_at"])
    op.create_index("ix_lab_results_report_id", "lab_results", ["report_id"])
    op.create_index("ix_lab_results_status", "lab_results", ["status"])
    op.create_index("ix_clinical_insights_report_id", "clinical_insights", ["report_id"])
    op.create_index("ix_clinical_insights_confidence", "clinical_insights", ["confidence"])


def downgrade() -> None:
    op.drop_index("ix_clinical_insights_confidence")
    op.drop_index("ix_clinical_insights_report_id")
    op.drop_index("ix_lab_results_status")
    op.drop_index("ix_lab_results_report_id")
    op.drop_index("ix_reports_created_at")
    op.drop_index("ix_reports_patient_id")
    op.drop_table("clinical_insights")
    op.drop_table("lab_results")
    op.drop_table("reports")
    op.drop_table("patients")

"""
MedBios AI — Database Models
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Text, DateTime, ForeignKey, JSON, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


def _utcnow():
    return datetime.now(timezone.utc)


def _uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(300), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(500), nullable=False)
    role: Mapped[str] = mapped_column(String(100), default="Physician")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=True)
    age: Mapped[int] = mapped_column(nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    reports: Mapped[list["Report"]] = relationship(back_populates="patient", cascade="all, delete-orphan")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    patient_id: Mapped[str] = mapped_column(ForeignKey("patients.id"), nullable=True)
    filename: Mapped[str] = mapped_column(String(500))
    document_type: Mapped[str] = mapped_column(String(50), default="lab_report")
    raw_text: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="processing")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    # Full analysis result as JSON
    analysis_result: Mapped[dict] = mapped_column(JSON, nullable=True)

    # Shareable link fields
    share_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=True, index=True)
    share_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    share_mode: Mapped[str] = mapped_column(String(20), default="private")  # "private" | "public" | "link"
    share_views: Mapped[int] = mapped_column(Integer, default=0)

    # Encrypted sensitive fields — stored as Fernet ciphertext.
    # Existing plain-text rows can be migrated with a one-time script:
    #   for r in session.query(Report).all():
    #       if r._patient_name and not r._patient_name.startswith("gAAAA"):
    #           r._patient_name = encrypt_field(r._patient_name)
    #   session.commit()
    _patient_name: Mapped[str] = mapped_column("patient_name_encrypted", String(1000), nullable=True)
    _patient_dob: Mapped[str] = mapped_column("patient_dob_encrypted", String(1000), nullable=True)

    patient: Mapped["Patient"] = relationship(back_populates="reports")
    lab_results: Mapped[list["LabResult"]] = relationship(back_populates="report", cascade="all, delete-orphan")
    insights: Mapped[list["ClinicalInsight"]] = relationship(back_populates="report", cascade="all, delete-orphan")

    # ── Encrypted property accessors ────────────────────────────────────────

    @property
    def patient_name(self) -> str | None:
        if not self._patient_name:
            return None
        from services.encryption import decrypt_field
        return decrypt_field(self._patient_name)

    @patient_name.setter
    def patient_name(self, value: str | None) -> None:
        if not value:
            self._patient_name = None
            return
        from services.encryption import encrypt_field
        self._patient_name = encrypt_field(value)

    @property
    def patient_dob(self) -> str | None:
        if not self._patient_dob:
            return None
        from services.encryption import decrypt_field
        return decrypt_field(self._patient_dob)

    @patient_dob.setter
    def patient_dob(self, value: str | None) -> None:
        if not value:
            self._patient_dob = None
            return
        from services.encryption import encrypt_field
        self._patient_dob = encrypt_field(value)


class LabResult(Base):
    __tablename__ = "lab_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id"))
    test_name: Mapped[str] = mapped_column(String(200))
    value: Mapped[float] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(50), nullable=True)
    reference_min: Mapped[float] = mapped_column(Float, nullable=True)
    reference_max: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="normal")  # normal, low, high, critical
    raw_text: Mapped[str] = mapped_column(Text, nullable=True)

    report: Mapped["Report"] = relationship(back_populates="lab_results")


class ClinicalInsight(Base):
    __tablename__ = "clinical_insights"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    report_id: Mapped[str] = mapped_column(ForeignKey("reports.id"))
    condition: Mapped[str] = mapped_column(String(300))
    confidence: Mapped[str] = mapped_column(String(20))  # high, medium, low
    category: Mapped[str] = mapped_column(String(100))   # e.g. hematology, cardiovascular
    evidence: Mapped[dict] = mapped_column(JSON, nullable=True)
    reasoning: Mapped[str] = mapped_column(Text, nullable=True)
    recommendation: Mapped[str] = mapped_column(Text, nullable=True)

    report: Mapped["Report"] = relationship(back_populates="insights")


class AuditLog(Base):
    """Immutable audit trail of user actions for compliance and security.

    New rows are append-only — never update or delete them.
    """
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, index=True
    )
    user_id: Mapped[str] = mapped_column(String(200), index=True, default="anonymous")
    action: Mapped[str] = mapped_column(String(100), index=True)         # e.g. "report.create"
    resource_type: Mapped[str] = mapped_column(String(100))              # "report", "drug_interaction"
    resource_id: Mapped[str] = mapped_column(String(36), nullable=True)  # report id or None
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="success")   # "success" | "error"
    detail: Mapped[str] = mapped_column(Text, nullable=True)             # JSON string for extra context

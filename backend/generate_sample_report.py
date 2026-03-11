"""
Generate a sample lab report PDF for testing the MedBios AI pipeline.
"""
import sys
sys.path.insert(0, ".")

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent / "data" / "sample_lab_report.pdf"

def generate_sample_report():
    doc = SimpleDocTemplate(str(OUTPUT_PATH), pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    title = ParagraphStyle('CustomTitle', parent=styles['Title'],
                          fontSize=18, textColor=colors.HexColor('#1a237e'),
                          spaceAfter=6)
    elements.append(Paragraph("PATHOLOGY LABORATORY REPORT", title))
    elements.append(Spacer(1, 8))

    # Patient Info
    patient_data = [
        ["Patient Name:", "Rajesh Kumar", "Age:", "52 years"],
        ["Gender:", "Male", "Date:", "10-Mar-2026"],
        ["Referred By:", "Dr. Anita Sharma", "Sample ID:", "MED-2026-0847"],
    ]
    patient_table = Table(patient_data, colWidths=[100, 160, 80, 160])
    patient_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8eaf6')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#e8eaf6')),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 15))

    # Section: Complete Blood Count
    section_style = ParagraphStyle('Section', parent=styles['Heading2'],
                                  fontSize=12, textColor=colors.HexColor('#283593'),
                                  spaceBefore=10, spaceAfter=6)
    elements.append(Paragraph("COMPLETE BLOOD COUNT (CBC)", section_style))

    cbc_data = [
        ["Test", "Result", "Unit", "Reference Range"],
        ["Hemoglobin", "8.9", "g/dL", "13.0 - 17.0"],
        ["Hematocrit", "28.5", "%", "40.0 - 50.0"],
        ["RBC Count", "3.2", "M/uL", "4.5 - 5.5"],
        ["WBC Count", "12.8", "K/uL", "4.0 - 11.0"],
        ["Platelet Count", "135", "K/uL", "150 - 400"],
        ["MCV", "72.5", "fL", "80.0 - 100.0"],
        ["MCH", "25.1", "pg", "27.0 - 33.0"],
        ["MCHC", "31.2", "g/dL", "32.0 - 36.0"],
        ["RDW", "16.8", "%", "11.5 - 14.5"],
    ]
    elements.append(_make_table(cbc_data))
    elements.append(Spacer(1, 10))

    # Section: Iron Studies
    elements.append(Paragraph("IRON STUDIES", section_style))
    iron_data = [
        ["Test", "Result", "Unit", "Reference Range"],
        ["Ferritin", "8.5", "ng/mL", "12.0 - 300.0"],
        ["Serum Iron", "35", "mcg/dL", "60 - 170"],
        ["TIBC", "420", "mcg/dL", "250 - 370"],
        ["Transferrin Saturation", "8.3", "%", "20 - 50"],
    ]
    elements.append(_make_table(iron_data))
    elements.append(Spacer(1, 10))

    # Section: Metabolic Panel
    elements.append(Paragraph("COMPREHENSIVE METABOLIC PANEL", section_style))
    cmp_data = [
        ["Test", "Result", "Unit", "Reference Range"],
        ["Glucose (Fasting)", "142", "mg/dL", "70 - 100"],
        ["HbA1c", "7.2", "%", "4.0 - 5.6"],
        ["BUN", "28", "mg/dL", "7 - 20"],
        ["Creatinine", "1.8", "mg/dL", "0.6 - 1.2"],
        ["eGFR", "42", "mL/min", "90 - 120"],
        ["Sodium", "138", "mEq/L", "136 - 145"],
        ["Potassium", "5.4", "mEq/L", "3.5 - 5.0"],
        ["Calcium", "8.2", "mg/dL", "8.5 - 10.5"],
        ["Chloride", "101", "mEq/L", "98 - 106"],
    ]
    elements.append(_make_table(cmp_data))
    elements.append(Spacer(1, 10))

    # Section: Lipid Panel
    elements.append(Paragraph("LIPID PANEL", section_style))
    lipid_data = [
        ["Test", "Result", "Unit", "Reference Range"],
        ["Total Cholesterol", "262", "mg/dL", "< 200"],
        ["LDL Cholesterol", "172", "mg/dL", "< 100"],
        ["HDL Cholesterol", "34", "mg/dL", "40 - 100"],
        ["Triglycerides", "280", "mg/dL", "< 150"],
        ["VLDL", "56", "mg/dL", "5 - 40"],
    ]
    elements.append(_make_table(lipid_data))
    elements.append(Spacer(1, 10))

    # Section: Liver Function
    elements.append(Paragraph("LIVER FUNCTION TESTS", section_style))
    lft_data = [
        ["Test", "Result", "Unit", "Reference Range"],
        ["ALT (SGPT)", "68", "U/L", "7 - 56"],
        ["AST (SGOT)", "52", "U/L", "10 - 40"],
        ["Alkaline Phosphatase", "95", "U/L", "44 - 147"],
        ["Total Bilirubin", "0.9", "mg/dL", "0.1 - 1.2"],
        ["Albumin", "3.1", "g/dL", "3.4 - 5.4"],
        ["GGT", "55", "U/L", "9 - 48"],
    ]
    elements.append(_make_table(lft_data))
    elements.append(Spacer(1, 10))

    # Section: Thyroid
    elements.append(Paragraph("THYROID PROFILE", section_style))
    thyroid_data = [
        ["Test", "Result", "Unit", "Reference Range"],
        ["TSH", "8.7", "mIU/L", "0.4 - 4.0"],
        ["Free T4", "0.6", "ng/dL", "0.8 - 1.8"],
        ["Free T3", "2.1", "pg/mL", "2.3 - 4.2"],
    ]
    elements.append(_make_table(thyroid_data))
    elements.append(Spacer(1, 10))

    # Section: Vitamins & Inflammatory
    elements.append(Paragraph("VITAMINS & INFLAMMATORY MARKERS", section_style))
    other_data = [
        ["Test", "Result", "Unit", "Reference Range"],
        ["Vitamin D", "12.5", "ng/mL", "30 - 100"],
        ["Vitamin B12", "180", "pg/mL", "200 - 900"],
        ["CRP", "8.5", "mg/L", "0 - 3.0"],
        ["ESR", "38", "mm/hr", "0 - 20"],
        ["Uric Acid", "8.9", "mg/dL", "3.0 - 7.0"],
    ]
    elements.append(_make_table(other_data))
    elements.append(Spacer(1, 20))

    # Footer
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'],
                                 fontSize=8, textColor=colors.grey)
    elements.append(Paragraph("* This is a sample lab report generated for testing purposes only.", footer_style))
    elements.append(Paragraph("MedBios AI Pathology Laboratory | Report ID: MED-2026-0847", footer_style))

    doc.build(elements)
    print(f"✅ Sample lab report generated: {OUTPUT_PATH}")


def _make_table(data):
    """Create a styled lab result table."""
    table = Table(data, colWidths=[160, 80, 70, 120])
    style = [
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#283593')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('ALIGN', (2, 0), (2, -1), 'CENTER'),
        ('ALIGN', (3, 0), (3, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c5cae9')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
    ]
    table.setStyle(TableStyle(style))
    return table


if __name__ == "__main__":
    generate_sample_report()

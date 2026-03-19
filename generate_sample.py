from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

doc = SimpleDocTemplate('sample_lab_report.pdf', pagesize=letter,
                        topMargin=0.5*inch, bottomMargin=0.5*inch)
styles = getSampleStyleSheet()
title_style = ParagraphStyle('Title2', parent=styles['Title'], fontSize=18, spaceAfter=6)
subtitle_style = ParagraphStyle('Sub', parent=styles['Normal'], fontSize=10, textColor=colors.grey)
heading_style = ParagraphStyle('Head', parent=styles['Heading2'], fontSize=13, spaceAfter=8, spaceBefore=16)

elements = []
elements.append(Paragraph('City General Hospital', title_style))
elements.append(Paragraph('Department of Clinical Pathology — Laboratory Report', subtitle_style))
elements.append(Spacer(1, 12))

# Patient info
patient_data = [
    ['Patient Name:', 'Rahul Sharma', 'Age/Sex:', '45 / Male'],
    ['Patient ID:', 'CGH-2026-04521', 'Date:', 'March 10, 2026'],
    ['Referred By:', 'Dr. Priya Mehta', 'Sample:', 'Venous Blood'],
]
pt = Table(patient_data, colWidths=[1.2*inch, 2.2*inch, 1.2*inch, 2.2*inch])
pt.setStyle(TableStyle([
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
    ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LINEBELOW', (0,-1), (-1,-1), 1, colors.black),
]))
elements.append(pt)
elements.append(Spacer(1, 12))

# CBC
elements.append(Paragraph('Complete Blood Count (CBC)', heading_style))
cbc = [
    ['Test', 'Result', 'Unit', 'Reference Range', 'Flag'],
    ['Hemoglobin', '8.9', 'g/dL', '13.0 - 17.0', 'LOW'],
    ['RBC Count', '3.8', 'million/uL', '4.5 - 5.5', 'LOW'],
    ['WBC Count', '12500', '/uL', '4000 - 11000', 'HIGH'],
    ['Platelet Count', '135000', '/uL', '150000 - 400000', 'LOW'],
    ['Hematocrit', '28.5', '%', '38.0 - 50.0', 'LOW'],
    ['MCV', '72.1', 'fL', '80.0 - 100.0', 'LOW'],
    ['MCH', '24.8', 'pg', '27.0 - 33.0', 'LOW'],
    ['MCHC', '31.2', 'g/dL', '32.0 - 36.0', 'LOW'],
    ['Neutrophils', '78', '%', '40 - 70', 'HIGH'],
    ['Lymphocytes', '15', '%', '20 - 40', 'LOW'],
    ['ESR', '45', 'mm/hr', '0 - 20', 'HIGH'],
]
t = Table(cbc, colWidths=[1.8*inch, 1*inch, 1*inch, 1.5*inch, 0.7*inch])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1a365d')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f0f4f8')]),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('TEXTCOLOR', (4,1), (4,-1), colors.red),
    ('FONTNAME', (4,1), (4,-1), 'Helvetica-Bold'),
]))
elements.append(t)

# Metabolic Panel
elements.append(Paragraph('Comprehensive Metabolic Panel', heading_style))
cmp = [
    ['Test', 'Result', 'Unit', 'Reference Range', 'Flag'],
    ['Glucose (Fasting)', '185', 'mg/dL', '70 - 100', 'HIGH'],
    ['HbA1c', '8.2', '%', '4.0 - 5.6', 'HIGH'],
    ['BUN', '32', 'mg/dL', '7 - 20', 'HIGH'],
    ['Creatinine', '1.8', 'mg/dL', '0.7 - 1.3', 'HIGH'],
    ['eGFR', '52', 'mL/min', '>60', 'LOW'],
    ['Sodium', '138', 'mEq/L', '136 - 145', 'NORMAL'],
    ['Potassium', '5.6', 'mEq/L', '3.5 - 5.0', 'HIGH'],
    ['Calcium', '8.2', 'mg/dL', '8.5 - 10.5', 'LOW'],
    ['Total Protein', '6.1', 'g/dL', '6.0 - 8.3', 'NORMAL'],
    ['Albumin', '3.2', 'g/dL', '3.5 - 5.5', 'LOW'],
]
t2 = Table(cmp, colWidths=[1.8*inch, 1*inch, 1*inch, 1.5*inch, 0.7*inch])
t2.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1a365d')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f0f4f8')]),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('TEXTCOLOR', (4,1), (4,-1), colors.red),
    ('FONTNAME', (4,1), (4,-1), 'Helvetica-Bold'),
]))
elements.append(t2)

# Lipid + Liver + Thyroid
elements.append(Paragraph('Lipid Profile / Liver Function / Thyroid', heading_style))
lip = [
    ['Test', 'Result', 'Unit', 'Reference Range', 'Flag'],
    ['Total Cholesterol', '265', 'mg/dL', '<200', 'HIGH'],
    ['LDL Cholesterol', '178', 'mg/dL', '<100', 'HIGH'],
    ['HDL Cholesterol', '35', 'mg/dL', '>40', 'LOW'],
    ['Triglycerides', '280', 'mg/dL', '<150', 'HIGH'],
    ['ALT (SGPT)', '68', 'U/L', '7 - 56', 'HIGH'],
    ['AST (SGOT)', '72', 'U/L', '10 - 40', 'HIGH'],
    ['ALP', '95', 'U/L', '44 - 147', 'NORMAL'],
    ['Total Bilirubin', '1.8', 'mg/dL', '0.1 - 1.2', 'HIGH'],
    ['TSH', '6.8', 'mIU/L', '0.4 - 4.0', 'HIGH'],
    ['Ferritin', '12', 'ng/mL', '20 - 250', 'LOW'],
    ['Vitamin D', '14', 'ng/mL', '30 - 100', 'LOW'],
    ['CRP', '18.5', 'mg/L', '<3.0', 'HIGH'],
    ['Iron', '35', 'ug/dL', '60 - 170', 'LOW'],
]
t3 = Table(lip, colWidths=[1.8*inch, 1*inch, 1*inch, 1.5*inch, 0.7*inch])
t3.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1a365d')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f0f4f8')]),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('TEXTCOLOR', (4,1), (4,-1), colors.red),
    ('FONTNAME', (4,1), (4,-1), 'Helvetica-Bold'),
]))
elements.append(t3)

elements.append(Spacer(1, 20))
elements.append(Paragraph('Pathologist: Dr. Anil Kumar, MD (Pathology)', 
    ParagraphStyle('sig', parent=styles['Normal'], fontSize=9, textColor=colors.grey)))
elements.append(Paragraph('This report is for clinical reference only.', 
    ParagraphStyle('disc', parent=styles['Normal'], fontSize=8, textColor=colors.lightgrey)))

doc.build(elements)
print('Generated: sample_lab_report.pdf')

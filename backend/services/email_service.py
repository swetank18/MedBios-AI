"""
MedBios AI — Email Alert Service
Sends HTML email alerts for critical lab values using stdlib smtplib.
No extra dependencies required.
"""
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)


async def send_critical_alert(
    to_email: str,
    patient_name: str,
    report_id: str,
    critical_findings: list,  # list[dict]: [{test_name, value, unit, direction, reference}]
):
    """Send HTML email alert for critical lab values. Silently fails if SMTP not configured."""
    if not SMTP_USER or not SMTP_PASS:
        return  # SMTP not configured — skip silently

    subject = f"[MedBios AI] Critical Lab Alert — {patient_name}"

    # Build HTML rows for each critical finding
    rows = ""
    for f in critical_findings:
        rows += f"""
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb">{f.get('test_name', f.get('canonical_name', ''))}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#dc2626">{f.get('value', '')} {f.get('unit', f.get('expected_unit', ''))}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb">{f.get('direction', f.get('status', 'Abnormal'))}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280">{f.get('reference', '')}</td>
        </tr>"""

    html = f"""
    <html><body style="font-family:Inter,sans-serif;color:#1a2e2a;max-width:600px;margin:0 auto">
      <div style="background:#065f46;padding:20px 24px;border-radius:12px 12px 0 0">
        <h2 style="color:#fff;margin:0">MedBios AI — Critical Alert</h2>
        <p style="color:#a7f3d0;margin:4px 0 0">Immediate attention required</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #d1fae5;border-top:none;border-radius:0 0 12px 12px">
        <p>Critical lab values detected for <strong>{patient_name}</strong> (Report #{report_id}):</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f0fdf4">
              <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase">Test</th>
              <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase">Value</th>
              <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase">Direction</th>
              <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase">Reference</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        <p style="font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:16px">
          For clinical decision support only. Not a substitute for professional medical judgment.<br>
          MedBios AI — Clinical Intelligence Platform
        </p>
      </div>
    </body></html>"""

    import asyncio
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _send_sync, to_email, subject, html)


def _send_sync(to_email: str, subject: str, html: str):
    """Blocking SMTP send — runs in thread pool to avoid blocking the async loop."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = FROM_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_EMAIL, [to_email], msg.as_string())
    except Exception:
        pass  # Never let email failure break the pipeline

"""
MedBios AI — Field-Level Encryption Service
Symmetric encryption (Fernet/AES-128-CBC) for sensitive model fields.

Usage:
    from services.encryption import encrypt_field, decrypt_field

    stored = encrypt_field("John Doe")   # returns base64 ciphertext string
    plain  = decrypt_field(stored)       # returns "John Doe"

Key management:
    Set MEDBIOS_ENCRYPTION_KEY env var to a URL-safe base64-encoded 32-byte key.
    Generate a new key with:
        python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

    If the env var is absent a random key is generated at startup and a warning is
    logged.  All rows encrypted with a previous key become unreadable after restart
    if no persistent key is configured.

Migration note:
    Existing rows that store plain-text values were written before this feature was
    added.  Run a one-time migration script to re-encrypt them:
        for report in session.query(Report).all():
            if report._patient_name and not report._patient_name.startswith("gAAAA"):
                report._patient_name = encrypt_field(report._patient_name)
        session.commit()
"""
import logging
import os

from cryptography.fernet import Fernet, InvalidToken

logger = logging.getLogger(__name__)

_fernet: Fernet | None = None


def get_fernet() -> Fernet:
    """Return the singleton Fernet instance, initialising it on first call."""
    global _fernet
    if _fernet is not None:
        return _fernet

    raw_key = os.environ.get("MEDBIOS_ENCRYPTION_KEY")
    if raw_key:
        key = raw_key.encode()
    else:
        key = Fernet.generate_key()
        logger.warning(
            "MEDBIOS_ENCRYPTION_KEY is not set. "
            "A random encryption key was generated — encrypted data will be "
            "unreadable after process restart. "
            "Set MEDBIOS_ENCRYPTION_KEY to a persistent key in production."
        )

    _fernet = Fernet(key)
    return _fernet


def encrypt_field(value: str) -> str:
    """Encrypt a string value and return a URL-safe base64 ciphertext string."""
    if not value:
        return value
    return get_fernet().encrypt(value.encode()).decode()


def decrypt_field(value: str) -> str:
    """Decrypt a ciphertext string produced by encrypt_field."""
    if not value:
        return value
    try:
        return get_fernet().decrypt(value.encode()).decode()
    except (InvalidToken, Exception) as exc:  # noqa: BLE001
        logger.warning("Field decryption failed (returning raw value): %s", exc)
        return value

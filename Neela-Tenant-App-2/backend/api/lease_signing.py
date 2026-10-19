"""
Two-party lease signing helpers.

Flow:
  1. Admin sends lease → tenant token (role=tenant), status Sent
  2. Tenant signs → stamp tenant fields, status AwaitingLandlord, landlord token + email
  3. Landlord signs → stamp landlord fields, status Signed, tenant Approved, both-parties emails
  4. Admin Finalize Move-In → tenant Active
"""
from __future__ import annotations

import logging
import mimetypes
from datetime import timedelta

from django.conf import settings
from django.core.files.base import ContentFile
from django.utils import timezone

from .lease_service import stamp_signed_pdf
from .models import LeaseSigningToken

logger = logging.getLogger(__name__)

STATUS_SENT = 'Sent'
STATUS_AWAITING_LANDLORD = 'AwaitingLandlord'
STATUS_SIGNED = 'Signed'


def tenant_signing_fields():
    """Fields the tenant must complete. Landlord block is not shown on tenant link."""
    return [
        {
            "id": "agree_terms",
            "type": "checkbox",
            "label": "I agree to the terms",
            "page": 1,
            "x": 0.12,
            "y": 0.72,
            "width": 0.04,
            "height": 0.04,
            "required": True,
        },
        {
            "id": "agree_rules",
            "type": "checkbox",
            "label": "I agree to community rules",
            "page": 1,
            "x": 0.12,
            "y": 0.76,
            "width": 0.04,
            "height": 0.04,
            "required": True,
        },
        {
            "id": "tenant_initials",
            "type": "text",
            "label": "Initials",
            "page": 1,
            "x": 0.55,
            "y": 0.72,
            "width": 0.12,
            "height": 0.04,
            "required": True,
        },
        {
            "id": "tenant_signature",
            "type": "signature",
            "label": "Tenant Signature",
            "page": 1,
            "x": 0.12,
            "y": 0.82,
            "width": 0.35,
            "height": 0.07,
            "required": True,
        },
        {
            "id": "tenant_signature_date",
            "type": "text",
            "label": "Date",
            "page": 1,
            "x": 0.52,
            "y": 0.82,
            "width": 0.15,
            "height": 0.05,
            "required": True,
        },
    ]


def landlord_signing_fields():
    """Fields the landlord/admin must complete after the tenant has signed."""
    return [
        {
            "id": "landlord_signature",
            "type": "signature",
            "label": "Landlord Signature",
            "page": 1,
            "x": 0.12,
            "y": 0.9,
            "width": 0.35,
            "height": 0.07,
            "required": True,
        },
        {
            "id": "landlord_signature_date",
            "type": "text",
            "label": "Date",
            "page": 1,
            "x": 0.52,
            "y": 0.9,
            "width": 0.15,
            "height": 0.05,
            "required": True,
        },
    ]


def fields_for_role(role: str):
    if role == LeaseSigningToken.ROLE_LANDLORD:
        return landlord_signing_fields()
    return tenant_signing_fields()


def create_signing_token(legal_doc, role: str) -> LeaseSigningToken:
    """Replace any existing unused/used token for this doc+role with a fresh one."""
    LeaseSigningToken.objects.filter(legal_document=legal_doc, role=role).delete()
    return LeaseSigningToken.objects.create(
        legal_document=legal_doc,
        role=role,
        expires_at=timezone.now() + timedelta(days=7),
    )


def save_stamped_pdf(legal_doc, signed_pdf_bytes: bytes, filename: str) -> None:
    """Persist stamped PDF to Cloudinary (preferred) or local storage."""
    if hasattr(settings, 'CLOUDINARY_STORAGE') and settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'):
        try:
            import cloudinary.uploader

            if not cloudinary.config().api_secret:
                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
                    api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
                    api_secret=settings.CLOUDINARY_STORAGE['API_SECRET'],
                )
            public_id_new = f"media/signed_leases/{filename}"
            if public_id_new.lower().endswith('.pdf'):
                public_id_new = public_id_new[:-4]
            upload_result = cloudinary.uploader.upload(
                signed_pdf_bytes,
                resource_type="raw",
                public_id=public_id_new,
                type="upload",
                format="pdf",
            )
            legal_doc.pdf_file.name = upload_result.get('public_id') or public_id_new
            # Proxy URL (auth or signing token) — signed_pdf_url was never written before.
            legal_doc.signed_pdf_url = f"/api/legal-documents/{legal_doc.id}/pdf/"
            return
        except Exception as e:
            logger.error(f"Cloudinary upload failed for signed PDF: {e}")

    legal_doc.pdf_file.save(filename, ContentFile(signed_pdf_bytes), save=False)
    legal_doc.signed_pdf_url = f"/api/legal-documents/{legal_doc.id}/pdf/"


def stamp_and_save(legal_doc, pdf_bytes: bytes, fields, values, filename: str) -> bytes:
    signed_pdf_bytes = stamp_signed_pdf(pdf_bytes, fields, values)
    save_stamped_pdf(legal_doc, signed_pdf_bytes, filename)
    return signed_pdf_bytes


def complete_tenant_signature(legal_doc, audit: dict) -> LeaseSigningToken:
    """
    After tenant signs: keep lease pending landlord, do not approve/activate tenant.
    Returns the new landlord signing token.
    """
    legal_doc.status = STATUS_AWAITING_LANDLORD
    legal_doc.signing_audit = {
        **(legal_doc.signing_audit or {}),
        'tenant': audit,
    }
    legal_doc.save(update_fields=['status', 'signing_audit', 'pdf_file', 'signed_pdf_url'])

    tenant = legal_doc.tenant
    tenant.lease_status = STATUS_AWAITING_LANDLORD
    tenant.save(update_fields=['lease_status'])

    landlord_token = create_signing_token(legal_doc, LeaseSigningToken.ROLE_LANDLORD)

    from .email_service import (
        _send_landlord_lease_ready_to_sign,
        run_async,
        send_landlord_lease_ready_to_sign,
    )

    try:
        run_async(send_landlord_lease_ready_to_sign, legal_doc.id, str(landlord_token.token))
    except Exception:
        try:
            _send_landlord_lease_ready_to_sign(legal_doc.id, token=str(landlord_token.token))
        except Exception as e:
            logger.error(f"Failed to send landlord signing email: {e}", exc_info=True)

    return landlord_token


def complete_landlord_signature(legal_doc, audit: dict) -> None:
    """
    After landlord signs: lease fully executed, tenant Approved (not Active),
    send both-parties confirmation + tenant account setup email.
    """
    legal_doc.status = STATUS_SIGNED
    legal_doc.signed_at = timezone.now()
    existing_audit = legal_doc.signing_audit if isinstance(legal_doc.signing_audit, dict) else {}
    legal_doc.signing_audit = {
        **existing_audit,
        'landlord': audit,
        'fully_signed_at': legal_doc.signed_at.isoformat(),
    }
    legal_doc.save(update_fields=['status', 'signed_at', 'signing_audit', 'pdf_file', 'signed_pdf_url'])

    tenant = legal_doc.tenant
    tenant.lease_status = STATUS_SIGNED
    update_fields = ['lease_status']
    # Dual signature = approved in backend (account setup email). Active only via Finalize Move-In.
    if tenant.status != 'Active':
        tenant.status = 'Approved'
        update_fields.append('status')
    tenant.save(update_fields=update_fields)

    from .email_service import (
        run_async,
        send_lease_signed_confirmation,
    )

    try:
        run_async(send_lease_signed_confirmation, legal_doc.id)
    except Exception:
        try:
            send_lease_signed_confirmation(legal_doc.id)
        except Exception as e:
            logger.error(f"Failed to send fully-signed confirmation: {e}", exc_info=True)

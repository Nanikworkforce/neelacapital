"""
Seed DocumentTemplateVersion v1 + DocumentFields for Neela Texas Residential Lease.
Idempotent: skips if a published version already exists for that template.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

import fitz
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import DocumentField, DocumentTemplateVersion, LeaseTemplate

TEMPLATE_NAMES = (
    'Neela Texas Residential Lease',
    'Neela Texas Residential',
)

# Measured blanks on branded 14-page lease (page 12 execution block)
TEXAS_V1_FIELDS = [
    {
        'field_key': 'agree_terms',
        'field_type': DocumentField.TYPE_CHECKBOX,
        'label': 'I agree to the terms',
        'page_number': 12,
        'x': 0.12,
        'y': 0.50,
        'width': 0.04,
        'height': 0.02,
        'required': True,
        'signer_role': DocumentField.ROLE_TENANT,
        'stamp': False,
    },
    {
        'field_key': 'agree_rules',
        'field_type': DocumentField.TYPE_CHECKBOX,
        'label': 'I agree to community rules',
        'page_number': 12,
        'x': 0.12,
        'y': 0.53,
        'width': 0.04,
        'height': 0.02,
        'required': True,
        'signer_role': DocumentField.ROLE_TENANT,
        'stamp': False,
    },
    {
        'field_key': 'landlord_signature',
        'field_type': DocumentField.TYPE_SIGNATURE,
        'label': 'Authorized Signature',
        'page_number': 12,
        'x': 0.279,
        'y': 0.509,
        'width': 0.268,
        'height': 0.045,
        'required': True,
        'signer_role': DocumentField.ROLE_LANDLORD,
        'stamp': True,
    },
    {
        'field_key': 'landlord_signature_date',
        'field_type': DocumentField.TYPE_DATE,
        'label': 'Date',
        'page_number': 12,
        'x': 0.601,
        'y': 0.509,
        'width': 0.125,
        'height': 0.02,
        'required': True,
        'signer_role': DocumentField.ROLE_LANDLORD,
        'stamp': True,
    },
    {
        'field_key': 'tenant_signature',
        'field_type': DocumentField.TYPE_SIGNATURE,
        'label': 'Tenant Signature',
        'page_number': 12,
        'x': 0.266,
        'y': 0.566,
        'width': 0.268,
        'height': 0.045,
        'required': True,
        'signer_role': DocumentField.ROLE_TENANT,
        'stamp': True,
    },
    {
        'field_key': 'tenant_signature_date',
        'field_type': DocumentField.TYPE_DATE,
        'label': 'Date',
        'page_number': 12,
        'x': 0.587,
        'y': 0.566,
        'width': 0.125,
        'height': 0.02,
        'required': True,
        'signer_role': DocumentField.ROLE_TENANT,
        'stamp': True,
    },
    {
        'field_key': 'tenant_initials',
        'field_type': DocumentField.TYPE_INITIALS,
        'label': 'Initials',
        'page_number': 12,
        'x': 0.364,
        'y': 0.885,
        'width': 0.054,
        'height': 0.02,
        'required': True,
        'signer_role': DocumentField.ROLE_TENANT,
        'stamp': True,
    },
]


def _find_template() -> LeaseTemplate | None:
    for name in TEMPLATE_NAMES:
        t = LeaseTemplate.objects.filter(name__iexact=name, is_active=True).first()
        if t:
            return t
        t = LeaseTemplate.objects.filter(name__icontains=name, is_active=True).first()
        if t:
            return t
    return LeaseTemplate.objects.filter(
        is_active=True, name__icontains='Neela Texas'
    ).first()


class Command(BaseCommand):
    help = 'Seed published DocumentTemplateVersion v1 for Neela Texas lease PDF + signing fields'

    def handle(self, *args, **options):
        template = _find_template()
        if not template:
            self.stdout.write(self.style.WARNING(
                'No Neela Texas LeaseTemplate found — run seed_neela_texas_lease first.'
            ))
            return

        existing = template.versions.filter(
            status=DocumentTemplateVersion.STATUS_PUBLISHED
        ).first()
        if existing:
            self.stdout.write(self.style.SUCCESS(
                f'Already have published version v{existing.version_number} for {template.name}'
            ))
            return

        pdf_path = (
            Path(__file__).resolve().parents[2]
            / 'lease_assets'
            / 'neela_texas_lease_template.pdf'
        )
        if not pdf_path.is_file():
            self.stdout.write(self.style.ERROR(f'Missing template PDF: {pdf_path}'))
            return

        pdf_bytes = pdf_path.read_bytes()
        file_hash = hashlib.sha256(pdf_bytes).hexdigest()
        try:
            page_count = fitz.open(stream=pdf_bytes, filetype='pdf').page_count
        except Exception:
            page_count = 14

        next_num = 1
        last = template.versions.order_by('-version_number').first()
        if last:
            next_num = last.version_number + 1

        version = DocumentTemplateVersion(
            lease_template=template,
            version_number=next_num,
            status=DocumentTemplateVersion.STATUS_PUBLISHED,
            file_hash=file_hash,
            page_count=page_count,
            published_at=timezone.now(),
        )
        version.pdf_file.save(
            f'neela_texas_v{next_num}.pdf',
            ContentFile(pdf_bytes),
            save=False,
        )
        version.save()

        for spec in TEXAS_V1_FIELDS:
            DocumentField.objects.create(template_version=version, **spec)

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {template.name} v{next_num} published with {len(TEXAS_V1_FIELDS)} fields'
        ))

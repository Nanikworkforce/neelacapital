"""Cozy Suite on Wooding — April 2026 property P&L (master line-item format)."""
import os
import sys
from datetime import date
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neela_backend.settings')

import django

django.setup()

from django.db import transaction

from api.management.commands.import_income_statement import map_category
from api.models import OperatingExpense, Payment, Property, Tenant
from api.pnl_service import compute_property_pnl, import_tag_for_year

YEAR = 2026
MONTH = 4
TAG = import_tag_for_year(YEAR)
LISTING = 'Cozy Suite on Wooding'
PROP_ID = 19

GROSS_EARNINGS = Decimal('942.85')
EXPENSES = [
    ('Rent', Decimal('1100.00')),
    ('Electricity', Decimal('84.53')),
    ('Internet', Decimal('41.52')),
    ('Water Bill', Decimal('142.96')),
    ('Kitchen & Bathroom supplies', Decimal('50.00')),
    ('Cleaning Fees', Decimal('160.00')),
]


def note(label):
    return f'{TAG}|{LISTING}|{MONTH:02d}|{label[:80]}'


def get_tenant(prop):
    email = f'excel-import-{prop.id}@neela.local'
    tenant, _ = Tenant.objects.get_or_create(
        email=email,
        defaults={
            'name': f'Rent Roll — {prop.name}',
            'phone': '0000000000',
            'status': 'Active',
            'property_unit': prop.address,
            'rent_amount': Decimal('0'),
            'deposit': Decimal('0'),
        },
    )
    return tenant


def main():
    prop = Property.objects.get(id=PROP_ID)
    tenant = get_tenant(prop)
    month_date = date(YEAR, MONTH, 1)

    with transaction.atomic():
        Payment.objects.filter(
            reference__startswith=f'{TAG}-{prop.id}-',
            date__year=YEAR,
            date__month=MONTH,
        ).delete()
        OperatingExpense.objects.filter(
            property=prop,
            date__year=YEAR,
            date__month=MONTH,
            notes__startswith=f'{TAG}|',
        ).delete()

        Payment.objects.create(
            tenant=tenant,
            amount=GROSS_EARNINGS,
            date=month_date,
            status='Paid',
            type='Rent',
            method='Excel Import',
            reference=f'{TAG}-{prop.id}-{YEAR}-{MONTH:02d}-gross-earnings',
        )
        for label, amount in EXPENSES:
            OperatingExpense.objects.create(
                property=prop,
                amount=amount,
                category=map_category(label),
                visibility='operating',
                date=month_date,
                notes=note(label),
            )

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    apr = result['monthly'][3]
    print(f'{LISTING} April 2026 P&L inserted')
    print(f"  Gross Earnings: ${GROSS_EARNINGS:,.2f}")
    print(f"  Expenses:       ${apr['expenses']:,.2f}")
    print(f"  Net Profit:     ${apr['net']:,.2f}")


if __name__ == '__main__':
    main()

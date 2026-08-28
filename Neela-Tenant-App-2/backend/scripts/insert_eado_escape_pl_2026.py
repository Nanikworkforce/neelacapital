"""EaDo Escape — Feb–Apr 2026 property P&L (master line-item format)."""
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
TAG = import_tag_for_year(YEAR)
LISTING = 'EaDo Escape'
PROP_ID = 5

# (month, gross_earnings, expenses)
MONTHS = [
    (
        2,
        Decimal('700.03'),
        [
            ('Rent', Decimal('1600.00')),
            ('Electricity', Decimal('250.20')),
            ('Internet', Decimal('63.46')),
            ('Water Bill', Decimal('739.43')),
            ('Kitchen & Bathroom supplies', Decimal('50.00')),
            ('Cleaning Fees', Decimal('120.00')),
        ],
    ),
    (
        3,
        Decimal('2542.81'),
        [
            ('Rent', Decimal('1600.00')),
            ('Electricity', Decimal('145.98')),
            ('Internet', Decimal('63.46')),
            ('Water Bill', Decimal('916.29')),
            ('Kitchen & Bathroom supplies', Decimal('50.00')),
            ('Cleaning Fees', Decimal('300.00')),
        ],
    ),
    (
        4,
        Decimal('783.85'),
        [
            ('Rent', Decimal('1600.00')),
            ('Electricity', Decimal('158.87')),
            ('Internet', Decimal('63.46')),
            ('Water Bill', Decimal('1084.33')),
            ('Kitchen & Bathroom supplies', Decimal('50.00')),
            ('Cleaning Fees', Decimal('140.00')),
        ],
    ),
]


def note(month, label):
    return f'{TAG}|{LISTING}|{month:02d}|{label[:80]}'


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

    with transaction.atomic():
        for month, _gross, _expenses in MONTHS:
            Payment.objects.filter(
                reference__startswith=f'{TAG}-{prop.id}-',
                date__year=YEAR,
                date__month=month,
            ).delete()
            OperatingExpense.objects.filter(
                property=prop,
                date__year=YEAR,
                date__month=month,
                notes__startswith=f'{TAG}|',
            ).delete()

        for month, gross, expenses in MONTHS:
            month_date = date(YEAR, month, 1)
            Payment.objects.create(
                tenant=tenant,
                amount=gross,
                date=month_date,
                status='Paid',
                type='Rent',
                method='Excel Import',
                reference=f'{TAG}-{prop.id}-{YEAR}-{month:02d}-gross-earnings',
            )
            for label, amount in expenses:
                OperatingExpense.objects.create(
                    property=prop,
                    amount=amount,
                    category=map_category(label),
                    visibility='operating',
                    date=month_date,
                    notes=note(month, label),
                )

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    print(f'{LISTING} Feb–Apr 2026 P&L inserted')
    for m in result['monthly']:
        if m['month'] in (2, 3, 4):
            print(
                f"  {m['month']:02d}: gross=${m['income']:,.2f} "
                f"expenses=${m['expenses']:,.2f} net=${m['net']:,.2f}"
            )


if __name__ == '__main__':
    main()

"""Update 70th 2026 bottom section (NOI $820) for all months except Jan & Oct."""
import os
import sys
from datetime import date
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neela_backend.settings')

import django

django.setup()

from django.db import transaction

from api.models import OperatingExpense, Payment, Property, Tenant
from api.pnl_service import compute_property_pnl, import_tag_for_year

YEAR = 2026
TAG = import_tag_for_year(YEAR)
SHEET = '70th'
PROP_ID = 26

# Bottom section applies to these months only (exclude Jan=1, Oct=10)
BOTTOM_MONTHS = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12]
TARGET_NOI = Decimal('820.00')
TARGET_INCOME = Decimal('850.00')
TARGET_EXPENSES = Decimal('30.00')


def get_portfolio_tenant(prop):
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
    tenant = get_portfolio_tenant(prop)

    with transaction.atomic():
        for month in BOTTOM_MONTHS:
            month_date = date(YEAR, month, 1)

            # Financing section: blank — remove any admin-only rows
            OperatingExpense.objects.filter(
                property=prop,
                date__year=YEAR,
                date__month=month,
                visibility='admin_only',
                notes__startswith=f'{TAG}|{SHEET}|',
            ).delete()

            # Summary requires $850 income for $820 NOI (incl. Sep)
            Payment.objects.filter(
                reference__startswith=f'{TAG}-{prop.id}-',
                date__year=YEAR,
                date__month=month,
            ).delete()
            Payment.objects.create(
                tenant=tenant,
                amount=TARGET_INCOME,
                date=month_date,
                status='Paid',
                type='Rent',
                method='Excel Import',
                reference=f'{TAG}-{prop.id}-{YEAR}-{month:02d}-rent',
            )

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    print('70th 2026 bottom section updated (Feb–Dec except Oct)')
    for m in result['monthly']:
        marker = ' *' if m['month'] in BOTTOM_MONTHS else ''
        print(
            f"  {m['month']:02d}: income=${m['income']:,.2f} "
            f"expenses=${m['expenses']:,.2f} net=${m['net']:,.2f}{marker}"
        )
    row = result['by_property'][0]
    print(f"  Annual: income=${row['total_income']:,.2f} expenses=${row['total_expenses']:,.2f} net=${row['net_income']:,.2f}")


if __name__ == '__main__':
    main()

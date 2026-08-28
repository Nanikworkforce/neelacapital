"""One-off insert: Sherman 2025 P&L monthly totals."""
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

YEAR = 2025
TAG = import_tag_for_year(YEAR)
SHEET = 'Sherman'
PROP_ID = 25

MONTHS = [
    (1, Decimal('0'), Decimal('440.00')),
    (2, Decimal('0'), Decimal('120.00')),
    (3, Decimal('0'), Decimal('60.00')),
    (4, Decimal('0'), Decimal('60.00')),
    (5, Decimal('0'), Decimal('60.00')),
    (6, Decimal('0'), Decimal('60.00')),
    (7, Decimal('0'), Decimal('60.00')),
    (8, Decimal('0'), Decimal('60.00')),
    (9, Decimal('0'), Decimal('60.00')),
    (10, Decimal('0'), Decimal('60.00')),
    (11, Decimal('0'), Decimal('60.00')),
    (12, Decimal('0'), Decimal('60.00')),
]


def main():
    prop = Property.objects.get(id=PROP_ID)
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

    with transaction.atomic():
        Payment.objects.filter(reference__startswith=f'{TAG}-{prop.id}-').delete()
        OperatingExpense.objects.filter(notes__startswith=f'{TAG}|{SHEET}|').delete()

        for month, income, expenses in MONTHS:
            if income != 0:
                Payment.objects.update_or_create(
                    reference=f'{TAG}-{prop.id}-{YEAR}-{month:02d}-rent',
                    defaults={
                        'tenant': tenant,
                        'amount': income,
                        'date': date(YEAR, month, 1),
                        'status': 'Paid',
                        'type': 'Rent',
                        'method': 'Excel Import',
                    },
                )
            OperatingExpense.objects.update_or_create(
                property=prop,
                date=date(YEAR, month, 1),
                notes=f'{TAG}|{SHEET}|{month:02d}|__SUMMARY__',
                defaults={
                    'amount': expenses,
                    'category': 'other',
                    'visibility': 'operating',
                },
            )

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    row = result['by_property'][0]
    print('Inserted Sherman 2025')
    print(f"Total Income:   ${row['total_income']:,.2f}")
    print(f"Total Expenses: ${row['total_expenses']:,.2f}")
    print(f"Net Income:     ${row['net_income']:,.2f}")
    print('Monthly:')
    for m in result['monthly']:
        print(
            f"  {m['month']:02d}: income=${m['income']:,.2f} "
            f"expenses=${m['expenses']:,.2f} net=${m['net']:,.2f}"
        )


if __name__ == '__main__':
    main()

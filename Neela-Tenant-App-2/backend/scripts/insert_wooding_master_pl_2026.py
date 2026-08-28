"""Wooding 2026 — Monthly Profit and Loss Breakdown (Jan–Apr only; May–Dec blank)."""
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
from api.models import OperatingExpense, Payment, Property, PropertyFinancials, Tenant
from api.pnl_service import compute_property_pnl, import_tag_for_year

YEAR = 2026
TAG = import_tag_for_year(YEAR)
SHEET = 'Wooding'
PROP_ID = 19

# (month, gross_earnings, [(expense_label, amount), ...])
MONTHS = [
    (
        1,
        Decimal('1016.01'),
        [
            ('Rent', Decimal('2500.00')),
            ('Electricity', Decimal('284.50')),
            ('Kitchen & Bathroom Supplies', Decimal('100.00')),
            ('Cleaning Fees', Decimal('120.00')),
        ],
    ),
    (
        2,
        Decimal('3090.17'),
        [
            ('Rent', Decimal('4100.00')),
            ('Electricity', Decimal('503.42')),
            ('Kitchen & Bathroom Supplies', Decimal('150.00')),
            ('Cleaning Fees', Decimal('660.00')),
        ],
    ),
    (
        3,
        Decimal('7209.17'),
        [
            ('Rent', Decimal('6350.00')),
            ('Electricity', Decimal('487.97')),
            ('Kitchen & Bathroom Supplies', Decimal('250.00')),
            ('Cleaning Fees', Decimal('1020.00')),
        ],
    ),
]


def note(month, label):
    return f'{TAG}|{SHEET}|{month:02d}|{label[:80]}'


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
        Payment.objects.filter(
            reference__startswith=f'{TAG}-{prop.id}-',
            date__year=YEAR,
            reference__contains='-gross-earnings',
        ).delete()
        OperatingExpense.objects.filter(
            property=prop,
            date__year=YEAR,
            notes__startswith=f'{TAG}|{SHEET}|',
        ).delete()
        PropertyFinancials.objects.filter(property=prop).delete()

        for month, gross_earnings, expenses in MONTHS:
            month_date = date(YEAR, month, 1)
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
    row = result['by_property'][0]
    print('Wooding 2026 Monthly P&L Breakdown (Jan–Apr only)')
    print(f"  Total Income:   ${row['total_income']:,.2f}")
    print(f"  Total Expenses: ${row['total_expenses']:,.2f}")
    print(f"  Net Income:     ${row['net_income']:,.2f}")
    for m in result['monthly']:
        print(
            f"  {m['month']:02d}: income=${m['income']:,.2f} "
            f"expenses=${m['expenses']:,.2f} net=${m['net']:,.2f}"
        )


if __name__ == '__main__':
    main()

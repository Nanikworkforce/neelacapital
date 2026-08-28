"""Insert Avenue F Jan-Dec 2026 P&L — same monthly data repeated all year."""
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
from api.models import OperatingExpense, Payment, Property, PropertyFinancials
from api.pnl_service import compute_property_pnl, import_tag_for_year
from api.property_units_service import sync_units_for_property, unit_for_door_number

YEAR = 2026
MONTHS = list(range(1, 13))
TAG = import_tag_for_year(YEAR)
SHEET = 'Ave F'
PROP_ID = 20

DOORS = [
    (1, Decimal('0'), 'vacant'),
    (2, Decimal('0'), 'vacant'),
    (3, Decimal('0'), 'vacant'),
    (4, Decimal('0'), 'vacant'),
]

UNIT_EXPENSES = [
    (4, 'Property Management Fees', Decimal('30.00')),
]

FINANCIALS = {
    'purchase_price': Decimal('180000.00'),
    'down_payment': Decimal('18000.00'),
    'closing_cost': Decimal('0'),
    'loan_amount': Decimal('162000.00'),
    'interest_rate': Decimal('0.08'),
    'loan_term_years': 30,
    'monthly_mortgage_payment': Decimal('1189.00'),
    'annual_depreciation_years': Decimal('27.5'),
}

OPERATING_SUMMARY = Decimal('30.00')


def note(month, label):
    return f'{TAG}|{SHEET}|{month:02d}|{label[:80]}'


def unit_for_door(units, door_n):
    token = f'unit {door_n}'
    for unit in units:
        if token in (unit.label or '').lower():
            return unit
    unit = unit_for_door_number(units, door_n)
    if unit is None:
        raise ValueError(f'No unit for door {door_n}')
    return unit


def insert_month(prop, month, units):
    month_date = date(YEAR, month, 1)

    with transaction.atomic():
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

        if month == 1:
            PropertyFinancials.objects.update_or_create(property=prop, defaults=FINANCIALS)

        for door_n, label, amount in UNIT_EXPENSES:
            unit = unit_for_door(units, door_n)
            OperatingExpense.objects.create(
                property=prop,
                unit=unit,
                amount=amount,
                category=map_category(label),
                visibility='operating',
                date=month_date,
                notes=note(month, f'{label} - {unit.label}'),
            )

        OperatingExpense.objects.create(
            property=prop,
            amount=OPERATING_SUMMARY,
            category='other',
            visibility='operating',
            date=month_date,
            notes=note(month, '__SUMMARY__'),
        )

    units = sync_units_for_property(prop)
    for door_n, label, amount in UNIT_EXPENSES:
        unit = unit_for_door(units, door_n)
        OperatingExpense.objects.filter(
            property=prop,
            date=month_date,
            amount=amount,
            notes__contains=f'|{label[:40]}',
        ).update(unit=unit)


def main():
    prop = Property.objects.get(id=PROP_ID)
    units = sync_units_for_property(prop)

    for month in MONTHS:
        insert_month(prop, month, units)

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    row = result['by_property'][0]

    print('Avenue F Jan-Dec 2026 inserted')
    for m in result['monthly']:
        print(
            f"  {m['month']:02d}: income=${m['income']:,.2f} "
            f"expenses=${m['expenses']:,.2f} net=${m['net']:,.2f}"
        )
    print(
        f"  Year totals: income=${row['total_income']:,.2f} "
        f"expenses=${row['total_expenses']:,.2f} net=${row['net_income']:,.2f}"
    )
    fin = row.get('financials') or {}
    print(f"  Purchase Price: ${fin.get('purchase_price', 0):,.2f}")
    print(f"  Loan Amount:    ${fin.get('loan_amount', 0):,.2f}")


if __name__ == '__main__':
    main()

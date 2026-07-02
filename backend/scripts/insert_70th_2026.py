"""Insert/update 70th property 2026 — Jan breakdown applied to all 12 months."""
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
from api.property_units_service import sync_units_for_property, unit_for_door_number

YEAR = 2026
TAG = import_tag_for_year(YEAR)
SHEET = '70th'
PROP_ID = 26

# Monthly portfolio income from annual summary (Jan/Sep blank = 0)
MONTHLY_INCOME = {
    1: Decimal('0'),
    2: Decimal('850.00'),
    3: Decimal('850.00'),
    4: Decimal('850.00'),
    5: Decimal('850.00'),
    6: Decimal('850.00'),
    7: Decimal('850.00'),
    8: Decimal('850.00'),
    9: Decimal('850.00'),  # bottom section NOI $820 (same as Feb–Dec except Jan/Oct)
    10: Decimal('850.00'),
    11: Decimal('850.00'),
    12: Decimal('850.00'),
}

# Same expense breakdown every month: Unit 4 Property Management Fees only
UNIT_EXPENSES = [
    (4, 'Property Management Fees', Decimal('30.00')),
]

FINANCIALS = {
    'purchase_price': Decimal('274000.00'),
    'down_payment': Decimal('30000.00'),
    'loan_amount': Decimal('274000.00'),
    'interest_rate': Decimal('0.09'),
    'loan_term_years': 30,
    'monthly_mortgage_payment': Decimal('2191.00'),
}


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


def insert_month(prop, tenant, units, month):
    month_date = date(YEAR, month, 1)
    income = MONTHLY_INCOME[month]

    Payment.objects.filter(
        reference__startswith=f'{TAG}-{prop.id}-',
        date__year=YEAR,
        date__month=month,
    ).delete()
    OperatingExpense.objects.filter(
        property=prop,
        date__year=YEAR,
        date__month=month,
        notes__startswith=f'{TAG}|{SHEET}|{month:02d}|',
    ).delete()

    if income != 0:
        Payment.objects.create(
            tenant=tenant,
            amount=income,
            date=month_date,
            status='Paid',
            type='Rent',
            method='Excel Import',
            reference=f'{TAG}-{prop.id}-{YEAR}-{month:02d}-rent',
        )

    for door_n, label, amount in UNIT_EXPENSES:
        unit = unit_for_door_number(units, door_n)
        OperatingExpense.objects.create(
            property=prop,
            unit=unit,
            amount=amount,
            category=map_category(label),
            visibility='operating',
            date=month_date,
            notes=note(month, f'{label} — {unit.label if unit else f"Unit {door_n}"}'),
        )

    OperatingExpense.objects.create(
        property=prop,
        amount=Decimal('30.00'),
        category='other',
        visibility='operating',
        date=month_date,
        notes=note(month, '__SUMMARY__'),
    )


def main():
    prop = Property.objects.get(id=PROP_ID)
    tenant = get_portfolio_tenant(prop)

    with transaction.atomic():
        Payment.objects.filter(
            reference__startswith=f'{TAG}-{prop.id}-',
            date__year=YEAR,
        ).delete()
        OperatingExpense.objects.filter(
            property=prop,
            date__year=YEAR,
            notes__startswith=f'{TAG}|{SHEET}|',
        ).delete()

        PropertyFinancials.objects.update_or_create(property=prop, defaults=FINANCIALS)
        units = sync_units_for_property(prop)

        for month in range(1, 13):
            insert_month(prop, tenant, units, month)

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    row = result['by_property'][0]
    print('70th 2026 detailed breakdown inserted (Jan template × 12 months)')
    print(f"  Total Income:   ${row['total_income']:,.2f}")
    print(f"  Total Expenses: ${row['total_expenses']:,.2f}")
    print(f"  Net Income:     ${row['net_income']:,.2f}")
    fin = row.get('financials') or {}
    print(f"  Purchase Price: ${fin.get('purchase_price', 0):,.2f}")
    print(f"  Loan Amount:    ${fin.get('loan_amount', 0):,.2f}")
    print(f"  Interest Rate:  {float(fin.get('interest_rate', 0)) * 100:.3f}%")
    print('  Monthly:')
    for m in result['monthly']:
        print(
            f"    {m['month']:02d}: income=${m['income']:,.2f} "
            f"expenses=${m['expenses']:,.2f} net=${m['net']:,.2f}"
        )
    print('  Units (annual):')
    for unit in row['units']:
        print(
            f"    {unit['label']}: rent=${unit['rent_income']:,.2f} "
            f"expenses=${unit['total_expenses']:,.2f} net=${unit['net_income']:,.2f}"
        )


if __name__ == '__main__':
    main()

"""Insert Avenue H 2026 — Jan breakdown applied to all 12 months (Feb–Dec same as Jan)."""
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
from api.property_units_service import find_group_siblings, sync_units_for_property, unit_for_door_number

YEAR = 2026
TAG = import_tag_for_year(YEAR)
SHEET = 'Avenue H'
PROP_ID = 18

# Door 4 (Erica) only — Doors 1–3 Air B&B blank
DOORS = [
    (1, Decimal('0'), 'vacant'),
    (2, Decimal('0'), 'vacant'),
    (3, Decimal('0'), 'vacant'),
    (4, Decimal('850.00'), 'occupied'),
]

UNIT_EXPENSES = [
    (4, 'Property Management Fees', Decimal('30.00')),
]

FINANCIALS = {
    'purchase_price': Decimal('300000.00'),
    'down_payment': Decimal('41513.32'),
    'closing_cost': Decimal('0'),
    'loan_amount': Decimal('275580.06'),
    'interest_rate': Decimal('0.09'),
    'loan_term_years': 30,
    'monthly_mortgage_payment': Decimal('2217.38'),
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


def get_door_tenant(prop, door_n, unit_label):
    email = f'excel-import-{prop.id}-door{door_n}@neela.local'
    tenant, _ = Tenant.objects.get_or_create(
        email=email,
        defaults={
            'name': f'{prop.name} — {unit_label}',
            'phone': '0000000000',
            'status': 'Active',
            'property_unit': unit_label,
            'rent_amount': Decimal('0'),
            'deposit': Decimal('0'),
        },
    )
    if tenant.property_unit != unit_label:
        tenant.property_unit = unit_label
        tenant.save(update_fields=['property_unit'])
    return tenant


def insert_month(prop, portfolio_tenant, units, month):
    month_date = date(YEAR, month, 1)

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

    Payment.objects.create(
        tenant=portfolio_tenant,
        amount=Decimal('850.00'),
        date=month_date,
        status='Paid',
        type='Rent',
        method='Excel Import',
        reference=f'{TAG}-{prop.id}-{YEAR}-{month:02d}-rent',
    )

    for door_n, rent, _status in DOORS:
        if rent == 0:
            continue
        unit = unit_for_door_number(units, door_n)
        Payment.objects.create(
            tenant=get_door_tenant(prop, door_n, unit.label if unit else f'Door {door_n}'),
            amount=rent,
            date=month_date,
            status='Paid',
            type='Rent',
            method='Excel Import',
            reference=f'{TAG}-{prop.id}-{YEAR}-{month:02d}-door-{door_n}-rent',
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
    portfolio_tenant = get_portfolio_tenant(prop)
    siblings = find_group_siblings(prop)

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

        for i, (door_n, rent, status) in enumerate(DOORS):
            if i < len(siblings):
                sib = siblings[i]
                sib.price = rent
                sib.status = status
                sib.save(update_fields=['price', 'status'])

        PropertyFinancials.objects.update_or_create(property=prop, defaults=FINANCIALS)
        units = sync_units_for_property(prop)

        for month in range(1, 13):
            insert_month(prop, portfolio_tenant, units, month)

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    row = result['by_property'][0]
    print('Avenue H 2026 inserted (Jan template × 12 months)')
    print(f"  Total Income:   ${row['total_income']:,.2f}")
    print(f"  Total Expenses: ${row['total_expenses']:,.2f}")
    print(f"  Net Income:     ${row['net_income']:,.2f}")
    fin = row.get('financials') or {}
    print(f"  Purchase Price: ${fin.get('purchase_price', 0):,.2f}")
    print(f"  Down Payment:   ${fin.get('down_payment', 0):,.2f}")
    print(f"  Loan Amount:    ${fin.get('loan_amount', 0):,.2f}")
    print(f"  Interest Rate:  {float(fin.get('interest_rate', 0)) * 100:.3f}%")
    print(f"  Mortgage P&I:   ${fin.get('monthly_mortgage_payment', 0):,.2f}")
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

"""Insert Avenue Q Jan 2026 P&L with per-door income and unit-level expenses."""
import os
import sys
from datetime import date
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neela_backend.settings')

import django

django.setup()

from django.db import transaction

from api.management.commands.import_income_statement import map_category, is_admin_expense
from api.models import OperatingExpense, Payment, Property, PropertyFinancials, PropertyUnit, Tenant
from api.pnl_service import compute_property_pnl, import_tag_for_year
from api.property_units_service import find_group_siblings, sync_units_for_property

YEAR = 2026
MONTH = 1
TAG = import_tag_for_year(YEAR)
SHEET = 'Ave_Q'
PROP_ID = 17

# Door order matches sibling Property records (Unit A → Door 1, etc.)
DOORS = [
    (1, Decimal('1800.00'), 'occupied'),
    (2, Decimal('1500.00'), 'occupied'),
    (3, Decimal('1200.00'), 'occupied'),
    (4, Decimal('1100.00'), 'occupied'),
]

GENERAL_EXPENSES = [
    ('Inspection', Decimal('100.00')),
    ('Appraisal', Decimal('100.00')),
]

UNIT_EXPENSES = [
    (4, 'Property Management Fees', Decimal('30.00')),
]

ADMIN_EXPENSES = [
    ('Mortgage Interest', Decimal('2556.26')),
    ('Depreciation (Non-cash)', Decimal('1424.24')),
]

FINANCIALS = {
    'purchase_price': Decimal('555000.00'),
    'down_payment': Decimal('145522.37'),
    'closing_cost': Decimal('25693.33'),
    'loan_amount': Decimal('416250.00'),
    'interest_rate': Decimal('0.07375'),
    'loan_term_years': 30,
    'monthly_mortgage_payment': Decimal('3685.79'),
    'land_value': Decimal('85000.00'),
    'annual_depreciation_years': Decimal('27.5'),
}


def note(label):
    return f'{TAG}|{SHEET}|{MONTH:02d}|{label[:80]}'


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
    month_date = date(YEAR, MONTH, 1)
    portfolio_tenant = get_portfolio_tenant(prop)
    siblings = find_group_siblings(prop)

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
            notes__startswith=f'{TAG}|{SHEET}|{MONTH:02d}|',
        ).delete()

        for i, (door_n, rent, status) in enumerate(DOORS):
            if i < len(siblings):
                sib = siblings[i]
                sib.price = rent
                sib.status = status
                sib.save(update_fields=['price', 'status'])

        PropertyFinancials.objects.update_or_create(property=prop, defaults=FINANCIALS)

        units = sync_units_for_property(prop)
        units_by_door = {
            door_n: units[door_n - 1]
            for door_n in range(1, len(units) + 1)
        }

        Payment.objects.create(
            tenant=portfolio_tenant,
            amount=Decimal('2900.00'),
            date=month_date,
            status='Paid',
            type='Rent',
            method='Excel Import',
            reference=f'{TAG}-{prop.id}-{YEAR}-{MONTH:02d}-rent',
        )

        for door_n, rent, _status in DOORS:
            unit = units_by_door[door_n]
            Payment.objects.create(
                tenant=get_door_tenant(prop, door_n, unit.label),
                amount=rent,
                date=month_date,
                status='Paid',
                type='Rent',
                method='Excel Import',
                reference=f'{TAG}-{prop.id}-{YEAR}-{MONTH:02d}-door-{door_n}-rent',
            )

        for label, amount in GENERAL_EXPENSES:
            OperatingExpense.objects.create(
                property=prop,
                amount=amount,
                category=map_category(label),
                visibility='operating',
                date=month_date,
                notes=note(label),
            )

        for door_n, label, amount in UNIT_EXPENSES:
            unit = next(
                (u for u in units if u.label.lower().replace(' ', '').endswith('unitd')
                 or 'eado studio' in u.label.lower()),
                units_by_door[door_n],
            )
            OperatingExpense.objects.create(
                property=prop,
                unit=unit,
                amount=amount,
                category=map_category(label),
                visibility='operating',
                date=month_date,
                notes=note(f'{label} — {unit.label}'),
            )

        for label, amount in ADMIN_EXPENSES:
            category = map_category(label)
            visibility = 'admin_only' if is_admin_expense(label, category) else 'operating'
            OperatingExpense.objects.create(
                property=prop,
                amount=amount,
                category=category,
                visibility=visibility,
                date=month_date,
                notes=note(label),
            )

        OperatingExpense.objects.create(
            property=prop,
            amount=Decimal('30.00'),
            category='other',
            visibility='operating',
            date=month_date,
            notes=note('__SUMMARY__'),
        )

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    row = result['by_property'][0]
    jan = result['monthly'][0]

    print('Avenue Q Jan 2026 inserted')
    print(f"  Jan cash flow:  income=${jan['income']:,.2f} expenses=${jan['expenses']:,.2f} net=${jan['net']:,.2f}")
    print('  Units:')
    for unit in row['units']:
        print(
            f"    {unit['label']}: rent=${unit['rent_income']:,.2f} "
            f"expenses=${unit['total_expenses']:,.2f} net=${unit['net_income']:,.2f}"
        )
    fin = row.get('financials') or {}
    print(f"  Purchase Price: ${fin.get('purchase_price', 0):,.2f}")
    print(f"  Land Value:     ${fin.get('land_value', 0):,.2f}")
    print(f"  NOI (Jan):      ${jan['net']:,.2f}")


if __name__ == '__main__':
    main()

"""Insert Avenue Q Nov 2026 P&L with per-door income and unit-level expenses."""
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
from api.models import OperatingExpense, Payment, Property, PropertyFinancials, Tenant
from api.pnl_service import compute_property_pnl, import_tag_for_year
from api.property_units_service import find_group_siblings, sync_units_for_property, unit_for_door_number

YEAR = 2026
MONTH = 11
TAG = import_tag_for_year(YEAR)
SHEET = 'Ave_Q'
PROP_ID = 17

DOORS = [
    (1, Decimal('1750.00'), 'occupied'),
    (2, Decimal('1138.11'), 'vacant'),
    (3, Decimal('1350.00'), 'occupied'),
    (4, Decimal('1100.00'), 'occupied'),
]

GENERAL_EXPENSES = [
    ('Inspection', Decimal('200.00')),
    ('Appraisal', Decimal('200.00')),
    ('HOA Fees', Decimal('100.00')),
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

EFFECTIVE_INCOME = Decimal('5338.11')
OPERATING_SUMMARY = Decimal('30.00')


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


def unit_for_door(units, door_n):
    unit = unit_for_door_number(units, door_n)
    if unit is None:
        raise ValueError(f'No unit for door {door_n}')
    return unit


def sibling_for_door(siblings, door_n):
    patterns = {
        1: ('unit a', 'ave q house'),
        2: ('unit b',),
        3: ('unit c',),
        4: ('unit d',),
    }[door_n]
    for sib in siblings:
        blob = f'{sib.name} {sib.address}'.lower()
        if any(p in blob for p in patterns):
            return sib
    return None


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

        for door_n, rent, status in DOORS:
            sib = sibling_for_door(siblings, door_n)
            if sib:
                sib.price = rent
                sib.status = status
                sib.save(update_fields=['price', 'status'])

        PropertyFinancials.objects.update_or_create(property=prop, defaults=FINANCIALS)

        units = sync_units_for_property(prop)

        Payment.objects.create(
            tenant=portfolio_tenant,
            amount=EFFECTIVE_INCOME,
            date=month_date,
            status='Paid',
            type='Rent',
            method='Excel Import',
            reference=f'{TAG}-{prop.id}-{YEAR}-{MONTH:02d}-rent',
        )

        for door_n, rent, _status in DOORS:
            unit = unit_for_door(units, door_n)
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
            unit = unit_for_door(units, door_n)
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
            amount=OPERATING_SUMMARY,
            category='other',
            visibility='operating',
            date=month_date,
            notes=note('__SUMMARY__'),
        )

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    nov = result['monthly'][10]

    print('Avenue Q Nov 2026 inserted')
    print(f"  Nov cash flow:  income=${nov['income']:,.2f} expenses=${nov['expenses']:,.2f} net=${nov['net']:,.2f}")
    print(f"  NOI (Nov):      ${nov['net']:,.2f}")


if __name__ == '__main__':
    main()

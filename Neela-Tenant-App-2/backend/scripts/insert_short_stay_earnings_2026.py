"""Short-stay property earnings Jan–Apr 2026 (per listing); May–Dec blank."""
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
SHEET = 'short-stay-earnings'

# Spreadsheet name → property id
PROPERTY_IDS = {
    'Little H House': 12,
    'The Hideaway': 11,
    'EaDo Escape': 5,
    'Cozy EaDo Studio': 4,
    'Sweet Home on Ave H': 13,
    'Cozy Suite on Wooding': 19,
}

# (month, listing, gross_earnings, adjustment or None, host_service_fees or None)
ROWS = [
    (3, 'Cozy EaDo Studio', Decimal('1495.80'), Decimal('100.00'), Decimal('44.87')),
    (4, 'Cozy EaDo Studio', Decimal('259.75'), None, Decimal('8.20')),
]

AFFECTED_PROP_IDS = sorted(set(PROPERTY_IDS.values()))


def note(month, listing, label):
    return f'{TAG}|{SHEET}|{month:02d}|{listing}|{label[:60]}'


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
    props = {p.id: p for p in Property.objects.filter(id__in=AFFECTED_PROP_IDS)}

    with transaction.atomic():
        for prop_id in AFFECTED_PROP_IDS:
            Payment.objects.filter(
                reference__startswith=f'{TAG}-{prop_id}-',
                date__year=YEAR,
            ).delete()
            OperatingExpense.objects.filter(
                property_id=prop_id,
                date__year=YEAR,
                notes__startswith=f'{TAG}|{SHEET}|',
            ).delete()

        for month, listing, gross, adjustment, host_fees in ROWS:
            prop_id = PROPERTY_IDS[listing]
            prop = props[prop_id]
            tenant = get_tenant(prop)
            month_date = date(YEAR, month, 1)
            slug = listing.lower().replace(' ', '-')

            Payment.objects.create(
                tenant=tenant,
                amount=gross,
                date=month_date,
                status='Paid',
                type='Rent',
                method='Excel Import',
                reference=f'{TAG}-{prop_id}-{YEAR}-{month:02d}-{slug}-gross',
            )
            if adjustment is not None:
                OperatingExpense.objects.create(
                    property=prop,
                    amount=adjustment,
                    category=map_category('Adjustments'),
                    visibility='operating',
                    date=month_date,
                    notes=note(month, listing, 'Adjustments'),
                )
            if host_fees is not None:
                OperatingExpense.objects.create(
                    property=prop,
                    amount=host_fees,
                    category=map_category('Host Service Fees'),
                    visibility='operating',
                    date=month_date,
                    notes=note(month, listing, 'Host Service Fees'),
                )

    print('Short-stay earnings Jan–Apr 2026 inserted')
    total_net = Decimal('0')
    for month in range(1, 5):
        month_net = Decimal('0')
        for listing in PROPERTY_IDS:
            prop_id = PROPERTY_IDS[listing]
            rows = [r for r in ROWS if r[0] == month and r[1] == listing]
            if not rows:
                continue
            _, _, gross, adj, fees = rows[0]
            net = gross - (adj or 0) - (fees or 0)
            month_net += net
        total_net += month_net
        print(f'  Month {month:02d} net paid sum: ${month_net:,.2f}')
    print(f'  Jan–Apr total net paid: ${total_net:,.2f}')


if __name__ == '__main__':
    main()

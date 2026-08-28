"""Insert/update Wooding property 2026 — Jan breakdown repeated Jan–Dec (all zero/blank)."""
import os
import sys
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neela_backend.settings')

import django

django.setup()

from django.db import transaction

from api.models import OperatingExpense, Payment, Property, PropertyFinancials
from api.pnl_service import compute_property_pnl, import_tag_for_year
from api.property_units_service import sync_units_for_property

YEAR = 2026
TAG = import_tag_for_year(YEAR)
SHEET = 'Wooding'
PROP_ID = 19

FINANCIALS = {
    'purchase_price': Decimal('216507.00'),
    'down_payment': Decimal('16507.00'),
    'loan_amount': Decimal('200000.00'),
    'interest_rate': Decimal('0.09'),
    'loan_term_years': 30,
    'monthly_mortgage_payment': Decimal('1609.25'),
}


def main():
    prop = Property.objects.get(id=PROP_ID)

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
        sync_units_for_property(prop)

    result = compute_property_pnl(year=YEAR, properties=[prop], admin_view=True)
    row = result['by_property'][0]
    print('Wooding 2026 inserted/updated (Jan template × 12 months, all zero/blank)')
    print(f"  Total Income:   ${row['total_income']:,.2f}")
    print(f"  Total Expenses: ${row['total_expenses']:,.2f}")
    print(f"  Net Income:     ${row['net_income']:,.2f}")
    fin = row.get('financials') or {}
    print(f"  Purchase Price: ${fin.get('purchase_price', 0):,.2f}")
    print(f"  Down Payment:   ${fin.get('down_payment', 0):,.2f}")
    print(f"  Loan Amount:    ${fin.get('loan_amount', 0):,.2f}")
    print(f"  Interest Rate:  {float(fin.get('interest_rate', 0)) * 100:.2f}%")
    print(f"  Mortgage P&I:   ${fin.get('monthly_mortgage_payment', 0):,.2f}")
    print('  Monthly:')
    for m in result['monthly']:
        print(
            f"    {m['month']:02d}: income=${m['income']:,.2f} "
            f"expenses=${m['expenses']:,.2f} net=${m['net']:,.2f}"
        )


if __name__ == '__main__':
    main()

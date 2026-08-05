"""
Clear old excel-import P&L numbers and load Master P&L from api.master_pnl_data.

Run (from backend/):
  python manage.py import_master_pnl
  python manage.py import_master_pnl --dry-run
  python manage.py import_master_pnl --year 2026
"""
from datetime import date
from decimal import Decimal, InvalidOperation

from django.core.management.base import BaseCommand
from django.db import transaction

from api.management.commands.import_income_statement import is_admin_expense, map_category
from api.master_pnl_data import MASTER_IMPORT_TAG_PREFIX, MASTER_PNL
from api.models import OperatingExpense, Payment, Property, PropertyFinancials, Tenant
from api.property_units_service import (
    get_property_group_key,
    sync_units_for_property,
    unit_for_door_number,
)
from api.pnl_service import import_tag_for_year


def D(val):
    if val is None or val == '':
        return None
    try:
        return Decimal(str(val))
    except (InvalidOperation, TypeError, ValueError):
        return None


def map_financing_category(label: str) -> str:
    l = (label or '').lower()
    if 'depreciation' in l:
        return 'depreciation'
    if 'principal' in l:
        return 'mortgage_principal'
    if 'interest' in l or 'mortgage' in l:
        return 'mortgage_interest'
    return map_category(label)


def find_property(entry):
    """Resolve the portfolio parent Property for a Master P&L building."""
    from api.property_units_service import PORTFOLIO_UNIT_CATALOG, is_portfolio_parent

    names = [n.lower() for n in entry.get('match_names') or []]
    group_key = entry['group_key']
    known_keys = set(PORTFOLIO_UNIT_CATALOG.keys()) | {g[0] for g in __import__('api.property_units_service', fromlist=['PROPERTY_GROUPS']).PROPERTY_GROUPS}

    candidates = [
        prop for prop in Property.objects.all()
        if get_property_group_key(prop) == group_key
    ]

    if not candidates:
        for prop in Property.objects.all():
            prop_key = get_property_group_key(prop)
            # Never assign a building that already belongs to another known portfolio key.
            if prop_key in known_keys and prop_key != group_key:
                continue
            blob = f'{prop.name} {prop.area} {prop.address}'.lower()
            if any(m in blob for m in names):
                candidates.append(prop)

    if not candidates:
        return None

    parents = [p for p in candidates if is_portfolio_parent(p, get_property_group_key(p))]
    pool = parents or candidates

    def score(p):
        n = (p.name or '').lower()
        area = (p.area or '').lower()
        s = 0
        if any(m == n or m == area for m in names):
            s += 100
        if any(m in n or m in area for m in names):
            s += 40
        if is_portfolio_parent(p, get_property_group_key(p)):
            s += 50
        if 'unit' in n or 'door' in n or 'hideaway' in n or 'cozy' in n or 'escape' in n:
            s -= 40
        return s

    pool.sort(key=score, reverse=True)
    return pool[0]


def get_import_tenant(prop):
    email = f'excel-import-{prop.id}@neela.local'
    tenant, _ = Tenant.objects.get_or_create(
        email=email,
        defaults={
            'name': f'Rent Roll — {prop.name}',
            'phone': '0000000000',
            'status': 'Active',
            'property_unit': prop.address or prop.name,
            'rent_amount': Decimal('0'),
            'deposit': Decimal('0'),
        },
    )
    return tenant


def clear_import_numbers():
    """Delete P&L numbers from prior excel imports (not app code / properties)."""
    pay_n, _ = Payment.objects.filter(reference__startswith=MASTER_IMPORT_TAG_PREFIX).delete()
    exp_n, _ = OperatingExpense.objects.filter(notes__startswith=MASTER_IMPORT_TAG_PREFIX).delete()
    return pay_n, exp_n


class Command(BaseCommand):
    help = 'Replace excel-import P&L numbers with Master P&L from P&L data folder'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true')
        parser.add_argument('--year', type=int, default=None, help='Only import this calendar year')
        parser.add_argument('--skip-clear', action='store_true', help='Do not delete existing import rows')

    def handle(self, *args, **options):
        dry = options['dry_run']
        only_year = options['year']
        skip_clear = options['skip_clear']

        entries = MASTER_PNL
        if only_year:
            entries = [e for e in entries if e['year'] == only_year]

        if not skip_clear:
            if dry:
                pay_c = Payment.objects.filter(reference__startswith=MASTER_IMPORT_TAG_PREFIX).count()
                exp_c = OperatingExpense.objects.filter(notes__startswith=MASTER_IMPORT_TAG_PREFIX).count()
                self.stdout.write(f'[dry-run] would clear {pay_c} payments, {exp_c} expenses')
            else:
                pay_n, exp_n = clear_import_numbers()
                self.stdout.write(self.style.WARNING(f'Cleared import payments={pay_n} expenses={exp_n}'))

        imported = 0
        missing = []

        for entry in entries:
            prop = find_property(entry)
            if not prop:
                missing.append(entry['group_key'])
                self.stdout.write(self.style.ERROR(f"Missing property for {entry['group_key']}"))
                continue

            year = entry['year']
            tag = import_tag_for_year(year)
            sheet = entry['sheet']
            self.stdout.write(f"{'[dry-run] ' if dry else ''}Import {entry['group_key']} -> {prop.name} (id={prop.id}) year={year}")

            if dry:
                imported += 1
                continue

            with transaction.atomic():
                # Financials
                fin = entry.get('financials') or {}
                fin_payload = {}
                for key, val in fin.items():
                    if key == 'loan_term_years' or key == 'annual_depreciation_years':
                        if val is None or val == '':
                            continue
                        fin_payload[key] = Decimal(str(val)) if key == 'annual_depreciation_years' else int(val)
                    elif key == 'escrow_notes':
                        fin_payload[key] = str(val)[:255]
                    else:
                        d = D(val)
                        if d is not None:
                            fin_payload[key] = d
                if fin_payload:
                    PropertyFinancials.objects.update_or_create(property=prop, defaults=fin_payload)

                units = sync_units_for_property(prop)
                tenant = get_import_tenant(prop)

                # Wipe this property/year import rows (in case --skip-clear)
                Payment.objects.filter(
                    reference__startswith=f'{tag}-{prop.id}-{year}-',
                ).delete()
                OperatingExpense.objects.filter(
                    notes__startswith=f'{tag}|{sheet}|',
                    date__year=year,
                    property=prop,
                ).delete()

                for month, mdata in sorted((entry.get('months') or {}).items()):
                    month = int(month)
                    month_date = date(year, month, 1)
                    income = D(mdata.get('income')) or Decimal('0')
                    opex = D(mdata.get('operating_expenses')) or Decimal('0')

                    # Portfolio rent payment (effective income)
                    if income != 0:
                        Payment.objects.create(
                            tenant=tenant,
                            amount=income,
                            date=month_date,
                            status='Paid',
                            type='Rent',
                            method='Excel Import',
                            reference=f'{tag}-{prop.id}-{year}-{month:02d}-rent',
                        )

                    # Per-door detail (unit breakdown only)
                    for ui in mdata.get('unit_income') or []:
                        amt = D(ui.get('amount')) or Decimal('0')
                        door = int(ui.get('door') or 0)
                        if amt == 0 or door < 1:
                            continue
                        unit = unit_for_door_number(units, door)
                        Payment.objects.create(
                            tenant=tenant,
                            amount=amt,
                            date=month_date,
                            status='Paid',
                            type='Rent',
                            method='Excel Import',
                            reference=f'{tag}-{prop.id}-{year}-{month:02d}-door-{door}-rent',
                        )
                        # Status on unit if provided
                        status = (ui.get('status') or '').lower()
                        if unit and status:
                            mapped = 'occupied' if status in ('o', 'occupied', 'abb') else (
                                'vacant' if status in ('v', 'vacant') else unit.status
                            )
                            if mapped != unit.status:
                                unit.status = mapped
                                unit.save(update_fields=['status'])

                    # Summary operating expense (drives NOI)
                    OperatingExpense.objects.create(
                        property=prop,
                        amount=opex,
                        category='other',
                        date=month_date,
                        notes=f'{tag}|{sheet}|{month:02d}|__SUMMARY__',
                        visibility='operating',
                    )

                    # Line items (category breakdown / unit costs)
                    for line in mdata.get('expense_lines') or []:
                        amt = D(line.get('amount')) or Decimal('0')
                        if amt == 0:
                            continue
                        label = line.get('label') or 'Other'
                        cat = map_category(label)
                        door = line.get('door')
                        unit = unit_for_door_number(units, int(door)) if door else None
                        OperatingExpense.objects.create(
                            property=prop,
                            unit=unit,
                            amount=amt,
                            category=cat,
                            date=month_date,
                            notes=f'{tag}|{sheet}|{month:02d}|{label[:80]}',
                            visibility='admin_only' if is_admin_expense(label, cat) else 'operating',
                        )

                    # Financing (below NOI)
                    for line in mdata.get('financing_lines') or []:
                        amt = D(line.get('amount')) or Decimal('0')
                        if amt == 0:
                            continue
                        label = line.get('label') or 'Financing'
                        cat = map_financing_category(label)
                        OperatingExpense.objects.create(
                            property=prop,
                            amount=amt,
                            category=cat,
                            date=month_date,
                            notes=f'{tag}|{sheet}|{month:02d}|{label[:80]}',
                            visibility='admin_only',
                        )

            imported += 1

        self.stdout.write(self.style.SUCCESS(
            f"Done. Imported {imported} properties."
            + (f" Missing: {', '.join(missing)}" if missing else '')
        ))

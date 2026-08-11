"""
Portfolio P&L calculations aligned with the Neela Capital Excel workbook.

Per property / month:
  Total Income          → paid rent (Excel import + live collections) + short-stay
  Total Operating Expenses → Excel monthly __SUMMARY__ + hand-entered operating costs
  Net Operating Income (NOI) → Total Income − Total Operating Expenses

Financing (mortgage, depreciation) sits below NOI and is excluded from operating totals.
Live rents and manager/admin expenses affect the income statement for most properties.

Bella Jess, Tomball, Conroe, and Avenue Q are sheet / PropertyMonthInput only — rent collections and
recorded operating expenses are excluded from their Income Statement totals (2026 corrected yearly seeds).
"""
import re
from collections import defaultdict
from decimal import Decimal

from django.db.models import Sum, Q
from django.db.models.functions import ExtractMonth

from .models import (
    Payment,
    Property,
    Tenant,
    OperatingExpense,
    ShortStayBooking,
    PropertyUnit,
    PropertyMonthInput,
)
from .property_units_service import (
    display_units_for_property,
    get_property_group_key,
    is_portfolio_parent,
    unit_for_door_number,
)
from .permissions import is_admin_user, exclude_import_placeholder_tenants

# Corrected Bella Jess 2026 TEI / OpEx / NOI (matches utils/bellaJessPnl2026.ts).
BELLA_JESS_2026_YEARLY = [
    (Decimal('2300'), Decimal('468.53'), Decimal('1831.47')),
    (Decimal('2300'), Decimal('411.23'), Decimal('1888.77')),
    (Decimal('2300'), Decimal('380.5'), Decimal('1919.5')),
    (Decimal('2300'), Decimal('748.06'), Decimal('1551.94')),
    (Decimal('0'), Decimal('7733.9'), Decimal('-7733.9')),
    (Decimal('0'), Decimal('2372'), Decimal('-2372')),
    (Decimal('0'), Decimal('1315.85'), Decimal('-1315.85')),
    (Decimal('0'), Decimal('1467.27'), Decimal('-1467.27')),
    (Decimal('0'), Decimal('1467.27'), Decimal('-1467.27')),
    (Decimal('0'), Decimal('1867.27'), Decimal('-1867.27')),
    (Decimal('0'), Decimal('1967.27'), Decimal('-1967.27')),
    (Decimal('0'), Decimal('1140.14'), Decimal('-1140.14')),
]

# Corrected Tomball 2026 TEI / OpEx / NOI (matches utils/tomballPnl2026.ts).
TOMBALL_2026_YEARLY = [
    (Decimal('0'), Decimal('229'), Decimal('-229')),
    (Decimal('0'), Decimal('229'), Decimal('-229')),
    (Decimal('0'), Decimal('229'), Decimal('-229')),
    (Decimal('0'), Decimal('229'), Decimal('-229')),
    (Decimal('0'), Decimal('7721.27'), Decimal('-7721.27')),
    (Decimal('0'), Decimal('2097.08'), Decimal('-2097.08')),
    (Decimal('0'), Decimal('1449.02'), Decimal('-1449.02')),
    (Decimal('0'), Decimal('1705.47'), Decimal('-1705.47')),
    (Decimal('0'), Decimal('1627.5'), Decimal('-1627.5')),
    (Decimal('0'), Decimal('1980.85'), Decimal('-1980.85')),
    (Decimal('0'), Decimal('2128.85'), Decimal('-2128.85')),
    (Decimal('0'), Decimal('1262.31'), Decimal('-1262.31')),
]

# Corrected Conroe 2026 TEI / OpEx / NOI (matches utils/conroePnl2026.ts).
CONROE_2026_YEARLY = [
    (Decimal('0'), Decimal('0'), Decimal('0')),
    (Decimal('0'), Decimal('0'), Decimal('0')),
    (Decimal('0'), Decimal('0'), Decimal('0')),
    (Decimal('0'), Decimal('0'), Decimal('0')),
    (Decimal('0'), Decimal('7721.27'), Decimal('-7721.27')),
    (Decimal('0'), Decimal('2097.08'), Decimal('-2097.08')),
    (Decimal('0'), Decimal('1449.02'), Decimal('-1449.02')),
    (Decimal('0'), Decimal('1705.47'), Decimal('-1705.47')),
    (Decimal('0'), Decimal('1627.5'), Decimal('-1627.5')),
    (Decimal('0'), Decimal('1980.85'), Decimal('-1980.85')),
    (Decimal('0'), Decimal('2128.85'), Decimal('-2128.85')),
    (Decimal('0'), Decimal('1262.31'), Decimal('-1262.31')),
]

# Corrected Avenue Q 2026 TEI / OpEx / NOI (matches utils/avenueQPnl2026.ts).
# Jan OpEx includes General Inspection+Appraisal omitted by sheet unit-only total.
AVENUE_Q_2026_YEARLY = [
    (Decimal('2900'), Decimal('1493.62'), Decimal('1406.38')),
    (Decimal('3550.03'), Decimal('685.87'), Decimal('2864.16')),
    (Decimal('0'), Decimal('0'), Decimal('0')),
    (Decimal('0'), Decimal('0'), Decimal('0')),
    (Decimal('5796.2'), Decimal('1380.6'), Decimal('4415.6')),
    (Decimal('5836'), Decimal('30'), Decimal('5806')),
    (Decimal('4870.51'), Decimal('30'), Decimal('4840.51')),
    (Decimal('4511.8'), Decimal('30'), Decimal('4481.8')),
    (Decimal('5394.89'), Decimal('30'), Decimal('5364.89')),
    (Decimal('4767.35'), Decimal('30'), Decimal('4737.35')),
    (Decimal('5338.11'), Decimal('30'), Decimal('5308.11')),
    (Decimal('4200'), Decimal('30'), Decimal('4170')),
]


def is_bella_jess_property(prop) -> bool:
    name = getattr(prop, 'name', None) or ''
    return bool(re.search(r'bella\s*jess', name, re.I))


def is_tomball_property(prop) -> bool:
    """Tomball sheet — exclude Bella Jess (address may contain Tomball)."""
    name = getattr(prop, 'name', None) or ''
    if re.search(r'bella\s*jess', name, re.I):
        return False
    return bool(re.search(r'tomball|tomabll', name, re.I))


def is_conroe_property(prop) -> bool:
    name = getattr(prop, 'name', None) or ''
    return bool(re.search(r'conroe', name, re.I))


def is_avenue_q_property(prop) -> bool:
    name = getattr(prop, 'name', None) or ''
    return bool(re.search(r'avenue\s*q|ave\.?\s*q|aveq', name, re.I))


def bella_jess_property_ids(properties) -> set:
    return {p.id for p in properties if is_bella_jess_property(p)}


def tomball_property_ids(properties) -> set:
    return {p.id for p in properties if is_tomball_property(p)}


def conroe_property_ids(properties) -> set:
    return {p.id for p in properties if is_conroe_property(p)}


def avenue_q_property_ids(properties) -> set:
    return {p.id for p in properties if is_avenue_q_property(p)}


def sheet_pnl_property_ids(properties) -> set:
    """Properties that use Excel sheet / month-input totals only."""
    return (
        bella_jess_property_ids(properties)
        | tomball_property_ids(properties)
        | conroe_property_ids(properties)
        | avenue_q_property_ids(properties)
    )


def _sheet_year_seed(
    prop_id: int,
    year: int,
    bella_ids: set,
    tomball_ids: set,
    conroe_ids: set,
    avenue_q_ids: set | None = None,
):
    avenue_q_ids = avenue_q_ids or set()
    if year != 2026:
        return None
    if prop_id in bella_ids:
        return BELLA_JESS_2026_YEARLY
    if prop_id in tomball_ids:
        return TOMBALL_2026_YEARLY
    if prop_id in conroe_ids:
        return CONROE_2026_YEARLY
    if prop_id in avenue_q_ids:
        return AVENUE_Q_2026_YEARLY
    return None


def sheet_month_rows(
    prop_id: int,
    year: int,
    bella_ids: set,
    tomball_ids: set,
    conroe_ids: set,
    avenue_q_ids: set | None = None,
):
    """Return list of 12 (income, expenses, noi) Decimals for a sheet property."""
    avenue_q_ids = avenue_q_ids or set()
    by_month = {}
    for row in PropertyMonthInput.objects.filter(property_id=prop_id, year=year).only(
        'month', 'computed', 'income_lines', 'opex_lines', 'financing_lines'
    ):
        computed = row.computed or {}
        if computed.get('total_effective_income') is not None or computed.get('totalEffectiveIncome') is not None:
            tei = Decimal(str(
                computed.get('total_effective_income', computed.get('totalEffectiveIncome', 0)) or 0
            ))
            opex = Decimal(str(computed.get('total_opex', computed.get('totalOpex', 0)) or 0))
            noi = Decimal(str(computed.get('noi', tei - opex) or 0))
            by_month[row.month] = (tei, opex, noi)

    seeds = _sheet_year_seed(prop_id, year, bella_ids, tomball_ids, conroe_ids, avenue_q_ids)
    rows = []
    for month in range(1, 13):
        if month in by_month:
            rows.append(by_month[month])
        elif seeds is not None:
            rows.append(seeds[month - 1])
        else:
            rows.append((Decimal('0'), Decimal('0'), Decimal('0')))
    return rows


def sheet_year_totals(
    prop_id: int,
    year: int,
    bella_ids: set,
    tomball_ids: set,
    conroe_ids: set,
    avenue_q_ids: set | None = None,
):
    rows = sheet_month_rows(prop_id, year, bella_ids, tomball_ids, conroe_ids, avenue_q_ids)
    income = sum((r[0] for r in rows), Decimal('0'))
    expenses = sum((r[1] for r in rows), Decimal('0'))
    net = sum((r[2] for r in rows), Decimal('0'))
    return income, expenses, net


# Back-compat aliases used elsewhere / tests.
def bella_jess_month_rows(prop_id: int, year: int):
    return sheet_month_rows(prop_id, year, {prop_id}, set(), set(), set())


def bella_jess_year_totals(prop_id: int, year: int):
    return sheet_year_totals(prop_id, year, {prop_id}, set(), set(), set())

IMPORT_TAG_PREFIX = 'excel-import-'
IMPORT_TAG = 'excel-import-2026'

# Excel: below-the-line / financing — excluded from NOI (Income − Operating Expenses).
FINANCING_CATEGORIES = frozenset({
    'mortgage_interest',
    'mortgage_principal',
    'depreciation',
})


def import_tag_for_year(year):
    return f'{IMPORT_TAG_PREFIX}{year}'


def is_excel_import_reference(reference, year):
    return (reference or '').startswith(f'{import_tag_for_year(year)}-')


def is_excel_import_note(notes, year):
    return (notes or '').startswith(import_tag_for_year(year))


def is_door_detail_payment(reference):
    """Per-door gross rent rows — unit breakdown only, not portfolio total."""
    return bool(re.search(r'-door-\d+-rent$', reference or ''))


def door_number_from_payment(reference):
    m = re.search(r'-door-(\d+)-rent$', reference or '')
    return int(m.group(1)) if m else None


def normalize(text):
    return re.sub(r'[^a-z0-9]+', '', (text or '').lower())


def parse_import_property_id(reference):
    """Parse property id from excel-import payment reference: excel-import-{year}-{prop_id}-..."""
    ref = reference or ''
    if not ref.startswith(IMPORT_TAG_PREFIX):
        return None
    parts = ref.split('-')
    if len(parts) >= 4:
        try:
            return int(parts[3])
        except (TypeError, ValueError):
            return None
    return None


def parse_import_tenant_property_id(email):
    """Synthetic rent-roll tenants: excel-import-{prop_id}@neela.local"""
    if not email:
        return None
    e = email.lower().strip()
    m = re.match(r'^excel-import-(\d+)@neela\.local$', e)
    if m:
        return int(m.group(1))
    return None


def build_tenant_property_map(tenants, property_ids_set, property_aliases):
    """
    Map tenant_id → property_id using property_unit text, import emails, or payment refs.
    """
    tenant_prop_map = {}

    for t in tenants:
        # Direct link from import rent-roll tenant
        pid = parse_import_tenant_property_id(t.email)
        if pid and pid in property_ids_set:
            tenant_prop_map[t.id] = pid
            continue

        token = normalize(t.property_unit)
        if not token:
            continue
        for prop_id, aliases in property_aliases:
            if prop_id not in property_ids_set:
                continue
            if any(alias and alias in token for alias in aliases):
                tenant_prop_map[t.id] = prop_id
                break

    return tenant_prop_map


def _rollup_property_id(prop_id, property_ids_set, props_by_id):
    """
    Map a unit-level property id onto the portfolio parent id used in the income statement.
    Live rent/expenses on door listings must roll into the building row.
    """
    if prop_id in property_ids_set:
        return prop_id
    prop = props_by_id.get(prop_id)
    if not prop:
        return None
    group_key = get_property_group_key(prop)
    parent = None
    fallback = None
    for pid in property_ids_set:
        candidate = props_by_id.get(pid)
        if not candidate:
            continue
        if get_property_group_key(candidate) != group_key:
            continue
        if is_portfolio_parent(candidate, group_key):
            parent = pid
            break
        if fallback is None:
            fallback = pid
    return parent if parent is not None else fallback


def build_full_tenant_property_map(year_properties):
    """
    Match tenants to any portfolio property, then roll unit listings up to IS parents.
    """
    year_ids = {p.id for p in year_properties}
    all_props = list(Property.objects.only('id', 'name', 'area', 'address', 'city', 'state', 'units'))
    props_by_id = {p.id: p for p in all_props}
    aliases = []
    for p in all_props:
        parts = [normalize(p.name), normalize(p.address)]
        if p.area:
            parts.append(normalize(p.area))
        aliases.append((p.id, [a for a in parts if a]))

    all_ids = {p.id for p in all_props}
    tenants_qs = exclude_import_placeholder_tenants(
        Tenant.objects.only('id', 'property_unit', 'email')
    )
    raw_map = build_tenant_property_map(list(tenants_qs), all_ids, aliases)

    rolled = {}
    for tenant_id, prop_id in raw_map.items():
        parent_id = _rollup_property_id(prop_id, year_ids, props_by_id)
        if parent_id is not None:
            rolled[tenant_id] = parent_id
    return rolled, props_by_id


def _is_financing_expense(exp):
    """Mortgage / depreciation sit below NOI in the Excel workbook."""
    if (exp.category or '') in FINANCING_CATEGORIES:
        return True
    notes = (exp.notes or '').lower()
    return 'mortgage interest' in notes or 'depreciation' in notes or 'principal repayment' in notes


def _aggregate_expenses(expenses_qs, *, admin_view, year, rollup_property_id=None):
    """
    Excel imports store monthly __SUMMARY__ rows matching workbook totals.
    Line-item rows feed category breakdown only when a summary row exists.
    Hand-entered expenses always count toward NOI.
    NOI uses operating expenses only — financing (mortgage, depreciation) excluded.
    """
    expenses = list(expenses_qs)
    if not admin_view:
        expenses = [e for e in expenses if e.visibility != 'admin_only']

    summary_keys = {
        (e.property_id, e.date.month)
        for e in expenses
        if is_excel_import_note(e.notes, year) and '__SUMMARY__' in (e.notes or '')
    }
    properties_with_excel_summary = {pid for pid, _ in summary_keys}

    expenses_by_property = defaultdict(lambda: Decimal('0'))
    expenses_by_category = defaultdict(lambda: Decimal('0'))
    expenses_by_unit = defaultdict(lambda: Decimal('0'))

    for exp in expenses:
        amount = exp.amount or Decimal('0')
        notes = exp.notes or ''
        is_excel = is_excel_import_note(notes, year)
        is_summary = is_excel and '__SUMMARY__' in notes
        is_financing = _is_financing_expense(exp)
        prop_id = exp.property_id
        if rollup_property_id and prop_id:
            prop_id = rollup_property_id(prop_id) or prop_id

        if not is_summary:
            expenses_by_category[exp.category] += amount

        # Financing never rolls into NOI operating totals.
        if is_financing:
            continue

        # Excel line items are already inside __SUMMARY__ — don't double-count property totals.
        # Hand-entered rows always add.
        if is_excel and not is_summary and exp.property_id in properties_with_excel_summary:
            if exp.unit_id:
                expenses_by_unit[exp.unit_id] += amount
            continue

        if exp.unit_id:
            expenses_by_unit[exp.unit_id] += amount
        if prop_id:
            expenses_by_property[prop_id] += amount
        else:
            expenses_by_property['portfolio'] += amount

    return expenses_by_property, expenses_by_category, expenses_by_unit


def _monthly_expense_map(expenses_qs, *, admin_view, property_ids_set, year, rollup_property_id=None):
    expenses = list(expenses_qs)
    if not admin_view:
        expenses = [e for e in expenses if e.visibility != 'admin_only']

    summary_keys = {
        (e.property_id, e.date.month)
        for e in expenses
        if is_excel_import_note(e.notes, year) and '__SUMMARY__' in (e.notes or '')
    }
    properties_with_excel_summary = {pid for pid, _ in summary_keys}

    month_map = defaultdict(lambda: Decimal('0'))
    for exp in expenses:
        notes = exp.notes or ''
        is_excel = is_excel_import_note(notes, year)
        is_summary = is_excel and '__SUMMARY__' in notes
        if _is_financing_expense(exp):
            continue
        prop_id = exp.property_id
        if rollup_property_id and prop_id:
            prop_id = rollup_property_id(prop_id) or prop_id
        if prop_id is None:
            # Portfolio-level expense (no property)
            pass
        elif prop_id not in property_ids_set:
            continue
        if is_excel and not is_summary and exp.property_id in properties_with_excel_summary:
            continue
        month_map[exp.date.month] += exp.amount or Decimal('0')
    return month_map


def portfolio_parent_property_ids(properties=None):
    """Portfolio roll-up properties (one per building / Excel sheet)."""
    ids = set()
    props = properties
    if props is None:
        # Include city/state — get_property_group_key reads them (deferred loads were ~1s each on Neon).
        props = Property.objects.only('id', 'name', 'area', 'address', 'city', 'state', 'units')
    for prop in props:
        group_key = get_property_group_key(prop)
        if is_portfolio_parent(prop, group_key):
            ids.add(prop.id)
    return ids


def excel_portfolio_property_ids(year):
    """Property IDs with Excel workbook P&L import for this year."""
    ids = set()
    for ref in Payment.objects.filter(
        reference__startswith=f'{import_tag_for_year(year)}-',
        date__year=year,
    ).values_list('reference', flat=True):
        pid = parse_import_property_id(ref)
        if pid:
            ids.add(pid)
    return ids


def compute_property_pnl(
    *,
    year,
    properties,
    admin_view,
    request=None,
    summary_only=False,
):
    """
    Build income-statement payload matching Excel P&L structure.
    Returns dict suitable for JSON Response (snake_case keys).
    """
    property_ids = [p.id for p in properties]
    property_ids_set = set(property_ids)
    bella_ids = bella_jess_property_ids(properties)
    tomball_ids = tomball_property_ids(properties)
    conroe_ids = conroe_property_ids(properties)
    avenue_q_ids = avenue_q_property_ids(properties)
    sheet_ids = bella_ids | tomball_ids | conroe_ids | avenue_q_ids

    tenant_prop_map, props_by_id = build_full_tenant_property_map(properties)

    def rolls_to_sheet(pid):
        """True when this property (or its rollup parent) is a sheet P&L property."""
        if not pid or not sheet_ids:
            return False
        if pid in sheet_ids:
            return True
        rolled = _rollup_property_id(pid, property_ids_set, props_by_id)
        return (rolled or pid) in sheet_ids

    unit_rows_by_property = defaultdict(list)
    if not summary_only:
        # Read-only unit display for P&L — never sync/write on GET (that was ~minutes slow).
        existing_units = PropertyUnit.objects.filter(property_id__in=property_ids).order_by(
            'sort_order', 'id'
        )
        for unit in existing_units:
            unit_rows_by_property[unit.property_id].append(unit)

        for prop in properties:
            rows = unit_rows_by_property.get(prop.id, [])
            unit_rows_by_property[prop.id] = display_units_for_property(prop, rows)

    rent_income_by_property = defaultdict(lambda: Decimal('0'))
    rent_income_by_unit = defaultdict(lambda: Decimal('0'))
    month_rent = defaultdict(lambda: Decimal('0'))
    rent_by_prop_month = defaultdict(lambda: defaultdict(lambda: Decimal('0')))

    payments_qs = Payment.objects.filter(
        status='Paid',
        date__year=year,
        type='Rent',
    ).select_related('tenant').only(
        'id', 'amount', 'date', 'tenant_id', 'tenant__property_unit', 'tenant__email', 'reference',
    )

    for pay in payments_qs:
        prop_id = tenant_prop_map.get(pay.tenant_id) or parse_import_property_id(pay.reference)
        if prop_id not in property_ids_set:
            continue
        # Sheet properties: month-input only — ignore rent collections.
        if rolls_to_sheet(prop_id):
            continue
        # Count every paid rent (Excel import rows + live collections). Door-detail
        # excel rows still only feed unit breakdown so workbook totals are not doubled.
        amount = pay.amount or Decimal('0')
        detail_only = is_door_detail_payment(pay.reference)
        if not detail_only:
            rent_income_by_property[prop_id] += amount
            if not summary_only:
                month = pay.date.month
                month_rent[month] += amount
                rent_by_prop_month[prop_id][month] += amount
        if not summary_only:
            door_n = door_number_from_payment(pay.reference)
            matched = False
            if door_n is not None:
                unit = unit_for_door_number(unit_rows_by_property.get(prop_id, []), door_n)
                if unit:
                    rent_income_by_unit[unit.id] += amount
                    matched = True
            if not matched:
                unit_token = normalize(pay.tenant.property_unit if pay.tenant else '')
                for unit in unit_rows_by_property.get(prop_id, []):
                    if normalize(unit.label) in unit_token or unit_token in normalize(unit.label):
                        rent_income_by_unit[unit.id] += amount
                        break

    short_stay_by_property = defaultdict(lambda: Decimal('0'))
    month_short = defaultdict(lambda: Decimal('0'))
    short_by_prop_month = defaultdict(lambda: defaultdict(lambda: Decimal('0')))
    for row in ShortStayBooking.objects.filter(
        status='confirmed',
        check_in__year=year,
        property_id__in=property_ids,
    ).annotate(month=ExtractMonth('check_in')).values('property_id', 'month').annotate(total=Sum('total_amount')):
        pid = row['property_id']
        if rolls_to_sheet(pid):
            continue
        total = row['total'] or Decimal('0')
        short_stay_by_property[pid] += total
        if not summary_only:
            month = int(row['month'])
            month_short[month] += total
            short_by_prop_month[pid][month] += total

    expenses_by_property = defaultdict(lambda: Decimal('0'))
    expenses_by_category = defaultdict(lambda: Decimal('0'))
    expenses_by_unit = defaultdict(lambda: Decimal('0'))

    # Include expenses posted on unit-level listings, then roll them up to parents.
    sibling_ids = set(property_ids_set)
    for p in props_by_id.values():
        rolled = _rollup_property_id(p.id, property_ids_set, props_by_id)
        if rolled is not None:
            sibling_ids.add(p.id)

    expenses_list = list(
        OperatingExpense.objects.filter(
            date__year=year,
        ).filter(
            Q(property_id__in=sibling_ids) | Q(property_id__isnull=True)
        ).only(
            'id', 'amount', 'category', 'property_id', 'unit_id', 'visibility', 'notes', 'date'
        )
    )
    # Sheet properties: ignore recorded / imported operating expenses.
    expenses_list = [
        e for e in expenses_list
        if not rolls_to_sheet(e.property_id)
    ]

    rollup = lambda pid: _rollup_property_id(pid, property_ids_set, props_by_id) if pid else None
    expenses_by_property, expenses_by_category, expenses_by_unit = _aggregate_expenses(
        expenses_list,
        admin_view=admin_view,
        year=year,
        rollup_property_id=rollup,
    )

    month_exp = defaultdict(lambda: Decimal('0'))
    opex_by_prop_month = defaultdict(lambda: defaultdict(lambda: Decimal('0')))
    if not summary_only:
        exp_rows = expenses_list
        if not admin_view:
            exp_rows = [e for e in exp_rows if e.visibility != 'admin_only']
        summary_keys = {
            (e.property_id, e.date.month)
            for e in exp_rows
            if is_excel_import_note(e.notes, year) and '__SUMMARY__' in (e.notes or '')
        }
        props_with_summary = {pid for pid, _ in summary_keys}
        for exp in exp_rows:
            if _is_financing_expense(exp):
                continue
            notes = exp.notes or ''
            is_excel = is_excel_import_note(notes, year)
            is_summary = is_excel and '__SUMMARY__' in notes
            if is_excel and not is_summary and exp.property_id in props_with_summary:
                continue
            prop_id = rollup(exp.property_id) if exp.property_id else None
            if prop_id and prop_id not in property_ids_set:
                continue
            amount = exp.amount or Decimal('0')
            month = exp.date.month
            if prop_id:
                opex_by_prop_month[prop_id][month] += amount
                month_exp[month] += amount
            else:
                month_exp[month] += amount

    if summary_only:
        # When sheet properties are in scope, portfolio totals are sheet-only (Bella + Tomball).
        total_rent = Decimal('0')
        total_short = Decimal('0')
        total_expenses = Decimal('0')
        if sheet_ids:
            for p in properties:
                if p.id in sheet_ids:
                    inc, exp, _net = sheet_year_totals(
                        p.id, year, bella_ids, tomball_ids, conroe_ids, avenue_q_ids
                    )
                    total_rent += inc
                    total_expenses += exp
        else:
            for p in properties:
                total_rent += rent_income_by_property.get(p.id, Decimal('0'))
                total_short += short_stay_by_property.get(p.id, Decimal('0'))
                total_expenses += expenses_by_property.get(p.id, Decimal('0'))
            total_expenses += expenses_by_property['portfolio']
        portfolio_income = total_rent + total_short
        return {
            'year': year,
            'is_admin_view': admin_view,
            'portfolio': {
                'rent_income': float(total_rent),
                'short_stay_income': float(total_short),
                'total_income': float(portfolio_income),
                'total_expenses': float(total_expenses),
                'net_income': float(portfolio_income - total_expenses),
            },
            'by_property': [],
            'by_unit': [],
            'expenses_by_category': {k: float(v) for k, v in expenses_by_category.items()} if not sheet_ids else {},
            'monthly': [],
        }

    property_rows = []
    unit_detail_rows = []
    total_rent = Decimal('0')
    total_short = Decimal('0')
    total_expenses = Decimal('0')

    for p in properties:
        if p.id in sheet_ids:
            income, expenses, net = sheet_year_totals(
                p.id, year, bella_ids, tomball_ids, conroe_ids, avenue_q_ids
            )
            rent = income
            short = Decimal('0')
        elif sheet_ids:
            # Sheet mode: other properties do not contribute to P&L totals.
            rent = Decimal('0')
            short = Decimal('0')
            expenses = Decimal('0')
            income = Decimal('0')
            net = Decimal('0')
        else:
            rent = rent_income_by_property[p.id]
            short = short_stay_by_property[p.id]
            expenses = expenses_by_property[p.id]
            income = rent + short
            # Excel: NOI = Total Income − Total Operating Expenses
            net = income - expenses
        total_rent += rent
        total_short += short
        total_expenses += expenses

        image_url = None
        if p.image and request:
            image_url = request.build_absolute_uri(p.image.url)
        elif p.image_url:
            image_url = p.image_url

        financials_data = None
        if admin_view:
            fin = getattr(p, 'financials', None)
            if fin:
                financials_data = {
                    'purchase_price': float(fin.purchase_price or 0),
                    'down_payment': float(fin.down_payment or 0),
                    'closing_cost': float(fin.closing_cost or 0),
                    'loan_amount': float(fin.loan_amount or 0),
                    'interest_rate': float(fin.interest_rate or 0),
                    'loan_term_years': fin.loan_term_years,
                    'monthly_mortgage_payment': float(fin.monthly_mortgage_payment or 0),
                    'land_value': float(fin.land_value or 0),
                    'annual_depreciation_years': float(fin.annual_depreciation_years or 27.5),
                    'escrow_notes': fin.escrow_notes or '',
                }

        units = []
        for unit in unit_rows_by_property.get(p.id, []):
            if sheet_ids:
                # Sheet-only P&L mode: no rent/expense attribution on units.
                unit_income = Decimal('0')
                unit_expenses = Decimal('0')
            else:
                unit_income = rent_income_by_unit[unit.id]
                unit_expenses = expenses_by_unit[unit.id]
            unit_detail = {
                'unit_id': unit.id,
                'property_id': p.id,
                'label': unit.label,
                'monthly_rent': float(unit.monthly_rent or 0),
                'status': unit.status,
                'rent_income': float(unit_income),
                'total_expenses': float(unit_expenses),
                'net_income': float(unit_income - unit_expenses),
            }
            units.append(unit_detail)
            unit_detail_rows.append(unit_detail)

        property_rows.append({
            'property_id': p.id,
            'property_name': p.name,
            'address': p.address,
            'city': p.city,
            'state': p.state,
            'units_count': p.units,
            'image_url': image_url,
            'rent_income': float(rent),
            'short_stay_income': float(short),
            'total_income': float(income),
            'total_expenses': float(expenses),
            'net_income': float(net),
            'units': units,
            'financials': financials_data,
        })

    # When sheet properties are in scope, portfolio ignores unassigned / other-property opex.
    portfolio_expenses = total_expenses if sheet_ids else (total_expenses + expenses_by_property['portfolio'])
    portfolio_income = total_rent + total_short
    portfolio_net = portfolio_income - portfolio_expenses

    sheet_month_cache = {
        sid: sheet_month_rows(sid, year, bella_ids, tomball_ids, conroe_ids, avenue_q_ids)
        for sid in sheet_ids
    }

    monthly = []
    for month in range(1, 13):
        if sheet_ids:
            income = Decimal('0')
            expenses_m = Decimal('0')
            for sid in sheet_ids:
                bi, be, _bn = sheet_month_cache[sid][month - 1]
                income += bi
                expenses_m += be
        else:
            income = month_rent[month] + month_short[month]
            expenses_m = month_exp[month]
        monthly.append({
            'month': month,
            'income': float(income),
            'expenses': float(expenses_m),
            'net': float(income - expenses_m),
        })

    for row in property_rows:
        pid = row['property_id']
        rows = []
        if pid in sheet_ids:
            month_rows = sheet_month_cache[pid]
            for month in range(1, 13):
                income_m, exp_m, net_m = month_rows[month - 1]
                rows.append({
                    'month': month,
                    'income': float(income_m),
                    'expenses': float(exp_m),
                    'net': float(net_m),
                })
        elif sheet_ids:
            for month in range(1, 13):
                rows.append({'month': month, 'income': 0.0, 'expenses': 0.0, 'net': 0.0})
        else:
            for month in range(1, 13):
                income = rent_by_prop_month[pid][month] + short_by_prop_month[pid][month]
                exp = opex_by_prop_month[pid][month]
                rows.append({
                    'month': month,
                    'income': float(income),
                    'expenses': float(exp),
                    'net': float(income - exp),
                })
        row['monthly'] = rows

    return {
        'year': year,
        'is_admin_view': admin_view,
        'portfolio': {
            'rent_income': float(total_rent),
            'short_stay_income': float(total_short),
            'total_income': float(portfolio_income),
            'total_expenses': float(portfolio_expenses),
            'net_income': float(portfolio_net),
        },
        'by_property': property_rows,
        'by_unit': unit_detail_rows,
        'expenses_by_category': (
            {} if sheet_ids else {k: float(v) for k, v in expenses_by_category.items()}
        ),
        'monthly': monthly,
    }


def _monthly_maps(*, year, property_ids, admin_view, tenant_prop_map, props_by_id):
    """Portfolio + per-property monthly maps in one payment pass and one expense pass."""
    property_ids_set = set(property_ids)

    month_rent = defaultdict(lambda: Decimal('0'))
    rent_by_prop = defaultdict(lambda: defaultdict(lambda: Decimal('0')))
    for pay in Payment.objects.filter(
        status='Paid', type='Rent', date__year=year,
    ).only('amount', 'date', 'tenant_id', 'reference'):
        prop_id = tenant_prop_map.get(pay.tenant_id) or parse_import_property_id(pay.reference)
        if prop_id not in property_ids_set:
            continue
        if is_door_detail_payment(pay.reference):
            continue
        amount = pay.amount or Decimal('0')
        month = pay.date.month
        month_rent[month] += amount
        rent_by_prop[prop_id][month] += amount

    month_short = defaultdict(lambda: Decimal('0'))
    short_by_prop = defaultdict(lambda: defaultdict(lambda: Decimal('0')))
    for row in ShortStayBooking.objects.filter(
        status='confirmed',
        check_in__year=year,
        property_id__in=property_ids,
    ).annotate(month=ExtractMonth('check_in')).values('property_id', 'month').annotate(total=Sum('total_amount')):
        pid = row['property_id']
        month = int(row['month'])
        total = row['total'] or Decimal('0')
        month_short[month] += total
        short_by_prop[pid][month] += total

    expenses = list(OperatingExpense.objects.filter(date__year=year).only(
        'amount', 'date', 'property_id', 'visibility', 'notes', 'category',
    ))
    if not admin_view:
        expenses = [e for e in expenses if e.visibility != 'admin_only']

    summary_keys = {
        (e.property_id, e.date.month)
        for e in expenses
        if is_excel_import_note(e.notes, year) and '__SUMMARY__' in (e.notes or '')
    }
    props_with_summary = {pid for pid, _ in summary_keys}

    month_exp = defaultdict(lambda: Decimal('0'))
    opex_by_prop = defaultdict(lambda: defaultdict(lambda: Decimal('0')))
    for exp in expenses:
        if _is_financing_expense(exp):
            continue
        notes = exp.notes or ''
        is_excel = is_excel_import_note(notes, year)
        is_summary = is_excel and '__SUMMARY__' in notes
        if is_excel and not is_summary and exp.property_id in props_with_summary:
            continue
        prop_id = exp.property_id
        if prop_id:
            prop_id = _rollup_property_id(prop_id, property_ids_set, props_by_id) or prop_id
        if prop_id and prop_id not in property_ids_set:
            continue
        amount = exp.amount or Decimal('0')
        month = exp.date.month
        if prop_id:
            opex_by_prop[prop_id][month] += amount
            month_exp[month] += amount
        else:
            month_exp[month] += amount

    monthly = []
    for month in range(1, 13):
        income = month_rent[month] + month_short[month]
        expenses_m = month_exp[month]
        monthly.append({
            'month': month,
            'income': float(income),
            'expenses': float(expenses_m),
            'net': float(income - expenses_m),
        })

    by_property = {}
    for pid in property_ids:
        rows = []
        for month in range(1, 13):
            income = rent_by_prop[pid][month] + short_by_prop[pid][month]
            exp = opex_by_prop[pid][month]
            rows.append({
                'month': month,
                'income': float(income),
                'expenses': float(exp),
                'net': float(income - exp),
            })
        by_property[pid] = rows

    return monthly, by_property


def _monthly_cash_flow(*, year, property_ids, admin_view, tenant_prop_map):
    """Backward-compatible wrapper."""
    all_props = list(Property.objects.only('id', 'name', 'area', 'address', 'city', 'state', 'units'))
    props_by_id = {p.id: p for p in all_props}
    monthly, _ = _monthly_maps(
        year=year,
        property_ids=property_ids,
        admin_view=admin_view,
        tenant_prop_map=tenant_prop_map,
        props_by_id=props_by_id,
    )
    return monthly


def _monthly_by_property(*, year, property_ids, admin_view, tenant_prop_map):
    """Backward-compatible wrapper."""
    all_props = list(Property.objects.only('id', 'name', 'area', 'address', 'city', 'state', 'units'))
    props_by_id = {p.id: p for p in all_props}
    _, by_property = _monthly_maps(
        year=year,
        property_ids=property_ids,
        admin_view=admin_view,
        tenant_prop_map=tenant_prop_map,
        props_by_id=props_by_id,
    )
    return by_property

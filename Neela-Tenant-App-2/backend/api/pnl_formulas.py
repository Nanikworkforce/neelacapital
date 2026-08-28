"""
Bella Jess monthly P&L formulas — backend source of truth.

Mirrors utils/bellaJessPnl2026.ts locked decisions:
  TEI = Gross + Other − Vacancy
  Total OpEx = sum of opex lines
  NOI = TEI − OpEx
  Cash Flow Before Tax = NOI − Mortgage Interest
  Annual Dep = (Purchase − Land) ÷ years
  Monthly Dep = Annual ÷ 12
  Net Profit = Cash Flow − Monthly Dep
  Cap Rate = (NOI × 12) / Purchase × 100
  Cash-on-Cash = (Cash Flow × 12) / (Down + Closing) × 100
"""
from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP

BELLA_JESS_OVERVIEW_DEFAULTS = {
    'purchase_price': Decimal('255000'),
    'down_payment': Decimal('52234.95'),
    'closing_cost': Decimal('16897.62'),
    'land_value': Decimal('49500'),
    'depreciation_years': Decimal('27.5'),
    'loan_amount': Decimal('204000'),
    'interest_rate': Decimal('0.0725'),
    'monthly_mortgage_payment': Decimal('2029.14'),
}


def _d(value, default='0') -> Decimal:
    try:
        if value is None or value == '':
            return Decimal(default)
        return Decimal(str(value))
    except Exception:
        return Decimal(default)


def _money(value: Decimal) -> Decimal:
    return value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def _line_amount(lines, key: str) -> Decimal:
    for line in lines or []:
        if not isinstance(line, dict):
            continue
        if (line.get('key') or '') == key:
            return _d(line.get('amount'))
    return Decimal('0')


def _sum_amounts(lines) -> Decimal:
    total = Decimal('0')
    for line in lines or []:
        if isinstance(line, dict):
            total += _d(line.get('amount'))
    return total


def overview_from_financials(fin) -> dict:
    """Build overview numbers from PropertyFinancials or Bella Jess defaults."""
    if not fin:
        return dict(BELLA_JESS_OVERVIEW_DEFAULTS)
    return {
        'purchase_price': _d(fin.purchase_price, str(BELLA_JESS_OVERVIEW_DEFAULTS['purchase_price'])),
        'down_payment': _d(fin.down_payment, str(BELLA_JESS_OVERVIEW_DEFAULTS['down_payment'])),
        'closing_cost': _d(fin.closing_cost, str(BELLA_JESS_OVERVIEW_DEFAULTS['closing_cost'])),
        'land_value': _d(fin.land_value, str(BELLA_JESS_OVERVIEW_DEFAULTS['land_value'])),
        'depreciation_years': _d(
            fin.annual_depreciation_years,
            str(BELLA_JESS_OVERVIEW_DEFAULTS['depreciation_years']),
        ),
        'loan_amount': _d(fin.loan_amount, str(BELLA_JESS_OVERVIEW_DEFAULTS['loan_amount'])),
        'interest_rate': _d(fin.interest_rate, str(BELLA_JESS_OVERVIEW_DEFAULTS['interest_rate'])),
        'monthly_mortgage_payment': _d(
            fin.monthly_mortgage_payment,
            str(BELLA_JESS_OVERVIEW_DEFAULTS['monthly_mortgage_payment']),
        ),
    }


def calculated_financing_from_loan(overview: dict) -> dict:
    loan = overview['loan_amount']
    rate = overview['interest_rate']
    pi = overview['monthly_mortgage_payment']
    monthly_rate = (rate / Decimal('100') / Decimal('12')) if rate > 1 else (rate / Decimal('12'))
    interest = _money(loan * monthly_rate)
    principal = _money(pi - interest)
    if principal < 0:
        principal = Decimal('0')
    return {
        'mortgage_interest': interest,
        'principal_repayment': principal,
    }


def annual_depreciation(overview: dict) -> Decimal:
    years = overview['depreciation_years']
    if years <= 0:
        return Decimal('0')
    base = overview['purchase_price'] - overview['land_value']
    if base < 0:
        base = Decimal('0')
    return base / years


def total_effective_income(income_lines) -> Decimal:
    gross = _line_amount(income_lines, 'gross_rent')
    other = _line_amount(income_lines, 'other_income')
    vacancy = _line_amount(income_lines, 'vacancy')
    # Unknown income keys (except vacancy/other) add to gross side.
    for line in income_lines or []:
        if not isinstance(line, dict):
            continue
        key = line.get('key') or ''
        if key in ('gross_rent', 'other_income', 'vacancy'):
            continue
        gross += _d(line.get('amount'))
    return gross + other - vacancy


def compute_month_summary(
    income_lines,
    opex_lines,
    financing_lines,
    overview: dict | None = None,
    *,
    include_performance: bool = True,
) -> dict:
    ov = overview or dict(BELLA_JESS_OVERVIEW_DEFAULTS)
    tei = total_effective_income(income_lines)
    opex = _sum_amounts(opex_lines)
    interest = _line_amount(financing_lines, 'mortgage_interest')
    principal = _line_amount(financing_lines, 'principal_repayment')
    noi = tei - opex
    cash_flow = noi - interest
    annual_dep = annual_depreciation(ov)
    monthly_dep = annual_dep / Decimal('12')
    net_profit = cash_flow - monthly_dep
    cash_invested = ov['down_payment'] + ov['closing_cost']
    purchase = ov['purchase_price']

    cap_rate = None
    cash_on_cash = None
    if include_performance:
        if purchase > 0:
            cap_rate = float(_money((noi * 12) / purchase * 100))
        if cash_invested > 0:
            cash_on_cash = float(_money((cash_flow * 12) / cash_invested * 100))

    return {
        'total_effective_income': float(_money(tei)),
        'total_opex': float(_money(opex)),
        'mortgage_interest': float(_money(interest)),
        'principal_repayment': float(_money(principal)),
        'noi': float(_money(noi)),
        'cash_flow_before_tax': float(_money(cash_flow)),
        'annual_depreciation': float(_money(annual_dep)),
        'depreciation': float(_money(monthly_dep)),
        'net_profit': float(_money(net_profit)),
        'cash_invested': float(_money(cash_invested)),
        'cap_rate_pct': cap_rate,
        'cash_on_cash_pct': cash_on_cash,
    }


def compute_for_month_input(obj, *, include_performance: bool = True) -> dict:
    """Compute summary for a PropertyMonthInput row using its property financials."""
    fin = getattr(getattr(obj, 'property', None), 'financials', None)
    overview = overview_from_financials(fin)
    return compute_month_summary(
        obj.income_lines,
        obj.opex_lines,
        obj.financing_lines,
        overview,
        include_performance=include_performance,
    )

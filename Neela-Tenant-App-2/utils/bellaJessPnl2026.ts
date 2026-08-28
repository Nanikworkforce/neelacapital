/** Bella Jess Excel P&L — 2026 corrected totals + month line seeds. */

export type MonthlyPnlRow = {
  month: number;
  income: number;
  expenses: number;
  net: number;
};

/**
 * Corrected Jan–Dec 2026 (TEI / OpEx / NOI).
 * TEI = Gross + Other − Vacancy (vacancy as positive allowance).
 * Vacant months with Gross 2300 + Vacancy 2300 → TEI 0 (sheet −2300 was a formula bug).
 * OpEx = sum of expense lines (May/Jun: identical Elec + Utilities counted once).
 */
export const BELLA_JESS_2026_YEARLY: MonthlyPnlRow[] = [
  { month: 1, income: 2300, expenses: 468.53, net: 1831.47 },
  { month: 2, income: 2300, expenses: 411.23, net: 1888.77 },
  { month: 3, income: 2300, expenses: 380.5, net: 1919.5 },
  { month: 4, income: 2300, expenses: 748.06, net: 1551.94 },
  { month: 5, income: 0, expenses: 7733.9, net: -7733.9 },
  { month: 6, income: 0, expenses: 2372, net: -2372 },
  { month: 7, income: 0, expenses: 1315.85, net: -1315.85 },
  { month: 8, income: 0, expenses: 1467.27, net: -1467.27 },
  { month: 9, income: 0, expenses: 1467.27, net: -1467.27 },
  { month: 10, income: 0, expenses: 1867.27, net: -1867.27 },
  { month: 11, income: 0, expenses: 1967.27, net: -1967.27 },
  { month: 12, income: 0, expenses: 1140.14, net: -1140.14 },
];

export const BELLA_JESS_2026_YEAR_TOTAL = {
  income: 9200,
  expenses: 21339.29,
  net: -12139.29,
};

export type PnlLine = {
  key: string;
  label: string;
  amount: number;
  accent?: boolean;
};

/** Canonical income labels; amounts filled per month. */
export const INCOME_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'gross_rent', label: 'Gross Rental Income' },
  { key: 'other_income', label: 'Other Income (Late Fees, Pet Fees, Laundry)' },
  { key: 'vacancy', label: 'Vacancy' },
];

/** Canonical OpEx labels (sheet order); amounts filled per month. */
export const OPEX_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'pm_fees', label: 'Property Management Fees ($100 per door)' },
  { key: 'repairs', label: 'Repairs & Maintenance' },
  { key: 'property_taxes', label: 'Property Taxes' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'appraisal', label: 'Appraisal' },
  { key: 'hoa', label: 'HOA Fees' },
  { key: 'advertising', label: 'Advertising / Leasing' },
  { key: 'survey', label: 'Survey' },
  { key: 'transportation', label: 'Total Transportation Cost' },
  { key: 'legal', label: 'Legal & Professional Fees' },
  { key: 'supplies', label: 'Supplies & Materials' },
  { key: 'bank_charges', label: 'Bank Charges' },
  { key: 'electricity', label: 'Electricity', accent: true },
  { key: 'water', label: 'Water', accent: true },
  { key: 'internet', label: 'Internet', accent: true },
  { key: 'utilities_landlord', label: 'Utilities (Landlord Paid)' },
];

type MonthSeed = {
  gross: number;
  vacancy: number;
  /** Non-zero OpEx amounts by key. */
  opex: Partial<Record<string, number>>;
  mortgageInterest: number;
};

/** Collected 2026 month inputs (corrected TEI / OpEx line logic). */
export const BELLA_JESS_2026_MONTH_SEEDS: Record<number, MonthSeed> = {
  1: {
    gross: 2300,
    vacancy: 0,
    opex: { electricity: 303.38, utilities_landlord: 165.15 },
    mortgageInterest: 0,
  },
  2: {
    gross: 2300,
    vacancy: 0,
    opex: { electricity: 246.08, utilities_landlord: 165.15 },
    mortgageInterest: 0,
  },
  3: {
    gross: 2300,
    vacancy: 0,
    opex: { electricity: 215.35, utilities_landlord: 165.15 },
    mortgageInterest: 0,
  },
  4: {
    gross: 2300,
    vacancy: 0,
    opex: { repairs: 350, electricity: 232.91, utilities_landlord: 165.15 },
    mortgageInterest: 0,
  },
  5: {
    gross: 2300,
    vacancy: 2300,
    opex: {
      pm_fees: 100,
      repairs: 200,
      property_taxes: 453.67,
      insurance: 183.83,
      inspection: 600,
      appraisal: 825,
      hoa: 37.5,
      transportation: 242.27,
      legal: 350,
      supplies: 4500,
      electricity: 241.63,
    },
    mortgageInterest: 1232.5,
  },
  6: {
    gross: 2300,
    vacancy: 2300,
    opex: {
      pm_fees: 100,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 1000,
      transportation: 90.85,
      supplies: 200,
      electricity: 306.15,
    },
    mortgageInterest: 1232.5,
  },
  7: {
    gross: 2300,
    vacancy: 2300,
    opex: {
      pm_fees: 100,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 250,
      transportation: 90.85,
      supplies: 200,
    },
    mortgageInterest: 1232.5,
  },
  8: {
    gross: 2300,
    vacancy: 2300,
    opex: {
      pm_fees: 100,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 250,
      transportation: 242.27,
      supplies: 200,
    },
    mortgageInterest: 1232.5,
  },
  9: {
    gross: 2300,
    vacancy: 2300,
    opex: {
      pm_fees: 100,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 250,
      transportation: 242.27,
      supplies: 200,
    },
    mortgageInterest: 1232.5,
  },
  10: {
    gross: 2300,
    vacancy: 2300,
    opex: {
      pm_fees: 100,
      repairs: 500,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 150,
      transportation: 242.27,
      supplies: 200,
    },
    mortgageInterest: 1232.5,
  },
  11: {
    gross: 2300,
    vacancy: 2300,
    opex: {
      pm_fees: 100,
      repairs: 650,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 150,
      transportation: 242.27,
      supplies: 150,
    },
    mortgageInterest: 1232.5,
  },
  12: {
    gross: 0,
    vacancy: 0,
    opex: {
      pm_fees: 100,
      repairs: 200,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      transportation: 15.14,
      supplies: 150,
    },
    mortgageInterest: 1232.5,
  },
};

/** Seed editor defaults for a Bella Jess 2026 month. */
export function defaultIncomeLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  if (!useSheetDefaults) {
    return INCOME_LINE_DEFS.map((def) => ({ ...def, amount: 0 }));
  }
  const seed = BELLA_JESS_2026_MONTH_SEEDS[month];
  return INCOME_LINE_DEFS.map((def) => {
    let amount = 0;
    if (seed) {
      if (def.key === 'gross_rent') amount = seed.gross;
      else if (def.key === 'vacancy') amount = seed.vacancy;
    }
    return { ...def, amount };
  });
}

export function defaultOpexLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  if (!useSheetDefaults) {
    return OPEX_LINE_DEFS.map((def) => ({ ...def, amount: 0, accent: def.accent }));
  }
  const amounts = BELLA_JESS_2026_MONTH_SEEDS[month]?.opex ?? {};
  return OPEX_LINE_DEFS.map((def) => ({
    ...def,
    amount: amounts[def.key] ?? 0,
    accent: def.accent,
  }));
}

export function defaultFinancingLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const interest =
    useSheetDefaults && BELLA_JESS_2026_MONTH_SEEDS[month]
      ? BELLA_JESS_2026_MONTH_SEEDS[month].mortgageInterest
      : 0;
  return [
    { key: 'mortgage_interest', label: 'Mortgage Interest', amount: interest },
    { key: 'principal_repayment', label: 'Principal Repayment (non-expense)', amount: 0 },
  ];
}

/** January defaults (legacy alias). */
export const DEFAULT_JAN_INCOME_LINES: PnlLine[] = defaultIncomeLinesForMonth(1);
export const DEFAULT_JAN_OPEX_LINES: PnlLine[] = defaultOpexLinesForMonth(1);

/** Total Effective Income = Gross + Other − Vacancy (vacancy entered as a positive allowance). */
export function totalEffectiveIncome(lines: PnlLine[]): number {
  let gross = 0;
  let other = 0;
  let vacancy = 0;
  for (const line of lines) {
    const amt = Number(line.amount) || 0;
    if (line.key === 'vacancy') vacancy = amt;
    else if (line.key === 'other_income') other = amt;
    else if (line.key === 'gross_rent') gross = amt;
    else gross += amt; // unknown income keys add
  }
  return gross + other - vacancy;
}

export function totalOpex(lines: PnlLine[]): number {
  return lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
}

/** Merge saved JSON lines onto the canonical label/key list (keeps sheet order). */
export function mergeIncomeLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = defaultIncomeLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

export function mergeOpexLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = defaultOpexLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
      accent: def.accent,
    };
  });
}

export type MonthOverviewInputs = {
  purchasePrice?: number;
  downPayment?: number;
  closingCost?: number;
  landValue?: number;
  depreciationYears?: number;
  loanAmount?: number;
  interestRate?: number;
  monthlyMortgagePayment?: number;
};

/** Bella Jess Property Overview sheet fallbacks (admin financials). P&I = Dec-26. */
export const BELLA_JESS_OVERVIEW: Required<
  Pick<
    MonthOverviewInputs,
    | 'purchasePrice'
    | 'downPayment'
    | 'closingCost'
    | 'landValue'
    | 'depreciationYears'
    | 'loanAmount'
    | 'interestRate'
    | 'monthlyMortgagePayment'
  >
> = {
  purchasePrice: 255000,
  downPayment: 52234.95,
  closingCost: 16897.62,
  landValue: 49500,
  depreciationYears: 27.5,
  loanAmount: 204000,
  interestRate: 0.0725,
  monthlyMortgagePayment: 2029.14,
};

/** Annual depreciation $ = (Purchase − Land) ÷ years. */
export function annualDepreciation(overview?: MonthOverviewInputs | null): number {
  const purchase = overview?.purchasePrice ?? BELLA_JESS_OVERVIEW.purchasePrice;
  const land = overview?.landValue ?? BELLA_JESS_OVERVIEW.landValue;
  const years = overview?.depreciationYears ?? BELLA_JESS_OVERVIEW.depreciationYears;
  if (!years || years <= 0) return 0;
  return Math.max(purchase - land, 0) / years;
}

/** Monthly depreciation = Annual ÷ 12 (sheet formula). */
export function monthlyDepreciation(overview?: MonthOverviewInputs | null): number {
  return annualDepreciation(overview) / 12;
}

/**
 * Suggested Mortgage Interest / Principal from loan terms when sheet cells are blank:
 * Interest = Loan × (Rate ÷ 12); Principal = P&I − Interest.
 */
export function calculatedFinancingFromLoan(overview?: MonthOverviewInputs | null): {
  mortgageInterest: number;
  principalRepayment: number;
} {
  const loan = overview?.loanAmount ?? BELLA_JESS_OVERVIEW.loanAmount;
  const rate = overview?.interestRate ?? BELLA_JESS_OVERVIEW.interestRate;
  const pi = overview?.monthlyMortgagePayment ?? BELLA_JESS_OVERVIEW.monthlyMortgagePayment;
  const monthlyRate = rate > 1 ? rate / 100 / 12 : rate / 12;
  const interest = Math.round(loan * monthlyRate * 100) / 100;
  const principal = Math.round((pi - interest) * 100) / 100;
  return {
    mortgageInterest: interest,
    principalRepayment: Math.max(principal, 0),
  };
}

/** Default financing inputs — blank / 0 until seeded per month. */
export const DEFAULT_FINANCING_LINES: PnlLine[] = [
  { key: 'mortgage_interest', label: 'Mortgage Interest', amount: 0 },
  { key: 'principal_repayment', label: 'Principal Repayment (non-expense)', amount: 0 },
];

export function mergeFinancingLines(
  saved?: Partial<PnlLine>[] | null,
  _overview?: MonthOverviewInputs | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = defaultFinancingLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

export function financingAmount(lines: PnlLine[], key: string): number {
  const hit = lines.find((l) => l.key === key);
  return hit ? Number(hit.amount) || 0 : 0;
}

export type MonthSummaryMetrics = {
  totalEffectiveIncome: number;
  totalOpex: number;
  mortgageInterest: number;
  principalRepayment: number;
  noi: number;
  cashFlowBeforeTax: number;
  annualDepreciation: number;
  depreciation: number;
  netProfit: number;
  /** Admin only — (Annual NOI / Purchase Price) × 100. */
  capRatePct: number | null;
  /** Admin only — (Annual Cash Flow / Cash Invested) × 100; Cash Invested = Down + Closing. */
  cashOnCashPct: number | null;
  cashInvested: number;
};

export function computeMonthSummary(
  incomeLines: PnlLine[],
  opexLines: PnlLine[],
  financingLines: PnlLine[],
  overview?: MonthOverviewInputs | null,
  opts?: { includePerformance?: boolean },
): MonthSummaryMetrics {
  const tei = totalEffectiveIncome(incomeLines);
  const opex = totalOpex(opexLines);
  const interest = financingAmount(financingLines, 'mortgage_interest');
  const principal = financingAmount(financingLines, 'principal_repayment');
  const noi = tei - opex;
  const cashFlow = noi - interest;
  const annualDep = annualDepreciation(overview);
  const dep = annualDep / 12;
  const netProfit = cashFlow - dep;

  const purchase = overview?.purchasePrice ?? BELLA_JESS_OVERVIEW.purchasePrice;
  const down = overview?.downPayment ?? BELLA_JESS_OVERVIEW.downPayment;
  const closing = overview?.closingCost ?? BELLA_JESS_OVERVIEW.closingCost;
  const cashInvested = down + closing;

  let capRatePct: number | null = null;
  let cashOnCashPct: number | null = null;
  if (opts?.includePerformance) {
    capRatePct = purchase > 0 ? ((noi * 12) / purchase) * 100 : null;
    cashOnCashPct = cashInvested > 0 ? ((cashFlow * 12) / cashInvested) * 100 : null;
  }

  return {
    totalEffectiveIncome: tei,
    totalOpex: opex,
    mortgageInterest: interest,
    principalRepayment: principal,
    noi,
    cashFlowBeforeTax: cashFlow,
    annualDepreciation: annualDep,
    depreciation: dep,
    netProfit,
    capRatePct,
    cashOnCashPct,
    cashInvested,
  };
}

/** Apply saved month totals onto a yearly sheet baseline (any subset of months). */
export function applyMonthsToYearly(
  baseline: MonthlyPnlRow[],
  overrides: Partial<Record<number, { income: number; expenses: number; net: number }>> | null | undefined,
): MonthlyPnlRow[] {
  if (!overrides) return baseline.map((r) => ({ ...r }));
  return baseline.map((r) => {
    const t = overrides[r.month];
    return t
      ? { month: r.month, income: t.income, expenses: t.expenses, net: t.net }
      : { ...r };
  });
}

/** Apply live January (or any month) totals onto a yearly sheet baseline. */
export function applyMonthToYearly(
  baseline: MonthlyPnlRow[],
  month: number,
  totals: { income: number; expenses: number; net: number } | null | undefined,
): MonthlyPnlRow[] {
  if (!totals) return baseline.map((r) => ({ ...r }));
  return applyMonthsToYearly(baseline, { [month]: totals });
}

export function sumYearlyRows(rows: MonthlyPnlRow[]): { income: number; expenses: number; net: number } {
  return rows.reduce(
    (acc, r) => ({
      income: acc.income + r.income,
      expenses: acc.expenses + r.expenses,
      net: acc.net + r.net,
    }),
    { income: 0, expenses: 0, net: 0 },
  );
}

/** January monthly line detail from the Bella Jess sheet (Door 1 + OpEx + summary). */
export const BELLA_JESS_JAN_2026 = {
  income: {
    doorLabel: 'Door 1',
    lines: defaultIncomeLinesForMonth(1).map(({ label, amount }) => ({ label, amount })),
    totalEffectiveIncome: 2300,
  },
  operatingExpenses: {
    lines: defaultOpexLinesForMonth(1).map(({ label, amount, accent }) => ({ label, amount, accent })),
    total: 468.53,
  },
  financing: {
    lines: defaultFinancingLinesForMonth(1).map(({ label, amount }) => ({ label, amount })),
  },
  summary: {
    noi: 1831.47,
    cashFlowBeforeTax: 1831.47,
    depreciation: monthlyDepreciation(BELLA_JESS_OVERVIEW),
    netProfit: 1831.47 - monthlyDepreciation(BELLA_JESS_OVERVIEW),
  },
  performance: {
    capRate: ((1831.47 * 12) / BELLA_JESS_OVERVIEW.purchasePrice) * 100,
    cashOnCash:
      ((1831.47 * 12) / (BELLA_JESS_OVERVIEW.downPayment + BELLA_JESS_OVERVIEW.closingCost)) * 100,
  },
};

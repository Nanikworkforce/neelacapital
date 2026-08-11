/**
 * Avenue F (7304 Avenue F) Excel P&L — 2026.
 * 4-plex: Unit 1–4.
 *
 * One PropertyMonthInput row per month (unitLabel "Door 1") with multi-door
 * income/OpEx line keys. TEI = sum(doors) + other − vacancy.
 * OpEx = sum(all general + unit lines). NOI = TEI − OpEx.
 *
 * Yearly locked from overview screenshot. Jan line detail applied × 12.
 */

import type { MonthlyPnlRow, MonthOverviewInputs, PnlLine } from './bellaJessPnl2026';

export const AVENUE_F_UNITS = [
  { door: 1, label: 'Unit 1', sheetLabel: 'Door 1' },
  { door: 2, label: 'Unit 2', sheetLabel: 'Door 2' },
  { door: 3, label: 'Unit 3', sheetLabel: 'Door 3' },
  { door: 4, label: 'Unit 4', sheetLabel: 'Door 4' },
] as const;

/** Locked Jan–Dec 2026 yearly overview (screenshot). TEI $0 / OpEx $30 / NOI $(30) every month. */
export const AVENUE_F_2026_YEARLY: MonthlyPnlRow[] = [
  { month: 1, income: 0, expenses: 30, net: -30 },
  { month: 2, income: 0, expenses: 30, net: -30 },
  { month: 3, income: 0, expenses: 30, net: -30 },
  { month: 4, income: 0, expenses: 30, net: -30 },
  { month: 5, income: 0, expenses: 30, net: -30 },
  { month: 6, income: 0, expenses: 30, net: -30 },
  { month: 7, income: 0, expenses: 30, net: -30 },
  { month: 8, income: 0, expenses: 30, net: -30 },
  { month: 9, income: 0, expenses: 30, net: -30 },
  { month: 10, income: 0, expenses: 30, net: -30 },
  { month: 11, income: 0, expenses: 30, net: -30 },
  { month: 12, income: 0, expenses: 30, net: -30 },
];

export const AVENUE_F_2026_YEAR_TOTAL = {
  income: 0,
  expenses: 360,
  net: -360,
};

/** Property overview from Jan-26 (seller finance via David Hesham). Land TBD. */
export const AVENUE_F_OVERVIEW: Required<
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
> & {
  loanTermYears: number;
  sellerFinanceNote: string;
} = {
  purchasePrice: 180000,
  downPayment: 18000,
  closingCost: 0,
  loanAmount: 162000,
  interestRate: 0.08,
  monthlyMortgagePayment: 1189,
  landValue: 0,
  depreciationYears: 27.5,
  loanTermYears: 30,
  sellerFinanceNote: 'Seller Finance Via David Hesham',
};

export const isAvenueFName = (name: string) => /avenue\s*f|ave\.?\s*f|avef/i.test(name || '');

export type AvenueFMonthIncome = {
  doors: [number, number, number, number];
  otherIncome: number;
  vacancy: number;
  gross: number;
  tei: number;
};

export type AvenueFUnitOpex = {
  pmFees: number;
  repairs: number;
  advertising: number;
  cleaning: number;
  survey: number;
  supplies: number;
  electricity: number;
  water: number;
  internet: number;
  insurance: number;
  taxes: number;
  total: number;
};

export type AvenueFMonthOpex = {
  general: {
    insurance: number;
    taxes: number;
    inspection: number;
    appraisal: number;
    hoa: number;
    bankCharges: number;
    legal: number;
  };
  units: [AvenueFUnitOpex, AvenueFUnitOpex, AvenueFUnitOpex, AvenueFUnitOpex];
  total: number;
};

const blankUnitOpex = (): AvenueFUnitOpex => ({
  pmFees: 0,
  repairs: 0,
  advertising: 0,
  cleaning: 0,
  survey: 0,
  supplies: 0,
  electricity: 0,
  water: 0,
  internet: 0,
  insurance: 0,
  taxes: 0,
  total: 0,
});

const blankMonthIncome = (): AvenueFMonthIncome => ({
  doors: [0, 0, 0, 0],
  otherIncome: 0,
  vacancy: 0,
  gross: 0,
  tei: 0,
});

const blankMonthOpex = (): AvenueFMonthOpex => ({
  general: {
    insurance: 0,
    taxes: 0,
    inspection: 0,
    appraisal: 0,
    hoa: 0,
    bankCharges: 0,
    legal: 0,
  },
  units: [blankUnitOpex(), blankUnitOpex(), blankUnitOpex(), blankUnitOpex()],
  total: 0,
});

/** Locked Jan income — all doors blank / TEI $0; same seed used Jan–Dec. */
const januaryIncome = (): AvenueFMonthIncome => ({
  doors: [0, 0, 0, 0],
  otherIncome: 0,
  vacancy: 0,
  gross: 0,
  tei: 0,
});

/** Locked Jan OpEx — Unit 4 PM $30; same seed used Jan–Dec. */
const januaryOpex = (): AvenueFMonthOpex => ({
  general: {
    insurance: 0,
    taxes: 0,
    inspection: 0,
    appraisal: 0,
    hoa: 0,
    bankCharges: 0,
    legal: 0,
  },
  units: [
    blankUnitOpex(),
    blankUnitOpex(),
    blankUnitOpex(),
    { ...blankUnitOpex(), pmFees: 30, total: 30 },
  ],
  total: 30,
});

/**
 * Per-month income — Jan collected detail applied to all 12 months.
 */
export const AVENUE_F_2026_MONTH_INCOME: Record<number, AvenueFMonthIncome> = {
  1: januaryIncome(),
  2: januaryIncome(),
  3: januaryIncome(),
  4: januaryIncome(),
  5: januaryIncome(),
  6: januaryIncome(),
  7: januaryIncome(),
  8: januaryIncome(),
  9: januaryIncome(),
  10: januaryIncome(),
  11: januaryIncome(),
  12: januaryIncome(),
};

/**
 * Per-month OpEx — Jan collected detail applied to all 12 months.
 * Unit 4 PM $30 = $30.00 ✓ matches yearly every month.
 */
export const AVENUE_F_2026_MONTH_OPEX: Record<number, AvenueFMonthOpex> = {
  1: januaryOpex(),
  2: januaryOpex(),
  3: januaryOpex(),
  4: januaryOpex(),
  5: januaryOpex(),
  6: januaryOpex(),
  7: januaryOpex(),
  8: januaryOpex(),
  9: januaryOpex(),
  10: januaryOpex(),
  11: januaryOpex(),
  12: januaryOpex(),
};

export const AVENUE_F_2026_MONTH_INTEREST: Record<number, number> = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
};

export type AvenueFMonthFinancing = {
  mortgageInterest: number;
  principalRepayment: number;
  noi: number;
  landValue: number;
  cashFlowBeforeTax: number;
  /** Corrected: (purchase − land) / depYears / 12. Sheet left blank. */
  depreciation: number;
  netProfit: number;
  capRate: number;
  cashOnCash: number;
};

/** Corrected monthly dep = (180000 − 0) / 27.5 / 12 = 545.45 */
const AVENUE_F_MONTHLY_DEP = 545.45;

const januaryFinancing = (): AvenueFMonthFinancing => ({
  mortgageInterest: 0,
  principalRepayment: 0,
  noi: -30,
  landValue: 0,
  cashFlowBeforeTax: -30,
  depreciation: AVENUE_F_MONTHLY_DEP,
  netProfit: -30 - AVENUE_F_MONTHLY_DEP,
  capRate: -30 / 180000,
  cashOnCash: -30 / 18000,
});

/** Jan financing + corrected dep — same seed for all months. */
export const AVENUE_F_2026_MONTH_FINANCING: Record<number, AvenueFMonthFinancing> = {
  1: januaryFinancing(),
  2: januaryFinancing(),
  3: januaryFinancing(),
  4: januaryFinancing(),
  5: januaryFinancing(),
  6: januaryFinancing(),
  7: januaryFinancing(),
  8: januaryFinancing(),
  9: januaryFinancing(),
  10: januaryFinancing(),
  11: januaryFinancing(),
  12: januaryFinancing(),
};

export const AVENUE_F_INCOME_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'door_1', label: 'Door 1 (Unit 1)', accent: true },
  { key: 'door_2', label: 'Door 2 (Unit 2)', accent: true },
  { key: 'door_3', label: 'Door 3 (Unit 3)', accent: true },
  { key: 'door_4', label: 'Door 4 (Unit 4)', accent: true },
  { key: 'other_income', label: 'Other Income (Late Fees, Pet Fees, Laundry)' },
  { key: 'vacancy', label: 'Vacancy' },
];

const UNIT_OPEX_KEYS = [
  'pm_fees',
  'repairs',
  'advertising',
  'cleaning',
  'survey',
  'supplies',
  'electricity',
  'water',
  'internet',
  'insurance',
  'taxes',
] as const;

const UNIT_OPEX_LABELS: Record<(typeof UNIT_OPEX_KEYS)[number], string> = {
  pm_fees: 'Property Management Fees',
  repairs: 'Repairs & Maintenance',
  advertising: 'Advertising / Leasing',
  cleaning: 'Cleaning Fees',
  survey: 'Survey',
  supplies: 'Supplies & Materials',
  electricity: 'Electricity',
  water: 'Water',
  internet: 'Internet',
  insurance: 'Insurance',
  taxes: 'Taxes',
};

const UNIT_FIELD: Record<(typeof UNIT_OPEX_KEYS)[number], keyof AvenueFUnitOpex> = {
  pm_fees: 'pmFees',
  repairs: 'repairs',
  advertising: 'advertising',
  cleaning: 'cleaning',
  survey: 'survey',
  supplies: 'supplies',
  electricity: 'electricity',
  water: 'water',
  internet: 'internet',
  insurance: 'insurance',
  taxes: 'taxes',
};

export const AVENUE_F_OPEX_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'gen_insurance', label: 'Insurance (General)', accent: true },
  { key: 'gen_taxes', label: 'Taxes (General)', accent: true },
  { key: 'inspection', label: 'Inspection' },
  { key: 'appraisal', label: 'Appraisal' },
  { key: 'hoa', label: 'HOA Fees' },
  { key: 'bank_charges', label: 'Bank Charges' },
  { key: 'legal', label: 'Legal & Professional Fees' },
  ...AVENUE_F_UNITS.flatMap((u) =>
    UNIT_OPEX_KEYS.map((k) => ({
      key: `${k}_door_${u.door}`,
      label: `${UNIT_OPEX_LABELS[k]} — ${u.label}`,
      accent: k === 'insurance' || k === 'taxes' || k === 'electricity' || k === 'water' || k === 'internet',
    })),
  ),
];

export function avenueFDefaultIncomeLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (AVENUE_F_2026_MONTH_INCOME[month] ?? blankMonthIncome())
    : blankMonthIncome();
  return AVENUE_F_INCOME_LINE_DEFS.map((def) => {
    let amount = 0;
    if (def.key === 'door_1') amount = seed.doors[0];
    else if (def.key === 'door_2') amount = seed.doors[1];
    else if (def.key === 'door_3') amount = seed.doors[2];
    else if (def.key === 'door_4') amount = seed.doors[3];
    else if (def.key === 'other_income') amount = seed.otherIncome;
    else if (def.key === 'vacancy') amount = seed.vacancy;
    return { ...def, amount };
  });
}

export function avenueFDefaultOpexLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (AVENUE_F_2026_MONTH_OPEX[month] ?? blankMonthOpex())
    : blankMonthOpex();
  return AVENUE_F_OPEX_LINE_DEFS.map((def) => {
    let amount = 0;
    if (def.key === 'gen_insurance') amount = seed.general.insurance;
    else if (def.key === 'gen_taxes') amount = seed.general.taxes;
    else if (def.key === 'inspection') amount = seed.general.inspection;
    else if (def.key === 'appraisal') amount = seed.general.appraisal;
    else if (def.key === 'hoa') amount = seed.general.hoa;
    else if (def.key === 'bank_charges') amount = seed.general.bankCharges;
    else if (def.key === 'legal') amount = seed.general.legal;
    else {
      const m = def.key.match(/^(.+)_door_(\d+)$/);
      if (m) {
        const lineKey = m[1] as (typeof UNIT_OPEX_KEYS)[number];
        const door = Number(m[2]);
        const unit = seed.units[door - 1];
        const field = UNIT_FIELD[lineKey];
        if (unit && field) amount = Number(unit[field]) || 0;
      }
    }
    return { ...def, amount, accent: def.accent };
  });
}

export function avenueFDefaultFinancingLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const interest = useSheetDefaults ? (AVENUE_F_2026_MONTH_INTEREST[month] ?? 0) : 0;
  return [
    { key: 'mortgage_interest', label: 'Mortgage Interest', amount: interest },
    { key: 'principal_repayment', label: 'Principal Repayment (non-expense)', amount: 0 },
  ];
}

export function mergeAvenueFIncomeLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = avenueFDefaultIncomeLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

export function mergeAvenueFOpexLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = avenueFDefaultOpexLinesForMonth(month, useSheetDefaults);
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

export function mergeAvenueFFinancingLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = avenueFDefaultFinancingLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

/**
 * Avenue H Excel P&L — 2026.
 * 4-plex: Unit 1 (The Hideaway) / Unit 2 (Little H House) /
 *         Unit 3 (Sweet Home) / Unit 4 (Erica).
 *
 * One PropertyMonthInput row per month (unitLabel "Door 1") with multi-door
 * income/OpEx line keys. TEI = sum(doors) + other − vacancy.
 * OpEx = sum(all general + unit lines). NOI = TEI − OpEx.
 *
 * Yearly aligned to Jan detail × 12. Overview + Jan line detail collected;
 * Feb–Dec use the same Jan income / OpEx / financing seed.
 */

import type { MonthlyPnlRow, MonthOverviewInputs, PnlLine } from './bellaJessPnl2026';

export const AVENUE_H_UNITS = [
  { door: 1, label: 'Unit 1 (The Hideaway / Air B&B)', sheetLabel: 'Door 1 - Air B&B' },
  { door: 2, label: 'Unit 2 (Little H House / Air B&B)', sheetLabel: 'Door 2 - Air B&B' },
  { door: 3, label: 'Unit 3 (Sweet Home / Air B&B)', sheetLabel: 'Door 3 - Air B&B' },
  { door: 4, label: 'Unit 4 (Erica)', sheetLabel: 'Door 4 - Erica' },
] as const;

/**
 * Yearly overview aligned to Jan detail applied across all months.
 * TEI $850 / OpEx $1,161.65 / NOI $(311.65) × 12.
 * (Original sheet yearly had varying OpEx; superseded by Jan line-item seed.)
 */
export const AVENUE_H_2026_YEARLY: MonthlyPnlRow[] = [
  { month: 1, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 2, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 3, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 4, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 5, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 6, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 7, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 8, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 9, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 10, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 11, income: 850, expenses: 1161.65, net: -311.65 },
  { month: 12, income: 850, expenses: 1161.65, net: -311.65 },
];

export const AVENUE_H_2026_YEAR_TOTAL = {
  income: 10200,
  expenses: 13939.8,
  net: -3739.8,
};

/** Property overview from Jan-26 (seller finance via David Hesham). Land TBD. */
export const AVENUE_H_OVERVIEW: Required<
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
  balloonNote: string;
  sellerFinanceNote: string;
} = {
  purchasePrice: 300000,
  downPayment: 41513.32,
  closingCost: 0,
  loanAmount: 275580.06,
  interestRate: 0.09,
  monthlyMortgagePayment: 2025,
  landValue: 0,
  depreciationYears: 27.5,
  loanTermYears: 30,
  balloonNote: '5 Year Maturity (July 10, 2030)',
  sellerFinanceNote: 'Seller Finance Via David Hesham',
};

export const isAvenueHName = (name: string) => /avenue\s*h|ave\.?\s*h|aveh/i.test(name || '');

export type AvenueHMonthIncome = {
  doors: [number, number, number, number];
  otherIncome: number;
  vacancy: number;
  gross: number;
  tei: number;
};

export type AvenueHUnitOpex = {
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

export type AvenueHMonthOpex = {
  general: {
    insurance: number;
    taxes: number;
    inspection: number;
    appraisal: number;
    hoa: number;
    bankCharges: number;
    legal: number;
  };
  units: [AvenueHUnitOpex, AvenueHUnitOpex, AvenueHUnitOpex, AvenueHUnitOpex];
  total: number;
};

const blankUnitOpex = (): AvenueHUnitOpex => ({
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

const blankMonthIncome = (): AvenueHMonthIncome => ({
  doors: [0, 0, 0, 0],
  otherIncome: 0,
  vacancy: 0,
  gross: 0,
  tei: 0,
});

const blankMonthOpex = (): AvenueHMonthOpex => ({
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

/** Locked Jan income — Door 4 Erica $850; same seed used Jan–Dec. */
const januaryIncome = (): AvenueHMonthIncome => ({
  doors: [0, 0, 0, 850],
  otherIncome: 0,
  vacancy: 0,
  gross: 850,
  tei: 850,
});

/** Locked Jan OpEx — general $0 + 4 units; same seed used Jan–Dec. */
const januaryOpex = (): AvenueHMonthOpex => ({
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
    {
      pmFees: 30,
      repairs: 175,
      advertising: 0,
      cleaning: 60,
      survey: 0,
      supplies: 50,
      electricity: 148.69,
      water: 137.35,
      internet: 23.55,
      insurance: 0,
      taxes: 0,
      total: 624.59,
    },
    {
      pmFees: 30,
      repairs: 175,
      advertising: 0,
      cleaning: 60,
      survey: 0,
      supplies: 50,
      electricity: 125.46,
      water: 43.05,
      internet: 23.55,
      insurance: 0,
      taxes: 0,
      total: 507.06,
    },
    blankUnitOpex(),
    { ...blankUnitOpex(), pmFees: 30, total: 30 },
  ],
  total: 1161.65,
});

/**
 * Per-month income — Jan collected detail applied to all 12 months
 * (same 4-door breakdown until a month is edited).
 */
export const AVENUE_H_2026_MONTH_INCOME: Record<number, AvenueHMonthIncome> = {
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
 * Unit 1 $624.59 + Unit 2 $507.06 + Unit 3 $0 + Unit 4 $30 = $1,161.65.
 */
export const AVENUE_H_2026_MONTH_OPEX: Record<number, AvenueHMonthOpex> = {
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

export const AVENUE_H_2026_MONTH_INTEREST: Record<number, number> = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
};

export type AvenueHMonthFinancing = {
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

/** Corrected monthly dep = (300000 − 0) / 27.5 / 12 = 909.09 */
const AVENUE_H_MONTHLY_DEP = 909.09;

const januaryFinancing = (): AvenueHMonthFinancing => ({
  mortgageInterest: 0,
  principalRepayment: 0,
  noi: -311.65,
  landValue: 0,
  cashFlowBeforeTax: -311.65,
  depreciation: AVENUE_H_MONTHLY_DEP,
  netProfit: -311.65 - AVENUE_H_MONTHLY_DEP,
  capRate: -311.65 / 300000,
  cashOnCash: -311.65 / 41513.32,
});

/** Jan financing + corrected dep — same seed for all months. */
export const AVENUE_H_2026_MONTH_FINANCING: Record<number, AvenueHMonthFinancing> = {
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

export const AVENUE_H_INCOME_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'door_1_rent', label: 'Door 1 - Air B&B' },
  { key: 'door_2_rent', label: 'Door 2 - Air B&B' },
  { key: 'door_3_rent', label: 'Door 3 - Air B&B' },
  { key: 'door_4_rent', label: 'Door 4 - Erica' },
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

const UNIT_FIELD: Record<(typeof UNIT_OPEX_KEYS)[number], keyof AvenueHUnitOpex> = {
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

export const AVENUE_H_OPEX_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'gen_insurance', label: 'Insurance (General)' },
  { key: 'gen_taxes', label: 'Taxes (General)' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'appraisal', label: 'Appraisal' },
  { key: 'hoa', label: 'HOA Fees' },
  { key: 'bank_charges', label: 'Bank Charges' },
  { key: 'legal', label: 'Legal & Professional Fees' },
  ...AVENUE_H_UNITS.flatMap((u) =>
    UNIT_OPEX_KEYS.map((k) => ({
      key: `${k}_door_${u.door}`,
      label: `${UNIT_OPEX_LABELS[k]} — ${u.label}`,
    })),
  ),
];

const amountMapFromIncome = (m: AvenueHMonthIncome): Record<string, number> => ({
  door_1_rent: m.doors[0],
  door_2_rent: m.doors[1],
  door_3_rent: m.doors[2],
  door_4_rent: m.doors[3],
  other_income: m.otherIncome,
  vacancy: m.vacancy,
});

const amountMapFromOpex = (m: AvenueHMonthOpex): Record<string, number> => {
  const out: Record<string, number> = {
    gen_insurance: m.general.insurance,
    gen_taxes: m.general.taxes,
    inspection: m.general.inspection,
    appraisal: m.general.appraisal,
    hoa: m.general.hoa,
    bank_charges: m.general.bankCharges,
    legal: m.general.legal,
  };
  m.units.forEach((unit, idx) => {
    const door = idx + 1;
    for (const k of UNIT_OPEX_KEYS) {
      out[`${k}_door_${door}`] = Number(unit[UNIT_FIELD[k]]) || 0;
    }
  });
  return out;
};

export function avenueHDefaultIncomeLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults ? AVENUE_H_2026_MONTH_INCOME[month] : blankMonthIncome();
  const amounts = amountMapFromIncome(seed || blankMonthIncome());
  return AVENUE_H_INCOME_LINE_DEFS.map((d) => ({ ...d, amount: amounts[d.key] ?? 0 }));
}

export function avenueHDefaultOpexLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults ? AVENUE_H_2026_MONTH_OPEX[month] : blankMonthOpex();
  const amounts = amountMapFromOpex(seed || blankMonthOpex());
  return AVENUE_H_OPEX_LINE_DEFS.map((d) => ({ ...d, amount: amounts[d.key] ?? 0 }));
}

export function avenueHDefaultFinancingLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const interest = useSheetDefaults ? (AVENUE_H_2026_MONTH_INTEREST[month] ?? 0) : 0;
  return [
    { key: 'mortgage_interest', label: 'Mortgage Interest', amount: interest },
    { key: 'principal_repayment', label: 'Principal Repayment (non-expense)', amount: 0 },
  ];
}

export function mergeAvenueHIncomeLines(
  saved: Partial<PnlLine>[] | null | undefined,
  month: number,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = avenueHDefaultIncomeLinesForMonth(month, useSheetDefaults);
  if (!saved?.length) return defaults;
  const byKey = new Map(saved.map((l) => [l.key, l]));
  return defaults.map((d) => {
    const s = byKey.get(d.key);
    return s && typeof s.amount === 'number' ? { ...d, amount: s.amount } : d;
  });
}

export function mergeAvenueHOpexLines(
  saved: Partial<PnlLine>[] | null | undefined,
  month: number,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = avenueHDefaultOpexLinesForMonth(month, useSheetDefaults);
  if (!saved?.length) return defaults;
  const byKey = new Map(saved.map((l) => [l.key, l]));
  return defaults.map((d) => {
    const s = byKey.get(d.key);
    return s && typeof s.amount === 'number' ? { ...d, amount: s.amount } : d;
  });
}

export function mergeAvenueHFinancingLines(
  saved: Partial<PnlLine>[] | null | undefined,
  month: number,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = avenueHDefaultFinancingLinesForMonth(month, useSheetDefaults);
  if (!saved?.length) return defaults;
  const byKey = new Map(saved.map((l) => [l.key, l]));
  return defaults.map((d) => {
    const s = byKey.get(d.key);
    return s && typeof s.amount === 'number' ? { ...d, amount: s.amount } : d;
  });
}

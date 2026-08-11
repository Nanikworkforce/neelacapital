/**
 * Wooding St (903 Wooden Street) Excel P&L — 2026.
 * 3-plex: Unit 1 / Unit 2 (Cozy Suite) / Unit 3.
 *
 * One PropertyMonthInput row per month (unitLabel "Door 1") with multi-door
 * income/OpEx line keys. TEI = sum(doors) + other − vacancy.
 * OpEx = sum(all general + unit lines). NOI = TEI − OpEx.
 *
 * Yearly aligned to Jan detail × 12. Overview + Jan line detail collected;
 * Feb–Dec use the same Jan income / OpEx / financing seed.
 */

import type { MonthlyPnlRow, MonthOverviewInputs, PnlLine } from './bellaJessPnl2026';

export const WOODING_UNITS = [
  { door: 1, label: 'Unit 1', sheetLabel: 'Door 1' },
  { door: 2, label: 'Unit 2 (Cozy Suite)', sheetLabel: 'Door 2 (Unit 4) / Cozy Suite' },
  { door: 3, label: 'Unit 3', sheetLabel: 'Door 3' },
] as const;

/**
 * Yearly overview aligned to Jan detail applied across all months.
 * TEI $0 / OpEx $100.11 / NOI $(100.11) × 12.
 * (Original sheet yearly had varying OpEx + Feb #REF!; superseded by Jan line-item seed.)
 */
export const WOODING_2026_YEARLY: MonthlyPnlRow[] = [
  { month: 1, income: 0, expenses: 100.11, net: -100.11 },
  { month: 2, income: 0, expenses: 100.11, net: -100.11 },
  { month: 3, income: 0, expenses: 100.11, net: -100.11 },
  { month: 4, income: 0, expenses: 100.11, net: -100.11 },
  { month: 5, income: 0, expenses: 100.11, net: -100.11 },
  { month: 6, income: 0, expenses: 100.11, net: -100.11 },
  { month: 7, income: 0, expenses: 100.11, net: -100.11 },
  { month: 8, income: 0, expenses: 100.11, net: -100.11 },
  { month: 9, income: 0, expenses: 100.11, net: -100.11 },
  { month: 10, income: 0, expenses: 100.11, net: -100.11 },
  { month: 11, income: 0, expenses: 100.11, net: -100.11 },
  { month: 12, income: 0, expenses: 100.11, net: -100.11 },
];

export const WOODING_2026_YEAR_TOTAL = {
  income: 0,
  expenses: 1201.32,
  net: -1201.32,
};

/** Property overview from Jan-26 (seller finance via David Hesham). Land TBD. */
export const WOODING_OVERVIEW: Required<
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
  purchasePrice: 216507,
  downPayment: 16507,
  closingCost: 0,
  loanAmount: 200000,
  interestRate: 0.09,
  monthlyMortgagePayment: 4127,
  landValue: 0,
  depreciationYears: 27.5,
  loanTermYears: 30,
  sellerFinanceNote: 'Seller Finance Via David Hesham',
};

export const isWoodingName = (name: string) => /wooding|wooden/i.test(name || '');

export type WoodingMonthIncome = {
  doors: [number, number, number];
  otherIncome: number;
  vacancy: number;
  gross: number;
  tei: number;
};

export type WoodingUnitOpex = {
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
  gas: number;
  total: number;
};

export type WoodingMonthOpex = {
  general: {
    insurance: number;
    taxes: number;
    inspection: number;
    appraisal: number;
    hoa: number;
    bankCharges: number;
    legal: number;
  };
  units: [WoodingUnitOpex, WoodingUnitOpex, WoodingUnitOpex];
  total: number;
};

const blankUnitOpex = (): WoodingUnitOpex => ({
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
  gas: 0,
  total: 0,
});

const blankMonthIncome = (): WoodingMonthIncome => ({
  doors: [0, 0, 0],
  otherIncome: 0,
  vacancy: 0,
  gross: 0,
  tei: 0,
});

const blankMonthOpex = (): WoodingMonthOpex => ({
  general: {
    insurance: 0,
    taxes: 0,
    inspection: 0,
    appraisal: 0,
    hoa: 0,
    bankCharges: 0,
    legal: 0,
  },
  units: [blankUnitOpex(), blankUnitOpex(), blankUnitOpex()],
  total: 0,
});

/** Locked Jan income — all doors blank / TEI $0; same seed used Jan–Dec. */
const januaryIncome = (): WoodingMonthIncome => ({
  doors: [0, 0, 0],
  otherIncome: 0,
  vacancy: 0,
  gross: 0,
  tei: 0,
});

/** Locked Jan OpEx — Unit 2 Cozy Suite elec+water $100.11; same seed used Jan–Dec. */
const januaryOpex = (): WoodingMonthOpex => ({
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
    {
      ...blankUnitOpex(),
      electricity: 14.9,
      water: 85.21,
      total: 100.11,
    },
    blankUnitOpex(),
  ],
  total: 100.11,
});

/**
 * Per-month income — Jan collected detail applied to all 12 months
 * (same 3-door breakdown until a month is edited).
 */
export const WOODING_2026_MONTH_INCOME: Record<number, WoodingMonthIncome> = {
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
 * Unit 1 $0 + Unit 2 $100.11 + Unit 3 $0 = $100.11.
 */
export const WOODING_2026_MONTH_OPEX: Record<number, WoodingMonthOpex> = {
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

export const WOODING_2026_MONTH_INTEREST: Record<number, number> = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0,
};

export type WoodingMonthFinancing = {
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

/** Corrected monthly dep = (216507 − 0) / 27.5 / 12 = 656.08 */
const WOODING_MONTHLY_DEP = 656.08;

const januaryFinancing = (): WoodingMonthFinancing => ({
  mortgageInterest: 0,
  principalRepayment: 0,
  noi: -100.11,
  landValue: 0,
  cashFlowBeforeTax: -100.11,
  depreciation: WOODING_MONTHLY_DEP,
  netProfit: -100.11 - WOODING_MONTHLY_DEP,
  capRate: -100.11 / 216507,
  cashOnCash: -100.11 / 16507,
});

/** Jan financing + corrected dep — same seed for all months. */
export const WOODING_2026_MONTH_FINANCING: Record<number, WoodingMonthFinancing> = {
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

export const WOODING_INCOME_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'door_1', label: 'Door 1', accent: true },
  { key: 'door_2', label: 'Door 2 (Unit 4)', accent: true },
  { key: 'door_3', label: 'Door 3 (Cozy Suite on Wooding)', accent: true },
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
  'gas',
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
  gas: 'Gas',
};

const UNIT_FIELD: Record<(typeof UNIT_OPEX_KEYS)[number], keyof WoodingUnitOpex> = {
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
  gas: 'gas',
};

export const WOODING_OPEX_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'gen_insurance', label: 'Insurance (General)', accent: true },
  { key: 'gen_taxes', label: 'Taxes (General)', accent: true },
  { key: 'inspection', label: 'Inspection' },
  { key: 'appraisal', label: 'Appraisal' },
  { key: 'hoa', label: 'HOA Fees' },
  { key: 'bank_charges', label: 'Bank Charges' },
  { key: 'legal', label: 'Legal & Professional Fees' },
  ...WOODING_UNITS.flatMap((u) =>
    UNIT_OPEX_KEYS.map((k) => ({
      key: `${k}_door_${u.door}`,
      label: `${UNIT_OPEX_LABELS[k]} — ${u.label}`,
      accent: k === 'insurance' || k === 'taxes' || k === 'electricity' || k === 'water' || k === 'internet',
    })),
  ),
];

export function woodingDefaultIncomeLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (WOODING_2026_MONTH_INCOME[month] ?? blankMonthIncome())
    : blankMonthIncome();
  return WOODING_INCOME_LINE_DEFS.map((def) => {
    let amount = 0;
    if (def.key === 'door_1') amount = seed.doors[0];
    else if (def.key === 'door_2') amount = seed.doors[1];
    else if (def.key === 'door_3') amount = seed.doors[2];
    else if (def.key === 'other_income') amount = seed.otherIncome;
    else if (def.key === 'vacancy') amount = seed.vacancy;
    return { ...def, amount };
  });
}

export function woodingDefaultOpexLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (WOODING_2026_MONTH_OPEX[month] ?? blankMonthOpex())
    : blankMonthOpex();
  return WOODING_OPEX_LINE_DEFS.map((def) => {
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

export function woodingDefaultFinancingLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const interest = useSheetDefaults ? (WOODING_2026_MONTH_INTEREST[month] ?? 0) : 0;
  return [
    { key: 'mortgage_interest', label: 'Mortgage Interest', amount: interest },
    { key: 'principal_repayment', label: 'Principal Repayment (non-expense)', amount: 0 },
  ];
}

export function mergeWoodingIncomeLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = woodingDefaultIncomeLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

export function mergeWoodingOpexLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = woodingDefaultOpexLinesForMonth(month, useSheetDefaults);
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

export function mergeWoodingFinancingLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = woodingDefaultFinancingLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

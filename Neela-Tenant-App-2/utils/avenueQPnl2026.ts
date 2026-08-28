/**
 * Avenue Q (6835 Avenue Q) Excel P&L — 2026.
 * 4-plex: Unit A / Unit B (Eado Escape) / Unit C / Unit D (Eado Studio).
 *
 * One PropertyMonthInput row per month (unitLabel "Door 1") with multi-door
 * income/OpEx line keys. TEI = sum(doors) + other − vacancy.
 * OpEx = sum(all general + unit lines). NOI = TEI − OpEx.
 */

import type { MonthlyPnlRow, MonthOverviewInputs, PnlLine } from './bellaJessPnl2026';

/** Canonical doors for Avenue Q sheet income / unit OpEx. */
export const AVENUE_Q_UNITS = [
  { door: 1, label: 'Unit A', sheetLabel: 'Door 1 (Unit A)' },
  { door: 2, label: 'Unit B (Eado Escape)', sheetLabel: 'Door 2 (Eado Escape)' },
  { door: 3, label: 'Unit C', sheetLabel: 'Door 3' },
  { door: 4, label: 'Unit D (Eado Studio)', sheetLabel: 'Door 4 (Eado Studio)' },
] as const;

/**
 * Corrected Jan–Dec 2026 yearly overview.
 * Jan OpEx includes General Inspection+Appraisal ($200) omitted by sheet total formula.
 * Mar/Apr OpEx provisional $0 until month detail confirms (sheet had #REF!).
 */
export const AVENUE_Q_2026_YEARLY: MonthlyPnlRow[] = [
  { month: 1, income: 2900, expenses: 1493.62, net: 1406.38 },
  { month: 2, income: 3550.03, expenses: 685.87, net: 2864.16 },
  { month: 3, income: 0, expenses: 0, net: 0 },
  { month: 4, income: 0, expenses: 0, net: 0 },
  { month: 5, income: 5796.2, expenses: 1380.6, net: 4415.6 },
  { month: 6, income: 5836, expenses: 30, net: 5806 },
  { month: 7, income: 4870.51, expenses: 30, net: 4840.51 },
  { month: 8, income: 4511.8, expenses: 30, net: 4481.8 },
  { month: 9, income: 5394.89, expenses: 30, net: 5364.89 },
  { month: 10, income: 4767.35, expenses: 30, net: 4737.35 },
  { month: 11, income: 5338.11, expenses: 30, net: 5308.11 },
  { month: 12, income: 4200, expenses: 30, net: 4170 },
];

export const AVENUE_Q_2026_YEAR_TOTAL = {
  income: 47164.89,
  expenses: 3770.09,
  net: 43394.8,
};

/** Property overview from Jan-26 sheet (+ land from Summary). */
export const AVENUE_Q_OVERVIEW: Required<
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
  purchasePrice: 555000,
  downPayment: 145522.37,
  closingCost: 25693.33,
  loanAmount: 416250,
  interestRate: 0.07375,
  monthlyMortgagePayment: 3685.79,
  landValue: 85000,
  depreciationYears: 27.5,
};

export const isAvenueQName = (name: string) =>
  /avenue\s*q|ave\.?\s*q|aveq/i.test(name || '');

/** Typical monthly mortgage interest for this loan (Jan sheet). */
const DEFAULT_MORTGAGE_INTEREST = 2556.26;

export type AvenueQMonthIncome = {
  doors: [number, number, number, number];
  otherIncome: number;
  vacancy: number;
  gross: number;
  tei: number;
};

export type AvenueQUnitOpex = {
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

export type AvenueQMonthOpex = {
  general: {
    insurance: number;
    taxes: number;
    inspection: number;
    appraisal: number;
    hoa: number;
    bankCharges: number;
    legal: number;
  };
  units: [AvenueQUnitOpex, AvenueQUnitOpex, AvenueQUnitOpex, AvenueQUnitOpex];
  total: number;
};

const blankUnit = (): AvenueQUnitOpex => ({
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

/** Empty 4-plex month shell — same lines as January, all amounts $0. */
const blankMonthIncome = (): AvenueQMonthIncome => ({
  doors: [0, 0, 0, 0],
  otherIncome: 0,
  vacancy: 0,
  gross: 0,
  tei: 0,
});

const blankMonthOpex = (): AvenueQMonthOpex => ({
  general: {
    insurance: 0,
    taxes: 0,
    inspection: 0,
    appraisal: 0,
    hoa: 0,
    bankCharges: 0,
    legal: 0,
  },
  units: [blankUnit(), blankUnit(), blankUnit(), blankUnit()],
  total: 0,
});

/**
 * Per-month income seeds.
 * Jan = collected; Feb–Dec = same 4-door template (blank until detail is entered).
 */
export const AVENUE_Q_2026_MONTH_INCOME: Record<number, AvenueQMonthIncome> = {
  1: {
    doors: [1800, 1500, 1319, 1100],
    otherIncome: 0,
    vacancy: 2819,
    gross: 5719,
    tei: 2900,
  },
  2: blankMonthIncome(),
  3: blankMonthIncome(),
  4: blankMonthIncome(),
  5: blankMonthIncome(),
  6: blankMonthIncome(),
  7: blankMonthIncome(),
  8: blankMonthIncome(),
  9: blankMonthIncome(),
  10: blankMonthIncome(),
  11: blankMonthIncome(),
  12: blankMonthIncome(),
};

/**
 * Per-month OpEx seeds — identical structure every month:
 * General (insurance, taxes, inspection, appraisal, hoa, bank, legal)
 * + Unit A–D (PM, repairs, advertising, cleaning, survey, supplies, elec, water, internet, insurance, taxes)
 * Jan = collected; Feb–Dec = blank template.
 */
export const AVENUE_Q_2026_MONTH_OPEX: Record<number, AvenueQMonthOpex> = {
  1: {
    general: {
      insurance: 0,
      taxes: 0,
      inspection: 100,
      appraisal: 100,
      hoa: 0,
      bankCharges: 0,
      legal: 0,
    },
    units: [
      { ...blankUnit(), electricity: 148.92, water: 434.36, total: 583.28 },
      { ...blankUnit(), electricity: 220.09, water: 148.92, total: 369.01 },
      { ...blankUnit(), electricity: 73.36, water: 49.64, internet: 65.33, total: 188.33 },
      { ...blankUnit(), pmFees: 30, electricity: 73.36, water: 49.64, total: 153 },
    ],
    total: 1493.62,
  },
  2: blankMonthOpex(),
  3: blankMonthOpex(),
  4: blankMonthOpex(),
  5: blankMonthOpex(),
  6: blankMonthOpex(),
  7: blankMonthOpex(),
  8: blankMonthOpex(),
  9: blankMonthOpex(),
  10: blankMonthOpex(),
  11: blankMonthOpex(),
  12: blankMonthOpex(),
};

/** Mortgage interest default for every month (Jan sheet; same loan). */
export const AVENUE_Q_2026_MONTH_INTEREST: Record<number, number> = {
  1: 2556.26,
  2: 2556.26,
  3: 2556.26,
  4: 2556.26,
  5: 2556.26,
  6: 2556.26,
  7: 2556.26,
  8: 2556.26,
  9: 2556.26,
  10: 2556.26,
  11: 2556.26,
  12: 2556.26,
};

/** Income lines: 4 doors + other + vacancy (no single gross_rent — doors sum into TEI). */
export const AVENUE_Q_INCOME_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'door_1', label: 'Door 1 (Unit A)', accent: true },
  { key: 'door_2', label: 'Door 2 (Eado Escape)', accent: true },
  { key: 'door_3', label: 'Door 3', accent: true },
  { key: 'door_4', label: 'Door 4 (Eado Studio)', accent: true },
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

const UNIT_FIELD: Record<(typeof UNIT_OPEX_KEYS)[number], keyof AvenueQUnitOpex> = {
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

/** General + per-unit OpEx line defs (building rollup = sum of all). */
export const AVENUE_Q_OPEX_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'gen_insurance', label: 'Insurance (General)', accent: true },
  { key: 'gen_taxes', label: 'Taxes (General)', accent: true },
  { key: 'inspection', label: 'Inspection' },
  { key: 'appraisal', label: 'Appraisal' },
  { key: 'hoa', label: 'HOA Fees' },
  { key: 'bank_charges', label: 'Bank Charges' },
  { key: 'legal', label: 'Legal & Professional Fees' },
  ...AVENUE_Q_UNITS.flatMap((u) =>
    UNIT_OPEX_KEYS.map((k) => ({
      key: `${k}_door_${u.door}`,
      label: `${UNIT_OPEX_LABELS[k]} — ${u.label}`,
      accent: k === 'insurance' || k === 'taxes' || k === 'electricity' || k === 'water' || k === 'internet',
    })),
  ),
];

export function avenueQDefaultIncomeLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (AVENUE_Q_2026_MONTH_INCOME[month] ?? blankMonthIncome())
    : undefined;
  return AVENUE_Q_INCOME_LINE_DEFS.map((def) => {
    let amount = 0;
    if (seed) {
      if (def.key === 'door_1') amount = seed.doors[0];
      else if (def.key === 'door_2') amount = seed.doors[1];
      else if (def.key === 'door_3') amount = seed.doors[2];
      else if (def.key === 'door_4') amount = seed.doors[3];
      else if (def.key === 'other_income') amount = seed.otherIncome;
      else if (def.key === 'vacancy') amount = seed.vacancy;
    }
    return { ...def, amount };
  });
}

export function avenueQDefaultOpexLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (AVENUE_Q_2026_MONTH_OPEX[month] ?? blankMonthOpex())
    : undefined;
  return AVENUE_Q_OPEX_LINE_DEFS.map((def) => {
    let amount = 0;
    if (seed) {
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
    }
    return { ...def, amount, accent: def.accent };
  });
}

export function avenueQDefaultFinancingLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const interest = useSheetDefaults
    ? (AVENUE_Q_2026_MONTH_INTEREST[month] ?? DEFAULT_MORTGAGE_INTEREST)
    : 0;
  return [
    { key: 'mortgage_interest', label: 'Mortgage Interest', amount: interest },
    { key: 'principal_repayment', label: 'Principal Repayment (non-expense)', amount: 0 },
  ];
}

export function mergeAvenueQIncomeLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = avenueQDefaultIncomeLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

export function mergeAvenueQOpexLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = avenueQDefaultOpexLinesForMonth(month, useSheetDefaults);
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

export function mergeAvenueQFinancingLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = avenueQDefaultFinancingLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

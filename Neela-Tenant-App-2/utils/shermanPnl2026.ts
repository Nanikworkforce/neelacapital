/**
 * Sherman St Excel P&L — 2026.
 * 6-plex: Unit 1–6 (Unit 2 = Urban Nesting).
 *
 * One PropertyMonthInput row per month (unitLabel "Door 1") with multi-door
 * income/OpEx line keys. TEI = sum(doors) + other − vacancy.
 * OpEx = sum(all general + unit lines). NOI = TEI − OpEx.
 *
 * Jan = collected detail; Feb–Dec = same 6-plex template (blank amounts).
 */

import type { MonthlyPnlRow, MonthOverviewInputs, PnlLine } from './bellaJessPnl2026';

/** Canonical doors for Sherman sheet income / unit OpEx. */
export const SHERMAN_UNITS = [
  { door: 1, label: 'Unit 1', sheetLabel: 'Door 1' },
  { door: 2, label: 'Unit 2 (Urban Nesting)', sheetLabel: 'Door 2' },
  { door: 3, label: 'Unit 3', sheetLabel: 'Door 3' },
  { door: 4, label: 'Unit 4', sheetLabel: 'Door 4' },
  { door: 5, label: 'Unit 5', sheetLabel: 'Door 5' },
  { door: 6, label: 'Unit 6', sheetLabel: 'Door 6' },
] as const;

/**
 * Corrected Jan–Dec 2026 yearly overview (screenshot).
 * Income blank all months → $0. NOI = 0 − OpEx.
 */
export const SHERMAN_2026_YEARLY: MonthlyPnlRow[] = [
  { month: 1, income: 0, expenses: 3657.57, net: -3657.57 },
  { month: 2, income: 0, expenses: 310.92, net: -310.92 },
  { month: 3, income: 0, expenses: 3250.92, net: -3250.92 },
  { month: 4, income: 0, expenses: 285.36, net: -285.36 },
  { month: 5, income: 0, expenses: 343.05, net: -343.05 },
  { month: 6, income: 0, expenses: 2296.14, net: -2296.14 },
  { month: 7, income: 0, expenses: 141.08, net: -141.08 },
  { month: 8, income: 0, expenses: 60, net: -60 },
  { month: 9, income: 0, expenses: 60, net: -60 },
  { month: 10, income: 0, expenses: 60, net: -60 },
  { month: 11, income: 0, expenses: 60, net: -60 },
  { month: 12, income: 0, expenses: 60, net: -60 },
];

export const SHERMAN_2026_YEAR_TOTAL = {
  income: 0,
  expenses: 10585.04,
  net: -10585.04,
};

/** Property overview from Jan-26 (cash purchase). Land TBD. */
export const SHERMAN_OVERVIEW: Required<
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
  purchasePrice: 205000,
  downPayment: 205000,
  closingCost: 5257,
  loanAmount: 0,
  interestRate: 0,
  monthlyMortgagePayment: 0,
  landValue: 0,
  depreciationYears: 27.5,
};

export const isShermanName = (name: string) => /sherman/i.test(name || '');

/** Cash deal — mortgage interest $0 every month. */
const DEFAULT_MORTGAGE_INTEREST = 0;

export type ShermanMonthIncome = {
  doors: [number, number, number, number, number, number];
  otherIncome: number;
  vacancy: number;
  gross: number;
  tei: number;
};

export type ShermanUnitOpex = {
  pmFees: number;
  repairs: number;
  propertyTaxes: number;
  advertising: number;
  cleaning: number;
  survey: number;
  strHotelOccupancy: number;
  supplies: number;
  electricity: number;
  water: number;
  internet: number;
  insurance: number;
  taxes: number;
  total: number;
};

export type ShermanMonthOpex = {
  general: {
    insurance: number;
    taxes: number;
    inspection: number;
    appraisal: number;
    hoa: number;
    bankCharges: number;
    legal: number;
  };
  units: [
    ShermanUnitOpex,
    ShermanUnitOpex,
    ShermanUnitOpex,
    ShermanUnitOpex,
    ShermanUnitOpex,
    ShermanUnitOpex,
  ];
  total: number;
};

export type ShermanMonthFinancing = {
  mortgageInterest: number;
  principalRepayment: number;
  noi: number;
  landValue: number;
  cashFlowBeforeTax: number;
  depreciation: number;
  netProfit: number;
  capRate: number;
  cashOnCash: number;
};

const blankIncome = (): ShermanMonthIncome => ({
  doors: [0, 0, 0, 0, 0, 0],
  otherIncome: 0,
  vacancy: 0,
  gross: 0,
  tei: 0,
});

const blankUnit = (): ShermanUnitOpex => ({
  pmFees: 0,
  repairs: 0,
  propertyTaxes: 0,
  advertising: 0,
  cleaning: 0,
  survey: 0,
  strHotelOccupancy: 0,
  supplies: 0,
  electricity: 0,
  water: 0,
  internet: 0,
  insurance: 0,
  taxes: 0,
  total: 0,
});

/** Empty 6-plex OpEx shell — same lines as January. */
const blankMonthOpex = (): ShermanMonthOpex => ({
  general: {
    insurance: 0,
    taxes: 0,
    inspection: 0,
    appraisal: 0,
    hoa: 0,
    bankCharges: 0,
    legal: 0,
  },
  units: [blankUnit(), blankUnit(), blankUnit(), blankUnit(), blankUnit(), blankUnit()],
  total: 0,
});

/**
 * Per-month income — identical 6-door template every month.
 * Jan–Dec blank on sheet (TEI $0); structure ready to edit.
 */
export const SHERMAN_2026_MONTH_INCOME: Record<number, ShermanMonthIncome> = {
  1: blankIncome(),
  2: blankIncome(),
  3: blankIncome(),
  4: blankIncome(),
  5: blankIncome(),
  6: blankIncome(),
  7: blankIncome(),
  8: blankIncome(),
  9: blankIncome(),
  10: blankIncome(),
  11: blankIncome(),
  12: blankIncome(),
};

/**
 * Per-month OpEx — identical structure every month:
 * General + Units 1–6 (PM, repairs, property taxes, advertising, cleaning,
 * survey, STR hotel occupancy, supplies, elec, water, internet, insurance, taxes).
 * Jan = collected; Feb–Dec = blank template.
 */
export const SHERMAN_2026_MONTH_OPEX: Record<number, ShermanMonthOpex> = {
  1: {
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
      { ...blankUnit(), pmFees: 30, water: 167.32, total: 197.32 },
      {
        ...blankUnit(),
        pmFees: 40,
        cleaning: 60,
        strHotelOccupancy: 250,
        total: 350,
      },
      { ...blankUnit(), repairs: 3000, total: 3000 },
      { ...blankUnit(), pmFees: 30, total: 30 },
      { ...blankUnit(), internet: 50.25, total: 50.25 },
      { ...blankUnit(), pmFees: 30, total: 30 },
    ],
    total: 3657.57,
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

/** Mortgage interest — $0 all months (cash purchase). */
export const SHERMAN_2026_MONTH_INTEREST: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
};

/** Jan Financing locked; other months use $0 interest template. */
export const SHERMAN_2026_MONTH_FINANCING: Partial<Record<number, ShermanMonthFinancing>> = {
  1: {
    mortgageInterest: 0,
    principalRepayment: 0,
    noi: -3657.57,
    landValue: 0,
    cashFlowBeforeTax: -3657.57,
    depreciation: 621.21,
    netProfit: -4278.78,
    capRate: -3657.57 / 205000,
    cashOnCash: -3657.57 / 205000,
  },
};

/** Income lines: 6 doors + other + vacancy. */
export const SHERMAN_INCOME_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'door_1', label: 'Door 1 (Unit 1)', accent: true },
  { key: 'door_2', label: 'Door 2 (Urban Nesting)', accent: true },
  { key: 'door_3', label: 'Door 3', accent: true },
  { key: 'door_4', label: 'Door 4', accent: true },
  { key: 'door_5', label: 'Door 5', accent: true },
  { key: 'door_6', label: 'Door 6', accent: true },
  { key: 'other_income', label: 'Other Income (Late Fees, Pet Fees, Laundry)' },
  { key: 'vacancy', label: 'Vacancy' },
];

const UNIT_OPEX_KEYS = [
  'pm_fees',
  'repairs',
  'property_taxes',
  'advertising',
  'cleaning',
  'survey',
  'str_hotel',
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
  property_taxes: 'Property Taxes',
  advertising: 'Advertising / Leasing',
  cleaning: 'Cleaning Fees',
  survey: 'Survey',
  str_hotel: 'STR (Hotel Occupancy)',
  supplies: 'Supplies & Materials',
  electricity: 'Electricity',
  water: 'Water',
  internet: 'Internet',
  insurance: 'Insurance',
  taxes: 'Taxes',
};

const UNIT_FIELD: Record<(typeof UNIT_OPEX_KEYS)[number], keyof ShermanUnitOpex> = {
  pm_fees: 'pmFees',
  repairs: 'repairs',
  property_taxes: 'propertyTaxes',
  advertising: 'advertising',
  cleaning: 'cleaning',
  survey: 'survey',
  str_hotel: 'strHotelOccupancy',
  supplies: 'supplies',
  electricity: 'electricity',
  water: 'water',
  internet: 'internet',
  insurance: 'insurance',
  taxes: 'taxes',
};

/** General + per-unit OpEx line defs (6 units). */
export const SHERMAN_OPEX_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'gen_insurance', label: 'Insurance (General)', accent: true },
  { key: 'gen_taxes', label: 'Taxes (General)', accent: true },
  { key: 'inspection', label: 'Inspection' },
  { key: 'appraisal', label: 'Appraisal' },
  { key: 'hoa', label: 'HOA Fees' },
  { key: 'bank_charges', label: 'Bank Charges' },
  { key: 'legal', label: 'Legal & Professional Fees' },
  ...SHERMAN_UNITS.flatMap((u) =>
    UNIT_OPEX_KEYS.map((k) => ({
      key: `${k}_door_${u.door}`,
      label: `${UNIT_OPEX_LABELS[k]} — ${u.label}`,
      accent:
        k === 'insurance' ||
        k === 'taxes' ||
        k === 'electricity' ||
        k === 'water' ||
        k === 'internet' ||
        k === 'str_hotel',
    })),
  ),
];

export function shermanDefaultIncomeLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (SHERMAN_2026_MONTH_INCOME[month] ?? blankIncome())
    : undefined;
  return SHERMAN_INCOME_LINE_DEFS.map((def) => {
    let amount = 0;
    if (seed) {
      if (def.key === 'door_1') amount = seed.doors[0];
      else if (def.key === 'door_2') amount = seed.doors[1];
      else if (def.key === 'door_3') amount = seed.doors[2];
      else if (def.key === 'door_4') amount = seed.doors[3];
      else if (def.key === 'door_5') amount = seed.doors[4];
      else if (def.key === 'door_6') amount = seed.doors[5];
      else if (def.key === 'other_income') amount = seed.otherIncome;
      else if (def.key === 'vacancy') amount = seed.vacancy;
    }
    return { ...def, amount };
  });
}

export function shermanDefaultOpexLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (SHERMAN_2026_MONTH_OPEX[month] ?? blankMonthOpex())
    : undefined;
  return SHERMAN_OPEX_LINE_DEFS.map((def) => {
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

export function shermanDefaultFinancingLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const interest = useSheetDefaults
    ? (SHERMAN_2026_MONTH_INTEREST[month] ?? DEFAULT_MORTGAGE_INTEREST)
    : 0;
  return [
    { key: 'mortgage_interest', label: 'Mortgage Interest', amount: interest },
    { key: 'principal_repayment', label: 'Principal Repayment (non-expense)', amount: 0 },
  ];
}

export function mergeShermanIncomeLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = shermanDefaultIncomeLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

export function mergeShermanOpexLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = shermanDefaultOpexLinesForMonth(month, useSheetDefaults);
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

export function mergeShermanFinancingLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = shermanDefaultFinancingLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

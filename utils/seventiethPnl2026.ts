/**
 * 70th Street Excel P&L — 2026.
 * 4-plex: Unit 1–4. Seller finance via David Hesham.
 *
 * One PropertyMonthInput row per month (unitLabel "Door 1") with multi-door
 * income/OpEx line keys. TEI = sum(doors) + other − vacancy.
 * OpEx = sum(all general + unit lines). NOI = TEI − OpEx.
 *
 * Jan = collected detail; Feb–Dec = same 4-plex template (blank amounts).
 * Yearly overview still holds month TEI/OpEx until a month is saved.
 */

import type { MonthlyPnlRow, MonthOverviewInputs, PnlLine } from './bellaJessPnl2026';

export const SEVENTIETH_UNITS = [
  { door: 1, label: 'Unit 1', sheetLabel: 'Door 1' },
  { door: 2, label: 'Unit 2', sheetLabel: 'Door 2' },
  { door: 3, label: 'Unit 3', sheetLabel: 'Door 3' },
  { door: 4, label: 'Unit 4', sheetLabel: 'Door 4' },
] as const;

export const SEVENTIETH_2026_YEARLY: MonthlyPnlRow[] = [
  { month: 1, income: 0, expenses: 30, net: -30 },
  { month: 2, income: 850, expenses: 30, net: 820 },
  { month: 3, income: 850, expenses: 30, net: 820 },
  { month: 4, income: 850, expenses: 30, net: 820 },
  { month: 5, income: 850, expenses: 30, net: 820 },
  { month: 6, income: 850, expenses: 30, net: 820 },
  { month: 7, income: 850, expenses: 30, net: 820 },
  { month: 8, income: 850, expenses: 30, net: 820 },
  { month: 9, income: 0, expenses: 30, net: -30 },
  { month: 10, income: 850, expenses: 30, net: 820 },
  { month: 11, income: 850, expenses: 30, net: 820 },
  { month: 12, income: 850, expenses: 30, net: 820 },
];

export const SEVENTIETH_2026_YEAR_TOTAL = {
  income: 8500,
  expenses: 360,
  net: 8140,
};

export const SEVENTIETH_OVERVIEW: Required<
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
> & { sellerFinanceNote: string } = {
  purchasePrice: 274000,
  downPayment: 30000,
  closingCost: 0,
  loanAmount: 274000,
  interestRate: 0.09,
  monthlyMortgagePayment: 3192,
  landValue: 0,
  depreciationYears: 27.5,
  sellerFinanceNote: 'Seller Finance Via David Hesham',
};

export const isSeventiethName = (name: string) => /70th/i.test(name || '');

/** Jan sheet left interest blank; keep $0 default until month detail fills it. */
const DEFAULT_MORTGAGE_INTEREST = 0;

export type SeventiethMonthIncome = {
  doors: [number, number, number, number];
  otherIncome: number;
  vacancy: number;
  gross: number;
  tei: number;
};

export type SeventiethUnitOpex = {
  pmFees: number;
  repairs: number;
  propertyTaxes: number;
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

export type SeventiethMonthOpex = {
  general: {
    insurance: number;
    taxes: number;
    inspection: number;
    appraisal: number;
    hoa: number;
    bankCharges: number;
    legal: number;
  };
  units: [SeventiethUnitOpex, SeventiethUnitOpex, SeventiethUnitOpex, SeventiethUnitOpex];
  total: number;
};

export type SeventiethMonthFinancing = {
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

const blankIncome = (): SeventiethMonthIncome => ({
  doors: [0, 0, 0, 0],
  otherIncome: 0,
  vacancy: 0,
  gross: 0,
  tei: 0,
});

const blankUnit = (): SeventiethUnitOpex => ({
  pmFees: 0,
  repairs: 0,
  propertyTaxes: 0,
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

const blankMonthOpex = (): SeventiethMonthOpex => ({
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

/** Identical 4-door income template every month. */
export const SEVENTIETH_2026_MONTH_INCOME: Record<number, SeventiethMonthIncome> = {
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
 * OpEx template every month: General + Units 1–4.
 * Jan = collected (Unit 4 PM $30); Feb–Dec = blank shell.
 */
export const SEVENTIETH_2026_MONTH_OPEX: Record<number, SeventiethMonthOpex> = {
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
      blankUnit(),
      blankUnit(),
      blankUnit(),
      { ...blankUnit(), pmFees: 30, total: 30 },
    ],
    total: 30,
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

export const SEVENTIETH_2026_MONTH_INTEREST: Record<number, number> = {
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

export const SEVENTIETH_2026_MONTH_FINANCING: Partial<Record<number, SeventiethMonthFinancing>> = {
  1: {
    mortgageInterest: 0,
    principalRepayment: 0,
    noi: -30,
    landValue: 0,
    cashFlowBeforeTax: -30,
    depreciation: 830.3,
    netProfit: -860.3,
    capRate: -30 / 274000,
    cashOnCash: -30 / 30000,
  },
};

export const SEVENTIETH_INCOME_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
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
  'property_taxes',
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
  property_taxes: 'Property Taxes',
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

const UNIT_FIELD: Record<(typeof UNIT_OPEX_KEYS)[number], keyof SeventiethUnitOpex> = {
  pm_fees: 'pmFees',
  repairs: 'repairs',
  property_taxes: 'propertyTaxes',
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

export const SEVENTIETH_OPEX_LINE_DEFS: Omit<PnlLine, 'amount'>[] = [
  { key: 'gen_insurance', label: 'Insurance (General)', accent: true },
  { key: 'gen_taxes', label: 'Taxes (General)', accent: true },
  { key: 'inspection', label: 'Inspection' },
  { key: 'appraisal', label: 'Appraisal' },
  { key: 'hoa', label: 'HOA Fees' },
  { key: 'bank_charges', label: 'Bank Charges' },
  { key: 'legal', label: 'Legal & Professional Fees' },
  ...SEVENTIETH_UNITS.flatMap((u) =>
    UNIT_OPEX_KEYS.map((k) => ({
      key: `${k}_door_${u.door}`,
      label: `${UNIT_OPEX_LABELS[k]} — ${u.label}`,
      accent:
        k === 'insurance' ||
        k === 'taxes' ||
        k === 'electricity' ||
        k === 'water' ||
        k === 'internet',
    })),
  ),
];

export function seventiethDefaultIncomeLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (SEVENTIETH_2026_MONTH_INCOME[month] ?? blankIncome())
    : undefined;
  return SEVENTIETH_INCOME_LINE_DEFS.map((def) => {
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

export function seventiethDefaultOpexLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const seed = useSheetDefaults
    ? (SEVENTIETH_2026_MONTH_OPEX[month] ?? blankMonthOpex())
    : undefined;
  return SEVENTIETH_OPEX_LINE_DEFS.map((def) => {
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

export function seventiethDefaultFinancingLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const interest = useSheetDefaults
    ? (SEVENTIETH_2026_MONTH_INTEREST[month] ?? DEFAULT_MORTGAGE_INTEREST)
    : 0;
  return [
    { key: 'mortgage_interest', label: 'Mortgage Interest', amount: interest },
    { key: 'principal_repayment', label: 'Principal Repayment (non-expense)', amount: 0 },
  ];
}

export function mergeSeventiethIncomeLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = seventiethDefaultIncomeLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

export function mergeSeventiethOpexLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = seventiethDefaultOpexLinesForMonth(month, useSheetDefaults);
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

export function mergeSeventiethFinancingLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = seventiethDefaultFinancingLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

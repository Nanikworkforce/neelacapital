/** Conroe Excel P&L — 2026 corrected totals + month line seeds. */

import type { MonthlyPnlRow, PnlLine } from './bellaJessPnl2026';
import {
  INCOME_LINE_DEFS,
  OPEX_LINE_DEFS,
  type MonthOverviewInputs,
} from './bellaJessPnl2026';

/**
 * Corrected Jan–Dec 2026 (TEI / OpEx / NOI).
 * TEI = $0 all months (no rent entered; vacant).
 * Jan–Apr: blank on sheet → $0 (unlike Tomball’s util lines).
 * May/Jun: line sums (sheet totals were +$39.27 / +$29.27 util double-count).
 * Oct: $1,980.85 (yearly left column wrongly showed Sep’s $1,627.50).
 */
export const CONROE_2026_YEARLY: MonthlyPnlRow[] = [
  { month: 1, income: 0, expenses: 0, net: 0 },
  { month: 2, income: 0, expenses: 0, net: 0 },
  { month: 3, income: 0, expenses: 0, net: 0 },
  { month: 4, income: 0, expenses: 0, net: 0 },
  { month: 5, income: 0, expenses: 7721.27, net: -7721.27 },
  { month: 6, income: 0, expenses: 2097.08, net: -2097.08 },
  { month: 7, income: 0, expenses: 1449.02, net: -1449.02 },
  { month: 8, income: 0, expenses: 1705.47, net: -1705.47 },
  { month: 9, income: 0, expenses: 1627.5, net: -1627.5 },
  { month: 10, income: 0, expenses: 1980.85, net: -1980.85 },
  { month: 11, income: 0, expenses: 2128.85, net: -2128.85 },
  { month: 12, income: 0, expenses: 1262.31, net: -1262.31 },
];

export const CONROE_2026_YEAR_TOTAL = {
  income: 0,
  expenses: 19972.35,
  net: -19972.35,
};

type MonthSeed = {
  gross: number;
  vacancy: number;
  opex: Partial<Record<string, number>>;
  mortgageInterest: number;
};

/** Collected 2026 month inputs (corrected — utilities counted once via elec+water). */
export const CONROE_2026_MONTH_SEEDS: Record<number, MonthSeed> = {
  1: { gross: 0, vacancy: 0, opex: {}, mortgageInterest: 0 },
  2: { gross: 0, vacancy: 0, opex: {}, mortgageInterest: 0 },
  3: { gross: 0, vacancy: 0, opex: {}, mortgageInterest: 0 },
  4: { gross: 0, vacancy: 0, opex: {}, mortgageInterest: 0 },
  5: {
    gross: 0,
    vacancy: 0,
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
      electricity: 149,
      water: 80,
    },
    mortgageInterest: 1232.5,
  },
  6: {
    gross: 0,
    vacancy: 0,
    opex: {
      pm_fees: 100,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 1000,
      transportation: 90.85,
      supplies: 200,
      electricity: 11.23,
      water: 20,
    },
    mortgageInterest: 1232.5,
  },
  7: {
    gross: 0,
    vacancy: 0,
    opex: {
      pm_fees: 100,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 250,
      transportation: 90.85,
      supplies: 200,
      electricity: 83.17,
      water: 50,
    },
    mortgageInterest: 1232.5,
  },
  8: {
    gross: 0,
    vacancy: 0,
    opex: {
      pm_fees: 100,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 250,
      transportation: 242.27,
      supplies: 200,
      electricity: 108.2,
      water: 130,
    },
    mortgageInterest: 1232.5,
  },
  9: {
    gross: 0,
    vacancy: 0,
    opex: {
      pm_fees: 100,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 250,
      transportation: 242.27,
      supplies: 200,
      electricity: 118.66,
      water: 41.57,
    },
    mortgageInterest: 1232.5,
  },
  10: {
    gross: 0,
    vacancy: 0,
    opex: {
      pm_fees: 100,
      repairs: 500,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 150,
      transportation: 242.27,
      supplies: 200,
      electricity: 19.22,
      water: 94.36,
    },
    mortgageInterest: 1232.5,
  },
  11: {
    gross: 0,
    vacancy: 0,
    opex: {
      pm_fees: 100,
      repairs: 650,
      property_taxes: 453.67,
      insurance: 183.83,
      hoa: 37.5,
      advertising: 150,
      transportation: 242.27,
      supplies: 150,
      electricity: 17.22,
      water: 144.36,
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
      electricity: 17.53,
      water: 104.64,
    },
    mortgageInterest: 1232.5,
  },
};

/** Conroe overview — purchase/down/P&I blank on sheet; land from May+. */
export const CONROE_OVERVIEW: Required<
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
  purchasePrice: 0,
  downPayment: 0,
  closingCost: 0,
  landValue: 49500,
  depreciationYears: 27.5,
  loanAmount: 0,
  interestRate: 0,
  monthlyMortgagePayment: 0,
};

export function conroeDefaultIncomeLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  if (!useSheetDefaults) {
    return INCOME_LINE_DEFS.map((def) => ({ ...def, amount: 0 }));
  }
  const seed = CONROE_2026_MONTH_SEEDS[month];
  return INCOME_LINE_DEFS.map((def) => {
    let amount = 0;
    if (seed) {
      if (def.key === 'gross_rent') amount = seed.gross;
      else if (def.key === 'vacancy') amount = seed.vacancy;
    }
    return { ...def, amount };
  });
}

export function conroeDefaultOpexLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  if (!useSheetDefaults) {
    return OPEX_LINE_DEFS.map((def) => ({ ...def, amount: 0, accent: def.accent }));
  }
  const amounts = CONROE_2026_MONTH_SEEDS[month]?.opex ?? {};
  return OPEX_LINE_DEFS.map((def) => ({
    ...def,
    amount: amounts[def.key] ?? 0,
    accent: def.accent,
  }));
}

export function conroeDefaultFinancingLinesForMonth(month: number, useSheetDefaults = true): PnlLine[] {
  const interest =
    useSheetDefaults && CONROE_2026_MONTH_SEEDS[month]
      ? CONROE_2026_MONTH_SEEDS[month].mortgageInterest
      : 0;
  return [
    { key: 'mortgage_interest', label: 'Mortgage Interest', amount: interest },
    { key: 'principal_repayment', label: 'Principal Repayment (non-expense)', amount: 0 },
  ];
}

export function mergeConroeIncomeLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = conroeDefaultIncomeLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

export function mergeConroeOpexLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = conroeDefaultOpexLinesForMonth(month, useSheetDefaults);
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

export function mergeConroeFinancingLines(
  saved?: Partial<PnlLine>[] | null,
  month = 1,
  useSheetDefaults = true,
): PnlLine[] {
  const defaults = conroeDefaultFinancingLinesForMonth(month, useSheetDefaults);
  const byKey = new Map((saved || []).map((l) => [l.key || l.label, l]));
  return defaults.map((def) => {
    const hit = byKey.get(def.key) || byKey.get(def.label);
    return {
      ...def,
      amount: hit?.amount != null ? Number(hit.amount) || 0 : def.amount,
    };
  });
}

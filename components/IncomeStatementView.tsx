import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  TrendingUp, ChevronDown, ChevronUp,
  Home, Sparkles, Plus, Bell, CheckCircle2, X,
} from 'lucide-react';
import { api } from '../services/api';
import { IncomeStatementSummary, OperatingExpense, Property } from '../types';
import {
  CATEGORY_LABELS,
  groupIncomeStatementProperties,
  type GroupedPropertyRow,
} from '../utils/propertyGrouping';
import AddExpenseModal from './AddExpenseModal';
import ViewportPortal from './ViewportPortal';
import { usePollWhileVisible } from '../hooks/usePollWhileVisible';
import {
  BELLA_JESS_2026_YEARLY,
  BELLA_JESS_OVERVIEW,
  applyMonthsToYearly,
  computeMonthSummary,
  mergeFinancingLines,
  mergeIncomeLines,
  mergeOpexLines,
  sumYearlyRows,
} from '../utils/bellaJessPnl2026';
import {
  TOMBALL_2026_YEARLY,
  TOMBALL_OVERVIEW,
  mergeTomballFinancingLines,
  mergeTomballIncomeLines,
  mergeTomballOpexLines,
} from '../utils/tomballPnl2026';
import {
  CONROE_2026_YEARLY,
  CONROE_OVERVIEW,
  mergeConroeFinancingLines,
  mergeConroeIncomeLines,
  mergeConroeOpexLines,
} from '../utils/conroePnl2026';
import {
  AVENUE_Q_2026_YEARLY,
  AVENUE_Q_OVERVIEW,
  isAvenueQName,
  mergeAvenueQFinancingLines,
  mergeAvenueQIncomeLines,
  mergeAvenueQOpexLines,
} from '../utils/avenueQPnl2026';
import {
  SHERMAN_2026_YEARLY,
  SHERMAN_OVERVIEW,
  isShermanName,
  mergeShermanFinancingLines,
  mergeShermanIncomeLines,
  mergeShermanOpexLines,
} from '../utils/shermanPnl2026';
import {
  SEVENTIETH_2026_YEARLY,
  SEVENTIETH_OVERVIEW,
  isSeventiethName,
  mergeSeventiethFinancingLines,
  mergeSeventiethIncomeLines,
  mergeSeventiethOpexLines,
} from '../utils/seventiethPnl2026';
import {
  AVENUE_H_2026_YEARLY,
  AVENUE_H_OVERVIEW,
  isAvenueHName,
  mergeAvenueHFinancingLines,
  mergeAvenueHIncomeLines,
  mergeAvenueHOpexLines,
} from '../utils/avenueHPnl2026';
import {
  WOODING_2026_YEARLY,
  WOODING_OVERVIEW,
  isWoodingName,
  mergeWoodingFinancingLines,
  mergeWoodingIncomeLines,
  mergeWoodingOpexLines,
} from '../utils/woodingPnl2026';
import {
  AVENUE_F_2026_YEARLY,
  AVENUE_F_OVERVIEW,
  isAvenueFName,
  mergeAvenueFFinancingLines,
  mergeAvenueFIncomeLines,
  mergeAvenueFOpexLines,
} from '../utils/avenueFPnl2026';
import PropertyMonthIncomeOpexEditor, { type SheetPnlKind } from './PropertyMonthIncomeOpexEditor';

const isBellaJessName = (name: string) => /bella\s*jess/i.test(name || '');
/** Tomball sheet property — exclude Bella Jess (address may contain "Tomball"). */
const isTomballName = (name: string) =>
  /tomball|tomabll/i.test(name || '') && !isBellaJessName(name);
const isConroeName = (name: string) => /conroe/i.test(name || '');
const sheetKindForName = (name: string): SheetPnlKind | null => {
  if (isBellaJessName(name)) return 'bella';
  if (isTomballName(name)) return 'tomball';
  if (isConroeName(name)) return 'conroe';
  if (isAvenueQName(name)) return 'avenueq';
  if (isShermanName(name)) return 'sherman';
  if (isSeventiethName(name)) return 'seventieth';
  if (isAvenueHName(name)) return 'avenueh';
  if (isWoodingName(name)) return 'wooding';
  if (isAvenueFName(name)) return 'avenuef';
  return null;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  properties: Property[];
}

const formatMoney = (value: number) =>
  `$${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Excel-style signed money: negatives in parentheses. */
const formatMoneyPnL = (value: number) => {
  const n = value || 0;
  const abs = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n < 0) return `($${abs})`;
  return `$${abs}`;
};

/** Bella Jess sheet style: "$ 2,300.00" / "$ (2,300.00)" / "—" for blank zero. */
const formatSheetMoney = (value: number, blankZero = false) => {
  if (blankZero && !value) return '—';
  const abs = Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value < 0) return `$ (${abs})`;
  return `$ ${abs}`;
};

/** Positive → green, negative → red, zero → neutral. */
const moneyToneClass = (value: number) => {
  if (value > 0) return 'text-emerald-700';
  if (value < 0) return 'text-rose-700';
  return 'text-slate-700';
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function SectionSkeleton({ label }: { label: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm animate-pulse">
      <p className="text-sm text-slate-400 font-medium mb-4">{label}</p>
      <div className="space-y-3">
        <div className="h-24 rounded-xl bg-slate-100" />
        <div className="h-16 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

/** Hide raw excel-import note prefixes; show the expense label only. */
function formatExpenseNote(notes?: string): string {
  if (!notes) return '';
  if (notes.includes('@neela.local')) return '';
  const imported = notes.match(/^excel-import-\d+\|[^|]+\|\d{2}\|(.+)$/);
  if (imported) return imported[1].trim();
  return notes;
}

const FINANCING_CATEGORIES = new Set(['mortgage_interest', 'mortgage_principal', 'depreciation']);

const EXPENSE_NOTIF_WINDOW_MS = 24 * 60 * 60 * 1000;
const EXPENSE_NOTIF_DISMISSED_KEY = 'admin_expense_notif_dismissed';

function readDismissedExpenseNotifs(): Record<string, number> {
  try {
    const raw = localStorage.getItem(EXPENSE_NOTIF_DISMISSED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    const cutoff = Date.now() - EXPENSE_NOTIF_WINDOW_MS;
    const pruned: Record<string, number> = {};
    for (const [id, ts] of Object.entries(parsed)) {
      if (typeof ts === 'number' && ts >= cutoff) pruned[id] = ts;
    }
    return pruned;
  } catch {
    return {};
  }
}

function writeDismissedExpenseNotifs(map: Record<string, number>) {
  localStorage.setItem(EXPENSE_NOTIF_DISMISSED_KEY, JSON.stringify(map));
}

function expenseRecordedAt(expense: OperatingExpense): number | null {
  if (!expense.createdAt) return null;
  const t = new Date(expense.createdAt).getTime();
  return Number.isNaN(t) ? null : t;
}

function formatNotifAge(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'Earlier';
}

/** Patch P&L totals in-place so saving an expense does not blank the whole page. */
function applyExpenseDelta(
  summary: IncomeStatementSummary,
  expense: OperatingExpense,
  delta: number,
): IncomeStatementSummary {
  if (!delta) return summary;
  const d = new Date(`${expense.date}T12:00:00`);
  if (Number.isNaN(d.getTime()) || d.getFullYear() !== summary.year) return summary;

  const month = d.getMonth() + 1;
  const affectsNoi = !FINANCING_CATEGORIES.has(expense.category);
  const propertyId = expense.property || '';
  const unitId = expense.unit || '';

  const expensesByCategory = { ...summary.expensesByCategory };
  expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + delta;

  const portfolio = { ...summary.portfolio };
  let byProperty = summary.byProperty;
  let monthly = summary.monthly;

  if (affectsNoi) {
    portfolio.totalExpenses = (portfolio.totalExpenses || 0) + delta;
    portfolio.netIncome = (portfolio.netIncome || 0) - delta;

    if (propertyId) {
      byProperty = summary.byProperty.map((row) => {
        if (row.propertyId !== propertyId) return row;
        const units = row.units?.map((u) => {
          if (!unitId || u.unitId !== unitId) return u;
          return {
            ...u,
            totalExpenses: (u.totalExpenses || 0) + delta,
            netIncome: (u.netIncome || 0) - delta,
          };
        });
        return {
          ...row,
          totalExpenses: (row.totalExpenses || 0) + delta,
          netIncome: (row.netIncome || 0) - delta,
          units,
        };
      });
    }

    monthly = summary.monthly.map((m) => {
      if (m.month !== month) return m;
      return {
        ...m,
        expenses: (m.expenses || 0) + delta,
        net: (m.net || 0) - delta,
      };
    });
  }

  return {
    ...summary,
    portfolio,
    byProperty,
    monthly,
    expensesByCategory,
  };
}

/**
 * Shared expanded P&L detail for a property (overview + yearly months + month editor).
 * Used by both the mobile card list and desktop table.
 */
function resolveEditablePropertyId(row: GroupedPropertyRow, properties: Property[]): string {
  const name = row.propertyName || row.groupKey || '';
  if (isBellaJessName(name)) {
    return properties.find((p) => isBellaJessName(p.name || ''))?.id || '';
  }
  if (isTomballName(name)) {
    return properties.find((p) => isTomballName(p.name || ''))?.id || '';
  }
  if (isConroeName(name)) {
    return properties.find((p) => isConroeName(p.name || ''))?.id || '';
  }
  if (isAvenueQName(name)) {
    return properties.find((p) => isAvenueQName(p.name || ''))?.id || '';
  }
  if (isShermanName(name)) {
    return properties.find((p) => isShermanName(p.name || ''))?.id || '';
  }
  if (isSeventiethName(name)) {
    return properties.find((p) => isSeventiethName(p.name || ''))?.id || '';
  }
  if (isAvenueHName(name)) {
    return properties.find((p) => isAvenueHName(p.name || ''))?.id || '';
  }
  if (isWoodingName(name)) {
    return properties.find((p) => isWoodingName(p.name || ''))?.id || '';
  }
  if (isAvenueFName(name)) {
    return properties.find((p) => isAvenueFName(p.name || ''))?.id || '';
  }
  for (const u of row.units || []) {
    const raw = String(u.propertyId || '').replace(/^prop-/, '');
    if (raw && !raw.startsWith('catalog-') && properties.some((p) => p.id === raw)) return raw;
  }
  const byName = properties.find((p) => (p.name || '').toLowerCase() === name.toLowerCase());
  if (byName) return byName.id;
  if (properties.some((p) => p.id === row.propertyId)) return String(row.propertyId);
  return '';
}

function PropertyPnlDetail({
  row,
  year,
  isAdmin,
  properties,
  selectedMonth,
  setSelectedMonth,
  bellaMonthTotals,
  setBellaMonthTotals,
  tomballMonthTotals,
  setTomballMonthTotals,
  conroeMonthTotals,
  setConroeMonthTotals,
  avenueQMonthTotals,
  setAvenueQMonthTotals,
  shermanMonthTotals,
  setShermanMonthTotals,
  seventiethMonthTotals,
  setSeventiethMonthTotals,
  avenueHMonthTotals,
  setAvenueHMonthTotals,
  woodingMonthTotals,
  setWoodingMonthTotals,
  avenueFMonthTotals,
  setAvenueFMonthTotals,
}: {
  row: GroupedPropertyRow;
  year: number;
  isAdmin: boolean;
  properties: Property[];
  selectedMonth: number | null;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number | null>>;
  bellaMonthTotals: Partial<Record<number, { income: number; expenses: number; net: number }>>;
  setBellaMonthTotals: React.Dispatch<
    React.SetStateAction<Partial<Record<number, { income: number; expenses: number; net: number }>>>
  >;
  tomballMonthTotals: Partial<Record<number, { income: number; expenses: number; net: number }>>;
  setTomballMonthTotals: React.Dispatch<
    React.SetStateAction<Partial<Record<number, { income: number; expenses: number; net: number }>>>
  >;
  conroeMonthTotals: Partial<Record<number, { income: number; expenses: number; net: number }>>;
  setConroeMonthTotals: React.Dispatch<
    React.SetStateAction<Partial<Record<number, { income: number; expenses: number; net: number }>>>
  >;
  avenueQMonthTotals: Partial<Record<number, { income: number; expenses: number; net: number }>>;
  setAvenueQMonthTotals: React.Dispatch<
    React.SetStateAction<Partial<Record<number, { income: number; expenses: number; net: number }>>>
  >;
  shermanMonthTotals: Partial<Record<number, { income: number; expenses: number; net: number }>>;
  setShermanMonthTotals: React.Dispatch<
    React.SetStateAction<Partial<Record<number, { income: number; expenses: number; net: number }>>>
  >;
  seventiethMonthTotals: Partial<Record<number, { income: number; expenses: number; net: number }>>;
  setSeventiethMonthTotals: React.Dispatch<
    React.SetStateAction<Partial<Record<number, { income: number; expenses: number; net: number }>>>
  >;
  avenueHMonthTotals: Partial<Record<number, { income: number; expenses: number; net: number }>>;
  setAvenueHMonthTotals: React.Dispatch<
    React.SetStateAction<Partial<Record<number, { income: number; expenses: number; net: number }>>>
  >;
  woodingMonthTotals: Partial<Record<number, { income: number; expenses: number; net: number }>>;
  setWoodingMonthTotals: React.Dispatch<
    React.SetStateAction<Partial<Record<number, { income: number; expenses: number; net: number }>>>
  >;
  avenueFMonthTotals: Partial<Record<number, { income: number; expenses: number; net: number }>>;
  setAvenueFMonthTotals: React.Dispatch<
    React.SetStateAction<Partial<Record<number, { income: number; expenses: number; net: number }>>>
  >;
}) {
  const name = row.propertyName || row.groupKey || '';
  const sheetKind = sheetKindForName(name);
  const useSheet = !!sheetKind && year === 2026;
  const sheetYearly =
    sheetKind === 'avenuef'
      ? AVENUE_F_2026_YEARLY
      : sheetKind === 'wooding'
        ? WOODING_2026_YEARLY
        : sheetKind === 'avenueh'
          ? AVENUE_H_2026_YEARLY
          : sheetKind === 'seventieth'
            ? SEVENTIETH_2026_YEARLY
            : sheetKind === 'sherman'
              ? SHERMAN_2026_YEARLY
              : sheetKind === 'avenueq'
                ? AVENUE_Q_2026_YEARLY
                : sheetKind === 'conroe'
                  ? CONROE_2026_YEARLY
                  : sheetKind === 'tomball'
                    ? TOMBALL_2026_YEARLY
                    : BELLA_JESS_2026_YEARLY;
  const sheetMonthTotals =
    sheetKind === 'avenuef'
      ? avenueFMonthTotals
      : sheetKind === 'wooding'
        ? woodingMonthTotals
        : sheetKind === 'avenueh'
          ? avenueHMonthTotals
          : sheetKind === 'seventieth'
            ? seventiethMonthTotals
            : sheetKind === 'sherman'
              ? shermanMonthTotals
              : sheetKind === 'avenueq'
                ? avenueQMonthTotals
                : sheetKind === 'conroe'
                  ? conroeMonthTotals
                  : sheetKind === 'tomball'
                    ? tomballMonthTotals
                    : bellaMonthTotals;
  const monthRows = useSheet
    ? applyMonthsToYearly(sheetYearly, sheetMonthTotals)
    : MONTHS.map((_, i) => {
        const m = row.monthly?.find((x) => x.month === i + 1);
        const income = m?.income ?? 0;
        const expenses = m?.expenses ?? 0;
        return { month: i + 1, income, expenses, net: m?.net ?? income - expenses };
      });
  const yearSum = useSheet ? sumYearlyRows(monthRows) : null;
  const yInc = useSheet ? yearSum!.income : row.totalIncome;
  const yExp = useSheet ? yearSum!.expenses : row.totalExpenses;
  const yNet = useSheet ? yearSum!.net : row.netIncome;

  const fin = row.financials;
  const propertyId = resolveEditablePropertyId(row, properties);
  const ovDefaults =
    sheetKind === 'avenuef'
      ? AVENUE_F_OVERVIEW
      : sheetKind === 'wooding'
        ? WOODING_OVERVIEW
        : sheetKind === 'avenueh'
          ? AVENUE_H_OVERVIEW
          : sheetKind === 'seventieth'
            ? SEVENTIETH_OVERVIEW
            : sheetKind === 'sherman'
              ? SHERMAN_OVERVIEW
              : sheetKind === 'avenueq'
                ? AVENUE_Q_OVERVIEW
                : sheetKind === 'conroe'
                  ? CONROE_OVERVIEW
                  : sheetKind === 'tomball'
                    ? TOMBALL_OVERVIEW
                    : sheetKind === 'bella'
                      ? BELLA_JESS_OVERVIEW
                      : null;

  const [ovPurchase, setOvPurchase] = useState(String(fin?.purchasePrice ?? ovDefaults?.purchasePrice ?? 0));
  const [ovDown, setOvDown] = useState(String(fin?.downPayment ?? ovDefaults?.downPayment ?? 0));
  const [ovClosing, setOvClosing] = useState(String(fin?.closingCost ?? ovDefaults?.closingCost ?? 0));
  const [ovLoan, setOvLoan] = useState(String(fin?.loanAmount ?? ovDefaults?.loanAmount ?? 0));
  const [ovRatePct, setOvRatePct] = useState(() => {
    const rate = fin?.interestRate ?? ovDefaults?.interestRate ?? 0;
    return String(rate <= 1 && rate > 0 ? rate * 100 : rate);
  });
  const [ovTerm, setOvTerm] = useState(String(fin?.loanTermYears ?? 30));
  const [ovPi, setOvPi] = useState(String(fin?.monthlyMortgagePayment ?? ovDefaults?.monthlyMortgagePayment ?? 0));
  const [ovLand, setOvLand] = useState(String(fin?.landValue ?? ovDefaults?.landValue ?? 0));
  const [ovDepYears, setOvDepYears] = useState(
    String(fin?.annualDepreciationYears ?? ovDefaults?.depreciationYears ?? 27.5),
  );
  const [ovSaving, setOvSaving] = useState(false);
  const [ovStatus, setOvStatus] = useState<string | null>(null);
  const [ovError, setOvError] = useState<string | null>(null);
  const monthSaveRef = useRef<(() => Promise<void>) | null>(null);
  const [monthSaving, setMonthSaving] = useState(false);

  const num = (raw: string) => {
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const rateFraction = (() => {
    const pct = num(ovRatePct);
    return pct > 1 ? pct / 100 : pct;
  })();

  const overview = {
    purchasePrice: num(ovPurchase),
    downPayment: num(ovDown),
    closingCost: num(ovClosing),
    landValue: num(ovLand),
    depreciationYears: num(ovDepYears) || 27.5,
    loanAmount: num(ovLoan),
    interestRate: rateFraction,
    monthlyMortgagePayment: num(ovPi),
  };

  const saveOverview = async () => {
    if (!propertyId || ovSaving) return;
    setOvSaving(true);
    setOvError(null);
    setOvStatus(null);
    try {
      const saved = await api.upsertPropertyFinancials(propertyId, {
        purchasePrice: overview.purchasePrice,
        downPayment: overview.downPayment,
        closingCost: overview.closingCost,
        loanAmount: overview.loanAmount,
        interestRate: overview.interestRate,
        loanTermYears: Math.round(num(ovTerm)) || 30,
        monthlyMortgagePayment: overview.monthlyMortgagePayment,
        landValue: overview.landValue,
        annualDepreciationYears: overview.depreciationYears,
      });
      setOvPurchase(String(saved.purchasePrice));
      setOvDown(String(saved.downPayment));
      setOvClosing(String(saved.closingCost));
      setOvLoan(String(saved.loanAmount));
      const r = saved.interestRate;
      setOvRatePct(String(r <= 1 ? r * 100 : r));
      setOvTerm(String(saved.loanTermYears ?? 30));
      setOvPi(String(saved.monthlyMortgagePayment));
      setOvLand(String(saved.landValue));
      setOvDepYears(String(saved.annualDepreciationYears));
      setOvStatus('Property overview saved');
      window.setTimeout(() => setOvStatus(null), 4000);
    } catch (e) {
      setOvError(e instanceof Error ? e.message : 'Failed to save overview');
    } finally {
      setOvSaving(false);
    }
  };

  const overviewFields: {
    label: string;
    value: string;
    set: (v: string) => void;
    step?: string;
    readOnly?: boolean;
    suffix?: string;
  }[] = [
    { label: 'Purchase Price (2024)', value: ovPurchase, set: setOvPurchase, step: '0.01' },
    { label: 'Down Payment', value: ovDown, set: setOvDown, step: '0.01' },
    { label: 'Closing Cost', value: ovClosing, set: setOvClosing, step: '0.01' },
    { label: 'Loan Amount', value: ovLoan, set: setOvLoan, step: '0.01' },
    { label: 'Interest Rate', value: ovRatePct, set: setOvRatePct, step: '0.001', suffix: '%' },
    { label: 'Loan Term (years)', value: ovTerm, set: setOvTerm, step: '1' },
    { label: 'Monthly Mortgage Payment (P&I)', value: ovPi, set: setOvPi, step: '0.01' },
    // Sheet label: "Annual Depreciation (27.5 yrs)" — value is the year count (27.5), not $ dep.
    { label: 'Annual Depreciation (27.5 yrs)', value: ovDepYears, set: setOvDepYears, step: '0.1' },
  ];
  // Land value stays in state for Summary dep formula; not shown on the sheet overview.

  const adminOverviewBlock = isAdmin ? (
    <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 -mx-0.5 max-w-full">
      <div className="px-2.5 sm:px-3 py-2 bg-slate-200">
        <h4 className="text-left font-bold text-slate-900 text-xs sm:text-sm">
          PROPERTY OVERVIEW
        </h4>
      </div>
      {(ovStatus || ovError) && (
        <div
          className={`mx-2.5 sm:mx-3 mt-2 rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
            ovError
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {!ovError && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          <span className="break-words">{ovError || ovStatus}</span>
        </div>
      )}
      <table className="w-full text-xs sm:text-sm table-fixed">
        <colgroup>
          <col className="w-[58%]" />
          <col className="w-[42%]" />
        </colgroup>
        <tbody>
          {overviewFields.map((r) => (
            <tr key={r.label} className="border-t border-slate-100">
              <td className="px-2.5 sm:px-3 py-2 text-slate-800 font-medium break-words leading-snug">{r.label}</td>
              <td className="px-2 sm:px-3 py-1.5 text-right">
                {r.readOnly ? (
                  <span className="tabular-nums text-slate-900 font-semibold whitespace-nowrap px-1">
                    {r.value}
                  </span>
                ) : (
                  <input
                    type="number"
                    step={r.step || '0.01'}
                    inputMode="decimal"
                    value={r.value}
                    onChange={(e) => r.set(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-[7.25rem] sm:max-w-[8.5rem] ml-auto block rounded-md border border-slate-200 px-2 py-1.5 text-right tabular-nums text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 min-h-[40px] sm:min-h-[36px]"
                    disabled={ovSaving}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;

  return (
    <div className="space-y-3 sm:space-y-4 min-w-0">
      {!sheetKind && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-3 space-y-2">
          <p className="text-xs sm:text-sm text-slate-600">
            Year totals for this property. Open monthly breakdown for Income / OpEx / Financing detail.
          </p>
          <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white border border-slate-100 px-2 py-2 min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Income</p>
              <p className={`text-xs font-bold tabular-nums mt-0.5 break-all ${moneyToneClass(row.totalIncome)}`}>
                {formatMoneyPnL(row.totalIncome)}
              </p>
            </div>
            <div className="rounded-lg bg-white border border-slate-100 px-2 py-2 min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">OpEx</p>
              <p className={`text-xs font-bold tabular-nums mt-0.5 break-all ${moneyToneClass(row.totalExpenses)}`}>
                {formatMoneyPnL(row.totalExpenses)}
              </p>
            </div>
            <div className="rounded-lg bg-white border border-emerald-100 px-2 py-2 min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-emerald-700/80 font-semibold">NOI</p>
              <p className={`text-xs font-bold tabular-nums mt-0.5 break-all ${moneyToneClass(row.netIncome)}`}>
                {formatMoneyPnL(row.netIncome)}
              </p>
            </div>
          </div>
        </div>
      )}

      {!!sheetKind && (
        !useSheet && !(row.monthly && row.monthly.length) ? (
          <p className="text-sm text-slate-500 py-2">Yearly month breakdown not loaded yet for this property.</p>
        ) : (
          <>
            {/* Phone: stacked month cards — no horizontal scroll */}
            <div className="sm:hidden rounded-xl border border-slate-300 bg-white overflow-hidden">
              <div className="px-3 py-2.5 border-b border-slate-200 bg-white text-center font-bold text-slate-900 text-sm">
                {year}
              </div>
              <div className="divide-y divide-slate-100">
                {monthRows.map((m) => {
                  const label = MONTHS[m.month - 1];
                  const active = selectedMonth === m.month;
                  return (
                    <button
                      key={`mcard-${label}`}
                      type="button"
                      className={`w-full text-left px-3 py-3 touch-manipulation min-h-[44px] ${active ? 'bg-amber-50' : 'bg-white active:bg-slate-50'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMonth((p) => (p === m.month ? null : m.month));
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-slate-800 text-sm">{label}</span>
                        <span className={`text-xs font-bold tabular-nums ${moneyToneClass(m.net)}`}>
                          NOI {formatSheetMoney(m.net)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1.5 min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Income</p>
                          <p className={`text-[11px] font-bold tabular-nums mt-0.5 truncate ${moneyToneClass(m.income)}`}>
                            {formatSheetMoney(m.income, true)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-1.5 min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">OpEx</p>
                          <p className={`text-[11px] font-bold tabular-nums mt-0.5 truncate ${moneyToneClass(m.expenses)}`}>
                            {formatSheetMoney(m.expenses)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="px-3 py-3 border-t-2 border-slate-800 bg-slate-50 grid grid-cols-3 gap-1.5">
                <div className="min-w-0 text-center">
                  <p className="text-[10px] uppercase text-slate-500 font-semibold">Income</p>
                  <p className={`text-[11px] font-bold tabular-nums truncate ${moneyToneClass(yInc)}`}>{formatSheetMoney(yInc)}</p>
                </div>
                <div className="min-w-0 text-center">
                  <p className="text-[10px] uppercase text-slate-500 font-semibold">OpEx</p>
                  <p className={`text-[11px] font-bold tabular-nums truncate ${moneyToneClass(yExp)}`}>{formatSheetMoney(yExp)}</p>
                </div>
                <div className="min-w-0 text-center">
                  <p className="text-[10px] uppercase text-emerald-700/80 font-semibold">NOI</p>
                  <p className={`text-[11px] font-bold tabular-nums truncate ${moneyToneClass(yNet)}`}>{formatSheetMoney(yNet)}</p>
                </div>
              </div>
            </div>

            {/* Tablet+ : Excel-style yearly table */}
            <div className="hidden sm:block overflow-x-auto overscroll-x-contain rounded-xl border border-slate-300 bg-white">
              <table className="w-full min-w-[28rem] text-xs sm:text-sm border-collapse table-fixed">
                <colgroup>
                  <col className="w-[14%]" />
                  <col className="w-[28.5%]" />
                  <col className="w-[28.5%]" />
                  <col className="w-[29%]" />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      colSpan={4}
                      className="text-center font-bold text-slate-900 px-3 py-3 border-b border-slate-300 bg-white text-sm sm:text-base tracking-wide"
                    >
                      {year}
                    </th>
                  </tr>
                  <tr className="bg-amber-600 text-white">
                    <th className="text-center font-semibold px-2 py-2.5 border border-amber-700/40 align-middle">
                      Month
                    </th>
                    <th className="text-center font-semibold px-2 py-2.5 border border-amber-700/40 align-middle leading-snug">
                      <span className="md:hidden">Income</span>
                      <span className="hidden md:inline">Total Income</span>
                    </th>
                    <th className="text-center font-semibold px-2 py-2.5 border border-amber-700/40 align-middle leading-snug">
                      <span className="md:hidden">OpEx</span>
                      <span className="hidden md:inline">Total Operating Expenses</span>
                    </th>
                    <th className="text-center font-semibold px-2 py-2.5 border border-amber-700/40 align-middle leading-snug">
                      <span className="lg:hidden">NOI</span>
                      <span className="hidden lg:inline">Net Operating Income (NOI)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthRows.map((m) => {
                    const label = MONTHS[m.month - 1];
                    const active = selectedMonth === m.month;
                    return (
                      <tr
                        key={label}
                        className={`cursor-pointer hover:bg-amber-50/80 active:bg-amber-50 ${active ? 'bg-amber-50' : 'bg-white'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMonth((p) => (p === m.month ? null : m.month));
                        }}
                        title={`Open ${label} ${year} detail`}
                      >
                        <td className="px-2 sm:px-3 py-2 text-center font-semibold text-slate-800 whitespace-nowrap border border-slate-200 align-middle">
                          {label}
                        </td>
                        <td className={`px-2 sm:px-3 py-2 text-right tabular-nums whitespace-nowrap border border-slate-200 align-middle ${moneyToneClass(m.income)}`}>
                          {formatSheetMoney(m.income, true)}
                        </td>
                        <td className={`px-2 sm:px-3 py-2 text-right tabular-nums whitespace-nowrap border border-slate-200 align-middle ${moneyToneClass(m.expenses)}`}>
                          {formatSheetMoney(m.expenses)}
                        </td>
                        <td className={`px-2 sm:px-3 py-2 text-right tabular-nums whitespace-nowrap border border-slate-200 align-middle ${moneyToneClass(m.net)}`}>
                          {formatSheetMoney(m.net)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-2 sm:px-3 py-2.5 text-center text-slate-900 border border-slate-200 border-t-2 border-t-slate-800 align-middle">
                      Total
                    </td>
                    <td className={`px-2 sm:px-3 py-2.5 text-right tabular-nums whitespace-nowrap border border-slate-200 border-t-2 border-t-slate-800 border-b-[3px] border-b-double border-b-slate-800 align-middle ${moneyToneClass(yInc)}`}>
                      {formatSheetMoney(yInc)}
                    </td>
                    <td className={`px-2 sm:px-3 py-2.5 text-right tabular-nums whitespace-nowrap border border-slate-200 border-t-2 border-t-slate-800 border-b-[3px] border-b-double border-b-slate-800 align-middle ${moneyToneClass(yExp)}`}>
                      {formatSheetMoney(yExp)}
                    </td>
                    <td className={`px-2 sm:px-3 py-2.5 text-right tabular-nums whitespace-nowrap border border-slate-200 border-t-2 border-t-slate-800 border-b-[3px] border-b-double border-b-slate-800 align-middle ${moneyToneClass(yNet)}`}>
                      {formatSheetMoney(yNet)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )
      )}

      {selectedMonth != null && (
        <ViewportPortal>
          <div
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMonth(null);
            }}
            role="presentation"
          >
            <div
              className="w-full sm:max-w-2xl max-h-[min(94dvh,92vh)] sm:max-h-[min(90dvh,88vh)] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col min-h-0 overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${MONTH_NAMES[selectedMonth - 1]} ${year} monthly breakdown`}
            >
              <div className="sm:hidden flex justify-center pt-2 flex-shrink-0" aria-hidden>
                <div className="w-10 h-1 rounded-full bg-slate-300" />
              </div>
              <div className="flex flex-wrap items-center gap-2 px-3 sm:px-5 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="rounded-lg border border-emerald-700 bg-emerald-800 px-3 py-2 text-sm font-bold text-white min-h-[40px] flex-1 min-w-[8rem] max-w-full sm:flex-initial sm:w-auto sm:max-w-[11rem] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  aria-label="Select month"
                >
                  {MONTH_NAMES.map((label, i) => (
                    <option key={label} value={i + 1} className="bg-white text-slate-900">
                      {label} {year}
                    </option>
                  ))}
                </select>
                <div className="hidden sm:block flex-1" />
                <button
                  type="button"
                  onClick={() => void monthSaveRef.current?.()}
                  disabled={monthSaving}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 min-h-[40px] flex-1 sm:flex-initial flex-shrink-0 touch-manipulation"
                >
                  {monthSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMonth(null)}
                  className="p-2 rounded-xl hover:bg-slate-200 text-slate-600 min-h-[40px] min-w-[40px] inline-flex items-center justify-center flex-shrink-0 touch-manipulation"
                  aria-label="Close monthly breakdown"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 min-h-0">
                <PropertyMonthIncomeOpexEditor
                  key={`month-${propertyId}-${selectedMonth}-${sheetKind || 'none'}`}
                  propertyId={propertyId}
                  year={year}
                  month={selectedMonth}
                  unitLabel="Door 1"
                  overview={overview}
                  showPerformanceMetrics={isAdmin}
                  useSheetDefaults={useSheet}
                  sheetKind={sheetKind || 'bella'}
                  overviewSlot={adminOverviewBlock}
                  onSaveOverview={isAdmin ? saveOverview : undefined}
                  externalSaveControl
                  saveRef={monthSaveRef}
                  onSavingChange={setMonthSaving}
                  onSaved={(totals) => {
                    if (sheetKind === 'bella') {
                      setBellaMonthTotals((prev) => ({ ...prev, [selectedMonth]: totals }));
                    } else if (sheetKind === 'tomball') {
                      setTomballMonthTotals((prev) => ({ ...prev, [selectedMonth]: totals }));
                    } else if (sheetKind === 'conroe') {
                      setConroeMonthTotals((prev) => ({ ...prev, [selectedMonth]: totals }));
                    } else if (sheetKind === 'avenueq') {
                      setAvenueQMonthTotals((prev) => ({ ...prev, [selectedMonth]: totals }));
                    } else if (sheetKind === 'sherman') {
                      setShermanMonthTotals((prev) => ({ ...prev, [selectedMonth]: totals }));
                    } else if (sheetKind === 'seventieth') {
                      setSeventiethMonthTotals((prev) => ({ ...prev, [selectedMonth]: totals }));
                    } else if (sheetKind === 'avenueh') {
                      setAvenueHMonthTotals((prev) => ({ ...prev, [selectedMonth]: totals }));
                    } else if (sheetKind === 'wooding') {
                      setWoodingMonthTotals((prev) => ({ ...prev, [selectedMonth]: totals }));
                    } else if (sheetKind === 'avenuef') {
                      setAvenueFMonthTotals((prev) => ({ ...prev, [selectedMonth]: totals }));
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </ViewportPortal>
      )}
    </div>
  );
}

const IncomeStatementView: React.FC<Props> = ({ properties }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [summary, setSummary] = useState<IncomeStatementSummary | null>(null);
  const [expenses, setExpenses] = useState<OperatingExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  /** 1–12 when a month is opened from the yearly table / monthly breakdown. */
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  /** Saved Bella Jess month totals — override yearly sheet rows when present. */
  const [bellaMonthTotals, setBellaMonthTotals] = useState<
    Partial<Record<number, { income: number; expenses: number; net: number }>>
  >({});
  /** Saved Tomball month totals — override yearly sheet rows when present. */
  const [tomballMonthTotals, setTomballMonthTotals] = useState<
    Partial<Record<number, { income: number; expenses: number; net: number }>>
  >({});
  /** Saved Conroe month totals — override yearly sheet rows when present. */
  const [conroeMonthTotals, setConroeMonthTotals] = useState<
    Partial<Record<number, { income: number; expenses: number; net: number }>>
  >({});
  /** Saved Avenue Q month totals — override yearly sheet rows when present. */
  const [avenueQMonthTotals, setAvenueQMonthTotals] = useState<
    Partial<Record<number, { income: number; expenses: number; net: number }>>
  >({});
  /** Saved Sherman month totals — override yearly sheet rows when present. */
  const [shermanMonthTotals, setShermanMonthTotals] = useState<
    Partial<Record<number, { income: number; expenses: number; net: number }>>
  >({});
  /** Saved 70th Street month totals — override yearly sheet rows when present. */
  const [seventiethMonthTotals, setSeventiethMonthTotals] = useState<
    Partial<Record<number, { income: number; expenses: number; net: number }>>
  >({});
  /** Saved Avenue H month totals — override yearly sheet rows when present. */
  const [avenueHMonthTotals, setAvenueHMonthTotals] = useState<
    Partial<Record<number, { income: number; expenses: number; net: number }>>
  >({});
  /** Saved Wooding month totals — override yearly sheet rows when present. */
  const [woodingMonthTotals, setWoodingMonthTotals] = useState<
    Partial<Record<number, { income: number; expenses: number; net: number }>>
  >({});
  /** Saved Avenue F month totals — override yearly sheet rows when present. */
  const [avenueFMonthTotals, setAvenueFMonthTotals] = useState<
    Partial<Record<number, { income: number; expenses: number; net: number }>>
  >({});
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseSuccessPopup, setExpenseSuccessPopup] = useState<OperatingExpense | null>(null);
  const [expenseFeedback, setExpenseFeedback] = useState<string | null>(null);
  const [showExpenseBell, setShowExpenseBell] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState<Record<string, number>>(() => readDismissedExpenseNotifs());
  const [notifTick, setNotifTick] = useState(0);
  const bellRef = useRef<HTMLDivElement>(null);

  const load = async (selectedYear: number) => {
    setLoading(true);
    setDetailsLoading(true);
    setError(null);
    setSummary(null);
    setExpenses([]);
    setExpensesLoading(true);

    try {
      const [full, expenseRows] = await Promise.all([
        api.getIncomeStatement(selectedYear),
        api.getOperatingExpenses({ year: selectedYear, limit: 50 }),
      ]);
      setSummary(full);
      setExpenses(expenseRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load income statement');
    } finally {
      setLoading(false);
      setDetailsLoading(false);
      setExpensesLoading(false);
    }
  };

  useEffect(() => {
    setExpandedProperty(null);
    setSelectedMonth(null);
    load(year);
  }, [year]);

  const bellaPropertyId = properties.find((p) => isBellaJessName(p.name || ''))?.id || '';
  const tomballPropertyId = properties.find((p) => isTomballName(p.name || ''))?.id || '';
  const conroePropertyId = properties.find((p) => isConroeName(p.name || ''))?.id || '';
  const avenueQPropertyId = properties.find((p) => isAvenueQName(p.name || ''))?.id || '';
  const shermanPropertyId = properties.find((p) => isShermanName(p.name || ''))?.id || '';
  const seventiethPropertyId = properties.find((p) => isSeventiethName(p.name || ''))?.id || '';
  const avenueHPropertyId = properties.find((p) => isAvenueHName(p.name || ''))?.id || '';
  const woodingPropertyId = properties.find((p) => isWoodingName(p.name || ''))?.id || '';
  const avenueFPropertyId = properties.find((p) => isAvenueFName(p.name || ''))?.id || '';

  // Load Bella Jess Jan–Dec inputs so yearly rows reflect saved Income / OpEx / NOI.
  useEffect(() => {
    if (year !== 2026 || !bellaPropertyId) {
      setBellaMonthTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.listPropertyMonthInputs({
          property: bellaPropertyId,
          year: 2026,
          unitLabel: 'Door 1',
        });
        if (cancelled) return;
        const next: Partial<Record<number, { income: number; expenses: number; net: number }>> = {};
        for (const row of rows) {
          // Prefer backend-computed rollups (source of truth after save).
          if (row.computed) {
            next[row.month] = {
              income: row.computed.totalEffectiveIncome,
              expenses: row.computed.totalOpex,
              net: row.computed.noi,
            };
            continue;
          }
          const s = computeMonthSummary(
            mergeIncomeLines(row.incomeLines, row.month),
            mergeOpexLines(row.opexLines, row.month),
            mergeFinancingLines(row.financingLines?.length ? row.financingLines : null, null, row.month),
          );
          next[row.month] = {
            income: s.totalEffectiveIncome,
            expenses: s.totalOpex,
            net: s.noi,
          };
        }
        setBellaMonthTotals(next);
      } catch {
        if (!cancelled) setBellaMonthTotals({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, bellaPropertyId]);

  // Load Tomball Jan–Dec inputs so yearly rows reflect saved Income / OpEx / NOI.
  useEffect(() => {
    if (year !== 2026 || !tomballPropertyId) {
      setTomballMonthTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.listPropertyMonthInputs({
          property: tomballPropertyId,
          year: 2026,
          unitLabel: 'Door 1',
        });
        if (cancelled) return;
        const next: Partial<Record<number, { income: number; expenses: number; net: number }>> = {};
        for (const row of rows) {
          if (row.computed) {
            next[row.month] = {
              income: row.computed.totalEffectiveIncome,
              expenses: row.computed.totalOpex,
              net: row.computed.noi,
            };
            continue;
          }
          const s = computeMonthSummary(
            mergeTomballIncomeLines(row.incomeLines, row.month),
            mergeTomballOpexLines(row.opexLines, row.month),
            mergeTomballFinancingLines(row.financingLines?.length ? row.financingLines : null, row.month),
          );
          next[row.month] = {
            income: s.totalEffectiveIncome,
            expenses: s.totalOpex,
            net: s.noi,
          };
        }
        setTomballMonthTotals(next);
      } catch {
        if (!cancelled) setTomballMonthTotals({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, tomballPropertyId]);

  // Load Conroe Jan–Dec inputs so yearly rows reflect saved Income / OpEx / NOI.
  useEffect(() => {
    if (year !== 2026 || !conroePropertyId) {
      setConroeMonthTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.listPropertyMonthInputs({
          property: conroePropertyId,
          year: 2026,
          unitLabel: 'Door 1',
        });
        if (cancelled) return;
        const next: Partial<Record<number, { income: number; expenses: number; net: number }>> = {};
        for (const row of rows) {
          if (row.computed) {
            next[row.month] = {
              income: row.computed.totalEffectiveIncome,
              expenses: row.computed.totalOpex,
              net: row.computed.noi,
            };
            continue;
          }
          const s = computeMonthSummary(
            mergeConroeIncomeLines(row.incomeLines, row.month),
            mergeConroeOpexLines(row.opexLines, row.month),
            mergeConroeFinancingLines(row.financingLines?.length ? row.financingLines : null, row.month),
          );
          next[row.month] = {
            income: s.totalEffectiveIncome,
            expenses: s.totalOpex,
            net: s.noi,
          };
        }
        setConroeMonthTotals(next);
      } catch {
        if (!cancelled) setConroeMonthTotals({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, conroePropertyId]);

  // Load Avenue Q Jan–Dec inputs so yearly rows reflect saved Income / OpEx / NOI.
  useEffect(() => {
    if (year !== 2026 || !avenueQPropertyId) {
      setAvenueQMonthTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.listPropertyMonthInputs({
          property: avenueQPropertyId,
          year: 2026,
          unitLabel: 'Door 1',
        });
        if (cancelled) return;
        const next: Partial<Record<number, { income: number; expenses: number; net: number }>> = {};
        for (const row of rows) {
          if (row.computed) {
            next[row.month] = {
              income: row.computed.totalEffectiveIncome,
              expenses: row.computed.totalOpex,
              net: row.computed.noi,
            };
            continue;
          }
          const s = computeMonthSummary(
            mergeAvenueQIncomeLines(row.incomeLines, row.month),
            mergeAvenueQOpexLines(row.opexLines, row.month),
            mergeAvenueQFinancingLines(row.financingLines?.length ? row.financingLines : null, row.month),
          );
          next[row.month] = {
            income: s.totalEffectiveIncome,
            expenses: s.totalOpex,
            net: s.noi,
          };
        }
        setAvenueQMonthTotals(next);
      } catch {
        if (!cancelled) setAvenueQMonthTotals({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, avenueQPropertyId]);

  // Load Sherman Jan–Dec inputs so yearly rows reflect saved Income / OpEx / NOI.
  useEffect(() => {
    if (year !== 2026 || !shermanPropertyId) {
      setShermanMonthTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.listPropertyMonthInputs({
          property: shermanPropertyId,
          year: 2026,
          unitLabel: 'Door 1',
        });
        if (cancelled) return;
        const next: Partial<Record<number, { income: number; expenses: number; net: number }>> = {};
        for (const row of rows) {
          if (row.computed) {
            next[row.month] = {
              income: row.computed.totalEffectiveIncome,
              expenses: row.computed.totalOpex,
              net: row.computed.noi,
            };
            continue;
          }
          const s = computeMonthSummary(
            mergeShermanIncomeLines(row.incomeLines, row.month),
            mergeShermanOpexLines(row.opexLines, row.month),
            mergeShermanFinancingLines(row.financingLines?.length ? row.financingLines : null, row.month),
          );
          next[row.month] = {
            income: s.totalEffectiveIncome,
            expenses: s.totalOpex,
            net: s.noi,
          };
        }
        setShermanMonthTotals(next);
      } catch {
        if (!cancelled) setShermanMonthTotals({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, shermanPropertyId]);

  // Load 70th Street Jan–Dec inputs so yearly rows reflect saved Income / OpEx / NOI.
  useEffect(() => {
    if (year !== 2026 || !seventiethPropertyId) {
      setSeventiethMonthTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.listPropertyMonthInputs({
          property: seventiethPropertyId,
          year: 2026,
          unitLabel: 'Door 1',
        });
        if (cancelled) return;
        const next: Partial<Record<number, { income: number; expenses: number; net: number }>> = {};
        for (const row of rows) {
          if (row.computed) {
            next[row.month] = {
              income: row.computed.totalEffectiveIncome,
              expenses: row.computed.totalOpex,
              net: row.computed.noi,
            };
            continue;
          }
          const s = computeMonthSummary(
            mergeSeventiethIncomeLines(row.incomeLines, row.month),
            mergeSeventiethOpexLines(row.opexLines, row.month),
            mergeSeventiethFinancingLines(row.financingLines?.length ? row.financingLines : null, row.month),
          );
          next[row.month] = {
            income: s.totalEffectiveIncome,
            expenses: s.totalOpex,
            net: s.noi,
          };
        }
        setSeventiethMonthTotals(next);
      } catch {
        if (!cancelled) setSeventiethMonthTotals({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, seventiethPropertyId]);

  // Load Avenue H Jan–Dec inputs so yearly rows reflect saved Income / OpEx / NOI.
  useEffect(() => {
    if (year !== 2026 || !avenueHPropertyId) {
      setAvenueHMonthTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.listPropertyMonthInputs({
          property: avenueHPropertyId,
          year: 2026,
          unitLabel: 'Door 1',
        });
        if (cancelled) return;
        const next: Partial<Record<number, { income: number; expenses: number; net: number }>> = {};
        for (const row of rows) {
          if (row.computed) {
            next[row.month] = {
              income: row.computed.totalEffectiveIncome,
              expenses: row.computed.totalOpex,
              net: row.computed.noi,
            };
            continue;
          }
          const s = computeMonthSummary(
            mergeAvenueHIncomeLines(row.incomeLines, row.month),
            mergeAvenueHOpexLines(row.opexLines, row.month),
            mergeAvenueHFinancingLines(row.financingLines?.length ? row.financingLines : null, row.month),
          );
          next[row.month] = {
            income: s.totalEffectiveIncome,
            expenses: s.totalOpex,
            net: s.noi,
          };
        }
        setAvenueHMonthTotals(next);
      } catch {
        if (!cancelled) setAvenueHMonthTotals({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, avenueHPropertyId]);

  // Load Wooding Jan–Dec inputs so yearly rows reflect saved Income / OpEx / NOI.
  useEffect(() => {
    if (year !== 2026 || !woodingPropertyId) {
      setWoodingMonthTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.listPropertyMonthInputs({
          property: woodingPropertyId,
          year: 2026,
          unitLabel: 'Door 1',
        });
        if (cancelled) return;
        const next: Partial<Record<number, { income: number; expenses: number; net: number }>> = {};
        for (const row of rows) {
          if (row.computed) {
            next[row.month] = {
              income: row.computed.totalEffectiveIncome,
              expenses: row.computed.totalOpex,
              net: row.computed.noi,
            };
            continue;
          }
          const s = computeMonthSummary(
            mergeWoodingIncomeLines(row.incomeLines, row.month),
            mergeWoodingOpexLines(row.opexLines, row.month),
            mergeWoodingFinancingLines(row.financingLines?.length ? row.financingLines : null, row.month),
          );
          next[row.month] = {
            income: s.totalEffectiveIncome,
            expenses: s.totalOpex,
            net: s.noi,
          };
        }
        setWoodingMonthTotals(next);
      } catch {
        if (!cancelled) setWoodingMonthTotals({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, woodingPropertyId]);

  // Load Avenue F Jan–Dec inputs so yearly rows reflect saved Income / OpEx / NOI.
  useEffect(() => {
    if (year !== 2026 || !avenueFPropertyId) {
      setAvenueFMonthTotals({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.listPropertyMonthInputs({
          property: avenueFPropertyId,
          year: 2026,
          unitLabel: 'Door 1',
        });
        if (cancelled) return;
        const next: Partial<Record<number, { income: number; expenses: number; net: number }>> = {};
        for (const row of rows) {
          if (row.computed) {
            next[row.month] = {
              income: row.computed.totalEffectiveIncome,
              expenses: row.computed.totalOpex,
              net: row.computed.noi,
            };
            continue;
          }
          const s = computeMonthSummary(
            mergeAvenueFIncomeLines(row.incomeLines, row.month),
            mergeAvenueFOpexLines(row.opexLines, row.month),
            mergeAvenueFFinancingLines(row.financingLines?.length ? row.financingLines : null, row.month),
          );
          next[row.month] = {
            income: s.totalEffectiveIncome,
            expenses: s.totalOpex,
            net: s.noi,
          };
        }
        setAvenueFMonthTotals(next);
      } catch {
        if (!cancelled) setAvenueFMonthTotals({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, avenueFPropertyId]);

  // Keep expense bell fresh; avoid re-running the heavy full P&L on a timer.
  usePollWhileVisible(async () => {
    setNotifTick((n) => n + 1);
    const expenseRows = await api.getOperatingExpenses({ year, limit: 50 });
    setExpenses(expenseRows);
  }, 60_000, !loading);
  useEffect(() => {
    if (!showExpenseBell) return;
    const onPointerDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowExpenseBell(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [showExpenseBell]);

  const filteredExpenses = useMemo(
    () =>
      expenses
        .filter((e) => new Date(e.date).getFullYear() === year)
        .filter((e) => !(e.notes || '').startsWith('excel-import-'))
        .slice(0, 20),
    [expenses, year]
  );

  const expenseNotifications = useMemo(() => {
    void notifTick;
    const cutoff = Date.now() - EXPENSE_NOTIF_WINDOW_MS;
    return expenses
      .filter((e) => !(e.notes || '').startsWith('excel-import-'))
      // Bell is for admin awareness of PM-logged expenses only.
      .filter((e) => e.createdByIsManager)
      .map((e) => {
        const recordedAt = expenseRecordedAt(e);
        return recordedAt != null ? { expense: e, recordedAt } : null;
      })
      .filter((row): row is { expense: OperatingExpense; recordedAt: number } =>
        !!row && row.recordedAt >= cutoff && !dismissedNotifs[row.expense.id],
      )
      .sort((a, b) => b.recordedAt - a.recordedAt);
  }, [expenses, dismissedNotifs, notifTick]);

  const dismissExpenseNotifs = (ids: string[]) => {
    if (!ids.length) return;
    const next = { ...dismissedNotifs };
    const now = Date.now();
    ids.forEach((id) => {
      next[id] = now;
    });
    setDismissedNotifs(next);
    writeDismissedExpenseNotifs(next);
  };

  const bellaYearSheet = useMemo(() => {
    if (year !== 2026) return null;
    return sumYearlyRows(applyMonthsToYearly(BELLA_JESS_2026_YEARLY, bellaMonthTotals));
  }, [year, bellaMonthTotals]);

  const tomballYearSheet = useMemo(() => {
    if (year !== 2026) return null;
    return sumYearlyRows(applyMonthsToYearly(TOMBALL_2026_YEARLY, tomballMonthTotals));
  }, [year, tomballMonthTotals]);

  const conroeYearSheet = useMemo(() => {
    if (year !== 2026) return null;
    return sumYearlyRows(applyMonthsToYearly(CONROE_2026_YEARLY, conroeMonthTotals));
  }, [year, conroeMonthTotals]);

  const avenueQYearSheet = useMemo(() => {
    if (year !== 2026) return null;
    return sumYearlyRows(applyMonthsToYearly(AVENUE_Q_2026_YEARLY, avenueQMonthTotals));
  }, [year, avenueQMonthTotals]);

  const shermanYearSheet = useMemo(() => {
    if (year !== 2026) return null;
    return sumYearlyRows(applyMonthsToYearly(SHERMAN_2026_YEARLY, shermanMonthTotals));
  }, [year, shermanMonthTotals]);

  const seventiethYearSheet = useMemo(() => {
    if (year !== 2026) return null;
    return sumYearlyRows(applyMonthsToYearly(SEVENTIETH_2026_YEARLY, seventiethMonthTotals));
  }, [year, seventiethMonthTotals]);

  const avenueHYearSheet = useMemo(() => {
    if (year !== 2026) return null;
    return sumYearlyRows(applyMonthsToYearly(AVENUE_H_2026_YEARLY, avenueHMonthTotals));
  }, [year, avenueHMonthTotals]);

  const woodingYearSheet = useMemo(() => {
    if (year !== 2026) return null;
    return sumYearlyRows(applyMonthsToYearly(WOODING_2026_YEARLY, woodingMonthTotals));
  }, [year, woodingMonthTotals]);

  const avenueFYearSheet = useMemo(() => {
    if (year !== 2026) return null;
    return sumYearlyRows(applyMonthsToYearly(AVENUE_F_2026_YEARLY, avenueFMonthTotals));
  }, [year, avenueFMonthTotals]);

  const sheetPortfolioYear = useMemo(() => {
    if (year !== 2026) return null;
    if (
      !bellaYearSheet &&
      !tomballYearSheet &&
      !conroeYearSheet &&
      !avenueQYearSheet &&
      !shermanYearSheet &&
      !seventiethYearSheet &&
      !avenueHYearSheet &&
      !woodingYearSheet &&
      !avenueFYearSheet
    ) {
      return null;
    }
    const b = bellaYearSheet || { income: 0, expenses: 0, net: 0 };
    const t = tomballYearSheet || { income: 0, expenses: 0, net: 0 };
    const c = conroeYearSheet || { income: 0, expenses: 0, net: 0 };
    const a = avenueQYearSheet || { income: 0, expenses: 0, net: 0 };
    const s = shermanYearSheet || { income: 0, expenses: 0, net: 0 };
    const sev = seventiethYearSheet || { income: 0, expenses: 0, net: 0 };
    const h = avenueHYearSheet || { income: 0, expenses: 0, net: 0 };
    const w = woodingYearSheet || { income: 0, expenses: 0, net: 0 };
    const f = avenueFYearSheet || { income: 0, expenses: 0, net: 0 };
      return {
      income: b.income + t.income + c.income + a.income + s.income + sev.income + h.income + w.income + f.income,
      expenses: b.expenses + t.expenses + c.expenses + a.expenses + s.expenses + sev.expenses + h.expenses + w.expenses + f.expenses,
      net: b.net + t.net + c.net + a.net + s.net + sev.net + h.net + w.net + f.net,
    };
  }, [
    year,
    bellaYearSheet,
    tomballYearSheet,
    conroeYearSheet,
    avenueQYearSheet,
    shermanYearSheet,
    seventiethYearSheet,
    avenueHYearSheet,
    woodingYearSheet,
    avenueFYearSheet,
  ]);

  const groupedProperties = useMemo(() => {
    if (!summary?.byProperty?.length) return [];
    const grouped = groupIncomeStatementProperties(summary.byProperty, properties);
    // Fewest units first → most units last
    const sorted = [...grouped].sort((a, b) => {
      const aUnits = a.units?.length || a.unitsCount || 0;
      const bUnits = b.units?.length || b.unitsCount || 0;
      if (aUnits !== bUnits) return aUnits - bUnits;
      return (a.propertyName || a.groupKey || '').localeCompare(b.propertyName || b.groupKey || '');
    });
    // Sheet mode: only Bella Jess + Tomball + Conroe + Avenue Q + Sherman + 70th + Avenue H + Wooding + Avenue F contribute; other properties forced to $0.
    return sorted.map((row) => {
      const name = row.propertyName || row.groupKey || '';
      if (isBellaJessName(name) && bellaYearSheet) {
        return {
          ...row,
          totalIncome: bellaYearSheet.income,
          totalExpenses: bellaYearSheet.expenses,
          netIncome: bellaYearSheet.net,
          rentIncome: bellaYearSheet.income,
          shortStayIncome: 0,
        };
      }
      if (isTomballName(name) && tomballYearSheet) {
      return {
          ...row,
          totalIncome: tomballYearSheet.income,
          totalExpenses: tomballYearSheet.expenses,
          netIncome: tomballYearSheet.net,
          rentIncome: tomballYearSheet.income,
          shortStayIncome: 0,
        };
      }
      if (isConroeName(name) && conroeYearSheet) {
    return {
          ...row,
          totalIncome: conroeYearSheet.income,
          totalExpenses: conroeYearSheet.expenses,
          netIncome: conroeYearSheet.net,
          rentIncome: conroeYearSheet.income,
          shortStayIncome: 0,
        };
      }
      if (isAvenueQName(name) && avenueQYearSheet) {
        return {
          ...row,
          totalIncome: avenueQYearSheet.income,
          totalExpenses: avenueQYearSheet.expenses,
          netIncome: avenueQYearSheet.net,
          rentIncome: avenueQYearSheet.income,
          shortStayIncome: 0,
        };
      }
      if (isShermanName(name) && shermanYearSheet) {
        return {
          ...row,
          totalIncome: shermanYearSheet.income,
          totalExpenses: shermanYearSheet.expenses,
          netIncome: shermanYearSheet.net,
          rentIncome: shermanYearSheet.income,
          shortStayIncome: 0,
        };
      }
      if (isSeventiethName(name) && seventiethYearSheet) {
        return {
          ...row,
          totalIncome: seventiethYearSheet.income,
          totalExpenses: seventiethYearSheet.expenses,
          netIncome: seventiethYearSheet.net,
          rentIncome: seventiethYearSheet.income,
          shortStayIncome: 0,
        };
      }
      if (isAvenueHName(name) && avenueHYearSheet) {
        return {
          ...row,
          totalIncome: avenueHYearSheet.income,
          totalExpenses: avenueHYearSheet.expenses,
          netIncome: avenueHYearSheet.net,
          rentIncome: avenueHYearSheet.income,
          shortStayIncome: 0,
        };
      }
      if (isWoodingName(name) && woodingYearSheet) {
        return {
          ...row,
          totalIncome: woodingYearSheet.income,
          totalExpenses: woodingYearSheet.expenses,
          netIncome: woodingYearSheet.net,
          rentIncome: woodingYearSheet.income,
          shortStayIncome: 0,
        };
      }
      if (isAvenueFName(name) && avenueFYearSheet) {
        return {
          ...row,
          totalIncome: avenueFYearSheet.income,
          totalExpenses: avenueFYearSheet.expenses,
          netIncome: avenueFYearSheet.net,
          rentIncome: avenueFYearSheet.income,
          shortStayIncome: 0,
        };
      }
      if (sheetPortfolioYear) {
        return {
          ...row,
          totalIncome: 0,
          totalExpenses: 0,
          netIncome: 0,
          rentIncome: 0,
          shortStayIncome: 0,
        };
      }
      return row;
    });
  }, [
    summary,
    properties,
    bellaYearSheet,
    tomballYearSheet,
    conroeYearSheet,
    avenueQYearSheet,
    shermanYearSheet,
    seventiethYearSheet,
    avenueHYearSheet,
    woodingYearSheet,
    avenueFYearSheet,
    sheetPortfolioYear,
  ]);

  const portfolioDisplay = useMemo(() => {
    if (!summary) {
      return { totalIncome: 0, totalExpenses: 0, netIncome: 0 };
    }
    // Portfolio totals = sheet properties only (Bella + Tomball + Conroe + Avenue Q + Sherman + 70th + Avenue H + Wooding + Avenue F).
    if (sheetPortfolioYear) {
      return {
        ...summary.portfolio,
        totalIncome: sheetPortfolioYear.income,
        totalExpenses: sheetPortfolioYear.expenses,
        netIncome: sheetPortfolioYear.net,
        rentIncome: sheetPortfolioYear.income,
        shortStayIncome: 0,
      };
    }
    return summary.portfolio;
  }, [summary, sheetPortfolioYear]);

  const visibleProperties = useMemo(() => {
    if (!expandedProperty) return groupedProperties;
    // Focus: only the expanded property stays in the list.
    return groupedProperties.filter((r) => r.groupKey === expandedProperty);
  }, [groupedProperties, expandedProperty]);

  const hiddenPropertyCount = expandedProperty
    ? Math.max(0, groupedProperties.length - 1)
    : 0;

  const openPropertyMonthly = (row: GroupedPropertyRow) => {
    setExpandedProperty(row.groupKey);
    setSelectedMonth(1);
  };

  const togglePropertyExpand = (row: GroupedPropertyRow) => {
    const expanded = expandedProperty === row.groupKey;
    setExpandedProperty(expanded ? null : row.groupKey);
    setSelectedMonth(null);
  };

  const viewMoreProperties = () => {
    setExpandedProperty(null);
    setSelectedMonth(null);
  };

  const totalUnitsAcrossProperties = useMemo(
    () => groupedProperties.reduce((sum, g) => sum + (g.units?.length || g.unitsCount || 0), 0),
    [groupedProperties],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p>Loading portfolio P&L...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return <div className="text-rose-600">{error || 'Could not load income statement'}</div>;
  }

  const isAdmin = summary.isAdminView !== false;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in pb-8 min-w-0 max-w-full overflow-x-hidden">
      <div className="relative z-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 text-white p-4 sm:p-6 lg:p-8 shadow-2xl shadow-indigo-500/20">
        <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80')] opacity-15 bg-cover bg-center" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Portfolio P&L - {year}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Income Statement</h2>
            <p className="text-indigo-100 mt-2 max-w-xl text-sm sm:text-base">
              Profit & loss across every property - income, operating expenses, and net operating income (NOI).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-shrink-0" ref={bellRef}>
              <button
                type="button"
                onClick={() => setShowExpenseBell((v) => !v)}
                className="relative inline-flex items-center justify-center p-2.5 rounded-xl bg-white/15 backdrop-blur text-white hover:bg-white/25 transition-colors min-h-[44px] min-w-[44px] border border-white/20"
                aria-label={
                  expenseNotifications.length
                    ? `${expenseNotifications.length} new expense notifications`
                    : 'Expense notifications'
                }
              >
                <Bell className="w-5 h-5" />
                {expenseNotifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[1.15rem] h-[1.15rem] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {expenseNotifications.length > 9 ? '9+' : expenseNotifications.length}
                  </span>
                )}
              </button>
              {showExpenseBell && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[min(22rem,calc(100vw-2.5rem))] max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 text-left">
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 sticky top-0 bg-white">
                    <p className="font-semibold text-sm text-slate-800">Expenses</p>
                    {expenseNotifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          dismissExpenseNotifs(expenseNotifications.map((n) => n.expense.id));
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {expenseNotifications.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No new expenses.</p>
                  ) : (
                    expenseNotifications.map(({ expense: e, recordedAt }) => (
                      <div
                        key={e.id}
                        className="px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {formatMoney(e.amount)} - {CATEGORY_LABELS[e.category] || e.category}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {e.propertyName || 'Property'}
                              {e.unitLabel ? ` - ${e.unitLabel}` : ''}
                              {e.createdByName ? ` - ${e.createdByName}` : ''}
                            </p>
                          </div>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">
                            {formatNotifAge(recordedAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAddExpense(true)}
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm shadow-lg hover:bg-indigo-50 transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              Add expense
            </button>
            </div>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border-0 rounded-xl px-4 py-2.5 bg-white/15 backdrop-blur text-white font-semibold shadow-lg focus:ring-2 focus:ring-white/40 min-h-[44px] w-full sm:w-auto"
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y} className="text-slate-900">{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Portfolio summary: label + value side by side */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-w-0">
        <div className="px-3 sm:px-5 py-3.5 bg-amber-600">
          <h3 className="font-bold text-white text-base sm:text-lg">Portfolio Summary — {year}</h3>
            </div>
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[58%]" />
            <col className="w-[42%]" />
          </colgroup>
          <tbody>
            <tr className="border-t border-slate-200 bg-slate-50/80">
              <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-medium text-slate-700 text-xs sm:text-sm">
                <span className="sm:hidden">Income</span>
                <span className="hidden sm:inline">Total Income</span>
              </td>
              <td className={`px-3 sm:px-5 py-3 sm:py-3.5 text-right font-bold tabular-nums text-xs sm:text-sm break-all sm:whitespace-nowrap ${moneyToneClass(portfolioDisplay.totalIncome)}`}>
                {formatMoneyPnL(portfolioDisplay.totalIncome)}
              </td>
            </tr>
            <tr className="border-t border-slate-200 bg-rose-50/50">
              <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-medium text-slate-700 text-xs sm:text-sm">
                <span className="sm:hidden">OpEx</span>
                <span className="hidden sm:inline">Total Operating Expenses</span>
              </td>
              <td className={`px-3 sm:px-5 py-3 sm:py-3.5 text-right font-bold tabular-nums text-xs sm:text-sm break-all sm:whitespace-nowrap ${moneyToneClass(portfolioDisplay.totalExpenses)}`}>
                {formatMoneyPnL(portfolioDisplay.totalExpenses)}
              </td>
            </tr>
            <tr className="border-t border-slate-200 bg-emerald-50">
              <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-semibold text-emerald-900 text-xs sm:text-sm">
                <span className="sm:hidden">NOI</span>
                <span className="hidden sm:inline">Net Operating Income (NOI)</span>
              </td>
              <td className={`px-3 sm:px-5 py-3 sm:py-3.5 text-right font-bold tabular-nums text-xs sm:text-sm break-all sm:whitespace-nowrap ${moneyToneClass(portfolioDisplay.netIncome)}`}>
                {formatMoneyPnL(portfolioDisplay.netIncome)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {detailsLoading && !groupedProperties.length ? (
        <SectionSkeleton label="Loading properties..." />
      ) : (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-w-0">
        <div className="px-3 sm:px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 min-w-0">
            <Home className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Properties - {year}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {expandedProperty
                  ? 'Focused on one property — view more to see the full list'
                  : 'Tap a property for its breakdown'}
                {groupedProperties.length > 0
                  ? ` · ${visibleProperties.length}${hiddenPropertyCount ? ` of ${groupedProperties.length}` : ''} propert${visibleProperties.length === 1 ? 'y' : 'ies'}`
                  : ''}
                {totalUnitsAcrossProperties > 0 && !expandedProperty ? ` · ${totalUnitsAcrossProperties} units` : ''}
              </p>
            </div>
            </div>
          </div>

        {/* Mobile: stacked property cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {visibleProperties.length === 0 ? (
            <p className="px-4 py-10 text-center text-slate-500 text-sm">No properties found for {year}.</p>
          ) : (
            visibleProperties.map((row) => {
            const expanded = expandedProperty === row.groupKey;
              const unitCount = row.units?.length || row.unitsCount || 0;
            return (
                <div key={`m-${row.groupKey}`} className={expanded ? 'bg-indigo-50/40' : 'bg-white'}>
                  <div className="px-3 py-3.5">
                    <button
                      type="button"
                      className="w-full text-left min-h-[44px] active:bg-slate-50 rounded-lg"
                      onClick={() => togglePropertyExpand(row)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 text-sm leading-snug">
                            {row.propertyName || row.groupKey}
                          </p>
                          {unitCount > 0 && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {unitCount} unit{unitCount === 1 ? '' : 's'}
                          </p>
                        )}
                      </div>
                        <span className="text-slate-400 flex-shrink-0 mt-0.5">
                          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </span>
                      </div>
                      <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:gap-2">
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-1.5 sm:px-2 py-1.5 min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Income</p>
                          <p className={`text-[11px] sm:text-xs font-bold tabular-nums mt-0.5 truncate ${moneyToneClass(row.totalIncome)}`}>
                            {formatMoneyPnL(row.totalIncome)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-1.5 sm:px-2 py-1.5 min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">OpEx</p>
                          <p className={`text-[11px] sm:text-xs font-bold tabular-nums mt-0.5 truncate ${moneyToneClass(row.totalExpenses)}`}>
                            {formatMoneyPnL(row.totalExpenses)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-emerald-50/70 border border-emerald-100 px-1.5 sm:px-2 py-1.5 min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-emerald-700/80 font-semibold">NOI</p>
                          <p className={`text-[11px] sm:text-xs font-bold tabular-nums mt-0.5 truncate ${moneyToneClass(row.netIncome)}`}>
                            {formatMoneyPnL(row.netIncome)}
                          </p>
                        </div>
                      </div>
                          </button>
                              <button
                                type="button"
                      onClick={() => openPropertyMonthly(row)}
                      className="mt-2.5 w-full inline-flex items-center justify-center rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 min-h-[40px]"
                    >
                      View breakdown
                              </button>
                  </div>
                  {expanded && (
                    <div className="px-3 pb-4 border-t border-indigo-100/80 pt-3">
                      <PropertyPnlDetail
                        row={row}
                        year={year}
                        isAdmin={isAdmin}
                        properties={properties}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        bellaMonthTotals={bellaMonthTotals}
                        setBellaMonthTotals={setBellaMonthTotals}
                        tomballMonthTotals={tomballMonthTotals}
                        setTomballMonthTotals={setTomballMonthTotals}
                        conroeMonthTotals={conroeMonthTotals}
                        setConroeMonthTotals={setConroeMonthTotals}
                        avenueQMonthTotals={avenueQMonthTotals}
                        setAvenueQMonthTotals={setAvenueQMonthTotals}
                        shermanMonthTotals={shermanMonthTotals}
                        setShermanMonthTotals={setShermanMonthTotals}
                        seventiethMonthTotals={seventiethMonthTotals}
                        setSeventiethMonthTotals={setSeventiethMonthTotals}
                        avenueHMonthTotals={avenueHMonthTotals}
                        setAvenueHMonthTotals={setAvenueHMonthTotals}
                        woodingMonthTotals={woodingMonthTotals}
                        setWoodingMonthTotals={setWoodingMonthTotals}
                        avenueFMonthTotals={avenueFMonthTotals}
                        setAvenueFMonthTotals={setAvenueFMonthTotals}
                      />
                            </div>
                          )}
                </div>
              );
            })
                      )}
          {hiddenPropertyCount > 0 && (
            <div className="px-3 py-3">
                        <button
                          type="button"
                onClick={viewMoreProperties}
                className="w-full rounded-xl border border-indigo-300 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-3 py-2.5 min-h-[44px] shadow-sm"
                        >
                View more properties ({hiddenPropertyCount})
                        </button>
                    </div>
          )}
                </div>

        {/* Desktop: Excel-style table */}
        <div className="hidden md:block overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[36rem] lg:min-w-[42rem] text-sm">
            <thead>
              <tr className="bg-amber-600 text-white">
                <th className="text-left font-semibold px-3 lg:px-4 py-3 w-[28%] lg:w-[32%]">Property</th>
                <th className="text-right font-semibold px-2 lg:px-4 py-3">
                  <span className="lg:hidden">Income</span>
                  <span className="hidden lg:inline">Total Income</span>
                </th>
                <th className="text-right font-semibold px-2 lg:px-4 py-3">
                  <span className="lg:hidden">OpEx</span>
                  <span className="hidden lg:inline">Total Operating Expenses</span>
                </th>
                <th className="text-right font-semibold px-2 lg:px-4 py-3">NOI</th>
                <th className="text-center font-semibold px-2 lg:px-3 py-3 whitespace-nowrap">Monthly</th>
                <th className="text-center font-semibold px-2 lg:px-3 py-3 w-10 lg:w-12"> </th>
                              </tr>
                            </thead>
                            <tbody>
              {visibleProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No properties found for {year}.
                                  </td>
                                </tr>
              ) : (
                visibleProperties.map((row) => {
                  const expanded = expandedProperty === row.groupKey;
                  const unitCount = row.units?.length || row.unitsCount || 0;
                  return (
                    <React.Fragment key={row.groupKey}>
                      <tr
                        className={`border-t border-slate-100 hover:bg-slate-50/80 transition-colors ${
                          expanded ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td
                          className="px-4 py-3 cursor-pointer"
                          onClick={() => togglePropertyExpand(row)}
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {row.propertyName || row.groupKey}
                            </p>
                            {unitCount > 0 && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {unitCount} unit{unitCount === 1 ? '' : 's'}
                              </p>
                            )}
                          </div>
                                </td>
                        <td
                          className={`px-4 py-3 text-right tabular-nums font-medium whitespace-nowrap cursor-pointer ${moneyToneClass(row.totalIncome)}`}
                          onClick={() => togglePropertyExpand(row)}
                        >
                          {formatMoneyPnL(row.totalIncome)}
                                </td>
                        <td
                          className={`px-4 py-3 text-right tabular-nums font-medium whitespace-nowrap cursor-pointer ${moneyToneClass(row.totalExpenses)}`}
                          onClick={() => togglePropertyExpand(row)}
                        >
                          {formatMoneyPnL(row.totalExpenses)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right tabular-nums font-bold whitespace-nowrap cursor-pointer ${moneyToneClass(row.netIncome)}`}
                          onClick={() => togglePropertyExpand(row)}
                        >
                          {formatMoneyPnL(row.netIncome)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPropertyMonthly(row);
                            }}
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-2 lg:px-2.5 py-1.5 min-h-[36px] whitespace-nowrap"
                          >
                            <span className="lg:hidden">Open</span>
                            <span className="hidden lg:inline">View breakdown</span>
                          </button>
                        </td>
                        <td
                          className="px-3 py-3 text-center text-slate-400 cursor-pointer"
                          onClick={() => togglePropertyExpand(row)}
                        >
                          {expanded ? <ChevronUp className="w-4 h-4 inline-block" /> : <ChevronDown className="w-4 h-4 inline-block" />}
                                </td>
                              </tr>
                      {expanded && (
                        <tr className="border-t border-indigo-100 bg-slate-50/60">
                          <td colSpan={6} className="px-3 sm:px-4 py-3 sm:py-4">
                            <PropertyPnlDetail
                              row={row}
                              year={year}
                              isAdmin={isAdmin}
                              properties={properties}
                              selectedMonth={selectedMonth}
                              setSelectedMonth={setSelectedMonth}
                              bellaMonthTotals={bellaMonthTotals}
                              setBellaMonthTotals={setBellaMonthTotals}
                              tomballMonthTotals={tomballMonthTotals}
                              setTomballMonthTotals={setTomballMonthTotals}
                              conroeMonthTotals={conroeMonthTotals}
                              setConroeMonthTotals={setConroeMonthTotals}
                              avenueQMonthTotals={avenueQMonthTotals}
                              setAvenueQMonthTotals={setAvenueQMonthTotals}
                              shermanMonthTotals={shermanMonthTotals}
                              setShermanMonthTotals={setShermanMonthTotals}
                              seventiethMonthTotals={seventiethMonthTotals}
                              setSeventiethMonthTotals={setSeventiethMonthTotals}
                              avenueHMonthTotals={avenueHMonthTotals}
                              setAvenueHMonthTotals={setAvenueHMonthTotals}
                              woodingMonthTotals={woodingMonthTotals}
                              setWoodingMonthTotals={setWoodingMonthTotals}
                              avenueFMonthTotals={avenueFMonthTotals}
                              setAvenueFMonthTotals={setAvenueFMonthTotals}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
          {hiddenPropertyCount > 0 && (
            <div className="px-4 py-3 border-t border-slate-100">
          <button
            type="button"
                onClick={viewMoreProperties}
                className="rounded-xl border border-indigo-300 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 min-h-[40px] shadow-sm"
          >
                View more properties ({hiddenPropertyCount})
          </button>
            </div>
        )}
        </div>
      </div>
      )}


      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-6 shadow-sm max-w-4xl min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="font-bold text-slate-800 text-base sm:text-lg">Recent Expenses ({year})</h3>
          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm min-h-[44px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add expense
          </button>
        </div>
        {expenseFeedback && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            {expenseFeedback}
          </div>
        )}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {expensesLoading ? (
            <p className="text-sm text-slate-400 text-center py-6">Loading recent expenses...</p>
          ) : filteredExpenses.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No expenses recorded yet.</p>
          ) : (
            filteredExpenses.map((e) => (
              <div key={e.id} className="flex items-start sm:items-center justify-between gap-2 border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition-colors min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-slate-800 break-words">
                    {e.propertyName || 'Portfolio'}
                    {e.unitLabel ? ` - ${e.unitLabel}` : ''}
                    {' - '}{CATEGORY_LABELS[e.category] || e.category}
                  </p>
                  <p className="text-xs text-slate-500 break-words">
                    {e.date}
                    {formatExpenseNote(e.notes) ? ` - ${formatExpenseNote(e.notes)}` : ''}
                  </p>
                </div>
                <p className="font-bold text-sm text-rose-700 ml-1 sm:ml-3 flex-shrink-0 tabular-nums">{formatMoney(e.amount)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {expenseSuccessPopup && (
        <ViewportPortal>
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            style={{ position: 'fixed', inset: 0 }}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-emerald-100 p-6 text-center animate-fade-in max-h-[min(92dvh,90vh)] overflow-y-auto">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Expense recorded</h3>
              <p className="text-2xl font-bold text-rose-700 mt-2">{formatMoney(expenseSuccessPopup.amount)}</p>
              <p className="text-sm text-slate-600 mt-2">
                {expenseSuccessPopup.propertyName || 'Property'}
                {expenseSuccessPopup.unitLabel ? ` - ${expenseSuccessPopup.unitLabel}` : ''}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {CATEGORY_LABELS[expenseSuccessPopup.category] || expenseSuccessPopup.category} - {expenseSuccessPopup.date}
              </p>
              <button
                type="button"
                onClick={() => setExpenseSuccessPopup(null)}
                className="mt-5 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700"
              >
                Done
              </button>
            </div>
          </div>
        </ViewportPortal>
      )}

      <AddExpenseModal
        open={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        properties={properties}
        role="admin"
        onCreated={(created) => {
          let existing: OperatingExpense | undefined;
          setExpenses((prev) => {
            existing = prev.find((e) => e.id === created.id);
            const withTimestamp: OperatingExpense = {
              ...created,
              createdAt: created.createdAt || new Date().toISOString(),
            };
            return [withTimestamp, ...prev.filter((e) => e.id !== created.id)].slice(0, 50);
          });
          // Sheet P&L properties are month-input only — do not fold recorded expenses into totals.
          const isSheetExpense =
            /bella\s*jess/i.test(created.propertyName || '') ||
            (/tomball|tomabll/i.test(created.propertyName || '') && !/bella\s*jess/i.test(created.propertyName || '')) ||
            /conroe/i.test(created.propertyName || '') ||
            /avenue\s*q|ave\.?\s*q|aveq/i.test(created.propertyName || '');
          if (!isSheetExpense) {
          setSummary((s) => {
            if (!s) return s;
            if (!existing) return applyExpenseDelta(s, created, created.amount);
            let next = applyExpenseDelta(s, existing, -existing.amount);
            return applyExpenseDelta(next, created, created.amount);
          });
          }
          setExpenseSuccessPopup(created);
          setExpenseFeedback(
            `Expense recorded - ${formatMoney(created.amount)} for ${created.propertyName || 'property'}${created.unitLabel ? ` - ${created.unitLabel}` : ''}.`,
          );
        }}
      />
    </div>
  );
};

export default IncomeStatementView;

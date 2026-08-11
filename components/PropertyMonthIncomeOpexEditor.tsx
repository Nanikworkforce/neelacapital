import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import {
  computeMonthSummary,
  mergeFinancingLines,
  mergeIncomeLines,
  mergeOpexLines,
  type MonthOverviewInputs,
  type PnlLine,
} from '../utils/bellaJessPnl2026';
import {
  mergeTomballFinancingLines,
  mergeTomballIncomeLines,
  mergeTomballOpexLines,
} from '../utils/tomballPnl2026';
import {
  mergeConroeFinancingLines,
  mergeConroeIncomeLines,
  mergeConroeOpexLines,
} from '../utils/conroePnl2026';
import {
  mergeAvenueQFinancingLines,
  mergeAvenueQIncomeLines,
  mergeAvenueQOpexLines,
} from '../utils/avenueQPnl2026';

export type SheetPnlKind = 'bella' | 'tomball' | 'conroe' | 'avenueq';

const mergeIncomeForSheet = (
  kind: SheetPnlKind,
  saved: Partial<PnlLine>[] | null | undefined,
  month: number,
  useSheetDefaults: boolean,
) => {
  if (kind === 'tomball') return mergeTomballIncomeLines(saved, month, useSheetDefaults);
  if (kind === 'conroe') return mergeConroeIncomeLines(saved, month, useSheetDefaults);
  if (kind === 'avenueq') return mergeAvenueQIncomeLines(saved, month, useSheetDefaults);
  return mergeIncomeLines(saved, month, useSheetDefaults);
};

const mergeOpexForSheet = (
  kind: SheetPnlKind,
  saved: Partial<PnlLine>[] | null | undefined,
  month: number,
  useSheetDefaults: boolean,
) => {
  if (kind === 'tomball') return mergeTomballOpexLines(saved, month, useSheetDefaults);
  if (kind === 'conroe') return mergeConroeOpexLines(saved, month, useSheetDefaults);
  if (kind === 'avenueq') return mergeAvenueQOpexLines(saved, month, useSheetDefaults);
  return mergeOpexLines(saved, month, useSheetDefaults);
};

const mergeFinancingForSheet = (
  kind: SheetPnlKind,
  saved: Partial<PnlLine>[] | null | undefined,
  overview: MonthOverviewInputs | null | undefined,
  month: number,
  useSheetDefaults: boolean,
) => {
  if (kind === 'tomball') return mergeTomballFinancingLines(saved, month, useSheetDefaults);
  if (kind === 'conroe') return mergeConroeFinancingLines(saved, month, useSheetDefaults);
  if (kind === 'avenueq') return mergeAvenueQFinancingLines(saved, month, useSheetDefaults);
  return mergeFinancingLines(saved, overview, month, useSheetDefaults);
};

const formatMoneyPnL = (value: number) => {
  const n = value || 0;
  const abs = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n < 0) return `($${abs})`;
  return `$${abs}`;
};

const moneyToneClass = (value: number) => {
  if (value > 0) return 'text-emerald-700';
  if (value < 0) return 'text-rose-700';
  return 'text-slate-700';
};

const formatPct = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(2)}%`;
};

const pctToneClass = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) return 'text-slate-500';
  if (value > 0) return 'text-emerald-700';
  if (value < 0) return 'text-rose-700';
  return 'text-slate-700';
};

type Props = {
  propertyId: string;
  year: number;
  month: number;
  unitLabel?: string;
  /** e.g. "January 2026" */
  monthTitle?: string;
  /** Purchase / down / land / dep years for calculated lines. */
  overview?: MonthOverviewInputs | null;
  /** Cap Rate + Cash-on-Cash — admin only. */
  showPerformanceMetrics?: boolean;
  /** When false, hide financing + summary (legacy). Default true. */
  showFinancingAndSummary?: boolean;
  /** Use sheet seed amounts (Bella Jess / Tomball / Conroe 2026). */
  useSheetDefaults?: boolean;
  /** Which property sheet seeds to load when useSheetDefaults is true. */
  sheetKind?: SheetPnlKind;
  /** Optional admin-only Property Overview block rendered above Income. */
  overviewSlot?: React.ReactNode;
  /** Optional admin overview save hook run before month lines save. */
  onSaveOverview?: () => Promise<void>;
  /** When true, sticky Save chrome is hidden — parent owns the Save button. */
  externalSaveControl?: boolean;
  /** Parent registers this to trigger save from an external button. */
  saveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  onSavingChange?: (saving: boolean) => void;
  onSaved?: (totals: { income: number; expenses: number; net: number }) => void;
};

const PropertyMonthIncomeOpexEditor: React.FC<Props> = ({
  propertyId,
  year,
  month,
  unitLabel = 'Door 1',
  monthTitle,
  overview,
  showPerformanceMetrics = false,
  showFinancingAndSummary = true,
  useSheetDefaults = true,
  sheetKind: sheetKindProp = 'bella',
  overviewSlot,
  onSaveOverview,
  externalSaveControl = false,
  saveRef,
  onSavingChange,
  onSaved,
}) => {
  const sheetKind: SheetPnlKind = sheetKindProp;
  const incomeSectionTitle = sheetKind === 'avenueq' ? 'INCOME — 4 Plex' : 'INCOME';
  const displayUnitLabel = sheetKind === 'avenueq' ? (unitLabel === 'Door 1' ? '4-Plex' : unitLabel) : unitLabel;
  const [incomeLines, setIncomeLines] = useState<PnlLine[]>(() =>
    mergeIncomeForSheet(sheetKind, null, month, useSheetDefaults),
  );
  const [opexLines, setOpexLines] = useState<PnlLine[]>(() =>
    mergeOpexForSheet(sheetKind, null, month, useSheetDefaults),
  );
  const [financingLines, setFinancingLines] = useState<PnlLine[]>(() =>
    mergeFinancingForSheet(sheetKind, null, overview, month, useSheetDefaults),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);
  /** Backend-computed rollups after load/save — source of truth for saved totals. */
  const [backendSummary, setBackendSummary] = useState<{
    totalEffectiveIncome: number;
    totalOpex: number;
    mortgageInterest: number;
    principalRepayment: number;
    noi: number;
    cashFlowBeforeTax: number;
    annualDepreciation: number;
    depreciation: number;
    netProfit: number;
    cashInvested: number;
    capRatePct: number | null;
    cashOnCashPct: number | null;
  } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!propertyId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setStatus(null);
      try {
        const row = await api.getPropertyMonthInput({
          property: propertyId,
          year,
          month,
          unitLabel,
        });
        if (cancelled) return;
        if (row) {
          setIncomeLines(mergeIncomeForSheet(sheetKind, row.incomeLines, month, useSheetDefaults));
          setOpexLines(mergeOpexForSheet(sheetKind, row.opexLines, month, useSheetDefaults));
          const finSaved = Array.isArray(row.financingLines) && row.financingLines.length
            ? row.financingLines
            : null;
          setFinancingLines(mergeFinancingForSheet(sheetKind, finSaved, overview, month, useSheetDefaults));
          setUpdatedByName(row.updatedByName || null);
          setBackendSummary(row.computed || null);
          setDirty(false);
        } else {
          setIncomeLines(mergeIncomeForSheet(sheetKind, null, month, useSheetDefaults));
          setOpexLines(mergeOpexForSheet(sheetKind, null, month, useSheetDefaults));
          setFinancingLines(mergeFinancingForSheet(sheetKind, null, overview, month, useSheetDefaults));
          setUpdatedByName(null);
          setBackendSummary(null);
          setDirty(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load month inputs');
          setIncomeLines(mergeIncomeForSheet(sheetKind, null, month, useSheetDefaults));
          setOpexLines(mergeOpexForSheet(sheetKind, null, month, useSheetDefaults));
          setFinancingLines(mergeFinancingForSheet(sheetKind, null, overview, month, useSheetDefaults));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [propertyId, year, month, unitLabel, useSheetDefaults, sheetKind]);

  // Overview edits (purchase/land/dep) invalidate cached backend rollups for live preview.
  useEffect(() => {
    setBackendSummary(null);
  }, [
    overview?.purchasePrice,
    overview?.downPayment,
    overview?.closingCost,
    overview?.landValue,
    overview?.depreciationYears,
  ]);

  const localSummary = computeMonthSummary(incomeLines, opexLines, financingLines, overview, {
    includePerformance: showPerformanceMetrics,
  });
  // While editing, show live local math; after save/load, prefer backend computed.
  const summary = !dirty && backendSummary
    ? {
        totalEffectiveIncome: backendSummary.totalEffectiveIncome,
        totalOpex: backendSummary.totalOpex,
        mortgageInterest: backendSummary.mortgageInterest,
        principalRepayment: backendSummary.principalRepayment,
        noi: backendSummary.noi,
        cashFlowBeforeTax: backendSummary.cashFlowBeforeTax,
        annualDepreciation: backendSummary.annualDepreciation,
        depreciation: backendSummary.depreciation,
        netProfit: backendSummary.netProfit,
        cashInvested: backendSummary.cashInvested,
        capRatePct: showPerformanceMetrics ? backendSummary.capRatePct : null,
        cashOnCashPct: showPerformanceMetrics ? backendSummary.cashOnCashPct : null,
      }
    : localSummary;

  const setIncomeAmount = (key: string, raw: string) => {
    const amount = raw === '' || raw === '-' ? 0 : Number(raw);
    setDirty(true);
    setIncomeLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, amount: Number.isFinite(amount) ? amount : 0 } : l)),
    );
  };

  const setOpexAmount = (key: string, raw: string) => {
    const amount = raw === '' || raw === '-' ? 0 : Number(raw);
    setDirty(true);
    setOpexLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, amount: Number.isFinite(amount) ? amount : 0 } : l)),
    );
  };

  const setFinancingAmount = (key: string, raw: string) => {
    const amount = raw === '' || raw === '-' ? 0 : Number(raw);
    setDirty(true);
    setFinancingLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, amount: Number.isFinite(amount) ? amount : 0 } : l)),
    );
  };

  const save = async () => {
    if (!propertyId || saving) return;
    setSaving(true);
    onSavingChange?.(true);
    setError(null);
    setStatus(null);
    try {
      if (onSaveOverview) {
        await onSaveOverview();
      }
      const saved = await api.upsertPropertyMonthInput({
        property: propertyId,
        year,
        month,
        unitLabel,
        incomeLines,
        opexLines,
        financingLines,
      });
      const nextIncome = mergeIncomeForSheet(sheetKind, saved.incomeLines, month, useSheetDefaults);
      const nextOpex = mergeOpexForSheet(sheetKind, saved.opexLines, month, useSheetDefaults);
      const finSaved = Array.isArray(saved.financingLines) && saved.financingLines.length
        ? saved.financingLines
        : null;
      const nextFin = mergeFinancingForSheet(sheetKind, finSaved, overview, month, useSheetDefaults);
      setIncomeLines(nextIncome);
      setOpexLines(nextOpex);
      setFinancingLines(nextFin);
      setUpdatedByName(saved.updatedByName || null);
      setBackendSummary(saved.computed || null);
      setDirty(false);
      setStatus('Saved — totals recalculated');
      window.setTimeout(() => setStatus(null), 4500);
      const c = saved.computed;
      if (c) {
        onSaved?.({ income: c.totalEffectiveIncome, expenses: c.totalOpex, net: c.noi });
      } else {
        const s = computeMonthSummary(nextIncome, nextOpex, nextFin, overview, {
          includePerformance: showPerformanceMetrics,
        });
        onSaved?.({ income: s.totalEffectiveIncome, expenses: s.totalOpex, net: s.noi });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  };

  useEffect(() => {
    if (!saveRef) return;
    saveRef.current = save;
    return () => {
      saveRef.current = null;
    };
  });

  const title = monthTitle || null;

  if (!propertyId) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Property id not found — cannot edit month inputs yet.
      </p>
    );
  }

  return (
    <div className="space-y-3 min-w-0 max-w-full">
      {!externalSaveControl && (
        <div className="sticky top-0 z-20 -mx-3 sm:-mx-5 px-3 sm:px-5 py-2.5 mb-1 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {title && (
              <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate min-w-0 flex-1">
                {title}
              </h4>
            )}
            <button
              type="button"
              onClick={save}
              disabled={saving || loading}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 min-h-[44px] flex-shrink-0 ml-auto"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {(status || error) && (
        <div className="space-y-2">
          {status && (
            <p className="text-sm text-emerald-900 bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{status}</span>
            </p>
          )}
          {error && (
            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Loading…</p>}

      {overviewSlot}

      <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 -mx-0.5 max-w-full">
        <table className="w-full text-xs sm:text-sm table-fixed">
          <colgroup>
            <col className="w-[58%]" />
            <col className="w-[42%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-200">
              <th className="text-left px-2.5 sm:px-3 py-2 font-bold" colSpan={2}>
                {incomeSectionTitle}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-2.5 sm:px-3 py-2 italic text-amber-800 break-words">{displayUnitLabel}</td>
              <td className={`px-2.5 sm:px-3 py-2 text-right tabular-nums font-semibold whitespace-nowrap ${moneyToneClass(summary.totalEffectiveIncome)}`}>
                {formatMoneyPnL(summary.totalEffectiveIncome)}
              </td>
            </tr>
            {incomeLines.map((l) => (
              <tr key={l.key} className="border-t border-slate-100">
                <td className={`px-2.5 sm:px-3 py-2 pr-2 align-middle break-words leading-snug ${l.accent ? 'italic text-amber-800' : ''}`}>{l.label}</td>
                <td className="px-2 sm:px-3 py-1.5 text-right align-middle">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={l.amount}
                    onChange={(e) => setIncomeAmount(l.key, e.target.value)}
                    className={`w-full max-w-[7.25rem] sm:max-w-[8.5rem] ml-auto block rounded-md border border-slate-200 px-2 py-1.5 text-right tabular-nums text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 min-h-[40px] sm:min-h-[36px] ${moneyToneClass(l.amount)}`}
                    disabled={loading || saving}
                  />
                </td>
              </tr>
            ))}
            <tr className="border-t bg-emerald-50 font-bold">
              <td className="px-2.5 sm:px-3 py-2.5 break-words leading-snug">Total Effective Income</td>
              <td className={`px-2.5 sm:px-3 py-2.5 text-right tabular-nums whitespace-nowrap ${moneyToneClass(summary.totalEffectiveIncome)}`}>
                {formatMoneyPnL(summary.totalEffectiveIncome)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 -mx-0.5 max-w-full">
        <table className="w-full text-xs sm:text-sm table-fixed">
          <colgroup>
            <col className="w-[58%]" />
            <col className="w-[42%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-200">
              <th className="text-left px-2.5 sm:px-3 py-2 font-bold" colSpan={2}>
                OPERATING EXPENSES
              </th>
            </tr>
          </thead>
          <tbody>
            {opexLines.map((l) => (
              <tr key={l.key} className="border-t border-slate-100">
                <td className={`px-2.5 sm:px-3 py-2 pr-2 align-middle break-words leading-snug ${l.accent ? 'italic text-amber-800' : ''}`}>{l.label}</td>
                <td className="px-2 sm:px-3 py-1.5 text-right align-middle">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={l.amount}
                    onChange={(e) => setOpexAmount(l.key, e.target.value)}
                    className={`w-full max-w-[7.25rem] sm:max-w-[8.5rem] ml-auto block rounded-md border border-slate-200 px-2 py-1.5 text-right tabular-nums text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 min-h-[40px] sm:min-h-[36px] ${moneyToneClass(l.amount)}`}
                    disabled={loading || saving}
                  />
                </td>
              </tr>
            ))}
            <tr className="border-t bg-emerald-50 font-bold">
              <td className="px-2.5 sm:px-3 py-2.5 break-words leading-snug">Total Operating Expenses</td>
              <td className={`px-2.5 sm:px-3 py-2.5 text-right tabular-nums whitespace-nowrap ${moneyToneClass(summary.totalOpex)}`}>
                {formatMoneyPnL(summary.totalOpex)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {showFinancingAndSummary && (
        <>
          <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 -mx-0.5 max-w-full">
            <table className="w-full text-xs sm:text-sm table-fixed">
              <colgroup>
                <col className="w-[58%]" />
                <col className="w-[42%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-200">
                  <th className="text-left px-2.5 sm:px-3 py-2 font-bold" colSpan={2}>
                    FINANCING EXPENSES
                  </th>
                </tr>
              </thead>
              <tbody>
                {financingLines.map((l) => (
                  <tr key={l.key} className="border-t border-slate-100">
                    <td className="px-2.5 sm:px-3 py-2 pr-2 align-middle break-words leading-snug">{l.label}</td>
                    <td className="px-2 sm:px-3 py-1.5 text-right align-middle">
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={l.amount}
                        onChange={(e) => setFinancingAmount(l.key, e.target.value)}
                        className={`w-full max-w-[7.25rem] sm:max-w-[8.5rem] ml-auto block rounded-md border border-slate-200 px-2 py-1.5 text-right tabular-nums text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 min-h-[40px] sm:min-h-[36px] ${moneyToneClass(l.amount)}`}
                        disabled={loading || saving}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 -mx-0.5 max-w-full">
            <table className="w-full text-xs sm:text-sm table-fixed">
              <colgroup>
                <col className="w-[58%]" />
                <col className="w-[42%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-200">
                  <th className="text-left px-2.5 sm:px-3 py-2 font-bold" colSpan={2}>
                    SUMMARY
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-2.5 sm:px-3 py-2 pr-2 break-words leading-snug">
                    <span className="sm:hidden">NOI</span>
                    <span className="hidden sm:inline">Net Operating Income (NOI)</span>
                  </td>
                  <td className={`px-2.5 sm:px-3 py-2 text-right tabular-nums font-bold whitespace-nowrap ${moneyToneClass(summary.noi)}`}>
                    {formatMoneyPnL(summary.noi)}
                  </td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-2.5 sm:px-3 py-2 pr-2 break-words leading-snug">Cash Flow Before Tax</td>
                  <td className={`px-2.5 sm:px-3 py-2 text-right tabular-nums font-semibold whitespace-nowrap ${moneyToneClass(summary.cashFlowBeforeTax)}`}>
                    {formatMoneyPnL(summary.cashFlowBeforeTax)}
                  </td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-2.5 sm:px-3 py-2 pr-2 break-words leading-snug">Depreciation (Non-cash)</td>
                  <td className={`px-2.5 sm:px-3 py-2 text-right tabular-nums whitespace-nowrap ${moneyToneClass(summary.depreciation)}`}>
                    {formatMoneyPnL(summary.depreciation)}
                  </td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-2.5 sm:px-3 py-2 pr-2 break-words leading-snug">
                    <span className="sm:hidden">Net Profit</span>
                    <span className="hidden sm:inline">Net Profit (for Tax Reporting)</span>
                  </td>
                  <td className={`px-2.5 sm:px-3 py-2 text-right tabular-nums font-semibold whitespace-nowrap ${moneyToneClass(summary.netProfit)}`}>
                    {formatMoneyPnL(summary.netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {showPerformanceMetrics && (
            <div className="overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 -mx-0.5 max-w-full">
              <table className="w-full text-xs sm:text-sm table-fixed">
                <colgroup>
                  <col className="w-[58%]" />
                  <col className="w-[42%]" />
                </colgroup>
                <thead>
                  <tr className="bg-slate-200">
                    <th className="text-left px-2.5 sm:px-3 py-2 font-bold" colSpan={2}>
                      PERFORMANCE METRICS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-2.5 sm:px-3 py-2 pr-2 break-words leading-snug">
                      <span className="sm:hidden">Cap Rate</span>
                      <span className="hidden sm:inline">Cap Rate (NOI / Purchase Price)</span>
                    </td>
                    <td className={`px-2.5 sm:px-3 py-2 text-right tabular-nums font-semibold whitespace-nowrap ${pctToneClass(summary.capRatePct)}`}>
                      {formatPct(summary.capRatePct)}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-2.5 sm:px-3 py-2 pr-2 break-words leading-snug">
                      <span className="sm:hidden">Cash-on-Cash</span>
                      <span className="hidden sm:inline">Cash-on-Cash Return (Cash Flow / Down Payment)</span>
                    </td>
                    <td className={`px-2.5 sm:px-3 py-2 text-right tabular-nums font-semibold whitespace-nowrap ${pctToneClass(summary.cashOnCashPct)}`}>
                      {formatPct(summary.cashOnCashPct)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyMonthIncomeOpexEditor;

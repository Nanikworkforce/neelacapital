import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft, ArrowRight, Building2, Calendar, CheckCircle2, ChevronDown, ChevronRight, ChevronUp,
  FileText, Home, Loader2, Plus, Receipt, Tag, Wallet, X,
} from 'lucide-react';
import { api } from '../services/api';
import { OperatingExpense, Property, PropertyUnit } from '../types';
import {
  expenseLinesForRole,
  ExpenseLineItem,
  groupPropertiesForSelect,
  resolvePropertyIdForExpense,
} from '../utils/propertyGrouping';

type Role = 'admin' | 'manager';
type Step = 'property' | 'unit' | 'line' | 'details';

interface Props {
  open: boolean;
  onClose: () => void;
  properties: Property[];
  role: Role;
  onCreated?: (expense: OperatingExpense) => void;
}

const formatMoney = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function dedupeUnits(rows: PropertyUnit[]): PropertyUnit[] {
  const seen = new Set<string>();
  const out: PropertyUnit[] = [];
  for (const u of rows) {
    const key = (u.label || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(u);
  }
  return out;
}

function expenseTitle(e: OperatingExpense) {
  const first = (e.notes || '').split(' · ')[0]?.trim();
  return first || e.category.replace(/_/g, ' ');
}

const GROUP_META: Record<ExpenseLineItem['group'], { label: string; hint: string; tone: string }> = {
  general: {
    label: 'General Expenses',
    hint: 'Insurance, taxes, HOA, legal…',
    tone: 'from-sky-50 to-white border-sky-100 hover:border-sky-300',
  },
  unit: {
    label: 'Unit / Operating',
    hint: 'Repairs, utilities, cleaning, supplies…',
    tone: 'from-emerald-50 to-white border-emerald-100 hover:border-emerald-300',
  },
  financing: {
    label: 'Financing',
    hint: 'Mortgage, depreciation — below NOI',
    tone: 'from-amber-50 to-white border-amber-100 hover:border-amber-300',
  },
};

function StepDots({ step, steps }: { step: Step; steps: Step[] }) {
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i === idx ? 'w-6 bg-white' : i < idx ? 'w-1.5 bg-white/70' : 'w-1.5 bg-white/30'
          }`}
        />
      ))}
    </div>
  );
}

function ChoiceCard({
  title,
  subtitle,
  selected,
  onClick,
  icon: Icon,
  tone = 'from-slate-50 to-white border-slate-100 hover:border-indigo-300',
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick: () => void;
  icon?: React.ElementType;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 transition-all active:scale-[0.98] touch-manipulation min-h-[3.25rem] ${
        selected
          ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-200'
          : `bg-gradient-to-br ${tone} shadow-sm hover:shadow-md`
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        {Icon && (
          <div className={`p-2 sm:p-2.5 rounded-xl flex-shrink-0 ${selected ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-100'}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className={`font-bold text-sm sm:text-base leading-snug line-clamp-2 ${selected ? 'text-indigo-900' : 'text-slate-900'}`}>
            {title}
          </p>
          {subtitle && (
            <p className={`text-[11px] sm:text-xs mt-0.5 line-clamp-2 ${selected ? 'text-indigo-700' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-indigo-500' : 'text-slate-300'}`} />
      </div>
    </button>
  );
}

const AddExpenseModal: React.FC<Props> = ({ open, onClose, properties, role, onCreated }) => {
  const groups = useMemo(() => groupPropertiesForSelect(properties), [properties]);
  const lineItems = useMemo(() => expenseLinesForRole(role), [role]);

  const [step, setStep] = useState<Step>('property');
  const [lineGroup, setLineGroup] = useState<ExpenseLineItem['group'] | null>(null);
  const [groupKey, setGroupKey] = useState('');
  const [unitId, setUnitId] = useState('');
  /** none until user explicitly taps Building-wide or a unit (avoids auto-picking building-wide). */
  const [unitChoice, setUnitChoice] = useState<'none' | 'building' | 'unit'>('none');
  const [lineId, setLineId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedThisSession, setAddedThisSession] = useState<OperatingExpense[]>([]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const selectedGroup = groups.find((g) => g.groupKey === groupKey);
  const selectedLine = lineItems.find((l) => l.id === lineId);
  const showUnitStep = units.length > 1;
  const selectedUnit = units.find((u) => u.id === unitId);

  const availableLineGroups = useMemo(() => {
    const set = new Set(lineItems.map((l) => l.group));
    return (['general', 'unit', 'financing'] as const).filter((g) => set.has(g));
  }, [lineItems]);

  const linesInGroup = useMemo(
    () => (lineGroup ? lineItems.filter((l) => l.group === lineGroup) : []),
    [lineItems, lineGroup],
  );

  const wizardSteps = useMemo(() => {
    const s: Step[] = ['property'];
    if (showUnitStep) s.push('unit');
    s.push('line', 'details');
    return s;
  }, [showUnitStep]);

  useEffect(() => {
    if (!open) return;
    setStep('property');
    setLineGroup(null);
    setGroupKey('');
    setUnitId('');
    setUnitChoice('none');
    setLineId('');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setUnits([]);
    setError(null);
    setAddedThisSession([]);
    setExpandedSessionId(null);

    // Lock page scroll — modal lives in a portal, but parent layouts still scroll.
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [open]);

  useEffect(() => {
    if (!selectedGroup?.propertyId) {
      setUnits([]);
      setUnitId('');
      setUnitChoice('none');
      return;
    }
    let cancelled = false;
    setUnitsLoading(true);
    setUnitChoice('none');
    setUnitId('');
    api.getPropertyUnits(selectedGroup.propertyId)
      .then((rows) => {
        if (cancelled) return;
        const next = dedupeUnits(rows);
        setUnits(next);
        // Single-door properties: no choice to make — skip unit step.
        if (step === 'unit' && next.length <= 1) {
          setUnitChoice(next[0]?.id ? 'unit' : 'building');
          setUnitId(next[0]?.id || '');
          setStep('line');
        }
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = dedupeUnits((selectedGroup.units || [])
          .filter((u) => u.propertyId !== selectedGroup.propertyId)
          .map((u, i) => ({
            id: '',
            property: selectedGroup.propertyId,
            label: u.label,
            monthlyRent: 0,
            status: 'vacant' as const,
            sortOrder: i,
          })));
        setUnits(fallback);
        if (step === 'unit' && fallback.length <= 1) {
          setUnitChoice(fallback[0]?.id ? 'unit' : 'building');
          setUnitId(fallback[0]?.id || '');
          setStep('line');
        }
      })
      .finally(() => {
        if (!cancelled) setUnitsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedGroup?.propertyId]);

  if (!open) return null;

  const canSave =
    !!groupKey &&
    !!lineId &&
    !!amount &&
    Number(amount) > 0 &&
    !!date &&
    !saving;

  const goNextFromProperty = () => {
    if (!groupKey) return;
    if (showUnitStep) setStep('unit');
    else setStep('line');
  };

  const goBack = () => {
    setError(null);
    if (step === 'details') {
      setStep('line');
      return;
    }
    if (step === 'line') {
      if (lineGroup) {
        setLineId('');
        setLineGroup(null);
        return;
      }
      setStep(showUnitStep ? 'unit' : 'property');
      return;
    }
    if (step === 'unit') setStep('property');
  };

  const goForward = () => {
    setError(null);
    if (step === 'property') {
      goNextFromProperty();
      return;
    }
    if (step === 'unit') {
      if (unitChoice === 'none' || unitsLoading) return;
      setStep('line');
      return;
    }
    if (step === 'line' && lineId) {
      setStep('details');
    }
  };

  const canGoForward =
    (step === 'property' && !!groupKey) ||
    (step === 'unit' && unitChoice !== 'none' && !unitsLoading) ||
    (step === 'line' && !!lineId);

  const resetForAnother = () => {
    setLineGroup(null);
    setLineId('');
    setAmount('');
    setNotes('');
    setStep('line');
    setError(null);
  };

  const saveExpense = async (andAnother: boolean) => {
    if (!canSave || !selectedGroup || !selectedLine) return;
    const propertyId = resolvePropertyIdForExpense(groups, groupKey);
    if (!propertyId) {
      setError('Could not resolve property. Pick again.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Prefer the id already chosen in the wizard. If it went stale, backend rematches by label.
      let resolvedUnitId = unitId;
      if (unitId && !units.some((u) => u.id === unitId)) {
        const label = selectedUnit?.label || units.find((u) => u.id === unitId)?.label;
        const rematch = label
          ? units.find((u) => u.label.toLowerCase() === label.toLowerCase())
          : undefined;
        resolvedUnitId = rematch?.id || '';
        if (resolvedUnitId) setUnitId(resolvedUnitId);
      }
      const unitLabel = selectedUnit?.label
        || units.find((u) => u.id === resolvedUnitId)?.label
        || units.find((u) => u.id === unitId)?.label;
      const noteParts = [selectedLine.label, notes.trim(), unitLabel ? `Unit: ${unitLabel}` : '']
        .filter(Boolean);
      const created = await api.createOperatingExpense({
        property: propertyId,
        unit: resolvedUnitId || undefined,
        amount: Number(amount),
        category: selectedLine.category,
        date,
        notes: noteParts.join(' · ').slice(0, 255),
        visibility: selectedLine.visibility,
      });
      setAddedThisSession((prev) => [created, ...prev]);
      onCreated?.(created);
      if (andAnother) resetForAnother();
      else onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save expense.');
    } finally {
      setSaving(false);
    }
  };

  const openSessionEdit = (e: OperatingExpense) => {
    if (expandedSessionId === e.id) {
      setExpandedSessionId(null);
      return;
    }
    setExpandedSessionId(e.id);
    setEditAmount(String(e.amount));
    setEditDate(e.date);
    // Keep free-text notes after the first " · " segment (line label)
    const parts = (e.notes || '').split(' · ');
    setEditNotes(parts.length > 1 ? parts.slice(1).filter((p) => !p.startsWith('Unit:')).join(' · ') : '');
    setError(null);
  };

  const saveSessionEdit = async (e: OperatingExpense) => {
    if (!editAmount || Number(editAmount) <= 0 || !editDate) {
      setError('Enter a valid amount and date.');
      return;
    }
    setEditSaving(true);
    setError(null);
    try {
      const lineLabel = expenseTitle(e);
      const unitPart = (e.notes || '').split(' · ').find((p) => p.startsWith('Unit:'));
      const noteParts = [lineLabel, editNotes.trim(), unitPart || ''].filter(Boolean);
      const updated = await api.updateOperatingExpense(e.id, {
        amount: Number(editAmount),
        date: editDate,
        notes: noteParts.join(' · '),
      });
      setAddedThisSession((prev) => prev.map((row) => (row.id === e.id ? updated : row)));
      onCreated?.(updated);
      setExpandedSessionId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update expense.');
    } finally {
      setEditSaving(false);
    }
  };

  const stepTitle =
    step === 'property' ? 'Choose property'
    : step === 'unit' ? 'Choose unit'
    : step === 'line' ? (lineGroup ? GROUP_META[lineGroup].label : 'What are you logging?')
    : 'Amount & details';

  const stepHint =
    step === 'property' ? 'Tap a building card to continue'
    : step === 'unit' ? 'Tap building-wide or a unit, then Next'
    : step === 'line' ? (lineGroup ? 'Tap the exact line item' : 'Pick a category, then the line')
    : 'Enter amount, then save or add another';

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      style={{ position: 'fixed', inset: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-lg lg:max-w-xl max-h-[min(94dvh,820px)] sm:max-h-[min(90dvh,760px)] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-expense-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag affordance */}
        <div className="sm:hidden flex justify-center pt-2 pb-0 flex-shrink-0" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white px-4 sm:px-5 pt-3 pb-4 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <Receipt className="w-4 h-4 opacity-90 flex-shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Add expense</p>
              </div>
              <h2 id="add-expense-title" className="font-bold text-lg sm:text-xl tracking-tight line-clamp-2">
                {stepTitle}
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm mt-0.5 line-clamp-2">{stepHint}</p>
              <div className="mt-2.5 sm:mt-3">
                <StepDots step={step} steps={wizardSteps} />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 -mr-1 rounded-xl hover:bg-white/15 transition-colors flex-shrink-0 touch-manipulation"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {(selectedGroup || selectedLine) && (
            <div className="mt-3 flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
              {selectedGroup && (
                <span className="text-[11px] font-semibold bg-white/15 px-2.5 py-1 rounded-full max-w-full truncate">
                  {selectedGroup.label}
                </span>
              )}
              {selectedUnit && (
                <span className="text-[11px] font-semibold bg-white/15 px-2.5 py-1 rounded-full max-w-[10rem] truncate">
                  {selectedUnit.label}
                </span>
              )}
              {unitChoice === 'building' && showUnitStep && step !== 'property' && step !== 'unit' && (
                <span className="text-[11px] font-semibold bg-white/15 px-2.5 py-1 rounded-full">
                  Building-wide
                </span>
              )}
              {selectedLine && (
                <span className="text-[11px] font-semibold bg-white/15 px-2.5 py-1 rounded-full max-w-full truncate">
                  {selectedLine.label}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-5 py-3 sm:py-4 space-y-2.5 sm:space-y-3">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 font-medium">
              {error}
            </div>
          )}

          {addedThisSession.length > 0 && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Added this session ({addedThisSession.length})
              </p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {addedThisSession.map((e) => {
                  const open = expandedSessionId === e.id;
                  return (
                    <div key={e.id} className="rounded-xl border border-emerald-100 bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => openSessionEdit(e)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left touch-manipulation"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{expenseTitle(e)}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {e.propertyName || 'Property'}
                            {e.unitLabel ? ` · ${e.unitLabel}` : ''}
                            {e.date ? ` · ${e.date}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-bold text-rose-700 text-sm tabular-nums">{formatMoney(e.amount)}</span>
                          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>
                      {open && (
                        <div className="px-3 pb-3 pt-1 border-t border-emerald-50 space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-slate-500">Amount</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="0.01"
                                  className="w-full border border-slate-200 rounded-lg pl-6 pr-2 py-2 text-base font-semibold bg-slate-50"
                                  value={editAmount}
                                  onChange={(ev) => setEditAmount(ev.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-slate-500">Date</label>
                              <input
                                type="date"
                                className="w-full border border-slate-200 rounded-lg px-2 py-2 text-base bg-slate-50"
                                value={editDate}
                                onChange={(ev) => setEditDate(ev.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-500">Notes</label>
                            <input
                              className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-base bg-slate-50"
                              value={editNotes}
                              onChange={(ev) => setEditNotes(ev.target.value)}
                              placeholder="Optional"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedSessionId(null)}
                              className="flex-1 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={editSaving}
                              onClick={() => saveSessionEdit(e)}
                              className="flex-1 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white disabled:opacity-50"
                            >
                              {editSaving ? 'Saving…' : 'Update'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'property' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {groups.map((g) => (
                <ChoiceCard
                  key={g.groupKey}
                  icon={Building2}
                  title={g.label}
                  subtitle={g.address || (g.units.length > 1 ? `${g.units.length} units` : 'Property')}
                  selected={groupKey === g.groupKey}
                  onClick={() => {
                    setGroupKey(g.groupKey);
                    setUnitId('');
                    setUnitChoice('none');
                    setLineId('');
                    setLineGroup(null);
                    // Go to unit step when the group has multiple doors; otherwise skip.
                    setTimeout(() => {
                      if (g.units.length > 1) setStep('unit');
                      else {
                        setUnitChoice('building');
                        setStep('line');
                      }
                    }, 120);
                  }}
                />
              ))}
              {groups.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8 sm:col-span-2">No properties available.</p>
              )}
            </div>
          )}

          {step === 'unit' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {unitsLoading ? (
                <div className="sm:col-span-2 flex items-center justify-center gap-2 py-10 text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading units…
                </div>
              ) : (
                <>
                  <p className="sm:col-span-2 text-xs text-slate-500 font-medium px-0.5">
                    Choose one option, then tap <span className="font-bold text-slate-700">Next</span>.
                  </p>
                  <ChoiceCard
                    icon={Building2}
                    title="Building-wide"
                    subtitle="Applies to the whole property"
                    selected={unitChoice === 'building'}
                    onClick={() => {
                      setUnitId('');
                      setUnitChoice('building');
                    }}
                  />
                  {units.map((u) => (
                    <ChoiceCard
                      key={u.id || u.label}
                      icon={Home}
                      title={u.label}
                      subtitle={u.status}
                      selected={unitChoice === 'unit' && unitId === u.id}
                      onClick={() => {
                        if (!u.id) return;
                        setUnitId(u.id);
                        setUnitChoice('unit');
                      }}
                      tone="from-teal-50 to-white border-teal-100 hover:border-teal-300"
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {step === 'line' && !lineGroup && (
            <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
              {availableLineGroups.map((g) => (
                <ChoiceCard
                  key={g}
                  icon={Tag}
                  title={GROUP_META[g].label}
                  subtitle={GROUP_META[g].hint}
                  onClick={() => setLineGroup(g)}
                  tone={GROUP_META[g].tone}
                />
              ))}
            </div>
          )}

          {step === 'line' && lineGroup && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {linesInGroup.map((line) => (
                <ChoiceCard
                  key={line.id}
                  icon={Receipt}
                  title={line.label}
                  subtitle={line.visibility === 'admin_only' ? 'Below NOI · admin only' : 'Operating expense'}
                  selected={lineId === line.id}
                  onClick={() => {
                    setLineId(line.id);
                    setTimeout(() => setStep('details'), 80);
                  }}
                  tone={GROUP_META[line.group].tone}
                />
              ))}
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-sm">
                <p className="font-bold text-indigo-900 break-words">{selectedLine?.label}</p>
                <p className="text-indigo-700 text-xs mt-1 break-words">
                  {selectedGroup?.label}
                  {selectedUnit ? ` · ${selectedUnit.label}` : (unitChoice === 'building' && showUnitStep ? ' · Building-wide' : '')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" /> Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      autoFocus
                      className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-3.5 sm:py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-base font-semibold"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-slate-200 rounded-xl px-3 py-3.5 sm:py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-base"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Notes <span className="font-normal normal-case text-slate-400">(optional)</span>
                </label>
                <input
                  placeholder="Vendor, invoice #, description…"
                  className="w-full border border-slate-200 rounded-xl px-3 py-3.5 sm:py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-base"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {selectedLine?.group === 'financing' && (
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  Financing lines sit below NOI and do not change operating expenses.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-slate-100 bg-white px-3 sm:px-5 py-3 sm:py-4 space-y-2">
          {step === 'details' ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={goBack}
                className="sm:flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3.5 sm:py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 touch-manipulation min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={() => saveExpense(true)}
                className="sm:flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3.5 sm:py-3 rounded-xl text-sm font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 touch-manipulation min-h-[44px]"
              >
                <Plus className="w-4 h-4" /> Add another
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={() => saveExpense(false)}
                className="sm:flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3.5 sm:py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 touch-manipulation min-h-[44px]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={step === 'property' ? onClose : goBack}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3.5 sm:py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 touch-manipulation min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 'property' ? 'Cancel' : 'Back'}
              </button>
              <button
                type="button"
                disabled={!canGoForward}
                onClick={goForward}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3.5 sm:py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-40 touch-manipulation min-h-[44px]"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddExpenseModal;

import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2, Save, FileText, Upload, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Property } from '../types';
import ViewportPortal from './ViewportPortal';
import { formatPropertyUnitLabel } from '../utils/propertyLabel';

interface Props {
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

type MonthRow = { paid: boolean; amount: string; date: string; method: string };

const METHODS = ['Cash', 'Zelle', 'Check', 'Money Order', 'Credit Card', 'Stripe (ACH)', 'Venmo', 'CashApp', 'Apple Pay'];
const DOC_TYPES = ['Signed Lease', 'Lease Addendum', 'Move-In Inspection', 'Photo ID', 'Other Document'];

const inputCls =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm';

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; className?: string }> = ({
  label, required, children, className,
}) => (
  <div className={className}>
    <label className="block text-xs font-medium text-slate-600 mb-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white">
    <h4 className="text-sm font-bold text-slate-800">{title}</h4>
    {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    <div className="mt-4">{children}</div>
  </div>
);

const monthKeysBetween = (start: string): string[] => {
  if (!start) return [];
  const [y, m] = start.split('-').map(Number);
  if (!y || !m) return [];
  const now = new Date();
  const keys: string[] = [];
  let year = y;
  let month = m;
  while ((year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth() + 1)) && keys.length < 36) {
    keys.push(`${year}-${String(month).padStart(2, '0')}`);
    month += 1;
    if (month > 12) { month = 1; year += 1; }
  }
  return keys;
};

const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const AddExistingTenantModal: React.FC<Props> = ({ onClose, onSaved }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState('');
  const [f, setF] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
    unitLabel: '', leaseStart: '', leaseEnd: '', rentAmount: '', deposit: '',
    currentEmployer: '', jobTitle: '', monthlyIncome: '',
    emergencyContactName: '', emergencyContactRelationship: '', emergencyContactPhone: '',
    otherOccupants: '', hasPets: false, petCount: '', petsWhich: '', vehicles: '', additionalNotes: '',
  });
  const [rows, setRows] = useState<Record<string, MonthRow>>({});
  const [depositPaid, setDepositPaid] = useState(false);
  const [depositDate, setDepositDate] = useState('');
  const [depositMethod, setDepositMethod] = useState('Cash');
  const [docs, setDocs] = useState<{ file: File; type: string }[]>([]);
  const [sendLink, setSendLink] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const set = (k: keyof typeof f, v: any) => setF(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    api.getProperties().then(setProperties).catch(() => setProperties([]));
  }, []);

  const selectedProperty = properties.find(p => String(p.id) === propertyId);

  const onPickProperty = (id: string) => {
    setPropertyId(id);
    const p = properties.find(x => String(x.id) === id);
    if (p) {
      set('unitLabel', formatPropertyUnitLabel(p.name, p.address) || p.name);
      if (!f.rentAmount && p.price) set('rentAmount', String(p.price));
    }
  };

  const monthKeys = useMemo(() => monthKeysBetween(f.leaseStart), [f.leaseStart]);
  const rowFor = (key: string): MonthRow =>
    rows[key] || { paid: false, amount: f.rentAmount, date: '', method: 'Cash' };
  const setRow = (key: string, patch: Partial<MonthRow>) =>
    setRows(prev => ({ ...prev, [key]: { ...rowFor(key), ...patch } }));
  const markAll = (paid: boolean) =>
    setRows(prev => {
      const next = { ...prev };
      monthKeys.forEach(k => { next[k] = { ...rowFor(k), paid }; });
      return next;
    });

  const owed = monthKeys.reduce((s, k) => {
    const r = rowFor(k);
    return r.paid ? s : s + (parseFloat(r.amount) || 0);
  }, 0) + (depositPaid ? 0 : parseFloat(f.deposit) || 0);

  const addDocs = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).map(file => ({
      file,
      type: /lease/i.test(file.name) ? 'Signed Lease' : 'Other Document',
    }));
    setDocs(prev => [...prev, ...incoming].slice(0, 10));
  };

  const handleSave = async () => {
    const name = `${f.firstName} ${f.lastName}`.trim();
    if (!f.firstName.trim() || !f.email.trim() || !f.phone.trim() || !f.unitLabel.trim()) {
      setError('Please fill in First name, Email, Phone and Unit.');
      return;
    }
    if (!(parseFloat(f.rentAmount) >= 0)) {
      setError('Please enter the monthly rent.');
      return;
    }
    setSaving(true);
    setError(null);
    const payments = monthKeys.map(k => {
      const r = rowFor(k);
      return {
        type: 'Rent',
        label: `Rent - ${monthLabel(k)}`,
        month: `${k}-01`,
        amount: r.amount,
        paid: r.paid,
        date: r.paid ? (r.date || `${k}-01`) : `${k}-01`,
        method: r.method,
      };
    });
    if (parseFloat(f.deposit) > 0) {
      payments.push({
        type: 'Deposit',
        label: 'Security Deposit',
        month: f.leaseStart || '',
        amount: f.deposit,
        paid: depositPaid,
        date: depositPaid ? (depositDate || f.leaseStart) : f.leaseStart,
        method: depositMethod,
      });
    }
    const emergencyContact = [f.emergencyContactName, f.emergencyContactRelationship, f.emergencyContactPhone]
      .filter(Boolean).join(', ');
    try {
      const res = await api.addExistingTenant(
        {
          tenant: {
            name,
            email: f.email.trim(),
            phone: f.phone.trim(),
            propertyUnit: f.unitLabel.trim(),
            leaseStart: f.leaseStart || null,
            leaseEnd: f.leaseEnd || null,
            rentAmount: f.rentAmount || 0,
            deposit: f.deposit || 0,
            applicationData: {
              propertyId: selectedProperty ? selectedProperty.id : null,
              propertyAddress: selectedProperty
                ? `${selectedProperty.address}, ${selectedProperty.city}, ${selectedProperty.state}`
                : '',
              firstName: f.firstName.trim(),
              lastName: f.lastName.trim(),
              dateOfBirth: f.dateOfBirth,
              currentEmployer: f.currentEmployer,
              jobTitle: f.jobTitle,
              monthlyIncome: parseFloat(f.monthlyIncome.replace(/[^0-9.]/g, '')) || 0,
              emergencyContact,
              emergencyContactName: f.emergencyContactName,
              emergencyContactRelationship: f.emergencyContactRelationship,
              emergencyContactPhone: f.emergencyContactPhone,
              otherOccupants: f.otherOccupants,
              hasPets: f.hasPets,
              petCount: f.hasPets ? f.petCount : '',
              petsWhich: f.hasPets ? f.petsWhich : '',
              vehicles: f.vehicles,
              additionalNotes: f.additionalNotes,
              desiredMoveInDate: f.leaseStart,
            },
          },
          payments,
          sendProfileLink: sendLink,
        },
        docs,
      );
      setDone(
        `${name} was added as an active tenant.` +
          (sendLink ? (res.profile_link_sent ? ` A link was emailed to ${f.email.trim()} to complete their details.` : ' The email link could not be sent.') : '') +
          (res.failed_docs?.length ? ` These files could not be uploaded: ${res.failed_docs.join(', ')}.` : ''),
      );
      await onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add tenant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ViewportPortal>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4" style={{ position: 'fixed', inset: 0 }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[min(94dvh,92vh)] overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Add Existing Tenant</h3>
              <p className="text-xs text-slate-500 mt-0.5">For someone already living in a unit. They are added as an Active tenant.</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>

          {done ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mb-4" />
              <p className="text-slate-800 font-medium max-w-md">{done}</p>
              <button onClick={onClose} className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/60">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">{error}</div>
                )}

                <Section title="Personal information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="First name" required><input className={inputCls} value={f.firstName} onChange={e => set('firstName', e.target.value)} /></Field>
                    <Field label="Last name"><input className={inputCls} value={f.lastName} onChange={e => set('lastName', e.target.value)} /></Field>
                    <Field label="Email" required><input type="email" className={inputCls} value={f.email} onChange={e => set('email', e.target.value)} /></Field>
                    <Field label="Phone" required><input type="tel" className={inputCls} value={f.phone} onChange={e => set('phone', e.target.value)} /></Field>
                    <Field label="Date of birth"><input type="date" className={inputCls} value={f.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} /></Field>
                  </div>
                </Section>

                <Section title="Unit & lease">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Property">
                      <select className={inputCls} value={propertyId} onChange={e => onPickProperty(e.target.value)}>
                        <option value="">-- Select property --</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{formatPropertyUnitLabel(p.name, p.address) || p.name}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Unit label" required><input className={inputCls} value={f.unitLabel} onChange={e => set('unitLabel', e.target.value)} placeholder="6707 Sherman St — Unit 1" /></Field>
                    <Field label="Lease start"><input type="date" className={inputCls} value={f.leaseStart} onChange={e => set('leaseStart', e.target.value)} /></Field>
                    <Field label="Lease end"><input type="date" className={inputCls} value={f.leaseEnd} onChange={e => set('leaseEnd', e.target.value)} /></Field>
                    <Field label="Monthly rent ($)" required><input type="number" min="0" step="0.01" className={inputCls} value={f.rentAmount} onChange={e => set('rentAmount', e.target.value)} /></Field>
                    <Field label="Security deposit ($)"><input type="number" min="0" step="0.01" className={inputCls} value={f.deposit} onChange={e => set('deposit', e.target.value)} /></Field>
                  </div>
                </Section>

                <Section title="Payments, month by month" hint="Months run from the lease start to this month. Tick the ones they have paid.">
                  {parseFloat(f.deposit) > 0 && (
                    <div className="flex flex-wrap items-center gap-3 p-3 mb-3 rounded-lg border border-slate-200 bg-slate-50">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 min-w-[150px]">
                        <input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={depositPaid} onChange={e => setDepositPaid(e.target.checked)} />
                        Security deposit
                      </label>
                      <span className="text-sm text-slate-600">${(parseFloat(f.deposit) || 0).toFixed(2)}</span>
                      {depositPaid && (
                        <>
                          <input type="date" className="px-2 py-1 border border-slate-300 rounded text-sm" value={depositDate} onChange={e => setDepositDate(e.target.value)} />
                          <select className="px-2 py-1 border border-slate-300 rounded text-sm" value={depositMethod} onChange={e => setDepositMethod(e.target.value)}>
                            {METHODS.map(m => <option key={m}>{m}</option>)}
                          </select>
                        </>
                      )}
                    </div>
                  )}
                  {monthKeys.length === 0 ? (
                    <p className="text-sm text-slate-500">Enter the lease start date to list the months.</p>
                  ) : (
                    <>
                      <div className="flex gap-2 mb-2">
                        <button type="button" onClick={() => markAll(true)} className="text-xs px-2.5 py-1 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50">Mark all paid</button>
                        <button type="button" onClick={() => markAll(false)} className="text-xs px-2.5 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-100">Mark all unpaid</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-sm">
                          <thead>
                            <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                              <th className="py-2 pr-2">Paid</th>
                              <th className="py-2 pr-2">Month</th>
                              <th className="py-2 pr-2">Amount ($)</th>
                              <th className="py-2 pr-2">Date paid</th>
                              <th className="py-2">Method</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthKeys.map(k => {
                              const r = rowFor(k);
                              return (
                                <tr key={k} className={`border-b border-slate-100 ${r.paid ? 'bg-emerald-50/50' : ''}`}>
                                  <td className="py-1.5 pr-2"><input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={r.paid} onChange={e => setRow(k, { paid: e.target.checked })} /></td>
                                  <td className="py-1.5 pr-2 font-medium text-slate-700 whitespace-nowrap">{monthLabel(k)}</td>
                                  <td className="py-1.5 pr-2"><input type="number" min="0" step="0.01" className="w-28 px-2 py-1 border border-slate-300 rounded text-sm" value={r.amount} onChange={e => setRow(k, { amount: e.target.value })} /></td>
                                  <td className="py-1.5 pr-2"><input type="date" disabled={!r.paid} className="px-2 py-1 border border-slate-300 rounded text-sm disabled:bg-slate-100 disabled:text-slate-400" value={r.date} onChange={e => setRow(k, { date: e.target.value })} /></td>
                                  <td className="py-1.5">
                                    <select disabled={!r.paid} className="px-2 py-1 border border-slate-300 rounded text-sm disabled:bg-slate-100 disabled:text-slate-400" value={r.method} onChange={e => setRow(k, { method: e.target.value })}>
                                      {METHODS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                  <p className={`mt-3 text-sm font-semibold ${owed > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    Balance owed: ${owed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </Section>

                <Section title="Signed documents" hint="Upload their signed lease and any other papers (PDF or photos).">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 text-sm text-slate-600">
                    <Upload className="w-4 h-4" /> Choose files
                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => { addDocs(e.target.files); e.target.value = ''; }} />
                  </label>
                  {docs.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {docs.map((d, i) => (
                        <li key={`${d.file.name}-${i}`} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white">
                          <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span className="text-sm text-slate-700 truncate flex-1">{d.file.name}</span>
                          <select className="px-2 py-1 border border-slate-300 rounded text-xs" value={d.type} onChange={e => setDocs(prev => prev.map((x, j) => j === i ? { ...x, type: e.target.value } : x))}>
                            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                          <button type="button" onClick={() => setDocs(prev => prev.filter((_, j) => j !== i))} className="p-1 text-slate-400 hover:text-rose-600" aria-label="Remove file">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <Section title="Employment & income">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Employer"><input className={inputCls} value={f.currentEmployer} onChange={e => set('currentEmployer', e.target.value)} /></Field>
                    <Field label="Job title"><input className={inputCls} value={f.jobTitle} onChange={e => set('jobTitle', e.target.value)} /></Field>
                    <Field label="Monthly income ($)"><input className={inputCls} value={f.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)} /></Field>
                  </div>
                </Section>

                <Section title="Emergency contact">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Name"><input className={inputCls} value={f.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)} /></Field>
                    <Field label="Relationship"><input className={inputCls} value={f.emergencyContactRelationship} onChange={e => set('emergencyContactRelationship', e.target.value)} /></Field>
                    <Field label="Phone"><input type="tel" className={inputCls} value={f.emergencyContactPhone} onChange={e => set('emergencyContactPhone', e.target.value)} /></Field>
                  </div>
                </Section>

                <Section title="Household">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Other occupants (name & age)" className="sm:col-span-2"><input className={inputCls} value={f.otherOccupants} onChange={e => set('otherOccupants', e.target.value)} placeholder="e.g. Jane Doe (age 8)" /></Field>
                    <Field label="Pets">
                      <label className="flex items-center gap-2 text-sm text-slate-700 py-2">
                        <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={f.hasPets} onChange={e => set('hasPets', e.target.checked)} /> Has pets
                      </label>
                    </Field>
                    {f.hasPets ? (
                      <Field label="How many / which pets"><input className={inputCls} value={f.petsWhich} onChange={e => set('petsWhich', e.target.value)} placeholder="1 dog" /></Field>
                    ) : <div />}
                    <Field label="Vehicles" className="sm:col-span-2"><input className={inputCls} value={f.vehicles} onChange={e => set('vehicles', e.target.value)} placeholder="Make, model, plate" /></Field>
                    <Field label="Notes" className="sm:col-span-2"><textarea rows={2} className={inputCls} value={f.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} /></Field>
                  </div>
                </Section>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-indigo-200 bg-indigo-50 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 accent-indigo-600" checked={sendLink} onChange={e => setSendLink(e.target.checked)} />
                  <span className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-800">Email the tenant a link to complete their details</span>
                    <br />They can fill in anything missing (ID, employment, emergency contact, household) and it saves to their profile.
                  </span>
                </label>
              </div>

              <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button onClick={onClose} disabled={saving} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Add Tenant</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ViewportPortal>
  );
};

export default AddExistingTenantModal;

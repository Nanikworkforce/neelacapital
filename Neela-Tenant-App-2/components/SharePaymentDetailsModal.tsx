import React, { useEffect, useState } from 'react';
import { Loader2, Send, X, RotateCcw } from 'lucide-react';
import { api, PaymentDetailsDraft } from '../services/api';
import ViewportPortal from './ViewportPortal';

interface Props {
  tenantId: string;
  onClose: () => void;
  onSent: (message: string) => void;
}

const money = (v: string) => {
  const s = (v || '').trim().replace(/^\$\s*/, '');
  return s ? `$${s}` : '';
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; rows?: number; prefix?: string }> = ({
  label, value, onChange, rows, prefix,
}) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>
    {rows ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
    ) : (
      <div className="flex items-center border border-slate-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-emerald-500">
        {prefix && <span className="pl-3 text-sm text-slate-500">{prefix}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm bg-transparent text-slate-900 outline-none"
        />
      </div>
    )}
  </label>
);

const SharePaymentDetailsModal: React.FC<Props> = ({ tenantId, onClose, onSent }) => {
  const [draft, setDraft] = useState<PaymentDetailsDraft | null>(null);
  const [original, setOriginal] = useState<PaymentDetailsDraft | null>(null);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.getPaymentDetailsDraft(tenantId)
      .then((r) => {
        const d = { ...r.details, rent: r.details.rent.replace(/^\$/, ''), deposit: r.details.deposit.replace(/^\$/, '') };
        setDraft(d);
        setOriginal(d);
        setSentTo(r.sent_to);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load payment details'));
  }, [tenantId]);

  const set = (key: keyof PaymentDetailsDraft) => (v: string) => setDraft((d) => (d ? { ...d, [key]: v } : d));

  const send = async () => {
    if (!draft) return;
    setSending(true);
    setError(null);
    try {
      const res = await api.sharePaymentDetails(tenantId, draft);
      onSent(res.message || 'Payment details shared with the tenant.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to share payment details');
      setSending(false);
    }
  };

  const methods = (draft?.methods || '').split('\n').map((m) => m.replace(/^[\s•\-]+/, '').trim()).filter(Boolean);
  const rows: [string, string, boolean][] = draft
    ? ([
        ['Property', draft.property, true],
        ['Monthly rent', money(draft.rent), true],
        ['Security deposit', money(draft.deposit), true],
        ['Lease start', draft.lease_start, false],
        ['Rent due', draft.rent_due, false],
        ['Pay to', draft.pay_to, false],
        ['Payment memo', draft.memo, false],
      ] as [string, string, boolean][]).filter((r) => r[1].trim())
    : [];

  return (
    <ViewportPortal>
      <div className="fixed inset-0 z-[220] bg-black/50 flex items-center justify-center p-2 sm:p-4" style={{ position: 'fixed', inset: 0 }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Preview payment details</h3>
              <p className="text-xs text-slate-500">
                Check and edit before sending{sentTo ? ` to ${sentTo}` : ''}. Nothing is sent until you click Send.
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!draft ? (
            <div className="flex-1 flex items-center justify-center py-20">
              {error ? <p className="text-sm text-rose-700">{error}</p> : <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2">
              <div className="p-5 space-y-3 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/60">
                <Field label="Email subject" value={draft.subject} onChange={set('subject')} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tenant name" value={draft.tenant_name} onChange={set('tenant_name')} />
                  <Field label="Property" value={draft.property} onChange={set('property')} />
                  <Field label="Monthly rent" prefix="$" value={draft.rent} onChange={set('rent')} />
                  <Field label="Security deposit" prefix="$" value={draft.deposit} onChange={set('deposit')} />
                  <Field label="Lease start" value={draft.lease_start} onChange={set('lease_start')} />
                  <Field label="Rent due" value={draft.rent_due} onChange={set('rent_due')} />
                  <Field label="Pay to" value={draft.pay_to} onChange={set('pay_to')} />
                  <Field label="Payment memo" value={draft.memo} onChange={set('memo')} />
                </div>
                <Field label="How to pay (one per line)" value={draft.methods} onChange={set('methods')} rows={4} />
                <Field label="Extra note" value={draft.note} onChange={set('note')} rows={3} />
                <Field label="Signed by" value={draft.company} onChange={set('company')} />
                <p className="text-[11px] text-slate-400">Leave a field empty to remove that line from the email.</p>
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">What the tenant will see</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                    <span className="font-semibold">Subject:</span> {draft.subject}
                  </div>
                  <div className="p-5 text-sm text-slate-900 space-y-3">
                    <h2 className="text-lg font-bold">Payment details for your lease</h2>
                    <p>Hello {draft.tenant_name},</p>
                    <p>
                      Your lease for <strong>{draft.property}</strong> is fully signed. Please use the details below for rent payments.
                    </p>
                    {rows.length > 0 && (
                      <table className="w-full border-collapse">
                        <tbody>
                          {rows.map(([label, val, bold]) => (
                            <tr key={label}>
                              <td className="p-2 border border-slate-200 w-2/5">{label}</td>
                              <td className={`p-2 border border-slate-200 break-words ${bold ? 'font-bold' : ''}`}>{val}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {methods.length > 0 && (
                      <>
                        <h3 className="font-bold pt-1">How to pay</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {methods.map((m, i) => <li key={i} className="break-words">{m}</li>)}
                        </ul>
                      </>
                    )}
                    {draft.note.split('\n').filter((p) => p.trim()).map((p, i) => <p key={i}>{p}</p>)}
                    <p className="text-xs text-slate-500">— {draft.company}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
            {error && draft && <p className="text-sm text-rose-700 flex-1">{error}</p>}
            <div className="flex gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={() => original && setDraft(original)}
                disabled={!draft || sending}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button type="button" onClick={onClose} disabled={sending} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void send()}
                disabled={!draft || sending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending…' : 'Send to tenant'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ViewportPortal>
  );
};

export default SharePaymentDetailsModal;

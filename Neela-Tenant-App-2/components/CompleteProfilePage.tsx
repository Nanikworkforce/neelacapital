import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertTriangle, Upload, X, FileText } from 'lucide-react';
import { api } from '../services/api';
import NeelaLogo from './NeelaLogo';

const inputCls =
  'w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white';

const EMPTY = {
  dateOfBirth: '', currentAddress: '', currentEmployer: '', jobTitle: '', monthlyIncome: '',
  emergencyContactName: '', emergencyContactRelationship: '', emergencyContactPhone: '',
  otherOccupants: '', hasPets: false, petCount: '', petsWhich: '', vehicles: '', additionalNotes: '',
};

const Row: React.FC<{ label: string; children: React.ReactNode; full?: boolean }> = ({ label, children, full }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
    {children}
  </div>
);

const CompleteProfilePage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [d, setD] = useState<typeof EMPTY>(EMPTY);
  const [idFiles, setIdFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('This link is missing its token.');
      setLoading(false);
      return;
    }
    api.getTenantProfileByToken(token)
      .then(res => {
        setInfo(res);
        setPhone(res.phone || '');
        const det = res.details || {};
        setD({
          ...EMPTY,
          ...Object.fromEntries(Object.entries(det).filter(([, v]) => v !== null && v !== undefined)),
          monthlyIncome: det.monthlyIncome ? String(det.monthlyIncome) : '',
          hasPets: !!det.hasPets,
        } as typeof EMPTY);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'This link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  const set = (k: keyof typeof EMPTY, v: any) => setD(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.submitTenantProfileByToken(
        token,
        {
          phone,
          details: {
            ...d,
            monthlyIncome: parseFloat(String(d.monthlyIncome).replace(/[^0-9.]/g, '')) || 0,
            petCount: d.hasPets ? d.petCount : '',
            petsWhich: d.hasPets ? d.petsWhich : '',
          },
        },
        idFiles,
      );
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save your details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-6"><NeelaLogo /></div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>
          ) : saved ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800">Thank you!</h2>
              <p className="text-slate-600 mt-2">Your details have been saved. You can close this page.</p>
            </div>
          ) : !info ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-slate-700 font-medium">{error}</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Complete your resident details</h1>
              <p className="text-sm text-slate-500 mt-1">
                {info.name} · {info.property_unit}
              </p>
              {error && <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">{error}</div>}

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Personal</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Row label="Email"><input className={`${inputCls} bg-slate-100`} value={info.email} disabled /></Row>
                    <Row label="Phone"><input type="tel" className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} /></Row>
                    <Row label="Date of birth"><input type="date" className={inputCls} value={d.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} /></Row>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Photo ID</h3>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-400 text-sm text-slate-600">
                    <Upload className="w-4 h-4" /> Upload driver's license or ID
                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                      onChange={e => { const l = e.target.files; if (l) setIdFiles(prev => [...prev, ...Array.from(l)].slice(0, 5)); e.target.value = ''; }} />
                  </label>
                  {idFiles.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {idFiles.map((file, i) => (
                        <li key={`${file.name}-${i}`} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 text-sm">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span className="flex-1 truncate">{file.name}</span>
                          <button type="button" onClick={() => setIdFiles(prev => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-rose-600" aria-label="Remove file"><X className="w-4 h-4" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Employment & income</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Row label="Employer"><input className={inputCls} value={d.currentEmployer} onChange={e => set('currentEmployer', e.target.value)} /></Row>
                    <Row label="Job title"><input className={inputCls} value={d.jobTitle} onChange={e => set('jobTitle', e.target.value)} /></Row>
                    <Row label="Monthly income ($)"><input className={inputCls} value={d.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)} /></Row>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Emergency contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Row label="Name"><input className={inputCls} value={d.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)} /></Row>
                    <Row label="Relationship"><input className={inputCls} value={d.emergencyContactRelationship} onChange={e => set('emergencyContactRelationship', e.target.value)} /></Row>
                    <Row label="Phone"><input type="tel" className={inputCls} value={d.emergencyContactPhone} onChange={e => set('emergencyContactPhone', e.target.value)} /></Row>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Household</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Row label="Other people living with you (name & age)" full><input className={inputCls} value={d.otherOccupants} onChange={e => set('otherOccupants', e.target.value)} /></Row>
                    <Row label="Pets">
                      <label className="flex items-center gap-2 text-sm text-slate-700 py-2.5">
                        <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={d.hasPets} onChange={e => set('hasPets', e.target.checked)} /> I have pets
                      </label>
                    </Row>
                    {d.hasPets ? (
                      <Row label="How many / which pets"><input className={inputCls} value={d.petsWhich} onChange={e => set('petsWhich', e.target.value)} /></Row>
                    ) : <div />}
                    <Row label="Vehicles (make, model, plate)" full><input className={inputCls} value={d.vehicles} onChange={e => set('vehicles', e.target.value)} /></Row>
                    <Row label="Anything else we should know?" full><textarea rows={3} className={inputCls} value={d.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} /></Row>
                  </div>
                </div>
              </div>

              <button onClick={submit} disabled={saving}
                className="mt-8 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save my details'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Save, Trash2, Upload, PenTool, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { formatDateMMDDYYYY } from '../utils/date';

const LandlordSignaturePanel: React.FC = () => {
  const [saved, setSaved] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  useEffect(() => {
    api.getLandlordSignature()
      .then(s => { setSaved(s.image || ''); setSavedAt(s.updated_at); setSignerName(s.signer_name || ''); })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load saved signature'))
      .finally(() => setLoading(false));
  }, []);

  const initCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const rect = c.getBoundingClientRect();
    const w = Math.round(rect.width * d);
    const h = Math.round(rect.height * d);
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.scale(d, d);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  useEffect(() => {
    if (mode === 'draw') setTimeout(initCanvas, 30);
  }, [mode, initCanvas, loading]);

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    if ('touches' in e) return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    return { x: (e as React.MouseEvent).clientX - r.left, y: (e as React.MouseEvent).clientY - r.top };
  };
  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    initCanvas();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInk.current = true;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasInk.current) setDraft(canvasRef.current!.toDataURL('image/png'));
  };
  const clearCanvas = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    hasInk.current = false;
    setDraft('');
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/.test(file.type)) {
      setError('Please upload a PNG or JPG image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDraft(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!draft) {
      setError(mode === 'draw' ? 'Please draw the signature first.' : 'Please choose an image first.');
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.saveLandlordSignature(draft, signerName);
      setSaved(res.image);
      setSavedAt(res.updated_at);
      setDraft('');
      clearCanvas();
      setMessage('Signature saved. It will be stamped automatically wherever the landlord signs.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save signature');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Remove the saved landlord signature?')) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await api.deleteLandlordSignature();
      setSaved('');
      setSavedAt(null);
      setMessage('Saved signature removed.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove signature');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-indigo-600 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">Landlord Signature</h3>
        <p className="text-sm text-slate-500 mt-1">
          Save it once. When the landlord signs a lease it is filled in automatically, and it is stamped on every notice
          from Legal &amp; Compliance that has a landlord signature line.
        </p>

        {error && <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">{error}</div>}
        {message && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Current saved signature</p>
          {saved ? (
            <div className="flex flex-wrap items-end gap-4">
              <div className="px-4 pt-3 pb-1 border-b-2 border-slate-400 bg-slate-50 rounded-t-lg">
                <img src={saved} alt="Saved landlord signature" className="h-16 object-contain" />
              </div>
              <div className="text-xs text-slate-500">
                {signerName && <p className="font-medium text-slate-700">{signerName}</p>}
                {savedAt && <p>Saved {formatDateMMDDYYYY(savedAt)}</p>}
              </div>
              <button onClick={remove} disabled={busy} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 disabled:opacity-50">
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          ) : (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No signature saved yet. The landlord will be asked to sign by hand until one is saved.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">{saved ? 'Replace signature' : 'Add signature'}</h4>
          <div className="flex gap-1">
            <button onClick={() => { setMode('draw'); setDraft(''); }} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg ${mode === 'draw' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <PenTool className="w-3.5 h-3.5" /> Draw
            </button>
            <button onClick={() => { setMode('upload'); setDraft(''); }} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg ${mode === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
          </div>
        </div>

        {mode === 'draw' ? (
          <div className="border-2 border-slate-300 rounded-xl bg-slate-50 overflow-hidden" style={{ height: 170 }}>
            <canvas
              ref={canvasRef}
              onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
              onTouchStart={start} onTouchMove={move} onTouchEnd={end}
              className="w-full h-full block touch-none cursor-crosshair"
            />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 text-sm cursor-pointer hover:bg-slate-100" style={{ height: 170 }}>
            {draft ? (
              <img src={draft} alt="Selected signature" className="max-h-28 object-contain" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-400" />
                Upload a photo or scan of the signature (PNG or JPG)
                <span className="text-xs text-slate-400">A white background is removed automatically</span>
              </>
            )}
            <input type="file" accept="image/png,image/jpeg" onChange={onFile} className="sr-only" />
          </label>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Signer name (optional)</label>
            <input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="e.g. Neela Capital Investments" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          {mode === 'draw' && (
            <button onClick={clearCanvas} disabled={busy} className="px-4 py-2 text-sm border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">
              Clear
            </button>
          )}
          <button onClick={save} disabled={busy || !draft} className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save signature
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandlordSignaturePanel;

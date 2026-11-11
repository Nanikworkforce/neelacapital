import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { api } from '../services/api';
import { FileText, Loader2, Plus, Upload, Check, Trash2 } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type FieldType = 'signature' | 'date' | 'initials' | 'text' | 'checkbox';
type SignerRole = 'tenant' | 'landlord' | 'either';

export interface DesignerField {
  field_key: string;
  field_type: FieldType;
  label: string;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  signer_role: SignerRole;
  stamp: boolean;
}

interface TemplateRow {
  id: number;
  name: string;
  is_active: boolean;
  latest_published_version_id?: number | null;
  version_count?: number;
}

interface VersionRow {
  id: number;
  version_number: number;
  status: string;
  page_count: number;
  fields?: DesignerField[];
  pdf_url?: string;
}

const FIELD_PRESETS: { key: string; type: FieldType; role: SignerRole; label: string; stamp: boolean }[] = [
  { key: 'tenant_signature', type: 'signature', role: 'tenant', label: 'Tenant Signature', stamp: true },
  { key: 'tenant_signature_date', type: 'date', role: 'tenant', label: 'Tenant Date', stamp: true },
  { key: 'tenant_initials', type: 'initials', role: 'tenant', label: 'Tenant Initials', stamp: true },
  { key: 'landlord_signature', type: 'signature', role: 'landlord', label: 'Landlord Signature', stamp: true },
  { key: 'landlord_signature_date', type: 'date', role: 'landlord', label: 'Landlord Date', stamp: true },
  { key: 'agree_terms', type: 'checkbox', role: 'tenant', label: 'I agree to the terms', stamp: false },
  { key: 'agree_rules', type: 'checkbox', role: 'tenant', label: 'I agree to community rules', stamp: false },
];

const defaultSize = (t: FieldType) => {
  if (t === 'signature') return { width: 0.28, height: 0.045 };
  if (t === 'checkbox') return { width: 0.035, height: 0.02 };
  if (t === 'initials') return { width: 0.06, height: 0.02 };
  return { width: 0.14, height: 0.022 };
};

const LeaseTemplateDesigner: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [versionId, setVersionId] = useState<number | null>(null);
  const [fields, setFields] = useState<DesignerField[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [placeMode, setPlaceMode] = useState<FieldType | null>(null);
  const [customKey, setCustomKey] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const dragRef = useRef<{ key: string; ox: number; oy: number } | null>(null);

  const selectedVersion = useMemo(
    () => versions.find((v) => v.id === versionId) || null,
    [versions, versionId],
  );
  const isDraft = selectedVersion?.status === 'draft';

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.getLeaseTemplates();
      const list = (rows || []).filter((t: TemplateRow) => t.is_active !== false);
      setTemplates(list);
      if (!templateId && list[0]) setTemplateId(list[0].id);
    } catch (e: any) {
      setError(e.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadVersions = useCallback(async (tid: number) => {
    setBusy(true);
    setError(null);
    try {
      const rows = await api.getLeaseTemplateVersions(tid);
      setVersions(rows || []);
      const prefer =
        rows?.find((v: VersionRow) => v.status === 'draft') ||
        rows?.find((v: VersionRow) => v.status === 'published') ||
        rows?.[0];
      setVersionId(prefer?.id ?? null);
      setFields(prefer?.fields || []);
      setPage(1);
    } catch (e: any) {
      setError(e.message || 'Failed to load versions');
      setVersions([]);
      setVersionId(null);
      setFields([]);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (templateId) loadVersions(templateId);
  }, [templateId, loadVersions]);

  useEffect(() => {
    const v = versions.find((x) => x.id === versionId);
    if (v) setFields(v.fields || []);
  }, [versionId, versions]);

  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;
    const pdfPage = await pdf.getPage(pageNum);
    const base = pdfPage.getViewport({ scale: 1 });
    const wrapW = wrapRef.current?.clientWidth || 720;
    const scale = Math.min(1.6, Math.max(0.9, (wrapW - 24) / base.width));
    const viewport = pdfPage.getViewport({ scale });
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await pdfPage.render({ canvasContext: ctx, viewport }).promise;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!templateId || !versionId) {
        pdfDocRef.current = null;
        return;
      }
      setBusy(true);
      try {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        const blob = await api.getLeaseTemplateVersionPdfBlob(templateId, versionId);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        const doc = await pdfjsLib.getDocument(url).promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        pdfDocRef.current = doc;
        setPageCount(doc.numPages || 1);
        setPage(1);
        await renderPage(1);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to render PDF');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId, versionId, renderPage]);

  useEffect(() => {
    if (pdfDocRef.current) renderPage(page).catch(() => undefined);
  }, [page, renderPage]);

  useEffect(() => () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
  }, []);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!placeMode || !isDraft || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const size = defaultSize(placeMode);
    const preset = FIELD_PRESETS.find((p) => p.type === placeMode && !fields.some((f) => f.field_key === p.key));
    const key =
      customKey.trim() ||
      preset?.key ||
      `${placeMode}_${page}_${Math.floor(nx * 100)}_${Math.floor(ny * 100)}`;
    if (fields.some((f) => f.field_key === key)) {
      setError(`Field key "${key}" already exists`);
      return;
    }
    const next: DesignerField = {
      field_key: key,
      field_type: placeMode,
      label: preset?.label || key.replace(/_/g, ' '),
      page_number: page,
      x: Math.max(0, Math.min(1 - size.width, nx - size.width / 2)),
      y: Math.max(0, Math.min(1 - size.height, ny - size.height / 2)),
      width: size.width,
      height: size.height,
      required: true,
      signer_role: preset?.role || 'tenant',
      stamp: preset?.stamp ?? true,
    };
    setFields((prev) => [...prev, next]);
    setSelectedKey(key);
    setPlaceMode(null);
    setCustomKey('');
    setMessage(`Placed ${next.label} on page ${page}`);
  };

  const onFieldPointerDown = (e: React.PointerEvent, key: string) => {
    if (!isDraft || !canvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedKey(key);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const f = fields.find((x) => x.field_key === key);
    if (!f) return;
    dragRef.current = {
      key,
      ox: (e.clientX - rect.left) / rect.width - f.x,
      oy: (e.clientY - rect.top) / rect.height - f.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onFieldPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - drag.ox;
    const ny = (e.clientY - rect.top) / rect.height - drag.oy;
    setFields((prev) =>
      prev.map((f) => {
        if (f.field_key !== drag.key) return f;
        return {
          ...f,
          x: Math.max(0, Math.min(1 - f.width, nx)),
          y: Math.max(0, Math.min(1 - f.height, ny)),
          page_number: page,
        };
      }),
    );
  };

  const onFieldPointerUp = () => {
    dragRef.current = null;
  };

  const handleUpload = async (file: File | null) => {
    if (!file || !templateId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const copyFrom = selectedVersion?.id;
      const created = await api.uploadLeaseTemplateVersion(templateId, file, copyFrom);
      setMessage(`Draft v${created.version_number} created`);
      await loadVersions(templateId);
      setVersionId(created.id);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!templateId || !versionId || !isDraft) return;
    setBusy(true);
    setError(null);
    try {
      const saved = await api.saveLeaseTemplateVersionFields(templateId, versionId, fields);
      setMessage('Fields saved');
      setVersions((prev) => prev.map((v) => (v.id === versionId ? { ...v, ...saved, fields } : v)));
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!templateId || !versionId || !isDraft) return;
    if (!window.confirm('Publish this version? Prior published versions will be archived. Existing signed leases keep their frozen version.')) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.saveLeaseTemplateVersionFields(templateId, versionId, fields);
      await api.publishLeaseTemplateVersion(templateId, versionId);
      setMessage('Version published');
      await loadVersions(templateId);
    } catch (e: any) {
      setError(e.message || 'Publish failed');
    } finally {
      setBusy(false);
    }
  };

  const pageFields = fields.filter((f) => f.page_number === page);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Lease PDF Templates
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Upload a PDF, place signature / date / initials fields on the page, then publish.
              New leases freeze that published version so older signed docs stay unchanged.
            </p>
          </div>
          <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer ${
            busy || !templateId ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}>
            <Upload className="w-4 h-4" />
            Upload PDF draft
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={busy || !templateId}
              onChange={(e) => handleUpload(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm">
            <span className="font-semibold text-slate-700">Template</span>
            <select
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
              value={templateId ?? ''}
              onChange={(e) => setTemplateId(Number(e.target.value))}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold text-slate-700">Version</span>
            <select
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
              value={versionId ?? ''}
              onChange={(e) => setVersionId(Number(e.target.value))}
            >
              {versions.length === 0 && <option value="">No versions yet — upload a PDF</option>}
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.version_number} · {v.status} · {v.page_count}p
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              disabled={!isDraft || busy}
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 disabled:opacity-50"
            >
              Save fields
            </button>
            <button
              type="button"
              disabled={!isDraft || busy}
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Publish
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        {message && <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{message}</p>}
        {!isDraft && selectedVersion && (
          <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            This version is <strong>{selectedVersion.status}</strong> (read-only). Upload a new PDF draft to edit fields.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center gap-2 justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <button type="button" className="px-2 py-1 text-sm border rounded-lg disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
              <span className="text-sm font-semibold text-slate-700">Page {page} / {pageCount}</span>
              <button type="button" className="px-2 py-1 text-sm border rounded-lg disabled:opacity-40" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Next</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['signature', 'date', 'initials', 'checkbox'] as FieldType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!isDraft}
                  onClick={() => setPlaceMode((m) => (m === t ? null : t))}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                    placeMode === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'
                  } disabled:opacity-40`}
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  {t}
                </button>
              ))}
            </div>
          </div>
          {placeMode && isDraft && (
            <div className="px-4 py-2 text-xs text-indigo-800 bg-indigo-50 border-b border-indigo-100 flex flex-wrap gap-2 items-center">
              Click the PDF to place a <strong>{placeMode}</strong> field.
              <input
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="optional field_key"
                className="border border-indigo-200 rounded px-2 py-1 text-xs bg-white"
              />
            </div>
          )}
          <div ref={wrapRef} className="relative overflow-auto bg-slate-100 p-3 max-h-[75vh]">
            {(busy || !versionId) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 text-sm text-slate-600">
                {busy ? <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> : 'Select or upload a version'}
              </div>
            )}
            <div className="relative inline-block max-w-full">
              <canvas
                ref={canvasRef}
                className={`max-w-full h-auto shadow-md bg-white ${placeMode ? 'cursor-crosshair' : ''}`}
                onClick={onCanvasClick}
              />
              {pageFields.map((f) => (
                <div
                  key={f.field_key}
                  onPointerDown={(e) => onFieldPointerDown(e, f.field_key)}
                  onPointerMove={onFieldPointerMove}
                  onPointerUp={onFieldPointerUp}
                  className={`absolute border-2 rounded-sm text-[10px] font-bold px-0.5 overflow-hidden select-none ${
                    selectedKey === f.field_key ? 'border-indigo-600 bg-indigo-500/25' : 'border-amber-500 bg-amber-400/20'
                  } ${isDraft ? 'cursor-move' : 'pointer-events-none'}`}
                  style={{
                    left: `${f.x * 100}%`,
                    top: `${f.y * 100}%`,
                    width: `${f.width * 100}%`,
                    height: `${f.height * 100}%`,
                  }}
                  title={f.field_key}
                >
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-900">Fields ({fields.length})</h3>
          {fields.length === 0 && <p className="text-xs text-slate-500">No fields yet. Use the place buttons, then click the PDF.</p>}
          {fields.map((f) => (
            <div
              key={f.field_key}
              className={`border rounded-xl p-2.5 text-xs space-y-1.5 ${selectedKey === f.field_key ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200'}`}
              onClick={() => {
                setSelectedKey(f.field_key);
                setPage(f.page_number);
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-800 truncate">{f.field_key}</span>
                {isDraft && (
                  <button
                    type="button"
                    className="text-red-600 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFields((prev) => prev.filter((x) => x.field_key !== f.field_key));
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-slate-500">p{f.page_number} · {f.field_type} · {f.signer_role}</div>
              {isDraft && selectedKey === f.field_key && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <label className="col-span-2">
                    Label
                    <input
                      className="w-full border rounded px-1.5 py-1 mt-0.5"
                      value={f.label}
                      onChange={(e) => setFields((prev) => prev.map((x) => x.field_key === f.field_key ? { ...x, label: e.target.value } : x))}
                    />
                  </label>
                  <label>
                    Role
                    <select
                      className="w-full border rounded px-1.5 py-1 mt-0.5"
                      value={f.signer_role}
                      onChange={(e) => setFields((prev) => prev.map((x) => x.field_key === f.field_key ? { ...x, signer_role: e.target.value as SignerRole } : x))}
                    >
                      <option value="tenant">tenant</option>
                      <option value="landlord">landlord</option>
                      <option value="either">either</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-1.5 mt-4">
                    <input
                      type="checkbox"
                      checked={f.stamp}
                      onChange={(e) => setFields((prev) => prev.map((x) => x.field_key === f.field_key ? { ...x, stamp: e.target.checked } : x))}
                    />
                    Stamp on PDF
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={f.required}
                      onChange={(e) => setFields((prev) => prev.map((x) => x.field_key === f.field_key ? { ...x, required: e.target.checked } : x))}
                    />
                    Required
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaseTemplateDesigner;

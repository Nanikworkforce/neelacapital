import React, { useEffect, useState } from 'react';
import { Inquiry } from '../types';
import { api } from '../services/api';
import { MessageSquare, Search, Mail, Loader2, Archive, Eye, Inbox } from 'lucide-react';
import { formatDateMMDDYYYY, formatDateTime } from '../utils/date';

const statusStyles: Record<string, string> = {
  new: 'bg-amber-100 text-amber-800',
  read: 'bg-sky-100 text-sky-800',
  archived: 'bg-slate-100 text-slate-600',
};

const sourceLabels: Record<string, string> = {
  website: 'Main Website',
  portal: 'Portal',
};

const InquiriesView: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getInquiries();
      setInquiries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = inquiries.filter((item) => {
    const haystack = `${item.firstName} ${item.lastName} ${item.email} ${item.message}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateInquiry(id, { status });
      setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)));
      if (selected?.id === id) setSelected(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update inquiry');
    } finally {
      setSaving(false);
    }
  };

  const openInquiry = async (item: Inquiry) => {
    setSelected(item);
    if (item.status === 'new') {
      await updateStatus(item.id, 'read');
    }
  };

  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inquiries</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Contact messages from the main website and portal
            {newCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                {newCount} new
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email, or message..."
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="All">All statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading inquiries...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No inquiries yet</p>
            <p className="text-sm mt-1">Messages from the contact form will show up here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-semibold">From</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Source</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const name = `${item.firstName} ${item.lastName}`.trim() || '—';
                  return (
                    <tr
                      key={item.id}
                      onClick={() => openInquiry(item)}
                      className={`cursor-pointer hover:bg-slate-50/80 transition-colors ${
                        item.status === 'new' ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{name}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {item.email}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-600">
                        {sourceLabels[item.source] || item.source}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                        {item.message}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            statusStyles[item.status] || statusStyles.read
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell text-slate-500 whitespace-nowrap">
                        {formatDateMMDDYYYY(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {sourceLabels[selected.source] || selected.source}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {`${selected.firstName} ${selected.lastName}`.trim() || 'Inquiry'}
                </h3>
                <a href={`mailto:${selected.email}`} className="text-sm text-blue-600 hover:underline">
                  {selected.email}
                </a>
                {selected.phone && (
                  <p className="text-sm text-slate-500 mt-0.5">{selected.phone}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-medium"
              >
                Close
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Message</p>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              <p className="text-xs text-slate-400 mt-4">
                Received {formatDateTime(selected.createdAt)}
              </p>
            </div>
            <div className="p-5 border-t border-slate-100 flex flex-wrap gap-2">
              {selected.status !== 'read' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateStatus(selected.id, 'read')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  Mark read
                </button>
              )}
              {selected.status !== 'archived' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => updateStatus(selected.id, 'archived')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              )}
              <a
                href={`mailto:${selected.email}?subject=Re: Your inquiry to Neela Capital`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                <Mail className="w-4 h-4" />
                Reply by email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesView;

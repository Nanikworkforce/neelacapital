import React, { useEffect, useMemo, useState } from 'react';
import { UserCog, Plus, Loader2, Mail, Phone, Building2, X, Eye, EyeOff, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { Property, PropertyManagerProfile } from '../types';
import { groupPropertiesForSelect, propertyIdsInGroup } from '../utils/propertyGrouping';

const FALLBACK_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

interface PropertyManagersPanelProps {
  properties: Property[];
}

const emptyForm = {
  email: '',
  firstName: '',
  middleName: '',
  lastName: '',
  password: '',
  phone: '',
  propertyIds: [] as string[],
};

const statusBadge = (status: PropertyManagerProfile['status']) => {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    );
  }
  if (status === 'declined') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
        <XCircle className="w-3.5 h-3.5" /> Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle className="w-3.5 h-3.5" /> Approved
    </span>
  );
};

const PropertyManagersPanel: React.FC<PropertyManagersPanelProps> = ({ properties }) => {
  const [managers, setManagers] = useState<PropertyManagerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPropertyIds, setEditPropertyIds] = useState<string[]>([]);
  const [showTempPassword, setShowTempPassword] = useState(false);

  const loadManagers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPropertyManagers();
      setManagers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load property managers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const propertyGroups = useMemo(() => groupPropertiesForSelect(properties), [properties]);
  const pendingCount = managers.filter((m) => m.status === 'pending').length;

  const toggleGroup = (ids: string[], groupKey: string) => {
    const groupIds = propertyIdsInGroup(properties, groupKey);
    const allOn = groupIds.length > 0 && groupIds.every((id) => ids.includes(id));
    if (allOn) return ids.filter((id) => !groupIds.includes(id));
    return [...new Set([...ids, ...groupIds])];
  };

  const groupChecked = (ids: string[], groupKey: string) => {
    const groupIds = propertyIdsInGroup(properties, groupKey);
    return groupIds.length > 0 && groupIds.every((id) => ids.includes(id));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.firstName || !form.lastName || !form.password) return;
    setSaving(true);
    setError(null);
    try {
      await api.createPropertyManager({
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
        phone: form.phone.trim(),
        propertyIds: form.propertyIds,
      });
      setForm(emptyForm);
      setShowTempPassword(false);
      setShowForm(false);
      await loadManagers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property manager');
    } finally {
      setSaving(false);
    }
  };

  const startEditAssignments = (manager: PropertyManagerProfile) => {
    setEditingId(manager.id);
    setEditPropertyIds([...manager.propertyIds]);
  };

  const saveAssignments = async (managerId: string) => {
    setSaving(true);
    setError(null);
    try {
      await api.updatePropertyManager(managerId, { propertyIds: editPropertyIds });
      setEditingId(null);
      await loadManagers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignments');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (managerId: string, status: 'pending' | 'approved' | 'declined') => {
    setSaving(true);
    setError(null);
    try {
      await api.updatePropertyManager(managerId, { status });
      await loadManagers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-indigo-600" />
            Property Managers
            {pendingCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {pendingCount} pending
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Approve signup requests, assign properties, and manage manager accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setShowTempPassword(false);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold shadow-sm"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Property Manager'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800">New property manager (approved immediately)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">First name</label>
              <input
                required
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Last name</label>
              <input
                required
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Middle name (optional)</label>
              <input
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5"
                value={form.middleName}
                onChange={(e) => setForm((f) => ({ ...f, middleName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
              <input
                type="email"
                required
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
              <input
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Temporary password</label>
              <div className="relative mt-1">
                <input
                  type={showTempPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 pr-11"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowTempPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  aria-label={showTempPassword ? 'Hide password' : 'Show password'}
                >
                  {showTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Assign properties</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-3 bg-slate-50">
              {propertyGroups.length === 0 ? (
                <p className="text-sm text-slate-500 col-span-full">No properties available yet.</p>
              ) : (
                propertyGroups.map((g) => (
                  <label key={g.groupKey} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={groupChecked(form.propertyIds, g.groupKey)}
                      onChange={() => setForm((f) => ({ ...f, propertyIds: toggleGroup(f.propertyIds, g.groupKey) }))}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span className="truncate">{g.label}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create account
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : managers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl">
          <UserCog className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No property managers yet</p>
          <p className="text-sm text-slate-500 mt-1">Add a manager or wait for signup requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {managers.map((manager) => (
            <div key={manager.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900 text-lg">{manager.userName || manager.userEmail}</p>
                    {statusBadge(manager.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {manager.userEmail}
                    </span>
                    {manager.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {manager.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 self-start">
                  {manager.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setStatus(manager.id, 'approved')}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {manager.status !== 'declined' && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setStatus(manager.id, 'declined')}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  )}
                  {manager.status === 'declined' && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setStatus(manager.id, 'pending')}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Mark pending
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      editingId === manager.id ? setEditingId(null) : startEditAssignments(manager)
                    }
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1.5"
                  >
                    {editingId === manager.id ? 'Cancel' : 'Assign properties'}
                  </button>
                </div>
              </div>

              {editingId === manager.id ? (
                <div className="p-5 bg-slate-50 border-b border-slate-100 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Select properties</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {propertyGroups.map((g) => (
                      <label key={g.groupKey} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={groupChecked(editPropertyIds, g.groupKey)}
                          onChange={() => setEditPropertyIds((ids) => toggleGroup(ids, g.groupKey))}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span className="truncate">{g.label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => saveAssignments(manager.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Save assignments
                  </button>
                </div>
              ) : null}

              <div className="p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Assigned properties ({manager.assignedProperties.length})
                </p>
                {manager.assignedProperties.length === 0 ? (
                  <p className="text-sm text-slate-500">No properties assigned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {manager.assignedProperties.map((prop) => (
                      <div key={prop.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5">
                        <img
                          src={prop.image || FALLBACK_PROPERTY_IMAGE}
                          alt=""
                          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{prop.name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {prop.address}{prop.city ? `, ${prop.city}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyManagersPanel;

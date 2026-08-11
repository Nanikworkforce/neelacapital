import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, CreditCard, Receipt, LogOut, Menu, X, Home, Plus,
  MapPin, Wallet, Calendar, FileText, Tag, Wrench, ChevronRight, ChevronDown, ChevronUp,
  AlertCircle, TrendingUp, Mail, Loader2, CheckCircle, XCircle, MessageSquare, DollarSign,
  ArrowUpRight, Zap,
} from 'lucide-react';
import NeelaLogo from './NeelaLogo';
import MaintenanceView from './MaintenanceView';
import AddExpenseModal from './AddExpenseModal';
import ViewportPortal from './ViewportPortal';
import PropertyMonthIncomeOpexEditor from './PropertyMonthIncomeOpexEditor';
import { isAuthenticated, getCurrentUser, logout, updateStoredUser } from '../services/auth';
import { api } from '../services/api';
import { Property, Tenant, Payment, OperatingExpense, MaintenanceRequest, TenantStatus } from '../types';
import {
  CATEGORY_LABELS,
  getPropertyGroupKeyFromProperty,
  groupPropertiesForSelect,
  unitBaseKey,
} from '../utils/propertyGrouping';
import { SEO_PAGES, usePageMeta } from '../utils/seo';
import { usePollWhileVisible } from '../hooks/usePollWhileVisible';

const formatMoney = (v: number) =>
  `$${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const FALLBACK_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

/** Synthetic tenants created by Excel P&L import (not real residents). */
function isExcelImportTenant(t: { email?: string; name?: string }) {
  const email = (t.email || '').toLowerCase();
  const name = (t.name || '').toLowerCase();
  return (
    email.startsWith('excel-import-')
    || email.endsWith('@neela.local')
    || name.startsWith('rent roll')
  );
}

type Tab = 'overview' | 'properties' | 'applications' | 'payments' | 'expenses' | 'maintenance';

function ManagerStatCard({
  label,
  value,
  icon: Icon,
  variant,
  badge,
  footer,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  variant: 'revenue' | 'overdue' | 'occupancy' | 'tickets' | 'pnl';
  badge?: string;
  footer?: React.ReactNode;
  onClick: () => void;
}) {
  const iconTone =
    variant === 'revenue' ? 'dash-stat-icon--emerald'
    : variant === 'overdue' ? 'dash-stat-icon--rose'
    : variant === 'occupancy' ? 'dash-stat-icon--indigo'
    : variant === 'tickets' ? 'dash-stat-icon--amber'
    : 'dash-stat-icon--teal';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`dash-stat dash-stat--${variant} w-full text-left group min-h-[7.5rem] sm:min-h-0 touch-manipulation`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className={`dash-stat-icon ${iconTone} group-hover:scale-105 transition-transform`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        {badge && (
          <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[45%]">
            {badge}
          </span>
        )}
      </div>
      <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight break-words tabular-nums leading-tight">{value}</p>
      <p className="text-[11px] sm:text-sm text-slate-500 font-semibold mt-1 truncate">{label}</p>
      {footer && (
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 text-[11px] sm:text-xs text-slate-600 font-medium">
          {footer}
        </div>
      )}
    </button>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  headerClassName = '',
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}) {
  return (
    <div className={`rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0 ${className}`}>
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-5 border-b border-slate-100 bg-slate-50/60 ${headerClassName}`}>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">{subtitle}</p>}
        </div>
        {action && <div className="w-full sm:w-auto flex-shrink-0 self-stretch sm:self-center min-w-0">{action}</div>}
      </div>
      <div className="p-3.5 sm:p-6 min-w-0 overflow-x-auto overscroll-x-contain">{children}</div>
    </div>
  );
}

function PageHeader({
  title,
  subtitle,
  icon: Icon,
  accent = 'from-emerald-600 via-teal-600 to-cyan-700',
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${accent} text-white p-5 sm:p-7 shadow-lg shadow-emerald-900/10`}>
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" aria-hidden />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-2xl" aria-hidden />
      <div className="relative flex items-start gap-4">
        <div className="hidden sm:flex p-3 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-white/85 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function TenantAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-800 font-bold text-sm flex-shrink-0 ring-2 ring-white shadow-sm">
      {initials || '?'}
    </div>
  );
}

function paymentStatusClass(status: string) {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
    case 'Overdue':
      return 'bg-rose-100 text-rose-800 ring-rose-200';
    case 'Pending':
      return 'bg-amber-100 text-amber-800 ring-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200';
  }
}

function EmptyState({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 rounded-2xl bg-slate-100/80 text-slate-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-sm text-slate-500 font-medium max-w-xs">{message}</p>
    </div>
  );
}

const PropertyManagerView: React.FC = () => {
  const navigate = useNavigate();
  usePageMeta(SEO_PAGES.managerPortal);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<OperatingExpense[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [noticeSending, setNoticeSending] = useState<string | null>(null);
  const [noticeFeedback, setNoticeFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expenseSuccessPopup, setExpenseSuccessPopup] = useState<OperatingExpense | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [messageTenant, setMessageTenant] = useState<Tenant | null>(null);
  const [messageText, setMessageText] = useState('');
  const [markPaidTarget, setMarkPaidTarget] = useState<{ payment?: Payment; tenant: Tenant } | null>(null);
  const [markPaidMethod, setMarkPaidMethod] = useState<'Cash' | 'Zelle' | 'Check' | 'Money Order'>('Cash');
  const [markPaidReference, setMarkPaidReference] = useState('');
  const [managedIds, setManagedIds] = useState<string[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [bellaPnlMonth, setBellaPnlMonth] = useState(1);
  const [tomballPnlMonth, setTomballPnlMonth] = useState(1);
  const [conroePnlMonth, setConroePnlMonth] = useState(1);
  const [avenueQPnlMonth, setAvenueQPnlMonth] = useState(1);
  const [shermanPnlMonth, setShermanPnlMonth] = useState(1);
  const [seventiethPnlMonth, setSeventiethPnlMonth] = useState(1);
  const [avenueHPnlMonth, setAvenueHPnlMonth] = useState(1);
  const [woodingPnlMonth, setWoodingPnlMonth] = useState(1);
  const [avenueFPnlMonth, setAvenueFPnlMonth] = useState(1);
  const [user, setUser] = useState(() => getCurrentUser('manager'));

  useEffect(() => {
    if (!isAuthenticated('manager')) {
      navigate('/manager/login', { replace: true });
      return;
    }
    const u = getCurrentUser('manager');
    if (!u || u.role !== 'property_manager' || u.is_staff || u.is_superuser) {
      navigate('/manager/login', { replace: true });
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const year = new Date().getFullYear();
        const [meRes, props, t, p, ex, m] = await Promise.all([
          api.getManagerMe(),
          api.getProperties(),
          api.getTenants(),
          api.getPayments(),
          api.getOperatingExpenses({ year, limit: 100 }),
          api.getMaintenanceRequests(),
        ]);
        if (cancelled) return;
        if (meRes.user) {
          const synced = updateStoredUser({
            first_name: meRes.user.first_name,
            last_name: meRes.user.last_name,
            email: meRes.user.email,
          }, 'manager');
          if (synced) setUser(synced);
        }
        setManagedIds(meRes.managed_property_ids);
        // Backend already scopes lists for property managers; avoid double-filtering to empty.
        setProperties(props);
        setTenants(t);
        setPayments(p);
        setExpenses(ex);
        setMaintenance(m);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Tenant/payment/maintenance lists are already scoped by the backend for property managers.
  // Hide Excel P&L "Rent Roll" placeholders — those are bookkeeping stubs, not real residents.
  const myTenants = useMemo(() => tenants.filter((t) => !isExcelImportTenant(t)), [tenants]);
  const excelImportTenantIds = useMemo(
    () => new Set(tenants.filter(isExcelImportTenant).map((t) => t.id)),
    [tenants],
  );

  const applicants = useMemo(() => myTenants.filter((t) => t.status === 'Applicant'), [myTenants]);
  const approvedTenants = useMemo(() => myTenants.filter((t) => t.status === TenantStatus.APPROVED), [myTenants]);
  const residents = useMemo(() => myTenants.filter((t) => t.status === 'Active'), [myTenants]);

  const refreshMaintenance = useCallback(async () => {
    try {
      const data = await api.getMaintenanceRequests();
      setMaintenance(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const refreshTenants = useCallback(async () => {
    try {
      const data = await api.getTenants();
      setTenants(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const refreshPayments = useCallback(async () => {
    try {
      const data = await api.getPayments();
      setPayments(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showActionFeedback = (type: 'success' | 'error', text: string) => {
    setNoticeFeedback({ type, text });
  };

  const handleTenantStatus = async (tenant: Tenant, newStatus: TenantStatus) => {
    const key = `status-${tenant.id}-${newStatus}`;
    setActionLoading(key);
    setNoticeFeedback(null);
    try {
      await api.updateTenant(tenant.id, { status: newStatus });
      await refreshTenants();
      showActionFeedback('success', `${tenant.name} updated to ${newStatus}.`);
    } catch (e: unknown) {
      showActionFeedback('error', e instanceof Error ? e.message : 'Could not update tenant.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendTenantMessage = async () => {
    if (!messageTenant || !messageText.trim()) return;
    const key = `msg-${messageTenant.id}`;
    setActionLoading(key);
    try {
      const res = await api.sendTenantMessage(messageTenant.id, messageText.trim());
      showActionFeedback('success', res.message || 'Message sent.');
      setMessageTenant(null);
      setMessageText('');
    } catch (e: unknown) {
      showActionFeedback('error', e instanceof Error ? e.message : 'Could not send message.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async () => {
    if (!markPaidTarget) return;
    const key = `paid-${markPaidTarget.tenant.id}`;
    setActionLoading(key);
    try {
      if (markPaidTarget.payment) {
        await api.markPaymentReceived(markPaidTarget.payment.id, markPaidMethod, markPaidReference || undefined);
      } else {
        await api.recordTenantPayment({
          tenantId: markPaidTarget.tenant.id,
          amount: markPaidTarget.tenant.rentAmount || markPaidTarget.tenant.balance || 0,
          method: markPaidMethod,
          reference: markPaidReference || undefined,
        });
      }
      await Promise.all([refreshPayments(), refreshTenants()]);
      showActionFeedback('success', `Payment recorded for ${markPaidTarget.tenant.name}.`);
      setMarkPaidTarget(null);
      setMarkPaidReference('');
      setMarkPaidMethod('Cash');
    } catch (e: unknown) {
      showActionFeedback('error', e instanceof Error ? e.message : 'Could not record payment.');
    } finally {
      setActionLoading(null);
    }
  };

  const myPayments = useMemo(
    () => payments.filter((p) => !excelImportTenantIds.has(p.tenantId)),
    [payments, excelImportTenantIds],
  );

  const delinquentResidents = useMemo(() => {
    return residents.filter((t) => {
      const hasBalance = (t.balance || 0) > 0;
      const hasOpenRent = myPayments.some(
        (p) => p.tenantId === t.id && p.type === 'Rent' && p.status !== 'Paid',
      );
      return hasBalance || hasOpenRent;
    });
  }, [residents, myPayments]);

  const latestOpenRentPayment = useCallback(
    (tenantId: string) =>
      myPayments
        .filter((p) => p.tenantId === tenantId && p.type === 'Rent' && p.status !== 'Paid')
        .sort((a, b) => b.date.localeCompare(a.date))[0],
    [myPayments],
  );

  const handleSendRentReminder = async (tenant: Tenant) => {
    const payment = latestOpenRentPayment(tenant.id);
    const key = `reminder-${tenant.id}`;
    setNoticeSending(key);
    setNoticeFeedback(null);
    try {
      if (payment) {
        const res = await api.sendPaymentReminder(payment.id);
        setNoticeFeedback({ type: 'success', text: res.message || `Reminder sent to ${tenant.name}.` });
      } else {
        const res = await api.sendTenantRentNotice(tenant.id, 'Rent Reminder');
        setNoticeFeedback({ type: 'success', text: res.message || `Rent reminder sent to ${tenant.name}.` });
      }
    } catch (e: unknown) {
      setNoticeFeedback({
        type: 'error',
        text: e instanceof Error ? e.message : 'Could not send rent reminder.',
      });
    } finally {
      setNoticeSending(null);
    }
  };

  const handleSendLateNotice = async (tenant: Tenant) => {
    const key = `late-${tenant.id}`;
    setNoticeSending(key);
    setNoticeFeedback(null);
    try {
      const res = await api.sendTenantRentNotice(tenant.id, 'Notice of Late Rent');
      setNoticeFeedback({ type: 'success', text: res.message || `Late notice sent to ${tenant.name}.` });
    } catch (e: unknown) {
      setNoticeFeedback({
        type: 'error',
        text: e instanceof Error ? e.message : 'Could not send late notice.',
      });
    } finally {
      setNoticeSending(null);
    }
  };

  const myMaintenance = maintenance;

  const openMaintenanceCount = useMemo(
    () => myMaintenance.filter((m) => m.status !== 'Resolved').length,
    [myMaintenance],
  );

  const propertyGroups = useMemo(() => groupPropertiesForSelect(properties), [properties]);

  /** Manager-entered costs only — hide Excel P&L import rows from this portal. */
  const managerRecordedExpenses = useMemo(
    () => expenses.filter((e) => !e.notes?.startsWith('excel-import-')),
    [expenses],
  );

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthExpenseTotal = useMemo(
    () => managerRecordedExpenses
      .filter((e) => e.date?.startsWith(currentMonthKey))
      .reduce((sum, e) => sum + (e.amount || 0), 0),
    [managerRecordedExpenses, currentMonthKey],
  );

  const monthRevenueTotal = useMemo(
    () => myPayments
      .filter((p) => p.status === 'Paid' && p.date?.startsWith(currentMonthKey))
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    [myPayments, currentMonthKey],
  );

  const overdueBalance = useMemo(
    () => residents.reduce((sum, t) => sum + (t.balance || 0), 0),
    [residents],
  );

  const managerName = user?.first_name?.trim() || 'there';

  const refreshExpenses = useCallback(async () => {
    try {
      const year = new Date().getFullYear();
      const data = await api.getOperatingExpenses({ year, limit: 100 });
      setExpenses(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const silentRefresh = useCallback(async () => {
    const year = new Date().getFullYear();
    const [meRes, props, t, p, ex, m] = await Promise.all([
      api.getManagerMe(),
      api.getProperties(),
      api.getTenants(),
      api.getPayments(),
      api.getOperatingExpenses({ year, limit: 100 }),
      api.getMaintenanceRequests(),
    ]);
    if (meRes.user) {
      const synced = updateStoredUser({
        first_name: meRes.user.first_name,
        last_name: meRes.user.last_name,
        email: meRes.user.email,
      });
      if (synced) setUser(synced);
    }
    setManagedIds(meRes.managed_property_ids);
    setProperties(props);
    setTenants(t);
    setPayments(p);
    setExpenses(ex);
    setMaintenance(m);
  }, []);

  usePollWhileVisible(silentRefresh, 30_000, !loading);

  const handleLogout = () => {
    logout('manager');
    navigate('/manager/login', { replace: true });
  };

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'properties', label: 'My Properties', icon: Building2 },
    { id: 'applications', label: 'Tenants & Leases', icon: Users },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'payments', label: 'Rent & Payments', icon: CreditCard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/30">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-20 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'properties': {
        const buildingCount = propertyGroups.length;
        const unitCount = propertyGroups.reduce((sum, g) => sum + Math.max(g.units.length, 1), 0);
        return (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <PageHeader
              icon={Building2}
              title="My Properties"
              subtitle={`${buildingCount} building${buildingCount === 1 ? '' : 's'} · ${unitCount} unit${unitCount === 1 ? '' : 's'} under your management`}
              accent="from-teal-600 via-emerald-600 to-cyan-700"
            />
            <div className="flex flex-col gap-4 max-w-4xl">
              {propertyGroups.map((group) => {
                const parent = properties.find((p) => p.id === group.propertyId);
                const unitRows = group.units.length > 0
                  ? group.units
                  : [{ label: group.label, propertyId: group.propertyId }];
                const multiUnit = unitRows.length > 1;
                const expanded = expandedProperty === group.groupKey;
                const img =
                  group.image ||
                  properties.find((p) => unitRows.some((u) => u.propertyId === p.id) && p.image)?.image ||
                  FALLBACK_PROPERTY_IMAGE;

                return (
                  <div
                    key={group.groupKey}
                    className="rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200/70 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-200/60 transition-all duration-300"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedProperty(expanded ? null : group.groupKey)}
                      className="w-full text-left flex flex-col min-[420px]:flex-row gap-0 min-[420px]:gap-3 sm:gap-4 items-stretch touch-manipulation"
                    >
                      <div className="w-full min-[420px]:w-[34%] sm:w-40 md:w-48 flex-shrink-0 overflow-hidden bg-slate-200 self-stretch h-36 min-[420px]:h-auto min-[420px]:min-h-[7.5rem]">
                        <img
                          src={img}
                          alt={group.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 p-3.5 sm:p-5 flex flex-col justify-center gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">{group.label}</h3>
                            {(group.address || parent?.city) && (
                              <p className="text-xs sm:text-sm text-slate-500 flex items-start gap-1.5 mt-1">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-600" />
                                <span className="line-clamp-2">
                                  {[group.address, parent?.city, parent?.state].filter(Boolean).join(', ')}
                                </span>
                              </p>
                            )}
                          </div>
                          {expanded
                            ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                            : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                            <Home className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-sm font-semibold text-emerald-700">
                            {multiUnit
                              ? `${unitRows.length} units`
                              : (parent?.status || 'Active')}
                          </p>
                          <span className="text-xs text-slate-400 ml-auto font-medium hidden min-[420px]:inline">
                            {expanded ? 'Hide units' : 'View units'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t border-slate-100 bg-slate-50/60 px-4 sm:px-5 py-3 space-y-2">
                        {unitRows.map((unit) => {
                          const siblings = properties.filter(
                            (p) => getPropertyGroupKeyFromProperty(p) === group.groupKey,
                          );
                          const unitProp =
                            siblings.find((p) => (p.name || '').toLowerCase() === unit.label.toLowerCase())
                            || siblings.find((p) => unitBaseKey(p.name || '') === unitBaseKey(unit.label))
                            || (unitRows.length === 1 ? parent : undefined);
                          const status = unitProp?.status || 'vacant';
                          const price = unitProp?.price;
                          return (
                            <div
                              key={`${group.groupKey}-${unit.label}`}
                              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                            >
                              <div className="min-w-0 flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 flex-shrink-0">
                                  <Home className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 truncate">{unit.label}</p>
                                  <p className="text-[11px] text-slate-500 capitalize">{status}</p>
                                </div>
                              </div>
                              {price != null && price > 0 && (
                                <p className="text-sm font-bold text-emerald-700 flex-shrink-0">
                                  {formatMoney(price)}
                                  <span className="text-[10px] font-semibold text-slate-400">/mo</span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {propertyGroups.length === 0 && (
                <SectionCard title="No properties yet">
                  <EmptyState icon={Building2} message="No properties assigned yet. Contact admin to get buildings linked to your account." />
                </SectionCard>
              )}
            </div>
          </div>
        );
      }
      case 'applications':
        return (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <PageHeader
              icon={Users}
              title="Tenants & Leases"
              subtitle={`${applicants.length} pending application${applicants.length === 1 ? '' : 's'} · ${residents.length} active resident${residents.length === 1 ? '' : 's'}`}
              accent="from-violet-600 via-indigo-600 to-blue-700"
            />

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <ManagerStatCard label="Applications" value={applicants.length} icon={FileText} variant="tickets" onClick={() => {}} />
              <ManagerStatCard label="Residents" value={residents.length} icon={Users} variant="revenue" onClick={() => {}} />
            </div>

            <SectionCard
              title="Tenant Applications"
              subtitle="Review new applicants for your properties"
              headerClassName="from-amber-50/80 to-white"
            >
              {applicants.length === 0 ? (
                <EmptyState icon={FileText} message="No pending applications right now." />
              ) : (
                <div className="space-y-3 -m-1">
                  {applicants.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-amber-50/30 p-4 hover:border-amber-200/80 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-200"
                    >
                      <TenantAvatar name={t.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">{t.name}</p>
                        <p className="text-sm text-slate-500 truncate">{t.email}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0 text-amber-600" />
                          {t.propertyUnit}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => handleTenantStatus(t, TenantStatus.APPROVED)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {actionLoading === `status-${t.id}-${TenantStatus.APPROVED}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={!!actionLoading}
                          onClick={() => handleTenantStatus(t, TenantStatus.DECLINED)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        >
                          {actionLoading === `status-${t.id}-${TenantStatus.DECLINED}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {approvedTenants.length > 0 && (
              <SectionCard
                title="Approved — awaiting move-in"
                subtitle="Mark tenants active when they move in"
                headerClassName="from-blue-50/80 to-white"
              >
                <div className="space-y-3 -m-1">
                  {approvedTenants.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4"
                    >
                      <TenantAvatar name={t.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">{t.name}</p>
                        <p className="text-xs text-slate-500 truncate">{t.propertyUnit}</p>
                      </div>
                      <button
                        type="button"
                        disabled={!!actionLoading}
                        onClick={() => handleTenantStatus(t, TenantStatus.ACTIVE)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading === `status-${t.id}-${TenantStatus.ACTIVE}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Move in (Active)
                      </button>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            <SectionCard
              title="Active Residents"
              subtitle="Current tenants on your assigned properties"
              headerClassName="from-emerald-50/80 to-white"
            >
              {residents.length === 0 ? (
                <EmptyState icon={Users} message="No active residents on your properties yet." />
              ) : (
                <div className="space-y-3 -m-1">
                  {residents.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-emerald-50/30 p-4 hover:border-emerald-200/80 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-200"
                    >
                      <TenantAvatar name={t.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">{t.name}</p>
                        <p className="text-sm text-slate-500 truncate">{t.email}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0 text-emerald-600" />
                          {t.propertyUnit}
                        </p>
                        {(t.balance || 0) > 0 && (
                          <p className="text-xs font-semibold text-rose-600 mt-1">{formatMoney(t.balance)} due</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => { setMessageTenant(t); setMessageText(''); }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        );
      case 'maintenance':
        return (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <PageHeader
              icon={Wrench}
              title="Maintenance"
              subtitle={`${openMaintenanceCount} open ticket${openMaintenanceCount === 1 ? '' : 's'} across your properties`}
              accent="from-amber-600 via-emerald-700 to-teal-700"
            />
            <div className="rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200/70 shadow-sm overflow-hidden p-4 sm:p-6">
              <MaintenanceView
                requests={maintenance}
                tenants={myTenants}
                onMaintenanceChange={refreshMaintenance}
              />
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-6 sm:space-y-8 animate-fade-in">
            <PageHeader
              icon={CreditCard}
              title="Rent & Payments"
              subtitle="Follow up on overdue rent — send reminders or formal late notices by email"
              accent="from-emerald-600 via-teal-600 to-cyan-700"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <ManagerStatCard label="Overdue" value={delinquentResidents.length} icon={AlertCircle} variant="overdue" onClick={() => {}} />
              <ManagerStatCard label="Payments" value={myPayments.length} icon={CreditCard} variant="revenue" onClick={() => {}} />
              <ManagerStatCard label="Collected" value={myPayments.filter((p) => p.status === 'Paid').length} icon={TrendingUp} variant="pnl" onClick={() => {}} />
            </div>

            {noticeFeedback && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                  noticeFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {noticeFeedback.type === 'success' ? (
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                {noticeFeedback.text}
              </div>
            )}

            <SectionCard
              title="Needs follow-up"
              subtitle="Tenants with balance due or unpaid rent"
              headerClassName="from-amber-50/90 to-orange-50/50"
            >
              {delinquentResidents.length === 0 ? (
                <EmptyState icon={CreditCard} message="No overdue rent on your properties — you're all caught up." />
              ) : (
                <div className="space-y-3 -m-1">
                  {delinquentResidents.map((tenant) => {
                    const openPayment = latestOpenRentPayment(tenant.id);
                    const reminderKey = `reminder-${tenant.id}`;
                    const lateKey = `late-${tenant.id}`;
                    return (
                      <div
                        key={tenant.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-100/80 bg-gradient-to-r from-white to-amber-50/40 p-4 hover:shadow-md hover:shadow-amber-500/5 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <TenantAvatar name={tenant.name} />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{tenant.name}</p>
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {tenant.propertyUnit}
                            </p>
                            <p className="text-sm font-bold text-rose-700 mt-1">
                              {formatMoney(tenant.balance || 0)} due
                              {openPayment ? (
                                <span className="font-medium text-slate-500 text-xs ml-1">
                                  · {openPayment.status} {formatMoney(openPayment.amount)}
                                </span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0 sm:pl-2">
                          <button
                            type="button"
                            disabled={!!actionLoading}
                            onClick={() => {
                              setMarkPaidTarget({ payment: openPayment, tenant });
                              setMarkPaidMethod('Cash');
                              setMarkPaidReference('');
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Mark paid
                          </button>
                          <button
                            type="button"
                            disabled={!!noticeSending}
                            onClick={() => handleSendRentReminder(tenant)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 shadow-md shadow-emerald-600/20 transition-all"
                          >
                            {noticeSending === reminderKey ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Mail className="w-3.5 h-3.5" />
                            )}
                            Rent reminder
                          </button>
                          <button
                            type="button"
                            disabled={!!noticeSending}
                            onClick={() => handleSendLateNotice(tenant)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 shadow-md shadow-amber-500/20 transition-all"
                          >
                            {noticeSending === lateKey ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            Late notice
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Recent payments" subtitle="Latest rent and fee activity">
              {myPayments.length === 0 ? (
                <EmptyState icon={CreditCard} message="No payments recorded yet." />
              ) : (
                <div className="divide-y divide-slate-100 -mx-1 rounded-xl overflow-hidden border border-slate-100">
                  {myPayments.slice(0, 20).map((p) => {
                    const tenant = myTenants.find((t) => t.id === p.tenantId);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white hover:bg-emerald-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                            <CreditCard className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-800 truncate">{tenant?.name || 'Tenant'}</p>
                            <p className="text-xs text-slate-500">{p.date} · {p.type}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 space-y-1">
                          <p className="font-bold text-slate-900">{formatMoney(p.amount)}</p>
                          <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ring-1 ${paymentStatusClass(p.status)}`}>
                            {p.status}
                          </span>
                          {p.status !== 'Paid' && tenant && (
                            <button
                              type="button"
                              onClick={() => {
                                setMarkPaidTarget({ payment: p, tenant });
                                setMarkPaidMethod('Cash');
                                setMarkPaidReference('');
                              }}
                              className="block mt-2 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900"
                            >
                              Mark paid
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>
        );
      case 'expenses':
        return (
          <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl">
            <PageHeader
              icon={Receipt}
              title="Record Expenses"
              subtitle="Log day-to-day operating costs — repairs, utilities, cleaning, and supplies for your properties"
              accent="from-violet-600 via-purple-600 to-indigo-700"
            />

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <ManagerStatCard label="This month" value={formatMoney(monthExpenseTotal)} icon={Receipt} variant="pnl" onClick={() => {}} />
              <ManagerStatCard label="Recorded" value={managerRecordedExpenses.length} icon={TrendingUp} variant="revenue" onClick={() => {}} />
            </div>

            {noticeFeedback && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                  noticeFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {noticeFeedback.type === 'success' ? (
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                {noticeFeedback.text}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAddExpense(true)}
              className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-4 sm:p-6 text-left shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/25 transition-all group touch-manipulation"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-white/15 ring-1 ring-white/20 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base sm:text-lg">Add expense</h3>
                  <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 line-clamp-2">
                    Property → unit → type → amount. Add multiple in one go.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/80 flex-shrink-0" />
              </div>
            </button>

            {(() => {
              const bella = properties.find((p) => /bella\s*jess/i.test(p.name || ''));
              if (!bella) return null;
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ];
              return (
                <SectionCard
                  title="Bella Jess — monthly P&L inputs"
                  action={
                    <select
                      value={bellaPnlMonth}
                      onChange={(e) => setBellaPnlMonth(Number(e.target.value))}
                      className="w-full sm:w-auto min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      {monthNames.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name} 2026
                        </option>
                      ))}
                    </select>
                  }
                >
                  <PropertyMonthIncomeOpexEditor
                    key={`bella-${bellaPnlMonth}`}
                    propertyId={bella.id}
                    year={2026}
                    month={bellaPnlMonth}
                    unitLabel="Door 1"
                    monthTitle={`${monthNames[bellaPnlMonth - 1]} 2026`}
                    overview={{
                      purchasePrice: 255000,
                      downPayment: 52234.95,
                      closingCost: 16897.62,
                      landValue: 49500,
                      depreciationYears: 27.5,
                      loanAmount: 204000,
                      interestRate: 0.0725,
                      monthlyMortgagePayment: 2076.13,
                    }}
                    showPerformanceMetrics={false}
                    useSheetDefaults
                    sheetKind="bella"
                  />
                </SectionCard>
              );
            })()}

            {(() => {
              const tomball = properties.find(
                (p) => /tomball|tomabll/i.test(p.name || '') && !/bella\s*jess/i.test(p.name || ''),
              );
              if (!tomball) return null;
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ];
              return (
                <SectionCard
                  title="Tomball — monthly P&L inputs"
                  action={
                    <select
                      value={tomballPnlMonth}
                      onChange={(e) => setTomballPnlMonth(Number(e.target.value))}
                      className="w-full sm:w-auto min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      {monthNames.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name} 2026
                        </option>
                      ))}
                    </select>
                  }
                >
                  <PropertyMonthIncomeOpexEditor
                    key={`tomball-${tomballPnlMonth}`}
                    propertyId={tomball.id}
                    year={2026}
                    month={tomballPnlMonth}
                    unitLabel="Door 1"
                    monthTitle={`${monthNames[tomballPnlMonth - 1]} 2026`}
                    overview={{
                      purchasePrice: 0,
                      downPayment: 0,
                      closingCost: 0,
                      landValue: 49500,
                      depreciationYears: 27.5,
                      loanAmount: 0,
                      interestRate: 0,
                      monthlyMortgagePayment: 2112.22,
                    }}
                    showPerformanceMetrics={false}
                    useSheetDefaults
                    sheetKind="tomball"
                  />
                </SectionCard>
              );
            })()}

            {(() => {
              const conroe = properties.find((p) => /conroe/i.test(p.name || ''));
              if (!conroe) return null;
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ];
              return (
                <SectionCard
                  title="Conroe — monthly P&L inputs"
                  action={
                    <select
                      value={conroePnlMonth}
                      onChange={(e) => setConroePnlMonth(Number(e.target.value))}
                      className="w-full sm:w-auto min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      {monthNames.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name} 2026
                        </option>
                      ))}
                    </select>
                  }
                >
                  <PropertyMonthIncomeOpexEditor
                    key={`conroe-${conroePnlMonth}`}
                    propertyId={conroe.id}
                    year={2026}
                    month={conroePnlMonth}
                    unitLabel="Door 1"
                    monthTitle={`${monthNames[conroePnlMonth - 1]} 2026`}
                    overview={{
                      purchasePrice: 0,
                      downPayment: 0,
                      closingCost: 0,
                      landValue: 49500,
                      depreciationYears: 27.5,
                      loanAmount: 0,
                      interestRate: 0,
                      monthlyMortgagePayment: 0,
                    }}
                    showPerformanceMetrics={false}
                    useSheetDefaults
                    sheetKind="conroe"
                  />
                </SectionCard>
              );
            })()}

            {(() => {
              const avenueQ = properties.find((p) => /avenue\s*q|ave\.?\s*q|aveq/i.test(p.name || ''));
              if (!avenueQ) return null;
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ];
              return (
                <SectionCard
                  title="Avenue Q — monthly P&L inputs (4-plex)"
                  action={
                    <select
                      value={avenueQPnlMonth}
                      onChange={(e) => setAvenueQPnlMonth(Number(e.target.value))}
                      className="w-full sm:w-auto min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      {monthNames.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name} 2026
                        </option>
                      ))}
                    </select>
                  }
                >
                  <PropertyMonthIncomeOpexEditor
                    key={`avenueq-${avenueQPnlMonth}`}
                    propertyId={avenueQ.id}
                    year={2026}
                    month={avenueQPnlMonth}
                    unitLabel="Door 1"
                    monthTitle={`${monthNames[avenueQPnlMonth - 1]} 2026`}
                    overview={{
                      purchasePrice: 555000,
                      downPayment: 145522.37,
                      closingCost: 25693.33,
                      landValue: 85000,
                      depreciationYears: 27.5,
                      loanAmount: 416250,
                      interestRate: 0.07375,
                      monthlyMortgagePayment: 3685.79,
                    }}
                    showPerformanceMetrics={false}
                    useSheetDefaults
                    sheetKind="avenueq"
                  />
                </SectionCard>
              );
            })()}

            {(() => {
              const sherman = properties.find((p) => /sherman/i.test(p.name || ''));
              if (!sherman) return null;
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ];
              return (
                <SectionCard
                  title="Sherman St — monthly P&L inputs (6-plex)"
                  action={
                    <select
                      value={shermanPnlMonth}
                      onChange={(e) => setShermanPnlMonth(Number(e.target.value))}
                      className="w-full sm:w-auto min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      {monthNames.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name} 2026
                        </option>
                      ))}
                    </select>
                  }
                >
                  <PropertyMonthIncomeOpexEditor
                    key={`sherman-${shermanPnlMonth}`}
                    propertyId={sherman.id}
                    year={2026}
                    month={shermanPnlMonth}
                    unitLabel="Door 1"
                    monthTitle={`${monthNames[shermanPnlMonth - 1]} 2026`}
                    overview={{
                      purchasePrice: 205000,
                      downPayment: 205000,
                      closingCost: 5257,
                      landValue: 0,
                      depreciationYears: 27.5,
                      loanAmount: 0,
                      interestRate: 0,
                      monthlyMortgagePayment: 0,
                    }}
                    showPerformanceMetrics={false}
                    useSheetDefaults
                    sheetKind="sherman"
                  />
                </SectionCard>
              );
            })()}

            {(() => {
              const seventieth = properties.find((p) => /70th/i.test(p.name || ''));
              if (!seventieth) return null;
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ];
              return (
                <SectionCard
                  title="70th Street — monthly P&L inputs (4-plex)"
                  action={
                    <select
                      value={seventiethPnlMonth}
                      onChange={(e) => setSeventiethPnlMonth(Number(e.target.value))}
                      className="w-full sm:w-auto min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      {monthNames.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name} 2026
                        </option>
                      ))}
                    </select>
                  }
                >
                  <PropertyMonthIncomeOpexEditor
                    key={`seventieth-${seventiethPnlMonth}`}
                    propertyId={seventieth.id}
                    year={2026}
                    month={seventiethPnlMonth}
                    unitLabel="Door 1"
                    monthTitle={`${monthNames[seventiethPnlMonth - 1]} 2026`}
                    overview={{
                      purchasePrice: 274000,
                      downPayment: 30000,
                      closingCost: 0,
                      landValue: 0,
                      depreciationYears: 27.5,
                      loanAmount: 274000,
                      interestRate: 0.09,
                      monthlyMortgagePayment: 3192,
                    }}
                    showPerformanceMetrics={false}
                    useSheetDefaults
                    sheetKind="seventieth"
                  />
                </SectionCard>
              );
            })()}

            {(() => {
              const avenueH = properties.find((p) => /avenue\s*h|ave\.?\s*h|aveh/i.test(p.name || ''));
              if (!avenueH) return null;
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ];
              return (
                <SectionCard
                  title="Avenue H — monthly P&L inputs (4-plex)"
                  action={
                    <select
                      value={avenueHPnlMonth}
                      onChange={(e) => setAvenueHPnlMonth(Number(e.target.value))}
                      className="w-full sm:w-auto min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      {monthNames.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name} 2026
                        </option>
                      ))}
                    </select>
                  }
                >
                  <PropertyMonthIncomeOpexEditor
                    key={`avenueh-${avenueHPnlMonth}`}
                    propertyId={avenueH.id}
                    year={2026}
                    month={avenueHPnlMonth}
                    unitLabel="Door 1"
                    monthTitle={`${monthNames[avenueHPnlMonth - 1]} 2026`}
                    overview={{
                      purchasePrice: 300000,
                      downPayment: 41513.32,
                      closingCost: 0,
                      landValue: 0,
                      depreciationYears: 27.5,
                      loanAmount: 275580.06,
                      interestRate: 0.09,
                      monthlyMortgagePayment: 2025,
                    }}
                    showPerformanceMetrics={false}
                    useSheetDefaults
                    sheetKind="avenueh"
                  />
                </SectionCard>
              );
            })()}

            {(() => {
              const wooding = properties.find((p) => /wooding|wooden/i.test(p.name || ''));
              if (!wooding) return null;
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ];
              return (
                <SectionCard
                  title="Wooding St — monthly P&L inputs (3-plex)"
                  action={
                    <select
                      value={woodingPnlMonth}
                      onChange={(e) => setWoodingPnlMonth(Number(e.target.value))}
                      className="w-full sm:w-auto min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      {monthNames.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name} 2026
                        </option>
                      ))}
                    </select>
                  }
                >
                  <PropertyMonthIncomeOpexEditor
                    key={`wooding-${woodingPnlMonth}`}
                    propertyId={wooding.id}
                    year={2026}
                    month={woodingPnlMonth}
                    unitLabel="Door 1"
                    monthTitle={`${monthNames[woodingPnlMonth - 1]} 2026`}
                    overview={{
                      purchasePrice: 216507,
                      downPayment: 16507,
                      closingCost: 0,
                      landValue: 0,
                      depreciationYears: 27.5,
                      loanAmount: 200000,
                      interestRate: 0.09,
                      monthlyMortgagePayment: 4127,
                    }}
                    showPerformanceMetrics={false}
                    useSheetDefaults
                    sheetKind="wooding"
                  />
                </SectionCard>
              );
            })()}

            {(() => {
              const avenueF = properties.find((p) => /avenue\s*f|ave\.?\s*f|avef/i.test(p.name || ''));
              if (!avenueF) return null;
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ];
              return (
                <SectionCard
                  title="Avenue F — monthly P&L inputs (4-plex)"
                  action={
                    <select
                      value={avenueFPnlMonth}
                      onChange={(e) => setAvenueFPnlMonth(Number(e.target.value))}
                      className="w-full sm:w-auto min-h-[40px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800"
                    >
                      {monthNames.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name} 2026
                        </option>
                      ))}
                    </select>
                  }
                >
                  <PropertyMonthIncomeOpexEditor
                    key={`avenuef-${avenueFPnlMonth}`}
                    propertyId={avenueF.id}
                    year={2026}
                    month={avenueFPnlMonth}
                    unitLabel="Door 1"
                    monthTitle={`${monthNames[avenueFPnlMonth - 1]} 2026`}
                    overview={{
                      purchasePrice: 180000,
                      downPayment: 18000,
                      closingCost: 0,
                      landValue: 0,
                      depreciationYears: 27.5,
                      loanAmount: 162000,
                      interestRate: 0.08,
                      monthlyMortgagePayment: 1189,
                    }}
                    showPerformanceMetrics={false}
                    useSheetDefaults
                    sheetKind="avenuef"
                  />
                </SectionCard>
              );
            })()}

            <SectionCard title="Recent expenses" subtitle="Your latest operating cost entries">
              {managerRecordedExpenses.length === 0 ? (
                <EmptyState icon={Receipt} message="No expenses recorded yet. Tap Add expense to log your first one." />
              ) : (
                <div className="space-y-2 -m-1">
                  {managerRecordedExpenses.slice(0, 15).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-violet-50/20 p-3 sm:p-4 hover:border-violet-200/60 hover:shadow-sm transition-all min-w-0"
                    >
                      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-xl bg-violet-100 text-violet-700 flex-shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-slate-800 truncate">
                            {e.propertyName || 'Property'}
                            {e.unitLabel ? ` · ${e.unitLabel}` : ''}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2 break-words">
                            {CATEGORY_LABELS[e.category] || e.category}
                            {e.notes ? ` · ${e.notes}` : ''}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            {e.date}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-sm sm:text-base text-rose-700 flex-shrink-0 tabular-nums pt-0.5">{formatMoney(e.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        );
      default: {
        const overviewGroups = propertyGroups.slice(0, 4);
        const recentApplicants = applicants.slice(0, 3);
        const openTickets = myMaintenance.filter((m) => m.status !== 'Resolved').slice(0, 3);
        const recentPayments = myPayments.slice(0, 5);

        return (
          <div className="space-y-5 sm:space-y-6 lg:space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 pb-4 sm:pb-5 border-b-2 border-slate-100">
              <div className="min-w-0 w-full lg:w-auto">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent tracking-tight mb-1">
                  Overview
                </h1>
                <p className="text-slate-600 text-sm sm:text-base font-medium break-words">
                  Welcome back, {managerName}. Here&apos;s what needs attention across your {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}.
                </p>
              </div>
              <div className="flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center gap-2 sm:gap-3 w-full lg:w-auto">
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-full border border-slate-200 font-semibold whitespace-nowrap">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>{residents.length} active resident{residents.length === 1 ? '' : 's'}</span>
                </div>
                {applicants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className="w-full lg:w-auto px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all touch-manipulation min-h-[2.75rem]"
                  >
                    Review {applicants.length} application{applicants.length === 1 ? '' : 's'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              <ManagerStatCard
                label="Properties"
                value={properties.length}
                icon={Building2}
                variant="occupancy"
                badge="Portfolio"
                footer={<span className="flex items-center gap-1.5">View portfolio <ChevronRight className="w-3.5 h-3.5" /></span>}
                onClick={() => setActiveTab('properties')}
              />
              <ManagerStatCard
                label="Applications"
                value={applicants.length}
                icon={FileText}
                variant="pnl"
                badge={applicants.length > 0 ? 'Pending' : 'Clear'}
                onClick={() => setActiveTab('applications')}
              />
              <ManagerStatCard
                label="Active Residents"
                value={residents.length}
                icon={Users}
                variant="occupancy"
                onClick={() => setActiveTab('applications')}
              />
              <ManagerStatCard
                label="Open Tickets"
                value={openMaintenanceCount}
                icon={Wrench}
                variant="tickets"
                badge={openMaintenanceCount > 0 ? 'Needs work' : 'All clear'}
                footer={openMaintenanceCount > 0 ? <span className="flex items-center gap-1.5 text-amber-700"><Zap className="w-3.5 h-3.5" />View maintenance</span> : undefined}
                onClick={() => setActiveTab('maintenance')}
              />
              <ManagerStatCard
                label="Expenses (month)"
                value={formatMoney(monthExpenseTotal)}
                icon={Receipt}
                variant="pnl"
                onClick={() => setActiveTab('expenses')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="dash-pnl-banner sm:col-span-2 min-w-0">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className="dash-stat-icon dash-stat-icon--emerald flex-shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">This month</p>
                      <p className="text-base sm:text-xl font-bold text-slate-900 break-words">{formatMoney(monthRevenueTotal)} collected</p>
                      <p className="text-xs text-slate-500 mt-0.5 break-words">
                        {formatMoney(monthExpenseTotal)} expenses · {formatMoney(overdueBalance)} outstanding
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className="text-sm font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-700 touch-manipulation min-h-[2.75rem] sm:min-h-0"
                  >
                    Rent & payments <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExpense(true)}
                className="dash-action text-left group touch-manipulation min-h-[3.25rem]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500 text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm">Record expense</p>
                    <p className="text-xs text-slate-500 mt-0.5">Log a receipt or cost</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                </div>
              </button>
            </div>

            <SectionCard
              title="Your Properties"
              subtitle="Assigned buildings and units"
              action={
                properties.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('properties')}
                    className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                ) : undefined
              }
            >
              {overviewGroups.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No properties assigned yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 -m-1">
                  {overviewGroups.map((group) => (
                    <div
                      key={group.groupKey}
                      className="group flex flex-col min-[420px]:flex-row gap-0 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50 hover:shadow-lg hover:border-emerald-200/60 transition-all duration-300 min-w-0"
                    >
                      <div className="w-full min-[420px]:w-[38%] sm:w-[34%] flex-shrink-0 overflow-hidden bg-slate-200 h-28 min-[420px]:h-auto">
                        <img
                          src={group.image || FALLBACK_PROPERTY_IMAGE}
                          alt={group.label}
                          className="w-full h-full min-h-[6.5rem] object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="py-3 px-3.5 sm:px-4 min-w-0 flex-1 flex flex-col justify-center">
                        <p className="font-bold text-slate-900 truncate text-sm sm:text-base">{group.label}</p>
                        {group.address && (
                          <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-emerald-600" />
                            <span className="truncate">{group.address}</span>
                          </p>
                        )}
                        <p className="text-[11px] sm:text-xs text-emerald-700 font-semibold mt-2">
                          {group.units.length > 1
                            ? `${group.units.length} units`
                            : (properties.find((p) => p.id === group.propertyId)?.status || 'Active')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <SectionCard
                title="Pending Applications"
                action={
                  <button type="button" onClick={() => setActiveTab('applications')} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                    View all
                  </button>
                }
              >
                {recentApplicants.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No pending applications.</p>
                ) : (
                  <div className="space-y-2.5 -m-1">
                    {recentApplicants.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3.5 hover:border-amber-200/80 transition-colors">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-800 truncate">{t.name}</p>
                          <p className="text-xs text-slate-500 truncate">{t.propertyUnit}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex-shrink-0">
                          Applicant
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Maintenance"
                action={
                  <button type="button" onClick={() => setActiveTab('maintenance')} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                    View all
                  </button>
                }
              >
                {openTickets.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No open maintenance requests.</p>
                ) : (
                  <div className="space-y-2.5 -m-1">
                    {openTickets.map((m) => (
                      <div key={m.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5 hover:border-rose-200/80 transition-colors">
                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 flex-shrink-0">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-slate-800 truncate">{m.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{m.status} · {m.priority}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            <SectionCard
              title="Recent Payments"
              action={
                <button type="button" onClick={() => setActiveTab('payments')} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  View all
                </button>
              }
            >
              {recentPayments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No payments recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 -mx-1 rounded-xl overflow-hidden border border-slate-100">
                  {recentPayments.map((p) => {
                    const tenant = myTenants.find((t) => t.id === p.tenantId);
                    return (
                      <div key={p.id} className="flex items-center justify-between px-4 py-3.5 bg-white hover:bg-emerald-50/30 transition-colors text-sm">
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{tenant?.name || 'Tenant'}</p>
                            <p className="text-xs text-slate-500">{p.date}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="font-bold text-emerald-700">{formatMoney(p.amount)}</p>
                          <p className="text-[10px] uppercase font-semibold text-slate-400">{p.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Recent Expenses"
              action={
                <button type="button" onClick={() => setActiveTab('expenses')} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                  View all
                </button>
              }
            >
              {managerRecordedExpenses.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No expenses recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 -mx-1 rounded-xl overflow-hidden border border-slate-100">
                  {managerRecordedExpenses.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center justify-between px-4 py-3.5 bg-white hover:bg-violet-50/30 transition-colors text-sm">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-4 h-4 text-violet-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {e.propertyName || 'Property'}
                            {e.unitLabel ? ` · ${e.unitLabel}` : ''}
                          </p>
                          <p className="text-xs text-slate-500">{CATEGORY_LABELS[e.category] || e.category} · {e.date}</p>
                        </div>
                      </div>
                      <p className="font-bold text-rose-700 flex-shrink-0 ml-3">{formatMoney(e.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        );
      }
    }
  };

  const activeNavLabel = navItems.find((n) => n.id === activeTab)?.label ?? 'Overview';

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-x-hidden">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden touch-manipulation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(88vw,18rem)] flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl shadow-black/30 border-r border-slate-800/50 transform transition-transform duration-300 ease-out md:translate-x-0 md:static md:inset-auto md:w-64 lg:w-72 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="manager-sidebar-logo flex flex-col items-center justify-center min-h-[4.75rem] px-4 py-5 border-b border-white/5">
          <NeelaLogo variant="full" size="sm" showGlow className="shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/90 mt-3">
            Property Manager
          </p>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto overscroll-contain">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => { setActiveTab(id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-200 touch-manipulation min-h-[2.75rem] ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 sm:p-4 border-t border-slate-800/60 bg-slate-950/40">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 sm:py-3 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/70 text-sm font-semibold transition-colors touch-manipulation min-h-[2.75rem]"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col manager-content-wrap">
        <header className="manager-mobile-header md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-3 py-2.5 sm:px-4 shadow-sm shadow-slate-200/40 safe-area-top">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 -ml-1 rounded-xl hover:bg-slate-100 text-slate-700 flex-shrink-0 touch-manipulation min-h-[2.75rem] min-w-[2.75rem] inline-flex items-center justify-center"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <NeelaLogo variant="full" size="sm" className="shrink-0 min-w-0 max-w-[42vw]" />
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 truncate">
                {activeNavLabel}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          {noticeFeedback && activeTab !== 'expenses' && activeTab !== 'payments' && (
            <div
              className={`mb-4 rounded-xl border px-3 sm:px-4 py-3 text-sm font-medium flex items-start sm:items-center gap-2 break-words ${
                noticeFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {noticeFeedback.type === 'success' ? (
                <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
              )}
              <span className="min-w-0">{noticeFeedback.text}</span>
            </div>
          )}
          {renderContent()}
        </main>
      </div>

        {messageTenant && (
        <ViewportPortal>
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm"
          style={{ position: 'fixed', inset: 0 }}
        >
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl border border-slate-200 p-4 sm:p-5 max-h-[min(92dvh,90vh)] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <h3 className="font-bold text-slate-900">Message {messageTenant.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Sent by email to {messageTenant.email}</p>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={5}
              placeholder="Move-in instructions, parking, keys, rent follow-up..."
              className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button type="button" onClick={() => setMessageTenant(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button
                type="button"
                disabled={!messageText.trim() || !!actionLoading}
                onClick={handleSendTenantMessage}
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading === `msg-${messageTenant.id}` ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </div>
        </div>
        </ViewportPortal>
      )}

      {markPaidTarget && (
        <ViewportPortal>
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm"
          style={{ position: 'fixed', inset: 0 }}
        >
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl border border-slate-200 p-4 sm:p-5 max-h-[min(92dvh,90vh)] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <h3 className="font-bold text-slate-900">Mark rent received</h3>
            <p className="text-sm text-slate-500 mt-1">{markPaidTarget.tenant.name}</p>
            <label className="block mt-4 text-xs font-semibold text-slate-600">Payment method</label>
            <select
              value={markPaidMethod}
              onChange={(e) => setMarkPaidMethod(e.target.value as typeof markPaidMethod)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm"
            >
              <option value="Cash">Cash</option>
              <option value="Zelle">Zelle</option>
              <option value="Check">Check</option>
              <option value="Money Order">Money Order</option>
            </select>
            <label className="block mt-3 text-xs font-semibold text-slate-600">Reference (optional)</label>
            <input
              value={markPaidReference}
              onChange={(e) => setMarkPaidReference(e.target.value)}
              placeholder="Check #, Zelle memo..."
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button type="button" onClick={() => setMarkPaidTarget(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
                Cancel
              </button>
              <button
                type="button"
                disabled={!!actionLoading}
                onClick={handleMarkPaid}
                className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                Confirm paid
              </button>
            </div>
          </div>
        </div>
        </ViewportPortal>
      )}

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
              {expenseSuccessPopup.unitLabel ? ` · ${expenseSuccessPopup.unitLabel}` : ''}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {CATEGORY_LABELS[expenseSuccessPopup.category] || expenseSuccessPopup.category} · {expenseSuccessPopup.date}
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
        onClose={() => {
          setShowAddExpense(false);
          refreshExpenses();
        }}
        properties={properties}
        role="manager"
        onCreated={(created) => {
          setExpenses((prev) => [created, ...prev.filter((e) => e.id !== created.id)]);
          setExpenseSuccessPopup(created);
          showActionFeedback(
            'success',
            `Expense recorded — ${formatMoney(created.amount)} for ${created.propertyName || 'property'}${created.unitLabel ? ` · ${created.unitLabel}` : ''}.`,
          );
        }}
      />
    </div>
  );
};

export default PropertyManagerView;

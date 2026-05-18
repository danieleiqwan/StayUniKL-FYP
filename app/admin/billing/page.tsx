'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    CreditCard, CheckCircle2, Clock, AlertCircle, RefreshCw,
    Filter, FileText, Users, Banknote, TrendingUp, X,
    ChevronDown, Receipt, Zap, Plus, Search, UserCheck, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Invoice {
    id: string;
    user_id: string;
    student_name?: string;
    student_email?: string;
    application_id?: string;
    type: string;
    description?: string;
    amount: number;
    status: 'Paid' | 'Unpaid' | 'Overdue' | 'Cancelled';
    due_date?: string;
    created_at: string;
    paid_at?: string;
    payment_plan?: string;
    installment_no?: number;
    installment_total?: number;
}

interface Payment {
    id: string;
    user_id: string;
    amount: number;
    invoice_id?: string;
    created_at: string;
    status: string;
    reference_id: string;
    method?: string;
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string }> = {
        Paid:      { label: 'Paid',     className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
        Unpaid:    { label: 'Pending',  className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        Overdue:   { label: 'Overdue',  className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
        Cancelled: { label: 'Cancelled',className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
        Success:   { label: 'Success',  className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
        Failed:    { label: 'Failed',   className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
        Pending:   { label: 'Pending',  className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    };
    const cfg = map[status] || map['Unpaid'];
    return (
        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', cfg.className)}>
            {cfg.label}
        </span>
    );
}

export default function AdminBillingPage() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [activeTab, setActiveTab] = useState<'invoices' | 'installments' | 'transactions'>('invoices');
    const [gracePeriodDays, setGracePeriodDays] = useState(10);
    const [minGrace, setMinGrace] = useState(7);
    const [maxGrace, setMaxGrace] = useState(14);
    const [savingGrace, setSavingGrace] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [loading, setLoading] = useState(true);
    const [runningBilling, setRunningBilling] = useState(false);
    const [billingLog, setBillingLog] = useState<string[] | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<string>('all');
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Create invoice modal
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        userId: '', type: 'Hostel Fee', description: '', amount: '', dueDate: ''
    });
    const [verifiedUser, setVerifiedUser] = useState<{name: string, email: string, gender: string} | null>(null);
    const [verifying, setVerifying] = useState(false);

    const handleVerifyStudent = async () => {
        if (!newInvoice.userId) return;
        setVerifying(true);
        setVerifiedUser(null);
        try {
            const res = await fetch(`/api/user/${newInvoice.userId}`);
            const data = await res.json();
            if (data.success) {
                setVerifiedUser(data.user);
            } else {
                alert(data.error || 'Student not found.');
            }
        } catch (err) {
            alert('Error verifying student.');
        } finally {
            setVerifying(false);
        }
    };

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            // Fetch all invoices (admin)
            const invRes = await fetch('/api/billing/invoices?all=true');
            const invData = await invRes.json();
            if (invData.invoices) setInvoices(invData.invoices);
            // Fetch payments
            const payRes = await fetch('/api/payments?userId=admin');
            const payData = await payRes.json();
            if (payData.payments) setPayments(payData.payments);

            // Fetch semesters for filtering
            const semRes = await fetch('/api/semesters');
            const semData = await semRes.json();
            if (semData.semesters) setSemesterList(semData.semesters);

            const settingsRes = await fetch('/api/admin/settings/hostel-billing');
            const settingsData = await settingsRes.json();
            if (settingsData.gracePeriodDays) {
                setGracePeriodDays(settingsData.gracePeriodDays);
                setMinGrace(settingsData.minGracePeriodDays ?? 7);
                setMaxGrace(settingsData.maxGracePeriodDays ?? 14);
            }

            setLastRefreshed(new Date());
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => { 
        if (user && (user.role === 'admin' || user.role === 'superadmin')) {
            fetchData();
            // Auto-poll every 30 seconds to catch new payments
            pollingRef.current = setInterval(() => fetchData(true), 30_000);
        }
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [user, fetchData]);

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return <div className="p-10 text-center font-bold text-rose-500">Access Denied. Admins only.</div>;
    }

    const handleSaveGracePeriod = async () => {
        setSavingGrace(true);
        try {
            const res = await fetch('/api/admin/settings/hostel-billing', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gracePeriodDays }),
            });
            const data = await res.json();
            if (data.success) setGracePeriodDays(data.gracePeriodDays);
            else alert(data.error || 'Failed to save settings');
        } finally {
            setSavingGrace(false);
        }
    };

    const handleRunAutoBilling = async () => {
        if (!confirm('Run billing sync? This marks overdue invoices (after grace period) and sends payment reminders.')) return;
        setRunningBilling(true);
        setBillingLog(null);
        try {
            const res = await fetch('/api/admin/billing/auto', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setBillingLog(data.log || [`Generated ${data.details?.length || 0} invoice(s).`]);
                await fetchData();
            } else {
                alert(data.error || 'Auto-billing failed.');
            }
        } finally {
            setRunningBilling(false);
        }
    };

    const handleSyncBilling = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/admin/billing/sync', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                await fetchData();
            } else {
                alert(data.error || 'Sync failed.');
            }
        } catch (err) {
            alert('Failed to connect to sync API.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCreateInvoice = async () => {
        if (!newInvoice.userId || !newInvoice.amount) {
            alert('Student ID and amount are required.');
            return;
        }

        if (!showConfirm) {
            setShowConfirm(true);
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('/api/billing/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: newInvoice.userId,
                    type: newInvoice.type,
                    description: newInvoice.description || newInvoice.type,
                    amount: parseFloat(newInvoice.amount),
                    dueDate: newInvoice.dueDate || undefined,
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowCreate(false);
                setShowConfirm(false);
                setNewInvoice({ userId: '', type: 'Hostel Fee', description: '', amount: '', dueDate: '' });
                setVerifiedUser(null);
                await fetchData();
            } else {
                alert(data.error || 'Failed to create invoice.');
            }
        } finally {
            setCreating(false);
        }
    };

    const handleMarkPaid = async (invoiceId: string) => {
        if (!confirm('Mark this invoice as Paid?')) return;
        await fetch('/api/billing/invoices', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoiceId, newStatus: 'Paid' })
        });
        await fetchData();
    };

    const filtered = statusFilter === 'All' ? invoices : invoices.filter(i => i.status === statusFilter);

    const installmentGroups = Object.values(
        invoices
            .filter(i => i.payment_plan === 'Installment' && i.application_id)
            .reduce<Record<string, { appId: string; student: string; items: Invoice[] }>>((acc, inv) => {
                const key = inv.application_id!;
                if (!acc[key]) acc[key] = { appId: key, student: inv.student_name || inv.user_id, items: [] };
                acc[key].items.push(inv);
                return acc;
            }, {})
    ).map(g => ({
        ...g,
        items: g.items.sort((a, b) => (a.installment_no || 0) - (b.installment_no || 0)),
        paid: g.items.filter(i => i.status === 'Paid').length,
        overdue: g.items.some(i => i.status === 'Overdue'),
    }));

    // Filtered stats by semester
    const currentSemesterData = semesterList.find(s => s.id === selectedSemester);
    const statsInvoices = (selectedSemester === 'all' || !currentSemesterData)
        ? invoices 
        : invoices.filter(i => {
            const date = new Date(i.created_at);
            return date >= new Date(currentSemesterData.start_date) && date <= new Date(currentSemesterData.end_date);
        });

    const totalRevenue = statsInvoices.filter(i => i.status === 'Paid').reduce((s, i) => s + Number(i.amount), 0);
    const totalPending = statsInvoices.filter(i => i.status === 'Unpaid').reduce((s, i) => s + Number(i.amount), 0);
    const totalOverdue = statsInvoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + Number(i.amount), 0);
    const overdueCount = statsInvoices.filter(i => i.status === 'Overdue').length;

    const statCards = [
        {
            label: 'Total Collected',
            value: `RM ${totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
            sub: `${invoices.filter(i => i.status === 'Paid').length} paid invoices`,
            icon: <TrendingUp className="h-5 w-5" />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
            label: 'Overdue',
            value: `RM ${totalOverdue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
            sub: `${overdueCount} student(s)`,
            icon: <AlertCircle className="h-5 w-5" />,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
        },
        {
            label: 'Awaiting Payment',
            value: `RM ${totalPending.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
            sub: `${invoices.filter(i => i.status === 'Unpaid').length} pending invoices`,
            icon: <Clock className="h-5 w-5" />,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            label: 'Total Invoices',
            value: invoices.length.toString(),
            sub: 'Across all students',
            icon: <Receipt className="h-5 w-5" />,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
    ];

    const statusFilters = ['All', 'Unpaid', 'Overdue', 'Paid', 'Cancelled'];

    return (
        <div className="max-w-[1400px] mx-auto px-10 py-12 space-y-10">

                {/* Reorganized Page Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                                <Banknote className="h-5 w-5" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                Financial Management
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium ml-1 flex items-center gap-2">
                            Track invoices and payments across all students.
                            {lastRefreshed && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-400">
                                    <Clock className="h-3 w-3" />
                                    {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Period Selector */}
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm h-12">
                            <Calendar className="h-4 w-4 text-slate-400 ml-2" />
                            <select 
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="bg-transparent border-none text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 outline-none pr-4 cursor-pointer"
                            >
                                <option value="all">All-Time Revenue</option>
                                {semesterList.map(sem => (
                                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => fetchData(false)}
                                disabled={loading || isRefreshing}
                                className="h-12 w-12 sm:w-auto sm:px-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-60"
                                title="Refresh Data"
                            >
                                <RefreshCw className={cn("h-4 w-4", (loading || isRefreshing) && "animate-spin")} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>

                            <button
                                onClick={handleSyncBilling}
                                disabled={isSyncing}
                                className="h-12 w-12 sm:w-auto sm:px-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all disabled:opacity-60"
                                title="Sync Payments"
                            >
                                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                                <span className="hidden sm:inline">Sync</span>
                            </button>

                            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>

                            <button
                                onClick={handleRunAutoBilling}
                                disabled={runningBilling}
                                className="h-12 px-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-slate-900 dark:bg-slate-800 hover:bg-[#F26C22] rounded-2xl shadow-lg transition-all disabled:opacity-60"
                            >
                                <Zap className={cn("h-4 w-4", runningBilling && "animate-pulse")} />
                                <span>Billing Sync</span>
                            </button>

                            <Link
                                href="/admin/finances/create-invoice"
                                className="h-12 px-5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-white bg-[#F26C22] hover:bg-[#d65a16] rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Invoice</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Hostel billing policy */}
                <div className="mb-6 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black text-[#F26C22] uppercase tracking-widest mb-1">UniKL Hostel Policy</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Fixed RM600/semester · Full pay or 4× RM150 installments</p>
                        <p className="text-xs text-slate-500 mt-1">Grace period before invoices become overdue</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min={minGrace}
                            max={maxGrace}
                            value={gracePeriodDays}
                            onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                            className="w-20 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-black text-sm"
                        />
                        <span className="text-xs font-bold text-slate-500">days ({minGrace}–{maxGrace})</span>
                        <button
                            onClick={handleSaveGracePeriod}
                            disabled={savingGrace}
                            className="h-11 px-4 bg-[#F26C22] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#d65a16] disabled:opacity-50"
                        >
                            {savingGrace ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Billing Log */}
                {billingLog && (
                    <div className="mb-6 bg-slate-900 text-green-400 rounded-2xl p-5 font-mono text-xs space-y-1 border border-slate-700 relative">
                        <button onClick={() => setBillingLog(null)} className="absolute top-3 right-3 text-slate-500 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Auto-Billing Log</p>
                        {billingLog.map((line, i) => <p key={i}>{'>'} {line}</p>)}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    {statCards.map((s, i) => (
                        <div key={i} className={cn("rounded-2xl p-5 border border-transparent", s.bg)}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
                                <div className={cn("opacity-60", s.color)}>{s.icon}</div>
                            </div>
                            <p className={cn("text-xl font-black", s.color)}>{s.value}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                        {(['invoices', 'installments', 'transactions'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-4 font-black text-sm capitalize transition-all tracking-wide",
                                    activeTab === tab
                                        ? "bg-[#F26C22] text-white"
                                        : "text-slate-400 hover:text-[#F26C22] hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                {tab === 'invoices' ? 'Invoice Ledger' : tab === 'installments' ? 'Installment Plans' : 'Transaction History'}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* ─── Invoice Ledger ─── */}
                        {activeTab === 'invoices' && (
                            <div>
                                {/* Status Filter */}
                                <div className="flex items-center gap-2 mb-6 flex-wrap">
                                    <Filter className="h-4 w-4 text-slate-400" />
                                    {statusFilters.map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setStatusFilter(f)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                                statusFilter === f
                                                    ? "bg-[#F26C22] text-white"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            )}
                                        >
                                            {f === 'Unpaid' ? 'Pending' : f}
                                            {f !== 'All' && (
                                                <span className="ml-1 opacity-60">
                                                    ({invoices.filter(i => i.status === f).length})
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    <span className="ml-auto text-xs text-slate-400 font-bold">{filtered.length} record(s)</span>
                                </div>

                                {loading ? (
                                    <div className="py-16 text-center">
                                        <RefreshCw className="h-6 w-6 animate-spin text-[#F26C22] mx-auto mb-3" />
                                        <p className="text-sm text-slate-400">Loading invoices...</p>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <FileText className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                                        <p className="font-bold text-slate-900 dark:text-white">No invoices found</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                                    {['Invoice ID', 'Student', 'Description', 'Amount', 'Due Date', 'Status', 'Action'].map(h => (
                                                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                {filtered.map(inv => (
                                                    <tr key={inv.id} className={cn(
                                                        "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40",
                                                        inv.status === 'Overdue' && "bg-rose-50/30 dark:bg-rose-900/5"
                                                    )}>
                                                        <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 max-w-[140px]">
                                                            <span className="truncate block">{inv.id}</span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <p className="font-bold text-slate-800 dark:text-white text-xs">{inv.student_name || inv.user_id}</p>
                                                            {inv.student_email && <p className="text-[10px] text-slate-400">{inv.student_email}</p>}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">{inv.description || inv.type}</p>
                                                            <p className="text-[10px] text-slate-400">{new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        </td>
                                                        <td className="px-5 py-4 font-black text-slate-900 dark:text-white">RM {Number(inv.amount).toFixed(2)}</td>
                                                        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400">
                                                            {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </td>
                                                        <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                                                        <td className="px-5 py-4">
                                                            {(inv.status === 'Unpaid' || inv.status === 'Overdue') && (
                                                                <button
                                                                    onClick={() => handleMarkPaid(inv.id)}
                                                                    className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            )}
                                                            {inv.status === 'Paid' && (
                                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Settled
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'installments' && (
                            <div className="space-y-4">
                                {installmentGroups.length === 0 ? (
                                    <div className="py-16 text-center text-slate-400 text-sm">No active installment plans yet.</div>
                                ) : (
                                    installmentGroups.map(group => (
                                        <div key={group.appId} className={cn(
                                            "rounded-2xl border p-5",
                                            group.overdue
                                                ? "border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-900/10"
                                                : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                                        )}>
                                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white text-sm">{group.student}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">{group.appId}</p>
                                                </div>
                                                <span className="text-sm font-black text-[#F26C22]">{group.paid}/4 paid</span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {group.items.map(inv => (
                                                    <div key={inv.id} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 text-center">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">#{inv.installment_no}</p>
                                                        <p className="font-black text-slate-900 dark:text-white my-1">RM 150</p>
                                                        <StatusBadge status={inv.status} />
                                                        {inv.paid_at && (
                                                            <p className="text-[9px] text-slate-400 mt-1">
                                                                {new Date(inv.paid_at).toLocaleDateString('en-GB')}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ─── Transaction History ─── */}
                        {activeTab === 'transactions' && (
                            <div>
                                {loading ? (
                                    <div className="py-16 text-center">
                                        <RefreshCw className="h-6 w-6 animate-spin text-[#F26C22] mx-auto mb-3" />
                                        <p className="text-sm text-slate-400">Loading transactions...</p>
                                    </div>
                                ) : payments.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <h4 className="font-black text-slate-900 dark:text-white mb-1">No Transactions Found</h4>
                                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                            Payment records will appear here after students settle their invoices.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                                    {['Transaction ID', 'Student', 'Ref / Invoice', 'Amount', 'Date', 'Method', 'Status'].map(h => (
                                                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                {payments.map(pay => (
                                                    <tr key={pay.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                        <td className="px-5 py-4 font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{pay.id}</td>
                                                        <td className="px-5 py-4 text-xs font-bold text-slate-800 dark:text-white">{pay.user_id}</td>
                                                        <td className="px-5 py-4 text-[10px] font-mono text-slate-400">
                                                            {pay.reference_id}
                                                            {pay.invoice_id && <div className="text-blue-500 font-bold mt-0.5">INV: {pay.invoice_id}</div>}
                                                        </td>
                                                        <td className="px-5 py-4 font-black text-slate-900 dark:text-white">RM {Number(pay.amount).toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-[11px] text-slate-500">
                                                            {new Date(pay.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            <div className="text-[10px] opacity-60">{new Date(pay.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </td>
                                                        <td className="px-5 py-4 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{pay.method}</td>
                                                        <td className="px-5 py-4"><StatusBadge status={pay.status} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            {/* Create Invoice Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                {showConfirm ? 'Confirm Invoice' : 'Create Invoice'}
                            </h3>
                            <button onClick={() => { setShowCreate(false); setShowConfirm(false); }} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {showConfirm ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="text-center py-2">
                                        <div className="h-20 w-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                                            <Receipt className="h-10 w-10 text-[#F26C22]" />
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Confirm Generation</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please verify the details below before proceeding.</p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-4 border border-slate-100 dark:border-slate-800 shadow-inner">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</span>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{verifiedUser?.name}</p>
                                                <p className="text-[10px] font-bold text-[#F26C22]">{newInvoice.userId}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">RM {parseFloat(newInvoice.amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</span>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{newInvoice.description || newInvoice.type}</span>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-3 flex gap-3 items-start">
                                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                                            This action will generate a legally binding invoice for the student and trigger an automatic notification.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Student ID *</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={newInvoice.userId}
                                                onChange={e => {
                                                    setNewInvoice(p => ({ ...p, userId: e.target.value }));
                                                    setVerifiedUser(null);
                                                }}
                                                placeholder="e.g. STU-12345"
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-[#F26C22] transition-all"
                                            />
                                            <button 
                                                onClick={handleVerifyStudent}
                                                disabled={verifying || !newInvoice.userId}
                                                className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                                            >
                                                <Search className={cn("h-4 w-4 text-slate-500", verifying && "animate-spin")} />
                                            </button>
                                        </div>
                                    </div>

                                    {verifiedUser && (
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-4 animate-in fade-in zoom-in-95 duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                                                    <UserCheck className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{verifiedUser.name}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{verifiedUser.email} · {verifiedUser.gender}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                                        <select
                                            value={newInvoice.type}
                                            onChange={e => setNewInvoice(p => ({ ...p, type: e.target.value }))}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-[#F26C22] transition-all"
                                        >
                                            <option value="Hostel Fee">Hostel Fee</option>
                                            <option value="Deposit">Deposit</option>
                                            <option value="Fine">Fine</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                                        <input
                                            value={newInvoice.description}
                                            onChange={e => setNewInvoice(p => ({ ...p, description: e.target.value }))}
                                            placeholder="e.g. Monthly Rent - May 2026"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-[#F26C22] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount (RM) *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={newInvoice.amount}
                                            onChange={e => setNewInvoice(p => ({ ...p, amount: e.target.value }))}
                                            placeholder="120.00"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-[#F26C22] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Due Date (optional)</label>
                                        <input
                                            type="date"
                                            value={newInvoice.dueDate}
                                            onChange={e => setNewInvoice(p => ({ ...p, dueDate: e.target.value }))}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-[#F26C22] transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <button
                                onClick={() => showConfirm ? setShowConfirm(false) : setShowCreate(false)}
                                className="flex-1 py-3 rounded-xl font-black text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                {showConfirm ? 'Go Back' : 'Cancel'}
                            </button>
                             <button
                                onClick={handleCreateInvoice}
                                disabled={creating || !verifiedUser}
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed",
                                    showConfirm ? "bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.3)]" : "bg-[#F26C22] hover:bg-[#d65a16] shadow-[0_4px_12px_rgba(242,108,34,0.3)]"
                                )}
                            >
                                {creating ? 'Creating...' : showConfirm ? 'Confirm & Create' : 'Create Invoice'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

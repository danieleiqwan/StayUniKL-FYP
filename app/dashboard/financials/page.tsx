'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import {
    CreditCard, FileText, CheckCircle2, AlertCircle, Clock,
    RefreshCw, Banknote, Receipt, Wallet, Info, ListOrdered
} from 'lucide-react';
import { cn } from '@/lib/utils';

type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Cancelled' | 'All';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        Paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
        Unpaid: { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800', icon: <Clock className="h-3.5 w-3.5" /> },
        Overdue: { label: 'Overdue', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800', icon: <AlertCircle className="h-3.5 w-3.5" /> },
        Cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700', icon: <Info className="h-3.5 w-3.5" /> },
    };
    const cfg = map[status] || map['Unpaid'];
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider', cfg.className)}>
            {cfg.icon}{cfg.label}
        </span>
    );
}

function FinancialsContent() {
    const { user } = useAuth();
    const { myApplication, refreshData, payments, invoices } = useData();
    const router = useRouter();
    const [filter, setFilter] = useState<InvoiceStatus>('All');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => { setLoading(true); await refreshData(); setLoading(false); };
    const handlePay = (invoiceId: string, amount: number) => router.push(`/dashboard/payment?amount=${amount}&invoiceId=${invoiceId}`);

    const filtered = filter === 'All' ? invoices : invoices.filter(i => i.status === filter);

    // Installment invoices for active application
    const installmentInvoices = invoices
        .filter(i => i.application_id === myApplication?.id && i.payment_plan === 'Installment')
        .sort((a, b) => (a.installment_no || 0) - (b.installment_no || 0));
    const isInstallment = installmentInvoices.length > 0;
    const installmentsPaid = installmentInvoices.filter(i => i.status === 'Paid').length;

    // Stats
    const totalPaid = payments.filter(p => p.status === 'Success').reduce((s, p) => s + Number(p.amount), 0);
    const totalPending = invoices.filter(i => i.status === 'Unpaid').reduce((s, i) => s + Number(i.amount), 0);
    const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + Number(i.amount), 0);
    const isPaymentPending = myApplication?.status === 'Payment Pending';
    const aggregatePaymentStatus = myApplication?.paymentStatus
        || (installmentsPaid === 4 || (!isInstallment && invoices.some(i => i.application_id === myApplication?.id && i.payment_plan === 'Full' && i.status === 'Paid'))
            ? 'Fully Paid'
            : installmentsPaid > 0 || payments.some(p => p.status === 'Success')
                ? 'Partially Paid'
                : totalOverdue > 0
                    ? 'Overdue'
                    : 'Pending');
    const appInvoice = invoices.find(i => i.application_id === myApplication?.id && i.payment_plan === 'Full' && i.status !== 'Paid');
    const nextInstallment = installmentInvoices.find(i => i.status === 'Unpaid' || i.status === 'Overdue');

    const filters: InvoiceStatus[] = ['All', 'Unpaid', 'Overdue', 'Paid', 'Cancelled'];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Financials</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your hostel payments and invoices.</p>
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
                </button>
            </div>

            {myApplication && (
                <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-5 py-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester Payment Status</span>
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider",
                        aggregatePaymentStatus === 'Fully Paid' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                        aggregatePaymentStatus === 'Partially Paid' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                        aggregatePaymentStatus === 'Overdue' && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                        aggregatePaymentStatus === 'Pending' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    )}>{aggregatePaymentStatus}</span>
                    <span className="text-xs text-slate-500">· {myApplication.paymentMethod || 'Full Payment'} · RM600/semester</span>
                </div>
            )}

            {/* Installment Progress Card */}
            {isInstallment && myApplication && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 border border-slate-700 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#F26C22] rounded-xl flex items-center justify-center shrink-0">
                                <ListOrdered className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-black text-white text-sm uppercase tracking-wider">Installment Plan Progress</p>
                                <p className="text-slate-400 text-xs">{installmentsPaid} of 4 installments paid · RM 600 total</p>
                            </div>
                        </div>
                        <span className="text-2xl font-black text-[#F26C22]">{installmentsPaid}/4</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-slate-700 rounded-full mb-4 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#F26C22] to-orange-400 rounded-full transition-all duration-700"
                            style={{ width: `${(installmentsPaid / 4) * 100}%` }}
                        />
                    </div>

                    {/* Installment pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {installmentInvoices.map((inv, i) => (
                            <div key={inv.id} className={cn(
                                "rounded-2xl p-4 text-center border transition-all",
                                inv.status === 'Paid' ? 'bg-emerald-900/30 border-emerald-700/50' :
                                inv.status === 'Overdue' ? 'bg-rose-900/30 border-rose-700/50' :
                                i === installmentsPaid ? 'bg-orange-900/30 border-orange-700/50' :
                                'bg-slate-800/50 border-slate-700/50 opacity-50'
                            )}>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Month {i + 1}</p>
                                <p className="text-lg font-black text-white">RM 150</p>
                                <div className="mt-2">
                                    {inv.status === 'Paid' ? (
                                        <span className="text-[10px] font-black text-emerald-400 flex items-center justify-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Paid
                                        </span>
                                    ) : inv.status === 'Overdue' ? (
                                        <button onClick={() => handlePay(inv.id, 150)} className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase">Overdue · Pay</button>
                                    ) : i === installmentsPaid ? (
                                        <button onClick={() => handlePay(inv.id, 150)} className="text-[10px] font-black text-orange-400 hover:text-orange-300 uppercase">Pay Now</button>
                                    ) : (
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Upcoming</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Full Payment / Next Installment Banner */}
            {isPaymentPending && (appInvoice || nextInstallment) && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800/50 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-amber-600">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm">
                                {isInstallment ? `Installment ${(nextInstallment as any)?.installment_no}/4 Due` : 'Hostel Fee Payment Required'}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                RM {isInstallment ? '150.00' : '600.00'} due to {isInstallment ? 'keep your stay active' : 'confirm your room'}.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const inv = nextInstallment || appInvoice;
                            if (inv) handlePay(inv.id, Number(inv.amount));
                        }}
                        className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-amber-700 transition-all whitespace-nowrap shadow-lg shadow-amber-500/20"
                    >
                        Pay Now
                    </button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Paid', value: `RM ${totalPaid.toFixed(2)}`, sub: `${payments.filter(p => p.status === 'Success').length} payment(s)`, icon: <CheckCircle2 className="h-6 w-6" />, color: 'text-emerald-500', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
                    { label: 'Pending', value: `RM ${totalPending.toFixed(2)}`, sub: `${invoices.filter(i => i.status === 'Unpaid').length} invoice(s)`, icon: <Clock className="h-6 w-6" />, color: 'text-amber-500', iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
                    { label: 'Overdue', value: `RM ${totalOverdue.toFixed(2)}`, sub: `${invoices.filter(i => i.status === 'Overdue').length} invoice(s)`, icon: <AlertCircle className="h-6 w-6" />, color: 'text-rose-500', iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", s.iconBg)}>{s.icon}</div>
                        </div>
                        <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Invoice Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-[#F26C22]">
                            <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">Invoice History</h2>
                            <p className="text-xs text-slate-400">{invoices.length} total record(s)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {filters.map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={cn("px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                    filter === f ? "bg-[#F26C22] text-white shadow-lg shadow-orange-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                )}>
                                {f === 'Unpaid' ? 'Pending' : f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center"><RefreshCw className="h-6 w-6 animate-spin text-[#F26C22] mx-auto mb-3" /><p className="text-sm text-slate-400">Loading...</p></div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4"><FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" /></div>
                        <h3 className="font-black text-slate-900 dark:text-white mb-1">No invoices found</h3>
                        <p className="text-sm text-slate-400">No {filter === 'All' ? '' : filter.toLowerCase()} invoices at this time.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filtered.map(inv => {
                                    const isActionable = inv.status === 'Unpaid' || inv.status === 'Overdue';
                                    const dueDate = inv.due_date ? new Date(inv.due_date) : null;
                                    const isOverdueSoon = dueDate && inv.status === 'Unpaid' && (dueDate.getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000;
                                    const isInstallmentInv = (inv as any).payment_plan === 'Installment';
                                    const hasEvidence = !!(inv as any).evidence_url;

                                    return (
                                        <tr key={inv.id} className={cn("transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50", inv.status === 'Overdue' && "bg-rose-50/40 dark:bg-rose-900/10")}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                                                        inv.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                                        inv.status === 'Overdue' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                                                        'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                                                    )}>
                                                        {isInstallmentInv ? <ListOrdered className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400 max-w-[120px] truncate">{inv.id}</p>
                                                        {isInstallmentInv && (
                                                            <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                                                                Installment {(inv as any).installment_no}/{(inv as any).installment_total}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800 dark:text-white">{inv.description || inv.type}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-slate-900 dark:text-white">RM {Number(inv.amount).toFixed(2)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {dueDate ? (
                                                    <div>
                                                        <p className={cn("font-bold text-sm",
                                                            inv.status === 'Overdue' ? 'text-rose-600 dark:text-rose-400' :
                                                            isOverdueSoon ? 'text-amber-600 dark:text-amber-400' :
                                                            'text-slate-700 dark:text-slate-300'
                                                        )}>{dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        {inv.status === 'Overdue' && <p className="text-[10px] font-black text-rose-500 uppercase">Past Due</p>}
                                                        {isOverdueSoon && inv.status !== 'Overdue' && <p className="text-[10px] font-black text-amber-500 uppercase">Due Soon</p>}
                                                    </div>
                                                ) : <span className="text-slate-400 text-xs">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {hasEvidence ? (
                                                    <a 
                                                        href={(inv as any).evidence_url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                                    >
                                                        <FileText className="h-3 w-3" /> View
                                                    </a>
                                                ) : <span className="text-slate-400 text-xs">—</span>}
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                                            <td className="px-6 py-4">
                                                {isActionable ? (
                                                    <button onClick={() => handlePay(inv.id, Number(inv.amount))}
                                                        className="inline-flex items-center gap-1.5 bg-[#F26C22] hover:bg-[#d65a16] text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all active:scale-95 shadow-md shadow-orange-500/20">
                                                        <CreditCard className="h-3.5 w-3.5" /> Pay Now
                                                    </button>
                                                ) : inv.status === 'Paid' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase">
                                                        <CheckCircle2 className="h-4 w-4" /> Settled
                                                    </span>
                                                ) : <span className="text-xs text-slate-400">—</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Invoices are automatically marked <strong>Overdue</strong> after their due date. Contact admin for disputes.
            </p>
        </div>
    );
}

export default function FinancialsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading...</div>}>
            <FinancialsContent />
        </Suspense>
    );
}

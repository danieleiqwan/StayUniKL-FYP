'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { CreditCard, Download, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BillingHistory() {
    const { payments, myApplication } = useData();

    const recentPayments = [...payments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 dark:text-white">Billing History</h2>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recent Transactions</p>
                    </div>
                </div>
                <Link href="/dashboard/payment" className="text-[10px] font-black text-[#F26C22] hover:underline uppercase tracking-widest">
                    Manage Billing
                </Link>
            </div>

            {recentPayments.length > 0 ? (
                <div className="space-y-4">
                    {recentPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${payment.status === 'Success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>
                                    {payment.status === 'Success' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">RM {Number(payment.amount).toFixed(2)}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">{payment.referenceId}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{new Date(payment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                <button className="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-widest mt-1 flex items-center gap-1 ml-auto">
                                    <Download className="h-3 w-3" /> Receipt
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No payment records found</p>
                </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 -mx-6 -mb-6 p-6 rounded-b-2xl">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Current Balance</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                        RM {myApplication?.status === 'Payment Pending' ? Number(myApplication.totalPrice).toFixed(2) : '0.00'}
                    </p>
                </div>
                <Link href="/dashboard/payment" className="bg-[#F26C22] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d65a16] shadow-lg shadow-orange-500/20 transition-all">
                    Make Payment
                </Link>
            </div>
        </div>
    );
}

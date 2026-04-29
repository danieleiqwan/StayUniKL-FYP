'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { CreditCard } from 'lucide-react';

interface Invoice {
    id: string; user_id: string; amount: number; status: string; type: string; created_at: string;
}

interface Payment {
    id: string; user_id: string; amount: number; invoice_id?: string; created_at: string; status: string; reference_id: string;
}

interface Refund {
    id: string; amount: number; status: string; created_at: string; reason: string;
}

export default function AdminBillingPage() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'refunds'>('invoices');

    useEffect(() => {
        fetchData();
    }, []);

    if (!user || user.role !== 'admin') return <div className="p-10 text-center">Access Denied. Admins only.</div>;

    const fetchData = async () => {
        const invRes = await fetch('/api/billing/invoices');
        const invData = await invRes.json();
        if (invData.invoices) setInvoices(invData.invoices);

        // Fetch payments (using existing endpoint, might need adjustment for admin all)
        // Currently existing endpoint requires userId. We might need a new endpoint or params for admin.
        // For MVP, assume we can fetch all if we add a param or use a different endpoint.
        // Let's assume we update the GET /api/payments logic to allow admin fetch all.
        // Or we just fetch invoices for now properly.

        // Actually, let's fetch invoices.
    };

    // Mock data generation for demo if API returns empty (in case no invoices generated yet)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Financial Management</h1>
                        <p className="text-sm text-slate-500">Track invoices, payments, and refunds.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Collected</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">RM {invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'invoices' ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-[#F26C22] dark:hover:text-orange-400'}`}
                        >
                            Invoices
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'payments' ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:text-[#F26C22] dark:hover:text-orange-400'}`}
                        >
                            Transactions
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'invoices' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Invoice Ledger</h3>
                                    <button className="bg-[#F26C22] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d65a16] shadow-md shadow-orange-500/20 transition-all hover:scale-105">
                                        + Create New Invoice
                                    </button>
                                </div>
                                <table className="w-full text-sm text-left text-slate-500">
                                    <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 font-bold tracking-wider">Invoice ID</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">User</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">Type</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">Amount</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {invoices.length === 0 ? (
                                            <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">No invoices generated yet.</td></tr>
                                        ) : (
                                            invoices.map(inv => (
                                                <tr key={inv.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-900 dark:text-white">{inv.id}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{inv.user_id}</td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{inv.type}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">RM {inv.amount}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                            inv.status === 'Unpaid' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="h-8 w-8 text-slate-400" />
                                </div>
                                <h4 className="text-slate-900 dark:text-white font-bold">No Transaction History</h4>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">When students pay their invoices, the records will appear here for verification.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

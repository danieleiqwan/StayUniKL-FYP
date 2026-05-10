'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { CreditCard, CheckCircle2, Shield } from 'lucide-react';

function PaymentGatewayContent() {
    const { user } = useAuth();
    const { myApplication, refreshData, invoices } = useData();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'fpx' | 'ewallet'>('card');
    const [amount, setAmount] = useState<string>(searchParams.get('amount') || myApplication?.totalPrice || '0.00');
    const referenceId = searchParams.get('ref') || myApplication?.id || '';
    const invoiceId = searchParams.get('invoiceId') || '';

    useEffect(() => {
        if (!user) router.push('/login');
        
        // If amount is 0 but we have an invoiceId, try to fetch the invoice
        if ((amount === '0' || amount === '0.00') && invoiceId) {
            fetch(`/api/billing/invoices?userId=${user?.id}`)
                .then(res => res.json())
                .then(data => {
                    const inv = data.invoices?.find((i: any) => i.id === invoiceId);
                    if (inv) setAmount(String(inv.amount));
                })
                .catch(err => console.error('Error fetching invoice for payment:', err));
        }
    }, [user, router, invoiceId, amount]);

    // Check if ALREADY PAID
    const isAppPaid = myApplication?.paymentStatus === 'Paid' || (myApplication as any)?.payment_status === 'Paid';
    const currentInvoice = invoices?.find(i => i.id === invoiceId);
    const isInvPaid = currentInvoice?.status === 'Paid';
    
    const isAlreadyPaid = invoiceId ? isInvPaid : isAppPaid;

    const handlePayment = async () => {
        if (isAlreadyPaid || isDone) return;
        setIsProcessing(true);

        // STRIPE FLOW for Card Payments
        if (selectedMethod === 'card') {
            try {
                const res = await fetch('/api/payments/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: parseFloat(String(amount)),
                        description: invoiceId ? `Payment for Invoice #${invoiceId}` : `Hostel Application Fee (${referenceId})`,
                        metadata: {
                            userId: user?.id,
                            invoiceId: invoiceId || '',
                            applicationId: referenceId?.startsWith('app_') ? referenceId : '',
                            type: invoiceId ? 'invoice' : 'application'
                        }
                    })
                });

                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url; // Redirect to Stripe
                    return;
                } else {
                    alert(data.error || 'Failed to initialize payment.');
                    setIsProcessing(false);
                    return;
                }
            } catch (error) {
                console.error('Stripe Init Error:', error);
                alert('Payment gateway unavailable.');
                setIsProcessing(false);
                return;
            }
        }

        // MOCK FLOW for other methods (FPX/E-Wallet)
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    referenceId: referenceId || invoiceId || `REF-${Date.now()}`,
                    amount: parseFloat(String(amount)),
                    method: selectedMethod === 'card' ? 'Credit Card' : selectedMethod === 'fpx' ? 'FPX Online Transfer' : 'E-Wallet',
                    invoiceId: invoiceId || null,
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                if (invoiceId) {
                    await fetch('/api/billing/invoices', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invoiceId, newStatus: 'Paid' })
                    });
                }

                setIsDone(true);
                await refreshData();
                setTimeout(() => router.push('/dashboard/financials'), 2500);
            } else {
                alert(data.error || 'Payment failed. Please try again.');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred. Please try again.');
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    if (isDone) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-transparent dark:border-slate-800 text-center p-12">
                    <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">RM {Number(amount).toFixed(2)} has been processed.</p>
                    <p className="text-xs text-slate-400">Redirecting to your financials...</p>
                </div>
            </div>
        );
    }

    const methods = [
        { id: 'card', label: 'Credit / Debit Card', sub: 'Visa · Mastercard · AMEX' },
        { id: 'fpx', label: 'FPX Online Transfer', sub: 'Maybank · CIMB · RHB · more' },
        { id: 'ewallet', label: 'E-Wallet', sub: 'Touch \'n Go · Boost · GrabPay' },
    ] as const;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-transparent dark:border-slate-800">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#F26C22] to-[#e05500] p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-black tracking-tight">UniKL Secure Pay</h1>
                        <Shield className="h-5 w-5 text-orange-200 opacity-80" />
                    </div>
                    <div>
                        <p className="text-orange-200 text-[10px] uppercase font-black tracking-widest mb-1">Amount Due</p>
                        <p className="text-4xl font-black">RM {Number(amount).toFixed(2)}</p>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Details */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3 text-sm">
                        {referenceId && (
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Reference</span>
                                <span className="font-mono text-[#F26C22] dark:text-orange-400 font-bold text-xs">{referenceId || invoiceId}</span>
                            </div>
                        )}
                        {invoiceId && (
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Invoice</span>
                                <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">{invoiceId}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Merchant</span>
                            <span className="font-bold text-slate-900 dark:text-white">StayUniKL System</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Customer</span>
                            <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                        </div>
                    </div>

                    {/* Payment method selector */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                        {methods.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMethod(m.id)}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                                    selectedMethod === m.id
                                        ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    selectedMethod === m.id ? 'border-[#F26C22]' : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                    {selectedMethod === m.id && <div className="h-2 w-2 rounded-full bg-[#F26C22]" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{m.label}</p>
                                    <p className="text-xs text-slate-400">{m.sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Pay Button */}
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || isAlreadyPaid}
                        className={`w-full py-4 rounded-xl font-black text-white tracking-wide transition-all shadow-lg ${
                            isProcessing || isAlreadyPaid
                                ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                                : 'bg-[#F26C22] hover:bg-[#d65a16] active:scale-95 shadow-orange-500/20'
                        }`}
                    >
                        {isProcessing ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                            </div>
                        ) : `Confirm & Pay RM ${Number(amount).toFixed(2)}`}
                    </button>

                    <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
                        Simulated payment gateway. No real transaction will occur.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
            <PaymentGatewayContent />
        </Suspense>
    );
}

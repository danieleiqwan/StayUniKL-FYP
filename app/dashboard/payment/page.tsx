'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';

export default function MockPaymentGateway() {
    const { user } = useAuth();
    const { myApplication, refreshData } = useData();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);

    const amount = searchParams.get('amount') || myApplication?.totalPrice || '0.00';
    const referenceId = searchParams.get('ref') || myApplication?.id || 'N/A';

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const isAlreadyPaid = myApplication?.paymentStatus === 'Paid' || (myApplication as any)?.payment_status === 'Paid';

    const handlePayment = async () => {
        if (isAlreadyPaid) return;
        setIsProcessing(true);

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    referenceId,
                    amount: parseFloat(amount),
                    method: 'Credit Card (Mock)'
                })
            });

            if (res.ok) {
                // Simulate processing delay
                setTimeout(async () => {
                    alert('Payment Successful!');
                    await refreshData();
                    router.push('/dashboard');
                }, 2000);
            } else {
                alert('Payment failed. Please try again.');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-transparent dark:border-slate-800">
                <div className="bg-[#F26C22] p-6 text-white text-center shadow-lg">
                    <h1 className="text-2xl font-bold">UniKL Secure Pay</h1>
                    <p className="text-orange-100 text-sm opacity-80">Online Billing Portal</p>
                </div>

                <div className="p-8">
                    <div className="mb-8 text-center">
                        <div className="text-slate-500 dark:text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">
                            {isAlreadyPaid ? 'Payment Status' : 'Total Amount'}
                        </div>
                        <div className={`text-4xl font-extrabold border-b-2 pb-4 inline-block ${isAlreadyPaid ? 'text-green-500 border-green-100 dark:border-green-900/30' : 'text-[#F26C22] border-orange-100 dark:border-orange-900/30'}`}>
                            {isAlreadyPaid ? 'PAID' : `RM ${amount}`}
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Merchant</span>
                            <span className="font-semibold text-slate-900 dark:text-white">StayUniKL System</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
                            <span className="font-mono text-[#F26C22] dark:text-orange-400 font-bold">{referenceId}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Customer</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                        </div>
                    </div>

                    <div className={`${isAlreadyPaid ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'} p-4 rounded-xl border mb-8 transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`${isAlreadyPaid ? 'bg-green-500' : 'bg-white dark:bg-slate-800'} p-2 rounded shadow-sm`}>
                                <CreditCard className={`h-5 w-5 ${isAlreadyPaid ? 'text-white' : 'text-[#F26C22] dark:text-orange-400'}`} />
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                                <div className={`font-bold ${isAlreadyPaid ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                                    {isAlreadyPaid ? 'Transaction Verified' : 'Credit / Debit Card'}
                                </div>
                                <div>{isAlreadyPaid ? 'Your payment has been successfully processed.' : 'Visa / Mastercard / AMEX (Mock)'}</div>
                            </div>
                        </div>
                    </div>

                    {isAlreadyPaid ? (
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full py-4 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                        >
                            Return to Dashboard
                        </button>
                    ) : (
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${isProcessing
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
                            ) : 'Pay Now'}
                        </button>
                    )}

                    <p className="mt-4 text-center text-[10px] text-slate-400 dark:text-slate-500">
                        This is a simulated payment gateway for development purposes. No real money will be charged.
                    </p>
                </div>
            </div>
        </div>
    );
}

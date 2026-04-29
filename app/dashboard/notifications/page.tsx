'use client';

import { Card } from "@/components/ui/card";
import { Bell, Loader2, CheckCircle2, XCircle, AlertCircle, Trash2, Check, Info } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
    const { user } = useAuth();
    const { notifications, markNotificationRead, refreshData, myApplication } = useData();
    const [loading, setLoading] = useState(true);

    const isPaymentPending = myApplication?.status === 'Payment Pending';

    useEffect(() => {
        // Refresh when entering
        refreshData().finally(() => setLoading(false));
    }, []);

    const handleMarkAsRead = (id: string) => {
        markNotificationRead(id);
    };

    const handleMarkAllRead = () => {
        markNotificationRead(); // Mark all
    };

    const getStatusDetails = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'success':
                return { color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', icon: <CheckCircle2 className="h-5 w-5" /> };
            case 'error':
                return { color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20', icon: <XCircle className="h-5 w-5" /> };
            case 'warning':
                return { color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', icon: <AlertCircle className="h-5 w-5" /> };
            case 'info':
            default:
                return { color: 'text-[#F26C22] dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20', icon: <Info className="h-5 w-5" /> };
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="space-y-8">
                <div className="space-y-1">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-64 rounded-md" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-1/3 rounded-md" />
                                    <Skeleton className="h-4 w-3/4 rounded-md" />
                                    <Skeleton className="h-3 w-24 rounded-sm" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Stay updated with your applications and bookings.</p>
                </div>
                {notifications.some((n: any) => !n.is_read) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-[#F26C22] dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-xl transition-all"
                    >
                        <Check className="h-4 w-4" />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {isPaymentPending && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800/50 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 transition-colors">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-900/30">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 leading-tight uppercase">Payment Required</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md">
                                    Your hostel application has been approved. Please settle the payment of <span className="font-bold text-slate-900 dark:text-white underline underline-offset-4">RM {Number(myApplication?.totalPrice).toFixed(2)}</span> to confirm your room.
                                </p>
                            </div>
                        </div>
                        <a 
                            href={`/dashboard/payment?amount=${myApplication?.totalPrice}&ref=${myApplication?.id}`}
                            className="bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-amber-500/20 hover:bg-amber-700 transition-all active:scale-95 whitespace-nowrap"
                        >
                            Proceed to Payment
                        </a>
                    </div>
                )}

                {notifications.length === 0 && !isPaymentPending ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-20 text-center transition-colors">
                        <div className="mb-4 rounded-3xl bg-slate-50 dark:bg-slate-800 p-6">
                            <Bell className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">All caught up!</h3>
                        <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400 mt-2">
                            No new notifications at the moment. We'll alert you here when something important happens.
                        </p>
                    </div>
                ) : (
                    notifications.map((item: any) => {
                        const { color, icon } = getStatusDetails(item.type);
                        return (
                            <div
                                key={item.id}
                                onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                                className={cn(
                                    "overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm transition-all hover:shadow-md relative",
                                    !item.is_read && "ring-2 ring-[#F26C22] ring-offset-0 cursor-pointer"
                                )}
                            >
                                <div className="flex items-start p-6">
                                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-colors", color)}>
                                        {icon}
                                    </div>
                                    <div className="ml-5 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className={cn("text-base font-bold text-slate-900 dark:text-white mb-1 transition-colors", !item.is_read && "text-[#F26C22] dark:text-orange-400")}>
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                                                    {item.message}
                                                </p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                        {new Date(item.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {!item.is_read && (
                                                        <span className="bg-[#F26C22] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">New</span>
                                                    )}
                                                </div>
                                            </div>
                                            {!item.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(item.id)}
                                                    className="shrink-0 p-2 text-[#F26C22] dark:text-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

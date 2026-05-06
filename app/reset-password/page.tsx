'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Hexagon, ChevronLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        if (password.length < 8) {
            setStatus({ type: 'error', message: 'Password must be at least 8 characters long' });
            return;
        }

        setIsLoading(true);
        setStatus(null);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Password updated successfully! Redirecting to login...' });
                setTimeout(() => {
                    router.push('/login');
                }, 2500);
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to reset password' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center space-y-6">
                <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Invalid Reset Link</h3>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        This password reset link is missing a token or has expired.
                    </p>
                </div>
                <Link href="/forgot-password" title="Request new link" className="inline-block px-8 py-3 bg-[#F26C22] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all">
                    Request New Link
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(20,18,53,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F26C22] to-transparent opacity-50"></div>
            <h3 className="text-lg font-black text-[#141235] dark:text-white mb-6">Create New Password</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        New Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                            <Lock className="h-5 w-5" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            required
                            className="block w-full pl-12 pr-12 py-3.5 bg-[#f8fafc] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium shadow-inner"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            title={showPassword ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#F26C22] transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Confirm New Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Repeat your password"
                            required
                            className="block w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium shadow-inner"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requirements:</p>
                    <div className="grid grid-cols-2 gap-2">
                        <p className={`text-[10px] font-bold ${password.length >= 8 ? 'text-emerald-500' : 'text-slate-500'}`}>• 8+ Characters</p>
                        <p className={`text-[10px] font-bold ${/[A-Z]/.test(password) ? 'text-emerald-500' : 'text-slate-500'}`}>• Uppercase Letter</p>
                        <p className={`text-[10px] font-bold ${/[a-z]/.test(password) ? 'text-emerald-500' : 'text-slate-500'}`}>• Lowercase Letter</p>
                        <p className={`text-[10px] font-bold ${/[0-9]/.test(password) ? 'text-emerald-500' : 'text-slate-500'}`}>• Number / Symbol</p>
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded-xl text-xs font-bold border ${
                        status.type === 'success' 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                    }`}>
                        {status.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || status?.type === 'success'}
                    className="w-full py-4 bg-gradient-to-r from-[#F26C22] via-[#ff8833] to-[#F26C22] hover:bg-gradient-to-l text-white rounded-xl font-black text-sm shadow-[0_8px_20px_rgba(242,108,34,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-widest bg-[length:200%_auto]"
                >
                    {isLoading ? 'Resetting...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="page-wrapper font-sans selection:bg-[#F26C22] selection:text-white dark:bg-[#0a0f1c]">
            <div className="left-pattern"></div>
            
            <div className="left-side">
                <div className="absolute top-8 left-8 sm:left-16 lg:left-24 z-50 flex items-center gap-3">
                    <Link href="/login" title="Back to login" className="group flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full text-xs font-black text-slate-600 dark:text-slate-400 hover:text-[#F26C22] hover:border-[#F26C22]/40 transition-all shadow-sm hover:shadow-md">
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-[#F26C22]" />
                        Back to Login
                    </Link>
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="w-full max-w-xl mx-auto space-y-6 pt-12 pb-8">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-block">
                                <h1 className="text-3xl font-black tracking-tight text-[#0f172a] dark:text-white italic flex items-center">
                                    <span className="bg-[#141235] dark:bg-white text-white dark:text-[#141235] px-3 py-1 rounded-xl mr-1 shadow-md">Stay</span>
                                    <span className="text-[#F26C22] drop-shadow-sm">UniKL</span>
                                </h1>
                                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mt-3 flex items-center gap-1">
                                    <Hexagon className="h-3 w-3 text-[#F26C22]" /> Security Terminal
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl sm:text-5xl font-black text-[#141235] dark:text-white tracking-tight leading-tight">
                                Secured Access.
                            </h2>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                Please enter your new password to regain access to your dashboard.
                            </p>
                        </div>
                    </div>

                    <Suspense fallback={<div className="p-20 text-center font-bold text-slate-400">Loading terminal...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>

            <div className="right-side">
                <div className="right-pattern"></div>
                <img src="/mascot.png" className="hero-image" alt="UniKL Mascot" />
            </div>
        </div>
    );
}

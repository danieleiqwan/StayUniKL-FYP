'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Hexagon, ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: data.message });
                if (data.devResetLink) {
                    console.log('Dev Reset Link:', data.devResetLink);
                }
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to request reset link' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-wrapper font-sans selection:bg-[#F26C22] selection:text-white dark:bg-[#0a0f1c]">
            {isLoading && <LoadingSpinner fullPage message="Processing request..." />}
            <div className="left-pattern"></div>
            
            {/* Left Side (White Area for Form) */}
            <div className="left-side">
                
                {/* Floating Navigation */}
                <div className="absolute top-8 left-8 sm:left-16 lg:left-24 z-50 flex items-center gap-3">
                    <Link href="/login" className="group flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full text-xs font-black text-slate-600 dark:text-slate-400 hover:text-[#F26C22] hover:border-[#F26C22]/40 transition-all shadow-sm hover:shadow-md">
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-[#F26C22]" />
                        Back to Login
                    </Link>
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="w-full max-w-xl mx-auto space-y-6 pt-12 pb-8">
                    {/* Header */}
                    <div className="space-y-8">
                        <div>
                            <div className="inline-block">
                                <h1 className="text-3xl font-black tracking-tight text-[#0f172a] dark:text-white italic flex items-center">
                                    <span className="bg-[#141235] dark:bg-white text-white dark:text-[#141235] px-3 py-1 rounded-xl mr-1 shadow-md">Stay</span>
                                    <span className="text-[#F26C22] drop-shadow-sm">UniKL</span>
                                </h1>
                                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mt-3 flex items-center gap-1">
                                    <Hexagon className="h-3 w-3 text-[#F26C22]" /> Accommodation Portal
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl sm:text-5xl font-black text-[#141235] dark:text-white tracking-tight leading-tight">
                                Forgot Password?
                            </h2>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                Don't worry! Enter your email below to receive a reset link.
                            </p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(20,18,53,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 backdrop-blur-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F26C22] to-transparent opacity-50"></div>
                        <h3 className="text-lg font-black text-[#141235] dark:text-white mb-6">Reset your password</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                    Email address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="student@s.unikl.edu.my"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium shadow-inner"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
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
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#F26C22] via-[#ff8833] to-[#F26C22] hover:bg-gradient-to-l text-white rounded-xl font-black text-sm shadow-[0_8px_20px_rgba(242,108,34,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-widest bg-[length:200%_auto]"
                            >
                                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>

                            <div className="pt-4 text-center">
                                <p className="text-sm font-semibold text-slate-500">
                                    Remembered your password? <Link href="/login" className="text-[#F26C22] hover:text-[#d65a16] font-bold transition-colors hover:underline">Sign In</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side (Curved Dark Blue Area for Image) */}
            <div className="right-side">
                <div className="right-pattern"></div>
                <img src="/mascot.png" className="hero-image" alt="UniKL Mascot" />
            </div>
        </div>
    );
}

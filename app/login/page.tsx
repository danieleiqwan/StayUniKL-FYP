'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Building2, Hexagon, ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            if (email.includes('admin')) {
                await login('admin', email, password, rememberMe);
            } else {
                await login('student', email, password, rememberMe);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-wrapper font-sans selection:bg-[#F26C22] selection:text-white dark:bg-[#0a0f1c]">
            <div className="left-pattern"></div>
            
            {/* Left Side (White Area for Login Form) */}
            <div className="left-side">
                
                {/* Floating Navigation */}
                <div className="absolute top-8 left-8 sm:left-16 lg:left-24 z-50 flex items-center gap-3">
                    <Link href="/" className="group flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full text-xs font-black text-slate-600 dark:text-slate-400 hover:text-[#F26C22] hover:border-[#F26C22]/40 transition-all shadow-sm hover:shadow-md">
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-[#F26C22]" />
                        Back to Home
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
                                Welcome back!
                            </h2>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                Sign in to continue to StayUniKL
                            </p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(20,18,53,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 backdrop-blur-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F26C22] to-transparent opacity-50"></div>
                        <h3 className="text-lg font-black text-[#141235] dark:text-white mb-6">Sign in to your account</h3>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                    Email address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="student@unikl.edu.my"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium shadow-inner"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F26C22] transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        required
                                        className="block w-full pl-12 pr-12 py-3.5 bg-[#f8fafc] dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#F26C22]/30 focus:border-[#F26C22] dark:text-white transition-all outline-none font-medium shadow-inner"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#F26C22] transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    {/* Remember Me */}
                                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                id="rememberMe"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:bg-[#F26C22] peer-checked:border-[#F26C22] transition-all"></div>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                            Remember me <span className="text-slate-400 dark:text-slate-500 font-normal">(30 days)</span>
                                        </span>
                                    </label>

                                    {/* Forgot Password */}
                                    <Link href="/forgot-password" className="text-xs font-bold text-[#F26C22] hover:text-[#d65a16] transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#F26C22] via-[#ff8833] to-[#F26C22] hover:bg-gradient-to-l text-white rounded-xl font-black text-sm shadow-[0_8px_20px_rgba(242,108,34,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-widest bg-[length:200%_auto]"
                            >
                                {isLoading ? 'Authenticating...' : 'Sign in'}
                            </button>

                            <div className="pt-4 text-center">
                                <p className="text-sm font-semibold text-slate-500">
                                    New Student? <Link href="/register" className="text-[#F26C22] hover:text-[#d65a16] font-bold transition-colors hover:underline">Create an account</Link>
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

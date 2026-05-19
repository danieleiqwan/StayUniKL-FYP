'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldCheck, Check, X, AlertTriangle, LogOut, ArrowRight, ShieldAlert } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ChangePasswordPage() {
    const { logout } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

    // Form inputs
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Toggle password visibility
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Sync current session state
    const [adminName, setAdminName] = useState('Administrator');
    const [adminEmail, setAdminEmail] = useState('');
    const [isFirstLogin, setIsFirstLogin] = useState<boolean | null>(null);

    useEffect(() => {
        // Fetch current user info silently
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.user) {
                    setAdminName(data.user.name);
                    setAdminEmail(data.user.email);
                    // Detect if this is a true first login (no previous password change)
                    // vs a superadmin-triggered reset
                    setIsFirstLogin(!!data.user.isFirstLogin);
                }
            })
            .catch(err => console.error(err));
    }, []);

    // Password Validation Rules Check
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);

    const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;
    const isMatching = newPassword === confirmPassword && confirmPassword.length > 0;
    const isNotSameAsOld = currentPassword !== newPassword && newPassword.length > 0;

    const canSubmit = isPasswordValid && isMatching && isNotSameAsOld && currentPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setIsLoading(true);
        setStatusMessage({ type: null, text: '' });

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                setStatusMessage({ type: 'error', text: data.error || 'Failed to update password.' });
                setIsLoading(false);
            } else {
                setStatusMessage({ type: 'success', text: 'Password secured successfully! Redirecting...' });
                setIsLoading(false); // Stop loading cover to reveal the success message and card
                
                // Instantly sync the new authenticated user details in local storage
                if (data.user) {
                    localStorage.setItem('stayunikl_user', JSON.stringify(data.user));
                }
                
                // Bulletproof reload-based redirect to prevent any client-side router transition issues
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'An unexpected network error occurred.' });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060814] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#F26C22] selection:text-white">
            {/* Ambient visual background glow details */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F26C22]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3b82f6]/10 rounded-full blur-[120px] pointer-events-none"></div>

            {isLoading && <LoadingSpinner fullPage message="Securing your administrator credentials..." />}

            <div className="w-full max-w-2xl bg-[#0b0f19] border border-white/5 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden z-10">
                {/* Visual Accent Top Bar */}
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-red-500 via-[#F26C22] to-amber-400"></div>

                {/* Top header options */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                        <span className={`text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${isFirstLogin === false ? 'bg-indigo-600' : 'bg-[#F26C22]'}`}>
                            {isFirstLogin === false ? 'Password Reset' : 'First Login'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            Required Action
                        </span>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-rose-500 transition-colors bg-white/5 hover:bg-rose-500/10 px-4 py-2 rounded-full border border-white/5">
                        <LogOut className="h-3.5 w-3.5" />
                        Log out
                    </button>
                </div>

                {/* Explanatory introduction */}
                <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl border ${isFirstLogin === false ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-[#F26C22]/10 text-[#F26C22] border-[#F26C22]/20'}`}>
                            <ShieldAlert className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                                {isFirstLogin === false ? 'Password Reset Required' : 'Secure Your Account'}
                            </h1>
                            <p className="text-zinc-400 text-xs sm:text-sm font-medium">
                                Hi <span className="text-white font-bold">{adminName}</span> ({adminEmail || 'admin'}),{' '}
                                {isFirstLogin === false
                                    ? 'your password has been reset by a superadmin. Please set a new password to continue.'
                                    : 'you are logging in for the first time. Please configure a permanent password.'}
                            </p>
                        </div>
                    </div>
                </div>

                {statusMessage.text && (
                    <div className={`p-4 rounded-2xl mb-8 flex items-start gap-3 border text-sm font-semibold transition-all ${
                        statusMessage.type === 'success' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                        <div className="mt-0.5">
                            {statusMessage.type === 'success' ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        </div>
                        <div>{statusMessage.text}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Password Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Current Temporary Password</label>
                        <div className="relative group">
                            <input 
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="Enter current temporary password"
                                required
                                className="w-full px-4 py-3.5 rounded-xl bg-zinc-950 border border-white/5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F26C22]/50 transition-colors"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowCurrent(p => !p)} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left column inputs */}
                        <div className="space-y-5">
                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">New Strong Password</label>
                                <div className="relative group">
                                    <input 
                                        type={showNew ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl bg-zinc-950 border border-white/5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F26C22]/50 transition-colors"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowNew(p => !p)} 
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Confirm New Password</label>
                                <div className="relative group">
                                    <input 
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl bg-zinc-950 border border-white/5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#F26C22]/50 transition-colors"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirm(p => !p)} 
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right column: live premium rule tracking list */}
                        <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-4">
                                    Security Constraints
                                </span>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2.5 text-xs font-semibold">
                                        <div className={`p-0.5 rounded-md ${hasMinLength ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                        <span className={hasMinLength ? 'text-zinc-300' : 'text-zinc-500'}>
                                            At least 8 characters
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2.5 text-xs font-semibold">
                                        <div className={`p-0.5 rounded-md ${hasUppercase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                        <span className={hasUppercase ? 'text-zinc-300' : 'text-zinc-500'}>
                                            At least 1 uppercase letter
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2.5 text-xs font-semibold">
                                        <div className={`p-0.5 rounded-md ${hasNumber ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                        <span className={hasNumber ? 'text-zinc-300' : 'text-zinc-500'}>
                                            At least 1 number
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2.5 text-xs font-semibold">
                                        <div className={`p-0.5 rounded-md ${hasSpecialChar ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                        <span className={hasSpecialChar ? 'text-zinc-300' : 'text-zinc-500'}>
                                            At least 1 special character
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="border-t border-white/5 pt-4 mt-4 space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-semibold">
                                    <span className="text-zinc-500">Confirm Password Match:</span>
                                    <span className={isMatching ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                                        {isMatching ? 'MATCHED' : 'PENDING'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-semibold">
                                    <span className="text-zinc-500">Different from old password:</span>
                                    <span className={isNotSameAsOld ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                                        {isNotSameAsOld ? 'YES' : 'PENDING'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form actions and submission */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!canSubmit || isLoading}
                            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                                canSubmit 
                                    ? 'bg-gradient-to-r from-[#F26C22] to-amber-500 hover:from-amber-500 hover:to-[#F26C22] text-white shadow-[0_8px_25px_rgba(242,108,34,0.3)] hover:-translate-y-1 active:translate-y-0' 
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                        >
                            Secure Account & Continue
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

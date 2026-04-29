'use client';

import Navbar from '@/components/layout/Navbar';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Safe access to window.location to avoid Suspense boundary requirements
        // and ensure it works on client-side correctly.
        const searchParams = new URLSearchParams(window.location.search);
        setToken(searchParams.get('token'));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        if (password.length < 6) {
            setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        if (!token) {
            setStatus({ type: 'error', message: 'Missing reset token' });
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
                setStatus({ type: 'success', message: 'Password updated successfully. Redirecting to login...' });
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to reset password' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-center">
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Reset Password
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Enter your new secure password below
                </p>
            </div>

            {!token ? (
                <div className="text-center py-4">
                    <p className="text-red-500 text-sm">Validating reset token...</p>
                    <Link href="/forgot-password" className="mt-4 inline-block text-sm text-[#F26C22] hover:underline">
                        Request a new link
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="At least 6 characters"
                            required
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-[#F26C22] focus:outline-none focus:ring-1 focus:ring-[#F26C22] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Type password again"
                            required
                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-[#F26C22] focus:outline-none focus:ring-1 focus:ring-[#F26C22] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {status && (
                        <div className={`p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50'}`}>
                            {status.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || status?.type === 'success'}
                        className="flex w-full items-center justify-center rounded-lg bg-[#F26C22] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#d65a16] hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}

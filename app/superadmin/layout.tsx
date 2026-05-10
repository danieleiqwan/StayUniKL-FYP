'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsCheckingAuth(false), 600);
        return () => clearTimeout(timer);
    }, [user]);

    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
                        <span className="text-amber-400 text-xl">⬡</span>
                    </div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] animate-pulse">
                        Verifying Authority...
                    </p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'superadmin') {
        if (typeof window !== 'undefined') router.push('/login?role=admin');
        return null;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <SuperAdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`transition-all duration-300 min-h-screen flex flex-col ${isCollapsed ? 'lg:pl-24' : 'lg:pl-80'}`}>
                <div className="flex-1">
                    {children}
                </div>
                <footer className="px-10 py-6 text-center text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                    © {new Date().getFullYear()} StayUniKL &mdash; Superadmin Governance Terminal &mdash; Restricted Access
                </footer>
            </main>
        </div>
    );
}

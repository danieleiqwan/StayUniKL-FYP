'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Bell, Search, Clock } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { applications, complaints, courtBookings, roomChangeRequests } = useData();
    const router = useRouter();
    const pathname = usePathname();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsCheckingAuth(false), 500);
        return () => clearTimeout(timer);
    }, [user]);

    // Defensive check for data context
    const counts = useMemo(() => ({
        applications: (applications || []).filter(a => a.status === 'Pending' || !a.status).length,
        complaints: (complaints || []).filter(c => c.status === 'Pending').length,
        facilities: (courtBookings || []).filter(b => b.status === 'Pending').length,
        roomChanges: (roomChangeRequests || []).filter(r => r.status === 'Pending Review').length
    }), [applications, complaints, courtBookings, roomChangeRequests]);

    if (!user || user.role !== 'admin') {
        if (isCheckingAuth) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Authenticating Admin...
                </div>
            );
        }
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-foreground transition-colors duration-300">
            {/* Sidebar */}
            <AdminSidebar 
                activeTab={pathname === '/admin' ? 'dashboard' : undefined} 
                counts={counts}
            />

            {/* Main Content Area */}
            <main className="lg:pl-80 min-h-screen flex flex-col">
                {/* Global Admin Header */}
                <header className="flex justify-between items-center px-10 py-6 sticky top-0 z-40 bg-[#F8FAFC]/80 dark:bg-slate-950/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        {/* Mobile menu button could go here */}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                            <ThemeToggle />
                            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{user.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Administrator</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-[#F26C22] font-black text-sm">
                                {user.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1">
                    {children}
                </div>

                {/* Global Footer */}
                <footer className="px-10 py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-50">
                    &copy; {new Date().getFullYear()} StayUniKL Admin Terminal. Secure Access Only.
                </footer>
            </main>
        </div>
    );
}

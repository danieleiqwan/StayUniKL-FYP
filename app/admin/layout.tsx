'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Bell, Search, Clock } from 'lucide-react';
import AdminNavbar from '@/components/layout/AdminNavbar';
import { useSearchParams } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { applications, complaints, courtBookings, roomChangeRequests } = useData();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const activeTab = searchParams.get('tab') || (pathname === '/admin' ? 'overview' : undefined);

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
                activeTab={activeTab} 
                counts={counts}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            {/* Main Content Area */}
            <main className={`transition-all duration-300 min-h-screen flex flex-col ${isCollapsed ? 'lg:pl-24' : 'lg:pl-80'}`}>
                <AdminNavbar />

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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    ShieldAlert, LayoutDashboard, Users, ShieldCheck, 
    LogOut, Sun, Moon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Terminal Home', icon: LayoutDashboard, path: '/superadmin' },
    { id: 'staff', label: 'Staff Management', icon: Users, path: '/superadmin/staff' },
    { id: 'audit', label: 'Security Audit', icon: ShieldCheck, path: '/superadmin/audit' },
];

export default function SuperAdminSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    return (
        <aside className="w-72 h-screen sticky top-0 flex flex-col border-r transition-all duration-500 bg-white dark:bg-[#1E1B2E] border-zinc-200 dark:border-white/5 shadow-2xl dark:shadow-amber-500/5">
            {/* Header / Logo Area */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg bg-amber-500"
                        style={{ boxShadow: '0 8px 20px rgba(245,158,11,0.2)' }}>
                        <ShieldAlert className="h-6 w-6 text-black" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">STAYUNIKL</h2>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-500">Governance</span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all group relative overflow-hidden",
                                    isActive 
                                        ? "text-white dark:text-white" 
                                        : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-amber-500" 
                                         style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} />
                                )}
                                <item.icon className={cn(
                                    "h-5 w-5 relative z-10 transition-transform group-hover:scale-110",
                                    isActive ? "text-black" : "text-zinc-400 dark:text-zinc-600"
                                )} />
                                <span className="relative z-10 uppercase tracking-widest text-[11px]">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto p-6 space-y-3">
                {/* User Info Card */}
                <div className="p-4 rounded-[2rem] border bg-zinc-50 dark:bg-slate-900/40 border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-zinc-900 dark:text-white truncate uppercase">{user?.name || 'Master Admin'}</p>
                            <p className="text-[9px] font-bold text-zinc-500 dark:text-white/40 truncate uppercase tracking-tighter">Level 0: Superadmin</p>
                        </div>
                    </div>
                    <div className="h-[1px] w-full bg-zinc-200 dark:bg-white/5 mb-3" />
                    
                    <div className="flex items-center justify-between px-2">
                        {/* Theme Toggle */}
                        {mounted && (
                            <button 
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-zinc-500 dark:text-white/40 hover:text-amber-500 transition-colors"
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                        )}
                        
                        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-white/5 mx-2" />

                        <button 
                            onClick={logout}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-zinc-500 dark:text-white/40 hover:text-rose-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}

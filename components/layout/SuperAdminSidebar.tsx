'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    ShieldAlert, LayoutDashboard, Users, ShieldCheck, 
    LogOut, Sun, Moon, ChevronLeft, Menu, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Terminal Home', icon: LayoutDashboard, path: '/superadmin' },
    { id: 'staff', label: 'Staff Management', icon: Users, path: '/superadmin/staff' },
    { id: 'audit', label: 'Security Audit', icon: ShieldCheck, path: '/superadmin/audit' },
];

interface SuperAdminSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
}

export default function SuperAdminSidebar({ isCollapsed, setIsCollapsed }: SuperAdminSidebarProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 flex flex-col border-r transition-all duration-500 bg-[#1E1B2E] border-white/5 z-50",
            isCollapsed ? "w-24" : "w-72"
        )}>
            {/* Header / Logo Area */}
            <div className={cn("p-8 pb-4", isCollapsed && "px-4")}>
                <div className={cn("flex items-center justify-between mb-8", isCollapsed && "flex-col gap-6")}>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg bg-amber-500 shrink-0"
                            style={{ boxShadow: '0 8px 20px rgba(245,158,11,0.2)' }}>
                            <ShieldAlert className="h-6 w-6 text-black" />
                        </div>
                        {!isCollapsed && (
                            <div className="animate-in fade-in slide-in-from-left-2">
                                <h2 className="text-xl font-black tracking-tighter text-white leading-none">STAYUNIKL</h2>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Governance</span>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-500 hover:text-white"
                    >
                        {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
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
                                        ? "text-white" 
                                        : "text-zinc-500 hover:text-zinc-300",
                                    isCollapsed && "justify-center px-0"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                {isActive && (
                                    <div className={cn(
                                        "absolute inset-0 bg-amber-500 transition-all",
                                        isCollapsed ? "w-1" : "w-full"
                                    )} 
                                         style={{ background: isActive && !isCollapsed ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#f59e0b' }} />
                                )}
                                <item.icon className={cn(
                                    "h-5 w-5 relative z-10 transition-transform group-hover:scale-110",
                                    isActive ? "text-black" : "text-zinc-600",
                                    isActive && isCollapsed && "text-amber-500"
                                )} />
                                {!isCollapsed && <span className="relative z-10 uppercase tracking-widest text-[11px] animate-in fade-in slide-in-from-left-2">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto p-6 space-y-3">
                {/* User Info Card */}
                <div className={cn(
                    "p-4 rounded-[2rem] border bg-slate-900/40 border-white/5 shadow-none transition-all",
                    isCollapsed ? "p-2 items-center flex flex-col gap-4" : ""
                )}>
                    <div className={cn("flex items-center gap-3 mb-3", isCollapsed && "mb-0 justify-center")}>
                        <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 animate-in fade-in slide-in-from-left-2">
                                <p className="text-[10px] font-black text-white truncate uppercase">{user?.name || 'Master Admin'}</p>
                                <p className="text-[9px] font-bold text-white/40 truncate uppercase tracking-tighter">Level 0: Superadmin</p>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && <div className="h-[1px] w-full bg-white/5 mb-3" />}
                    
                    <div className={cn(
                        "flex items-center justify-between px-2",
                        isCollapsed && "flex-col gap-4 px-0 w-full"
                    )}>
                        {/* Theme Toggle */}
                        {mounted && (
                            <button 
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-white/40 hover:text-amber-500 transition-colors",
                                    isCollapsed && "hover:bg-white/5 w-full"
                                )}
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                        )}
                        
                        {!isCollapsed && <div className="w-[1px] h-4 bg-white/5 mx-2" />}

                        <button 
                            onClick={() => setShowLogoutModal(true)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-white/40 hover:text-rose-500 transition-colors",
                                isCollapsed && "hover:bg-rose-500/10 w-full"
                            )}
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modern Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-[2.5rem] border border-white/5 bg-[#1E1B2E] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="mx-auto h-16 w-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
                            <AlertTriangle className="h-8 w-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Sign Out?</h3>
                        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                            Are you sure you want to end your current superadmin session? You will need to re-authenticate to access the governance terminal.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-3.5 rounded-2xl border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => logout()}
                                className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}

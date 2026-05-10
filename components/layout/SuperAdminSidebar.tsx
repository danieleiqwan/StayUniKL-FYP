'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    History,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
}

export default function SuperAdminSidebar({ isCollapsed, setIsCollapsed }: Props) {
    const { logout, user } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/superadmin' },
        { id: 'staff', label: 'Staff Management', icon: Users, path: '/superadmin/staff' },
        { id: 'audit', label: 'Audit Logs', icon: History, path: '/superadmin/audit' },
    ];

    return (
        <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 flex flex-col z-50 ${isCollapsed ? 'w-24' : 'w-80'}`}
            style={{ background: 'linear-gradient(180deg, #0f0f0f 0%, #111111 100%)', borderRight: '1px solid rgba(245,158,11,0.08)' }}
        >
            {/* Branding */}
            <div className={`p-8 pb-6 flex items-center justify-between ${isCollapsed ? 'flex-col gap-5' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 relative"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 24px rgba(245,158,11,0.25)' }}
                    >
                        <ShieldAlert className="text-white h-5 w-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-in fade-in duration-300">
                            <h1 className="text-base font-black tracking-tighter leading-none text-white">StayUniKL</h1>
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] mt-0.5" style={{ color: '#f59e0b' }}>
                                Superadmin
                            </p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-xl transition-colors text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10"
                >
                    {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            {/* Authority Badge */}
            {!isCollapsed && (
                <div className="mx-4 mb-6 px-4 py-2.5 rounded-xl border animate-in fade-in duration-500"
                    style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.15)' }}
                >
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: '#f59e0b' }}>
                        ⬡ Governance Terminal
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5 truncate">All actions are logged</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-6">
                {!isCollapsed && (
                    <p className="px-4 text-[9px] font-black text-zinc-700 uppercase tracking-[0.25em] mb-3">
                        Control Panel
                    </p>
                )}
                {navItems.map((item) => {
                    const isActive = item.path === '/superadmin' ? pathname === '/superadmin' : pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={`flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${isCollapsed ? 'px-0 justify-center w-12' : 'px-4'}`}
                            style={isActive ? {
                                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))',
                                color: '#f59e0b',
                                boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.2)'
                            } : {}}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-zinc-600 group-hover:text-amber-400'}`} />
                            {!isCollapsed && (
                                <span className={`text-sm font-bold animate-in fade-in ${isActive ? 'text-amber-300' : 'text-zinc-500 group-hover:text-zinc-200'}`}>
                                    {item.label}
                                </span>
                            )}
                            {isActive && !isCollapsed && (
                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Profile & Logout */}
            <div className={`p-4 border-t ${isCollapsed ? 'flex flex-col items-center' : ''}`}
                style={{ borderColor: 'rgba(245,158,11,0.08)', background: 'rgba(0,0,0,0.3)' }}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-3 px-4 py-3 mb-1 animate-in fade-in">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}
                        >
                            {user?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-white truncate">{user?.name || 'Super Admin'}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#f59e0b' }}>Superadmin</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => {
                        if (window.confirm('Sign out of the Superadmin terminal?')) logout();
                    }}
                    className={`flex items-center gap-3 rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-black uppercase tracking-widest ${isCollapsed ? 'p-3 w-12 justify-center' : 'px-4 py-3 w-full'}`}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}

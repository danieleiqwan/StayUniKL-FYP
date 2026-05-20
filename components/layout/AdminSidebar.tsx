'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { 
    LayoutDashboard, 
    FileText, 
    Wrench, 
    CalendarDays, 
    Building2, 
    UserPlus, 
    BarChart3, 
    Megaphone,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Menu,
    Settings,
    ShieldCheck,
    ScanLine,
    GraduationCap,
    History,
    AlertTriangle,
    CalendarClock
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminSidebarProps {
    activeTab?: string;
    onTabChange?: (tab: any) => void;
    counts?: {
        applications: number;
        complaints: number;
        facilities: number;
        roomChanges: number;
    };
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
    isMobileOpen?: boolean;
    setIsMobileOpen?: (val: boolean) => void;
}

export default function AdminSidebar({ activeTab, onTabChange, counts, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: AdminSidebarProps) {
    const { logout, user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Analytics', icon: BarChart3, path: '/admin/reports' },
        { id: 'applications', label: 'Student Applications', icon: FileText, tab: 'applications' },
        { id: 'complaints', label: 'Facility Complaints', icon: Wrench, tab: 'complaints' },
        { id: 'facilities', label: 'Sport & Facilities', icon: CalendarDays, tab: 'facilities' },
        { id: 'room-changes', label: 'Room Change Request', icon: Building2, tab: 'room-changes' },
        { id: 'sessions', label: 'Application Sessions', icon: CalendarClock, tab: 'sessions' },
        { id: 'announcements', label: 'Announcements', icon: Megaphone, path: '/admin/announcements' },
    ];

    const utilityItems = [
        { id: 'checkin', label: 'QR Check-in Hub', icon: ScanLine, path: '/admin/checkin' },
        { id: 'finance', label: 'Finance Hub', icon: FileText, path: '/admin/finances/create-invoice' },
        { id: 'rooms', label: 'Room Management', icon: Building2, path: '/admin/rooms' },
        { id: 'docs', label: 'Document Verify', icon: ShieldCheck, path: '/admin/documents' },
        { id: 'duties', label: 'Duty Scheduling', icon: CalendarClock, path: '/admin/duties' },
        { id: 'academic', label: 'Academic Settings', icon: GraduationCap, path: '/admin/academic' },
        { id: 'audit', label: 'System Log History', icon: History, path: '/admin/audit' },
    ];

    return (
        <>
        <aside className={`fixed inset-y-0 left-0 transition-all duration-300 bg-[#1E1B2E] text-white flex flex-col z-50 
            ${isCollapsed ? 'w-24' : 'w-80'} 
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            {/* Branding */}
            <div className={`p-8 pb-10 flex items-center justify-between ${isCollapsed ? 'flex-col gap-6' : ''}`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="h-10 w-10 bg-[#F26C22] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3 shrink-0">
                        <Building2 className="text-white h-6 w-6" />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-in fade-in duration-500">
                            <h1 className="text-xl font-black tracking-tighter leading-none">StayUniKL</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Central</p>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white hidden lg:block"
                >
                    {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>

                {/* Mobile Close Button */}
                <button 
                    onClick={() => setIsMobileOpen?.(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white lg:hidden"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto overflow-x-hidden custom-scrollbar pb-10">
                {/* Main Management */}
                <div>
                    {!isCollapsed && <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 animate-in fade-in">Core Management</p>}
                    <div className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                        {menuItems.map((item) => {
                            const isActive = item.tab ? activeTab === item.tab : pathname === item.path;
                            const Icon = item.icon;
                            const count = item.tab ? (counts as any)?.[item.tab === 'room-changes' ? 'roomChanges' : item.tab] || 0 : 0;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.tab) {
                                            if (onTabChange) {
                                                onTabChange(item.tab);
                                            }
                                            router.push(`/admin?tab=${item.tab}`);
                                        } else if (item.path) {
                                            router.push(item.path);
                                        }
                                    }}
                                    className={`group transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-full'}`}
                                >
                                    <div className={`flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 relative ${
                                        isActive 
                                            ? 'bg-[#F26C22] text-white shadow-xl shadow-orange-500/20' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    } ${isCollapsed ? 'px-0 justify-center' : 'px-4'}`}>
                                        <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                        {!isCollapsed && <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2">{item.label}</span>}
                                        {count > 0 && (
                                            <span className={`${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black animate-in zoom-in duration-300`}>
                                                {count}
                                            </span>
                                        )}
                                        {isActive && !count && !isCollapsed && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Utility Hub */}
                <div>
                    {!isCollapsed && <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 animate-in fade-in">Operations Hub</p>}
                    <div className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                        {utilityItems.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <Link 
                                    key={item.id}
                                    href={item.path} 
                                    className={`flex items-center transition-all duration-300 group relative ${
                                        isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    } ${isCollapsed ? 'w-12 justify-center py-3.5 rounded-2xl' : 'px-4 py-3.5 rounded-2xl gap-4'}`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    {!isCollapsed && <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Superadmin Return Gateway */}
                {user?.role === 'superadmin' && (
                    <div className="pt-4 border-t border-white/5 animate-in slide-in-from-bottom-2 duration-700">
                        <Link 
                            href="/superadmin" 
                            className={`flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 group relative ${isCollapsed ? 'px-0 justify-center w-12' : 'px-4'}`}
                            title={isCollapsed ? "Back to Superadmin" : undefined}
                        >
                            <ShieldCheck className={`h-5 w-5 shrink-0 ${isCollapsed ? '' : 'group-hover:scale-110 transition-transform'}`} />
                            {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in">Superadmin Portal</span>}
                        </Link>
                    </div>
                )}
            </div>

            {/* Admin Profile & Logout */}
            <div className={`p-4 bg-white/5 border-t border-white/5 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                <div className={`flex items-center gap-3 mb-2 ${isCollapsed ? 'px-0 justify-center' : 'px-4 py-3'}`}>
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-sm shrink-0">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0 animate-in fade-in slide-in-from-left-2">
                            <p className="text-sm font-black truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Master</p>
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => setShowLogoutModal(true)}
                    className={`flex items-center gap-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-xs font-black uppercase tracking-widest ${isCollapsed ? 'p-3 w-12 justify-center' : 'px-4 py-3 w-full'}`}
                    title="Sign Out Terminal"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 text-left">Sign Out</span>}
                </button>

            </div>
        </aside>

        {/* Modern Logout Confirmation Modal - Moved outside aside to prevent layout trapping */}
        {showLogoutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-sm rounded-[2.5rem] border border-white/5 bg-[#1E1B2E] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                    <div className="mx-auto h-16 w-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
                        <AlertTriangle className="h-8 w-8 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Sign Out?</h3>
                    <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                        Are you sure you want to end your current session? You will need to re-authenticate to access the terminal.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 py-3.5 rounded-2xl border border-white/5 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => logout()}
                            className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

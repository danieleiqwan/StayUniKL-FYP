'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
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
    History
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
}

export default function AdminSidebar({ activeTab, onTabChange, counts, isCollapsed, setIsCollapsed }: AdminSidebarProps) {
    const { logout, user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { id: 'dashboard', label: 'Analytics', icon: BarChart3, path: '/admin/reports' },
        { id: 'applications', label: 'Student Applications', icon: FileText, tab: 'applications' },
        { id: 'complaints', label: 'Facility Complaints', icon: Wrench, tab: 'complaints' },
        { id: 'facilities', label: 'Sport & Facilities', icon: CalendarDays, tab: 'facilities' },
        { id: 'room-changes', label: 'Room Change Request', icon: Building2, tab: 'room-changes' },
        { id: 'announcements', label: 'Announcements', icon: Megaphone, path: '/admin/announcements' },
    ];

    const utilityItems = [
        { id: 'checkin', label: 'QR Check-in Hub', icon: ScanLine, path: '/admin/checkin' },
        { id: 'rooms', label: 'Room Management', icon: Building2, path: '/admin/rooms' },
        { id: 'docs', label: 'Document Verify', icon: ShieldCheck, path: '/admin/documents' },
        { id: 'academic', label: 'Academic Settings', icon: GraduationCap, path: '/admin/academic' },
        { id: 'audit', label: 'Audit Security Log', icon: History, path: '/admin/audit' },
    ];

    return (
        <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 bg-slate-950 text-white flex flex-col z-50 ${isCollapsed ? 'w-24' : 'w-80'}`}>
            {/* Branding */}
            <div className={`p-8 pb-10 flex items-center justify-between ${isCollapsed ? 'flex-col gap-6' : ''}`}>
                <div className="flex items-center gap-3">
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
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                    {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pb-10">
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
                                            // Always ensure we are on the main admin page when a tab is clicked
                                            router.push(`/admin?tab=${item.tab}`);
                                        } else if (item.path) {
                                            router.push(item.path);
                                        }
                                    }}
                                    className="w-full group"
                                >
                                    {isActive ? (
                                        <div className={`flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 bg-[#F26C22] text-white shadow-xl shadow-orange-500/20 ${isCollapsed ? 'px-0 justify-center w-12' : 'px-4'}`}>
                                            <Icon className={`h-5 w-5 text-white shrink-0`} />
                                            {!isCollapsed && <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2">{item.label}</span>}
                                            {count > 0 && (
                                                <span className={`${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black animate-in zoom-in duration-300`}>
                                                    {count}
                                                </span>
                                            )}
                                            {isActive && !count && !isCollapsed && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                                        </div>
                                    ) : (
                                        <div className={`flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 ${isCollapsed ? 'px-0 justify-center w-12' : 'px-4'}`}>
                                            <Icon className={`h-5 w-5 text-slate-500 group-hover:text-slate-300 shrink-0`} />
                                            {!isCollapsed && <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2">{item.label}</span>}
                                            {count > 0 && (
                                                <span className={`${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black animate-in zoom-in duration-300`}>
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Utility Hub */}
                <div>
                    <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Operations Hub</p>
                    <div className="space-y-1">
                        {utilityItems.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <Link 
                                    key={item.id}
                                    href={item.path} 
                                    className={`flex items-center gap-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${isCollapsed ? 'px-0 justify-center w-12' : 'px-4'}`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    {!isCollapsed && <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </div>
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
                    onClick={() => {
                        if (window.confirm('Are you sure you want to sign out?')) {
                            logout();
                        }
                    }}
                    className={`flex items-center gap-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-xs font-black uppercase tracking-widest ${isCollapsed ? 'p-3 w-12 justify-center' : 'px-4 py-3 w-full'}`}
                    title="Sign Out Terminal"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}

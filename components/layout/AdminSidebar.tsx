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
    Settings,
    ShieldCheck,
    ScanLine
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
}

export default function AdminSidebar({ activeTab, onTabChange, counts }: AdminSidebarProps) {
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
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-80 bg-slate-950 text-white flex flex-col z-50">
            {/* Branding */}
            <div className="p-8 pb-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#F26C22] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
                        <Building2 className="text-white h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter leading-none">StayUniKL</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Central</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pb-10">
                {/* Main Management */}
                <div>
                    <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Core Management</p>
                    <div className="space-y-1">
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
                                        <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 bg-[#F26C22] text-white shadow-xl shadow-orange-500/20`}>
                                            <Icon className={`h-5 w-5 text-white`} />
                                            <span className="text-sm font-bold">{item.label}</span>
                                            {count > 0 && (
                                                <span className="ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black animate-in zoom-in duration-300">
                                                    {count}
                                                </span>
                                            )}
                                            {isActive && !count && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                                        </div>
                                    ) : (
                                        <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5`}>
                                            <Icon className={`h-5 w-5 text-slate-500 group-hover:text-slate-300`} />
                                            <span className="text-sm font-bold">{item.label}</span>
                                            {count > 0 && (
                                                <span className="ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black animate-in zoom-in duration-300">
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
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                    <span className="text-sm font-bold">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Admin Profile & Logout */}
            <div className="p-4 bg-white/5 border-t border-white/5">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-sm">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-black truncate">{user?.name || 'Administrator'}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Master</p>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        if (window.confirm('Are you sure you want to sign out?')) {
                            logout();
                        }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-xs font-black uppercase tracking-widest"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out Terminal
                </button>
            </div>
        </aside>
    );
}

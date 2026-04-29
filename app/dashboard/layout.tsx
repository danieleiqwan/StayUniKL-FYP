'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    User, 
    Home, 
    Wrench, 
    CalendarDays, 
    Settings, 
    LogOut,
    Bell,
    ChevronDown,
    ArrowRightLeft,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    CreditCard,
    Dumbbell,
    WashingMachine,
    Clock,
    BookOpen,
    Phone,
    Layers
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

// ─────────────────────────────────────────────────────────────────────────────
// NavContent extracted as a TOP-LEVEL component so React never unmounts/remounts
// it on parent state changes (which would kill any CSS transitions).
// ─────────────────────────────────────────────────────────────────────────────
interface NavContentProps {
    collapsed?: boolean;
    isMobile?: boolean;
    user: any;
    pathname: string;
    unreadNotificationsCount: number;
    myApplication: any;
    logout: () => void;
}

function NavContent({
    collapsed = false,
    isMobile = false,
    user,
    pathname,
    unreadNotificationsCount,
    myApplication,
    logout,
}: NavContentProps) {
    const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(
        pathname.includes('/court')
    );
    const [isMiscOpen, setIsMiscOpen] = useState(
        pathname.includes('/gym') || pathname.includes('/dobby') || pathname.includes('/handbook') || pathname.includes('/contacts')
    );

    // Keep dropdown open when navigating to a child route
    useEffect(() => {
        if (pathname.includes('/court')) {
            setIsFacilitiesOpen(true);
        }
        if (pathname.includes('/gym') || pathname.includes('/dobby') || pathname.includes('/handbook') || pathname.includes('/contacts')) {
            setIsMiscOpen(true);
        }
    }, [pathname]);

    const navItems = [
        { name: 'Dashboard',  path: '/dashboard',             icon: LayoutDashboard },
        { name: 'Profile',    path: '/dashboard/profile',     icon: User },
        { name: myApplication ? 'Application' : 'Apply', path: '/dashboard/apply', icon: Home },
        { name: 'Complaints', path: '/dashboard/complaints',  icon: Wrench },
        { name: 'Room Change',path: '/dashboard/room-change', icon: ArrowRightLeft },
        { name: 'Payment',    path: '/dashboard/payment',     icon: CreditCard },
        { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    ];

    const facilityItems = [
        { label: 'Court Booking',   path: '/dashboard/court',            icon: CalendarDays },
        { label: 'Booking History', path: '/dashboard/court/history',    icon: Clock },
    ];

    const miscItems = [
        { label: 'Gym Schedule',    path: '/dashboard/calendar/gym',     icon: Dumbbell },
        { label: 'Laundry Slots',   path: '/dashboard/calendar/dobby',   icon: WashingMachine },
        { label: 'Hostel Handbook', path: '/dashboard/handbook',         icon: BookOpen },
        { label: 'Emergency Contacts', path: '/dashboard/contacts',      icon: Phone },
    ];

    const facilitiesActive =
        isFacilitiesOpen ||
        pathname.includes('/court');

    const miscActive =
        isMiscOpen ||
        pathname.includes('/gym') ||
        pathname.includes('/dobby') ||
        pathname.includes('/handbook') ||
        pathname.includes('/contacts');

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Brand / Profile Header */}
            <div className={`px-6 mb-8 ${collapsed ? 'flex justify-center' : ''}`}>
                <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
                    <div className="h-9 w-9 rounded-xl bg-[#F26C22] flex items-center justify-center text-white font-black text-sm shrink-0 overflow-hidden">
                        {user.profileImage && user.profileImage !== '' ? (
                            <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            user.name?.charAt(0)
                        )}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-0.5">Student</p>
                            <p className="text-sm font-bold text-white truncate tracking-tight">{user.name}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 mb-3">
                <p className={`text-xs font-black text-white/25 uppercase tracking-[0.2em] mb-3 ${collapsed ? 'text-center' : ''}`}>
                    {collapsed ? '•••' : 'Main'}
                </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all group relative ${
                                isActive
                                    ? 'bg-[#F26C22] text-white'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                            } ${collapsed ? 'justify-center' : ''}`}
                        >
                            <Icon style={{ height: '18px', width: '18px' }} className="shrink-0" />
                            {!collapsed && <span className="text-sm truncate">{item.name}</span>}

                            {/* Notification badge */}
                            {item.name === 'Notifications' && unreadNotificationsCount > 0 && !collapsed && (
                                <span className="ml-auto text-xs font-black bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                </span>
                            )}

                            {/* Tooltip in collapsed mode */}
                            {collapsed && !isMobile && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap shadow-xl dark:bg-slate-800 dark:border-white/20">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}

                {/* ── Facilities Dropdown ── */}
                <div className="space-y-0.5">
                    <button
                        onClick={() => setIsFacilitiesOpen(prev => !prev)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all group relative ${
                            facilitiesActive
                                ? 'bg-[#F26C22] text-white'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                        } ${collapsed ? 'justify-center' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <CalendarDays style={{ height: '18px', width: '18px' }} className="shrink-0" />
                            {!collapsed && <span className="text-sm">Facilities</span>}
                        </div>
                        {!collapsed && (
                            <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform duration-300 ${
                                    isFacilitiesOpen ? 'rotate-180' : 'rotate-0'
                                }`}
                            />
                        )}

                        {/* Tooltip in collapsed mode */}
                        {collapsed && !isMobile && (
                            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap dark:bg-slate-800 dark:border-white/20">
                                Facilities
                            </div>
                        )}
                    </button>

                    {/* Animated submenu — uses max-height transition; DOM stays mounted */}
                    <div
                        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                            isFacilitiesOpen && !collapsed
                                ? 'max-h-64 opacity-100'
                                : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="pl-8 space-y-0.5 pt-1 pb-2">
                            {facilityItems.map((sub) => (
                                <Link
                                    key={sub.path}
                                    href={sub.path}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        pathname === sub.path
                                            ? 'text-[#F26C22] bg-white/5'
                                            : 'text-white/30 hover:text-white/70 hover:bg-white/5'
                                    }`}
                                >
                                    <sub.icon className="h-3.5 w-3.5" /> {sub.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Miscellaneous Dropdown ── */}
                <div className="space-y-0.5 mt-1">
                    <button
                        onClick={() => setIsMiscOpen(prev => !prev)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all group relative ${
                            miscActive
                                ? 'bg-[#F26C22] text-white'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                        } ${collapsed ? 'justify-center' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <Layers style={{ height: '18px', width: '18px' }} className="shrink-0" />
                            {!collapsed && <span className="text-sm">Miscellaneous</span>}
                        </div>
                        {!collapsed && (
                            <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform duration-300 ${
                                    isMiscOpen ? 'rotate-180' : 'rotate-0'
                                }`}
                            />
                        )}

                        {/* Tooltip in collapsed mode */}
                        {collapsed && !isMobile && (
                            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap dark:bg-slate-800 dark:border-white/20">
                                Miscellaneous
                            </div>
                        )}
                    </button>

                    <div
                        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                            isMiscOpen && !collapsed
                                ? 'max-h-64 opacity-100'
                                : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="pl-8 space-y-0.5 pt-1 pb-2">
                            {miscItems.map((sub) => (
                                <Link
                                    key={sub.path}
                                    href={sub.path}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        pathname === sub.path
                                            ? 'text-[#F26C22] bg-white/5'
                                            : 'text-white/30 hover:text-white/70 hover:bg-white/5'
                                    }`}
                                >
                                    <sub.icon className="h-3.5 w-3.5" /> {sub.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Account section */}
            <div className="px-3 pt-6 border-t border-white/5 space-y-0.5">
                <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:bg-white/5 hover:text-white font-bold transition-all relative group ${collapsed ? 'justify-center' : ''}`}
                >
                    <Settings style={{ height: '18px', width: '18px' }} className="shrink-0 group-hover:rotate-45 transition-transform" />
                    {!collapsed && <span className="text-sm">Settings</span>}
                    {collapsed && !isMobile && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap dark:bg-slate-800 dark:border-white/20">
                            Settings
                        </div>
                    )}
                </Link>
                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400/70 hover:bg-rose-500/10 hover:text-rose-400 font-bold transition-all relative group ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut style={{ height: '18px', width: '18px' }} className="shrink-0 transition-transform group-hover:translate-x-1" />
                    {!collapsed && <span className="text-sm">Logout</span>}
                    {collapsed && !isMobile && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap">
                            Logout
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Layout
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const { unreadNotificationsCount, myApplication } = useData();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsCheckingAuth(false), 500);
        return () => clearTimeout(timer);
    }, [user]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (!user) {
        if (isCheckingAuth) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6] animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Authenticating...
                </div>
            );
        }
        if (typeof window !== 'undefined') window.location.href = '/login';
        return null;
    }

    const navProps = { user, pathname, unreadNotificationsCount, myApplication, logout };
    
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans overflow-x-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">

            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex ${isCollapsed ? 'w-20' : 'w-64'} bg-[#1E1B2E] flex-col py-8 fixed h-full top-0 left-0 z-50 transition-all duration-500 ease-in-out`}
            >
                {/* Collapse toggle */}
                <button
                    onClick={() => setIsCollapsed(prev => !prev)}
                    className="absolute -right-3 top-12 bg-[#2D2B45] dark:bg-slate-800 border border-white/10 dark:border-slate-700 shadow-md rounded-full p-1 text-white/40 hover:text-white transition-colors z-[60]"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                <NavContent collapsed={isCollapsed} {...navProps} />
            </aside>

            {/* Mobile Drawer Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 bottom-0 w-64 bg-[#1E1B2E] z-[110] lg:hidden transition-transform duration-500 ease-in-out py-8 ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute right-4 top-4 p-2 text-white/30 hover:text-rose-400 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
                <NavContent isMobile {...navProps} />
            </aside>

            {/* Main Content Area */}
            <main
                className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ease-in-out ${
                    isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                } ml-0`}
            >
                {/* Top Header */}
                <header className="flex justify-between lg:justify-end items-center px-6 md:px-10 py-6 md:py-8 bg-transparent sticky top-0 z-40 w-full backdrop-blur-md">
                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden h-12 w-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-[#F26C22] transition-all shadow-sm active:scale-95"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-4 md:gap-6">
                        <Link
                            href="/dashboard/notifications"
                            className="relative h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-[#F26C22] hover:border-orange-100 dark:hover:border-orange-900 transition-all shadow-sm"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 flex h-3.5 w-3.5 md:h-4 md:w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-white ring-2 ring-white">
                                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                </span>
                            )}
                        </Link>

                        <div className="flex items-center gap-4 md:gap-6 pl-4 md:pl-6 border-l border-slate-200 dark:border-slate-800">
                            <ThemeToggle />
                            <div className="text-right hidden sm:block">
                                <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</p>
                                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user.id}</p>
                            </div>
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-md">
                                {user.profileImage && user.profileImage !== '' ? (
                                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-orange-100 dark:bg-orange-900/40 text-[#F26C22] dark:text-orange-400 font-bold text-xs md:text-sm">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 px-4 md:px-10 pb-16 w-full max-w-[100vw] overflow-x-hidden">
                    {children}
                </div>

                {/* Footer */}
                <footer className="mt-auto py-8 md:py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                    <p>&copy; {new Date().getFullYear()} StayUniKL. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
}

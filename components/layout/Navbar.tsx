'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, User, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { scroller, animateScroll } from 'react-scroll';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const { unreadNotificationsCount } = useData();
    const pathname = usePathname();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const isStudent = isAuthenticated && user?.role === 'student';

    // Dynamic hrefs for navigation links
    const featuresHref = pathname === '/' ? '#features' : '/#features';
    const aboutHref = pathname === '/' ? '#about' : '/#about';
    const supportHref = pathname === '/' ? '#support' : '/#support';

    const handleScroll = (target: string) => (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        // Only scroll if we are on the home page
        if (pathname === '/') {
            e.preventDefault();
            scroller.scrollTo(target, {
                duration: 800,
                delay: 0,
                smooth: 'easeInOutCubic',
                offset: -80, // Adjusts for the sticky navbar height
            });
        }
    };

    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (pathname === '/') {
            e.preventDefault();
            animateScroll.scrollToTop({
                duration: 800,
                delay: 0,
                smooth: 'easeInOutCubic'
            });
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80 transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-6">
                        <Link
                            href={isStudent ? "/dashboard" : "/"}
                            className="group flex items-center gap-3"
                            onClick={!isStudent ? handleHomeClick : undefined}
                        >
                            <div className="relative overflow-hidden rounded-lg bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
                                <Image
                                    src="/unikl-logo.png"
                                    alt="UniKL Logo"
                                    width={100}
                                    height={35}
                                    className="h-8 w-auto object-contain"
                                />
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Stay<span className="text-[#F26C22]">UniKL</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {!isAuthenticated ? (
                            <div className="flex items-center gap-6">
                                <Link
                                    href="/"
                                    className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22] transition-colors"
                                    onClick={handleHomeClick}
                                >
                                    Home
                                </Link>
                                <Link
                                    href={featuresHref}
                                    onClick={handleScroll('features')}
                                    className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22] transition-colors"
                                >
                                    Features
                                </Link>
                                <Link
                                    href={aboutHref}
                                    onClick={handleScroll('about')}
                                    className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22] transition-colors"
                                >
                                    About
                                </Link>
                                <Link
                                    href={supportHref}
                                    onClick={handleScroll('support')}
                                    className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22] transition-colors"
                                >
                                    Support
                                </Link>

                                <div className="ml-4 flex items-center gap-4 border-l border-slate-200 pl-6 dark:border-slate-800">
                                    <ThemeToggle />
                                    <div className="flex items-center gap-3">
                                        <Link href="/login" className="text-sm font-semibold text-slate-900 hover:text-[#F26C22] dark:text-white dark:hover:text-[#F26C22] transition-colors">
                                            Log in
                                        </Link>
                                        <Link href="/register" className="rounded-full bg-[#F26C22] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-[#d65a16] hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0">
                                            Register
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                {/* Student Links */}
                                {isStudent && (
                                    <>
                                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22] transition-colors">
                                            Dashboard
                                        </Link>

                                        {/* Calendar Dropdown */}
                                        <div className="relative inline-block text-left" ref={calendarRef}>
                                            <button
                                                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                                className="group inline-flex items-center justify-center gap-1 text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22] outline-none"
                                            >
                                                Calendar
                                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCalendarOpen ? 'rotate-180 text-[#F26C22]' : 'text-slate-400 group-hover:text-[#F26C22]'}`} />
                                            </button>

                                            {isCalendarOpen && (
                                                <div className="absolute right-0 mt-3 w-48 origin-top-right rounded-xl bg-white p-1 shadow-xl ring-1 ring-black/5 focus:outline-none dark:bg-slate-900 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                                                    <Link
                                                        href="/dashboard/calendar/gym"
                                                        className="block rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#F26C22] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-[#F26C22] transition-colors"
                                                        onClick={() => setIsCalendarOpen(false)}
                                                    >
                                                        Gym Schedule
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/calendar/dobby"
                                                        className="block rounded-lg px-4 py-2.5 text-sm text-slate-700 hover:bg-orange-50 hover:text-[#F26C22] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-[#F26C22] transition-colors"
                                                        onClick={() => setIsCalendarOpen(false)}
                                                    >
                                                        Laundry (Dobby)
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <Link href="/dashboard/notifications" className="relative group">
                                            <div className="p-2 text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22] transition-colors">
                                                <Bell className="h-5 w-5" />
                                                {unreadNotificationsCount > 0 && (
                                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950 animate-pulse">
                                                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </>
                                )}

                                {/* Admin Link (if admin logged in mainly) */}
                                {user?.role === 'admin' && (
                                    <>
                                        <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22]">
                                            Admin Dashboard
                                        </Link>
                                        <Link href="/admin/rooms" className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22]">
                                            Rooms
                                        </Link>
                                        <Link href="/admin/billing" className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22]">
                                            Finances
                                        </Link>
                                        <Link href="/admin/assets" className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22]">
                                            Assets
                                        </Link>
                                        <Link href="/admin/documents" className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22]">
                                            Documents
                                        </Link>
                                        <Link href="/admin/reports" className="text-sm font-medium text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22]">
                                            Reports
                                        </Link>
                                    </>
                                )}

                                {/* User Profile & Actions */}
                                <div className="ml-2 flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                                    <ThemeToggle />

                                    <div className="flex items-center gap-3">
                                        <Link href={user?.role === 'admin' ? "/admin/profile" : "/dashboard/profile"} className="relative group">
                                            <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-100 ring-2 ring-transparent transition-all hover:ring-[#F26C22] dark:bg-slate-800">
                                                {user?.profileImage ? (
                                                    <img
                                                        src={user.profileImage}
                                                        alt={user?.name || 'User'}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-700">
                                                        <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        <button
                                            onClick={logout}
                                            className="group flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
                                            title="Logout"
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button - Simplified for now */}
                    <div className="flex items-center items-center gap-4 md:hidden">
                        <div className="rounded-full bg-slate-100 p-1 dark:bg-slate-800">
                            <ThemeToggle />
                        </div>
                        <button className="text-slate-600 hover:text-[#F26C22] dark:text-slate-300 dark:hover:text-[#F26C22] transition-colors">
                            <span className="sr-only">Open menu</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

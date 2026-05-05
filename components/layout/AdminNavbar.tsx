'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Search, Settings, Bell, Command } from 'lucide-react';
import Link from 'next/link';

export default function AdminNavbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Map path to breadcrumb labels
    const getBreadcrumb = () => {
        const parts = pathname.split('/').filter(Boolean);
        if (parts.length <= 1) return 'Dashboard';
        return parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
    };

    const navLinks = [
        { name: 'Overview', path: '/admin' },
        { name: 'Students', path: '/admin/students' },
        { name: 'Rooms', path: '/admin/rooms' },
        { name: 'Finances', path: '/admin/billing' },
        { name: 'Assets', path: '/admin/assets' },
    ];

    return (
        <nav className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
            {/* Left Section: Breadcrumb & Nav */}
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-slate-400 dark:text-slate-500">Admin</span>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <span className="text-slate-900 dark:text-white font-bold tracking-tight">{getBreadcrumb()}</span>
                </div>

                <div className="hidden lg:flex items-center gap-6">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`text-sm font-medium transition-colors ${
                                    isActive 
                                        ? 'text-slate-900 dark:text-white' 
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Right Section: Search & Actions */}
            <div className="flex items-center gap-6">
                {/* Search Bar (Shadcn style) */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg w-64 group focus-within:ring-2 focus-within:ring-slate-200 dark:focus-within:ring-slate-800 transition-all">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-200" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-transparent border-none outline-none text-xs w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-400 font-mono shadow-sm">
                        <Command className="h-2.5 w-2.5" /> K
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    
                    <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Settings className="h-5 w-5" />
                    </button>

                    <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-[10px] font-bold text-white dark:text-slate-900 cursor-pointer hover:ring-4 hover:ring-slate-100 dark:hover:ring-slate-800 transition-all">
                        {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'AD'}
                    </div>
                </div>
            </div>
        </nav>
    );
}

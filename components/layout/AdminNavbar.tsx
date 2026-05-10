'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Settings, Bell } from 'lucide-react';
import Link from 'next/link';

export default function AdminNavbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'overview';

    const navLinks = [
        { name: 'Overview', path: '/admin' },
        { name: 'Students', path: '/admin/students' },
        { name: 'Rooms', path: '/admin/rooms' },
        { name: 'Finances', path: '/admin/billing' },
        { name: 'Assets', path: '/admin/assets' },
    ];

    return (
        <nav className="h-24 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md px-10 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
            {/* Left Section: Navigation Links - Starting from the left */}
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-sm font-black mr-6">
                    <span className="text-slate-900 dark:text-white uppercase tracking-tighter">Admin</span>
                    <span className="text-slate-300 dark:text-slate-700">/</span>
                    <span className="text-[#F26C22] tracking-tighter">Terminal</span>
                </div>

                <div className="flex items-center gap-6">
                    {navLinks.map((link) => {
                        // Overview is only "active" if we are on /admin AND tab is overview (or no tab)
                        const isActive = link.path === '/admin' 
                            ? (pathname === '/admin' && activeTab === 'overview')
                            : pathname === link.path;

                        return (
                            <Link
                                key={link.path}
                                href={link.path}
                                onClick={(e) => {
                                    if (link.path === '/admin') {
                                        e.preventDefault();
                                        router.push('/admin'); // This will clear query params
                                    }
                                }}
                                className={`text-xs font-bold transition-all uppercase tracking-widest ${
                                    isActive 
                                        ? 'text-slate-900 dark:text-white border-b-2 border-[#F26C22] pb-1' 
                                        : 'text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    
                    <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Settings className="h-5 w-5" />
                    </button>

                    <div className="h-10 w-10 rounded-xl bg-[#F26C22]/10 flex items-center justify-center text-xs font-black text-[#F26C22] border border-[#F26C22]/20 cursor-pointer hover:bg-[#F26C22] hover:text-white transition-all shadow-lg shadow-orange-500/5">
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                </div>
            </div>
        </nav>
    );
}

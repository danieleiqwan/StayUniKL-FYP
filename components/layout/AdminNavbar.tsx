'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Bell, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useData } from '@/context/DataContext';

export default function AdminNavbar() {
    const { user, logout } = useAuth();
    const { unreadNotificationsCount } = useData();
    const pathname = usePathname();

    const navLinks = [
        { name: 'Admin Dashboard', path: '/admin' },
        { name: 'Students', path: '/admin/students' },
        { name: 'Rooms', path: '/admin/rooms' },
        { name: 'Finances', path: '/admin/billing' },
        { name: 'Assets', path: '/admin/assets' },
        { name: 'Documents', path: '/admin/documents' },
        { name: 'Announcements', path: '/admin/announcements' },
        { name: 'Reports', path: '/admin/reports' },
    ];

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#1E1B2E]/60 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto px-10">
                <div className="flex h-16 items-center justify-between">
                    
                    {/* Simplified Navigation Links */}
                    <div className="flex items-center gap-6 lg:gap-8">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${
                                        isActive 
                                            ? 'text-[#F26C22]' 
                                            : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#F26C22] rounded-full shadow-[0_0_8px_rgba(242,108,34,0.5)]"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Actions Area */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                            <ThemeToggle />
                            
                            <div className="flex items-center gap-4">
                                <Link 
                                    href="/admin/profile" 
                                    className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-[#F26C22] hover:bg-orange-500/10 transition-all"
                                >
                                    <User className="h-4 w-4" />
                                </Link>

                                <button
                                    onClick={logout}
                                    className="h-9 w-9 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-all group"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Info, X, Megaphone, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type Priority = 'urgent' | 'important' | 'general';
type Category = 'maintenance' | 'billing' | 'events' | 'general' | 'emergency';

interface Announcement {
    id: string;
    title: string;
    message: string;
    category: Category;
    priority: Priority;
    expires_at: string | null;
    created_at: string;
    is_poster?: number;
}

const PRIORITY_STYLE: Record<Priority, { bg: string; icon: React.ReactNode; text: string; btn: string; circle: string }> = {
    urgent: {
        bg: 'bg-gradient-to-br from-rose-600 via-red-500 to-orange-600 shadow-xl shadow-red-500/20',
        icon: <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30"><AlertTriangle className="h-6 w-6 text-white" /></div>,
        text: 'text-white',
        btn: 'bg-white text-red-600 hover:bg-red-50 shadow-lg shadow-black/5',
        circle: 'bg-white/10',
    },
    important: {
        bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-[#F26C22] shadow-xl shadow-orange-500/20',
        icon: <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30"><Zap className="h-6 w-6 text-white" /></div>,
        text: 'text-white',
        btn: 'bg-white text-orange-600 hover:bg-orange-50 shadow-lg shadow-black/5',
        circle: 'bg-white/10',
    },
    general: {
        bg: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none',
        icon: <div className="h-12 w-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center border border-orange-100 dark:border-orange-800/50"><Info className="h-6 w-6 text-[#F26C22]" /></div>,
        text: 'text-slate-900 dark:text-white',
        btn: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-lg shadow-black/5',
        circle: 'bg-slate-100 dark:bg-slate-800/50',
    },
};

export default function AnnouncementsBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch('/api/announcements')
            .then(r => r.json())
            .then(d => { if (d.announcements) setAnnouncements(d.announcements); })
            .catch(() => {});

        try {
            const saved = JSON.parse(sessionStorage.getItem('dismissed_announcements') || '[]');
            setDismissed(new Set(saved));
        } catch {}
    }, []);

    const dismiss = (id: string) => {
        setDismissed(prev => {
            const next = new Set(prev);
            next.add(id);
            try { sessionStorage.setItem('dismissed_announcements', JSON.stringify([...next])); } catch {}
            return next;
        });
    };

    const visible = announcements.filter(a => !dismissed.has(a.id) && !a.is_poster);

    if (visible.length === 0) return null;

    return (
        <div className="space-y-4">
            {visible.map(a => {
                const style = PRIORITY_STYLE[a.priority] || PRIORITY_STYLE.general;
                return (
                    <div
                        key={a.id}
                        className={`relative ${style.bg} rounded-[2rem] overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 group animate-in slide-in-from-top-4`}
                    >
                        {/* Decorative background elements */}
                        <div className={`absolute -top-10 -right-10 h-32 w-32 ${style.circle} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className={`absolute -bottom-10 -left-10 h-32 w-32 ${style.circle} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>

                        <div className="flex items-center gap-6 relative z-10 flex-1">
                            <div className="shrink-0 animate-bounce-slow">
                                {style.icon}
                            </div>
                            <div className={style.text}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Official Announcement</span>
                                    <span className="h-1 w-1 rounded-full bg-current opacity-40"></span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{a.category}</span>
                                </div>
                                <h3 className="text-xl font-black leading-tight mb-1 uppercase tracking-tight">{a.title}</h3>
                                <p className="text-sm font-medium opacity-80 line-clamp-2 max-w-2xl leading-relaxed">{a.message}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 relative z-10 shrink-0">
                            <Link
                                href="/dashboard/announcements"
                                className={`px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 ${style.btn}`}
                            >
                                Read More
                            </Link>
                            <button
                                onClick={() => dismiss(a.id)}
                                className={`p-3.5 rounded-2xl transition-all border border-current/10 ${style.text} hover:bg-current/10`}
                                title="Dismiss"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

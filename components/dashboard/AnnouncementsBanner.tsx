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
}

const PRIORITY_STYLE: Record<Priority, { bg: string; icon: React.ReactNode; text: string; dismiss: string }> = {
    urgent: {
        bg: 'bg-gradient-to-r from-red-600 to-rose-500',
        icon: <AlertTriangle className="h-5 w-5 shrink-0" />,
        text: 'text-white',
        dismiss: 'bg-white/20 hover:bg-white/30 text-white',
    },
    important: {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        icon: <Zap className="h-5 w-5 shrink-0" />,
        text: 'text-white',
        dismiss: 'bg-white/20 hover:bg-white/30 text-white',
    },
    general: {
        bg: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700',
        icon: <Info className="h-5 w-5 shrink-0 text-[#F26C22]" />,
        text: 'text-slate-800 dark:text-white',
        dismiss: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400',
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

        // Restore dismissed from session storage
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

    const visible = announcements.filter(a => !dismissed.has(a.id));

    if (visible.length === 0) return null;

    return (
        <div className="space-y-3">
            {visible.map(a => {
                const style = PRIORITY_STYLE[a.priority];
                return (
                    <div
                        key={a.id}
                        className={`${style.bg} rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300`}
                    >
                        <div className={`flex items-center gap-3 flex-1 min-w-0 ${style.text}`}>
                            {style.icon}
                            <div className="min-w-0">
                                <p className="font-black text-sm truncate">{a.title}</p>
                                <p className="text-xs opacity-90 line-clamp-1 mt-0.5">{a.message}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Link
                                href="/dashboard/announcements"
                                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${style.dismiss}`}
                            >
                                View <ChevronRight className="h-3 w-3" />
                            </Link>
                            <button
                                onClick={() => dismiss(a.id)}
                                className={`p-1.5 rounded-lg transition-all ${style.dismiss}`}
                                title="Dismiss"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

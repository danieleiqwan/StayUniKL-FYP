'use client';

import { useState, useEffect } from 'react';
import { Megaphone, AlertTriangle, Zap, Info, Clock, Tag, Calendar } from 'lucide-react';

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

const PRIORITY_CONFIG: Record<Priority, { label: string; badge: string; icon: React.ReactNode; border: string }> = {
    urgent:    { label: 'Urgent',    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',      icon: <AlertTriangle className="h-4 w-4" />, border: 'border-l-4 border-red-500' },
    important: { label: 'Important', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Zap className="h-4 w-4" />,          border: 'border-l-4 border-amber-500' },
    general:   { label: 'General',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   icon: <Info className="h-4 w-4" />,          border: 'border-l-4 border-blue-400' },
};

const CATEGORY_LABELS: Record<Category, string> = {
    maintenance: 'Maintenance',
    billing:     'Billing',
    events:      'Events',
    general:     'General',
    emergency:   'Emergency',
};

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Priority | 'all'>('all');

    useEffect(() => {
        fetch('/api/announcements')
            .then(r => r.json())
            .then(d => { if (d.announcements) setAnnouncements(d.announcements); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? announcements : announcements.filter(a => a.priority === filter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors flex items-center gap-3">
                    <span className="h-8 w-8 bg-[#F26C22]/10 rounded-lg flex items-center justify-center">
                        <Megaphone className="h-5 w-5 text-[#F26C22]" />
                    </span>
                    Announcements
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Official notices and updates from UniKL hostel management.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {(['all', 'urgent', 'important', 'general'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            filter === f
                                ? 'bg-[#F26C22] text-white border-[#F26C22] shadow-md shadow-orange-500/20'
                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/50'
                        }`}
                    >
                        {f === 'all' ? 'All' : f}
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {f === 'all' ? announcements.length : announcements.filter(a => a.priority === f).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 animate-pulse">
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4 mb-3" />
                            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                        <Megaphone className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No announcements</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {filter === 'all' ? "You're all caught up! Check back later." : `No ${filter} announcements at this time.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(a => {
                        const pCfg = PRIORITY_CONFIG[a.priority];
                        return (
                            <div key={a.id} className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden ${pCfg.border} transition-colors`}>
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${pCfg.badge}`}>
                                            {pCfg.icon} {pCfg.label}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                            <Tag className="h-3 w-3" /> {CATEGORY_LABELS[a.category]}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{a.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{a.message}</p>
                                    <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {new Date(a.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {a.expires_at && (
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Until {new Date(a.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

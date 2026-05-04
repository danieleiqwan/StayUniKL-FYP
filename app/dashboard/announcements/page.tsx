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
                <div className="grid grid-cols-1 gap-6">
                    {filtered.map(a => {
                        const pCfg = PRIORITY_CONFIG[a.priority] || PRIORITY_CONFIG.general;
                        return (
                            <div key={a.id} className="group relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500">
                                {/* Side Accent */}
                                <div className={`absolute left-0 top-0 bottom-0 w-2 ${pCfg.label === 'Urgent' ? 'bg-rose-500' : pCfg.label === 'Important' ? 'bg-amber-500' : 'bg-blue-400'}`} />
                                
                                <div className="p-8 md:p-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${pCfg.badge}`}>
                                                    {pCfg.icon} {pCfg.label}
                                                </span>
                                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">
                                                    <Tag className="h-3 w-3" /> {CATEGORY_LABELS[a.category]}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight leading-tight group-hover:text-[#F26C22] transition-colors">
                                                {a.title}
                                            </h3>
                                            
                                            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-6">
                                                {a.message}
                                            </p>
                                            
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                                                    <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">Posted On</span>
                                                        <span className="text-xs font-bold whitespace-nowrap">
                                                            {new Date(a.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {a.expires_at && (
                                                    <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                                                        <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-rose-400">
                                                            <Calendar className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] font-black uppercase tracking-tighter opacity-50 text-rose-400/70">Valid Until</span>
                                                            <span className="text-xs font-bold whitespace-nowrap">
                                                                {new Date(a.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Optional Action or Icon */}
                                        <div className="shrink-0 flex items-center justify-center md:h-full">
                                            <div className="h-20 w-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700/50 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/10 group-hover:border-orange-100 dark:group-hover:border-orange-900/30 transition-all duration-500">
                                                <Megaphone className="h-8 w-8 text-slate-200 dark:text-slate-700 group-hover:text-[#F26C22] transition-colors duration-500" />
                                            </div>
                                        </div>
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

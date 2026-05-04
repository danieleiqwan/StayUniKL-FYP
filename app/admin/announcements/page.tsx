'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import {
    Megaphone, Plus, X, Trash2, Eye, EyeOff, AlertTriangle,
    Info, Zap, Calendar, Tag, Bell, CheckCircle2, Clock, Loader2
} from 'lucide-react';

type Priority = 'urgent' | 'important' | 'general';
type Category = 'maintenance' | 'billing' | 'events' | 'general' | 'emergency';

interface Announcement {
    id: string;
    title: string;
    message: string;
    category: Category;
    priority: Priority;
    is_active: number;
    expires_at: string | null;
    created_at: string;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; badge: string; icon: React.ReactNode; border: string }> = {
    urgent:    { label: 'Urgent',    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',     icon: <AlertTriangle className="h-4 w-4" />, border: 'border-l-4 border-red-500' },
    important: { label: 'Important', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Zap className="h-4 w-4" />,          border: 'border-l-4 border-amber-500' },
    general:   { label: 'General',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',  icon: <Info className="h-4 w-4" />,          border: 'border-l-4 border-blue-500' },
};

const CATEGORY_CONFIG: Record<Category, { label: string; color: string }> = {
    maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    billing:     { label: 'Billing',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    events:      { label: 'Events',      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    general:     { label: 'General',     color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    emergency:   { label: 'Emergency',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const inputCls = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-white focus:border-[#F26C22] focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function AdminAnnouncementsPage() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [migrateMsg, setMigrateMsg] = useState('');
    const [form, setForm] = useState({
        title: '', message: '', category: 'general' as Category,
        priority: 'general' as Priority, expiresAt: '', sendNotification: true,
    });

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/announcements');
            const data = await res.json();
            if (data.announcements) setAnnouncements(data.announcements);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const handleMigrate = async () => {
        setMigrating(true);
        setMigrateMsg('');
        try {
            const res = await fetch('/api/admin/migrate/announcements', { method: 'POST' });
            const data = await res.json();
            setMigrateMsg(data.success ? '✅ Table ready!' : `❌ ${data.error}`);
            if (data.success) fetchAnnouncements();
        } catch { setMigrateMsg('❌ Network error'); }
        finally { setMigrating(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, expiresAt: form.expiresAt || null }),
            });
            if (res.ok) {
                setForm({ title: '', message: '', category: 'general', priority: 'general', expiresAt: '', sendNotification: true });
                setShowForm(false);
                fetchAnnouncements();
            }
        } catch (e) { console.error(e); }
        finally { setSubmitting(false); }
    };

    const handleToggle = async (id: string, current: number) => {
        await fetch('/api/announcements', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_active: current ? 0 : 1 }),
        });
        fetchAnnouncements();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this announcement?')) return;
        await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
        fetchAnnouncements();
    };

    if (!user || user.role !== 'admin') return <div className="p-10 text-center text-slate-500">Access Denied.</div>;

    const active = announcements.filter(a => a.is_active);
    const inactive = announcements.filter(a => !a.is_active);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-5xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#F26C22]/10 rounded-xl flex items-center justify-center">
                                <Megaphone className="h-6 w-6 text-[#F26C22]" />
                            </div>
                            Announcements
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Broadcast messages to all residents.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleMigrate}
                            disabled={migrating}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#F26C22] transition-all"
                        >
                            {migrating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Setup DB
                        </button>
                        {migrateMsg && <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{migrateMsg}</span>}
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 bg-[#F26C22] text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-[#d65a16] transition-all text-sm"
                        >
                            <Plus className="h-4 w-4" />
                            New Announcement
                        </button>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total', value: announcements.length, color: 'text-slate-900 dark:text-white' },
                        { label: 'Live Now', value: active.length, color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Archived', value: inactive.length, color: 'text-slate-400' },
                    ].map(s => (
                        <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center shadow-sm">
                            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Compose Form */}
                {showForm && (
                    <div className="bg-white dark:bg-slate-900 border border-[#F26C22]/30 rounded-2xl shadow-lg p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compose Announcement</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })} className={inputCls}>
                                        <option value="general">General</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="billing">Billing</option>
                                        <option value="events">Events</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                </div>
                                {/* Priority */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })} className={inputCls}>
                                        <option value="general">General</option>
                                        <option value="important">Important</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Title</label>
                                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Water Supply Interruption on 6 May" className={inputCls} />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Message</label>
                                <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Provide full details of the announcement..." className={`${inputCls} resize-none`} />
                            </div>

                            {/* Expiry */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Expiry Date <span className="text-slate-300 dark:text-slate-600 font-normal">(optional)</span></label>
                                <input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className={inputCls} />
                            </div>

                            {/* Notification toggle */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.sendNotification ? 'bg-[#F26C22]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    <div className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform duration-200 ${form.sendNotification ? 'translate-x-5' : 'translate-x-0'}`} />
                                    <input type="checkbox" className="sr-only" checked={form.sendNotification} onChange={e => setForm({ ...form, sendNotification: e.target.checked })} />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Bell className="h-4 w-4 text-[#F26C22]" /> Push to student notifications</span>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Sends an in-app notification to all residents.</p>
                                </div>
                            </label>

                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-[#F26C22] text-white px-8 py-2.5 text-sm font-bold rounded-xl hover:bg-[#d65a16] disabled:opacity-50 transition-all shadow-md shadow-orange-500/10">
                                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</> : <><Megaphone className="h-4 w-4" /> Publish</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Announcements List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-[#F26C22]" />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <Megaphone className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                        <p className="text-lg font-bold text-slate-900 dark:text-white">No announcements yet</p>
                        <p className="text-sm text-slate-400 mt-1">Click "New Announcement" to publish your first one.</p>
                        <p className="text-xs text-amber-500 mt-3 font-semibold">If you get an error, click "Setup DB" first to create the table.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Active */}
                        {active.length > 0 && (
                            <div>
                                <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Announcements ({active.length})
                                </h2>
                                <div className="space-y-3">
                                    {active.map(a => <AnnouncementCard key={a.id} a={a} onToggle={handleToggle} onDelete={handleDelete} />)}
                                </div>
                            </div>
                        )}

                        {/* Archived */}
                        {inactive.length > 0 && (
                            <div>
                                <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Archived ({inactive.length})
                                </h2>
                                <div className="space-y-3 opacity-60">
                                    {inactive.map(a => <AnnouncementCard key={a.id} a={a} onToggle={handleToggle} onDelete={handleDelete} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function AnnouncementCard({ a, onToggle, onDelete }: { a: Announcement; onToggle: (id: string, cur: number) => void; onDelete: (id: string) => void }) {
    const pCfg = PRIORITY_CONFIG[a.priority];
    const cCfg = CATEGORY_CONFIG[a.category];
    const isExpired = a.expires_at && new Date(a.expires_at) < new Date();

    return (
        <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm ${pCfg.border} overflow-hidden`}>
            <div className="p-5 flex gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${pCfg.badge}`}>
                            {pCfg.icon}{pCfg.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${cCfg.color}`}>
                            <Tag className="h-3 w-3" />{cCfg.label}
                        </span>
                        {isExpired && <span className="text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">Expired</span>}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{a.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{a.message}</p>
                    <div className="flex items-center gap-4 mt-3">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(a.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {a.expires_at && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expires {new Date(a.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                    <button
                        onClick={() => onToggle(a.id, a.is_active)}
                        title={a.is_active ? 'Deactivate' : 'Activate'}
                        className={`p-2 rounded-xl transition-all ${a.is_active ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100' : 'text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        {a.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => onDelete(a.id)}
                        title="Delete"
                        className="p-2 rounded-xl text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

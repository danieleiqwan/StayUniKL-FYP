'use client';

import { useState, useEffect } from 'react';
import {
    GraduationCap, Plus, Pencil, Trash2, CheckCircle2,
    AlertCircle, Calendar, BookOpen, Zap, X, Save, Loader2
} from 'lucide-react';

interface Semester {
    id: string;
    name: string;
    type: 'LONG' | 'SHORT';
    start_date: string;
    end_date: string;
    is_active: number;
}

function getStatus(sem: Semester): { label: string; color: string } {
    const now = new Date();
    const start = new Date(sem.start_date);
    const end = new Date(sem.end_date);
    if (sem.is_active && now >= start && now <= end) return { label: 'Active', color: 'emerald' };
    if (now < start) return { label: 'Upcoming', color: 'blue' };
    if (now > end) return { label: 'Completed', color: 'slate' };
    return { label: 'Active', color: 'emerald' };
}

const emptyForm = { name: '', type: 'LONG' as 'LONG' | 'SHORT', start_date: '', end_date: '', is_active: false };

export default function AcademicSettingsPage() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchSemesters = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/semesters');
            const data = await res.json();
            setSemesters(data.semesters || []);
        } catch {
            setMsg({ type: 'error', text: 'Failed to load semesters.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSemesters(); }, []);

    const openCreate = () => { setEditId(null); setForm(emptyForm); setMsg(null); setShowForm(true); };
    const openEdit = (sem: Semester) => {
        setEditId(sem.id);
        setForm({ name: sem.name, type: sem.type, start_date: sem.start_date.split('T')[0], end_date: sem.end_date.split('T')[0], is_active: !!sem.is_active });
        setMsg(null);
        setShowForm(true);
    };
    const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); setMsg(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const method = editId ? 'PUT' : 'POST';
            const body = editId ? { ...form, id: editId } : form;
            const res = await fetch('/api/semesters', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) { setMsg({ type: 'error', text: data.error }); return; }
            setMsg({ type: 'success', text: editId ? 'Semester updated successfully!' : 'Semester created successfully!' });
            await fetchSemesters();
            setTimeout(closeForm, 1200);
        } catch {
            setMsg({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSetActive = async (id: string) => {
        try {
            const res = await fetch('/api/semesters', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, setActiveOnly: true }) });
            const data = await res.json();
            if (!res.ok) { setMsg({ type: 'error', text: data.error }); return; }
            await fetchSemesters();
        } catch {
            setMsg({ type: 'error', text: 'Failed to set active semester.' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this semester? This action cannot be undone.')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/semesters?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) { setMsg({ type: 'error', text: data.error }); return; }
            await fetchSemesters();
        } catch {
            setMsg({ type: 'error', text: 'Failed to delete semester.' });
        } finally {
            setDeletingId(null);
        }
    };

    const activeSemester = semesters.find(s => s.is_active);

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-[#F26C22]/10 rounded-xl flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-[#F26C22]" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Academic Settings</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm ml-1">Manage university semester configurations and academic calendar.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-6 py-3 bg-[#F26C22] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d65a16] transition-all shadow-lg shadow-orange-500/20 shrink-0">
                    <Plus className="h-4 w-4" /> New Semester
                </button>
            </div>

            {/* Global message */}
            {msg && !showForm && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${msg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                    {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    {msg.text}
                </div>
            )}

            {/* Active Semester Banner */}
            {activeSemester && (
                <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                        <Zap className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Currently Active Semester</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white truncate">{activeSemester.name}</p>
                        <p className="text-xs text-slate-500 font-medium">
                            {new Date(activeSemester.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                            &nbsp;→&nbsp;
                            {new Date(activeSemester.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        {activeSemester.type}
                    </span>
                </div>
            )}

            {/* Semester Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">All Semesters</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{semesters.length} semesters configured</p>
                </div>

                {loading ? (
                    <div className="p-20 flex items-center justify-center text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                        <span className="text-sm font-bold">Loading semesters...</span>
                    </div>
                ) : semesters.length === 0 ? (
                    <div className="p-20 text-center">
                        <BookOpen className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-sm">No semesters configured yet.</p>
                        <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Click "New Semester" to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {semesters.map((sem) => {
                                    const { label, color } = getStatus(sem);
                                    const colorMap: Record<string, string> = {
                                        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                                        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                                        slate: 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700',
                                    };
                                    return (
                                        <tr key={sem.id} className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${sem.is_active ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {sem.is_active && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />}
                                                    <p className="font-black text-slate-900 dark:text-white text-sm">{sem.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${sem.type === 'LONG' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'}`}>
                                                    {sem.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                                                    {new Date(sem.start_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    &nbsp;–&nbsp;
                                                    {new Date(sem.end_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colorMap[color]}`}>
                                                    {label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!sem.is_active && (
                                                        <button onClick={() => handleSetActive(sem.id)} className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-emerald-200 dark:border-emerald-800">
                                                            Set Active
                                                        </button>
                                                    )}
                                                    <button onClick={() => openEdit(sem)} className="p-2 rounded-xl text-slate-400 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(sem.id)} disabled={deletingId === sem.id} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:opacity-40">
                                                        {deletingId === sem.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{editId ? 'Edit Semester' : 'New Semester'}</h2>
                                <p className="text-xs text-slate-400 mt-1">Fill in the academic period details below.</p>
                            </div>
                            <button onClick={closeForm} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester Name</label>
                                <input type="text" required placeholder="e.g. Semester 1 2024/2025" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester Type</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'LONG' | 'SHORT' })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all appearance-none cursor-pointer">
                                    <option value="LONG">LONG — Full Academic Semester</option>
                                    <option value="SHORT">SHORT — Short / Inter Semester</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                                    <input type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                                    <input type="date" required value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer group">
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-[#F26C22]" />
                                <div>
                                    <p className="text-sm font-black text-slate-800 dark:text-white">Set as Active Semester</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">This will deactivate any currently active semester.</p>
                                </div>
                            </label>

                            {msg && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${msg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'}`}>
                                    {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                    {msg.text}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeForm} className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 py-4 rounded-2xl bg-[#F26C22] text-white text-sm font-black hover:bg-[#d65a16] transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60 uppercase tracking-widest">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

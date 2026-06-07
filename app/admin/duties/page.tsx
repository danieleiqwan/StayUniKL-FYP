'use client';

import { useState, useEffect } from 'react';
import { 
    CalendarDays, Plus, Pencil, Trash2, CheckCircle2, 
    AlertCircle, Clock, MapPin, User, Phone, X, Save, Loader2 
} from 'lucide-react';

interface DutySchedule {
    id: number;
    name: string;
    role: 'SRC' | 'Fellow';
    hostel_block: string;
    floor: string;
    duty_date: string;
    start_time: string;
    end_time: string;
    contact_number: string;
    status: 'active' | 'inactive';
}

const emptyForm = {
    name: '',
    role: 'SRC' as 'SRC' | 'Fellow',
    floor: '',
    duty_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    contact_number: '',
    status: 'active' as 'active' | 'inactive'
};

export default function AdminDutiesPage() {
    const [duties, setDuties] = useState<DutySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const today = new Date().toISOString().split('T')[0];

    const fetchDuties = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/duty-schedules');
            const data = await res.json();
            setDuties(data.dutySchedules || []);
        } catch {
            setMsg({ type: 'error', text: 'Failed to load duty schedules.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDuties();
    }, []);

    const openCreate = () => {
        setEditId(null);
        setForm(emptyForm);
        setMsg(null);
        setShowForm(true);
    };

    const openEdit = (duty: DutySchedule) => {
        setEditId(duty.id);
        setForm({
            name: duty.name,
            role: duty.role,
            floor: duty.floor,
            duty_date: duty.duty_date.split('T')[0],
            end_date: '',
            start_time: duty.start_time,
            end_time: duty.end_time,
            contact_number: duty.contact_number,
            status: duty.status
        });
        setMsg(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditId(null);
        setForm(emptyForm);
        setMsg(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const method = editId ? 'PUT' : 'POST';
            const body = editId ? { ...form, id: editId } : form;
            
            const res = await fetch('/api/duty-schedules', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
                setMsg({ type: 'error', text: data.error });
                return;
            }
            setMsg({ 
                type: 'success', 
                text: editId ? 'Duty schedule updated successfully!' : 'Duty schedule created successfully!' 
            });
            await fetchDuties();
            setTimeout(closeForm, 1200);
        } catch {
            setMsg({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this duty schedule?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/duty-schedules?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                setMsg({ type: 'error', text: data.error });
                return;
            }
            // Remove from selected list if deleted
            setSelectedIds(prev => prev.filter(x => x !== id));
            await fetchDuties();
        } catch {
            setMsg({ type: 'error', text: 'Failed to delete duty schedule.' });
        } finally {
            setDeletingId(null);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === duties.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(duties.map(d => d.id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected duty schedules?`)) return;
        
        setSaving(true);
        setMsg(null);
        try {
            const idsParam = selectedIds.join(',');
            const res = await fetch(`/api/duty-schedules?ids=${idsParam}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                setMsg({ type: 'error', text: data.error || 'Failed to delete selected schedules.' });
                return;
            }
            setMsg({ 
                type: 'success', 
                text: `Successfully deleted ${data.deletedCount || selectedIds.length} duty schedules.` 
            });
            setSelectedIds([]);
            await fetchDuties();
        } catch {
            setMsg({ type: 'error', text: 'Failed to delete selected duty schedules.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-[#F26C22]/10 rounded-xl flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-[#F26C22]" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">SRC & Fellow Duty Scheduler</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm ml-1">
                        Manage active governance duties, shifts, and block assignments for Student Council members and Fellows.
                    </p>
                </div>
                <button 
                    onClick={openCreate} 
                    className="flex items-center gap-2 px-6 py-3 bg-[#F26C22] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#d65a16] transition-all shadow-lg shadow-orange-500/20 shrink-0"
                >
                    <Plus className="h-4 w-4" /> Add Schedule
                </button>
            </div>

            {/* Global messages */}
            {msg && !showForm && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                    msg.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                }`}>
                    {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    {msg.text}
                </div>
            )}

            {/* Duty List Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between min-h-[85px]">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                <p className="text-sm font-black text-rose-500 uppercase tracking-widest">{selectedIds.length} Selected</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setSelectedIds([])}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all uppercase tracking-widest"
                                >
                                    Clear
                                </button>
                                <button 
                                    onClick={handleBulkDelete}
                                    disabled={saving || deletingId !== null}
                                    className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-md shadow-rose-500/10 disabled:opacity-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Duty Schedules</h2>
                            <p className="text-xs text-slate-400 mt-0.5">{duties.length} shifts scheduled</p>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-20 flex items-center justify-center text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                        <span className="text-sm font-bold">Loading schedules...</span>
                    </div>
                ) : duties.length === 0 ? (
                    <div className="p-20 text-center">
                        <CalendarDays className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-sm">No duty schedules configured yet.</p>
                        <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Click "Add Schedule" to log the first governance shift.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 w-12 text-left">
                                        <input
                                            type="checkbox"
                                            checked={duties.length > 0 && selectedIds.length === duties.length}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-slate-350 dark:border-slate-700 text-[#F26C22] focus:ring-[#F26C22] dark:focus:ring-orange-900/20 cursor-pointer bg-white dark:bg-slate-800 focus:outline-none"
                                        />
                                    </th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Floor</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {duties.map((duty) => {
                                    const isSRC = duty.role === 'SRC';
                                    const isSelected = selectedIds.includes(duty.id);
                                    
                                    return (
                                        <tr 
                                            key={duty.id} 
                                            className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                                                isSelected ? 'bg-orange-50/20 dark:bg-orange-950/10' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 w-12">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(duty.id)}
                                                    className="h-4 w-4 rounded border-slate-350 dark:border-slate-700 text-[#F26C22] focus:ring-[#F26C22] dark:focus:ring-orange-900/20 cursor-pointer bg-white dark:bg-slate-800 focus:outline-none"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-black text-slate-900 dark:text-white text-sm">{duty.name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                                    isSRC 
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-150' 
                                                        : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-150'
                                                }`}>
                                                    {duty.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span>Floor {duty.floor}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <p className="font-bold">{new Date(duty.duty_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    <p className="flex items-center gap-1 text-[10px] text-slate-400">
                                                        <Clock className="h-3 w-3" />
                                                        {duty.start_time.substring(0, 5)} - {duty.end_time.substring(0, 5)}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span>{duty.contact_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                                    duty.status === 'active' 
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-150' 
                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200'
                                                }`}>
                                                    {duty.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => openEdit(duty)} 
                                                        className="p-2 rounded-xl text-slate-400 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(duty.id)} 
                                                        disabled={deletingId === duty.id} 
                                                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:opacity-40"
                                                    >
                                                        {deletingId === duty.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{editId ? 'Edit Shift' : 'Schedule Shift'}</h2>
                                <p className="text-xs text-slate-400 mt-1">Assign SRC or Fellow member shifts to hostel blocks.</p>
                            </div>
                            <button onClick={closeForm} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">On-Duty Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Danial Iwan" 
                                    value={form.name} 
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                                    <select 
                                        value={form.role} 
                                        onChange={e => setForm({ ...form, role: e.target.value as 'SRC' | 'Fellow' })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="SRC">SRC (Student Council)</option>
                                        <option value="Fellow">Fellow (Warden/Staff)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. +6012-3456789" 
                                        value={form.contact_number} 
                                        onChange={e => setForm({ ...form, contact_number: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Floor Assignment</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Floor 3 or All" 
                                    value={form.floor} 
                                    onChange={e => setForm({ ...form, floor: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" 
                                />
                            </div>

                            {!editId ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                                        <input 
                                            type="date" 
                                            required 
                                            min={today}
                                            value={form.duty_date} 
                                            onChange={e => setForm({ ...form, duty_date: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date (Optional)</label>
                                        <input 
                                            type="date" 
                                            min={form.duty_date || today}
                                            value={form.end_date} 
                                            onChange={e => setForm({ ...form, end_date: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duty Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        min={today}
                                        value={form.duty_date} 
                                        onChange={e => setForm({ ...form, duty_date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" 
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                                    <input 
                                        type="time" 
                                        required 
                                        value={form.start_time} 
                                        onChange={e => setForm({ ...form, start_time: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                                    <input 
                                        type="time" 
                                        required 
                                        value={form.end_time} 
                                        onChange={e => setForm({ ...form, end_time: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                                <select 
                                    value={form.status} 
                                    onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="active">Active (On Duty Now / Upcoming)</option>
                                    <option value="inactive">Inactive (Cancelled / Off Duty)</option>
                                </select>
                            </div>

                            {msg && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                                    msg.type === 'success' 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' 
                                        : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                                }`}>
                                    {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                    {msg.text}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={closeForm} 
                                    className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="flex-1 py-4 rounded-2xl bg-[#F26C22] text-white text-sm font-black hover:bg-[#d65a16] transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-60 uppercase tracking-widest"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {saving ? 'Saving...' : editId ? 'Update' : 'Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

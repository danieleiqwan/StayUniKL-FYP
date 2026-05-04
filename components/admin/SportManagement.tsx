'use client';

import { useState } from 'react';
import { useData, Sport } from '@/context/DataContext';
import {
    Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Trophy,
    Feather, Circle, CircleDot, Dumbbell, Table2, Swords, Bike, Target, Waves,
    X, Check, AlertTriangle, Loader2
} from 'lucide-react';

const COLOR_THEMES = [
    { id: 'emerald', label: 'Emerald', swatch: 'bg-emerald-500' },
    { id: 'amber', label: 'Amber', swatch: 'bg-amber-500' },
    { id: 'orange', label: 'Orange', swatch: 'bg-orange-500' },
    { id: 'rose', label: 'Rose', swatch: 'bg-rose-500' },
    { id: 'blue', label: 'Blue', swatch: 'bg-blue-500' },
    { id: 'purple', label: 'Purple', swatch: 'bg-purple-500' },
    { id: 'cyan', label: 'Cyan', swatch: 'bg-cyan-500' },
    { id: 'teal', label: 'Teal', swatch: 'bg-teal-500' },
];

const SPORT_ICONS: Record<string, React.ElementType> = {
    Badminton: Feather,
    Volleyball: CircleDot,
    Basketball: Circle,
    Football: CircleDot,
    'Table Tennis': Table2,
    Gym: Dumbbell,
    Swimming: Waves,
    Cycling: Bike,
    Archery: Target,
    Fencing: Swords,
};
const DefaultIcon = Trophy;
const getSportIcon = (name: string): React.ElementType => SPORT_ICONS[name] || DefaultIcon;

const themeTextMap: Record<string, string> = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    orange: 'text-orange-600 dark:text-orange-400',
    rose: 'text-rose-600 dark:text-rose-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    teal: 'text-teal-600 dark:text-teal-400',
};
const themeBgMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    rose: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
    teal: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',
};

interface SportFormData { name: string; colorTheme: string; }
const defaultForm: SportFormData = { name: '', colorTheme: 'emerald' };

export default function SportManagement() {
    const { allSports, addSport, updateSport, deleteSport } = useData();

    const [showModal, setShowModal] = useState(false);
    const [editingSport, setEditingSport] = useState<Sport | null>(null);
    const [form, setForm] = useState<SportFormData>(defaultForm);
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 3500);
    };

    const openAdd = () => {
        setEditingSport(null);
        setForm(defaultForm);
        setShowModal(true);
    };

    const openEdit = (sport: Sport) => {
        setEditingSport(sport);
        setForm({ name: sport.name, colorTheme: sport.colorTheme });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        let result;
        if (editingSport) {
            result = await updateSport(editingSport.id, { name: form.name.trim(), colorTheme: form.colorTheme });
        } else {
            result = await addSport(form.name.trim(), form.colorTheme);
        }
        setSaving(false);
        if (result?.success) {
            showToast('success', editingSport ? `"${form.name}" updated.` : `"${form.name}" added!`);
            setShowModal(false);
        } else {
            showToast('error', result?.error || 'Something went wrong.');
        }
    };

    const handleToggle = async (sport: Sport) => {
        setTogglingId(sport.id);
        const result = await updateSport(sport.id, { isActive: !sport.isActive });
        setTogglingId(null);
        if (result?.success) {
            showToast('success', `"${sport.name}" ${sport.isActive ? 'disabled' : 'enabled'}.`);
        } else {
            showToast('error', result?.error || 'Failed to toggle sport.');
        }
    };

    const handleDelete = async (sport: Sport) => {
        if (!confirm(`Delete "${sport.name}"? This cannot be undone.`)) return;
        setDeletingId(sport.id);
        const result = await deleteSport(sport.id);
        setDeletingId(null);
        if (result?.success) {
            showToast('success', `"${sport.name}" deleted.`);
        } else if (result?.canDisable) {
            const shouldDisable = confirm(
                `${result.error}\n\nWould you like to disable it instead?`
            );
            if (shouldDisable) {
                await updateSport(sport.id, { isActive: false });
                showToast('success', `"${sport.name}" has been disabled.`);
            }
        } else {
            showToast('error', result?.error || 'Failed to delete.');
        }
    };

    return (
        <div className="space-y-4">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold animate-in slide-in-from-top-2 duration-300 ${
                    toast.type === 'success'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                }`}>
                    {toast.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {toast.text}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Sport Management</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{allSports.filter(s => s.isActive).length} active · {allSports.length} total</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-[#F26C22] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#d65a16] transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                >
                    <Plus className="h-4 w-4" /> Add Sport
                </button>
            </div>

            {/* Sports Grid */}
            {allSports.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-600 italic text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No sports configured yet. Add your first sport above.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allSports.map((sport) => {
                        const SportIcon = getSportIcon(sport.name);
                        const iconColor = themeTextMap[sport.colorTheme] || themeTextMap.orange;
                        const cardBg = themeBgMap[sport.colorTheme] || themeBgMap.orange;
                        const isTogglingThis = togglingId === sport.id;
                        const isDeletingThis = deletingId === sport.id;

                        return (
                            <div
                                key={sport.id}
                                className={`relative border rounded-2xl p-4 transition-all ${
                                    sport.isActive
                                        ? cardBg
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
                                }`}
                            >
                                {/* Active Badge */}
                                <div className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    sport.isActive
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                }`}>
                                    {sport.isActive ? 'Active' : 'Disabled'}
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${sport.isActive ? 'bg-white/70 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-900'}`}>
                                        <SportIcon className={`h-5 w-5 ${sport.isActive ? iconColor : 'text-slate-400'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{sport.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 capitalize">{sport.colorTheme}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Toggle Active/Disabled */}
                                    <button
                                        onClick={() => handleToggle(sport)}
                                        disabled={isTogglingThis}
                                        title={sport.isActive ? 'Disable' : 'Enable'}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-white/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border border-white/50 dark:border-slate-700 transition-all text-slate-600 dark:text-slate-300"
                                    >
                                        {isTogglingThis ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : sport.isActive ? (
                                            <><ToggleRight className="h-3.5 w-3.5 text-emerald-500" /> Disable</>
                                        ) : (
                                            <><ToggleLeft className="h-3.5 w-3.5 text-slate-400" /> Enable</>
                                        )}
                                    </button>

                                    {/* Edit */}
                                    <button
                                        onClick={() => openEdit(sport)}
                                        title="Edit Sport"
                                        className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border border-white/50 dark:border-slate-700 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(sport)}
                                        disabled={isDeletingThis}
                                        title="Delete Sport"
                                        className="p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border border-white/50 dark:border-slate-700 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                                    >
                                        {isDeletingThis ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-white">
                                    {editingSport ? 'Edit Sport' : 'Add New Sport'}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {editingSport ? `Editing "${editingSport.name}"` : 'Create a new sport for court booking'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Sport Name */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sport Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Table Tennis"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#F26C22] transition-all placeholder:font-normal placeholder:text-slate-400"
                                />
                            </div>

                            {/* Color Theme */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Color Theme</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {COLOR_THEMES.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setForm({ ...form, colorTheme: theme.id })}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                                                form.colorTheme === theme.id
                                                    ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20'
                                                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                            }`}
                                        >
                                            <div className={`h-6 w-6 rounded-full ${theme.swatch} ${form.colorTheme === theme.id ? 'ring-2 ring-offset-2 ring-[#F26C22]' : ''}`} />
                                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{theme.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            {form.name && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const Icon = getSportIcon(form.name);
                                            const iconCls = themeTextMap[form.colorTheme] || themeTextMap.orange;
                                            return <Icon className={`h-6 w-6 ${iconCls}`} />;
                                        })()}
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{form.name}</span>
                                        <div className={`ml-auto h-4 w-4 rounded-full ${COLOR_THEMES.find(t => t.id === form.colorTheme)?.swatch}`} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.name.trim()}
                                className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#F26C22] text-white hover:bg-[#d65a16] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                {editingSport ? 'Save Changes' : 'Add Sport'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

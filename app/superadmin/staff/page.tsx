'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    Users, UserPlus, ShieldCheck, ShieldOff, KeyRound, RefreshCw,
    Search, CheckCircle2, XCircle, Clock, AlertTriangle, X, Eye, EyeOff, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StaffStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'superadmin';
    is_active: number;
    last_login: string | null;
    created_at: string;
}

type ModalType = 'create' | 'suspend' | 'activate' | 'deactivate' | 'reset_password' | 'edit' | null;

interface ModalState {
    type: ModalType;
    staffId?: string;
}

export default function StaffManagementPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<ModalState>({ type: null });
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // Form states
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const fetchStaff = async (trigger = 'unknown') => {
        console.log(`[StaffPage] fetchStaff called. trigger=${trigger}`, new Error().stack?.split('\n')[2]?.trim());
        setLoading(true);
        try {
            const res = await fetch('/api/superadmin/staff');
            const data = await res.json();
            console.log(`[StaffPage] fetchStaff response. status=${res.status}`, data);
            if (res.ok && data.staff && data.staff.length > 0) {
                setStaff(data.staff);
            } else if (!res.ok) {
                console.error('[StaffPage] fetchStaff API error:', data.error);
            }
        } catch (e) {
            console.error('[StaffPage] fetchStaff threw:', e);
            showToast('Failed to load staff data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaff('mount'); }, []);

    // DEBUG: Log every time staff array changes
    useEffect(() => {
        console.log(`[StaffPage] staff changed. count=${staff.length}`, staff.map(s => s.email));
    }, [staff]);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const closeModal = () => {
        setModal({ type: null });
        setForm({ name: '', email: '', password: '' });
        setNewPassword('');
        setShowPassword(false);
        setSearch(''); // Clear any autofill contamination of the search input
    };

    const handleAction = async () => {
        const targetStaff = staff.find(s => s.id === modal.staffId);
        setActionLoading(true);
        try {
            let body: any = {};
            let method = 'PATCH';

            if (modal.type === 'create') {
                method = 'POST';
                body = { name: form.name, email: form.email, password: form.password };
            } else if (modal.type === 'suspend') {
                body = { id: modal.staffId, action: 'SUSPEND' };
            } else if (modal.type === 'activate') {
                body = { id: modal.staffId, action: 'ACTIVATE' };
            } else if (modal.type === 'deactivate') {
                body = { id: modal.staffId, action: 'DEACTIVATED' };
            } else if (modal.type === 'reset_password') {
                body = { id: modal.staffId, action: 'RESET_PASSWORD', newPassword };
            } else if (modal.type === 'edit') {
                body = { id: modal.staffId, action: 'UPDATE_DETAILS', name: form.name, email: form.email };
            }

            const res = await fetch('/api/superadmin/staff', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || 'Action failed.', 'error');
            } else {
                showToast(
                    modal.type === 'create' ? `Admin account for ${form.email} created.` :
                    modal.type === 'reset_password' ? 'Password has been reset.' :
                    `Account updated successfully.`,
                    'success'
                );
                closeModal();
                fetchStaff('post-action');
            }
        } catch (e) {
            showToast('Unexpected error. Please try again.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredStaff = useMemo(() => {
        return staff.filter(s => {
            const name = (s.name || '').toLowerCase();
            const email = (s.email || '').toLowerCase();
            const query = (search || '').toLowerCase();
            return name.includes(query) || email.includes(query);
        });
    }, [staff, search]);

    const getStatusBadge = (member: StaffMember) => {
        if (member.role === 'superadmin') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
                    <ShieldCheck className="h-3 w-3" /> Superadmin
                </span>
            );
        }
        if (member.is_active) {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Active
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <XCircle className="h-3 w-3" /> Suspended
            </span>
        );
    };

    const formatDate = (d: any) => {
        if (!d || typeof d !== 'string' || d.startsWith('0000')) return 'Never';
        const date = new Date(d);
        if (isNaN(date.getTime())) return 'Never';
        return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderRow = (member: StaffMember, i: number) => (
        <div key={member?.id || `fallback_${i}`}
            className={cn('grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.02]',
                i < filteredStaff.length - 1 && 'border-b border-zinc-100 dark:border-zinc-800/50')}
        >
            <div className="col-span-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-sm"
                    style={{
                        background: member?.role === 'superadmin' ? 'rgba(245,158,11,0.1)' : 'rgba(107,114,128,0.05)',
                        color: member?.role === 'superadmin' ? '#f59e0b' : '#6b7280'
                    }}>
                    {(member?.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{member?.name || 'Unknown'}</p>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">{member?.role || 'admin'}</p>
                </div>
            </div>
            <div className="col-span-3 text-sm text-zinc-500 dark:text-zinc-400 truncate">{member?.email || 'No email'}</div>
            <div className="col-span-2">{member ? getStatusBadge(member) : null}</div>
            <div className="col-span-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-600">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{formatDate(member?.last_login)}</span>
                </div>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2">
                {member?.role !== 'superadmin' && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); setForm({ name: member?.name || '', email: member?.email || '', password: '' }); setModal({ type: 'edit', staffId: member?.id }); }}
                            className="p-2 rounded-xl text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all" title="Edit Details">
                            <Users className="h-4 w-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'reset_password', staffId: member?.id }); }}
                            className="p-2 rounded-xl text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all" title="Reset Password">
                            <KeyRound className="h-4 w-4" />
                        </button>
                        {member?.is_active ? (
                            <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'suspend', staffId: member?.id }); }}
                                className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all" title="Suspend Account">
                                <ShieldOff className="h-4 w-4" />
                            </button>
                        ) : (
                            <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'activate', staffId: member?.id }); }}
                                className="p-2 rounded-xl text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all" title="Activate Account">
                                <ShieldCheck className="h-4 w-4" />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-8 lg:p-10 space-y-8 min-h-screen">
            {/* Toast */}
            {toast && (
                <div className={cn(
                    'fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-top-2 duration-300',
                    toast.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950 border border-rose-500/30 text-rose-600 dark:text-rose-300'
                )}>
                    {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-rose-500" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 shadow-sm">
                            <Users className="h-5 w-5 text-amber-500" />
                        </div>
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Staff Management</h1>
                    </div>
                    <p className="text-sm text-zinc-500 ml-12">Manage administrative accounts, access levels, and security.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchStaff} className="p-2.5 rounded-xl text-zinc-400 dark:text-slate-500 hover:text-amber-500 transition-all border border-zinc-200 dark:border-white/5 bg-white dark:bg-transparent shadow-sm dark:shadow-none">
                        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                    </button>
                    <button
                        onClick={() => setModal({ type: 'create' })}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all hover:opacity-90 active:scale-95 bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    >
                        <UserPlus className="h-4 w-4" />
                        New Admin
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Staff', value: staff.length, color: 'text-zinc-900 dark:text-white' },
                    { label: 'Active', value: staff.filter(s => s.is_active && s.role === 'admin').length, color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Suspended', value: staff.filter(s => !s.is_active).length, color: 'text-rose-600 dark:text-rose-400' },
                ].map(stat => (
                    <div key={stat.label} className="rounded-2xl p-5 border bg-zinc-50/50 dark:bg-slate-900/20 border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                        <p className="text-[10px] font-black text-zinc-400 dark:text-slate-600 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={cn('text-3xl font-black', stat.color)}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoComplete="off"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm bg-zinc-50 dark:bg-slate-900/40 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors shadow-sm dark:shadow-none"
                />
            </div>

            {/* Staff Table */}
            <div className="rounded-3xl border overflow-hidden bg-white dark:bg-white/[0.01] border-zinc-200 dark:border-zinc-800/50 shadow-sm dark:shadow-none">
                {/* DEBUG BADGE — remove after fix confirmed */}
                <div className="px-4 py-1 text-[10px] font-mono bg-yellow-100 text-yellow-800">
                    DEBUG: staff={staff.length} filtered={filteredStaff.length} loading={loading.toString()} modal={modal.type||'none'}
                </div>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-zinc-50/50 dark:bg-transparent text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest border-zinc-200 dark:border-zinc-800/50">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Last Login</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="relative">
                        <div className="absolute top-3 right-3 z-10">
                            <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                        </div>
                        {filteredStaff.length === 0 ? (
                            <div className="py-20 text-center text-zinc-400 font-bold">No staff members found.</div>
                        ) : (
                            filteredStaff.map((member, i) => renderRow(member, i))
                        )}
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="py-20 text-center text-zinc-400 font-bold">No staff members found.</div>
                ) : (
                    filteredStaff.map((member, i) => renderRow(member, i))
                )}
            </div>

            {/* Modal */}
            {modal.type && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-3xl border p-8 shadow-2xl animate-in zoom-in-95 duration-200 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/50">
                        
                        {/* Modal Header */}
                        <div className="flex items-start justify-between mb-6">
                            {(() => {
                                const targetStaff = staff.find(s => s.id === modal.staffId);
                                return (
                                    <>
                                        <div>
                                            <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                                                {modal.type === 'create' && 'Create Admin Account'}
                                                {modal.type === 'edit' && 'Edit Staff Details'}
                                                {modal.type === 'suspend' && 'Suspend Account'}
                                                {modal.type === 'activate' && 'Activate Account'}
                                                {modal.type === 'deactivate' && 'Deactivate Account'}
                                                {modal.type === 'reset_password' && 'Reset Password'}
                                            </h3>
                                            {targetStaff && <p className="text-xs text-zinc-500 mt-0.5">{targetStaff.email}</p>}
                                        </div>
                                    </>
                                );
                            })()}
                            <button onClick={closeModal} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        {(modal.type === 'create' || modal.type === 'edit') && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">Full Name</label>
                                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="e.g. Ahmad Razif"
                                        autoComplete="off"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Email Address</label>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="admin@stayunikl.edu.my"
                                        autoComplete="off"
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors" />
                                </div>
                                {modal.type === 'create' && (
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Password (min. 8 chars)</label>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                                placeholder="••••••••••••"
                                                autoComplete="new-password"
                                                className="w-full px-4 py-3 pr-12 rounded-xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors" />
                                            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-slate-300 transition-colors">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {modal.type === 'reset_password' && (
                            <div>
                                <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">New Password (min. 8 chars)</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        autoComplete="new-password"
                                        className="w-full px-4 py-3 pr-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/50 transition-colors" />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {(modal.type === 'suspend' || modal.type === 'deactivate' || modal.type === 'activate') && (
                            <div className="flex items-start gap-4 p-4 rounded-2xl border bg-zinc-50 dark:bg-transparent border-zinc-200 dark:border-zinc-800"
                                style={{
                                    background: modal.type === 'activate' ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                                    borderColor: modal.type === 'activate' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
                                }}>
                                <AlertTriangle className={cn('h-5 w-5 shrink-0 mt-0.5', modal.type === 'activate' ? 'text-emerald-500' : 'text-rose-500')} />
                                <div>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                                        {modal.type === 'activate' ? 'Restore access?' : 'Are you sure?'}
                                    </p>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        {(() => {
                                            const targetStaff = staff.find(s => s.id === modal.staffId);
                                            if (modal.type === 'suspend') return `This will immediately block ${targetStaff?.name} from logging in. All their active sessions will become invalid.`;
                                            if (modal.type === 'activate') return `This will restore ${targetStaff?.name}'s access to the admin panel.`;
                                            if (modal.type === 'deactivate') return `This will permanently deactivate ${targetStaff?.name}'s account. Their data will be preserved for audit purposes.`;
                                            return null;
                                        })()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="flex items-center gap-3 mt-8">
                            <button onClick={(e) => { e.stopPropagation(); closeModal(); }} className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={actionLoading}
                                className={cn(
                                    'flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2',
                                    modal.type === 'activate' && 'bg-emerald-600 hover:bg-emerald-500 text-white',
                                    (modal.type === 'suspend' || modal.type === 'deactivate') && 'bg-rose-600 hover:bg-rose-500 text-white',
                                    (modal.type === 'create' || modal.type === 'edit' || modal.type === 'reset_password') && 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90',
                                )}
                            >
                                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <>
                                        {modal.type === 'create' && 'Create Account'}
                                        {modal.type === 'edit' && 'Save Changes'}
                                        {modal.type === 'suspend' && 'Suspend Account'}
                                        {modal.type === 'activate' && 'Restore Access'}
                                        {modal.type === 'deactivate' && 'Deactivate'}
                                        {modal.type === 'reset_password' && 'Reset Password'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

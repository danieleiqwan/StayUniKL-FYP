'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useEffect, useState } from 'react';
import {
    Shield,
    User,
    Mail,
    Phone,
    Clock,
    Activity,
    Database,
    Users,
    AlertTriangle,
    CheckCircle,
    ArrowUpRight,
    Search,
    Loader2,
    Key,
    X,
    Eye,
    EyeOff,
    Lock,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminProfilePage() {
    const { user } = useAuth();
    const { applications, complaints, courtBookings } = useData();
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
    const [toggles, setToggles] = useState({ twoFactor: false, notifications: true });
    const [updatingPrefs, setUpdatingPrefs] = useState(false);

    // Change Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [passMsg, setPassMsg] = useState<{type: 'success' | 'error' | null, text: string}>({type: null, text: ''});

    useEffect(() => {
        if (user) {
            setToggles({
                twoFactor: !!user.twoFactorEnabled,
                notifications: !!user.notificationsEnabled
            });
        }
    }, [user]);

    const handleToggle = async (type: 'twoFactor' | 'notifications') => {
        const newValue = !toggles[type];
        setToggles(prev => ({ ...prev, [type]: newValue }));
        setUpdatingPrefs(true);
        try {
            await fetch('/api/admin/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    twoFactorEnabled: type === 'twoFactor' ? newValue : undefined,
                    notificationsEnabled: type === 'notifications' ? newValue : undefined
                })
            });
        } catch (e) {
            console.error('Failed to update preferences');
            setToggles(prev => ({ ...prev, [type]: !newValue })); // Revert on error
        } finally {
            setUpdatingPrefs(false);
        }
    };

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return;

        // Fetch recent audit logs for this admin
        fetch(`/api/admin/audit-logs?actorId=${user.id}&limit=10`)
            .then(res => res.json())
            .then(data => {
                if (data.logs) setAuditLogs(data.logs);
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingLogs(false));
    }, [user]);

    // Password Validation Rules
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
    const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;
    const isMatching = newPassword === confirmPassword && confirmPassword.length > 0;
    const isNotSameAsOld = currentPassword !== newPassword && newPassword.length > 0;
    const canSubmitPass = isPasswordValid && isMatching && isNotSameAsOld && currentPassword.length > 0;

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmitPass) return;
        setPassLoading(true);
        setPassMsg({ type: null, text: '' });
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                setPassMsg({ type: 'error', text: data.error || 'Failed to update password.' });
                setPassLoading(false);
            } else {
                setPassMsg({ type: 'success', text: 'Password secured successfully!' });
                setPassLoading(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setShowPasswordModal(false), 2000);
            }
        } catch (error) {
            setPassMsg({ type: 'error', text: 'An unexpected network error occurred.' });
            setPassLoading(false);
        }
    };

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return <div className="p-10 text-center">Access Denied. Admins only.</div>;
    }

    // Derived Stats
    const pendingApps = applications.filter(a => a.status === 'Pending').length;
    const openComplaints = complaints.filter(c => c.status !== 'Resolved').length;
    const bookingsToday = courtBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length;

    return (
        <div className="flex-1">

            {/* Premium Header Banner */}
            <div className="relative bg-[#F26C22] h-48 md:h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F26C22] to-orange-600 opacity-90"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center border-4 border-white dark:border-slate-800 rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <Shield className="h-12 w-12 md:h-16 md:w-16 text-[#F26C22]" />
                            )}
                        </div>
                        <div className="text-center md:text-left text-white">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border border-white/30">
                                    {user.role === 'superadmin' ? 'Master Administrator' : 'System Administrator'}
                                </span>
                                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{user.name}</h1>
                            <p className="text-orange-100 opacity-80 flex items-center justify-center md:justify-start gap-2 mt-1">
                                <Mail className="h-4 w-4" /> {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-20 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Sidebar Stats & Info */}
                    <div className="space-y-6">
                        {/* Quick Metrics */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl shadow-orange-500/5 border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Activity className="h-3 w-3" /> System Oversight
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/50">
                                    <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase mb-1">Pending Apps</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingApps}</p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Open Issues</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{openComplaints}</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/50">
                                    <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase mb-1">Bookings Today</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{bookingsToday}</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Uptime</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">99.9%</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-500/5 border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Security & Access</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded text-green-600 dark:text-green-400">
                                            <Shield className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Status</span>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Verified</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                                            <Database className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Access Level</span>
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-0.5 rounded-full border",
                                        user.role === 'superadmin' 
                                            ? "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800" 
                                            : "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                                    )}>
                                        {user.role === 'superadmin' ? 'Level 0 (Superadmin)' : 'Level 1 (Admin)'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-[#F26C22] dark:text-orange-400">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Session Timeout</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">2h 45m</span>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 dark:hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                View Full Security Audit <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tab Headers */}
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl shadow-slate-500/5 border border-slate-200 dark:border-slate-800 flex gap-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                Profile Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'activity' ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'}`}
                            >
                                Recent Activity Log
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-500/5 border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px]">
                            {activeTab === 'overview' && (
                                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <section>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Administrative Identification</h3>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <InfoRow label="Admin Name" value={user.name} icon={<User className="h-4 w-4" />} />
                                            <InfoRow label="Admin ID" value={user.id} icon={<Shield className="h-4 w-4" />} />
                                            <InfoRow label="Work Email" value={user.email} icon={<Mail className="h-4 w-4" />} />
                                            <InfoRow label="Contact Phone" value={user.phoneNumber || 'Not Set'} icon={<Phone className="h-4 w-4" />} />
                                            <InfoRow label="Department" value="Student Affairs & Residential" icon={<Users className="h-4 w-4" />} />
                                            <InfoRow 
                                                label="Date of Activation" 
                                                value={(() => {
                                                    const d = user.createdAt ? new Date(user.createdAt) : null;
                                                    if (!d || isNaN(d.getTime())) return 'Unknown';
                                                    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                                })()} 
                                                icon={<Clock className="h-4 w-4" />} 
                                            />
                                        </div>
                                    </section>

                                    <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">System Preferences</h3>
                                        <div className="space-y-4">
                                            {/* Account Password */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Account Password</p>
                                                    <p className="text-xs text-slate-500">Update your administrator password.</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setPassMsg({type: null, text: ''});
                                                        setShowPasswordModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg shadow hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
                                                >
                                                    <Key className="h-3.5 w-3.5" />
                                                    Change Password
                                                </button>
                                            </div>
                                            
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Two-Factor Authentication</p>
                                                    <p className="text-xs text-slate-500">Adds an extra layer of security to your admin account.</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleToggle('twoFactor')}
                                                    disabled={updatingPrefs}
                                                    className={cn(
                                                        "h-6 w-11 rounded-full relative transition-colors duration-300",
                                                        toggles.twoFactor ? "bg-[#F26C22]" : "bg-slate-300 dark:bg-slate-700"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-4 w-4 bg-white rounded-full absolute top-1 transition-all duration-300",
                                                        toggles.twoFactor ? "right-1" : "left-1"
                                                    )}></div>
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">System Notifications</p>
                                                    <p className="text-xs text-slate-500">Receive alerts for critical system events.</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleToggle('notifications')}
                                                    disabled={updatingPrefs}
                                                    className={cn(
                                                        "h-6 w-11 rounded-full relative transition-colors duration-300",
                                                        toggles.notifications ? "bg-[#F26C22]" : "bg-slate-300 dark:bg-slate-700"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-4 w-4 bg-white rounded-full absolute top-1 transition-all duration-300",
                                                        toggles.notifications ? "right-1" : "left-1"
                                                    )}></div>
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'activity' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full flex flex-col">
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-[#F26C22]" /> My Recent Actions
                                        </h3>
                                        <div className="relative">
                                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search logs..."
                                                className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto">
                                        {loadingLogs ? (
                                            <div className="p-10 text-center animate-pulse space-y-4">
                                                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mx-auto w-full max-w-lg"></div>
                                                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mx-auto w-full max-w-lg"></div>
                                                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mx-auto w-full max-w-lg"></div>
                                            </div>
                                        ) : auditLogs.length === 0 ? (
                                            <div className="p-20 text-center">
                                                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 font-bold border-2 border-dashed border-slate-200">?</div>
                                                <p className="text-slate-500 font-medium">No activity recorded for your account yet.</p>
                                                <p className="text-xs text-slate-400 mt-1">Actions like status updates and assignments will appear here.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {auditLogs.map((log: any) => (
                                                    <div key={log.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex gap-4">
                                                                <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${log.action.includes('Approved') || log.action.includes('Verified')
                                                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                                                                        : log.action.includes('Rejected') || log.action.includes('Cancelled')
                                                                            ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                                                                            : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'
                                                                    }`}>
                                                                    {log.action.includes('Approved') ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#F26C22] transition-colors">{log.action}</p>
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        Target: <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">{log.entity_type} {log.entity_id}</span>
                                                                    </p>
                                                                    {log.details && (
                                                                        <p className="text-[10px] text-slate-400 mt-1 italic">
                                                                            Data: {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-bold text-slate-400">{new Date(log.created_at).toLocaleDateString()}</p>
                                                                <p className="text-[10px] text-slate-300 font-medium">{new Date(log.created_at).toLocaleTimeString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                                        <button className="text-[10px] font-extrabold text-[#F26C22] uppercase tracking-widest hover:underline">
                                            Access Global Audit Ledger
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 relative">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
                                    <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white">Change Password</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure your account</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                            {passMsg.text && (
                                <div className={`flex items-start gap-3 p-4 rounded-2xl text-sm font-bold animate-in fade-in duration-200 ${passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'}`}>
                                    {passMsg.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />}
                                    <p>{passMsg.text}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Password</label>
                                <div className="relative">
                                    <input 
                                        type={showCurrent ? 'text' : 'password'}
                                        required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">New Password</label>
                                <div className="relative">
                                    <input 
                                        type={showNew ? 'text' : 'password'}
                                        required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <input 
                                        type={showConfirm ? 'text' : 'password'}
                                        required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 space-y-2">
                                <p className="text-[10px] uppercase font-black tracking-widest mb-2">Password Requirements</p>
                                <div className="flex gap-2 items-center"><Check className={`h-3.5 w-3.5 ${hasMinLength ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} /> At least 8 characters</div>
                                <div className="flex gap-2 items-center"><Check className={`h-3.5 w-3.5 ${hasUppercase ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} /> At least 1 uppercase letter</div>
                                <div className="flex gap-2 items-center"><Check className={`h-3.5 w-3.5 ${hasNumber ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} /> At least 1 number</div>
                                <div className="flex gap-2 items-center"><Check className={`h-3.5 w-3.5 ${hasSpecialChar ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} /> At least 1 special character</div>
                                <div className="flex gap-2 items-center pt-2 mt-2 border-t border-slate-200 dark:border-slate-700"><Check className={`h-3.5 w-3.5 ${isMatching ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} /> Passwords match</div>
                            </div>

                            <button
                                type="submit"
                                disabled={!canSubmitPass || passLoading}
                                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                {passLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                {passLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-sm">
            <div className="flex items-center gap-2 mb-1 text-slate-400">
                {icon}
                <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}

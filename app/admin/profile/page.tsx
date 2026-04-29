'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/layout/Navbar';
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
    Search
} from 'lucide-react';

export default function AdminProfilePage() {
    const { user } = useAuth();
    const { applications, complaints, courtBookings } = useData();
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');

    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        // Fetch recent audit logs for this admin
        fetch(`/api/admin/audit-logs?actorId=${user.id}&limit=10`)
            .then(res => res.json())
            .then(data => {
                if (data.logs) setAuditLogs(data.logs);
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingLogs(false));
    }, [user]);

    if (!user || user.role !== 'admin') {
        return <div className="p-10 text-center">Access Denied. Admins only.</div>;
    }

    // Derived Stats
    const pendingApps = applications.filter(a => a.status === 'Pending').length;
    const openComplaints = complaints.filter(c => c.status !== 'Resolved').length;
    const bookingsToday = courtBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />

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
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border border-white/30">System Administrator</span>
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
                                    <span className="text-xs font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Level 5 (Super)</span>
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
                                            <InfoRow label="Legal Name" value={user.name} icon={<User className="h-4 w-4" />} />
                                            <InfoRow label="Admin ID" value={user.id} icon={<Shield className="h-4 w-4" />} />
                                            <InfoRow label="Work Email" value={user.email} icon={<Mail className="h-4 w-4" />} />
                                            <InfoRow label="Contact Phone" value={user.phoneNumber || '+60 123-456-789'} icon={<Phone className="h-4 w-4" />} />
                                            <InfoRow label="Department" value="Student Affairs & Residential" icon={<Users className="h-4 w-4" />} />
                                            <InfoRow label="Date of Activation" value="January 2024" icon={<Clock className="h-4 w-4" />} />
                                        </div>
                                    </section>

                                    <section className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">System Preferences</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Two-Factor Authentication</p>
                                                    <p className="text-xs text-slate-500">Adds an extra layer of security to your admin account.</p>
                                                </div>
                                                <div className="h-6 w-11 bg-[#F26C22] rounded-full relative">
                                                    <div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">System Notifications</p>
                                                    <p className="text-xs text-slate-500">Receive alerts for critical system events.</p>
                                                </div>
                                                <div className="h-6 w-11 bg-slate-300 dark:bg-slate-700 rounded-full relative">
                                                    <div className="h-4 w-4 bg-white rounded-full absolute left-1 top-1"></div>
                                                </div>
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

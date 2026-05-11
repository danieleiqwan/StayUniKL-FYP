'use client';

import { useEffect, useState } from 'react';
import { 
    ShieldAlert, Users, Activity, 
    AlertTriangle, Clock, 
    TrendingUp, ShieldCheck, RefreshCw, BarChart3, Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/superadmin/analytics');
            const data = await res.json();
            console.log('Superadmin Analytics Debug:', { status: res.status, data });
            if (res.ok) {
                setStats(data);
            } else {
                console.error('Analytics API Error:', data.error);
            }
        } catch (e) {
            console.error('Failed to fetch dashboard stats', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const getUserStat = (role: string) => {
        if (!stats?.users || !Array.isArray(stats.users)) return { total: 0, active: 0, suspended: 0 };
        const found = stats.users.find((u: any) => u.role?.toLowerCase() === role.toLowerCase());
        return {
            total: Number(found?.total || 0),
            active: Number(found?.active || 0),
            suspended: Number(found?.suspended || 0)
        };
    };
    const studentStats = getUserStat('student');
    const adminStats = getUserStat('admin');

    return (
        <div className="p-8 lg:p-10 space-y-10 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg bg-amber-500"
                            style={{ boxShadow: '0 8px 24px rgba(245,158,11,0.2)' }}>
                            <ShieldAlert className="h-6 w-6 text-black" />
                        </div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight italic">Governance Terminal</h1>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-slate-500 ml-1">System-wide operational oversight & security monitoring.</p>
                </div>
                <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/5 text-zinc-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-500/5 transition-all text-xs font-black uppercase tracking-widest">
                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                    Refresh Pulse
                </button>
            </div>

            {/* Quick Pulse Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'System Pulse (24h)', value: stats?.activity24h || 0, icon: Activity, color: 'amber' },
                    { label: 'Total Students', value: studentStats.total, icon: Users, color: 'blue' },
                    { label: 'Active Admins', value: adminStats.active, icon: ShieldCheck, color: 'emerald' },
                    { label: 'Pending Issues', value: stats?.complaints?.reduce((acc: number, c: any) => acc + c.count, 0) || 0, icon: AlertTriangle, color: 'rose' }
                ].map((item, i) => (
                    <div key={i} className="group relative p-6 rounded-[2rem] border transition-all hover:scale-[1.02] hover:border-amber-500/30 overflow-hidden bg-zinc-50 dark:bg-slate-900/40 border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <item.icon className="h-24 w-24 text-zinc-900 dark:text-white" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-3">{item.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-4xl font-black text-zinc-900 dark:text-white leading-none">{(item.value || 0).toLocaleString()}</h3>
                            <div className={cn("p-2 rounded-lg", 
                                item.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
                                item.color === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                                item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-rose-500/10 text-rose-500'
                            )}>
                                <item.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Distribution */}
                <div className="lg:col-span-2 rounded-[2.5rem] border p-8 space-y-8 bg-zinc-50/50 dark:bg-slate-900/20 border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <Users className="h-5 w-5 text-amber-500" />
                            Staff & Student Matrix
                        </h4>
                        <TrendingUp className="h-4 w-4 text-zinc-300 dark:text-slate-700" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* Student Segment */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-slate-600 uppercase tracking-widest">Student Population</p>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-white">{studentStats.total}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Active Rate</p>
                                    <p className="text-sm font-black text-zinc-500 dark:text-slate-500">
                                        {Math.round((studentStats.active / (studentStats.total || 1)) * 100)}%
                                    </p>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-zinc-200 dark:bg-slate-950 rounded-full overflow-hidden flex">
                                <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" style={{ width: `${(studentStats.active / (studentStats.total || 1)) * 100}%` }} />
                                <div className="h-full bg-rose-500/50" style={{ width: `${(studentStats.suspended / (studentStats.total || 1)) * 100}%` }} />
                            </div>
                            <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500"><div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Active</span>
                                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-500"><div className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Suspended</span>
                            </div>
                        </div>

                        {/* Staff Segment */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-slate-600 uppercase tracking-widest">Administrative Force</p>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-white">{adminStats.total}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Master Users</p>
                                    <p className="text-sm font-black text-zinc-500 dark:text-slate-500">{getUserStat('superadmin').total}</p>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-zinc-200 dark:bg-slate-950 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${(adminStats.active / (adminStats.total || 1)) * 100}%` }} />
                            </div>
                            <p className="text-[9px] font-bold text-zinc-400 dark:text-slate-600 uppercase tracking-wider italic">
                                All staff actions are recorded in the security audit.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Latest Audit Activity */}
                <div className="rounded-[2.5rem] border p-8 space-y-6 bg-zinc-50/50 dark:bg-slate-900/20 border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-zinc-400 dark:text-slate-500" />
                            Activity Feed
                        </h4>
                        <div className="px-2 py-1 rounded-md bg-zinc-200 dark:bg-slate-950 text-[8px] font-black text-zinc-500 dark:text-slate-600 uppercase tracking-widest">
                            Live
                        </div>
                    </div>

                    <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-200 dark:before:white/5">
                        {stats?.recentEvents?.map((event: any, i: number) => (
                            <div key={i} className="relative pl-8 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="absolute left-0 top-1.5 h-6 w-6 rounded-lg bg-white dark:bg-slate-950 border border-zinc-200 dark:border-white/5 flex items-center justify-center z-10 shadow-sm">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                                </div>
                                <p className="text-[10px] font-black text-zinc-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{event.actor_name}</p>
                                <p className="text-xs font-bold text-zinc-700 dark:text-slate-200 line-clamp-1">{event.action}</p>
                                <p className="text-[9px] font-medium text-zinc-400 dark:text-slate-600 mt-1">
                                    {event.created_at ? (() => {
                                        const d = new Date(event.created_at);
                                        return isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    })() : '—'}
                                </p>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => window.location.href = '/superadmin/audit'}
                        className="w-full py-3 rounded-2xl bg-white dark:bg-slate-950/50 border border-zinc-200 dark:border-white/5 text-[10px] font-black text-zinc-400 dark:text-slate-500 uppercase tracking-widest hover:text-amber-500 dark:hover:text-white hover:border-amber-500/20 transition-all shadow-sm dark:shadow-none">
                        View Complete Logs
                    </button>
                </div>
            </div>

            {/* Application & Maintenance Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Maintenance Monitor */}
                <div className="p-8 rounded-[2rem] border overflow-hidden relative bg-zinc-50/50 dark:bg-slate-900/20 border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-3 mb-6">
                        <Wrench className="h-5 w-5 text-rose-500" />
                        <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-wider text-sm">Critical Maintenance Monitor</h4>
                    </div>
                    <div className="space-y-4">
                        {stats?.complaints?.map((c: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-950/30 border border-zinc-100 dark:border-white/5 shadow-sm dark:shadow-none">
                                <div className="flex items-center gap-3">
                                    <div className={cn("h-2 w-2 rounded-full", c.status === 'Pending' ? 'bg-rose-500' : 'bg-amber-500')} />
                                    <span className="text-xs font-bold text-zinc-600 dark:text-slate-300">{c.status} Complaints</span>
                                </div>
                                <span className="text-lg font-black text-zinc-900 dark:text-white">{c.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operational Quick Actions */}
                <div className="p-8 rounded-[2rem] border relative overflow-hidden flex flex-col justify-center gap-4 border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-slate-900/20 shadow-sm dark:shadow-none"
                    style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.05), transparent)' }}>
                    <div className="absolute -right-12 -bottom-12 p-8 opacity-[0.05] dark:opacity-[0.02] rotate-12">
                        <BarChart3 className="h-48 w-48 text-zinc-900 dark:text-white" />
                    </div>
                    <div className="relative">
                        <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-wider text-sm mb-2">Governance Access</h4>
                        <p className="text-xs text-zinc-500 dark:text-slate-500 max-w-xs mb-4">Direct access to core administrative controls and staff lifecycle management.</p>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => window.location.href = '/superadmin/staff'} className="px-6 py-2.5 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-all">
                                Staff Portal
                            </button>
                            <button onClick={() => window.location.href = '/admin'} className="px-6 py-2.5 rounded-xl border border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest hover:border-amber-500 transition-all bg-white dark:bg-transparent">
                                Admin Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { useEffect, useState, useMemo } from 'react';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Download,
    Shield,
    CheckCircle,
    XCircle,
    Info,
    Calendar,
    User,
    Database
} from 'lucide-react';

interface AuditLog {
    id: number;
    actor_id: string;
    actor_name: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

export default function AuditLogViewerPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        actorId: '',
        entityType: '',
        action: ''
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.actorId) params.append('actorId', filters.actorId);
            if (filters.entityType) params.append('entityType', filters.entityType);
            if (filters.action) params.append('action', filters.action);
            params.append('limit', '100');

            const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
            const data = await res.json();
            if (data.logs) setLogs(data.logs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchLogs();
        }
    }, [user, filters]);

    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `audit_logs_${new Date().toISOString()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-10 text-center">Access Denied.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Shield className="h-8 w-8 text-[#F26C22]" /> System Audit Ledger
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Full transaction and action history across the StayUniKL ecosystem.</p>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Download className="h-4 w-4" /> Export JSON
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative">
                        <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by Actor ID"
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
                            value={filters.actorId}
                            onChange={(e) => setFilters(prev => ({ ...prev, actorId: e.target.value }))}
                        />
                    </div>
                    <div className="relative">
                        <Database className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none"
                            value={filters.entityType}
                            onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                        >
                            <option value="">All Entities</option>
                            <option value="Application">Applications</option>
                            <option value="Payment">Payments</option>
                            <option value="Complaint">Complaints</option>
                            <option value="User">Users</option>
                        </select>
                    </div>
                    <div className="relative md:col-span-2">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by action (e.g., 'Approved')"
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
                            value={filters.action}
                            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-500/5 border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Actor</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Entity</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Origin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div></td>
                                        </tr>
                                    ))
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-500">No logs found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{new Date(log.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-[#F26C22] font-bold text-[10px]">
                                                        {log.actor_name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white">{log.actor_name}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono italic">{log.actor_id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${log.action.includes('Approved') || log.action.includes('Created') || log.action.includes('Success')
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                                        : log.action.includes('Rejected') || log.action.includes('Fail')
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{log.entity_type}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{log.entity_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs overflow-hidden text-ellipsis truncate text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded" title={typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}>
                                                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-bold text-slate-500 font-mono">{log.ip_address || '0.0.0.0'}</span>
                                                    <span className="text-[10px] text-slate-400 truncate w-24 text-right" title={log.user_agent}>
                                                        {log.user_agent?.split(' ')[0] || 'Unknown UI'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Placeholder */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 font-bold">
                        <span>Showing {logs.length} most recent log entries</span>
                        <div className="flex gap-2">
                            <button className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-50 cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
                            <button className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-50 cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

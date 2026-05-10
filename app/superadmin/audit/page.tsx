'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    History, Search, Filter, ChevronLeft, ChevronRight,
    RefreshCw, AlertCircle, User, FileText, CreditCard,
    Building2, Wrench, CalendarDays, ShieldCheck, Info, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLog {
    id: number;
    actor_id: string;
    actor_name: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: string | null;
    ip_address: string | null;
    created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
    'approved':  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'rejected':  'text-rose-400 bg-rose-500/10 border-rose-500/20',
    'suspended': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    'created':   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'payment':   'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'updated':   'text-sky-400 bg-sky-500/10 border-sky-500/20',
    'resolved':  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'deleted':   'text-rose-400 bg-rose-500/10 border-rose-500/20',
    'reset':     'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'default':   'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
};

function getActionColor(action: string): string {
    const lower = action.toLowerCase();
    for (const [key, cls] of Object.entries(ACTION_COLORS)) {
        if (lower.includes(key)) return cls;
    }
    return ACTION_COLORS.default;
}

function getEntityIcon(entityType: string) {
    switch (entityType?.toLowerCase()) {
        case 'user': return <User className="h-3.5 w-3.5" />;
        case 'application': return <FileText className="h-3.5 w-3.5" />;
        case 'payment': return <CreditCard className="h-3.5 w-3.5" />;
        case 'room': return <Building2 className="h-3.5 w-3.5" />;
        case 'complaint': return <Wrench className="h-3.5 w-3.5" />;
        case 'booking': return <CalendarDays className="h-3.5 w-3.5" />;
        case 'system': return <ShieldCheck className="h-3.5 w-3.5" />;
        default: return <Info className="h-3.5 w-3.5" />;
    }
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [entityTypes, setEntityTypes] = useState<string[]>([]);
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

    // Filters
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '50',
                ...(search && { actor: search }),
                ...(actionFilter && { action: actionFilter }),
                ...(entityFilter && { entity_type: entityFilter }),
                ...(fromDate && { from: fromDate }),
                ...(toDate && { to: toDate }),
            });
            const res = await fetch(`/api/superadmin/audit?${params}`);
            const data = await res.json();
            if (data.logs) {
                setLogs(data.logs);
                setTotal(data.total);
                setTotalPages(data.totalPages);
                setEntityTypes(data.entityTypes || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, search, actionFilter, entityFilter, fromDate, toDate]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const clearFilters = () => {
        setSearch(''); setSearchInput('');
        setActionFilter(''); setEntityFilter('');
        setFromDate(''); setToDate('');
        setPage(1);
    };

    const hasFilters = search || actionFilter || entityFilter || fromDate || toDate;

    const formatDate = (d: string) =>
        new Date(d).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

    const parseDetails = (raw: string | null) => {
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return raw; }
    };

    return (
        <div className="p-8 lg:p-10 space-y-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <History className="h-5 w-5 text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Audit Log</h1>
                    </div>
                    <p className="text-sm text-zinc-500 ml-12">
                        Append-only system activity trail. {total.toLocaleString()} total records.
                    </p>
                </div>
                <button onClick={fetchLogs}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all border border-zinc-800 self-start">
                    <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                </button>
            </div>

            {/* Filters Panel */}
            <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(245,158,11,0.08)' }}>
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <Filter className="h-3.5 w-3.5" /> Filters
                    {hasFilters && (
                        <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors">
                            <X className="h-3 w-3" /> Clear all
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Actor Search */}
                    <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Search by actor name..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-colors"
                        />
                    </div>
                    {/* Action Filter */}
                    <input
                        type="text"
                        placeholder="Filter by action..."
                        value={actionFilter}
                        onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 transition-colors"
                    />
                    {/* Entity Type */}
                    <select
                        value={entityFilter}
                        onChange={e => { setEntityFilter(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500/40 transition-colors appearance-none"
                    >
                        <option value="">All entity types</option>
                        {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {/* Date Range */}
                    <div className="flex gap-2">
                        <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500/40 transition-colors [color-scheme:dark]" />
                        <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500/40 transition-colors [color-scheme:dark]" />
                    </div>
                </div>
                <button onClick={handleSearch}
                    className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-black transition-all hover:opacity-90 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    Apply Search
                </button>
            </div>

            {/* Log Table */}
            <div className="rounded-3xl border overflow-hidden" style={{ borderColor: 'rgba(245,158,11,0.08)', background: 'rgba(255,255,255,0.01)' }}>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b text-[9px] font-black text-zinc-600 uppercase tracking-widest"
                    style={{ borderColor: 'rgba(245,158,11,0.08)' }}>
                    <div className="col-span-1">#</div>
                    <div className="col-span-2">Actor</div>
                    <div className="col-span-4">Action</div>
                    <div className="col-span-2">Entity</div>
                    <div className="col-span-2">Timestamp</div>
                    <div className="col-span-1">Details</div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <div className="h-8 w-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                        <p className="text-xs text-zinc-600 font-bold">Loading audit records...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <AlertCircle className="h-8 w-8 text-zinc-700" />
                        <p className="text-sm text-zinc-600 font-bold">No audit records match your filters.</p>
                    </div>
                ) : (
                    logs.map((log, i) => {
                        const details = parseDetails(log.details);
                        const isExpanded = expandedLog === log.id;
                        const colorClass = getActionColor(log.action);

                        return (
                            <div key={log.id}
                                className={cn('border-b transition-colors', i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]')}
                                style={{ borderColor: 'rgba(245,158,11,0.04)' }}
                            >
                                <div className="grid grid-cols-12 gap-3 px-6 py-4 items-center">
                                    <div className="col-span-1 text-[10px] font-mono text-zinc-700">#{log.id}</div>
                                    <div className="col-span-2">
                                        <p className="text-xs font-bold text-white truncate">{log.actor_name}</p>
                                        <p className="text-[10px] text-zinc-600 font-mono truncate">{log.actor_id}</p>
                                    </div>
                                    <div className="col-span-4">
                                        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border', colorClass)}>
                                            {log.action}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-zinc-400 bg-zinc-800/50 border border-zinc-700/50">
                                            {getEntityIcon(log.entity_type)}
                                            {log.entity_type || '—'}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                                            {formatDate(log.created_at)}
                                        </p>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        {details && (
                                            <button
                                                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                                                className={cn('p-1.5 rounded-lg text-xs transition-colors',
                                                    isExpanded
                                                        ? 'text-amber-400 bg-amber-500/10'
                                                        : 'text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10'
                                                )}
                                                title="View details"
                                            >
                                                <Info className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && details && (
                                    <div className="px-6 pb-5 animate-in slide-in-from-top-1 duration-200">
                                        <div className="rounded-xl p-4 border font-mono text-[11px] text-amber-300/80 leading-relaxed overflow-x-auto"
                                            style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.12)' }}>
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">
                                                Event Details
                                                {log.entity_id && <span className="ml-3 text-zinc-700">Entity ID: {log.entity_id}</span>}
                                            </p>
                                            {typeof details === 'object'
                                                ? Object.entries(details).map(([k, v]) => (
                                                    <div key={k} className="flex gap-3">
                                                        <span className="text-zinc-600 shrink-0">{k}:</span>
                                                        <span className="text-amber-300/70">{String(v)}</span>
                                                    </div>
                                                ))
                                                : <span>{String(details)}</span>
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-600 font-bold">
                        Page {page} of {totalPages} &mdash; {total.toLocaleString()} total records
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded-xl border border-zinc-800 text-zinc-500 hover:text-amber-400 hover:border-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                            return (
                                <button key={p} onClick={() => setPage(p)}
                                    className={cn(
                                        'h-9 w-9 rounded-xl text-xs font-black transition-all border',
                                        p === page
                                            ? 'text-black border-transparent'
                                            : 'text-zinc-600 border-zinc-800 hover:text-amber-400 hover:border-amber-500/30'
                                    )}
                                    style={p === page ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)' } : {}}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 rounded-xl border border-zinc-800 text-zinc-500 hover:text-amber-400 hover:border-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import AssetFormPanel from '@/components/admin/AssetFormPanel';
import { Search, Package, Wrench, AlertTriangle, DollarSign, Eye, Pencil, MoreHorizontal, ChevronLeft, ChevronRight, Filter, FileText, Clock, Loader2 } from 'lucide-react';

const condBadge = (c: string) => {
    if (c === 'Good') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
    if (c === 'Damaged') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800';
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
};
const statusBadge = (s: string) => {
    if (s === 'In Use' || s === 'Good') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400';
    if (s === 'Under Repair' || s === 'Maintenance') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400';
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400';
};

export default function AssetManagementPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<'inventory'|'maintenance'>('inventory');
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('');
    const [typeF, setTypeF] = useState('');
    const [locF, setLocF] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 8;

    const fetchAssets = async () => { setLoading(true); try { const r = await fetch('/api/assets'); const d = await r.json(); if (d.assets) setAssets(d.assets); } catch(e){console.error(e);} finally{setLoading(false);} };
    useEffect(() => { fetchAssets(); }, []);

    const filtered = useMemo(() => assets.filter(a => {
        const ms = !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.id?.toLowerCase().includes(search.toLowerCase()) || a.location_id?.toString().toLowerCase().includes(search.toLowerCase());
        const mst = !statusF || a.status === statusF;
        const mt = !typeF || a.type === typeF;
        const ml = !locF || a.location_id?.toString().includes(locF);
        return ms && mst && mt && ml;
    }), [assets, search, statusF, typeF, locF]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page-1)*perPage, page*perPage);
    const damaged = assets.filter(a => a.status === 'Damaged' || a.status === 'Maintenance');
    const totalValue = assets.reduce((s,a) => s + (parseFloat(a.value)||0), 0);
    const types = ['Electronics','Furniture','Appliance','Fixture'];
    const typeCounts = types.map(t => ({t, c: assets.filter(a=>a.type===t).length})).sort((a,b)=>b.c-a.c);

    const handleCreate = async (form: any) => {
        await fetch('/api/assets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'create_asset', name:form.name, type:form.type, locationId:form.locationId, value:form.value||0 }) });
        fetchAssets();
    };
    const handleRepair = async (id: string) => {
        const cost = prompt('Enter repair cost (RM):','0'); if(cost===null) return;
        await fetch('/api/assets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'log_maintenance', assetId:id, maintenanceAction:'Repair', description:'Routine repair', cost:parseFloat(cost), performedBy:user?.name||'Admin', newStatus:'Good' }) });
        fetchAssets();
    };
    const handleReportIssue = async (id: string) => {
        if(!confirm('Mark this asset as Damaged?')) return;
        await fetch('/api/assets', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'update_status', id, status:'Damaged' }) });
        fetchAssets();
    };

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <div className="p-10 text-center text-slate-500">Access Denied.</div>;

    const kpis = [
        { label:'Total Assets', value: assets.length, sub:'All registered assets', icon:<Package className="h-6 w-6"/>, bg:'bg-indigo-500' },
        { label:'Under Maintenance', value: assets.filter(a=>a.status==='Maintenance').length, sub:'Currently in progress', icon:<Wrench className="h-6 w-6"/>, bg:'bg-amber-500' },
        { label:'Critical Issues', value: assets.filter(a=>a.status==='Damaged').length, sub:'Require immediate attention', icon:<AlertTriangle className="h-6 w-6"/>, bg:'bg-rose-500' },
        { label:'Total Asset Value', value: `RM ${totalValue.toLocaleString('en-MY',{minimumFractionDigits:0})}`, sub:'Based on purchase value', icon:<DollarSign className="h-6 w-6"/>, bg:'bg-emerald-500' },
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Facility & Asset Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track inventory, monitor asset conditions, and manage maintenance.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={()=>setTab('inventory')} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${tab==='inventory'?'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20':'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}>Inventory</button>
                    <button onClick={()=>setTab('maintenance')} className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${tab==='maintenance'?'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20':'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}>
                        Maintenance Queue {damaged.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">{damaged.length}</span>}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(k => (
                    <div key={k.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-start gap-4">
                        <div className={`${k.bg} h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg`}>{k.icon}</div>
                        <div className="min-w-0">
                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{k.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inventory Tab */}
            {tab === 'inventory' && (
                <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                    <AssetFormPanel onSubmit={handleCreate} />
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-3"><Filter className="h-3.5 w-3.5"/>Search & Filter Assets</div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="relative col-span-2 lg:col-span-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                    <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search by name or asset ID..." className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"/>
                                </div>
                                <select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500">
                                    <option value="">All Statuses</option><option>Good</option><option>Damaged</option><option>Maintenance</option>
                                </select>
                                <select value={typeF} onChange={e=>{setTypeF(e.target.value);setPage(1);}} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500">
                                    <option value="">All Types</option><option>Furniture</option><option>Appliance</option><option>Fixture</option><option>Electronics</option>
                                </select>
                                <select value={locF} onChange={e=>{setLocF(e.target.value);setPage(1);}} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500">
                                    <option value="">All Locations</option>
                                    {[...new Set(assets.map(a=>a.location_id).filter(Boolean))].map(l=><option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-indigo-500"/></div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50/80 dark:bg-slate-800/50"><tr>
                                                {['ID','Asset Name','Type','Location','Condition','Status','Value (RM)','Action'].map(h=>(
                                                    <th key={h} className={`px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap ${h==='Action'?'text-right':''}`}>{h}</th>
                                                ))}
                                            </tr></thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                {paginated.length === 0 ? (
                                                    <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-400 text-sm">No assets found matching your filters.</td></tr>
                                                ) : paginated.map(a => (
                                                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">{a.id}</td>
                                                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white text-sm">{a.name}</td>
                                                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{a.type}</td>
                                                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{a.location_id||'Storage'}</td>
                                                        <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${condBadge(a.status)}`}>{a.status}</span></td>
                                                        <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadge(a.status==='Good'?'In Use':a.status==='Maintenance'?'Under Repair':'Out of Service')}`}>{a.status==='Good'?'In Use':a.status==='Maintenance'?'Under Repair':'Out of Service'}</span></td>
                                                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-medium">{parseFloat(a.value||0).toFixed(2)}</td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button title="View" className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 transition-colors"><Eye className="h-3.5 w-3.5"/></button>
                                                                {a.status==='Good' && <button title="Report Issue" onClick={()=>handleReportIssue(a.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-colors"><Pencil className="h-3.5 w-3.5"/></button>}
                                                                {(a.status==='Damaged'||a.status==='Maintenance') && <button title="Log Repair" onClick={()=>handleRepair(a.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-colors"><Wrench className="h-3.5 w-3.5"/></button>}
                                                                <button title="More" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"><MoreHorizontal className="h-3.5 w-3.5"/></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                        <span>Showing {Math.min((page-1)*perPage+1,filtered.length)} to {Math.min(page*perPage,filtered.length)} of {filtered.length} assets</span>
                                        <div className="flex items-center gap-1">
                                            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"><ChevronLeft className="h-4 w-4"/></button>
                                            {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                                                <button key={p} onClick={()=>setPage(p)} className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${page===p?'bg-indigo-600 text-white':'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}>{p}</button>
                                            ))}
                                            {totalPages>5 && <span className="px-1">...</span>}
                                            {totalPages>5 && <button onClick={()=>setPage(totalPages)} className={`h-8 w-8 rounded-lg text-xs font-bold ${page===totalPages?'bg-indigo-600 text-white':'hover:bg-slate-100'}`}>{totalPages}</button>}
                                            <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"><ChevronRight className="h-4 w-4"/></button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Tab */}
            {tab === 'maintenance' && (
                <div className="space-y-4">
                    {damaged.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <Wrench className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4"/>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">No assets require maintenance</p>
                            <p className="text-sm text-slate-400 mt-1">All equipment is in working condition.</p>
                        </div>
                    ) : damaged.map(a => (
                        <div key={a.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-rose-500"/></div>
                                <div>
                                    <div className="flex items-center gap-2"><h3 className="font-bold text-slate-900 dark:text-white">{a.name}</h3><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${condBadge(a.status)}`}>{a.status}</span></div>
                                    <p className="text-xs text-slate-500 mt-0.5">Location: {a.location_id||'N/A'} · ID: {a.id} · Type: {a.type}</p>
                                </div>
                            </div>
                            <button onClick={()=>handleRepair(a.id)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/10">Log Repair</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Reports */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-500"/>Recent Reports</h3>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider cursor-pointer hover:underline">View All</span>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {damaged.slice(0,3).map(a => (
                            <div key={a.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0 mt-0.5"><Wrench className="h-4 w-4 text-rose-500"/></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{a.name} — Issue reported</p>
                                    <p className="text-[11px] text-slate-400">Location: {a.location_id||'N/A'}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${a.status==='Damaged'?'bg-rose-100 text-rose-600':'bg-amber-100 text-amber-600'}`}>{a.status==='Damaged'?'Critical':'Medium'}</span>
                            </div>
                        ))}
                        {damaged.length===0 && <div className="p-8 text-center text-sm text-slate-400">No recent reports.</div>}
                    </div>
                </div>

                {/* Asset Status Overview */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Asset Status Overview</h3>
                    <div className="flex items-center gap-6">
                        <div className="relative h-32 w-32 shrink-0">
                            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                                {(() => { const good = assets.filter(a=>a.status==='Good').length; const maint = assets.filter(a=>a.status==='Maintenance').length; const dmg = assets.filter(a=>a.status==='Damaged').length; const total = good+maint+dmg||1; const gP = (good/total)*100; const mP = (maint/total)*100;
                                    return (<><circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${gP} ${100-gP}`} strokeDashoffset="0"/><circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray={`${mP} ${100-mP}`} strokeDashoffset={`${-gP}`}/><circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray={`${100-gP-mP} ${gP+mP}`} strokeDashoffset={`${-(gP+mP)}`}/></>);
                                })()}
                            </svg>
                        </div>
                        <div className="space-y-3 flex-1">
                            {[{l:'In Use',c:assets.filter(a=>a.status==='Good').length,cl:'bg-emerald-500'},{l:'Under Maintenance',c:assets.filter(a=>a.status==='Maintenance').length,cl:'bg-amber-500'},{l:'Out of Service',c:assets.filter(a=>a.status==='Damaged').length,cl:'bg-rose-500'},{l:'Missing / Others',c:assets.filter(a=>!['Good','Damaged','Maintenance'].includes(a.status)).length,cl:'bg-slate-400'}].map(s=>(
                                <div key={s.l} className="flex items-center gap-2 text-xs">
                                    <span className={`h-2.5 w-2.5 rounded-full ${s.cl} shrink-0`}/>
                                    <span className="text-slate-600 dark:text-slate-400 flex-1">{s.l}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{s.c}</span>
                                    <span className="text-slate-400 w-12 text-right">({assets.length?(s.c/assets.length*100).toFixed(1):0}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Asset Types */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">Top Asset Types</h3>
                    <div className="space-y-4">
                        {typeCounts.map(({t,c}) => (
                            <div key={t} className="flex items-center gap-3">
                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium w-24 shrink-0">{t}</span>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{width:`${assets.length?(c/assets.length*100):0}%`}}/>
                                </div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white w-8 text-right">{c}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

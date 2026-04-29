'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Building2, DollarSign, Zap, Users } from 'lucide-react';

export default function AdminReportsPage() {
    const { user } = useAuth();
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/reports')
            .then(res => res.json())
            .then(data => {
                setReportData(data);
                setLoading(false);
            })
            .catch(err => console.error("Report load failed", err));
    }, []);

    if (!user || user.role !== 'admin') return <div className="p-10 text-center">Access Denied. Admins only.</div>;

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="flex items-center justify-center p-20 text-slate-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-8 w-8 border-4 border-[#F26C22] border-t-transparent rounded-full"></div>
                    <p className="font-medium">Loading analytics...</p>
                </div>
            </div>
        </div>
    );

    if (!reportData || reportData.error) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="p-20 text-center text-red-500">Failed to load report data.</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Insights</h1>
                    <p className="text-slate-500 dark:text-slate-400">Comprehensive overview of hostel performance and student data.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatCard
                        title="Occupancy Rate"
                        value={`${reportData.occupancy.rate}%`}
                        sub={`${reportData.occupancy.occupied} / ${reportData.occupancy.total} Beds`}
                        icon={<Building2 className="h-6 w-6 text-[#F26C22]" />}
                        color="text-[#F26C22]"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`RM ${reportData.revenue.reduce((acc: any, curr: any) => acc + parseFloat(curr.total), 0).toLocaleString()}`}
                        sub="Last 6 Months"
                        icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
                        color="text-emerald-600"
                    />
                    <StatCard
                        title="Avg Resolution"
                        value={`${reportData.complaints.avgResolutionTime}h`}
                        sub="Resolution Time"
                        icon={<Zap className="h-6 w-6 text-amber-600" />}
                        color="text-amber-600"
                    />
                    <StatCard
                        title="Student Intake"
                        value={reportData.intake.reduce((acc: any, curr: any) => acc + curr.count, 0)}
                        sub="Total Registrations"
                        icon={<Users className="h-6 w-6 text-rose-600" />}
                        color="text-rose-600"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Occupancy Breakdown */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Occupancy Distribution</h3>
                        <div className="space-y-6">
                            <FloorProgress label="Current Occupancy" current={reportData.occupancy.occupied} total={reportData.occupancy.total} color="bg-[#F26C22]" />
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-400 mb-4 uppercase font-bold tracking-wider">Historical Intake</p>
                                <div className="space-y-4">
                                    {reportData.semesterStats.map((s: any) => (
                                        <div key={s.semester} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">{s.semester}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{s.intake} Students</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trends */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Revenue Flow */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Monthly Revenue trend</h3>
                            <div className="h-48 flex items-end gap-3 px-2">
                                {reportData.revenue.length > 0 ? reportData.revenue.map((r: any) => (
                                    <div key={r.month} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div
                                            className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg transition-all group-hover:bg-emerald-500 relative"
                                            style={{ height: `${(parseFloat(r.total) / (Math.max(...reportData.revenue.map((x: any) => parseFloat(x.total))) || 1)) * 100}%`, minHeight: '10%' }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                RM{r.total}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">{r.month.split(' ')[0]}</span>
                                    </div>
                                )) : (
                                    <div className="w-full text-center text-slate-400 text-sm">No revenue data found.</div>
                                )}
                            </div>
                        </div>

                        {/* Intake Trend */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Registration Trend</h3>
                            <div className="flex items-center gap-1 overflow-hidden h-32">
                                {reportData.intake.length > 0 ? reportData.intake.map((i: any) => (
                                    <div key={i.month} className="flex-1 text-center">
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{i.count}</div>
                                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter font-bold">{i.month}</div>
                                    </div>
                                )) : (
                                    <div className="w-full text-center text-slate-400 text-sm">No intake data found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Summary */}
                <div className="mt-8 bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h2 className="text-3xl font-black mb-2">Semester Performance</h2>
                                <p className="text-slate-300 max-w-lg">Live calculation of student intake, revenue projections, and service level efficiency across all UniKL MIIT hostels.</p>
                            </div>
                            <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">System Status</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="font-bold">All Services Live</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12 pb-2">
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-extrabold tracking-widest">Est. Annual Revenue</p>
                                <p className="text-3xl font-black mt-1">RM {(reportData.semesterStats.reduce((acc: any, curr: any) => acc + (parseFloat(curr.potential_revenue) || 0), 0) * 2).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-extrabold tracking-widest">Active Intake</p>
                                <p className="text-3xl font-black mt-1">{reportData.intake.reduce((acc: any, curr: any) => acc + curr.count, 0)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-extrabold tracking-widest">Service Level (SLA)</p>
                                <p className="text-3xl font-black mt-1 text-white">{reportData.complaints.avgResolutionTime < 24 ? 'Excellent' : 'On Track'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase font-extrabold tracking-widest">Capacity Balance</p>
                                <p className="text-3xl font-black mt-1">{reportData.occupancy.total - reportData.occupancy.occupied} <span className="text-lg font-medium opacity-50">Beds</span></p>
                            </div>
                        </div>
                    </div>
                    {/* Decorative radial gradients */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl -ml-16 -mb-16"></div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, sub, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
                <div className={`text-2xl h-12 w-12 flex items-center justify-center bg-slate-50 rounded-xl dark:bg-slate-800 shadow-inner`}>{icon}</div>
                <div className="flex gap-1 group cursor-help">
                    {[1, 2, 3].map(x => <div key={x} className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-[#F26C22] transition-colors"></div>)}
                </div>
            </div>
            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h4>
            <div className={`text-3xl font-black mt-1 ${color} tracking-tighter`}>{value}</div>
            <p className="text-xs text-slate-400 mt-2 font-semibold tracking-wide">{sub}</p>
        </div>
    );
}

function FloorProgress({ label, current, total, color }: any) {
    const percentage = Math.round((current / (total || 1)) * 100);
    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{percentage}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 p-0.5 overflow-hidden shadow-inner">
                <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-sm`} style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="flex justify-between mt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{current} Occ. / {total} Total</p>
                <p className={`text-[10px] font-bold ${percentage > 90 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {percentage > 90 ? 'REACHING LIMIT' : 'AVAILABLE'}
                </p>
            </div>
        </div>
    );
}

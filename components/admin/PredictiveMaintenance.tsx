'use client';

import React, { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { AlertTriangle, Wrench, Building2, TrendingUp } from 'lucide-react';

export default function PredictiveMaintenance() {
    const { complaints, applications } = useData();

    // Analyze complaints to find recurring issues
    const analysis = useMemo(() => {
        const roomCounts: Record<string, { count: number, issues: string[] }> = {};
        const activeComplaints = complaints.filter(c => c.status !== 'Resolved');

        complaints.forEach(c => {
            const app = applications.find(a => a.studentId === c.studentId && ['Checked in', 'Approved'].includes(a.status));
            if (app && app.roomId) {
                if (!roomCounts[app.roomId]) {
                    roomCounts[app.roomId] = { count: 0, issues: [] };
                }
                roomCounts[app.roomId].count++;
                roomCounts[app.roomId].issues.push(c.title);
            }
        });

        const sortedRooms = Object.entries(roomCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .filter(r => r[1].count >= 2) // Flag if 2 or more complaints
            .slice(0, 3); // Top 3

        return {
            flaggedRooms: sortedRooms,
            totalActive: activeComplaints.length,
        };
    }, [complaints, applications]);

    if (analysis.flaggedRooms.length === 0) {
        return null; // Don't show if no recurring issues
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Predictive Maintenance
                        <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Beta Feature</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">AI-driven analysis of recurring issues based on complaint history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.flaggedRooms.map(([roomId, data], idx) => (
                    <div key={roomId} className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-xl p-4 relative overflow-hidden group hover:border-rose-300 transition-all">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AlertTriangle className="h-16 w-16 text-rose-500" />
                        </div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-rose-600" />
                                <span className="font-bold text-slate-900 dark:text-white">Room {roomId}</span>
                            </div>
                            <span className="text-xs font-black bg-rose-600 text-white px-2 py-1 rounded-full">{data.count} Issues</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest mb-1">Recent Reports:</p>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                                {data.issues.slice(-3).map((issue, i) => (
                                    <li key={i} className="truncate">{issue}</li>
                                ))}
                            </ul>
                            <button className="mt-4 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                                <Wrench className="h-3 w-3" /> Schedule Full Audit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

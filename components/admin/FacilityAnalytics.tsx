'use client';

import React, { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

export default function FacilityAnalytics() {
    const { courtBookings } = useData();

    const analytics = useMemo(() => {
        // Only count approved or completed bookings
        const activeBookings = courtBookings.filter(b => b.status === 'Approved');

        // 1. Popular Sports
        const sportsCount: Record<string, number> = {};
        let maxSportCount = 0;
        
        // 2. Peak Hours
        const timeCount: Record<string, number> = {};
        let maxTimeCount = 0;

        activeBookings.forEach(b => {
            // Sport
            sportsCount[b.sport] = (sportsCount[b.sport] || 0) + 1;
            if (sportsCount[b.sport] > maxSportCount) maxSportCount = sportsCount[b.sport];

            // Time
            const hour = b.timeSlot.split(':')[0] + ':00';
            timeCount[hour] = (timeCount[hour] || 0) + 1;
            if (timeCount[hour] > maxTimeCount) maxTimeCount = timeCount[hour];
        });

        // Sort times
        const sortedTimes = Object.keys(timeCount).sort((a, b) => parseInt(a) - parseInt(b));

        return {
            sportsCount,
            maxSportCount,
            timeCount,
            sortedTimes,
            maxTimeCount,
            totalBookings: activeBookings.length
        };
    }, [courtBookings]);

    if (analytics.totalBookings === 0) {
        return null; // Not enough data
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Popular Sports Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Popular Sports</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Based on Approved Bookings</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.entries(analytics.sportsCount).sort((a, b) => b[1] - a[1]).map(([sport, count]) => {
                        const percentage = analytics.maxSportCount > 0 ? (count / analytics.maxSportCount) * 100 : 0;
                        return (
                            <div key={sport}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{sport}</span>
                                    <span className="font-black text-slate-900 dark:text-white">{count}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Peak Hours Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Peak Hours</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Facility Utilization</p>
                    </div>
                </div>

                <div className="flex items-end h-32 gap-2 mt-4 px-2">
                    {analytics.sortedTimes.map(time => {
                        const count = analytics.timeCount[time];
                        const height = analytics.maxTimeCount > 0 ? (count / analytics.maxTimeCount) * 100 : 0;
                        return (
                            <div key={time} className="flex-1 flex flex-col items-center group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {count} bookings
                                </div>
                                
                                <div 
                                    className="w-full bg-amber-200 dark:bg-amber-900/40 rounded-t-sm group-hover:bg-amber-400 dark:group-hover:bg-amber-500 transition-colors"
                                    style={{ height: `${Math.max(10, height)}%` }}
                                ></div>
                                <div className="text-[8px] text-slate-400 mt-2 rotate-[-45deg] origin-top-left absolute -bottom-6 truncate">
                                    {time}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

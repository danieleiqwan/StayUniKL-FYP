'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export default function LiveClock() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update the clock every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(timer);
    }, []);

    // Format time as HH:MM:SS
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-MY', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    // Format date as Day, DD Month YYYY
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-MY', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Date Display */}
            <div className="hidden md:flex items-center gap-2 border-r border-slate-300 dark:border-slate-700 pr-3">
                <Calendar className="h-4 w-4 text-[#F26C22]" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {formatDate(currentTime)}
                </span>
            </div>

            {/* Time Display */}
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#F26C22]" />
                <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatTime(currentTime)}
                </span>
            </div>
        </div>
    );
}

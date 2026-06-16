'use client';

import { useState } from 'react';
import { X, CalendarDays, AlertCircle } from 'lucide-react';

interface ScheduleComplaintModalProps {
    complaint: any | null;
    onClose: () => void;
    onSchedule: (date: string) => void;
}

export default function ScheduleComplaintModal({
    complaint,
    onClose,
    onSchedule
}: ScheduleComplaintModalProps) {
    const [selectedDate, setSelectedDate] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!complaint) return null;

    // Get today's date in YYYY-MM-DD local format
    const todayStr = new Date().toLocaleDateString('en-CA'); // e.g. "2026-06-16"

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedDate) {
            setError('Please select an appointment date.');
            return;
        }

        const chosenDate = new Date(selectedDate);
        const today = new Date(todayStr);
        
        // Compare dates without time parts
        chosenDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (chosenDate < today) {
            setError('Appointment date cannot be in the past.');
            return;
        }

        onSchedule(selectedDate);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Schedule Appointment</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Complaint ID: {complaint.id.substring(0, 8)}...
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
                    {/* Complaint Overview */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-[#F26C22] uppercase tracking-widest mb-1">Issue</p>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">{complaint.title}</h4>
                        <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                            <span>Reported by: <strong>{complaint.studentName}</strong></span>
                            <span>Room: {complaint.roomNumber || '—'}</span>
                        </div>
                    </div>

                    {/* Date Picker Input */}
                    <div className="space-y-2">
                        <label htmlFor="appointment-date" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Select Appointment Date
                        </label>
                        <div className="relative">
                            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                id="appointment-date"
                                min={todayStr}
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    if (error) setError(null);
                                }}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 focus:border-[#F26C22] dark:focus:border-[#F26C22] focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 outline-none transition-all font-bold text-slate-800 dark:text-white text-sm cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold border border-rose-100 dark:border-rose-900/30">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl text-xs font-black text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 flex items-center gap-2"
                        >
                            Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

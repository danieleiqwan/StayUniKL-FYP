'use client';

import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { 
    AlertCircle, Clock, WashingMachine, ChevronRight, 
    User, CalendarDays, Lock, Home as HomeIcon,
    AlertTriangle
} from "lucide-react";
import Link from 'next/link';

export default function DobbySchedulePage() {
    const { user } = useAuth();
    const { facilitySettings, myApplication } = useData();
    const laundry = facilitySettings?.laundry;

    if (!user) return null;

    // --- Access Control Check ---
    const isAuthorized = user.role === 'admin' || (myApplication && (myApplication.status === 'Approved' || myApplication.status === 'Checked in'));

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="relative inline-block">
                        <div className="h-24 w-24 bg-orange-50 dark:bg-orange-900/20 rounded-[2rem] flex items-center justify-center mx-auto ring-8 ring-orange-50/50 dark:ring-orange-900/10">
                            <Lock className="h-10 w-10 text-[#F26C22]" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <div className="h-6 w-6 bg-rose-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-sm">
                                <AlertTriangle className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Access <span className="text-[#F26C22]">Restricted</span></h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            Laundry schedules and facility access are reserved for students with an <span className="font-bold text-slate-900 dark:text-white">Approved room application</span>.
                        </p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/dashboard/apply" className="px-8 py-3 bg-[#141235] text-white rounded-xl font-bold text-sm hover:bg-[#F26C22] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10">
                            Start Application <ChevronRight className="h-4 w-4" />
                        </Link>
                        <Link href="/dashboard" className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                            <HomeIcon className="h-4 w-4" /> Back Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const menSchedule = [
        { day: 'Daily', time: '8:00 AM - 12:00 PM' },
        { day: 'Mon, Wed, Fri', time: '8:00 PM - 11:00 PM' },
    ];

    const womenSchedule = [
        { day: 'Daily', time: '1:00 PM - 5:00 PM' },
        { day: 'Tue, Thu, Sat', time: '8:00 PM - 11:00 PM' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Laundry (Dobby)</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">Organize your laundry week. Please respect the gender-specific slots.</p>
                </div>
                {laundry && (
                    <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl text-[#F26C22] dark:text-orange-400 font-bold border border-orange-100 dark:border-orange-900/30 text-sm transition-colors">
                        <Clock className="h-4 w-4" />
                        Facility Hours: {laundry.openTime} - {laundry.closeTime}
                    </div>
                )}
            </div>

            {laundry && !laundry.isOpen && (
                <div className="rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/20 p-6 flex items-start gap-4 transition-colors">
                    <div className="bg-amber-500 text-white p-2 rounded-lg">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400 uppercase tracking-tight">Temporarily Unavailable</h3>
                        <p className="text-sm text-amber-700/80 dark:text-amber-500 font-medium">Maintenance in progress. All machine operations are halted until further notice.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Men's Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <WashingMachine className="h-24 w-24 text-slate-900 dark:text-white" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-[#0EA5E9] flex items-center justify-center text-white shadow-lg shadow-sky-100 dark:shadow-none">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Men's Laundry</h2>
                            <p className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest transition-colors">Morning & Late Slots</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {menSchedule.map((slot, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-900/50 transition-colors">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-300">{slot.day}</span>
                                <span className="text-xs font-black bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sky-600 dark:text-sky-400 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">{slot.time}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID Card Required</div>
                        <CalendarDays className="h-5 w-5 text-slate-200 dark:text-slate-700" />
                    </div>
                </div>

                {/* Women's Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <WashingMachine className="h-24 w-24 text-rose-900 dark:text-rose-400" />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-[#EC4899] flex items-center justify-center text-white shadow-lg shadow-pink-100 dark:shadow-none">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Women's Laundry</h2>
                            <p className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest transition-colors">Afternoon & Late Slots</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {womenSchedule.map((slot, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-pink-200 dark:hover:border-pink-900/50 transition-colors">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-300">{slot.day}</span>
                                <span className="text-xs font-black bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-pink-600 dark:text-pink-400 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">{slot.time}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Self-Service Setup</div>
                        <CalendarDays className="h-5 w-5 text-slate-200 dark:text-slate-700" />
                    </div>
                </div>

            </div>

            {/* Quick Tips */}
            <div className="bg-[#F26C22] rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 dark:bg-white/5 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-orange-100" />
                    </div>
                    <div>
                        <p className="text-xs font-bold">Bring your own detergents. Machines take tokens or mobile pay.</p>
                        <p className="text-[10px] text-orange-100/80 font-medium">Please remove garments within 10 minutes of cycle completion.</p>
                    </div>
                 </div>
                 <Link href="#" className="flex items-center gap-2 bg-white dark:bg-slate-900 text-[#F26C22] dark:text-orange-400 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Dobby Guide <ChevronRight className="h-4 w-4" />
                 </Link>
            </div>
        </div>
    );
}

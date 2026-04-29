'use client';

import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { 
    AlertCircle, Clock, Dumbbell, ChevronRight, 
    User, CalendarDays, Lock, Home as HomeIcon,
    AlertTriangle
} from "lucide-react";
import Link from 'next/link';

export default function GymSchedulePage() {
    const { user } = useAuth();
    const { facilitySettings, myApplication } = useData();
    const gym = facilitySettings?.gym;

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
                            Gym schedules and access are reserved for students with an <span className="font-bold text-slate-900 dark:text-white">Approved room application</span>.
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
        { day: 'Monday', time: '5:00 PM - 7:00 PM' },
        { day: 'Wednesday', time: '5:00 PM - 7:00 PM' },
        { day: 'Friday', time: '5:00 PM - 9:00 PM' },
        { day: 'Sunday', time: '8:00 AM - 12:00 PM' },
    ];

    const womenSchedule = [
        { day: 'Tuesday', time: '5:00 PM - 7:00 PM' },
        { day: 'Thursday', time: '5:00 PM - 7:00 PM' },
        { day: 'Saturday', time: '5:00 PM - 9:00 PM' },
        { day: 'Sunday', time: '2:00 PM - 6:00 PM' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Gym Schedule</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">Stay fit and healthy! Adhere to the designated gender slots.</p>
                </div>
                {gym && (
                    <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl text-[#F26C22] dark:text-orange-400 font-bold border border-orange-100 dark:border-orange-900/30 text-sm transition-colors">
                        <Clock className="h-4 w-4" />
                        Hours: {gym.openTime} - {gym.closeTime}
                    </div>
                )}
            </div>

            {gym && !gym.isOpen && (
                <div className="rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20 p-6 flex items-start gap-4 transition-colors">
                    <div className="bg-rose-500 text-white p-2 rounded-lg">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-rose-900 dark:text-rose-400 uppercase tracking-tight">Closed for Maintenance</h3>
                        <p className="text-sm text-rose-700/80 dark:text-rose-500 font-medium">The facility is currently unavailable. No entries permitted until further notice.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Men's Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group transition-colors">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Dumbbell className="h-24 w-24 text-slate-900 dark:text-white" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-[#F26C22] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Men's Slots</h2>
                            <p className="text-xs font-bold text-[#F26C22] dark:text-orange-400 uppercase tracking-widest transition-colors">Priority Reserved</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {menSchedule.map((slot, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-300">{slot.day}</span>
                                <span className="text-xs font-black bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-[#F26C22] dark:text-orange-400 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">{slot.time}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Swipe ID to Enter</div>
                        <CalendarDays className="h-5 w-5 text-slate-200 dark:text-slate-700" />
                    </div>
                </div>

                {/* Women's Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Dumbbell className="h-24 w-24 text-rose-900 dark:text-rose-400" />
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-100 dark:shadow-none">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Women's Slots</h2>
                            <p className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest transition-colors">Priority Reserved</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {womenSchedule.map((slot, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-300">{slot.day}</span>
                                <span className="text-xs font-black bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">{slot.time}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gender Exclusive</div>
                        <CalendarDays className="h-5 w-5 text-slate-200 dark:text-slate-700" />
                    </div>
                </div>

            </div>

            {/* Terms Footer */}
            <div className="bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 dark:bg-white/5 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-amber-400" />
                    </div>
                    <p className="text-xs font-bold">Please wear appropriate sports attire. No denim allowed in weights area.</p>
                 </div>
                 <Link href="#" className="flex items-center gap-2 bg-[#F26C22] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#d65a16] transition-colors shadow-lg shadow-orange-500/20">
                    Gym Rules <ChevronRight className="h-4 w-4" />
                 </Link>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { 
    Phone, 
    Shield, 
    Building2, 
    HeartPulse, 
    Calendar, 
    User, 
    Clock, 
    MapPin, 
    Search,
    ChevronRight,
    ArrowRight,
    HelpCircle,
    Info,
    CalendarCheck
} from 'lucide-react';

interface DutySchedule {
    id: number;
    name: string;
    role: 'SRC' | 'Fellow';
    hostel_block: string;
    floor: string;
    duty_date: string;
    start_time: string;
    end_time: string;
    contact_number: string;
    status: 'active' | 'inactive';
}

const STATIC_CONTACTS = [
    {
        title: 'Emergency Services',
        description: 'National emergency response (Ambulance, Police, Fire).',
        phone: '999',
        icon: HeartPulse,
        badge: 'Critical Help',
        theme: 'red'
    },
    {
        title: 'Hostel Security Office',
        description: 'UniKL MIIT hostel campus 24/7 security guard post.',
        phone: '+603-2175 4119',
        icon: Shield,
        badge: '24/7 Security',
        theme: 'orange'
    },
    {
        title: 'Hostel Management Office',
        description: 'General administrative inquiries and room check-in/out.',
        phone: '+603-2175 4000',
        icon: Building2,
        badge: 'Office Hours',
        theme: 'blue'
    },
    {
        title: 'Hospital Kuala Lumpur (HKL)',
        description: 'Nearest public hospital for general medical emergencies.',
        phone: '+603-2615 5555',
        icon: HeartPulse,
        badge: 'Public Hospital',
        theme: 'emerald'
    },
    {
        title: 'Gleneagles Kuala Lumpur',
        description: 'Nearest private medical center and specialist hospital.',
        phone: '+603-4141 3000',
        icon: HeartPulse,
        badge: 'Private Medical',
        theme: 'emerald'
    }
];

const DAYS_OF_WEEK = [
    { name: 'Monday', index: 1 },
    { name: 'Tuesday', index: 2 },
    { name: 'Wednesday', index: 3 },
    { name: 'Thursday', index: 4 },
    { name: 'Friday', index: 5 },
    { name: 'Saturday', index: 6 },
    { name: 'Sunday', index: 0 }
];

export default function ContactsPage() {
    const [duties, setDuties] = useState<DutySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        fetch('/api/duty-schedules')
            .then(res => res.json())
            .then(data => {
                if (data.dutySchedules) {
                    setDuties(data.dutySchedules);
                }
            })
            .catch(err => console.error('Failed to load duty schedules:', err))
            .finally(() => setLoading(false));
    }, []);

    // Filter logic
    const filteredDuties = duties.filter(d => {
        const matchesRole = selectedRole === 'all' || d.role === selectedRole;
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              d.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              d.contact_number.includes(searchQuery);
        return matchesRole && matchesSearch;
    });

    // Helper to get duties on a specific day of the week
    const getDutiesForDay = (dayIndex: number) => {
        return filteredDuties.filter(d => {
            const date = new Date(d.duty_date);
            return date.getDay() === dayIndex;
        });
    };

    return (
        <div className="space-y-12">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
                    <span className="h-8 w-8 bg-[#F26C22]/10 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-[#F26C22]" />
                    </span>
                    Emergency & Governance
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Access urgent contacts, find scheduled SRC or Fellow shifts, and follow our escalation pathway.
                </p>
            </div>

            {/* SECTION 1: Emergency Contacts */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        🚨 Emergency Contacts
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                        Direct lines for immediate assistance, medical help, and campus security.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {STATIC_CONTACTS.map((contact, index) => {
                        const IconComponent = contact.icon;
                        const isRed = contact.theme === 'red';
                        const isOrange = contact.theme === 'orange';
                        const isBlue = contact.theme === 'blue';

                        let themeClasses = 'border-slate-100 dark:border-slate-800 hover:shadow-slate-100 dark:hover:shadow-none';
                        let badgeClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                        let iconClasses = 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                        if (isRed) {
                            themeClasses = 'border-red-100 dark:border-red-950/30 bg-red-50/10 dark:bg-red-950/5 hover:border-red-200 dark:hover:border-red-900/40 shadow-sm';
                            badgeClasses = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                            iconClasses = 'bg-red-500 text-white shadow-md shadow-red-500/20';
                        } else if (isOrange) {
                            themeClasses = 'border-orange-100 dark:border-orange-950/30 bg-orange-50/10 dark:bg-orange-950/5 hover:border-orange-200 dark:hover:border-orange-900/40 shadow-sm';
                            badgeClasses = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
                            iconClasses = 'bg-[#F26C22] text-white shadow-md shadow-orange-500/20';
                        } else if (isBlue) {
                            themeClasses = 'border-blue-100 dark:border-blue-950/30 bg-blue-50/10 dark:bg-blue-950/5 hover:border-blue-200 dark:hover:border-blue-900/40 shadow-sm';
                            badgeClasses = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                            iconClasses = 'bg-blue-500 text-white shadow-md shadow-blue-500/20';
                        }

                        return (
                            <div 
                                key={index} 
                                className={`group relative bg-white dark:bg-slate-900 rounded-[2rem] border p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 ${themeClasses}`}
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ${iconClasses}`}>
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${badgeClasses}`}>
                                            {contact.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-[#F26C22] transition-colors leading-tight">
                                            {contact.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
                                            {contact.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                    <a 
                                        href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                                        className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all border ${
                                            isRed 
                                                ? 'bg-red-500 text-white hover:bg-red-600 border-red-500' 
                                                : isOrange
                                                ? 'bg-[#F26C22] text-white hover:bg-orange-600 border-[#F26C22]'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-750'
                                        }`}
                                    >
                                        <Phone className="h-3.5 w-3.5" />
                                        Call {contact.phone}
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* SECTION 2: Weekly Schedule Table */}
            <section className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            📅 Weekly Governance Schedule
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                            Timetable layout showing assigned SRC members and Fellows on duty per block/floor.
                        </p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search on-duty list..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all w-44"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-1 rounded-xl">
                            <span className="text-[10px] font-black uppercase text-slate-400 px-2">Role</span>
                            <button
                                onClick={() => setSelectedRole('all')}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    selectedRole === 'all'
                                        ? 'bg-[#F26C22] text-white'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setSelectedRole('SRC')}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    selectedRole === 'SRC'
                                        ? 'bg-[#F26C22] text-white'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                }`}
                            >
                                SRC
                            </button>
                            <button
                                onClick={() => setSelectedRole('Fellow')}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    selectedRole === 'Fellow'
                                        ? 'bg-[#F26C22] text-white'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                }`}
                            >
                                Fellow
                            </button>
                        </div>


                    </div>
                </div>

                {loading ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-10 space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-150 dark:bg-slate-800 rounded-2xl w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                                        <th className="w-32 px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 dark:border-slate-850">
                                            Day
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Assigned On-Duty Staff & Student Representatives
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const dayDuties = getDutiesForDay(day.index);
                                        return (
                                            <tr key={day.name} className="transition-colors hover:bg-slate-50/30 dark:hover:bg-slate-850/10">
                                                <td className="px-6 py-5 align-top font-black text-slate-950 dark:text-white text-sm border-r border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-800/10">
                                                    {day.name}
                                                    {dayDuties.length > 0 && (
                                                        <span className="block mt-1.5 text-[9px] font-black uppercase text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full w-max">
                                                            {dayDuties.length} {dayDuties.length === 1 ? 'Shift' : 'Shifts'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {dayDuties.length === 0 ? (
                                                        <p className="text-slate-400 dark:text-slate-600 text-xs font-semibold py-2">
                                                            No duties scheduled for this day.
                                                        </p>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {dayDuties.map((duty) => {
                                                                const isSRC = duty.role === 'SRC';
                                                                return (
                                                                    <div 
                                                                        key={duty.id} 
                                                                        className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-orange-100 dark:hover:border-orange-950/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                                                                    >
                                                                        <div>
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                                                    isSRC
                                                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/50'
                                                                                        : 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-100/50'
                                                                                }`}>
                                                                                    {duty.role}
                                                                                </span>
                                                                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                                                    <Clock className="h-3 w-3" />
                                                                                    {duty.start_time.substring(0, 5)} - {duty.end_time.substring(0, 5)}
                                                                                </span>
                                                                            </div>
                                                                            <h4 className="font-black text-slate-900 dark:text-white text-sm">
                                                                                {duty.name}
                                                                            </h4>
                                                                            <div className="mt-2 space-y-1 text-[11px] font-semibold text-slate-500">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                                                                    <span>Floor {duty.floor}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                                                                    <span>
                                                                                        {new Date(duty.duty_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                                                            <span className="text-[10px] text-slate-400 font-bold">{duty.contact_number}</span>
                                                                            <a 
                                                                                href={`tel:${duty.contact_number.replace(/\s+/g, '')}`}
                                                                                className="py-1 px-3 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-[#F26C22] border border-slate-100 dark:border-slate-700/60 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                                                                            >
                                                                                <Phone className="h-3 w-3" />
                                                                                Call
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                );
                              })
                                                            }
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* SECTION 3: System Flow / Escalation Pathway */}
            <section className="bg-gradient-to-r from-orange-500/5 to-[#F26C22]/5 border border-orange-500/10 rounded-[2.5rem] p-8 md:p-10 space-y-8">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-[#F26C22]/10 rounded-2xl flex items-center justify-center shrink-0">
                        <HelpCircle className="h-6 w-6 text-[#F26C22]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            📢 StayUniKL Help & Escalation Pathway
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                            Follow this sequence of communication to resolve any issues quickly and efficiently.
                        </p>
                    </div>
                </div>

                {/* Pathway Stepper */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                    {/* Stepper Card 1 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between group hover:border-orange-100 dark:hover:border-orange-950/30 transition-all duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 text-[#F26C22] font-black text-xs flex items-center justify-center">
                                    01
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">First Contact</span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-sm mb-2">Check Schedule</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                View the active duty timetable above to identify the SRC or Fellow assigned to your floor/block today.
                            </p>
                        </div>
                    </div>

                    {/* Stepper Card 2 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between group hover:border-orange-100 dark:hover:border-orange-950/30 transition-all duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 text-[#F26C22] font-black text-xs flex items-center justify-center">
                                    02
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Reach Out</span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-sm mb-2">Contact Representative</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                Call the active Fellow or SRC directly using their listed phone number for initial support or room issues.
                            </p>
                        </div>
                    </div>

                    {/* Stepper Card 3 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between group hover:border-orange-100 dark:hover:border-orange-950/30 transition-all duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 text-[#F26C22] font-black text-xs flex items-center justify-center">
                                    03
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Escalate</span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-sm mb-2">Office / Security</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                If the issue is unresolved by your representative, call the Hostel Management Office or Security Office immediately.
                            </p>
                        </div>
                    </div>

                    {/* Stepper Card 4 */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between group hover:border-orange-100 dark:hover:border-orange-950/30 transition-all duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="h-8 w-8 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-md shadow-rose-500/10">
                                    04
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-wider text-rose-400">Critical</span>
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-sm mb-2">Admin Intervention</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                                High-priority incidents and critical system/maintenance issues will trigger admin intervention for final resolution.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-white/40 dark:bg-slate-900/40 rounded-2xl flex items-center gap-3.5 border border-slate-100 dark:border-slate-800/60">
                    <Info className="h-5 w-5 text-[#F26C22] shrink-0" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        <strong>Security Tip:</strong> In the event of fire, severe medical emergencies, or physical safety threats, always call national emergency services <strong>(999)</strong> first, then inform hostel security immediately.
                    </p>
                </div>
            </section>
        </div>
    );
}

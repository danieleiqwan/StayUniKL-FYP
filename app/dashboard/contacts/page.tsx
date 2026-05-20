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
    Filter,
    ExternalLink
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

export default function ContactsPage() {
    const [duties, setDuties] = useState<DutySchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlock, setSelectedBlock] = useState<string>('all');
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
        const matchesBlock = selectedBlock === 'all' || d.hostel_block === selectedBlock;
        const matchesRole = selectedRole === 'all' || d.role === selectedRole;
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              d.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              d.contact_number.includes(searchQuery);
        return matchesBlock && matchesRole && matchesSearch;
    });

    // Unique blocks for filtering
    const blocks = ['all', ...Array.from(new Set(duties.map(d => d.hostel_block)))];

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
                    Access urgent contacts and find Student Representative Council (SRC) members or Fellows currently on duty.
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

            {/* SECTION 2: SRC & Fellow Duty Schedules */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            📅 Governance Duty Schedules
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                            Find SRC members and Fellows on active duty by block or role.
                        </p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search duty list..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all w-48"
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

                        {blocks.length > 1 && (
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-1 rounded-xl">
                                <span className="text-[10px] font-black uppercase text-slate-400 px-2">Block</span>
                                <select
                                    value={selectedBlock}
                                    onChange={(e) => setSelectedBlock(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 focus:outline-none pr-4 cursor-pointer"
                                >
                                    {blocks.map(b => (
                                        <option key={b} value={b} className="bg-white dark:bg-slate-900">
                                            {b === 'all' ? 'All Blocks' : `Block ${b}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 animate-pulse space-y-4">
                                <div className="flex justify-between">
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                                    <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                </div>
                                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredDuties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                        <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                            <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active duties scheduled</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Check back later or adjust filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDuties.map((duty) => {
                            const isSRC = duty.role === 'SRC';
                            
                            return (
                                <div 
                                    key={duty.id}
                                    className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:border-orange-100 dark:hover:border-orange-950/30"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                                    isSRC 
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' 
                                                        : 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
                                                }`}>
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                        isSRC
                                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                    }`}>
                                                        {duty.role}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                duty.status === 'active' 
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {duty.status}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#F26C22] transition-colors leading-tight">
                                                {duty.name}
                                            </h3>

                                            {/* Details list */}
                                            <div className="mt-3 space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span>Block {duty.hostel_block}, Floor {duty.floor}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span>{new Date(duty.duty_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span>{duty.start_time.substring(0, 5)} - {duty.end_time.substring(0, 5)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                        <a 
                                            href={`tel:${duty.contact_number.replace(/\s+/g, '')}`}
                                            className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-750 font-bold text-xs uppercase tracking-wider transition-all"
                                        >
                                            <Phone className="h-3.5 w-3.5" />
                                            Call Contact
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

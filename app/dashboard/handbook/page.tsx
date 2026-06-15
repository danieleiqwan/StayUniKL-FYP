'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    BookOpen, 
    ArrowLeft, 
    Mail, 
    PhoneCall, 
    CheckCircle2, 
    Construction, 
    HelpCircle 
} from 'lucide-react';

export default function HostelHandbookPage() {
    const upcomingChapters = [
        {
            title: "Hostel Rules & Conduct Code",
            desc: "General guidelines regarding roommate relations, cleanliness standards, and community guidelines."
        },
        {
            title: "Check-in & Check-out Protocol",
            desc: "Step-by-step procedures, key return protocols, and checklist requirements for student move-in/move-out."
        },
        {
            title: "Curfew & Visitation Policies",
            desc: "Regulations regarding guest entries, block lockdown hours, and overnight stay permissions."
        },
        {
            title: "Safety & Emergency Response",
            desc: "Evacuation route diagrams, fire safety compliance, first-aid accessibility, and emergency hotlines."
        },
        {
            title: "Electrical Appliance Declarations",
            desc: "Details on approved electrical items, wattage limits, and registrar procedures for room appliances."
        }
    ];

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-6xl animate-in fade-in duration-300">
            {/* Header & Back Link */}
            <div className="flex flex-col gap-2">
                <Link 
                    href="/dashboard" 
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#F26C22] transition-colors w-fit"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    📖 Hostel Handbook
                </h1>
            </div>

            {/* Main WIP Showcase */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 md:p-10 lg:p-12 relative">
                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#F26C22]/5 dark:bg-[#F26C22]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                    
                    {/* Left side: Illustration */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 select-none group">
                            {/* Animated floating ring glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#F26C22]/20 to-orange-500/20 rounded-full blur-2xl opacity-60 group-hover:scale-110 transition-transform duration-700 animate-pulse" />
                            <Image 
                                src="/handbook-wip.png"
                                alt="Hostel Handbook Illustration"
                                fill
                                sizes="(max-width: 768px) 256px, 320px"
                                priority
                                className="object-contain animate-[float_4s_ease-in-out_infinite]"
                            />
                        </div>
                    </div>

                    {/* Right side: WIP Notification */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2 bg-orange-500/10 text-[#F26C22] px-3 py-1.5 rounded-xl w-max border border-orange-500/15">
                            <Construction className="h-4 w-4 animate-spin-slow" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Work in Progress</span>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                                Digitizing the StayUniKL Guide
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                We are currently developing and translating the official hostel guidelines, codes of conduct, and resident procedures into an interactive digital handbook. This module will allow you to quickly search and filter through rules and regulations direct from your dashboard.
                            </p>
                        </div>

                        {/* Checklist of upcoming sections */}
                        <div className="space-y-3.5 pt-2">
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                                Upcoming Chapters Include:
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {upcomingChapters.map((chapter, idx) => (
                                    <div 
                                        key={idx} 
                                        className="p-4 rounded-2xl border border-slate-50 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-800/20 flex gap-3 items-start hover:border-orange-500/20 transition-colors"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-[#F26C22] shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                                {chapter.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                                                {chapter.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Information / Contacts Action */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="flex gap-3 items-start">
                                <div className="h-9 w-9 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                                    <HelpCircle className="h-4.5 w-4.5 text-[#F26C22]" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        Need Immediate Information?
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                                        If you have urgent questions regarding curfew extensions, electrical usage, or room conduct, please reach out directly to the Student Affairs Department (SAD) or your block's Fellow on duty.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <Link 
                                    href="/dashboard/contacts" 
                                    className="px-5 py-2.5 bg-[#F26C22] text-white hover:bg-orange-600 transition-all rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/10"
                                >
                                    <PhoneCall className="h-3.5 w-3.5" />
                                    View On-Duty Contacts
                                </Link>
                                <a 
                                    href="mailto:support@stayunikl.edu.my" 
                                    className="px-5 py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-150 dark:border-slate-800"
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                    Email Student Affairs
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Custom CSS Animation added via global style tag to ensure it works correctly */}
            <style jsx global>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
                }
                .animate-spin-slow {
                    animation: spin 6s linear infinite;
                }
            `}</style>
        </div>
    );
}

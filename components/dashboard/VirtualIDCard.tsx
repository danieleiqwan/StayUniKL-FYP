'use client';

import React from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { IdCard, MapPin, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function VirtualIDCard() {
    const { user } = useAuth();
    const { myApplication } = useData();

    if (!user) return null;

    const qrData = JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        room: myApplication?.roomId || 'N/A',
        timestamp: new Date().toISOString()
    });

    return (
        <div className="group relative">
            {/* ID Card Container */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] p-1 shadow-2xl overflow-hidden border border-white/10 group-hover:shadow-orange-500/10 transition-all duration-500">
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                </div>

                {/* Glassy Overlay */}
                <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-[1.8rem] p-6 border border-white/5">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-[#F26C22] rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                <IdCard className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">UniKL Student ID</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Digital Access Card</p>
                            </div>
                        </div>
                        <ShieldCheck className="h-5 w-5 text-emerald-500 opacity-50" />
                    </div>

                    {/* Content Grid */}
                    <div className="flex gap-6 mb-6">
                        {/* Profile Photo */}
                        <div className="relative">
                            <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-white/10 bg-slate-800 shadow-xl">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-black text-2xl">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-6 w-6 rounded-full border-4 border-[#1E293B] flex items-center justify-center">
                                <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Full Name</p>
                                <p className="text-sm font-black text-white leading-tight">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Student ID</p>
                                <p className="text-sm font-mono font-bold text-[#F26C22] tracking-wider">{user.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* QR Section */}
                    <div className="flex items-end justify-between gap-4 pt-6 border-t border-white/5">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-[#F26C22]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident Status</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                <div className="h-1.5 w-1.5 bg-[#F26C22] rounded-full"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Stay</span>
                            </div>
                            <p className="text-[9px] text-slate-500 font-medium italic">Scanned at Check-in Hub</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-2xl shadow-2xl shadow-black/50 group-hover:scale-105 transition-transform duration-500">
                            <QRCode 
                                value={qrData}
                                size={64}
                                level="H"
                                fgColor="#0F172A"
                            />
                        </div>
                    </div>
                </div>

                {/* Decorative Accents */}
                <div className="absolute top-0 right-0 h-24 w-24 bg-[#F26C22] opacity-[0.08] blur-[40px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 h-24 w-24 bg-emerald-500 opacity-[0.05] blur-[40px] rounded-full"></div>
            </div>

            {/* Hint Overlay */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-4 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl whitespace-nowrap">
                <p className="text-[9px] font-black text-white uppercase tracking-widest">Show this to warden for access</p>
            </div>
        </div>
    );
}

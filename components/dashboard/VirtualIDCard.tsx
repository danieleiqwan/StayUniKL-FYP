'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { IdCard, MapPin, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function VirtualIDCard() {
    const { user } = useAuth();
    const { myApplication } = useData();
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
                        <button 
                            className="relative group/photo focus:outline-none focus:ring-4 focus:ring-orange-500/50 rounded-2xl"
                            onClick={() => setIsImageModalOpen(true)}
                            title="Click to enlarge photo"
                        >
                            <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-white/10 bg-slate-800 shadow-xl group-hover/photo:scale-105 transition-transform duration-500">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-800 text-white font-black text-2xl">
                                        {user.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-6 w-6 rounded-full border-4 border-[#1E293B] flex items-center justify-center z-10 group-hover/photo:scale-110 transition-transform duration-500">
                                <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </button>

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

                        <button 
                            onClick={() => setIsQrModalOpen(true)}
                            className="bg-white p-2.5 rounded-2xl shadow-2xl shadow-black/50 hover:scale-105 transition-transform duration-500 cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                            title="Click to enlarge QR Code"
                        >
                            <QRCode 
                                value={qrData}
                                size={64}
                                level="H"
                                fgColor="#0F172A"
                            />
                        </button>
                    </div>
                </div>

                {/* Decorative Accents */}
                <div className="absolute top-0 right-0 h-24 w-24 bg-[#F26C22] opacity-[0.08] blur-[40px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 h-24 w-24 bg-emerald-500 opacity-[0.05] blur-[40px] rounded-full"></div>
            </div>

            {/* Hint Overlay */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-4 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl whitespace-nowrap pointer-events-none z-10">
                <p className="text-[9px] font-black text-white uppercase tracking-widest">Click Photo or QR to Enlarge</p>
            </div>

            {/* Enlarged QR Modal */}
            {isQrModalOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setIsQrModalOpen(false)}
                >
                    <div 
                        className="bg-white p-8 rounded-[2rem] shadow-[0_0_100px_rgba(242,108,34,0.3)] animate-in zoom-in-90 duration-300 flex flex-col items-center gap-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Scan ID</h3>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Student Access</p>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-inner">
                            <QRCode 
                                value={qrData}
                                size={250}
                                level="H"
                                fgColor="#0F172A"
                            />
                        </div>

                        <button 
                            onClick={() => setIsQrModalOpen(false)}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Enlarged Image Modal */}
            {isImageModalOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <div 
                        className="bg-slate-900 p-2 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-90 duration-300 flex flex-col items-center gap-4 max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden bg-slate-800">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white font-black text-6xl">
                                    {user.name?.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="w-full px-4 pb-2 text-center">
                            <h3 className="text-xl font-black text-white">{user.name}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Student Photo</p>
                        </div>

                        <button 
                            onClick={() => setIsImageModalOpen(false)}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Users, User as UserIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Roommate {
    studentId: string;
    studentName: string;
    bedId: string;
    status: string;
    profileImage?: string;
}

export default function RoommatesCard() {
    const { user } = useAuth();
    const { myApplication, rooms } = useData();
    const [roommates, setRoommates] = useState<Roommate[]>([]);
    const [loading, setLoading] = useState(true);
    const [enlargedRoommate, setEnlargedRoommate] = useState<Roommate | null>(null);

    useEffect(() => {
        const fetchRoommates = async () => {
            if (!myApplication?.roomId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/applications/roommates?roomId=${myApplication.roomId}`);
                const data = await res.json();
                if (data.roommates) {
                    // Filter out current user
                    setRoommates(data.roommates.filter((r: Roommate) => r.studentId !== user?.id));
                }
            } catch (error) {
                console.error('Error fetching roommates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoommates();
    }, [myApplication?.roomId, user?.id]);

    if (!myApplication?.roomId) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Users className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 dark:text-white">Roommates</h2>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Sharing Room {myApplication.roomId}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-14 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : roommates.length > 0 ? (
                <div className="space-y-3">
                    {roommates.map((roommate) => (
                        <div key={roommate.studentId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                                <button 
                                    onClick={() => setEnlargedRoommate(roommate)}
                                    className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[#F26C22] font-black text-sm shadow-sm hover:scale-105 hover:shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-zoom-in overflow-hidden"
                                    title="Click to enlarge photo"
                                >
                                    {roommate.profileImage ? (
                                        <img src={roommate.profileImage} alt={roommate.studentName} className="h-full w-full object-cover" />
                                    ) : (
                                        roommate.studentName.charAt(0)
                                    )}
                                </button>
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{roommate.studentName}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Bed {roommate.bedId}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-6 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                    <UserIcon className="h-8 w-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Waiting for roommates...</p>
                </div>
            )}

            <Link href="/dashboard/about" className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-500 uppercase tracking-widest transition-colors">
                View Community Guide <ChevronRight className="h-3 w-3" />
            </Link>

            {/* Enlarged Avatar Modal */}
            {enlargedRoommate && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setEnlargedRoommate(null)}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 animate-in zoom-in-90 duration-300 flex flex-col items-center gap-4 max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50">
                            {enlargedRoommate.profileImage ? (
                                <img src={enlargedRoommate.profileImage} alt={enlargedRoommate.studentName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white dark:bg-slate-800 text-[#F26C22] font-black text-[120px]">
                                    {enlargedRoommate.studentName.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="w-full px-4 pb-2 text-center">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">{enlargedRoommate.studentName}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Bed {enlargedRoommate.bedId}</p>
                        </div>

                        <button 
                            onClick={() => setEnlargedRoommate(null)}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white font-black text-sm uppercase tracking-widest rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

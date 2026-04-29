'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Users, User as UserIcon, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Roommate {
    studentId: string;
    studentName: string;
    bedId: string;
    status: string;
}

export default function RoommatesCard() {
    const { user } = useAuth();
    const { myApplication, rooms } = useData();
    const [roommates, setRoommates] = useState<Roommate[]>([]);
    const [loading, setLoading] = useState(true);

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
                <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />
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
                        <div key={roommate.studentId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[#F26C22] font-black text-sm shadow-sm">
                                    {roommate.studentName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{roommate.studentName}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Bed {roommate.bedId}</p>
                                </div>
                            </div>
                            <button className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 text-slate-400 hover:text-emerald-500 hover:shadow-lg transition-all flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                <MessageSquare className="h-3.5 w-3.5" />
                            </button>
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
        </div>
    );
}

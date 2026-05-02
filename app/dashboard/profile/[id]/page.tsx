'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    User, Home, Mail, MapPin, 
    ChevronLeft, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function RoommateProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [targetUser, setTargetUser] = useState<any>(null);
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetch(`/api/user/${params.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setTargetUser(data.user);
                        setApplication(data.application);
                    } else {
                        setError(data.error || 'Failed to load profile');
                    }
                })
                .catch(() => setError('Error connecting to server'))
                .finally(() => setLoading(false));
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-12 w-12 border-4 border-[#F26C22] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !targetUser) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Profile Not Found</h1>
                <p className="text-slate-500 mb-6">{error || 'This user does not exist or you do not have permission to view them.'}</p>
                <button onClick={() => router.back()} className="text-[#F26C22] font-black uppercase tracking-widest text-sm hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-[#F26C22] transition-colors mb-2 text-xs font-black uppercase tracking-widest"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Student Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Viewing roommate profile information.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="p-10 border-b border-slate-50 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-32 w-32 rounded-[2.5rem] overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-2xl">
                            <img 
                                src={targetUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.name}`} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{targetUser.name}</h2>
                            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center md:justify-start gap-2">
                                <User className="h-3.5 w-3.5 text-[#F26C22]" /> {targetUser.id} • {targetUser.role}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-3">Contact Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{targetUser.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-3">Hostel Info</h3>
                            {application ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            <Home className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Unit</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {application.roomId}-{application.bedId}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-[#F26C22]/10 rounded-xl flex items-center justify-center text-[#F26C22]">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Floor & Wing</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                Level {application.floorId} • {targetUser.gender === 'Male' ? 'Alpha' : 'Beta'} Wing
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">No active hostel assignment records found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Home,
    CreditCard,
    MessageSquare,
    FileText,
    Phone,
    Mail,
    Shield,
    Clock,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    BedDouble,
    Building2,
    Users,
    Hash,
    Layers,
    MapPin,
    Globe,
    IdCard
} from 'lucide-react';

interface StudentDetailModalProps {
    studentId: string | null;
    onClose: () => void;
}

export default function StudentDetailModal({ studentId, onClose }: StudentDetailModalProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'hostel' | 'room' | 'finance' | 'support'>('profile');

    useEffect(() => {
        if (studentId) {
            setLoading(true);
            fetch(`/api/admin/student-details?studentId=${studentId}`)
                .then(res => res.json())
                .then(resData => {
                    if (resData.success) {
                        setData(resData.data);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [studentId]);

    if (!studentId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-950 w-full max-w-6xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                
                {/* ── Left Sidebar: Profile Preview ── */}
                <div className="w-80 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="h-32 w-32 rounded-[2.5rem] bg-[#F26C22] p-1 shadow-2xl shadow-orange-500/20 group cursor-pointer transition-all hover:scale-105">
                            <div className="h-full w-full rounded-[2.2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900">
                                {data?.profile?.profile_image ? (
                                    <img src={data.profile.profile_image} alt={data.profile.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black text-slate-400 uppercase">{data?.profile?.name?.charAt(0) || 'S'}</span>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-2xl shadow-lg flex items-center justify-center" title="Verified Account">
                            <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                    </div>

                    <h2 className="text-xl font-black text-slate-900 dark:text-white text-center leading-tight mb-1">{data?.profile?.name || 'Student Name'}</h2>
                    <p className="text-[10px] font-black text-[#F26C22] uppercase tracking-[0.2em] mb-8">{data?.profile?.student_id || studentId}</p>

                    <div className="w-full space-y-4">
                        <SidebarInfo label="Status" value="Active" color="text-emerald-500" />
                        <SidebarInfo label="Gender" value={data?.profile?.gender || 'N/A'} />
                        <SidebarInfo label="Joined" value={data?.profile?.created_at ? new Date(data.profile.created_at).toLocaleDateString() : 'N/A'} />
                        <SidebarInfo label="Category" value="International" />
                    </div>

                    <div className="mt-auto w-full">
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                            <p className="text-[10px] font-black text-[#F26C22] uppercase tracking-widest mb-1">Quick Note</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">"Verified for Semester 1, 2024. Documents pending for financial aid."</p>
                        </div>
                    </div>
                </div>

                {/* ── Main Content Area ── */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
                    
                    {/* Header: Breadcrumbs & Actions */}
                    <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                <span>Overview</span>
                                <span className="text-slate-300">/</span>
                                <span>Students</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-[#F26C22]">{data?.profile?.name?.split(' ')[0] || 'Profile'}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Student Details</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                Cancel
                            </button>
                            <button className="px-6 py-2.5 bg-[#F26C22] hover:bg-[#d65a16] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                                Activate Student
                            </button>
                            <button onClick={onClose} className="ml-4 p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-100 dark:border-slate-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <div className="h-12 w-12 border-4 border-[#F26C22] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Records...</p>
                        </div>
                    ) : (
                        <>
                            {/* Navigation Tabs */}
                            <div className="px-10 py-4 bg-slate-50/30 dark:bg-slate-900/10 flex gap-8 border-b border-slate-100 dark:border-slate-800">
                                <DetailTab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="Identity & Contact" />
                                <DetailTab active={activeTab === 'hostel'} onClick={() => setActiveTab('hostel')} label="Hostel History" />
                                <DetailTab active={activeTab === 'room'} onClick={() => setActiveTab('room')} label="Current Assignment" />
                                <DetailTab active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} label="Transactions" />
                                <DetailTab active={activeTab === 'support'} onClick={() => setActiveTab('support')} label="Support Log" />
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-10">
                                
                                {activeTab === 'profile' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <DetailItem label="Full Legal Name" value={data?.profile?.name || 'N/A'} icon={<User className="h-4 w-4" />} />
                                            <DetailItem label="Official Email" value={data?.profile?.email || 'N/A'} icon={<Mail className="h-4 w-4" />} />
                                            <DetailItem label="Phone Number" value={data?.profile?.phone_number || 'N/A'} icon={<Phone className="h-4 w-4" />} />
                                            <DetailItem label="Identity Number" value={data?.profile?.student_id || studentId} icon={<IdCard className="h-4 w-4" />} />
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-[#F26C22]" /> Permanent Address
                                            </h4>
                                            <div className="grid grid-cols-3 gap-8">
                                                <div className="col-span-3">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Street Address</p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">{data?.profile?.address || 'N/A'}</p>
                                                </div>
                                                <DetailItem label="City" value={data?.profile?.city || 'N/A'} />
                                                <DetailItem label="State" value={data?.profile?.state || 'N/A'} />
                                                <DetailItem label="Postcode" value={data?.profile?.postcode || 'N/A'} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <EmergencyCard 
                                                title="Emergency Contact 1" 
                                                name={data?.profile?.emergency_contact1_name}
                                                phone={data?.profile?.emergency_contact1_phone}
                                                relation={data?.profile?.emergency_contact1_relation}
                                            />
                                            <EmergencyCard 
                                                title="Emergency Contact 2" 
                                                name={data?.profile?.emergency_contact2_name}
                                                phone={data?.profile?.emergency_contact2_phone}
                                                relation={data?.profile?.emergency_contact2_relation}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'hostel' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                        {data.applications.map((app: any, i: number) => (
                                            <div key={app.id} className="group relative pl-10">
                                                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
                                                <div className="absolute left-0 top-1 h-6 w-6 rounded-xl bg-white dark:bg-slate-950 border-4 border-[#F26C22] shadow-sm z-10"></div>
                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:border-orange-200 dark:group-hover:border-orange-900/30 transition-all">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">{app.roomType} Room Assignment</h4>
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                            app.status === 'Approved' || app.status === 'Checked in' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            {app.status}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-4">
                                                        <DetailItem label="Room ID" value={app.roomId || 'N/A'} />
                                                        <DetailItem label="Bed" value={app.bedId || 'N/A'} />
                                                        <DetailItem label="Amount" value={`RM${app.totalPrice}`} />
                                                        <DetailItem label="Date" value={new Date(app.date).toLocaleDateString()} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'room' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {!data.roomDetails ? (
                                            <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active assignment found</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-8">
                                                <div className="col-span-3 p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-800/50 rounded-2xl flex items-center justify-center text-emerald-600">
                                                            <Home className="h-7 w-7" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">Currently Residing</p>
                                                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Room {data.roomDetails.room_number}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in Status</p>
                                                        <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                                            {data.roomDetails.application_status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <DetailItem label="Wing / Block" value={`${data.roomDetails.wing} Wing`} icon={<Building2 className="h-4 w-4" />} />
                                                <DetailItem label="Floor Level" value={`Floor ${data.roomDetails.floor}`} icon={<Layers className="h-4 w-4" />} />
                                                <DetailItem label="Room Type" value={data.roomDetails.room_type} icon={<Home className="h-4 w-4" />} />
                                                <DetailItem label="Assigned Bed" value={data.roomDetails.assigned_bed} icon={<BedDouble className="h-4 w-4" />} />
                                                <DetailItem label="Occupancy" value={`${data.roomDetails.occupied_beds} / ${data.roomDetails.capacity}`} icon={<Users className="h-4 w-4" />} />
                                                <DetailItem label="Facility Status" value={data.roomDetails.room_status} icon={<Shield className="h-4 w-4" />} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'finance' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                                    <tr>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                    {data.payments.map((p: any) => (
                                                        <tr key={p.id} className="hover:bg-white dark:hover:bg-slate-900 transition-colors">
                                                            <td className="px-8 py-5 font-mono text-xs font-bold text-slate-500 uppercase">{p.id.substring(0, 12)}...</td>
                                                            <td className="px-8 py-5 text-sm font-black text-emerald-600">RM{p.amount}</td>
                                                            <td className="px-8 py-5"><span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase text-slate-500">{p.method}</span></td>
                                                            <td className="px-8 py-5 text-right text-xs font-bold text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'support' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                        {data.complaints.map((c: any) => (
                                            <div key={c.id} className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Issue Reported</p>
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{c.title}</h4>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                        c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{c.description}</p>
                                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(c.date).toLocaleDateString()}</span>
                                                    {c.technician_appointment && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F26C22]/10 text-[#F26C22] rounded-lg">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Appointment: {new Date(c.technician_appointment).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function SidebarInfo({ label, value, color = "text-slate-900 dark:text-white" }: any) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className={`text-xs font-black ${color}`}>{value}</span>
        </div>
    );
}

function DetailTab({ active, onClick, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                active ? 'text-[#F26C22]' : 'text-slate-400 hover:text-slate-600'
            }`}
        >
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F26C22] rounded-full"></div>}
        </button>
    );
}

function DetailItem({ label, value, icon }: any) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {icon} {label}
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white">{value || 'Not Specified'}</p>
        </div>
    );
}

function EmergencyCard({ title, name, phone, relation }: any) {
    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-[#F26C22] uppercase tracking-[0.2em] mb-4">{title}</p>
            <div className="space-y-4">
                <DetailItem label="Full Name" value={name} />
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Relation" value={relation} />
                    <DetailItem label="Phone" value={phone} />
                </div>
            </div>
        </div>
    );
}

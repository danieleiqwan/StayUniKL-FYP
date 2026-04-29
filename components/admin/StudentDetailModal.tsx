'use client';

import { useState, useEffect } from 'react';
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
    Layers
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#F26C22] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Student Comprehensive Review</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">ID: {studentId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="h-12 w-12 border-4 border-[#F26C22] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-bold animate-pulse">Aggregating student data...</p>
                    </div>
                ) : !data ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <p className="text-slate-900 dark:text-white font-bold text-lg">Failed to load student data</p>
                        <button onClick={onClose} className="mt-4 text-[#F26C22] font-bold underline">Close Modal</button>
                    </div>
                ) : (
                    <>
                        {/* Tab Bar */}
                        <div className="px-6 py-2 bg-white dark:bg-slate-950 flex gap-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
                            <TabBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<Shield className="h-4 w-4" />} label="Identity" />
                            <TabBtn active={activeTab === 'hostel'} onClick={() => setActiveTab('hostel')} icon={<Home className="h-4 w-4" />} label="Hostel History" />
                            <TabBtn active={activeTab === 'room'} onClick={() => setActiveTab('room')} icon={<BedDouble className="h-4 w-4" />} label="Room Details" />
                            <TabBtn active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<CreditCard className="h-4 w-4" />} label="Financials" />
                            <TabBtn active={activeTab === 'support'} onClick={() => setActiveTab('support')} icon={<MessageSquare className="h-4 w-4" />} label="Support Log" />
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-900/10">

                            {activeTab === 'profile' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoCard label="Full Name" value={data.profile.name} icon={<User className="h-4 w-4 text-orange-500" />} />
                                        <InfoCard label="UniKL Email" value={data.profile.email} icon={<Mail className="h-4 w-4 text-blue-500" />} />
                                        <InfoCard label="Contact Number" value={data.profile.phone_number || 'N/A'} icon={<Phone className="h-4 w-4 text-green-500" />} />
                                        <InfoCard label="Emergency Contact (Parent)" value={data.profile.parent_phone_number || 'N/A'} icon={<Phone className="h-4 w-4 text-red-500" />} />
                                        <InfoCard label="Gender" value={data.profile.gender} icon={<Shield className="h-4 w-4 text-[#F26C22]" />} />
                                        <InfoCard label="Account Created" value={new Date(data.profile.created_at).toLocaleDateString()} icon={<Clock className="h-4 w-4 text-slate-500" />} />
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-[#F26C22]" /> Documents Status
                                        </h3>
                                        {data.documents.length === 0 ? (
                                            <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {data.documents.map((doc: any) => (
                                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-[#F26C22]">
                                                                <FileText className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{doc.type}</p>
                                                                <p className="text-[10px] text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' :
                                                            doc.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {doc.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'hostel' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                                    {data.applications.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500">No application history found.</div>
                                    ) : (
                                        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-8 space-y-8">
                                            {data.applications.map((app: any) => (
                                                <div key={app.id} className="relative">
                                                    <div className="absolute -left-[41px] top-1 h-6 w-6 rounded-full bg-white dark:bg-slate-950 border-4 border-[#F26C22] shadow-sm"></div>
                                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">{app.roomType} Room</h4>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                                    (app.durationType === '1_semester' || app.stayDuration === 4)
                                                                        ? 'bg-orange-100 text-[#F26C22] dark:bg-orange-900/30 dark:text-orange-300'
                                                                        : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                                                                }`}>
                                                                    {(app.durationType === '1_semester' || app.stayDuration === 4) ? '1 Semester' : '1 Month'}
                                                                </span>
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${app.status === 'Approved' || app.status === 'Checked in' ? 'bg-green-100 text-green-700' :
                                                                    app.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                                                    }`}>
                                                                    {app.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Room</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-300">{app.roomId || 'Not Assigned'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Bed Position</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-300">{app.bedId || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Stay Duration</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                                                    {(app.durationType === '1_semester' || app.stayDuration === 4) ? '4 Months (1 Semester)' : '1 Month'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Price</p>
                                                                <p className="font-bold text-orange-600">RM{app.totalPrice}</p>
                                                            </div>
                                                            <div className="col-span-2 pt-2 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center text-[11px]">
                                                                <span className="text-slate-500 font-medium">Applied on {new Date(app.date).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'room' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                                    {!data.roomDetails ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="mb-4 h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <BedDouble className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <p className="font-bold text-slate-900 dark:text-white">No Room Assigned</p>
                                            <p className="text-sm text-slate-500 mt-1">This student has not been assigned to a room yet.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Status Banner */}
                                            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${
                                                data.roomDetails.application_status === 'Checked in'
                                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                                    : 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                                            }`}>
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                                    data.roomDetails.application_status === 'Checked in'
                                                        ? 'bg-green-100 dark:bg-green-800'
                                                        : 'bg-orange-100 dark:bg-orange-800'
                                                }`}>
                                                    <BedDouble className={`h-5 w-5 ${
                                                        data.roomDetails.application_status === 'Checked in'
                                                            ? 'text-green-600 dark:text-green-300'
                                                            : 'text-orange-600 dark:text-orange-300'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Current Status</p>
                                                    <p className={`font-black text-sm ${
                                                        data.roomDetails.application_status === 'Checked in'
                                                            ? 'text-green-700 dark:text-green-300'
                                                            : 'text-orange-700 dark:text-orange-300'
                                                    }`}>{data.roomDetails.application_status}</p>
                                                </div>
                                            </div>

                                            {/* Main Info Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <RoomInfoCard
                                                    icon={<Hash className="h-4 w-4 text-[#F26C22]" />}
                                                    label="Room Number"
                                                    value={data.roomDetails.room_number}
                                                />
                                                <RoomInfoCard
                                                    icon={<Building2 className="h-4 w-4 text-[#F26C22]" />}
                                                    label="Block / Wing"
                                                    value={`${data.roomDetails.wing} Wing`}
                                                />
                                                <RoomInfoCard
                                                    icon={<Layers className="h-4 w-4 text-blue-500" />}
                                                    label="Floor"
                                                    value={`Floor ${data.roomDetails.floor}`}
                                                />
                                                <RoomInfoCard
                                                    icon={<Home className="h-4 w-4 text-purple-500" />}
                                                    label="Room Type"
                                                    value={data.roomDetails.room_type}
                                                />
                                                <RoomInfoCard
                                                    icon={<Users className="h-4 w-4 text-teal-500" />}
                                                    label="Capacity"
                                                    value={`${data.roomDetails.capacity} persons`}
                                                />
                                                <RoomInfoCard
                                                    icon={<BedDouble className="h-4 w-4 text-pink-500" />}
                                                    label="Assigned Bed"
                                                    value={data.roomDetails.assigned_bed || 'Not Specified'}
                                                />
                                            </div>

                                            {/* Occupancy Card */}
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-[#F26C22]" /> Occupancy Overview
                                                </h3>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#F26C22] rounded-full transition-all duration-700"
                                                            style={{ width: `${data.roomDetails.capacity > 0 ? (Number(data.roomDetails.occupied_beds) / data.roomDetails.capacity) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                        {data.roomDetails.occupied_beds}/{data.roomDetails.capacity} occupied
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{data.roomDetails.capacity}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Total Beds</p>
                                                    </div>
                                                    <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                                                        <p className="text-2xl font-black text-red-600 dark:text-red-400">{data.roomDetails.occupied_beds}</p>
                                                        <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Occupied</p>
                                                    </div>
                                                    <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                                                        <p className="text-2xl font-black text-green-600 dark:text-green-400">{data.roomDetails.available_beds}</p>
                                                        <p className="text-[10px] text-green-500 font-bold uppercase mt-1">Available</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Room Status Badge */}
                                            <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Shield className="h-5 w-5 text-slate-400" />
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Room Facility Status</p>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">Operational Condition</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                                                    data.roomDetails.room_status === 'Active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {data.roomDetails.room_status}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'finance' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                                                <tr>
                                                    <th className="px-6 py-4">Transaction ID</th>
                                                    <th className="px-6 py-4">Reference</th>
                                                    <th className="px-6 py-4">Amount</th>
                                                    <th className="px-6 py-4">Method</th>
                                                    <th className="px-6 py-4 text-right">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {data.payments.length === 0 ? (
                                                    <tr><td colSpan={5} className="p-10 text-center text-slate-500 italic">No payment records.</td></tr>
                                                ) : (
                                                    data.payments.map((pay: any) => (
                                                        <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                            <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white uppercase">{pay.id}</td>
                                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{pay.reference_id}</td>
                                                            <td className="px-6 py-4 text-green-600 dark:text-green-400 font-black">RM{pay.amount}</td>
                                                            <td className="px-6 py-4"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-slate-500">{pay.method}</span></td>
                                                            <td className="px-6 py-4 text-right text-slate-400">{new Date(pay.created_at).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'support' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                                    {data.complaints.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500 italic">No historical complaints reported.</div>
                                    ) : (
                                        data.complaints.map((comp: any) => (
                                            <div key={comp.id} className="bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-red-500">
                                                <div className="p-5 pb-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{comp.title}</h4>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${comp.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {comp.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{comp.description}</p>
                                                    
                                                    {comp.images && comp.images.length > 0 && (
                                                        <div className="mb-3">
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Attached Photos</p>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {comp.images.map((src: string, i: number) => (
                                                                    <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                                                                        <img
                                                                            src={src}
                                                                            alt={`Complaint image ${i + 1}`}
                                                                            className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 hover:opacity-80 hover:scale-105 transition-all cursor-pointer shadow-sm"
                                                                        />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800/50">
                                                        <span className="text-[10px] text-slate-400 font-medium">{new Date(comp.date).toLocaleDateString()}</span>
                                                        {comp.technician_appointment && (
                                                            <span className="text-[10px] text-[#F26C22] font-bold flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">
                                                                <Clock className="h-3 w-3" /> Appt: {new Date(comp.technician_appointment).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Footer / Actions */}
                        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-500/10 hover:shadow-xl transition-all active:scale-95"
                            >
                                Close Account Review
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${active
                ? 'text-[#F26C22] border-b-2 border-[#F26C22] rounded-none'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
        >
            {icon} {label}
        </button>
    );
}

function InfoCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-orange-200 dark:hover:border-orange-900/50">
            <div className="flex items-center gap-2 mb-1.5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                {icon} {label}
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{value}</p>
        </div>
    );
}

function RoomInfoCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-orange-200 dark:hover:border-orange-900/50">
            <div className="flex items-center gap-2 mb-1.5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                {icon} {label}
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
    User, Lock, Home, Bell, Palette, Camera, Mail, 
    Phone, MapPin, ShieldCheck, Moon, Globe, 
    LogOut, CheckCircle2, ChevronRight, AlertCircle, Save,
    CreditCard, FileText, Wrench, ArrowRight, IdCard
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, setUser, updateProfile } = useAuth();
    const { myApplication, myComplaints, rooms } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Dynamic Data
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetch(`/api/billing/invoices?userId=${user.id}`).then(res => res.json()).then(data => { if (data.invoices) setInvoices(data.invoices); });
        }
    }, [user]);

    if (!user) return null;

    const appOwed = myApplication?.status === 'Payment Pending' ? Number(myApplication.totalPrice) : 0;
    const outstandingTotal = invoices.filter(i => i.status === 'Unpaid').reduce((acc, curr) => acc + parseFloat(curr.amount), 0) + appOwed;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setMsg({ type: 'error', text: 'Please upload an image file.' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setMsg({ type: 'error', text: 'Image size must be less than 5MB.' });
            return;
        }

        setIsSaving(true);
        setMsg(null);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                await updateProfile({ profileImage: base64String });
                setMsg({ type: 'success', text: 'Profile picture updated!' });
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setMsg({ type: 'error', text: 'Failed to upload image.' });
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Identity', icon: User, desc: 'Official student credentials' },
        { id: 'billing', label: 'Financials', icon: CreditCard, desc: 'Payments, invoices & balance' },
        { id: 'hostel', label: 'My Stay', icon: Home, desc: 'Room details & hostel info' },
    ];

    const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || User;

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Student Profile</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">View your official records and hostel status.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation */}
                <aside className="lg:w-72 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-sm border border-slate-100 dark:border-slate-800 sticky top-8 transition-colors">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActiveTab = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all mb-1 group ${
                                        isActiveTab ? 'bg-[#F26C22] text-white shadow-xl shadow-orange-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 ${isActiveTab ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <div className="text-left">
                                        <p className="text-sm font-bold leading-none">{tab.label}</p>
                                    </div>
                                    {isActiveTab && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 min-h-[600px]">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                        <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-800">                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-10 w-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-[#F26C22] dark:text-orange-400">
                                    <ActiveIcon className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h2>
                            </div>
                            <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">{tabs.find(t => t.id === activeTab)?.desc}</p>
                        </div>

                        <div className="p-6 md:p-10">
                            {/* Identity Section - READ ONLY */}
                            {activeTab === 'profile' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 pb-8 border-b border-slate-50 dark:border-slate-800">
                                        <div className="relative group shrink-0">
                                            <div className="h-28 w-28 md:h-32 md:w-32 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-2xl relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                <img 
                                                    src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                                                    alt="Avatar" 
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                />
                                                <button 
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    disabled={isSaving}
                                                >
                                                    <Camera className="h-8 w-8 text-white animate-in zoom-in-50 duration-300" />
                                                </button>
                                            </div>
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap z-10 pointer-events-none transition-transform group-hover:scale-105 duration-300 border-2 border-white dark:border-slate-800">
                                                Change Photo
                                            </div>
                                            <input 
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                        <div className="text-center md:text-left flex-1 min-w-0">
                                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Official Identity</h3>
                                            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Verified credentials for StayUniKL management.</p>
                                        </div>
                                        <div className="md:ml-auto w-full md:w-auto">
                                            <Link href="/dashboard/settings" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none">
                                                <Wrench className="h-4 w-4" /> Edit Identity
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Detailed Information Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Core Stats */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Core Records</h4>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 space-y-5 border border-slate-100 dark:border-slate-800">
                                                <ProfileInfoItem icon={<User className="h-4 w-4 text-orange-500" />} label="Full Name" value={user.name} />
                                                <ProfileInfoItem icon={<Mail className="h-4 w-4 text-blue-500" />} label="Email Address" value={user.email} />
                                                <ProfileInfoItem icon={<ShieldCheck className="h-4 w-4 text-[#F26C22]" />} label="Student ID" value={user.studentId || 'Pending Update'} />
                                                <ProfileInfoItem icon={<Phone className="h-4 w-4 text-emerald-500" />} label="Phone Number" value={user.phoneNumber || 'Not Provided'} />
                                            </div>
                                        </div>

                                        {/* Other Records */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Other Records</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
                                                    <ProfileInfoItem icon={<User className="h-4 w-4 text-purple-500" />} label="Gender" value={user.gender} />
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
                                                    <ProfileInfoItem icon={<ShieldCheck className="h-4 w-4 text-rose-500" />} label="NRIC / Passport" value={user.nric || 'Pending Update'} />
                                                </div>
                                                {/* Added Student ID Card under Gender Card - Spans 2 columns on tablet to fix alignment */}
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                                                    <ProfileInfoItem icon={<IdCard className="h-4 w-4 text-blue-500" />} label="Student ID Card" value={user.studentId || user.id} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Records */}
                                        <div className="md:col-span-2 space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Hometown Address</h4>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 space-y-5 border border-slate-100 dark:border-slate-800 h-full">
                                                <div className="flex gap-4">
                                                    <div className="h-8 w-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 shadow-sm">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Street Address</p>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                                                            {user.address || 'No address provided'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <ProfileInfoItem icon={<Globe className="h-4 w-4 text-slate-400" />} label="City" value={user.city || '—'} />
                                                    <ProfileInfoItem icon={<Globe className="h-4 w-4 text-slate-400" />} label="State" value={user.state || '—'} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Emergency Contacts */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Emergency Contacts (Parent/Guardian)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[1, 2].map(num => (
                                                <div key={num} className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                                                    <p className="text-[10px] font-black text-[#F26C22] uppercase tracking-[0.2em] mb-6">Contact #{num}</p>
                                                    <div className="space-y-6 relative z-10">
                                                        <ProfileInfoItem 
                                                            icon={<User className="h-4 w-4 text-slate-400" />} 
                                                            label="Full Name" 
                                                            value={(user as any)[`emergencyContact${num}Name`] || '—'} 
                                                        />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <ProfileInfoItem 
                                                                icon={<AlertCircle className="h-4 w-4 text-slate-400" />} 
                                                                label="Relation" 
                                                                value={(user as any)[`emergencyContact${num}Relation`] || '—'} 
                                                            />
                                                            <ProfileInfoItem 
                                                                icon={<Phone className="h-4 w-4 text-slate-400" />} 
                                                                label="Phone" 
                                                                value={(user as any)[`emergencyContact${num}Phone`] || '—'} 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8 bg-orange-50 dark:bg-orange-900/20 rounded-[2rem] md:rounded-[2.5rem] border border-orange-100 dark:border-orange-900/30 flex flex-col md:flex-row items-center gap-6">
                                        <div className="h-14 w-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-[#F26C22] shadow-sm flex-shrink-0">
                                            <AlertCircle className="h-6 w-6" />
                                        </div>
                                        <div className="text-center md:text-left flex-1">
                                            <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Maintaining Accuracy</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                                Keep your records up to date to ensure official correspondence and emergency protocols are handled correctly.
                                            </p>
                                        </div>
                                        <Link href="/dashboard/settings" className="w-full md:w-auto px-8 py-4 bg-[#F26C22] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d65a16] transition-all flex items-center justify-center gap-2">
                                            Go to Settings <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}



                            {/* Billing Section */}
                            {activeTab === 'billing' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                                            <h3 className="text-4xl font-black mb-6">RM {outstandingTotal.toFixed(2)}</h3>
                                            <Link href="/dashboard/payment" className="inline-flex bg-[#F26C22] hover:bg-[#d65a16] px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                                Pay Now
                                            </Link>
                                        </div>
                                        <CreditCard className="absolute -right-6 -bottom-6 h-32 w-32 text-[#F26C22]/10 transition-transform group-hover:scale-125 duration-700" />
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Recent Invoices</h3>
                                        {invoices.length > 0 ? invoices.map((inv, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{inv.description}</p>
                                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">{inv.due_date}</p>
                                                    </div>
                                                </div>
                                                <p className="font-black text-slate-900 dark:text-white text-sm">RM {inv.amount}</p>
                                            </div>
                                        )) : (
                                            <div className="py-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-700 italic text-slate-400 dark:text-slate-600 text-sm">No recent billing activity</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* My Stay Section */}
                            {activeTab === 'hostel' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {myApplication ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] p-8">
                                                {(() => {
                                                    const myRoom = rooms.find(r => r.id === myApplication?.roomId);
                                                    const myBed = myRoom?.beds.find(b => b.id === myApplication?.bedId);
                                                    const bedLabel = myBed?.label || myApplication?.bedId;
                                                    const displayRoom = myApplication?.roomId ? `${myApplication.roomId}${bedLabel ? '-' + bedLabel : ''}` : 'N/A';
                                                    
                                                    return (
                                                        <>
                                                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Hostel Assignment</p>
                                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Unit {displayRoom}</h3>
                                                            <p className="text-[#F26C22] dark:text-orange-400 font-bold mb-6">Bed {bedLabel || '—'} • {myApplication.roomType}</p>
                                                            <div className="flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                                <MapPin className="h-4 w-4 text-[#F26C22] dark:text-orange-400" /> MIIT Wing • Floor {myApplication.floorId}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <div className="space-y-4">
                                                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 border-l-[6px] border-l-emerald-400">
                                                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Tenancy Status</p>
                                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Checked In • Active</p>
                                                </div>
                                                <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-3xl border border-orange-100 dark:border-orange-900/30 border-l-[6px] border-l-[#F26C22]">
                                                    <p className="text-xs font-black text-[#F26C22] dark:text-orange-400 uppercase tracking-widest mb-1">Contract Duration</p>
                                                    <p className="text-sm font-bold text-[#F26C22] dark:text-orange-400">
                                                        {myApplication.stayDuration === 4 ? 'Full Semester' : 
                                                         myApplication.stayDuration === 1 ? '1 Month' : 
                                                         `${myApplication.stayDuration} Months`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center italic text-slate-400">No active hostel records found.</div>
                                    )}
                                </div>
                            )}

                             {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-6 max-w-md">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Change Password</h3>
                                        <input type="password" placeholder="Current Password" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F26C22] dark:text-white transition-all" />
                                        <input type="password" placeholder="New Password" className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-[#F26C22] dark:text-white transition-all" />
                                        <button className="w-full bg-slate-900 dark:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#F26C22] transition-all">Update Access</button>
                                    </div>
                                </div>
                            )}



                            {/* Notifications Placeholder */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    {['Bookings', 'Maintenance', 'Billing', 'Announcements'].map(n => (
                                        <div key={n} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl transition-colors">
                                            <p className="font-black text-slate-800 dark:text-white text-sm tracking-tight">{n} Alerts</p>
                                            <div className="w-12 h-6 bg-[#F26C22] rounded-full relative">
                                                <div className="absolute right-1 top-1 h-4 w-4 bg-white dark:bg-slate-200 rounded-full"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function ProfileInfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 group/item">
            <div className="h-8 w-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 shadow-sm transition-colors group-hover/item:text-slate-600 dark:group-hover/item:text-slate-200">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value}</p>
            </div>
        </div>
    );
}

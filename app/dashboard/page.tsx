'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Wrench,
    CalendarDays,
    FileText,
    Check,
    Bell,
    ChevronRight,
    Clock,
    AlertTriangle,
    CreditCard,
    CalendarCheck,
    Dumbbell,
    WashingMachine,
    BookOpen,
    Phone,
    ArrowRight,
    Home,
    Hand,
} from 'lucide-react';
import VirtualIDCard from '@/components/dashboard/VirtualIDCard';
import RoommatesCard from '@/components/dashboard/RoommatesCard';
import BillingHistory from '@/components/dashboard/BillingHistory';

export default function StudentDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { myApplication, myComplaints, courtBookings, rooms } = useData();

    if (!user) return null;

    // Derived States
    const isPaymentPending = myApplication?.status === 'Payment Pending';
    const myAllBookings = courtBookings.filter(b => b.studentId === user.id);
    const activeBookingsCount = myAllBookings.filter(b => b.status === 'Approved' || b.status === 'Pending').length;
    const pendingComplaintsCount = myComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length;
    const recentComplaints = myComplaints.slice(0, 3);
    const activeBookings = myAllBookings.filter(b => b.status === 'Approved' || b.status === 'Pending');
    const upcomingBookings = [...activeBookings]
        .filter(b => new Date(b.date).setHours(23, 59, 59, 999) >= new Date().getTime())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recentBookings = upcomingBookings.slice(0, 2);

    const isApplied = !!myApplication;
    const appStatus = myApplication?.status;
    const isApproved = appStatus === 'Approved' || appStatus === 'Payment Pending' || appStatus === 'Checked in';
    const isCheckedIn = appStatus === 'Checked in';
    
    const myRoom = rooms.find(r => r.id === myApplication?.roomId);
    const myBed = myRoom?.beds.find(b => b.id === myApplication?.bedId);
    const bedLabel = myBed?.label || myApplication?.bedId;
    const displayRoom = myApplication?.roomId ? `${myApplication.roomId}${bedLabel ? '-' + bedLabel : ''}` : 'N/A';

    const [greeting, setGreeting] = useState('Welcome');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    const getComplaintStatusStyle = (status: string) => {
        if (status === 'Resolved') return { text: 'Resolved', cls: 'bg-emerald-100 text-emerald-700' };
        if (status === 'In Progress') return { text: 'In Progress', cls: 'bg-blue-100 text-blue-700' };
        return { text: 'Pending', cls: 'bg-amber-100 text-amber-700' };
    };

    // Court slot counts (mock based on date)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
    const todayBookings = courtBookings.filter(b => b.date === todayStr && b.status === 'Approved').length;
    const tomorrowBookings = courtBookings.filter(b => b.date === tomorrowStr && b.status === 'Approved').length;
    const todaySlots = Math.max(0, 14 - todayBookings);
    const tomorrowSlots = Math.max(0, 14 - tomorrowBookings);
    const weekSlots = Math.max(0, 98 - myAllBookings.length * 2); // 14 slots * 7 days = 98

    return (
        <div className="max-w-[1400px] mx-auto space-y-6">

            {/* Payment Urgent Banner */}
            {isPaymentPending && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-orange-100">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="text-white">
                            <p className="font-black text-sm">Payment Required</p>
                            <p className="text-xs opacity-90">Complete your fee of <span className="font-bold underline">RM {Number(myApplication?.totalPrice).toFixed(2)}</span> to secure your room.</p>
                        </div>
                    </div>
                    <Link
                        href={`/dashboard/payment?amount=${myApplication?.totalPrice}&ref=${myApplication?.id}`}
                        className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-black text-xs tracking-widest uppercase hover:bg-orange-50 transition-all whitespace-nowrap shrink-0"
                    >
                        Pay Now →
                    </Link>
                </div>
            )}

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
                        {greeting}, {user.name.split(' ')[0]} <Hand className="h-6 w-6 text-[#F26C22]" />
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here's your stay at a glance.</p>
                </div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
                    {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT COLUMN — 2/3 */}
                <div className="xl:col-span-2 space-y-6">

                    {/* HERO: Room Assignment Card */}
                    <div className={`relative rounded-2xl overflow-hidden text-white ${isCheckedIn ? 'bg-gradient-to-br from-[#F26C22] via-orange-500 to-amber-500' : 'bg-gradient-to-br from-slate-700 to-slate-800'}`}>
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 h-52 w-52 bg-white/5 rounded-full"></div>
                        <div className="absolute -bottom-12 -left-8 h-40 w-40 bg-white/5 rounded-full"></div>

                        <div className="relative p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${isCheckedIn ? 'bg-white/20' : 'bg-white/10'}`}>
                                    {isCheckedIn ? '● Currently Staying' : '○ Not Assigned'}
                                </span>
                                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Current Assignment</span>
                            </div>

                            <div className="flex items-start justify-between gap-4 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <Home className="h-6 w-6 opacity-70" />
                                        <h2 className="text-5xl font-black tracking-tight">
                                            {displayRoom}
                                        </h2>
                                    </div>
                                    <p className="text-sm opacity-70 font-medium mt-1">
                                        {myApplication?.roomType || 'No active application'} ·&nbsp;
                                        {user.gender === 'Male' ? 'Alpha Wing' : 'Beta Wing'} · {myRoom ? `Floor ${myRoom.floorId}` : 'Ground Floor'}
                                    </p>
                                </div>
                            </div>

                            {/* Stat Row */}
                            <div className="grid grid-cols-3 gap-4 mb-8 pt-6 border-t border-white/10">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Tenancy</p>
                                    <p className="text-sm font-bold">{myApplication?.sessionType || 'Full Academic Year'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Move In</p>
                                    <p className="text-sm font-bold">
                                        {myApplication?.checkInDate
                                            ? new Date(myApplication.checkInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Room Occupancy</p>
                                    <p className="text-sm font-bold">
                                        {myRoom ? `${myRoom.beds.filter(b => b.isOccupied).length} student${myRoom.beds.filter(b => b.isOccupied).length > 1 ? 's' : ''}` : '—'}
                                    </p>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Link href="/dashboard/apply" className="flex items-center gap-2 bg-white text-[#F26C22] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-orange-50 transition-all">
                                    View room details <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                                <Link href="/dashboard/room-change" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                                    Request room change
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Middle Row: Application + Court Booking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Hostel Application Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-colors">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#F26C22]" />
                                    <h2 className="text-sm font-black text-slate-800 dark:text-white">Hostel Application</h2>
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500">{myApplication?.id ? `#${myApplication.id.toString().slice(0, 6)}` : 'No application'}</span>
                            </div>

                            {/* Progress Steps */}
                            <div className="relative flex justify-between items-start px-2 my-6">
                                <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-100 dark:bg-slate-800 z-0">
                                    <div className={`h-full bg-[#F26C22] transition-all duration-700 ${isCheckedIn ? 'w-full' : isApproved ? 'w-1/2' : isApplied ? 'w-0' : 'w-0'}`}></div>
                                </div>
                                {[
                                    { label: 'Apply', done: isApplied },
                                    { label: 'Review', done: isApproved },
                                    { label: 'Stay', done: isCheckedIn },
                                ].map((step, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 z-10">
                                        <div className={`h-7 w-7 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 ${step.done ? 'bg-[#F26C22] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
                                            {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="text-xs font-black">{i + 1}</span>}
                                        </div>
                                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight">{step.label}</span>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                {isCheckedIn
                                    ? `Application submitted. Approved. You're currently in residence.`
                                    : isApproved
                                    ? 'Application approved. Complete payment to check in.'
                                    : isApplied
                                    ? 'Application submitted. Awaiting review.'
                                    : 'No application submitted yet.'}
                            </p>
                            <Link href="/dashboard/apply" className="text-xs font-black text-[#F26C22] dark:text-orange-400 hover:underline flex items-center gap-1">
                                Track application <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                        {/* Court Booking Widget */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-colors">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-[#F26C22]" />
                                    <h2 className="text-sm font-black text-slate-800 dark:text-white">Court Booking</h2>
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500">Available now</span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Reserve a slot for badminton, table tennis, or basketball.</p>

                            {/* Slot Counts */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[
                                    { label: 'Today', slots: todaySlots },
                                    { label: 'Tomorrow', slots: tomorrowSlots },
                                    { label: 'This Week', slots: weekSlots },
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{item.slots}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">slots</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => router.push('/dashboard/court')}
                                className="w-full flex items-center justify-center gap-2 bg-[#F26C22] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#d65a16] shadow-md shadow-orange-500/10 transition-all"
                            >
                                Reserve slot <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Billing History Section */}
                    <BillingHistory />

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-colors">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-sm font-black text-slate-800 dark:text-white">Recent activity</h2>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Last 30 days</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs font-black text-[#F26C22] dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">Maintenance</span>
                                <Link href="/dashboard/court/history" className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full transition-colors">Bookings</Link>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {recentComplaints.length > 0 ? recentComplaints.map((complaint) => {
                                const status = getComplaintStatusStyle(complaint.status);
                                return (
                                    <div key={complaint.id} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0 group hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-xl transition-colors cursor-pointer" onClick={() => router.push('/dashboard/complaints')}>
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                                                <Wrench className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{complaint.title}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">MR-{complaint.id} · Room {displayRoom}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-2">
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                {new Date(complaint.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </span>
                                            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${status.cls}`}>{status.text}</span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-10 text-center">
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN — 1/3 */}
                <div className="space-y-6">

                    {/* Virtual Student ID */}
                    <VirtualIDCard />

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 cursor-pointer hover:border-orange-100 dark:hover:border-orange-900/50 transition-colors group" onClick={() => router.push('/dashboard/complaints')}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Reports</p>
                                <Wrench className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#F26C22] transition-colors" />
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{pendingComplaintsCount.toString().padStart(2, '0')}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{pendingComplaintsCount === 0 ? 'No open complaints' : 'Awaiting resolution'}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 cursor-pointer hover:border-orange-100 dark:hover:border-orange-900/50 transition-colors group" onClick={() => router.push('/dashboard/court/history')}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Bookings</p>
                                <CalendarCheck className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#F26C22] transition-colors" />
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{activeBookingsCount.toString().padStart(2, '0')}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                {recentBookings[0] ? `Next: ${new Date(recentBookings[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'No upcoming bookings'}
                            </p>
                        </div>
                    </div>

                    {/* Profile Summary Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm transition-colors">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="h-12 w-12 rounded-2xl bg-[#F26C22] flex items-center justify-center text-white font-black text-lg shrink-0 overflow-hidden">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    user.name?.charAt(0)
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-slate-900 dark:text-white text-sm truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{user.id} · 1st year</p>
                            </div>
                        </div>

                        {/* 2x2 grid details */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            {[
                                { label: 'Wing', value: user.gender === 'Male' ? 'Alpha' : 'Beta' },
                                { label: 'Floor', value: myRoom ? `Level ${myRoom.floorId}` : 'Ground' },
                                { label: 'Bed', value: bedLabel || '—' },
                                { label: 'Block', value: user.gender === 'Male' ? 'Block A' : 'Block B' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <Link href="/dashboard/profile" className="mt-5 block text-center text-xs font-black text-slate-500 hover:text-[#F26C22] transition-colors">
                            Manage profile
                        </Link>
                    </div>

                    {/* Roommates Card */}
                    <RoommatesCard />


                    {/* Need Help Strip */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between gap-4 shadow-sm transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                <Bell className="h-5 w-5 text-[#F26C22]" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800 dark:text-white">Need help?</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">Warden desk responds in ~10 min</p>
                            </div>
                        </div>
                        <button className="shrink-0 text-xs font-black text-[#F26C22] dark:text-orange-400 border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all">
                            Contact
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

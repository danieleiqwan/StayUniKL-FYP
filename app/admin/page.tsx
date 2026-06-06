'use client';

import { Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData, CourtBooking } from '@/context/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import AdminFilterBar, { FilterState } from '@/components/admin/AdminFilterBar';
import StudentDetailModal from '@/components/admin/StudentDetailModal';
import LiveClock from '@/components/admin/LiveClock';
import RoomAssignmentModal from '@/components/admin/RoomAssignmentModal';
import PredictiveMaintenance from '@/components/admin/PredictiveMaintenance';
import WaitlistOpportunities from '@/components/admin/WaitlistOpportunities';
import FacilityAnalytics from '@/components/admin/FacilityAnalytics';
import SportManagement from '@/components/admin/SportManagement';
import { Eye, Home, FileText, Clock, CheckCircle, XCircle, ListOrdered, ScanLine, Building2, LayoutDashboard, ChevronRight, Bell, Wrench, Zap, DollarSign, Megaphone, CalendarDays, Users, CheckSquare, Square, Check, Trash2, CalendarClock, Plus, X } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center opacity-50 font-black uppercase tracking-widest text-xs">Loading Terminal...</div>}>
            <AdminDashboard />
        </Suspense>
    );
}

function AdminDashboard() {
    const { user } = useAuth();
    const {
        applications, complaints, courtBookings, facilitySettings, roomChangeRequests, refreshData,
        updateApplicationStatus, updateBulkApplicationStatus, updateComplaint, updateBookingStatus, updateFacilitySettings, toggleSlotBlock,
        allSports
    } = useData();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'complaints' | 'facilities' | 'room-changes' | 'sessions'>('overview');

    // Sync tab with URL query param
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'applications', 'complaints', 'facilities', 'room-changes', 'sessions'].includes(tab)) {
            setActiveTab(tab as any);
        } else if (!tab) {
            // Default to overview if tab param is missing (e.g. user clicks logo or /admin)
            setActiveTab('overview');
        }
    }, [searchParams]);

    // Application Sessions state
    const [sessions, setSessions] = useState<any[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [sessionForm, setSessionForm] = useState({ name: '', semesterType: 'Long', intakeBatch: '', eligibility: 'Both', startDate: '', endDate: '' });
    const [sessionSubmitting, setSessionSubmitting] = useState(false);

    const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await fetch('/api/admin/application-sessions');
            const data = await res.json();
            if (data.sessions) setSessions(data.sessions);
        } catch (e) { console.error(e); }
        finally { setSessionsLoading(false); }
    };

    useEffect(() => {
        if (activeTab === 'sessions') fetchSessions();
    }, [activeTab]);

    const handleCreateSession = async () => {
        if (!sessionForm.name || !sessionForm.intakeBatch || !sessionForm.startDate || !sessionForm.endDate) {
            alert('Please fill in all required fields.'); return;
        }
        setSessionSubmitting(true);
        const res = await fetch('/api/admin/application-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionForm),
        });
        const data = await res.json();
        setSessionSubmitting(false);
        if (res.ok) {
            setShowSessionForm(false);
            setSessionForm({ name: '', semesterType: 'Long', intakeBatch: '', eligibility: 'Both', startDate: '', endDate: '' });
            fetchSessions();
        } else {
            alert('Error: ' + (data.error || 'Failed to create session'));
        }
    };

    const handleDeleteSession = async (id: string) => {
        if (!confirm('Are you sure you want to delete this session?')) return;
        await fetch(`/api/admin/application-sessions?id=${id}`, { method: 'DELETE' });
        fetchSessions();
    };

    const [courtSubTab, setCourtSubTab] = useState<'bookings' | 'settings' | 'schedule' | 'sports'>('bookings');
    const [facilityTab, setFacilityTab] = useState<'court' | 'gym' | 'laundry'>('court');
    const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [liveUserCount, setLiveUserCount] = useState<number | null>(null);

    // Poll for live student count every 30 seconds
    useEffect(() => {
        const fetchLiveUsers = async () => {
            try {
                const res = await fetch('/api/admin/live-users');
                if (res.ok) {
                    const data = await res.json();
                    setLiveUserCount(data.count ?? 0);
                }
            } catch {}
        };
        fetchLiveUsers();
        const interval = setInterval(fetchLiveUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    // Filtering States
    const [appFilters, setAppFilters] = useState<FilterState>({ search: '', status: '', gender: '', roomType: '', startDate: '', endDate: '' });
    const [complaintFilters, setComplaintFilters] = useState<FilterState>({ search: '', status: '', gender: '', roomType: '', startDate: '', endDate: '' });
    const [roomChangeFilters, setRoomChangeFilters] = useState<FilterState>({ search: '', status: '', gender: '', roomType: '', startDate: '', endDate: '' });
    const [courtFilters, setCourtFilters] = useState({ search: '', status: '', date: '', sport: '' });

    // Room Change UI State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Bulk Selection State
    const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const toggleAppSelection = (id: string) => {
        setSelectedAppIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAllApps = () => {
        if (selectedAppIds.length === filteredApps.length) {
            setSelectedAppIds([]);
        } else {
            setSelectedAppIds(filteredApps.map(a => a.id));
        }
    };

    const handleBulkStatusUpdate = async (status: any) => {
        if (selectedAppIds.length === 0) return;
        
        const actionLabel = status === 'Payment Pending' ? 'ACCEPT' : 'REJECT';
        const count = selectedAppIds.length;
        const msg = `Are you sure you want to ${actionLabel} ${count} student application${count > 1 ? 's' : ''}?`;
        
        if (!confirm(msg)) return;

        setIsBulkProcessing(true);
        const res = await updateBulkApplicationStatus(selectedAppIds, status);
        setIsBulkProcessing(false);

        if (res.success) {
            setSelectedAppIds([]);
        } else {
            alert(`Bulk update failed: ${res.error}`);
        }
    };

    // Filtered Data
    const filteredApps = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch = !appFilters.search ||
                (app.studentName || '').toLowerCase().includes(appFilters.search.toLowerCase()) ||
                (app.studentId || '').toLowerCase().includes(appFilters.search.toLowerCase());
            const matchesStatus = !appFilters.status || app.status === appFilters.status;
            const matchesGender = !appFilters.gender || app.gender === appFilters.gender;
            const matchesRoomType = !appFilters.roomType || app.roomType === appFilters.roomType;
            const matchesDate = (!appFilters.startDate || app.date >= appFilters.startDate) &&
                (!appFilters.endDate || app.date <= appFilters.endDate);

            return matchesSearch && matchesStatus && matchesGender && matchesRoomType && matchesDate;
        });
    }, [applications, appFilters]);

    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesSearch = !complaintFilters.search ||
                (c.studentName || '').toLowerCase().includes(complaintFilters.search.toLowerCase()) ||
                (c.studentId || '').toLowerCase().includes(complaintFilters.search.toLowerCase()) ||
                (c.title || '').toLowerCase().includes(complaintFilters.search.toLowerCase());
            const matchesStatus = !complaintFilters.status || c.status === complaintFilters.status;
            const matchesDate = (!complaintFilters.startDate || c.date >= complaintFilters.startDate) &&
                (!complaintFilters.endDate || c.date <= complaintFilters.endDate);

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [complaints, complaintFilters]);

    const filteredCourtBookings = useMemo(() => {
        return courtBookings.filter(b => {
            const matchesSearch = !courtFilters.search || 
                b.studentName.toLowerCase().includes(courtFilters.search.toLowerCase()) || 
                b.studentId.toLowerCase().includes(courtFilters.search.toLowerCase());
            const matchesStatus = !courtFilters.status || b.status === courtFilters.status;
            const matchesDate = !courtFilters.date || b.date === courtFilters.date;
            const matchesSport = !courtFilters.sport || b.sport === courtFilters.sport;
            
            return matchesSearch && matchesStatus && matchesDate && matchesSport;
        }).sort((a, b) => {
            // Sort by date and then timeSlot
            if (a.date !== b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
            return a.timeSlot.localeCompare(b.timeSlot);
        });
    }, [courtBookings, courtFilters]);


    // Stats — use local date (en-CA gives YYYY-MM-DD) to avoid UTC offset mismatch for UTC+8
    const today = new Date().toLocaleDateString('en-CA'); // e.g. "2026-05-13" in local time
    const totalCourtBookingsToday = (courtBookings || []).filter(b => b.date === today).length;

    // Generate Slots for Schedule View
    const generateSlots = () => {
        const slots = [];
        if (!facilitySettings) return [];
        const start = parseInt(facilitySettings.court.openTime.split(':')[0]);
        const end = parseInt(facilitySettings.court.closeTime.split(':')[0]);
        for (let i = start; i < end; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };
    const scheduleSlots = generateSlots();



    const filteredRoomChanges = useMemo(() => {
        return roomChangeRequests.filter(req => {
            const matchesSearch = !roomChangeFilters.search ||
                req.student_name.toLowerCase().includes(roomChangeFilters.search.toLowerCase()) ||
                req.student_id.toLowerCase().includes(roomChangeFilters.search.toLowerCase());
            const matchesStatus = !roomChangeFilters.status || req.status === roomChangeFilters.status;
            const matchesDate = (!roomChangeFilters.startDate || req.created_at >= roomChangeFilters.startDate) &&
                (!roomChangeFilters.endDate || req.created_at <= roomChangeFilters.endDate);
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [roomChangeRequests, roomChangeFilters]);

    // Pending Counts for Badges
    const counts = useMemo(() => ({
        applications: (applications || []).filter(a => a.status === 'Pending' || !a.status).length,
        complaints: (complaints || []).filter(c => c.status === 'Pending').length,
        facilities: (courtBookings || []).filter(b => b.status === 'Pending').length,
        roomChanges: (roomChangeRequests || []).filter(r => r.status === 'Pending Review').length
    }), [applications, complaints, courtBookings, roomChangeRequests]);

    const handleApproveWithRoom = (request: any) => {
        setSelectedRequest(request);
        setAssignModalOpen(true);
    };

    const handleAssignRoom = async (roomId: string, bedId: string, adminNotes: string) => {
        try {
            const res = await fetch('/api/room-change-requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedRequest.id,
                    status: 'Approved - Assigned',
                    newRoomId: roomId,
                    newBedId: bedId,
                    adminNotes,
                    reviewedBy: user?.name || 'admin'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Room assigned successfully!');
                setAssignModalOpen(false);
                setSelectedRequest(null);
                refreshData();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error assigning room:', error);
            alert('Failed to assign room. Please try again.');
        }
    };

    const handleWaitlist = async (requestId: string) => {
        const position = prompt('Enter waitlist position (optional):');
        const notes = prompt('Enter admin notes (optional):');

        try {
            const res = await fetch('/api/room-change-requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: requestId,
                    status: 'Approved - Waitlist',
                    waitlistPosition: position ? parseInt(position) : null,
                    adminNotes: notes,
                    reviewedBy: user?.name || 'admin'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Request added to waitlist!');
                refreshData();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error adding to waitlist:', error);
        }
    };

    const handleReject = async (requestId: string) => {
        const notes = prompt('Enter rejection reason:');
        if (!notes) return;

        try {
            const res = await fetch('/api/room-change-requests', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: requestId,
                    status: 'Rejected',
                    adminNotes: notes,
                    reviewedBy: user?.name || 'admin'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Request rejected.');
                refreshData();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <div className="p-10 text-center">Access Denied. Admins only.</div>;

    return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-12 space-y-6 md:space-y-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-[#F26C22]">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            {activeTab === 'overview' ? 'Admin Overview' :
                             activeTab === 'applications' ? 'Student Enrollment' :
                             activeTab === 'complaints' ? 'Facility Maintenance' :
                             activeTab === 'facilities' ? 'Sports & Facilities' :
                             activeTab === 'room-changes' ? 'Room Change Request' :
                             activeTab === 'sessions' ? 'Application Sessions' : 'Admin Hub'}
                        </h1>
                    </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium ml-1">
                                {activeTab === 'overview' ? 'System snapshot and high-level control center.' :
                                 activeTab === 'applications' ? 'Review and manage incoming student hostel applications.' :
                                 activeTab === 'complaints' ? 'Track and resolve facility issues reported by residents.' :
                                 activeTab === 'facilities' ? 'Configure operation hours and manage sport bookings.' :
                                 activeTab === 'room-changes' ? 'Handle internal room transfer and bed assignment requests.' :
                                 activeTab === 'sessions' ? 'Control when students can submit hostel applications.' : 'System overview and management.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <LiveClock />
                            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden lg:block"></div>
                            <button
                                onClick={() => router.push('/admin/checkin')}
                                className="group bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                            >
                                <ScanLine className="h-4 w-4 group-hover:scale-110 transition-transform" /> QR Check-in Hub
                            </button>
                            <button
                                onClick={() => router.push('/admin/rooms')}
                                className="group bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 hover:bg-[#F26C22] dark:hover:bg-[#F26C22]"
                            >
                                <Building2 className="h-4 w-4 group-hover:scale-110 transition-transform" /> Room Matrix
                            </button>
                        </div>
                    </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Key Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {[
                                { label: 'Live Users', val: liveUserCount ?? 0, color: 'text-purple-500', bg: 'bg-purple-50', icon: Users, isLive: true },
                                { label: 'Pending Apps', val: counts.applications, color: 'text-orange-500', bg: 'bg-orange-50', icon: FileText, tab: 'applications' },
                                { label: 'Active Complaints', val: counts.complaints, color: 'text-blue-500', bg: 'bg-blue-50', icon: Wrench, tab: 'complaints' },
                                { label: 'Room Transfers', val: counts.roomChanges, color: 'text-indigo-500', bg: 'bg-indigo-50', icon: Building2, tab: 'room-changes' },
                                { label: 'Bookings Today', val: totalCourtBookingsToday, color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CalendarDays, tab: 'facilities' },
                            ].map((stat: any, i) => {
                                const Icon = stat.icon;
                                return (
                                <div 
                                    key={i} 
                                    onClick={() => stat.tab && router.push(`/admin?tab=${stat.tab}`)}
                                    className={`bg-white dark:bg-slate-900 rounded-[2rem] p-6 border shadow-sm relative overflow-hidden group ${stat.tab ? 'cursor-pointer border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors' : 'border-slate-100 dark:border-slate-800'}`}
                                >
                                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} dark:bg-slate-800 opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`h-10 w-10 ${stat.bg} dark:bg-slate-800 rounded-xl flex items-center justify-center`}>
                                                <Icon className={`h-5 w-5 ${stat.color}`} />
                                            </div>
                                            {stat.isLive ? (
                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    Live
                                                </span>
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                                        {stat.isLive && liveUserCount === null ? (
                                            <p className="text-4xl font-black text-slate-300 dark:text-slate-700 leading-none tracking-tighter">—</p>
                                        ) : (
                                            <p className={`text-4xl font-black ${stat.color} dark:text-white leading-none tracking-tighter`}>{stat.val.toString().padStart(2, '0')}</p>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Alerts & Quick Actions */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Alerts */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-rose-500" /> Action Required
                                    </h2>
                                    <div className="space-y-4">
                                        {counts.applications > 0 && (
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Pending Enrollments</p>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{counts.applications} applications waiting for review</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => router.push('/admin?tab=applications')} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-colors">Review</button>
                                            </div>
                                        )}
                                        {counts.complaints > 0 && (
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                        <Wrench className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Active Complaints</p>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{counts.complaints} facility issues require attention</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => router.push('/admin?tab=complaints')} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-colors">Resolve</button>
                                            </div>
                                        )}
                                        {counts.roomChanges > 0 && (
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                        <Building2 className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Room Change Request</p>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{counts.roomChanges} students requested room changes</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => router.push('/admin?tab=room-changes')} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 hover:bg-indigo-600 transition-colors">Manage</button>
                                            </div>
                                        )}


                                        {counts.applications === 0 && counts.complaints === 0 && counts.roomChanges === 0 && (
                                            <div className="text-center py-8">
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">All clear! No urgent items pending.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-emerald-500" /> Quick Actions
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Check-in Hub', icon: ScanLine, path: '/admin/checkin', color: 'emerald' },
                                            { label: 'Room Matrix', icon: Building2, path: '/admin/rooms', color: 'blue' },
                                            { label: 'Finances', icon: DollarSign, path: '/admin/billing', color: 'indigo' },
                                            { label: 'Announcements', icon: Megaphone, path: '/admin/announcements', color: 'rose' },
                                        ].map((action, i) => {
                                            const Icon = action.icon;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => router.push(action.path)}
                                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm text-${action.color}-500`}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">{action.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Activity Feed */}
                            <div className="space-y-8">
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm h-full max-h-[800px] flex flex-col">
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400" /> Recent Activity
                                        </span>
                                        <span className="text-[10px] text-[#F26C22] bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">Live</span>
                                    </h2>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                                        {/* Combine latest data into a feed */}
                                        {[...(applications || []), ...(complaints || [])]
                                            .sort((a, b) => new Date((b as any).date || (b as any).createdAt || 0).getTime() - new Date((a as any).date || (a as any).createdAt || 0).getTime())
                                            .slice(0, 8)
                                            .map((item: any, i) => {
                                                const isComplaint = 'title' in item;
                                                const Icon = isComplaint ? Wrench : FileText;
                                                const color = isComplaint ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
                                                const title = isComplaint ? `New Complaint: ${item.title}` : `New Enrollment: ${item.studentName}`;
                                                const subtitle = isComplaint ? item.studentName : item.roomType;
                                                
                                                return (
                                                    <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => router.push(`/admin?tab=${isComplaint ? 'complaints' : 'applications'}`)}>
                                                        <div className="relative">
                                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            {i !== 7 && <div className="absolute top-10 bottom-[-24px] left-1/2 w-px bg-slate-100 dark:bg-slate-800 -translate-x-1/2"></div>}
                                                        </div>
                                                        <div className="pb-1">
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#F26C22] transition-colors line-clamp-1">{title}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-slate-500 font-medium">{subtitle}</span>
                                                                <span className="text-[10px] text-slate-400">• {(item.date || item.createdAt)?.split(' ')[0] || 'Recently'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        {(!applications || applications.length === 0) && (!complaints || complaints.length === 0) && (
                                            <p className="text-center text-slate-500 text-sm py-4">No recent activity.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <AdminFilterBar
                                onFilterChange={setAppFilters}
                                statusOptions={['Pending', 'Payment Pending', 'Approved', 'Checked in', 'Checked out', 'Cancelled', 'No show']}
                            />
                            {selectedAppIds.length > 0 && appFilters.status === 'Pending' && (
                                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-orange-200 dark:border-orange-900/30 shadow-sm animate-in slide-in-from-top-2 w-fit mx-auto">
                                    <span className="text-xs font-black text-[#F26C22] uppercase tracking-widest">{selectedAppIds.length} Selected</span>
                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                                    <button 
                                        disabled={isBulkProcessing}
                                        onClick={() => handleBulkStatusUpdate('Payment Pending')}
                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#F26C22] text-white px-4 py-2 rounded-xl hover:bg-[#d65a16] transition-all disabled:opacity-50"
                                    >
                                        <Check className="h-3 w-3" /> Bulk Accept
                                    </button>
                                    <button 
                                        disabled={isBulkProcessing}
                                        onClick={() => handleBulkStatusUpdate('Cancelled')}
                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="h-3 w-3" /> Bulk Reject
                                    </button>
                                    <button 
                                        onClick={() => setSelectedAppIds([])}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto custom-scrollbar">
                                <div className="min-w-[850px]">
                                    <div className={`grid ${appFilters.status === 'Pending' ? 'grid-cols-[40px_2fr_1fr_1fr_1fr_2fr]' : 'grid-cols-[2fr_1fr_1fr_1fr_2fr]'} px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800`}>
                                        {appFilters.status === 'Pending' && (
                                            <div className="flex items-center">
                                                <button onClick={toggleSelectAllApps} className="text-slate-400 hover:text-[#F26C22] transition-colors">
                                                    {selectedAppIds.length === filteredApps.length && filteredApps.length > 0 ? <CheckSquare className="h-4 w-4 text-[#F26C22]" /> : <Square className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        )}
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Room Type</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applied</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</span>
                                    </div>
                                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {filteredApps.length === 0 ? (
                                            <div className="py-20 text-center">
                                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No applications found.</p>
                                            </div>
                                        ) : filteredApps.map(app => (
                                            <div key={app.id} className={`grid ${appFilters.status === 'Pending' ? 'grid-cols-[40px_2fr_1fr_1fr_1fr_2fr]' : 'grid-cols-[2fr_1fr_1fr_1fr_2fr]'} items-center px-8 py-5 hover:bg-orange-50/30 dark:hover:bg-slate-800/30 transition-colors group ${selectedAppIds.includes(app.id) ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}>
                                                {appFilters.status === 'Pending' && (
                                                    <div className="flex items-center">
                                                        <button onClick={() => toggleAppSelection(app.id)} className={`${selectedAppIds.includes(app.id) ? 'text-[#F26C22]' : 'text-slate-300'} hover:text-[#F26C22] transition-colors`}>
                                                            {selectedAppIds.includes(app.id) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                                                        {(app.studentName || 'S').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{app.studentName}</p>
                                                        <p className="text-xs text-slate-400 font-mono">{app.officialId || app.studentId}</p>
                                                    </div>
                                                    <button onClick={() => setSelectedStudentId(app.studentId)} className="p-1.5 text-slate-300 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="View Full Profile">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{app.roomType || '—'}</p>
                                                <p className="text-sm text-slate-400 font-medium">{new Date(app.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                <span className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    app.status === 'Approved' || app.status === 'Approved - Assigned' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    app.status === 'Checked in' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                                                    app.status === 'Checked out' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                                    app.status === 'Payment Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    app.status === 'Cancelled' || app.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                    app.status === 'No show' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                }`}>{app.status === 'Approved' ? 'Approved - Pending Check-In' : (app.status || 'Pending')}</span>
                                                <div className="flex flex-wrap gap-2 justify-end">
                                                    {(app.status === 'Pending' || !app.status) && (<>
                                                        <button onClick={() => updateApplicationStatus(app.id, 'Payment Pending')} className="text-[10px] font-black uppercase tracking-widest bg-[#F26C22] text-white px-3 py-1.5 rounded-xl hover:bg-[#d65a16] transition-all">Accept</button>
                                                        <button onClick={() => { const reason = prompt('Enter rejection reason (shown to student):', 'Your application does not meet the current eligibility criteria.'); if (reason !== null) updateApplicationStatus(app.id, 'Rejected', reason || undefined); }} className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-3 py-1.5 rounded-xl hover:bg-rose-600 transition-all">Reject</button>
                                                        <button onClick={() => { const bedId = prompt('Enter Bed ID (e.g., 101-A):'); if (bedId) { fetch('/api/applications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: app.id, bedId }) }).then(() => refreshData()); } }} className="text-[10px] font-black uppercase tracking-widest bg-slate-700 text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-all">Assign Bed</button>
                                                    </>)}
                                                    {app.status === 'Payment Pending' && (<>
                                                        <button onClick={() => updateApplicationStatus(app.id, 'Approved')} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-all">Verify Payment</button>
                                                        <button onClick={() => updateApplicationStatus(app.id, 'Cancelled')} className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-3 py-1.5 rounded-xl hover:bg-rose-600 transition-all">Cancel</button>
                                                    </>)}
                                                    {app.status === 'Approved' && (<>
                                                        <button onClick={() => updateApplicationStatus(app.id, 'Checked in')} className="text-[10px] font-black uppercase tracking-widest bg-teal-500 text-white px-3 py-1.5 rounded-xl hover:bg-teal-600 transition-all">Manual Check-In</button>
                                                        <button onClick={() => updateApplicationStatus(app.id, 'No show')} className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white px-3 py-1.5 rounded-xl hover:bg-amber-600 transition-all">No Show</button>
                                                        <button onClick={() => updateApplicationStatus(app.id, 'Cancelled')} className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-3 py-1.5 rounded-xl hover:bg-rose-600 transition-all">Cancel</button>
                                                    </>)}
                                                    {app.status === 'Checked in' && (
                                                        <button onClick={() => updateApplicationStatus(app.id, 'Checked out')} className="text-[10px] font-black uppercase tracking-widest bg-slate-600 text-white px-3 py-1.5 rounded-xl hover:bg-slate-700 transition-all">Check Out</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <PredictiveMaintenance />
                        <AdminFilterBar
                            onFilterChange={setComplaintFilters}
                            statusOptions={['Pending', 'In Progress', 'Resolved']}
                            showGender={false}
                            showRoomType={false}
                        />
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto custom-scrollbar">
                                <div className="min-w-[850px]">
                                    <div className="grid grid-cols-[2fr_2fr_1fr_1.5fr] px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reported By</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Issue</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</span>
                                    </div>
                                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {filteredComplaints.length === 0 ? (
                                            <div className="py-20 text-center">
                                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No complaints found.</p>
                                            </div>
                                        ) : filteredComplaints.map(c => (
                                            <div key={c.id} className="grid grid-cols-[2fr_2fr_1fr_1.5fr] items-center px-8 py-5 hover:bg-blue-50/20 dark:hover:bg-slate-800/30 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                                                        {(c.studentName || 'S').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{c.studentName}</p>
                                                        <p className="text-xs text-slate-400 font-mono">{c.officialId || c.studentId}</p>
                                                    </div>
                                                    <button onClick={() => setSelectedStudentId(c.studentId)} className="p-1.5 text-slate-300 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="View Profile">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{c.title}</p>
                                                    <p className="text-xs text-slate-400 max-w-xs truncate mt-0.5">{c.description}</p>
                                                    {c.images && c.images.length > 0 && (
                                                        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 custom-scrollbar no-scrollbar">
                                                            {c.images.map((img: string, idx: number) => (
                                                                <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 hover:border-[#F26C22] transition-colors">
                                                                    <img src={img} alt="Attachment" className="h-full w-full object-cover" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    c.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>{c.status}</span>
                                                <div className="flex gap-2 justify-end">
                                                    {c.status === 'Pending' && (<>
                                                        <button onClick={() => { const d = prompt('Appointment Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]); if (d) updateComplaint(c.id, 'In Progress', d); }} className="text-[10px] font-black uppercase tracking-widest bg-blue-500 text-white px-3 py-1.5 rounded-xl hover:bg-blue-600 transition-all">Schedule</button>
                                                        <button onClick={() => updateComplaint(c.id, 'Resolved')} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-all">Resolve</button>
                                                    </>)}
                                                    {c.status === 'In Progress' && (
                                                        <button onClick={() => updateComplaint(c.id, 'Resolved')} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-all">Mark Resolved</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Facility Management Tab */}
                {activeTab === 'facilities' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Facility Pill Sub-Tabs */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
                            {['court', 'gym', 'laundry'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFacilityTab(f as any)}
                                    className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all capitalize ${
                                        facilityTab === f
                                            ? 'bg-white dark:bg-slate-900 text-[#F26C22] shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {facilityTab === 'court' && (
                            <div className="space-y-6">
                                <FacilityAnalytics />
                                {/* Court Quick Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Bookings Today</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{totalCourtBookingsToday.toString().padStart(2, '0')}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Total Daily Slots</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{scheduleSlots.length.toString().padStart(2, '0')}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Court Status</p>
                                        <p className={`text-3xl font-black ${facilitySettings?.court?.isOpen ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {facilitySettings?.court?.isOpen ? 'Open' : 'Closed'}
                                        </p>
                                    </div>
                                </div>
                                {/* Court Sub-Tabs (pill style) */}
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
                                    {['bookings', 'settings', 'schedule', 'sports'].map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => setCourtSubTab(sub as any)}
                                            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all capitalize ${
                                                courtSubTab === sub
                                                    ? 'bg-white dark:bg-slate-900 text-[#F26C22] shadow-sm'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                            }`}
                                        >
                                            {sub === 'sports' ? '🏅 Sports' : sub}
                                        </button>
                                    ))}
                                </div>

                                {courtSubTab === 'bookings' && (
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Search Student</label>
                                                    <input type="text" placeholder="Name or ID..." value={courtFilters.search} onChange={(e) => setCourtFilters({ ...courtFilters, search: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</label>
                                                    <select value={courtFilters.status} onChange={(e) => setCourtFilters({ ...courtFilters, status: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 transition-all">
                                                        <option value="">All Statuses</option>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</label>
                                                    <input type="date" value={courtFilters.date} onChange={(e) => setCourtFilters({ ...courtFilters, date: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 transition-all" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sport</label>
                                                    <select value={courtFilters.sport} onChange={(e) => setCourtFilters({ ...courtFilters, sport: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-50 transition-all">
                                                        <option value="">All Sports</option>
                                                        {allSports.map(s => (<option key={s.id} value={s.name}>{s.name}{!s.isActive ? ' (Disabled)' : ''}</option>))}
                                                    </select>
                                                </div>
                                            </div>
                                            {(courtFilters.search || courtFilters.status || courtFilters.date || courtFilters.sport) && (
                                                <div className="mt-4 flex justify-end">
                                                    <button onClick={() => setCourtFilters({ search: '', status: '', date: '', sport: '' })} className="text-[10px] font-black uppercase tracking-widest text-[#F26C22] hover:underline">Clear Filters</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto custom-scrollbar">
                                                <div className="min-w-[850px]">
                                                    <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sport</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</span>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</span>
                                                    </div>
                                                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                                        {filteredCourtBookings.length === 0 ? (
                                                            <div className="py-20 text-center"><p className="text-sm font-bold text-slate-400 dark:text-slate-500">No bookings match your filters.</p></div>
                                                        ) : filteredCourtBookings.map(b => (
                                                            <div key={b.id} className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] items-center px-8 py-5 hover:bg-orange-50/20 dark:hover:bg-slate-800/30 transition-colors group">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                                                                        {(b.studentName || 'S').charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{b.studentName || 'Unknown'}</p>
                                                                        <p className="text-xs text-slate-400 font-mono">{b.studentId}</p>
                                                                    </div>
                                                                    <button onClick={() => setSelectedStudentId(b.studentId)} className="p-1.5 text-slate-300 hover:text-[#F26C22] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{b.sport}</p>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                                                                    <p className="text-xs text-slate-400">@ {b.timeSlot}</p>
                                                                </div>
                                                                <span className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                                    b.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                    b.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                                }`}>{b.status}</span>
                                                                <div className="flex gap-2 justify-end">
                                                                    {b.status === 'Pending' && (<>
                                                                        <button onClick={() => updateBookingStatus(b.id, 'Approved')} className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-all">Approve</button>
                                                                        <button onClick={() => updateBookingStatus(b.id, 'Rejected')} className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-3 py-1.5 rounded-xl hover:bg-rose-600 transition-all">Reject</button>
                                                                    </>)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}


                                {courtSubTab === 'settings' && facilitySettings && (
                                    <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-slate-900 dark:text-white">Court Status</span>
                                                <button
                                                    onClick={() => updateFacilitySettings('court', { isOpen: !facilitySettings.court.isOpen })}
                                                    className={`rounded-full px-4 py-1 text-sm font-bold text-white ${facilitySettings.court.isOpen ? 'bg-green-600' : 'bg-red-600'}`}
                                                >
                                                    {facilitySettings.court.isOpen ? 'OPEN' : 'CLOSED'}
                                                </button>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Open Time</label>
                                                <input
                                                    type="time"
                                                    value={facilitySettings.court.openTime}
                                                    onChange={(e) => updateFacilitySettings('court', { openTime: e.target.value })}
                                                    className="mt-1 block w-full rounded border-slate-300 p-2 dark:bg-slate-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Close Time</label>
                                                <input
                                                    type="time"
                                                    value={facilitySettings.court.closeTime}
                                                    onChange={(e) => updateFacilitySettings('court', { closeTime: e.target.value })}
                                                    className="mt-1 block w-full rounded border-slate-300 p-2 dark:bg-slate-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {courtSubTab === 'sports' && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 animate-in fade-in duration-300">
                                        <SportManagement />
                                    </div>
                                )}

                                {courtSubTab === 'schedule' && facilitySettings && (
                                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Block/Unblock Slots
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Date:</label>
                                                <input
                                                    type="date"
                                                    value={selectedScheduleDate}
                                                    onChange={(e) => setSelectedScheduleDate(e.target.value || new Date().toISOString().split('T')[0])}
                                                    className="rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#F26C22] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8">
                                            {scheduleSlots.map(slot => {
                                                const slotKey = `${selectedScheduleDate}T${slot}`;
                                                const isBlocked = facilitySettings.court.blockedSlots.includes(slotKey);
                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => toggleSlotBlock('court', selectedScheduleDate, slot)}
                                                        className={`rounded p-2 text-center text-xs font-medium transition-colors ${isBlocked
                                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                                                            }`}
                                                    >
                                                        {slot}
                                                        <br />
                                                        {isBlocked ? 'BLOCKED' : 'Clean'}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(facilityTab === 'gym' || facilityTab === 'laundry') && facilitySettings && (
                            <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white capitalize">{facilityTab} Management</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-900 dark:text-white">Operational Status</span>
                                        <button
                                            onClick={() => updateFacilitySettings(facilityTab, { isOpen: !facilitySettings[facilityTab].isOpen })}
                                            className={`rounded-full px-4 py-1 text-sm font-bold text-white ${facilitySettings[facilityTab].isOpen ? 'bg-green-600' : 'bg-red-600'}`}
                                        >
                                            {facilitySettings[facilityTab].isOpen ? 'OPERATIONAL' : 'MAINTENANCE'}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Opening Time</label>
                                        <input
                                            type="time"
                                            value={facilitySettings[facilityTab].openTime}
                                            onChange={(e) => updateFacilitySettings(facilityTab, { openTime: e.target.value })}
                                            className="mt-1 block w-full rounded border-slate-300 p-2 dark:bg-slate-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Closing Time</label>
                                        <input
                                            type="time"
                                            value={facilitySettings[facilityTab].closeTime}
                                            onChange={(e) => updateFacilitySettings(facilityTab, { closeTime: e.target.value })}
                                            className="mt-1 block w-full rounded border-slate-300 p-2 dark:bg-slate-800"
                                        />
                                    </div>
                                    <div className="pt-4 text-xs text-slate-500 italic">
                                        * Changes apply immediately for all students. Maintenance mode will show a warning on the student dashboard.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Room Changes Tab */}
                {activeTab === 'room-changes' && (
                    <div className="animate-in fade-in duration-300">
                        <WaitlistOpportunities 
                            roomChangeRequests={roomChangeRequests} 
                            onAssign={(req, roomId, bedId) => {
                                setSelectedRequest(req);
                                // Pre-fill or directly assign. Since we already have the match, we can directly assign.
                                // But handleAssignRoom expects roomId, bedId, adminNotes.
                                if (window.confirm(`Auto-assign ${req.student_name} to Room ${roomId} Bed ${bedId}?`)) {
                                    // Make sure selectedRequest is set, handleAssignRoom uses it.
                                    // Since state updates are async, we might need a modified handler or pass req.
                                    // For now, setting state and opening modal is safer so admin can confirm.
                                    setAssignModalOpen(true);
                                }
                            }}
                        />
                        {/* Filters */}
                        <div className="mb-6">
                            <AdminFilterBar
                                onFilterChange={setRoomChangeFilters}
                                statusOptions={['Pending Review', 'Approved - Assigned', 'Approved - Waitlist', 'Rejected', 'Completed']}
                            />
                        </div>

                        {/* Room Changes Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Current Room</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Request Details</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Reason</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Submitted</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {applications.length === 0 ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i}>
                                                    <td className="p-4"><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></td>
                                                    <td className="p-4"><Skeleton className="h-10 w-24" /></td>
                                                    <td className="p-4"><div className="space-y-2"><Skeleton className="h-6 w-28" /><Skeleton className="h-6 w-24" /></div></td>
                                                    <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                                                    <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                                    <td className="p-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                                                </tr>
                                            ))
                                        ) : filteredRoomChanges.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-10 text-center text-slate-500">
                                                    No room change requests found matching your filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredRoomChanges.map((req) => (
                                                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white">{req.student_name}</p>
                                                                <p className="text-xs text-slate-500">{req.student_id}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedStudentId(req.student_id)}
                                                                className="p-1.5 text-slate-400 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                                title="View Student Profile"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                                <Home className="h-4 w-4 text-slate-500" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white">Room {req.current_room_number}</p>
                                                                <p className="text-xs text-slate-500">Floor {req.current_floor_id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            {req.preferred_room_type && (
                                                                <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-[#F26C22] dark:text-orange-300 text-xs font-bold border border-orange-100 dark:border-orange-800">
                                                                    Pref Type: {req.preferred_room_type}
                                                                </span>
                                                            )}
                                                            {req.preferred_bed_id && (
                                                                <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                                                                    Pref Bed: {req.preferred_bed_id}
                                                                </span>
                                                            )}
                                                            {!req.preferred_room_type && !req.preferred_bed_id && (
                                                                <span className="text-xs text-slate-500 italic">No preference</span>
                                                            )}
                                                        </div>
                                                        {req.waitlist_position && (
                                                            <div className="mt-1">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold">
                                                                    <ListOrdered className="h-3 w-3" />
                                                                    Waitlist #{req.waitlist_position}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="group relative flex flex-col">
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                                                                {req.reason}
                                                            </p>
                                                            {req.attachment_url && (
                                                                <a 
                                                                    href={req.attachment_url} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1.5 w-fit mt-2 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded border border-blue-100 dark:border-blue-800 text-[10px] font-bold transition-colors"
                                                                    title="View Supported Document"
                                                                >
                                                                    <FileText className="h-3 w-3" /> View Document
                                                                </a>
                                                            )}
                                                            {/* Tooltip on hover */}
                                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 whitespace-pre-wrap">
                                                                {req.reason}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${req.status === 'Pending Review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                                                            req.status === 'Approved - Assigned' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                                                req.status === 'Approved - Waitlist' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                                                    req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                                                                        'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                            }`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span className="text-xs font-medium">
                                                                {new Date(req.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {req.status === 'Pending Review' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApproveWithRoom(req)}
                                                                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors border border-transparent hover:border-green-200"
                                                                        title="Approve & Assign Room"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleWaitlist(req.id)}
                                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                                        title="Add to Waitlist"
                                                                    >
                                                                        <ListOrdered className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(req.id)}
                                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                                        title="Reject"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {req.status === 'Approved - Waitlist' && (
                                                                <button
                                                                    onClick={() => handleApproveWithRoom(req)}
                                                                    className="px-3 py-1.5 bg-[#F26C22] text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
                                                                >
                                                                    Assign Room
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Application Sessions Tab ── */}
                {activeTab === 'sessions' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white">Manage Sessions</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Only ONE session can be open at a time. Applications are blocked when no session is open.</p>
                            </div>
                            <button
                                onClick={() => setShowSessionForm(true)}
                                className="flex items-center gap-2 bg-[#F26C22] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                            >
                                <Plus className="h-4 w-4" /> New Session
                            </button>
                        </div>

                        {/* Create session form */}
                        {showSessionForm && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Create New Session</h3>
                                    <button onClick={() => setShowSessionForm(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Session Name *</label>
                                        <input value={sessionForm.name} onChange={e => setSessionForm(p => ({...p, name: e.target.value}))}
                                            placeholder="e.g. September 2025 Intake"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F26C22]/50" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Semester Type *</label>
                                        <select value={sessionForm.semesterType} onChange={e => setSessionForm(p => ({...p, semesterType: e.target.value}))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F26C22]/50">
                                            <option value="Long">Long Semester</option>
                                            <option value="Short">Short Semester</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Intake Batch *</label>
                                        <input value={sessionForm.intakeBatch} onChange={e => setSessionForm(p => ({...p, intakeBatch: e.target.value}))}
                                            placeholder="e.g. Sep 2025 / Jan 2026"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F26C22]/50" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Eligibility *</label>
                                        <select value={sessionForm.eligibility} onChange={e => setSessionForm(p => ({...p, eligibility: e.target.value}))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F26C22]/50">
                                            <option value="Both">Both (New & Returning)</option>
                                            <option value="New Students Only">New Students Only</option>
                                            <option value="Returning Students Only">Returning Students Only</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Start Date & Time *</label>
                                        <input type="datetime-local" value={sessionForm.startDate} onChange={e => setSessionForm(p => ({...p, startDate: e.target.value}))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F26C22]/50" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">End Date & Time *</label>
                                        <input type="datetime-local" value={sessionForm.endDate} onChange={e => setSessionForm(p => ({...p, endDate: e.target.value}))}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F26C22]/50" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={() => setShowSessionForm(false)} className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
                                    <button onClick={handleCreateSession} disabled={sessionSubmitting}
                                        className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-[#F26C22] text-white hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20">
                                        {sessionSubmitting ? 'Creating...' : 'Create Session'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Sessions list */}
                        {sessionsLoading ? (
                            <div className="text-center py-12 text-slate-400 text-sm font-bold">Loading sessions…</div>
                        ) : sessions.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                                <CalendarClock className="h-12 w-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold">No sessions created yet.</p>
                                <p className="text-slate-400 text-sm mt-1">Click "New Session" to open an application window for students.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sessions.map((s: any) => {
                                    const statusColor = s.status === 'Open' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' :
                                        s.status === 'Upcoming' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' :
                                        'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
                                    return (
                                        <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap mb-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusColor}`}>{s.status}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{s.semester_type} Semester</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-lg">{s.eligibility}</span>
                                                </div>
                                                <h3 className="text-base font-black text-slate-900 dark:text-white">{s.name}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    Batch: <strong>{s.intake_batch}</strong> &nbsp;·&nbsp;
                                                    {new Date(s.start_date).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})} → {new Date(s.end_date).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}
                                                </p>
                                            </div>
                                            <button onClick={() => handleDeleteSession(s.id)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-2 rounded-xl transition-all shrink-0">
                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Room Assignment Modal */}
                {assignModalOpen && selectedRequest && (
                    <RoomAssignmentModal
                        studentId={selectedRequest.student_id}
                        studentGender={selectedRequest.student_gender}
                        currentRoomId={selectedRequest.current_room_id}
                        preferredRoomType={selectedRequest.preferred_room_type}
                        preferredBedId={selectedRequest.preferred_bed_id}
                        onClose={() => {
                            setAssignModalOpen(false);
                            setSelectedRequest(null);
                        }}
                        onAssign={handleAssignRoom}
                    />
                )}

                {/* Student Detail Modal */}
                <StudentDetailModal
                    studentId={selectedStudentId}
                    onClose={() => setSelectedStudentId(null)}
                />
            </div>
    );
}

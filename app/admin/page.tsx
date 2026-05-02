'use client';

import { useAuth } from '@/context/AuthContext';
import { useData, CourtBooking } from '@/context/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import AdminFilterBar, { FilterState } from '@/components/admin/AdminFilterBar';
import StudentDetailModal from '@/components/admin/StudentDetailModal';
import LiveClock from '@/components/admin/LiveClock';
import RoomAssignmentModal from '@/components/admin/RoomAssignmentModal';
import PredictiveMaintenance from '@/components/admin/PredictiveMaintenance';
import WaitlistOpportunities from '@/components/admin/WaitlistOpportunities';
import FacilityAnalytics from '@/components/admin/FacilityAnalytics';
import { Eye, Home, FileText, Clock, CheckCircle, XCircle, ListOrdered, ScanLine, Building2 } from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const {
        applications, complaints, courtBookings, facilitySettings, roomChangeRequests, refreshData,
        updateApplicationStatus, updateComplaint, updateBookingStatus, updateFacilitySettings, toggleSlotBlock
    } = useData();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'applications' | 'complaints' | 'facilities' | 'room-changes'>('applications');
    const [facilityTab, setFacilityTab] = useState<'court' | 'gym' | 'laundry'>('court');
    const [courtSubTab, setCourtSubTab] = useState<'bookings' | 'settings' | 'schedule'>('bookings');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    // Filtering States
    const [appFilters, setAppFilters] = useState<FilterState>({ search: '', status: '', gender: '', roomType: '', startDate: '', endDate: '' });
    const [complaintFilters, setComplaintFilters] = useState<FilterState>({ search: '', status: '', gender: '', roomType: '', startDate: '', endDate: '' });
    const [roomChangeFilters, setRoomChangeFilters] = useState<FilterState>({ search: '', status: '', gender: '', roomType: '', startDate: '', endDate: '' });
    const [courtFilters, setCourtFilters] = useState({ search: '', status: '', date: '', sport: '' });

    // Room Change UI State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

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


    // Stats
    const totalCourtBookingsToday = courtBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length;

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
    const today = new Date().toISOString().split('T')[0];



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
        applications: applications.filter(a => a.status === 'Pending' || !a.status).length,
        complaints: complaints.filter(c => c.status === 'Pending').length,
        facilities: courtBookings.filter(b => b.status === 'Pending').length,
        roomChanges: roomChangeRequests.filter(r => r.status === 'Pending Review').length
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

    useEffect(() => {
    }, []);

    if (!user || user.role !== 'admin') return <div className="p-10 text-center">Access Denied. Admins only.</div>;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="container mx-auto px-4 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>

                    <div className="flex flex-wrap items-center gap-3">
                        <LiveClock />
                        <button
                            onClick={() => router.push('/admin/checkin')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <ScanLine className="h-4 w-4" /> QR Check-in Hub
                        </button>
                        <button
                            onClick={() => router.push('/admin/rooms')}
                            className="bg-[#F26C22] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d65a16] transition-colors flex items-center gap-2"
                        >
                            <Building2 className="h-4 w-4" /> View Room Availability
                        </button>
                    </div>
                </div>

                <div className="mb-8 flex space-x-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                    {['applications', 'complaints', 'facilities', 'room-changes'].map(tab => {
                        const countKey = tab === 'room-changes' ? 'roomChanges' : tab;
                        const count = (counts as any)[countKey] || 0;
                        
                        return (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab as any);
                                }}
                                className={`pb-2 px-2 text-sm font-bold transition-all capitalize whitespace-nowrap flex items-center gap-2 ${activeTab === tab
                                    ? 'border-b-2 border-[#F26C22] text-[#F26C22] dark:text-orange-400'
                                    : 'text-slate-500 hover:text-[#F26C22] dark:text-slate-400'
                                    }`}
                            >
                                <span>
                                    {tab === 'facilities' ? 'Facility Management' :
                                        tab === 'complaints' ? 'Facilities Complaints' :
                                            tab === 'room-changes' ? 'Room Changes' : tab}
                                </span>
                                {count > 0 && (
                                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black animate-in zoom-in duration-300">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <>
                        <AdminFilterBar
                            onFilterChange={setAppFilters}
                            statusOptions={['Pending', 'Payment Pending', 'Approved', 'Checked in', 'Checked out', 'Cancelled', 'No show']}
                        />
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Student</th>
                                            <th className="px-6 py-4 font-semibold">Room Type</th>
                                            <th className="px-6 py-4 font-semibold">Date</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredApps.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-slate-500">No applications found.</td></tr> :
                                            filteredApps.map(app => (
                                                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <div className="font-medium text-slate-900 dark:text-white">{app.studentName}</div>
                                                                <div className="text-xs text-slate-500">{app.studentId}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedStudentId(app.studentId)}
                                                                className="p-1.5 text-slate-400 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                                title="View Full Profile"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{app.roomType}</td>
                                                    <td className="px-6 py-4 text-slate-500">{new Date(app.date).toLocaleDateString()}</td>

                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                            app.status === 'Checked in' ? 'bg-teal-100 text-teal-700' :
                                                                app.status === 'Checked out' ? 'bg-gray-100 text-gray-700' :
                                                                    app.status === 'Payment Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                        app.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                            app.status === 'No show' ? 'bg-orange-100 text-orange-700' :
                                                                                'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {app.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-2">
                                                            {(app.status === 'Pending' || !app.status) && (
                                                                <>
                                                                    <button onClick={() => updateApplicationStatus(app.id, 'Payment Pending')} className="text-xs bg-[#F26C22] text-white px-2 py-1 rounded hover:bg-[#d65a16]">Accept</button>
                                                                    <button onClick={() => updateApplicationStatus(app.id, 'Cancelled')} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Reject</button>
                                                                    <button onClick={() => {
                                                                        const bedId = prompt("Enter Bed ID to Assign (e.g., 101-A):");
                                                                        if (bedId) {
                                                                            fetch('/api/applications', {
                                                                                method: 'PUT',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ id: app.id, bedId })
                                                                            }).then(() => refreshData());
                                                                        }
                                                                    }} className="text-xs bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700">Assign Bed</button>
                                                                </>
                                                            )}
                                                            {app.status === 'Payment Pending' && (
                                                                <>
                                                                    <button onClick={() => updateApplicationStatus(app.id, 'Approved')} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Verify Payment</button>
                                                                    <button onClick={() => updateApplicationStatus(app.id, 'Cancelled')} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Cancel</button>
                                                                </>
                                                            )}
                                                            {app.status === 'Approved' && (
                                                                <>
                                                                    <button onClick={() => updateApplicationStatus(app.id, 'Checked in')} className="text-xs bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700">Check In</button>
                                                                    <button onClick={() => updateApplicationStatus(app.id, 'No show')} className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700">No Show</button>
                                                                    <button onClick={() => updateApplicationStatus(app.id, 'Cancelled')} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Cancel</button>
                                                                </>
                                                            )}
                                                            {app.status === 'Checked in' && (
                                                                <button onClick={() => updateApplicationStatus(app.id, 'Checked out')} className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700">Check Out</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                    <div className="animate-in fade-in duration-300">
                        <PredictiveMaintenance />
                        <AdminFilterBar
                            onFilterChange={setComplaintFilters}
                            statusOptions={['Pending', 'In Progress', 'Resolved']}
                            showGender={false}
                            showRoomType={false}
                        />
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Reported By</th>
                                            <th className="px-6 py-4 font-semibold">Issue</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredComplaints.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-slate-500">No complaints found.</td></tr> :
                                            filteredComplaints.map(c => (
                                                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <div className="font-medium text-slate-900 dark:text-white">{c.studentName}</div>
                                                                <div className="text-xs text-slate-500">{c.studentId}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedStudentId(c.studentId)}
                                                                className="p-1.5 text-slate-400 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                                title="View Full Profile"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-slate-900 dark:text-white">{c.title}</div>
                                                        <div className="text-xs text-slate-500 max-w-xs truncate">{c.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${c.status === 'Resolved' ? 'bg-green-100 text-green-700' : c.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {c.status === 'Pending' && (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => {
                                                                    const d = prompt("Appt Date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
                                                                    if (d) updateComplaint(c.id, 'In Progress', d);
                                                                }} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Arr. Appt</button>
                                                                <button onClick={() => updateComplaint(c.id, 'Resolved')} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Resolve</button>
                                                            </div>
                                                        )}
                                                        {c.status === 'In Progress' && (
                                                            <button onClick={() => updateComplaint(c.id, 'Resolved')} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Resolve</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Facility Management Tab */}
                {activeTab === 'facilities' && (
                    <div className="space-y-6">
                        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800">
                            {['court', 'gym', 'laundry'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFacilityTab(f as any)}
                                    className={`pb-2 px-4 text-sm font-medium transition-colors capitalize ${facilityTab === f ? 'border-b-2 border-[#F26C22] text-[#F26C22]' : 'text-slate-500'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {facilityTab === 'court' && (
                            <div className="space-y-6">
                                <div className="animate-in fade-in duration-300">
                                    <FacilityAnalytics />
                                </div>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="rounded-xl border bg-white p-4 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalCourtBookingsToday}</div>
                                        <div className="text-xs text-slate-500">Bookings Today</div>
                                    </div>
                                    <div className="rounded-xl border bg-white p-4 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{scheduleSlots.length}</div>
                                        <div className="text-xs text-slate-500">Total Daily Slots</div>
                                    </div>
                                    <div className="rounded-xl border bg-white p-4 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                        <div className={`text-2xl font-bold ${facilitySettings?.court.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                            {facilitySettings?.court.isOpen ? 'Open' : 'Closed'}
                                        </div>
                                        <div className="text-xs text-slate-500">Current Status</div>
                                    </div>
                                </div>

                                <div className="border-b border-slate-200 dark:border-slate-800">
                                    {['bookings', 'settings', 'schedule'].map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => setCourtSubTab(sub as any)}
                                            className={`mr-6 pb-2 text-sm font-medium transition-colors capitalize ${courtSubTab === sub ? 'border-b-2 border-[#F26C22] text-[#F26C22]' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>

                                {courtSubTab === 'bookings' && (
                                    <div className="space-y-4">
                                        {/* Court Booking Filter Bar */}
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-colors">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {/* Search */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Search Student</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                                                        <input
                                                            type="text"
                                                            placeholder="Name or ID..."
                                                            value={courtFilters.search}
                                                            onChange={(e) => setCourtFilters({ ...courtFilters, search: e.target.value })}
                                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                                                    <select
                                                        value={courtFilters.status}
                                                        onChange={(e) => setCourtFilters({ ...courtFilters, status: e.target.value })}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all"
                                                    >
                                                        <option value="">All Statuses</option>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </div>

                                                {/* Date */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={courtFilters.date}
                                                        onChange={(e) => setCourtFilters({ ...courtFilters, date: e.target.value })}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all"
                                                    />
                                                </div>

                                                {/* Sport */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sport</label>
                                                    <select
                                                        value={courtFilters.sport}
                                                        onChange={(e) => setCourtFilters({ ...courtFilters, sport: e.target.value })}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F26C22] dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all"
                                                    >
                                                        <option value="">All Sports</option>
                                                        <option value="Badminton">Badminton</option>
                                                        <option value="Basketball">Basketball</option>
                                                        <option value="Volleyball">Volleyball</option>
                                                        <option value="Football">Football</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {(courtFilters.search || courtFilters.status || courtFilters.date || courtFilters.sport) && (
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        onClick={() => setCourtFilters({ search: '', status: '', date: '', sport: '' })}
                                                        className="text-xs text-[#F26C22] font-bold hover:underline"
                                                    >
                                                        Clear All Filters
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white">
                                                    <tr>
                                                        <th className="px-6 py-4 font-semibold">Student</th>
                                                        <th className="px-6 py-4 font-semibold">Sport</th>
                                                        <th className="px-6 py-4 font-semibold">Time</th>
                                                        <th className="px-6 py-4 font-semibold">Status</th>
                                                        <th className="px-6 py-4 font-semibold">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {filteredCourtBookings.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-slate-500">No bookings match your filters.</td></tr> :
                                                        filteredCourtBookings.map(b => (
                                                            <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div>
                                                                            <div className="font-medium text-slate-900 dark:text-white">{b.studentName || 'Unknown Student'}</div>
                                                                            <div className="text-xs text-slate-500">{b.studentId}</div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => setSelectedStudentId(b.studentId)}
                                                                            className="p-1.5 text-slate-400 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                                            title="View Full Profile"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">{b.sport}</td>
                                                                <td className="px-6 py-4">{b.date} @ {b.timeSlot}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-101 text-yellow-700'}`}>{b.status}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    {b.status === 'Pending' && (
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => updateBookingStatus(b.id, 'Approved')} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Approve</button>
                                                                            <button onClick={() => updateBookingStatus(b.id, 'Rejected')} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Reject</button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
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

                                {courtSubTab === 'schedule' && facilitySettings && (
                                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Block/Unblock Slots for Today ({today})</h3>
                                        <div className="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-8">
                                            {scheduleSlots.map(slot => {
                                                const slotKey = `${today}T${slot}`;
                                                const isBlocked = facilitySettings.court.blockedSlots.includes(slotKey);
                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => toggleSlotBlock('court', today, slot)}
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
                                                        <div className="group relative">
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                                                                {req.reason}
                                                            </p>
                                                            {/* Tooltip on hover */}
                                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50">
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
            </div>

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

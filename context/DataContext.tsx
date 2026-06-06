'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

// --- Models ---
export interface Bed { id: string; label: string; isOccupied: boolean; occupantId?: string; }
export interface Room { id: string; floorId: number; label: string; beds: Bed[]; gender: 'Male' | 'Female'; roomType: 'Single' | 'Double' | 'Triple'; }
export interface Application {
    id: string; studentId: string; studentName: string;
    roomType: 'Single' | 'Shared (2)' | 'Shared (4)';
    status: 'Pending' | 'Payment Pending' | 'Approved' | 'Checked in' | 'Checked out' | 'Cancelled' | 'No show' | 'Rejected';
    previousStatus?: 'Pending' | 'Payment Pending' | 'Approved' | 'Checked in' | 'Checked out' | 'Cancelled' | 'No show' | 'Rejected';
    gender?: 'Male' | 'Female';
    bedId?: string; floorId?: number; roomId?: string;
    stayDuration?: number;
    durationType?: '1_semester';
    totalPrice?: number;
    date: string;
    cancellationReason?: string;
    checkInDate?: string;
    paymentMethod?: 'Full Payment' | 'Installment Plan';
    paymentStatus?: 'Pending' | 'Partially Paid' | 'Fully Paid' | 'Overdue';
}
export interface Complaint {
    id: string; studentId: string; studentName: string;
    title: string; description: string;
    status: 'Pending' | 'In Progress' | 'Resolved';
    technicianAppointment?: string; date: string; createdAt?: string;
}
export interface CourtBooking {
    id: string; studentId: string; studentName: string;
    sport: 'Badminton' | 'Volleyball' | 'Basketball' | 'Football';
    date: string; timeSlot: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'; timestamp: string;
    attendanceStatus?: 'Pending' | 'Show' | 'No-Show';
}
export interface FacilitySettings {
    isOpen: boolean; openTime: string; closeTime: string; blockedSlots: string[];
}
export interface Payment {
    id: string; userId: string; referenceId: string; amount: number; method: string; status: 'Success' | 'Failed' | 'Pending'; createdAt: string;
}
export interface Invoice {
    id: string; userId: string; application_id?: string; type: string; description?: string;
    amount: number; status: 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled';
    due_date?: string; created_at: string; paid_at?: string;
    payment_plan?: 'Full' | 'Installment';
    installment_no?: number; installment_total?: number;
}
export interface Document {
    id: string; user_id: string; type: string; name: string; file_url: string; status: 'Pending' | 'Verified' | 'Rejected'; rejection_reason?: string; created_at: string;
}
export interface Sport {
    id: string; name: string; colorTheme: string; isActive: boolean; displayOrder: number;
}

interface DataContextType {
    applications: Application[];
    rooms: Room[];
    getRoomsByFloor: (floorId: number) => Room[];
    getAvailableFloors: (gender: 'Male' | 'Female') => number[];
    bookBed: (roomId: string, bedId: string) => void;
    createApplication: (app: {
        roomType: Application['roomType'];
        bedId: string;
        floorId: number;
        roomId: string;
        paymentMethod: 'Full Payment' | 'Installment Plan';
    }) => Promise<{ success?: boolean; error?: string }>;
    reapplyApplication: (id: string) => void;
    updateApplicationStatus: (id: string, status: Application['status'], cancellationReason?: string) => void;
    updateBulkApplicationStatus: (ids: string[], status: Application['status']) => Promise<{ success?: boolean; error?: string }>;
    myApplication: Application | undefined;
    myRoomChangeRequest: any | undefined;
    notifications: any[];
    unreadNotificationsCount: number;
    markNotificationRead: (id?: string) => void;
    deleteNotification: (id: string) => Promise<void>;


    complaints: Complaint[];
    createComplaint: (title: string, description: string, imagePaths?: string[], asset?: string) => Promise<{ success?: boolean; error?: string }>;
    updateComplaint: (id: string, status: Complaint['status'], appointmentDate?: string) => void;
    myComplaints: Complaint[];

    courtBookings: CourtBooking[];
    facilitySettings: {
        court: FacilitySettings;
        gym: FacilitySettings;
        laundry: FacilitySettings;
    } | undefined;
    createBooking: (sport: CourtBooking['sport'], date: string, timeSlot: string) => void;
    updateBookingStatus: (id: string, status: CourtBooking['status']) => void;
    cancelBooking: (id: string) => Promise<{ success?: boolean; error?: string }>;
    updateFacilitySettings: (key: 'court' | 'gym' | 'laundry', settings: Partial<FacilitySettings>) => void;
    toggleSlotBlock: (facility: 'court' | 'gym' | 'laundry', date: string, time: string) => void;

    roomChangeRequests: any[];
    payments: Payment[];
    invoices: Invoice[];
    myDocuments: Document[];
    sports: Sport[];
    allSports: Sport[];
    addSport: (name: string, colorTheme: string) => Promise<{ success?: boolean; error?: string }>;
    updateSport: (id: string, data: Partial<Sport>) => Promise<{ success?: boolean; error?: string }>;
    deleteSport: (id: string) => Promise<{ success?: boolean; error?: string; canDisable?: boolean }>;
    refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();

    const [applications, setApplications] = useState<Application[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [courtBookings, setCourtBookings] = useState<CourtBooking[]>([]);
    const [facilitySettings, setFacilitySettings] = useState<{ court: FacilitySettings, gym: FacilitySettings, laundry: FacilitySettings }>({
        court: { isOpen: true, openTime: '08:00', closeTime: '22:00', blockedSlots: [] },
        gym: { isOpen: true, openTime: '06:00', closeTime: '23:00', blockedSlots: [] },
        laundry: { isOpen: true, openTime: '00:00', closeTime: '23:59', blockedSlots: [] }
    });
    const [rooms, setRooms] = useState<Room[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [roomChangeRequest, setRoomChangeRequest] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [roomChangeRequests, setRoomChangeRequests] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [myDocuments, setMyDocuments] = useState<Document[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [allSports, setAllSports] = useState<Sport[]>([]);

    // --- Fetch Data ---
    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            // Define all fetch promises to run in parallel
            const fetchTasks = [
                // Fetch Applications
                fetch(`/api/applications${user.role === 'student' ? `?studentId=${user.id}` : (user.role === 'admin' || user.role === 'superadmin' ? '?all=true' : '')}`, { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => { if (data.applications) setApplications(data.applications); }),

                // Fetch Rooms (Inventory)
                fetch('/api/rooms', { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => { if (data.rooms) setRooms(data.rooms); }),

                // Fetch Complaints
                fetch(`/api/complaints${user.role === 'student' ? `?studentId=${user.id}` : (user.role === 'admin' || user.role === 'superadmin' ? '?all=true' : '')}`, { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => { if (data.complaints) setComplaints(data.complaints); }),

                // Fetch Court/Facility Data
                fetch(`/api/facilities${user.role === 'admin' || user.role === 'superadmin' ? '?all=true' : ''}`, { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.bookings) setCourtBookings(data.bookings);
                        if (data.settings) {
                            setFacilitySettings(prev => ({
                                ...prev,
                                court: data.settings.court || prev.court,
                                gym: data.settings.gym || prev.gym,
                                laundry: data.settings.laundry || prev.laundry
                            }));
                        }
                    }),

                // Fetch Payments
                fetch(`/api/payments?userId=${user.id}`, { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => { if (data.payments) setPayments(data.payments); }),

                // Fetch Invoices
                fetch(`/api/billing/invoices?${user.role === 'student' ? `userId=${user.id}` : 'all=true'}`, { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => { if (data.invoices) setInvoices(data.invoices); }),

                // Fetch Sports
                fetch('/api/sports?admin=true', { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.sports) {
                            setAllSports(data.sports);
                            setSports(data.sports.filter((s: Sport) => s.isActive));
                        }
                    })
            ];

            // Student-specific fetches
            if (user.role === 'student') {
                fetchTasks.push(
                    // Fetch Room Change Request
                    fetch(`/api/room-change-requests?studentId=${user.id}`, { cache: 'no-store' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.requests && data.requests.length > 0) {
                                const active = data.requests.find((r: any) =>
                                    ['Pending Review', 'Approved - Assigned', 'Approved - Waitlist'].includes(r.status)
                                );
                                setRoomChangeRequest(active || null);
                            } else {
                                setRoomChangeRequest(null);
                            }
                        }),

                    // Fetch Student Documents
                    fetch('/api/documents', { cache: 'no-store' })
                        .then(res => res.json())
                        .then(data => { if (data.documents) setMyDocuments(data.documents); }),

                    // Fetch Notifications
                    fetch(`/api/notifications?userId=${user.id}`, { cache: 'no-store' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.notifications) {
                                setNotifications(data.notifications);
                                setUnreadNotificationsCount(data.notifications.filter((n: any) => !n.is_read).length);
                            }
                        })
                );
            }

            // Admin & Superadmin-specific fetches
            if (user.role === 'admin' || user.role === 'superadmin') {
                fetchTasks.push(
                    // Fetch All Room Change Requests
                    fetch('/api/room-change-requests', { cache: 'no-store' })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                setRoomChangeRequests(data.requests || []);
                            }
                        })
                );
            }

            // Execute all fetch requests concurrently
            await Promise.allSettled(fetchTasks);

        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    }, [user]);

    useEffect(() => {
        fetchData();

        // Polling every 30 seconds to keep data fresh (especially for admin dashboard)
        const interval = setInterval(() => {
            // Only fetch if the tab is active to save resources
            if (document.visibilityState === 'visible') {
                fetchData();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchData]);

    // --- Actions: Applications ---
    const createApplication = async (data: {
        roomType: Application['roomType'];
        bedId: string;
        floorId: number;
        roomId: string;
        paymentMethod: 'Full Payment' | 'Installment Plan';
    }) => {
        if (!user) return { error: 'User not logged in' };
        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user.id,
                    studentName: user.name,
                    roomType: data.roomType,
                    floorId: data.floorId,
                    roomId: data.roomId,
                    bedId: data.bedId,
                    stayDuration: 4,
                    durationType: '1_semester',
                    totalPrice: 600,
                    paymentMethod: data.paymentMethod,
                })
            });
            
            const result = await res.json();
            if (!res.ok) {
                return { error: result.error || 'Failed to submit application' };
            }

            await fetchData(); // Refresh local state
            router.push('/dashboard');
            return { success: true };
        } catch (e: any) { 
            console.error(e);
            return { error: e.message || 'Network error' };
        }
    };

    const reapplyApplication = async (id: string) => {
        try {
            await fetch('/api/applications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action: 'reapply' })
            });
            await fetchData();
            router.push('/dashboard');
        } catch (e) { console.error(e); }
    };

    const updateApplicationStatus = async (id: string, status: Application['status'], cancellationReason?: string) => {
        try {
            await fetch('/api/applications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, cancellationReason })
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    const updateBulkApplicationStatus = async (ids: string[], status: Application['status']) => {
        try {
            const res = await fetch('/api/admin/bulk-applications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, status })
            });
            const data = await res.json();
            if (res.ok) {
                await fetchData();
                return { success: true };
            }
            return { error: data.error || 'Failed to update applications' };
        } catch (e: any) {
            console.error(e);
            return { error: e.message || 'Network error' };
        }
    };

    // --- Actions: Complaints ---
    const createComplaint = async (title: string, description: string, imagePaths?: string[], asset?: string): Promise<{ success?: boolean; error?: string }> => {
        if (!user) return { error: 'Not logged in' };
        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    studentId: user.id, 
                    studentName: user.name, 
                    title, 
                    description, 
                    asset,
                    imagePaths: imagePaths || [] 
                })
            });
            const data = await res.json();
            if (!res.ok) {
                return { error: data.error || 'Failed to submit complaint' };
            }
            await fetchData();
            return { success: true };
        } catch (e: any) {
            console.error(e);
            return { error: e.message || 'Network error. Please try again.' };
        }
    };

    const updateComplaint = async (id: string, status: Complaint['status'], appointmentDate?: string) => {
        console.log('[DataContext] updateComplaint triggered:', { id, status, appointmentDate });
        try {
            const res = await fetch('/api/complaints', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status, appointmentDate })
            });
            if (res.ok) {
                fetchData();
            } else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to update complaint'}`);
            }
        } catch (e) { 
            console.error(e);
            alert('Failed to connect to server');
        }
    };

    // --- Actions: Court ---
    const createBooking = async (sport: CourtBooking['sport'], date: string, timeSlot: string) => {
        if (!user) return;
        try {
            const res = await fetch('/api/court', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: user.id, studentName: user.name, sport, date, timeSlot })
            });
            const data = await res.json();
            if (res.ok) await fetchData();
            return data;
        } catch (e) { 
            console.error(e);
            return { error: 'Failed to create booking' };
        }
    };

    const updateBookingStatus = async (id: string, status: CourtBooking['status']) => {
        try {
            const res = await fetch('/api/court', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_status', id, status })
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to update booking status.');
            }
            fetchData();
        } catch (e) { 
            console.error(e); 
            alert('Failed to update booking status due to a network error.');
        }
    };

    const cancelBooking = async (id: string): Promise<{ success?: boolean; error?: string }> => {
        try {
            const res = await fetch('/api/court', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                // Optimistic: update local state immediately so UI is snappy
                setCourtBookings(prev =>
                    prev.map(b => b.id === id ? { ...b, status: 'Cancelled' as CourtBooking['status'] } : b)
                );
                return { success: true };
            }
            return { error: data.error || 'Failed to cancel booking.' };
        } catch (e: any) {
            console.error(e);
            return { error: 'Network error. Please try again.' };
        }
    };

    const updateFacilitySettings = async (key: 'court' | 'gym' | 'laundry', settings: Partial<FacilitySettings>) => {
        const newSettingsForFacility = { ...facilitySettings[key], ...settings };
        setFacilitySettings(prev => ({ ...prev, [key]: newSettingsForFacility })); // Optimistic update
        try {
            await fetch('/api/facilities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_settings', key, settings: newSettingsForFacility })
            });
        } catch (e) { console.error(e); }
    };

    const toggleSlotBlock = async (facility: 'court' | 'gym' | 'laundry', date: string, time: string) => {
        const slotKey = `${date}T${time}`;
        const isBlocked = facilitySettings[facility].blockedSlots.includes(slotKey);
        const newBlocked = isBlocked ? facilitySettings[facility].blockedSlots.filter(s => s !== slotKey) : [...facilitySettings[facility].blockedSlots, slotKey];
        updateFacilitySettings(facility, { blockedSlots: newBlocked });
    };

    const markNotificationRead = async (id?: string) => {
        if (!user) return;
        
        // Optimistic UI Update: Instantly change the state locally
        setNotifications(prev => prev.map(n => {
            if (!id || n.id === id) return { ...n, is_read: 1 };
            return n;
        }));
        setUnreadNotificationsCount(prev => id ? Math.max(0, prev - 1) : 0);

        try {
            // Background sync
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, id, markAll: !id })
            });
            // Optionally refresh to ensure full sync, but UI is already updated
            fetchData();
        } catch (e) { 
            console.error(e); 
            // Revert state if the request fails
            fetchData(); 
        }
    };

    const deleteNotification = async (id: string) => {
        if (!user) return;
        
        // Optimistic UI Update: Remove locally first
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadNotificationsCount(prev => {
            const notif = notifications.find(n => n.id === id);
            return (notif && !notif.is_read) ? Math.max(0, prev - 1) : prev;
        });

        try {
            const res = await fetch(`/api/notifications?id=${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const data = await res.json();
                console.error('Delete failed:', data.error);
                fetchData(); // Revert on failure
            }
        } catch (e) {
            console.error(e);
            fetchData(); // Revert on failure
        }
    };

    // --- Helpers (Local Mock for Rooms) ---
    const getRoomsByFloor = (floorId: number) => rooms.filter(r => r.floorId === floorId);
    const getAvailableFloors = (gender: 'Male' | 'Female') => {
        // Derive floors dynamically from live room inventory based on student's gender
        const matchingRooms = rooms.filter(r => r.gender === gender || r.gender === 'Co-Ed');
        const uniqueFloors = Array.from(new Set(matchingRooms.map(r => r.floorId))).sort((a: number, b: number) => a - b);
        // Fallback to legacy hardcoded floors if DB has no rooms yet
        if (uniqueFloors.length > 0) return uniqueFloors;
        return gender === 'Male' ? [1, 2, 3] : [4, 5, 6, 7];
    };
    const bookBed = async (roomId: string, bedId: string) => {
        fetchData();
    };

    // --- Actions: Sports ---
    const addSport = async (name: string, colorTheme: string): Promise<{ success?: boolean; error?: string }> => {
        try {
            const res = await fetch('/api/sports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, colorTheme }),
            });
            const data = await res.json();
            if (res.ok) { await fetchData(); return { success: true }; }
            return { error: data.error || 'Failed to add sport.' };
        } catch (e: any) { return { error: e.message }; }
    };

    const updateSport = async (id: string, updates: Partial<Sport>): Promise<{ success?: boolean; error?: string }> => {
        try {
            const res = await fetch('/api/sports', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });
            const data = await res.json();
            if (res.ok) { await fetchData(); return { success: true }; }
            return { error: data.error || 'Failed to update sport.' };
        } catch (e: any) { return { error: e.message }; }
    };

    const deleteSport = async (id: string): Promise<{ success?: boolean; error?: string; canDisable?: boolean }> => {
        try {
            const res = await fetch('/api/sports', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (res.ok) { await fetchData(); return { success: true }; }
            return { error: data.error, canDisable: data.canDisable };
        } catch (e: any) { return { error: e.message }; }
    };

    const myApplication = user
        ? (() => {
            const studentApps = applications.filter(app => app.studentId === user.id || app.studentId === (user as any).officialId);
            // Prefer active statuses first
            const priority: Record<string, number> = { 'Checked in': 5, 'Approved': 4, 'Payment Pending': 3, 'Pending': 2, 'Rejected': 1, 'Cancelled': 0 };
            const sorted = [...studentApps].sort((a, b) => (priority[b.status] ?? -1) - (priority[a.status] ?? -1));
            return sorted[0];
        })()
        : undefined;
    const myRoomChangeRequest = roomChangeRequest;
    const myComplaints = user ? complaints.filter(c => c.studentId === user.id) : [];

    return (
        <DataContext.Provider value={{
            applications, rooms, complaints, courtBookings, facilitySettings,
            getRoomsByFloor, getAvailableFloors, bookBed,
            createApplication, reapplyApplication, updateApplicationStatus, updateBulkApplicationStatus,
            createComplaint, updateComplaint,
            createBooking, updateBookingStatus, cancelBooking, updateFacilitySettings, toggleSlotBlock,
            myApplication, myRoomChangeRequest, myComplaints,
            notifications, unreadNotificationsCount, markNotificationRead, deleteNotification,
            roomChangeRequests,
            payments, invoices, myDocuments,
            sports, allSports, addSport, updateSport, deleteSport,
            refreshData: fetchData
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
}

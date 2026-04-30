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
    status: 'Pending' | 'Payment Pending' | 'Approved' | 'Checked in' | 'Checked out' | 'Cancelled' | 'No show';
    previousStatus?: 'Pending' | 'Payment Pending' | 'Approved' | 'Checked in' | 'Checked out' | 'Cancelled' | 'No show';
    gender?: 'Male' | 'Female';
    bedId?: string; floorId?: number; roomId?: string; stayDuration?: number; durationType?: '1_month' | '1_semester'; totalPrice?: number; date: string;
    cancellationReason?: string;
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
}
export interface FacilitySettings {
    isOpen: boolean; openTime: string; closeTime: string; blockedSlots: string[];
}
export interface Payment {
    id: string; userId: string; referenceId: string; amount: number; method: string; status: 'Success' | 'Failed' | 'Pending'; createdAt: string;
}

interface DataContextType {
    applications: Application[];
    rooms: Room[];
    getRoomsByFloor: (floorId: number) => Room[];
    getAvailableFloors: (gender: 'Male' | 'Female') => number[];
    bookBed: (roomId: string, bedId: string) => void;
    createApplication: (app: { roomType: Application['roomType'], bedId: string, floorId: number, roomId: string, stayDuration: number, durationType: '1_month' | '1_semester', totalPrice: number }) => void;
    reapplyApplication: (id: string) => void;
    updateApplicationStatus: (id: string, status: Application['status']) => void;
    myApplication: Application | undefined;
    myRoomChangeRequest: any | undefined;
    notifications: any[];
    unreadNotificationsCount: number;
    markNotificationRead: (id?: string) => void;


    complaints: Complaint[];
    createComplaint: (title: string, description: string, imagePaths?: string[]) => void;
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

    payments: Payment[];
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

    // --- Fetch Data ---
    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            // Fetch Applications
            const appRes = await fetch(`/api/applications${user.role === 'student' ? `?studentId=${user.id}` : ''}`);
            const appData = await appRes.json();
            if (appData.applications) setApplications(appData.applications);

            // Fetch Rooms (Inventory)
            const roomRes = await fetch('/api/rooms');
            const roomData = await roomRes.json();
            if (roomData.rooms) setRooms(roomData.rooms);

            // Fetch Complaints
            const compRes = await fetch(`/api/complaints${user.role === 'student' ? `?studentId=${user.id}` : ''}`);
            const compData = await compRes.json();
            if (compData.complaints) setComplaints(compData.complaints);

            // Fetch Court/Facility Data
            const courtRes = await fetch('/api/facilities');
            const courtData = await courtRes.json();
            if (courtData.bookings) setCourtBookings(courtData.bookings);
            if (courtData.settings) {
                setFacilitySettings(prev => ({
                    ...prev,
                    court: courtData.settings.court || prev.court,
                    gym: courtData.settings.gym || prev.gym,
                    laundry: courtData.settings.laundry || prev.laundry
                }));
            }

            // Fetch Payments
            const payRes = await fetch(`/api/payments?userId=${user.id}`);
            const payData = await payRes.json();
            if (payData.payments) setPayments(payData.payments);

            // Fetch Room Change Request (Student)
            if (user.role === 'student') {
                const rcrRes = await fetch(`/api/room-change-requests?studentId=${user.id}`);
                const rcrData = await rcrRes.json();
                if (rcrData.requests && rcrData.requests.length > 0) {
                    // Find active request
                    const active = rcrData.requests.find((r: any) =>
                        ['Pending Review', 'Approved - Assigned', 'Approved - Waitlist'].includes(r.status)
                    );
                    setRoomChangeRequest(active || null);
                } else {
                    setRoomChangeRequest(null);
                }

                // Fetch Notifications
                const notifRes = await fetch(`/api/notifications?userId=${user.id}`);
                const notifData = await notifRes.json();
                if (notifData.notifications) {
                    setNotifications(notifData.notifications);
                    setUnreadNotificationsCount(notifData.notifications.filter((n: any) => !n.is_read).length);
                }
            }

        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Actions: Applications ---
    const createApplication = async (data: { roomType: Application['roomType'], bedId: string, floorId: number, roomId: string, stayDuration: number, durationType: '1_month' | '1_semester', totalPrice: number }) => {
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
                    stayDuration: data.stayDuration,
                    durationType: data.durationType,
                    totalPrice: data.totalPrice
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

    const updateApplicationStatus = async (id: string, status: Application['status']) => {
        try {
            await fetch('/api/applications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    // --- Actions: Complaints ---
    const createComplaint = async (title: string, description: string, imagePaths?: string[]) => {
        if (!user) return;
        try {
            await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: user.id, studentName: user.name, title, description, imagePaths: imagePaths || [] })
            });
            fetchData();
        } catch (e) { console.error(e); }
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
            if (res.ok) fetchData();
            return data;
        } catch (e) { 
            console.error(e);
            return { error: 'Failed to create booking' };
        }
    };

    const updateBookingStatus = async (id: string, status: CourtBooking['status']) => {
        try {
            await fetch('/api/court', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_status', id, status })
            });
            fetchData();
        } catch (e) { console.error(e); }
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
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, id, markAll: !id })
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    // --- Helpers (Local Mock for Rooms) ---
    const getRoomsByFloor = (floorId: number) => rooms.filter(r => r.floorId === floorId);
    const getAvailableFloors = (gender: 'Male' | 'Female') => gender === 'Male' ? [1, 2, 3] : [4, 5, 6, 7];
    const bookBed = async (roomId: string, bedId: string) => {
        // Ideally this is triggered by assigning a bed to an application (PUT application)
        // But if we want a separate 'block bed' function, we'd need an API.
        // For now, let's assume this is legacy or unused directly.
        // We'll update it to be 'assignBedToApplication' logic, but for now just refresh data.
        fetchData();
    };

    const myApplication = user ? applications.find(app => app.studentId === user.id) : undefined;
    const myRoomChangeRequest = roomChangeRequest;
    const myComplaints = user ? complaints.filter(c => c.studentId === user.id) : [];

    return (
        <DataContext.Provider value={{
            applications, rooms, complaints, courtBookings, facilitySettings,
            getRoomsByFloor, getAvailableFloors, bookBed,
            createApplication, reapplyApplication, updateApplicationStatus,
            createComplaint, updateComplaint,
            createBooking, updateBookingStatus, cancelBooking, updateFacilitySettings, toggleSlotBlock,
            myApplication, myRoomChangeRequest, myComplaints,
            notifications, unreadNotificationsCount, markNotificationRead,
            payments, refreshData: fetchData
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

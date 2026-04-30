'use client';

import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
    Calendar, 
    Clock, 
    ChevronLeft, 
    History, 
    Plus, 
    Search,
    Filter,
    CheckCircle2,
    Clock3,
    XCircle,
    MapPin,
    Feather,
    CircleDot,
    Circle,
    Ban,
    AlertTriangle,
    Info,
    QrCode
} from 'lucide-react';
import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function CourtBookingHistory() {
    const { user } = useAuth();
    const { courtBookings, cancelBooking } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    
    // QR Code Check-in State
    const [qrModalId, setQrModalId] = useState<string | null>(null);
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [loadingQr, setLoadingQr] = useState(false);

    if (!user) return null;

    const getSportIcon = (sport: string) => {
        switch (sport) {
            case 'Badminton': return <Feather className="h-7 w-7 text-emerald-500" strokeWidth={1.5} />;
            case 'Volleyball': return <CircleDot className="h-7 w-7 text-amber-500" strokeWidth={1.5} />;
            case 'Basketball': return <Circle className="h-7 w-7 text-orange-500" strokeWidth={1.5} />;
            default: return <CircleDot className="h-7 w-7 text-[#F26C22]" strokeWidth={1.5} />;
        }
    };

    // Can student cancel? Must be Pending/Approved, future, and >2h before slot
    const canCancel = (booking: any) => {
        if (booking.status !== 'Pending' && booking.status !== 'Approved') return false;
        const bookingDate = new Date(booking.date);
        const [h, m] = booking.timeSlot.split(':').map(Number);
        bookingDate.setHours(h, m, 0, 0);
        const twoHoursBefore = new Date(bookingDate.getTime() - 2 * 60 * 60 * 1000);
        return new Date() < twoHoursBefore;
    };

    const handleCancelConfirm = async (id: string) => {
        setConfirmId(null);
        setCancellingId(id);
        const result = await cancelBooking(id);
        setCancellingId(null);
        if (result.error) {
            alert(`Cancellation failed: ${result.error}`);
        }
    };

    // Filter bookings for this student
    const myBookings = courtBookings.filter(b => b.studentId === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredBookings = myBookings.filter(b => {
        const matchesSearch = b.sport.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             b.timeSlot.includes(searchQuery);
        const matchesFilter = filterStatus === 'All' || b.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30', icon: CheckCircle2 };
            case 'Pending': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/30', icon: Clock3 };
            case 'Rejected': return { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/30', icon: XCircle };
            case 'Cancelled': return { bg: 'bg-slate-100 dark:bg-slate-800/80', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', icon: Ban };
            default: return { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-100 dark:border-slate-800', icon: History };
        }
    };

    // Cancellation confirm dialog
    const ConfirmDialog = ({ bookingId }: { bookingId: string }) => {
        const booking = myBookings.find(b => b.id === bookingId);
        if (!booking) return null;
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-center h-16 w-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl mx-auto mb-5">
                        <AlertTriangle className="h-8 w-8 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-2">Cancel Booking?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-1">
                        {booking.sport} Court — {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} at {booking.timeSlot}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-7">
                        This action cannot be undone. The slot will be released for others.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setConfirmId(null)}
                            className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                            Keep Booking
                        </button>
                        <button
                            onClick={() => handleCancelConfirm(bookingId)}
                            className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                        >
                            Yes, Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // QR Check-in Dialog
    const QrDialog = ({ bookingId }: { bookingId: string }) => {
        const booking = myBookings.find(b => b.id === bookingId);
        if (!booking) return null;

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Check-in Pass</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        {booking.sport} Court — {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} at {booking.timeSlot}
                    </p>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                        {loadingQr ? (
                            <div className="h-[200px] w-[200px] flex items-center justify-center">
                                <span className="h-8 w-8 border-4 border-[#F26C22] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : qrToken ? (
                            <QRCode value={qrToken} size={200} fgColor="#0F172A" />
                        ) : (
                            <div className="h-[200px] w-[200px] flex items-center justify-center text-rose-500 font-medium">
                                Failed to load QR Code
                            </div>
                        )}
                    </div>
                    
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                        Present this QR code to the facility warden.<br />
                        <span className="font-bold text-[#F26C22]">Valid for 5 minutes.</span>
                    </p>

                    <button
                        onClick={() => { setQrModalId(null); setQrToken(null); }}
                        className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    const handleOpenQr = async (id: string) => {
        setQrModalId(id);
        setLoadingQr(true);
        try {
            const res = await fetch(`/api/court/qr-token?bookingId=${id}`);
            const data = await res.json();
            if (data.success) {
                setQrToken(data.token);
            } else {
                alert(data.error || 'Failed to load check-in QR');
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setLoadingQr(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto py-8 transition-colors">
            {/* Dialog Overlays */}
            {confirmId && <ConfirmDialog bookingId={confirmId} />}
            {qrModalId && <QrDialog bookingId={qrModalId} />}

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-[#F26C22] font-black uppercase text-[10px] tracking-widest transition-colors mb-4 group">
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-[#F26C22] rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-orange-500/10">
                            <History className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Court Booking History</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">Review and manage your sports facility reservations.</p>
                        </div>
                    </div>
                </div>

                <Link 
                    href="/dashboard/court"
                    className="bg-slate-900 dark:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#F26C22] transition-all shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 flex items-center gap-3"
                >
                    <Plus className="h-4 w-4" /> New Booking
                </Link>
            </div>

            {/* Cancellation Policy Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    <span className="font-black">Cancellation Policy:</span> Bookings can be cancelled up to <span className="font-black">2 hours before</span> the scheduled start time. Cancelled slots are immediately released for other students.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex flex-col lg:flex-row gap-6 transition-colors">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-[#F26C22] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by sport or time..." 
                        className="w-full pl-14 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-4 focus:ring-orange-50 dark:focus:ring-orange-900/20 transition-all text-sm font-bold text-slate-800 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                    <Filter className="h-4 w-4 text-slate-300 dark:text-slate-600 mr-2 shrink-0" />
                    {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                filterStatus === status 
                                ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {filteredBookings.length > 0 ? filteredBookings.map((booking) => {
                    const style = getStatusStyle(booking.status);
                    const StatusIcon = style.icon;
                    const startHour = parseInt(booking.timeSlot.split(':')[0]);
                    const timeRange = `${booking.timeSlot} - ${(startHour + 1).toString().padStart(2, '0')}:00`;
                    const isCancellable = canCancel(booking);
                    const isCancelling = cancellingId === booking.id;
                    const isCancelled = booking.status === 'Cancelled';

                    return (
                        <div 
                            key={booking.id} 
                            className={`bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 group transition-all ${
                                isCancelled 
                                    ? 'opacity-60 hover:opacity-80' 
                                    : 'hover:shadow-xl hover:shadow-orange-500/5 dark:hover:shadow-none hover:border-orange-100 dark:hover:border-orange-900/50'
                            }`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className={`h-16 w-16 rounded-[1.25rem] flex items-center justify-center transition-colors ${isCancelled ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20'}`}>
                                        {isCancelled 
                                            ? <Ban className="h-7 w-7 text-slate-400 dark:text-slate-600" strokeWidth={1.5} /> 
                                            : getSportIcon(booking.sport)
                                        }
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className={`text-lg font-black uppercase tracking-tight transition-colors ${isCancelled ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                                                {booking.sport} Court
                                            </h3>
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${style.bg} ${style.text} ${style.border} transition-colors flex items-center gap-1`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-5">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Calendar className="h-4 w-4 text-[#F26C22]" />
                                                <span className="text-xs font-bold">{new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Clock className="h-4 w-4 text-[#F26C22]" />
                                                <span className="text-xs font-bold">{timeRange}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <MapPin className="h-4 w-4 text-[#F26C22]" />
                                                <span className="text-xs font-bold">MIIT Multi-Purpose Hall</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl transition-colors">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${style.bg} ${style.text} transition-colors`}>
                                                <StatusIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1 transition-colors">Request ID</p>
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tighter transition-colors">{booking.id}</p>
                                            </div>
                                        </div>

                                        {/* Actions Row */}
                                        <div className="flex gap-2">
                                            {/* QR Check-in Button */}
                                            {booking.status === 'Approved' && booking.attendanceStatus === 'Pending' && (
                                                <button
                                                    onClick={() => handleOpenQr(booking.id)}
                                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F26C22] text-white border border-[#F26C22]/20 text-xs font-black uppercase tracking-widest hover:bg-[#d65a16] transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                                                    title="Show Check-in QR"
                                                >
                                                    <QrCode className="h-4 w-4" />
                                                    Check In
                                                </button>
                                            )}

                                            {/* Cancel Button */}
                                            {isCancellable && (
                                                <button
                                                    onClick={() => setConfirmId(booking.id)}
                                                    disabled={isCancelling}
                                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 text-xs font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Cancel this booking"
                                                >
                                                    {isCancelling ? (
                                                        <span className="h-4 w-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Ban className="h-4 w-4" />
                                                    )}
                                                    {isCancelling ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] py-20 px-8 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center transition-colors">
                        <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-700 mb-6 shadow-sm">
                            <History className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">No Bookings Found</h3>
                        <p className="text-slate-400 dark:text-slate-500 font-medium max-w-[300px] mt-2 mb-8 transition-colors">You haven't made any court reservations yet.</p>
                        <Link 
                            href="/dashboard/court"
                            className="bg-[#F26C22] text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                        >
                            Book a Court Now
                        </Link>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="mt-12 bg-gradient-to-br from-[#F26C22] to-[#d65a16] rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 h-48 w-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4">MIIT Sports Facility Rules</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'Please arrive at least 5 minutes early.',
                            'Proper sports attire is mandatory.',
                            'Cancellations must be done 2 hours in advance.',
                            'Approved bookings only.'
                        ].map((rule, i) => (
                            <li key={i} className="flex items-center gap-3 text-orange-50 text-sm font-medium">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-200"></div>
                                {rule}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

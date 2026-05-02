'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { 
    CheckCircle2, ChevronRight, ChevronLeft, CalendarDays, 
    Clock, Trophy, Feather, CircleDot, Circle, Volleyball,
    Lock, Home as HomeIcon, AlertTriangle, Info
} from 'lucide-react';

export default function CourtBookingPage() {
    const { user } = useAuth();
    const { facilitySettings, courtBookings, createBooking, myApplication } = useData();
    const courtSettings = facilitySettings?.court || { isOpen: false, openTime: '08:00', closeTime: '22:00', blockedSlots: [] };
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Calendar UI State ---
    const currentDate = new Date();
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

    const sports = [
        { id: 'Badminton', icon: Feather, color: 'hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', active: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 ring-4 ring-emerald-50 dark:ring-emerald-900/10 text-emerald-700 dark:text-emerald-400' },
        { id: 'Volleyball', icon: CircleDot, color: 'hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400', active: 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 ring-4 ring-amber-50 dark:ring-amber-900/10 text-amber-700 dark:text-amber-400' },
        { id: 'Basketball', icon: Circle, color: 'hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400', active: 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 ring-4 ring-orange-50 dark:ring-orange-900/10 text-orange-700 dark:text-orange-400' },
        { id: 'Football', icon: CircleDot, color: 'hover:border-[#F26C22]/40 dark:hover:border-orange-900/40 hover:bg-orange-50 dark:hover:bg-orange-900/10 text-[#F26C22] dark:text-orange-400', active: 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/30 ring-4 ring-orange-50 dark:ring-orange-900/10 text-[#F26C22] dark:text-orange-400' },
    ];

    if (!user) return null;

    const generateSlots = () => {
        const slots = [];
        const start = parseInt(courtSettings.openTime.split(':')[0]);
        const end = parseInt(courtSettings.closeTime.split(':')[0]);

        for (let i = start; i < end; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };

    const timeSlots = generateSlots();

    const getSlotStatus = (time: string) => {
        const slotKey = `${selectedDate}T${time}`;
        
        // 1. Check if the slot is in the past (only for today)
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate === today) {
            const currentHour = new Date().getHours();
            const slotHour = parseInt(time.split(':')[0]);
            if (slotHour <= currentHour) {
                return { status: 'past', sport: null };
            }
        }

        // 2. Check if blocked by admin
        if (courtSettings.blockedSlots.includes(slotKey)) return { status: 'blocked', sport: null };
        
        // 3. Check if already booked (exclude Cancelled — those slots are free again)
        const booking = courtBookings.find(b => {
             if (!b.date) return false;
             const bDateString = new Date(b.date).toLocaleDateString('en-CA');
             return bDateString === selectedDate && b.timeSlot === time && b.status !== 'Rejected' && b.status !== 'Cancelled';
        });
        if (booking) return { status: 'booked', sport: booking.sport };
        
        return { status: 'available', sport: null };
    };

    const handleBooking = async () => {
        if (!selectedSport || !selectedDate || !selectedSlot) return;
        
        // Final frontend check before submission
        const { status } = getSlotStatus(selectedSlot);
        if (status !== 'available') {
            alert('This slot was just reserved or is no longer available. Please select another time.');
            return;
        }

        setIsSubmitting(true);
        try {
            const result: any = await createBooking(selectedSport as any, selectedDate, selectedSlot);
            if (result?.error) {
                alert(result.error);
                setIsSubmitting(false);
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Booking Error:', error);
            alert('Failed to process booking. Please try again.');
            setIsSubmitting(false);
        }
    };

    // --- Calendar functions ---
    const handlePrevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else setCurrentMonth(currentMonth - 1);
    };
    const handleNextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else setCurrentMonth(currentMonth + 1);
    };

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const calendarDays = [];
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            dateStr: `${currentMonth === 0 ? currentYear - 1 : currentYear}-${(currentMonth === 0 ? 12 : currentMonth).toString().padStart(2, '0')}-${(prevMonthDays - i).toString().padStart(2, '0')}`
        });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: true,
            dateStr: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`
        });
    }

    const remainingCells = 42 - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: false,
            dateStr: `${currentMonth === 11 ? currentYear + 1 : currentYear}-${(currentMonth === 11 ? 1 : currentMonth + 2).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`
        });
    }

    const getDateStatus = (testDate: string) => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const now = new Date();
        
        // 1. Basic past date check
        const dObj = new Date(testDate);
        dObj.setHours(23, 59, 59, 999);
        if (dObj < now) return 'disabled';

        // 2. Custom Rule: Past 9 PM today is disabled
        if (testDate === todayStr && now.getHours() >= 21) {
            return 'disabled';
        }

        // Only mark as 'my_booking' if it's an active (non-cancelled, non-rejected) booking
        const myB = courtBookings.some(b => {
             if (!b.date) return false;
             const bDateString = new Date(b.date).toLocaleDateString('en-CA');
             return bDateString === testDate && b.status !== 'Rejected' && b.status !== 'Cancelled' && b.studentId === user.id;
        });
        if (myB) return 'my_booking';

        let availableSlots = 0;
        timeSlots.forEach(slot => {
            // Exclude past slots for today's availability count
            if (testDate === todayStr) {
                const slotHour = parseInt(slot.split(':')[0]);
                if (slotHour <= now.getHours()) return;
            }

            const slotKey = `${testDate}T${slot}`;
            if (!courtSettings.blockedSlots.includes(slotKey)) {
                const booking = courtBookings.find(b => {
                    if (!b.date) return false;
                    const bDateString = new Date(b.date).toLocaleDateString('en-CA');
                    // Cancelled slots are free — don't count them as booked
                    return bDateString === testDate && b.timeSlot === slot && b.status !== 'Rejected' && b.status !== 'Cancelled';
                });
                if (!booking) availableSlots++;
            }
        });

        if (availableSlots === 0) return 'booked';
        return 'available';
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // --- Access Control Check ---
    const isAuthorized = user.role === 'admin' || (myApplication && (myApplication.status === 'Approved' || myApplication.status === 'Checked in'));

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="relative inline-block">
                        <div className="h-24 w-24 bg-orange-50 dark:bg-orange-900/20 rounded-[2rem] flex items-center justify-center mx-auto ring-8 ring-orange-50/50 dark:ring-orange-900/10">
                            <Lock className="h-10 w-10 text-[#F26C22]" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <div className="h-6 w-6 bg-rose-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-sm">
                                <AlertTriangle className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Access <span className="text-[#F26C22]">Restricted</span></h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            Court booking is reserved for students with an <span className="font-bold text-slate-900 dark:text-white">Approved room application</span>. You must complete your accommodation registration first.
                        </p>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/dashboard/apply" className="px-8 py-3 bg-[#141235] text-white rounded-xl font-bold text-sm hover:bg-[#F26C22] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10">
                            Start Application <ChevronRight className="h-4 w-4" />
                        </Link>
                        <Link href="/dashboard" className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                            <HomeIcon className="h-4 w-4" /> Back Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const StepIndicator = ({ num, label, current }: { num: number, label: string, current: number }) => (
        <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${
                current > num ? 'bg-emerald-500 text-white' : 
                current === num ? 'bg-[#F26C22] text-white ring-4 ring-orange-50 dark:ring-orange-900/30' : 
                'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
            }`}>
                {current > num ? <CheckCircle2 className="h-5 w-5" /> : num}
            </div>
            <span className={`text-xs font-bold transition-colors ${current === num ? 'text-[#F26C22] dark:text-orange-400' : 'text-slate-400 dark:text-slate-600'}`}>{label}</span>
        </div>
    );

    // Calculate Weekly Limit Remaining
    const getWeeklyBookingsCount = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        endOfWeek.setHours(23, 59, 59, 999);

        return courtBookings.filter(b => {
            if (b.studentId !== user?.id) return false;
            if (b.status === 'Rejected' || b.status === 'Cancelled') return false;
            const bDate = new Date(b.date);
            return bDate >= startOfWeek && bDate <= endOfWeek;
        }).length;
    };

    const weeklyCount = getWeeklyBookingsCount();
    const weeklyLeft = Math.max(0, 5 - weeklyCount);

    return (
        <div className="space-y-6">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Book a Court</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Reserve the multi-purpose court for your activities.</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm transition-all">
                        <div className={`h-2 w-2 rounded-full ${weeklyLeft > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Weekly Quota</span>
                        <span className={`text-sm font-black ${weeklyLeft > 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                            {weeklyLeft} / 5
                        </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Resets every Sunday</p>
                </div>
            </div>

            {/* Booking Policy Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="h-10 w-10 bg-white dark:bg-blue-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm">
                    <Info className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 transition-colors">Booking Policy</h3>
                    <div className="mt-1 text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed space-y-1">
                        <p>• <strong>Daily Limit:</strong> Maximum 2 bookings per day.</p>
                        <p>• <strong>Weekly Limit:</strong> Maximum 5 bookings per week (Sunday to Saturday).</p>
                        <p>• <strong>Advance Booking:</strong> Slots can be reserved up to 30 days in advance.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8 flex justify-between items-center relative max-w-xl mx-auto transition-colors">
                    <div className="absolute top-[48px] left-[10%] right-[10%] h-1 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                    <div className="absolute top-[48px] left-[10%] h-1 bg-[#F26C22] -z-10 rounded-full transition-all duration-500" 
                         style={{ width: `${((step - 1) / 2) * 80}%` }}></div>
                    
                    <StepIndicator num={1} label="Sport" current={step} />
                    <StepIndicator num={2} label="Date" current={step} />
                    <StepIndicator num={3} label="Confirm" current={step} />
                </div>

                <div className="p-8">
                    <div className="min-h-[300px]">
                        
                        {/* Step 1: Select Sport */}
                        {step === 1 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">What do you want to play?</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a sport to see available equipment and configurations.</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
                                    {sports.map(s => {
                                        const isSelected = selectedSport === s.id;
                                        const SportIcon = s.icon;
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => setSelectedSport(s.id)}
                                                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                                                    isSelected ? s.active : `border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 ${s.color}`
                                                }`}
                                            >
                                                <SportIcon className={`h-12 w-12 mb-2 ${isSelected ? '' : 'text-slate-400 dark:text-slate-600'}`} strokeWidth={1.5} />
                                                <span className={`text-lg font-bold ${isSelected ? '' : 'text-slate-700 dark:text-slate-300'}`}>{s.id}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date & Time Selection */}
                        {step === 2 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto">
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left: Custom Calendar (Based on reference image) */}
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 max-w-[380px] mx-auto lg:mx-0 w-full transition-colors">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Court Booking</h2>
                                            <div className="bg-orange-50/80 dark:bg-orange-900/20 text-[#F26C22] dark:text-orange-400 text-xs font-semibold px-3 py-1.5 rounded-full flex gap-2 border border-orange-100/50 dark:border-orange-900/30">
                                                <button onClick={handlePrevMonth} className="hover:text-[#F26C22] dark:hover:text-orange-300 transition-colors"><ChevronLeft className="h-3.5 w-3.5" /></button>
                                                <span>{monthNames[currentMonth]} {currentYear}</span>
                                                <button onClick={handleNextMonth} className="hover:text-[#F26C22] dark:hover:text-orange-300 transition-colors"><ChevronRight className="h-3.5 w-3.5" /></button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-7 mb-2">
                                            {['S','M','T','W','T','F','S'].map((day, i) => (
                                                <div key={i} className="text-center font-bold text-xs text-slate-900 dark:text-white mb-2">{day}</div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {calendarDays.map((calDay, idx) => {
                                                const status = getDateStatus(calDay.dateStr);
                                                const isSelected = selectedDate === calDay.dateStr;
                                                
                                                let bgColor = "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-800";
                                                if (calDay.isCurrentMonth && status !== 'disabled') {
                                                    if (status === 'available') bgColor = "bg-[#BFE9C9] dark:bg-emerald-900/40 text-slate-900 dark:text-emerald-200 border-[#A2D3AF] dark:border-emerald-800";
                                                    if (status === 'booked') bgColor = "bg-[#EE6C6C] dark:bg-red-900/40 text-white dark:text-red-200 border-[#D65454] dark:border-red-800";
                                                    if (status === 'my_booking') bgColor = "bg-[#435B9D] dark:bg-blue-900/40 text-white dark:text-blue-200 border-[#344882] dark:border-blue-800";
                                                }

                                                if (calDay.isCurrentMonth && status === 'disabled') {
                                                    bgColor = "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-slate-800";
                                                }

                                                if (!calDay.isCurrentMonth) {
                                                    bgColor = "bg-slate-50 dark:bg-slate-800/30 text-slate-300 dark:text-slate-700 border border-slate-50 dark:border-slate-800 opacity-70";
                                                }

                                                // In the reference image, the border is slightly rounded square.
                                                // If selected, we might want to highlight it with a ring.
                                                return (
                                                    <button 
                                                        key={idx}
                                                        disabled={status === 'disabled' || status === 'booked' || !calDay.isCurrentMonth}
                                                        onClick={() => {
                                                            setSelectedDate(calDay.dateStr);
                                                            setSelectedSlot(null);
                                                        }}
                                                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${bgColor} ${
                                                            isSelected ? 'ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-[#F26C22] scale-105 shadow-sm' : 'hover:opacity-80'
                                                        } ${
                                                            (status === 'disabled' || status === 'booked' || !calDay.isCurrentMonth) ? 'cursor-not-allowed' : 'cursor-pointer'
                                                        }`}
                                                    >
                                                        {calDay.day}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Legend exactly like image */}
                                        <div className="flex justify-start gap-4 mt-6 text-xs font-bold text-slate-800 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-[#BFE9C9] dark:bg-emerald-900/40 border border-[#A2D3AF] dark:border-emerald-800"></div>Available</div>
                                            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-[#EE6C6C] dark:bg-red-900/40 border border-[#D65454] dark:border-red-800"></div>Booked</div>
                                            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-[#435B9D] dark:bg-blue-900/40 border border-[#344882] dark:border-blue-800"></div>My Booking</div>
                                        </div>
                                    </div>

                                    {/* Right: Time Slots */}
                                    <div className="space-y-6">
                                        <div className="text-left">
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select Time</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Available slots for {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            {!courtSettings.isOpen ? (
                                                <div className="p-4 text-center text-red-500 bg-red-50 rounded-xl font-medium border border-red-100">
                                                    The court is currently closed for maintenance.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {timeSlots.map(slot => {
                                                        const { status, sport } = getSlotStatus(slot);
                                                        const isSelected = selectedSlot === slot;
                                                        const isUnavailable = status !== 'available';
                                                        
                                                        return (
                                                            <button
                                                                key={slot}
                                                                disabled={isUnavailable}
                                                                onClick={() => setSelectedSlot(slot)}
                                                                className={`relative rounded-2xl py-4 border-2 transition-all flex flex-col items-center justify-center overflow-hidden ${
                                                                    isSelected
                                                                    ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 text-[#F26C22] dark:text-orange-400 ring-4 ring-orange-50 dark:ring-orange-900/10 font-bold'
                                                                    : status === 'blocked' || status === 'past'
                                                                        ? 'border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-60'
                                                                        : status === 'booked'
                                                                            ? 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                                                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#F26C22]/40 dark:hover:border-orange-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold'
                                                                }`}
                                                            >
                                                                {status === 'booked' && (
                                                                    <div className="absolute top-0 right-0">
                                                                        <div className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">Reserved</div>
                                                                    </div>
                                                                )}

                                                                <span className={isUnavailable && status !== 'available' ? "opacity-50" : ""}>{slot}</span>
                                                                
                                                                {status === 'booked' && (
                                                                    <div className="flex items-center gap-1 mt-1 opacity-50">
                                                                        <div className="h-1 w-1 rounded-full bg-slate-400"></div>
                                                                        <span className="text-[9px] font-black uppercase tracking-wider">{sport}</span>
                                                                    </div>
                                                                )}

                                                                {(status === 'blocked' || status === 'past') && (
                                                                    <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                                                                        {status === 'blocked' ? 'Maintenance' : 'Passed'}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {step === 3 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300 text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10 p-4">
                                        <CheckCircle2 className="h-12 w-12 text-emerald-500 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Review your booking</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Please confirm the details below before proceeding.</p>

                                <div className="mx-auto max-w-sm rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-6 text-left shadow-sm transition-colors">
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 h-14">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2"><Trophy className="h-4 w-4" /> Sport</span>
                                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {selectedSport} {sports.find(s=>s.id === selectedSport)?.icon && (() => { const I = sports.find(s=>s.id === selectedSport)!.icon; return <I className="h-4 w-4" />; })()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 h-14">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Date</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700 h-14">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Time</span>
                                        <span className="font-bold text-slate-900 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 text-[#F26C22] px-3 py-1 rounded-lg">{selectedSlot}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 h-14">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Reserved for</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center sm:px-10 transition-colors">
                    <button
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1}
                        className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-0 transition-all"
                    >
                        Back
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={(step === 1 && !selectedSport) || (step === 2 && !selectedSlot)}
                            className="flex items-center gap-2 rounded-xl bg-[#F26C22] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#d65a16] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(242,108,34,0.39)] transition-all"
                        >
                            Next Step <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleBooking}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 shadow-[0_4px_14px_0_rgb(16,185,129,0.39)] transition-all"
                        >
                            {isSubmitting ? (
                                <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
                            ) : (
                                'Confirm Booking'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

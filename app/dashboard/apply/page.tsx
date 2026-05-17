'use client';

import { useAuth } from '@/context/AuthContext';
import { useData, Room, Bed } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    CheckCircle2, ChevronRight, BedDouble, CalendarDays, Key,
    AlertTriangle, QrCode, CreditCard, GraduationCap, Banknote, Info
} from 'lucide-react';

type PaymentMethod = 'Full Payment' | 'Installment Plan';

const SEMESTER_FEE = 600;
const INSTALLMENT_AMOUNT = 150;
const INSTALLMENT_COUNT = 4;

export default function ApplyPage() {
    const { user } = useAuth();
    const { createApplication, getAvailableFloors, getRoomsByFloor, myApplication, rooms } = useData();
    const router = useRouter();

    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Full Payment');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const allowedFloors = user ? getAvailableFloors(user.gender) : [];
    const roomsOnFloor = selectedFloor ? getRoomsByFloor(selectedFloor) : [];;

    if (!user) return null;

    const activeApplication = myApplication && ['Pending', 'Payment Pending', 'Approved', 'Checked in'].includes(myApplication.status) ? myApplication : null;

    if (activeApplication) {
        const myRoom = rooms.find(r => r.id === activeApplication?.roomId);
        const myBed = myRoom?.beds.find(b => b.id === activeApplication?.bedId);
        const bedLabel = myBed?.label || activeApplication?.bedId;
        return (
            <div className="space-y-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Application Status</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">You have an active application or stay.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 max-w-2xl mx-auto mt-10 text-center flex flex-col items-center">
                    <div className="h-24 w-24 bg-orange-50 dark:bg-orange-900/20 rounded-full ring-8 ring-orange-50/50 flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-[#F26C22]" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {activeApplication.status === 'Checked in' ? 'Check-in Confirmed' :
                         activeApplication.status === 'Approved' || activeApplication.status === 'Payment Pending' ? 'Application Approved' :
                         'Application Logged'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                        {activeApplication.status === 'Checked in' ?
                            'Welcome to your new home! Your room placement is confirmed.' :
                         activeApplication.status === 'Approved' || activeApplication.status === 'Payment Pending' ?
                            'Your application has been approved. Please proceed to financials to complete payment.' :
                            'Your hostel application is pending review. You will be notified once there are updates.'
                        }
                    </p>

                    {(activeApplication.status === 'Approved' || activeApplication.status === 'Payment Pending') && (
                        <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-2xl flex items-start gap-4 text-left max-w-md w-full">
                            <div className="bg-[#F26C22] text-white p-2 rounded-xl shrink-0">
                                <QrCode className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">Ready for Check-In?</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    Proceed to the Hostel Check-In Hub and scan your <strong className="text-slate-700 dark:text-slate-300">Digital Access Card</strong> QR code at the terminal.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 text-left space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-700">
                            <span className="text-slate-500 font-bold text-sm">Status</span>
                            <span className="bg-[#F26C22] text-white px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-widest">{activeApplication.status}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-700">
                            <span className="text-slate-500 font-bold text-sm flex items-center gap-2"><Key className="h-4 w-4 text-[#F26C22]"/>Room Block</span>
                            <span className="text-slate-900 dark:text-white font-bold">Floor {activeApplication.floorId} · Room {activeApplication.roomId}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-700">
                            <span className="text-slate-500 font-bold text-sm flex items-center gap-2"><BedDouble className="h-4 w-4 text-[#F26C22]"/>Bed</span>
                            <span className="text-slate-900 dark:text-white font-bold">Bed {bedLabel || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-700">
                            <span className="text-slate-500 font-bold text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#F26C22]"/>Duration</span>
                            <span className="text-slate-900 dark:text-white font-bold">1 Semester</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-bold text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#F26C22]"/>Payment Plan</span>
                            <span className="text-slate-900 dark:text-white font-bold">{(activeApplication as any).paymentMethod || 'Full Payment'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleNext = () => {
        if (step === 1 && selectedFloor) setStep(2);
        else if (step === 2 && selectedRoom) setStep(3);
        else if (step === 3 && selectedBed) setStep(4);
        setError(null);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((step - 1) as any);
            if (step === 2) setSelectedRoom(null);
            if (step === 3) setSelectedBed(null);
        }
        setError(null);
    };

    const handleSubmit = async () => {
        if (!selectedFloor || !selectedRoom || !selectedBed) return;
        setIsSubmitting(true);
        setError(null);
        const result: any = await createApplication({
            roomType: 'Shared (4)',
            floorId: selectedFloor,
            roomId: selectedRoom.id,
            bedId: selectedBed.id,
            paymentMethod,
        });
        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
        }
    };

    const StepIndicator = ({ num, label, current }: { num: number; label: string; current: number }) => (
        <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${
                current > num ? 'bg-emerald-500 text-white' :
                current === num ? 'bg-[#F26C22] text-white ring-4 ring-orange-50 dark:ring-orange-900/30' :
                'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
                {current > num ? <CheckCircle2 className="h-5 w-5" /> : num}
            </div>
            <span className={`text-xs font-bold ${current === num ? 'text-[#F26C22]' : 'text-slate-400'}`}>{label}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Hostel Application</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">All students are required to stay for a full semester (RM600).</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Progress */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8 flex justify-between items-center relative">
                    <div className="absolute top-[48px] left-[10%] right-[10%] h-1 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                    <div className="absolute top-[48px] left-[10%] h-1 bg-[#F26C22] -z-10 rounded-full transition-all duration-500"
                         style={{ width: `${((step - 1) / 3) * 80}%` }}></div>
                    <StepIndicator num={1} label="Floor" current={step} />
                    <StepIndicator num={2} label="Room" current={step} />
                    <StepIndicator num={3} label="Bed" current={step} />
                    <StepIndicator num={4} label="Payment" current={step} />
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <div className="min-h-[300px]">

                        {/* Step 1: Floor */}
                        {step === 1 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select a Floor</h2>
                                    <p className="text-sm text-slate-500 mt-1">Showing available floors for {user.gender} students.</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto">
                                    {allowedFloors.map(floor => (
                                        <button key={floor} onClick={() => setSelectedFloor(floor)}
                                            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                                                selectedFloor === floor
                                                ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 text-[#F26C22] ring-4 ring-orange-50'
                                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-200 text-slate-600'
                                            }`}>
                                            <Key className={`h-8 w-8 ${selectedFloor === floor ? 'text-[#F26C22]' : 'text-slate-300 dark:text-slate-700'}`} />
                                            <span className="text-lg font-bold">Floor {floor}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Room */}
                        {step === 2 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select a Room</h2>
                                    <p className="text-sm text-slate-500 mt-1">Available rooms on Floor {selectedFloor}.</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5 max-w-4xl mx-auto">
                                    {roomsOnFloor.map(room => {
                                        const availableBeds = room.beds.filter(b => !b.isOccupied).length;
                                        return (
                                            <button key={room.id} onClick={() => setSelectedRoom(room)}
                                                className={`relative flex h-32 flex-col items-center justify-center rounded-2xl border-2 p-2 transition-all ${
                                                    selectedRoom?.id === room.id
                                                    ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 ring-4 ring-orange-50'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-orange-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}>
                                                <span className={`text-lg font-bold ${selectedRoom?.id === room.id ? 'text-[#F26C22]' : 'text-slate-700 dark:text-slate-300'}`}>{room.label}</span>
                                                <span className={`mt-2 text-xs font-bold px-2 py-1 rounded-full ${availableBeds === 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {availableBeds} beds left
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bed */}
                        {step === 3 && selectedRoom && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select your Bed</h2>
                                    <p className="text-sm text-slate-500 mt-1">{selectedRoom.roomType} layout for {selectedRoom.label}.</p>
                                </div>
                                <div className="flex justify-center">
                                    <div className="grid w-full max-w-md grid-cols-2 gap-4 p-6 border-4 border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                                        {selectedRoom.beds.map(bed => (
                                            <button key={bed.id} disabled={bed.isOccupied} onClick={() => setSelectedBed(bed)}
                                                className={`flex p-6 flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                                                    bed.isOccupied ? 'bg-slate-200 dark:bg-slate-800 border-slate-200 cursor-not-allowed opacity-50' :
                                                    selectedBed?.id === bed.id ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 text-[#F26C22] ring-4 ring-orange-50' :
                                                    'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700'
                                                }`}>
                                                <BedDouble className={`h-8 w-8 mb-2 ${selectedBed?.id === bed.id ? 'text-[#F26C22]' : 'text-slate-400'}`} />
                                                <span className="font-bold text-sm tracking-widest">{bed.label}</span>
                                                {bed.isOccupied && <span className="text-[10px] text-red-600 font-bold mt-1 bg-red-100 px-2 py-0.5 rounded-full">TAKEN</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Payment Method */}
                        {step === 4 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300 max-w-2xl mx-auto">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose Payment Method</h2>
                                    <p className="text-sm text-slate-500 mt-1">Hostel fee is fixed at RM600 per semester for all students.</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                                    {/* Full Payment */}
                                    <button onClick={() => setPaymentMethod('Full Payment')}
                                        className={`flex-1 rounded-3xl border-2 p-8 text-center transition-all ${
                                            paymentMethod === 'Full Payment'
                                            ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 ring-4 ring-orange-50 dark:ring-orange-900/10'
                                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#F26C22]/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}>
                                        <div className="bg-white dark:bg-slate-900 h-16 w-16 mx-auto rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
                                            <CreditCard className={`h-8 w-8 ${paymentMethod === 'Full Payment' ? 'text-[#F26C22]' : 'text-slate-400'}`} />
                                        </div>
                                        <div className={`text-xl font-bold mb-1 ${paymentMethod === 'Full Payment' ? 'text-[#F26C22]' : 'text-slate-900 dark:text-white'}`}>Full Payment</div>
                                        <div className="text-slate-500 text-sm mb-4">Single transaction</div>
                                        <div className={`text-3xl font-extrabold ${paymentMethod === 'Full Payment' ? 'text-[#F26C22]' : 'text-slate-800 dark:text-slate-200'}`}>RM 600</div>
                                        <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full inline-block">One-time · Best Value</div>
                                    </button>

                                    {/* Installment Plan */}
                                    <button onClick={() => setPaymentMethod('Installment Plan')}
                                        className={`flex-1 rounded-3xl border-2 p-8 text-center transition-all ${
                                            paymentMethod === 'Installment Plan'
                                            ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 ring-4 ring-orange-50 dark:ring-orange-900/10'
                                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#F26C22]/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}>
                                        <div className="bg-white dark:bg-slate-900 h-16 w-16 mx-auto rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
                                            <Banknote className={`h-8 w-8 ${paymentMethod === 'Installment Plan' ? 'text-[#F26C22]' : 'text-slate-400'}`} />
                                        </div>
                                        <div className={`text-xl font-bold mb-1 ${paymentMethod === 'Installment Plan' ? 'text-[#F26C22]' : 'text-slate-900 dark:text-white'}`}>Installment Plan</div>
                                        <div className="text-slate-500 text-sm mb-4">4 monthly payments</div>
                                        <div className={`text-3xl font-extrabold ${paymentMethod === 'Installment Plan' ? 'text-[#F26C22]' : 'text-slate-800 dark:text-slate-200'}`}>RM 150<span className="text-base font-bold">/mo</span></div>
                                        <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">× 4 months · Flexible</div>
                                    </button>
                                </div>

                                {/* Payment Summary */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-3">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Payment Summary</h3>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Total Semester Fee</span>
                                        <span className="font-black text-slate-900 dark:text-white">RM 600.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Payment Method</span>
                                        <span className="font-black text-[#F26C22]">{paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Duration</span>
                                        <span className="font-black text-slate-900 dark:text-white">1 Semester (4 Months)</span>
                                    </div>
                                    {paymentMethod === 'Installment Plan' && (
                                        <>
                                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Installment Schedule</p>
                                                {Array.from({ length: INSTALLMENT_COUNT }, (_, i) => (
                                                    <div key={i} className="flex justify-between items-center py-2 text-sm">
                                                        <span className="text-slate-500">Installment {i + 1} <span className="text-xs text-slate-400">(Month {i + 1})</span></span>
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">RM {INSTALLMENT_AMOUNT}.00</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                                        <span className="font-black text-slate-900 dark:text-white">Amount Due Now</span>
                                        <span className="font-black text-[#F26C22] text-lg">
                                            {paymentMethod === 'Full Payment' ? 'RM 600.00' : 'RM 150.00'}
                                        </span>
                                    </div>
                                    {paymentMethod === 'Installment Plan' && (
                                        <div className="flex items-start gap-2 pt-2">
                                            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Subsequent installments will be automatically invoiced monthly. Overdue payments may affect your account status.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center sm:px-10">
                    <button onClick={handleBack} disabled={step === 1}
                        className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-0 transition-all">
                        Back
                    </button>

                    {step < 4 ? (
                        <button onClick={handleNext}
                            disabled={(step === 1 && !selectedFloor) || (step === 2 && !selectedRoom) || (step === 3 && !selectedBed)}
                            className="flex items-center gap-2 rounded-xl bg-[#F26C22] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#d65a16] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(242,108,34,0.39)] transition-all">
                            Next Step <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 shadow-[0_4px_14px_0_rgb(16,185,129,0.39)] transition-all">
                            {isSubmitting ? (
                                <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
                            ) : (
                                `Confirm Application (${paymentMethod === 'Full Payment' ? 'RM 600' : '4 × RM 150'})`
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

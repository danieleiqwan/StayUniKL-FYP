'use client';

import { useAuth } from '@/context/AuthContext';
import { useData, Room, Bed } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, ChevronRight, BedDouble, CalendarDays, Key, GraduationCap, AlertTriangle } from 'lucide-react';

export default function ApplyPage() {
    const { user } = useAuth();
    const { createApplication, getAvailableFloors, getRoomsByFloor, myApplication, rooms } = useData();
    const router = useRouter();

    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
    const [stayDuration, setStayDuration] = useState<1 | 4>(1); // 1 month or 4 months (1 semester)
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const allowedFloors = user ? getAvailableFloors(user.gender) : [];
    const roomsOnFloor = selectedFloor ? getRoomsByFloor(selectedFloor) : [];
    const monthlyRate = 120;
    const totalPrice = stayDuration * monthlyRate;

    if (!user) return null;

    if (myApplication) {
        const myRoom = rooms.find(r => r.id === myApplication?.roomId);
        const myBed = myRoom?.beds.find(b => b.id === myApplication?.bedId);
        const bedLabel = myBed?.label || myApplication?.bedId;

        return (
            <div className="space-y-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Application Status</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">You have already submitted an application.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 max-w-2xl mx-auto mt-10 text-center flex flex-col items-center transition-colors">
                    <div className="h-24 w-24 bg-orange-50 dark:bg-orange-900/20 rounded-full ring-8 ring-orange-50/50 dark:ring-orange-900/10 flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-[#F26C22] dark:text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Application Logged</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                        We have successfully safely logged your hostel application. You will be notified once there are updates regarding your placement.
                    </p>

                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 text-left space-y-4 shadow-inner transition-colors">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">Status</span>
                            <span className="bg-[#F26C22] text-white px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-widest">{myApplication.status}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-sm flex items-center gap-2"><Key className="h-4 w-4 text-[#F26C22] dark:text-orange-400"/> Room Block</span>
                            <span className="text-slate-900 dark:text-white font-bold">Floor {myApplication.floorId} • Room {myApplication.roomId}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-sm flex items-center gap-2"><BedDouble className="h-4 w-4 text-[#F26C22] dark:text-orange-400"/> Bed Selection</span>
                            <span className="text-slate-900 dark:text-white font-bold">Bed {bedLabel || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-sm flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#F26C22] dark:text-orange-400" /> Valid Duration</span>
                            <span className="text-slate-900 dark:text-white font-bold">{myApplication.stayDuration} {myApplication.stayDuration > 1 ? 'Months' : 'Month'}</span>
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
            stayDuration,
            durationType: stayDuration === 4 ? '1_semester' : '1_month',
            totalPrice
        });

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
        } else {
            // Success case is handled by createApplication (redirect)
        }
    };

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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">Hostel Application</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Follow the steps below to secure your room placement.</p>
            </div>

            {/* Main Application Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                
                {/* Wizard Header / Progress */}
                <div className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 p-8 flex justify-between items-center relative">
                    <div className="absolute top-[48px] left-[10%] right-[10%] h-1 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full"></div>
                    <div className="absolute top-[48px] left-[10%] h-1 bg-[#F26C22] -z-10 rounded-full transition-all duration-500" 
                         style={{ width: `${((step - 1) / 3) * 80}%` }}></div>
                    
                    <StepIndicator num={1} label="Floor" current={step} />
                    <StepIndicator num={2} label="Room" current={step} />
                    <StepIndicator num={3} label="Bed" current={step} />
                    <StepIndicator num={4} label="Duration" current={step} />
                </div>

                <div className="p-8">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 animate-shake">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    {/* Step Content Area */}
                    <div className="min-h-[300px]">
                        
                        {/* Step 1: Floor Selection */}
                        {step === 1 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select a Floor</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Showing available floors for {user.gender} students.</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto">
                                    {allowedFloors.map(floor => (
                                        <button
                                            key={floor}
                                            onClick={() => setSelectedFloor(floor)}
                                            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                                                selectedFloor === floor
                                                ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 text-[#F26C22] dark:text-orange-400 ring-4 ring-orange-50 dark:ring-orange-900/10'
                                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            <Key className={`h-8 w-8 ${selectedFloor === floor ? 'text-[#F26C22]' : 'text-slate-300 dark:text-slate-700'}`} />
                                            <span className="text-lg font-bold">Floor {floor}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Room Selection */}
                        {step === 2 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select a Room</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Available rooms on Floor {selectedFloor}.</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-5 max-w-4xl mx-auto">
                                    {roomsOnFloor.map(room => {
                                        const availableBeds = room.beds.filter(b => !b.isOccupied).length;
                                        return (
                                            <button
                                                key={room.id}
                                                onClick={() => setSelectedRoom(room)}
                                                className={`relative flex h-32 flex-col items-center justify-center rounded-2xl border-2 p-2 transition-all ${
                                                    selectedRoom?.id === room.id
                                                    ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 ring-4 ring-orange-50 dark:ring-orange-900/10'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <span className={`text-lg font-bold ${selectedRoom?.id === room.id ? 'text-[#F26C22] dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>{room.label}</span>
                                                <span className={`mt-2 text-xs font-bold px-2 py-1 rounded-full ${
                                                    availableBeds === 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                    {availableBeds} beds left
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Bed Selection */}
                        {step === 3 && selectedRoom && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select your Bed</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedRoom.roomType} Room layout for {selectedRoom.label}.</p>
                                </div>
                                <div className="flex justify-center">
                                    <div className="grid w-full max-w-md grid-cols-2 gap-4 p-6 border-4 border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                                        {selectedRoom.beds.map(bed => (
                                            <button
                                                key={bed.id}
                                                disabled={bed.isOccupied}
                                                onClick={() => setSelectedBed(bed)}
                                                className={`flex p-6 flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                                                    bed.isOccupied
                                                    ? 'bg-slate-200 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50'
                                                    : selectedBed?.id === bed.id
                                                        ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 text-[#F26C22] dark:text-orange-400 ring-4 ring-orange-50 dark:ring-orange-900/10'
                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                <BedDouble className={`h-8 w-8 mb-2 ${selectedBed?.id === bed.id ? 'text-[#F26C22]' : 'text-slate-400 dark:text-slate-600'}`} />
                                                <span className="font-bold text-sm tracking-widest">{bed.label}</span>
                                                {bed.isOccupied && <span className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-1 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full transition-colors">TAKEN</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Duration Selection */}
                        {step === 4 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">How long will you stay?</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monthly rate is RM {monthlyRate}.00</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                                    <button
                                        onClick={() => setStayDuration(1)}
                                        className={`flex-1 max-w-sm rounded-3xl border-2 p-8 text-center transition-all ${
                                            stayDuration === 1
                                            ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 ring-4 ring-orange-50 dark:ring-orange-900/10'
                                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#F26C22]/30 dark:hover:border-orange-900/30 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="bg-white dark:bg-slate-900 h-16 w-16 mx-auto rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
                                            <CalendarDays className={`h-8 w-8 ${stayDuration === 1 ? 'text-[#F26C22]' : 'text-slate-400 dark:text-slate-600'}`} />
                                        </div>
                                        <div className={`text-xl font-bold ${stayDuration === 1 ? 'text-[#F26C22]' : 'text-slate-900 dark:text-white'}`}>1 Month</div>
                                        <div className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">Short Stay Program</div>
                                        <div className={`text-3xl font-extrabold ${stayDuration === 1 ? 'text-[#F26C22]' : 'text-slate-800 dark:text-slate-200'}`}>
                                            RM 120
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setStayDuration(4)}
                                        className={`flex-1 max-w-sm rounded-3xl border-2 p-8 text-center transition-all ${
                                            stayDuration === 4
                                            ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 ring-4 ring-orange-50 dark:ring-orange-900/10'
                                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#F26C22]/30 dark:hover:border-orange-900/30 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="bg-white dark:bg-slate-900 h-16 w-16 mx-auto rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
                                            <GraduationCap className={`h-8 w-8 ${stayDuration === 4 ? 'text-[#F26C22]' : 'text-slate-400 dark:text-slate-600'}`} />
                                        </div>
                                        <div className={`text-xl font-bold ${stayDuration === 4 ? 'text-[#F26C22]' : 'text-slate-900 dark:text-white'}`}>Full Semester</div>
                                        <div className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">4 Months Duration</div>
                                        <div className={`text-3xl font-extrabold ${stayDuration === 4 ? 'text-[#F26C22]' : 'text-slate-800 dark:text-slate-200'}`}>
                                            RM 480
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center sm:px-10 transition-colors">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-0 transition-all"
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            disabled={(step === 1 && !selectedFloor) || (step === 2 && !selectedRoom) || (step === 3 && !selectedBed)}
                            className="flex items-center gap-2 rounded-xl bg-[#F26C22] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#d65a16] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(242,108,34,0.39)] transition-all"
                        >
                            Next Step <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 shadow-[0_4px_14px_0_rgb(16,185,129,0.39)] transition-all"
                        >
                            {isSubmitting ? (
                                <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
                            ) : (
                                `Confirm & Proceed (RM ${totalPrice}.00)`
                            )}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

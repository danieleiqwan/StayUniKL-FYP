'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData, Room, Bed } from '@/context/DataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Home, FileText, AlertCircle, CheckCircle, Clock, Upload, X, ArrowLeft, ArrowRight, Bed as BedIcon } from 'lucide-react';
import Link from 'next/link';

interface RoomChangeRequest {
    id: string;
    status: string;
    reason: string;
    current_room_number: string;
    new_room_number?: string;
    admin_notes?: string;
    created_at: string;
    reviewed_at?: string;
    waitlist_position?: number;
    preferred_bed_id?: string;
    preferred_room_type?: string;
}

export default function RoomChangePage() {
    const { user } = useAuth();
    const { applications, getAvailableFloors, getRoomsByFloor } = useData();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeRequest, setActiveRequest] = useState<RoomChangeRequest | null>(null);
    const [currentApplication, setCurrentApplication] = useState<any>(null);

    // Wizard State
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

    // Form state
    const [reason, setReason] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [attachmentName, setAttachmentName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data for wizard
    const allowedFloors = user ? getAvailableFloors(user.gender) : [];
    const roomsOnFloor = selectedFloor ? getRoomsByFloor(selectedFloor) : [];

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Find current checked-in application
            const checkedInApp = applications.find(
                (app) => app.studentId === user?.id && app.status === 'Checked in'
            );
            setCurrentApplication(checkedInApp);

            // Fetch existing requests
            const res = await fetch(`/api/room-change-requests?studentId=${user?.id}`);
            const data = await res.json();

            if (data.success && data.requests.length > 0) {
                // Find active request
                const active = data.requests.find((r: RoomChangeRequest) =>
                    ['Pending Review', 'Approved - Assigned', 'Approved - Waitlist'].includes(r.status)
                );
                setActiveRequest(active || null);
            }

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && selectedFloor) setStep(2);
        else if (step === 2 && selectedRoom) setStep(3);
        else if (step === 3 && selectedBed) setStep(4);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((step - 1) as any);
            if (step === 2) setSelectedRoom(null);
            if (step === 3) setSelectedBed(null);
        }
    };

    const validateForm = () => {
        const newErrors: any = {};

        if (!reason.trim()) {
            newErrors.reason = 'Reason is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only JPG, PNG, and PDF files are allowed.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload-room-change-docs', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setAttachmentUrl(data.url);
                setAttachmentName(data.fileName);
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedBed || !validateForm()) return;

        try {
            setSubmitting(true);

            const res = await fetch('/api/room-change-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user?.id,
                    studentName: user?.name,
                    currentRoomId: currentApplication?.roomId,
                    currentBedId: currentApplication?.bedId,
                    preferredRoomId: selectedRoom?.id,
                    preferredRoomType: selectedRoom?.roomType,
                    preferredBedId: selectedBed.id,
                    reason: reason.trim(),
                    attachment_url: attachmentUrl
                })
            });

            const data = await res.json();

            if (data.success) {
                alert('Room change request submitted successfully!');
                // Reset wizard
                setStep(1);
                setSelectedFloor(null);
                setSelectedRoom(null);
                setSelectedBed(null);
                setReason('');
                setAttachmentUrl('');
                setAttachmentName('');
                loadData();
            } else {
                alert(`Error: ${data.error}`);
            }

        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="space-y-2 text-left">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>

                {/* Content Skeleton */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm h-[450px]">
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-1/3 rounded-xl" />
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    // Check if student is checked in
    if (!currentApplication) {
        return (
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-12 text-center mt-10 shadow-sm flex flex-col items-center transition-colors">
                <div className="h-24 w-24 bg-orange-50 dark:bg-orange-900/20 rounded-full ring-8 ring-orange-50/50 dark:ring-orange-900/10 flex items-center justify-center mb-8">
                    <AlertCircle className="h-12 w-12 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Assignment Required
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm">
                    You must be checked in to a room before you can request a room change.
                </p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-[#F26C22] text-white px-10 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
                        Room Change Request
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Placement:</span>
                        <span className="text-sm font-black text-[#F26C22] bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg">
                            {currentApplication.roomId} • Bed {currentApplication.bedId}
                        </span>
                    </div>
                </div>
                {activeRequest && (
                    <StatusBadge status={activeRequest.status} />
                )}
            </div>

            <div className="max-w-7xl">
                {activeRequest ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group transition-colors">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <ArrowRight className="h-32 w-32 text-slate-900 dark:text-white" />
                        </div>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-14 w-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[#F26C22] dark:text-orange-400 shadow-sm mb-1">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Request Details</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 relative z-10">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-2">Requested Type</p>
                                <p className="font-bold text-slate-900 dark:text-white text-lg">{activeRequest.preferred_room_type || 'Same Type'}</p>
                            </div>
                            
                            {activeRequest.preferred_bed_id && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-2">Preferred Bed</p>
                                    <div className="flex items-center gap-2">
                                        <BedIcon className="h-5 w-5 text-[#F26C22] dark:text-orange-400" />
                                        <span className="font-black text-[#F26C22] dark:text-orange-400 text-lg">{activeRequest.preferred_bed_id}</span>
                                    </div>
                                </div>
                            )}

                            <div className="md:col-span-2 space-y-2">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">Justification</p>
                                <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 leading-relaxed italic text-sm">
                                    "{activeRequest.reason}"
                                </div>
                            </div>

                            {activeRequest.admin_notes && (
                                <div className="md:col-span-2 space-y-2">
                                    <p className="text-[10px] text-rose-500 dark:text-rose-400 uppercase font-black tracking-widest mb-1">Admin Response</p>
                                    <div className="text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-900/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30 font-medium text-sm">
                                        {activeRequest.admin_notes}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                            <span>REF ID: {activeRequest.id.split('-')[0]}</span>
                            <span>SUBMITTED: {new Date(activeRequest.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>
                ) : (
                    /* Wizard Steps */
                    <div className="space-y-6">
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-6 py-4 rounded-2xl flex items-start sm:items-center gap-3 text-sm shadow-sm">
                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                            <p className="font-bold">Important Notice: You can only request a room change <span className="font-black underline underline-offset-2">once</span> during your residency.</p>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                            {/* Custom Progress Bar */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-10 py-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-[#F26C22] flex items-center justify-center text-white font-black text-xs">
                                        {step}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {step === 1 ? 'Filter by Floor' : step === 2 ? 'Select Room' : step === 3 ? 'Select Bed' : 'Confirm Request'}
                                    </span>
                                </div>
                                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Progress: {Math.round((step/4)*100)}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#F26C22] rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(242,108,34,0.4)]"
                                    style={{ width: `${(step / 4) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="p-10 min-h-[400px]">
                            {/* Step 1: Floor Selection */}
                            {step === 1 && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                    <h2 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">Choose a Floor</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {allowedFloors.map(floor => (
                                            <button
                                                key={floor}
                                                onClick={() => setSelectedFloor(floor)}
                                                className={`aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center transition-all group ${selectedFloor === floor
                                                    ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 text-[#F26C22] dark:text-orange-400 shadow-xl shadow-orange-500/20 scale-105'
                                                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#F26C22]/40 dark:hover:border-orange-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <span className="text-4xl mb-3 drop-shadow-sm group-hover:scale-110 transition-transform">🏢</span>
                                                <span className="font-black text-lg dark:text-white">Floor {floor}</span>
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter">Availability: High</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Room Selection */}
                            {step === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                    <h2 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">Select Room in Floor {selectedFloor}</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {roomsOnFloor.map(room => {
                                            const availableBeds = room.beds.filter(b => !b.isOccupied).length;
                                            const isCurrentRoom = room.id === currentApplication.roomId;

                                            return (
                                                <button
                                                    key={room.id}
                                                    disabled={isCurrentRoom}
                                                    onClick={() => setSelectedRoom(room)}
                                                    className={`relative p-6 rounded-3xl border-2 text-left transition-all ${isCurrentRoom
                                                        ? 'border-slate-50 dark:border-slate-800 bg-slate-200/20 dark:bg-slate-800/20 opacity-40 cursor-not-allowed'
                                                        : selectedRoom?.id === room.id
                                                            ? 'border-[#F26C22] bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                                                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#F26C22]/40 dark:hover:border-orange-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-lg text-slate-900 dark:text-white">{room.label}</span>
                                                        {isCurrentRoom && <span className="text-[9px] bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-2 py-0.5 rounded font-black uppercase tracking-tighter">Your Room</span>}
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{room.roomType}</div>
                                                    <div className={`text-[10px] font-bold flex items-center gap-1.5 ${availableBeds === 0 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${availableBeds === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                                        {availableBeds} Available
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Bed Selection */}
                            {step === 3 && selectedRoom && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                    <h2 className="text-xl font-bold mb-8 text-slate-900 dark:text-white text-center transition-colors">Assign a Bed in {selectedRoom.label}</h2>
                                    <div className="flex justify-center">
                                        <div className="grid grid-cols-2 gap-8 p-10 border-4 border-slate-50 dark:border-slate-800 rounded-[3rem] bg-slate-50/50 dark:bg-slate-800/50 max-w-xl w-full transition-colors">
                                            {selectedRoom.beds.map(bed => (
                                                <button
                                                    key={bed.id}
                                                    disabled={bed.isOccupied}
                                                    onClick={() => setSelectedBed(bed)}
                                                    className={`h-40 rounded-[2rem] border-2 flex flex-col items-center justify-center transition-all relative ${bed.isOccupied
                                                        ? 'bg-slate-200/50 dark:bg-slate-800/50 border-transparent dark:border-slate-700 cursor-not-allowed opacity-30 grayscale'
                                                        : selectedBed?.id === bed.id
                                                            ? 'border-[#F26C22] bg-orange-100 dark:bg-orange-900/30 text-[#F26C22] dark:text-orange-400 shadow-xl shadow-orange-500/20 scale-105'
                                                            : 'border-white dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-orange-200 dark:hover:border-orange-800 shadow-sm'
                                                        }`}
                                                >
                                                    <BedIcon className={`h-10 w-10 mb-3 ${selectedBed?.id === bed.id ? 'text-[#F26C22]' : 'text-slate-400 dark:text-slate-600'}`} />
                                                    <span className="font-black text-xl dark:text-white">{bed.label}</span>
                                                    {!bed.isOccupied && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400 mt-1">AVAILABLE</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Reason & Submit */}
                            {step === 4 && selectedRoom && selectedBed && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
                                    <h2 className="text-xl font-bold mb-8 text-slate-900 dark:text-white">Justify Your Request</h2>

                                    <div className="bg-[#F26C22] dark:bg-orange-600 rounded-3xl p-8 mb-8 flex items-center justify-between text-white shadow-xl shadow-orange-500/20">
                                        <div>
                                            <p className="text-[10px] text-orange-100 uppercase font-black tracking-[0.2em] mb-2 opacity-70">Proposed Destination</p>
                                            <h3 className="font-black text-3xl">
                                                {selectedRoom.label} • Bed {selectedBed.label}
                                            </h3>
                                            <div className="text-xs font-bold text-orange-100 mt-2 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div> Level {selectedFloor} • {selectedRoom.roomType}
                                            </div>
                                        </div>
                                        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <CheckCircle className="h-8 w-8 text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                                Reason for Change <span className="text-rose-500 font-black">*</span>
                                            </label>
                                            <textarea
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="Please provide a valid medical or academic reason..."
                                                className={`w-full px-6 py-5 rounded-3xl border-2 ${errors.reason ? 'border-rose-500' : 'border-slate-100 dark:border-slate-800'} bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all text-sm font-medium dark:text-white outline-none resize-none`}
                                                rows={4}
                                            />
                                            <div className="flex justify-between mt-2">
                                                {errors.reason && <p className="text-rose-500 dark:text-rose-400 text-[10px] font-black uppercase">{errors.reason}</p>}
                                                <span className="text-[10px] font-black ml-auto text-slate-400 dark:text-slate-500">{reason.length} characters</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                                Supporting Documentation <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">(Optional)</span>
                                                <span className="text-[9px] font-normal lowercase tracking-normal ml-2">(PDF, JPG, PNG up to 10MB)</span>
                                            </label>
                                            
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="hidden" 
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileUpload}
                                            />

                                            {!attachmentUrl ? (
                                                <button
                                                    type="button"
                                                    disabled={isUploading}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`w-full py-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all ${
                                                        isUploading 
                                                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800' 
                                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-[#F26C22] hover:bg-orange-50/30 dark:hover:bg-orange-900/10'
                                                    }`}
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <div className="h-10 w-10 border-4 border-[#F26C22]/20 border-t-[#F26C22] rounded-full animate-spin"></div>
                                                            <span className="text-xs font-bold text-slate-500 animate-pulse">Uploading Document...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                                                                <Upload className="h-6 w-6" />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Click to upload file</p>
                                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Medical Certificate, Official Letter, etc.</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 flex items-center justify-between shadow-sm animate-in zoom-in-95 duration-300">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                                                            <FileText className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">
                                                                {attachmentName}
                                                            </p>
                                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Ready for submission</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => { setAttachmentUrl(''); setAttachmentName(''); }}
                                                        className="h-10 w-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-slate-100 dark:border-slate-800"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Footer */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-10 py-6 flex justify-between items-center transition-colors">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className="px-8 py-3 rounded-2xl text-slate-600 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-0 transition-all"
                            >
                                Re-evaluate
                            </button>

                            {step < 4 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={
                                        (step === 1 && !selectedFloor) ||
                                        (step === 2 && !selectedRoom) ||
                                        (step === 3 && !selectedBed)
                                    }
                                    className="px-8 py-3 bg-[#F26C22] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#d65a16] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-100 flex items-center gap-2"
                                >
                                    Proceed <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                >
                                    {submitting ? 'LOGGING...' : 'COMMIT REQUEST'}
                                </button>
                            )}
                        </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
        'Pending Review': { bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30', text: 'text-amber-600 dark:text-amber-400', icon: Clock },
        'Approved - Assigned': { bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle },
        'Approved - Waitlist': { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: Clock },
        'Rejected': { bg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30', text: 'text-rose-600 dark:text-rose-400', icon: AlertCircle },
        'Completed': { bg: 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800', text: 'text-slate-600 dark:text-slate-400 font-black', icon: CheckCircle },
    };

    const { bg, text, icon: Icon } = config[status] || config['Pending Review'];

    return (
        <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${bg} ${text} shadow-sm`}>
            <Icon className="h-3.5 w-3.5" />
            {status}
        </span>
    );
}

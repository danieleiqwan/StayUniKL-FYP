'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Home, CheckCircle, AlertCircle, Users, Bed as BedIcon, Building2, FileText } from 'lucide-react';

interface Room {
    id: string;
    floorId: number;
    label: string;
    roomType: string;
    gender: string;
    capacity: number;
    status: string;
    beds: Bed[];
}

interface Bed {
    id: string;
    label: string;
    status: string;
    isOccupied: boolean;
    occupantName: string | null;
    occupantId: string | null;
}

interface RoomAssignmentModalProps {
    studentId: string;
    studentGender: string;
    currentRoomId: string;
    preferredRoomType?: string;
    preferredBedId?: string;
    onClose: () => void;
    onAssign: (roomId: string, bedId: string, adminNotes: string) => void;
}

export default function RoomAssignmentModal({
    studentId,
    studentGender,
    currentRoomId,
    preferredRoomType,
    preferredBedId,
    onClose,
    onAssign
}: RoomAssignmentModalProps) {
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedBedId, setSelectedBedId] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [availableBeds, setAvailableBeds] = useState<any[]>([]);

    useEffect(() => {
        loadRoomsAndBeds();
    }, []);

    const loadRoomsAndBeds = async () => {
        try {
            setLoading(true);

            const roomsRes = await fetch('/api/rooms');
            const roomsData = await roomsRes.json();
            const roomsList = roomsData.rooms || [];
            
            setRooms(roomsList);

            const available = filterAvailableBeds(
                roomsList,
                studentGender,
                preferredRoomType
            );

            setAvailableBeds(available);

            // If there's only one room available, pre-select it
            if (available.length > 0) {
                const uniqueRoomIds = [...new Set(available.map(b => b.roomId))];
                if (uniqueRoomIds.length === 1) {
                    setSelectedRoomId(uniqueRoomIds[0]);
                }
            }

        } catch (error) {
            console.error('Error loading rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAvailableBeds = (
        allRooms: any[],
        gender: string,
        preferredRoomType?: string
    ) => {
        const available: any[] = [];

        allRooms.forEach(room => {
            if (room.gender !== gender) return;
            if (preferredRoomType && room.roomType !== preferredRoomType) return;
            if (room.id === currentRoomId) return;

            const roomBeds = room.beds || [];
            const occupiedCount = roomBeds.filter((b: any) => b.isOccupied).length;
            const capacity = room.capacity || (room.roomType === 'Single' ? 1 : room.roomType === 'Double' ? 2 : 4);

            if (occupiedCount >= capacity) return;

            roomBeds.forEach((bed: any) => {
                if (!bed.isOccupied && bed.status === 'Available') {
                    available.push({
                        bedId: bed.id,
                        bedNumber: bed.label, 
                        roomId: room.id,
                        roomNumber: room.label, 
                        floor: room.floorId, 
                        roomType: room.roomType, 
                        occupancy: `${occupiedCount}/${capacity}`
                    });
                }
            });
        });

        return available;
    };

    // Group available beds into structured rooms
    const availableRooms = useMemo(() => {
        return availableBeds.reduce((acc: any[], bed) => {
            let room = acc.find(r => r.roomId === bed.roomId);
            if (!room) {
                room = {
                    roomId: bed.roomId,
                    roomNumber: bed.roomNumber,
                    floor: bed.floor,
                    roomType: bed.roomType,
                    occupancy: bed.occupancy,
                    beds: []
                };
                acc.push(room);
            }
            room.beds.push(bed);
            return acc;
        }, []);
    }, [availableBeds]);

    // Group rooms by floor for better hierarchy
    const roomsByFloor = useMemo(() => {
        return availableRooms.reduce((acc: Record<string, any[]>, room) => {
            if (!acc[room.floor]) acc[room.floor] = [];
            acc[room.floor].push(room);
            return acc;
        }, {});
    }, [availableRooms]);

    const selectedRoomData = useMemo(() => {
        return availableRooms.find(r => r.roomId === selectedRoomId);
    }, [selectedRoomId, availableRooms]);

    const handleAssign = () => {
        if (!selectedRoomId || !selectedBedId) {
            alert('Please select both a room and a bed.');
            return;
        }

        const selectedBed = availableBeds.find(b => b.bedId === selectedBedId);
        if (selectedBed) {
            onAssign(selectedBed.roomId, selectedBed.bedId, adminNotes);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-950 w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-[#F26C22] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Assign Room & Bed</h2>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
                                {preferredRoomType ? `Matching Request: ${preferredRoomType}` : 'Select Available Placement'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {preferredBedId && (
                            <div className="hidden lg:flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 px-5 py-2.5 rounded-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="h-8 w-8 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                                    <BedIcon className="h-4 w-4" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Preferred Bed</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{preferredBedId}</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <X className="h-7 w-7" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50/30 dark:bg-slate-900/20">
                            <div className="h-16 w-16 border-4 border-slate-200 dark:border-slate-800 border-t-[#F26C22] rounded-full animate-spin mb-6"></div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-sm">Searching Available Inventory...</p>
                        </div>
                    ) : availableBeds.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-50/30 dark:bg-slate-900/20">
                            <div className="h-24 w-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-rose-50/50 dark:ring-rose-900/10">
                                <AlertCircle className="h-12 w-12 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                                No Inventory Available
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md text-lg">
                                We couldn't find any rooms matching the student's gender ({studentGender})
                                {preferredRoomType && ` and requested room type (${preferredRoomType})`}.
                            </p>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 max-w-md">
                                <p className="text-sm text-amber-700 dark:text-amber-400 font-bold">
                                    💡 Tip: You can close this modal and approve their request to the "Waitlist" instead.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Left Column: Room Selection */}
                            <div className="w-full md:w-1/2 lg:w-5/12 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/20">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
                                        <CheckCircle className="h-5 w-5" />
                                        <h3 className="font-bold text-lg">Step 1: Select a Room</h3>
                                    </div>
                                    <p className="text-sm text-slate-500">Found {availableRooms.length} suitable room(s) across the campus.</p>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    {Object.entries(roomsByFloor).map(([floor, roomsOnFloor]) => (
                                        <div key={floor}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">
                                                    Level {floor}
                                                </h4>
                                                <div className="h-px w-full bg-slate-200 dark:bg-slate-800"></div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {roomsOnFloor.map((room) => (
                                                    <button
                                                        key={room.roomId}
                                                        onClick={() => {
                                                            setSelectedRoomId(room.roomId);
                                                            setSelectedBedId(''); // Reset bed selection when room changes
                                                        }}
                                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all group relative overflow-hidden ${
                                                            selectedRoomId === room.roomId
                                                                ? 'border-[#F26C22] bg-orange-50/50 dark:bg-orange-900/20 shadow-md scale-[1.02]'
                                                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-200 dark:hover:border-orange-800/50 hover:shadow-sm'
                                                        }`}
                                                    >
                                                        {selectedRoomId === room.roomId && (
                                                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#F26C22]/20 to-transparent rounded-bl-3xl"></div>
                                                        )}
                                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                                            <div>
                                                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-2 ${
                                                                    selectedRoomId === room.roomId 
                                                                        ? 'bg-[#F26C22] text-white' 
                                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                                }`}>
                                                                    {room.roomType}
                                                                </span>
                                                                <h5 className={`text-xl font-black ${selectedRoomId === room.roomId ? 'text-[#F26C22] dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>
                                                                    {room.roomNumber}
                                                                </h5>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                                    <Users className="h-3.5 w-3.5" />
                                                                    <span>{room.occupancy}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {room.beds.length} available bed{room.beds.length !== 1 ? 's' : ''} inside
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Bed Selection & Details */}
                            <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col bg-white dark:bg-slate-950">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
                                        <CheckCircle className={`h-5 w-5 ${selectedRoomId ? 'opacity-100' : 'opacity-40 grayscale'}`} />
                                        <h3 className={`font-bold text-lg ${selectedRoomId ? '' : 'text-slate-400'}`}>Step 2: Assign a Bed</h3>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {selectedRoomId ? `Viewing available placements in ${selectedRoomData?.roomNumber}.` : 'Select a room from the left to view beds.'}
                                    </p>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-900/10">
                                    {!selectedRoomId ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                            <Building2 className="h-20 w-20 text-slate-300 dark:text-slate-700 mb-4" />
                                            <p className="text-lg font-bold text-slate-500">Awaiting Room Selection</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                                            
                                            {/* Bed Grid */}
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <BedIcon className="h-5 w-5 text-[#F26C22]" /> 
                                                    Available Beds in {selectedRoomData?.roomNumber}
                                                </h4>
                                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                                                    {selectedRoomData?.beds.map((bed: any) => (
                                                        <button
                                                            key={bed.bedId}
                                                            onClick={() => setSelectedBedId(bed.bedId)}
                                                            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                                                                selectedBedId === bed.bedId
                                                                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-md scale-105'
                                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/50'
                                                            }`}
                                                        >
                                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${selectedBedId === bed.bedId ? 'bg-emerald-100 dark:bg-emerald-800/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                                                <BedIcon className={`h-6 w-6 ${selectedBedId === bed.bedId ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                                                            </div>
                                                            <div className="text-center">
                                                                <span className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Bed</span>
                                                                <span className="block text-2xl font-black">{bed.bedNumber}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Admin Notes */}
                                            <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                                                <label className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
                                                    <FileText className="h-4 w-4 text-[#F26C22]" />
                                                    Admin Notes
                                                    <span className="text-slate-400 font-bold lowercase tracking-normal">(optional)</span>
                                                </label>
                                                <textarea
                                                    value={adminNotes}
                                                    onChange={(e) => setAdminNotes(e.target.value)}
                                                    placeholder="Add internal notes regarding this assignment decision..."
                                                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 focus:border-[#F26C22] transition-all outline-none resize-none"
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                {availableBeds.length > 0 && !loading && (
                    <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="text-sm font-bold text-slate-500">
                            {selectedRoomId && selectedBedId ? (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" /> Ready to assign {selectedRoomData?.roomNumber} - Bed {selectedRoomData?.beds.find((b:any) => b.bedId === selectedBedId)?.bedNumber}
                                </span>
                            ) : (
                                <span>Please complete selections to proceed.</span>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedRoomId || !selectedBedId}
                                className="px-10 py-3.5 bg-[#F26C22] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

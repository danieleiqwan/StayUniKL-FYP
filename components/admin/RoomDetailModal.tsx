'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    X, User, Calendar, Bed, Building, 
    Users, Wrench, AlertCircle, Plus, 
    ShieldCheck, Clock, MapPin, ExternalLink,
    Trash2, Loader2
} from 'lucide-react';

import AssignStudentToBedModal from './AssignStudentToBedModal';

interface BedData {
    id: string;
    label: string;
    status: string;
    isOccupied: boolean;
    occupantName: string | null;
    occupantId: string | null;
    occupantStudentId: string | null;
    occupantProfileImage: string | null;
    occupantCheckInDate: string | null;
}

interface RoomData {
    id: string;
    floorId: number;
    label: string;
    gender: 'Male' | 'Female';
    roomType: string;
    capacity: number;
    status: string;
    beds: BedData[];
}

interface RoomDetailModalProps {
    room: RoomData | null;
    onClose: () => void;
}

function AssetItem({ label, count, status }: { label: string, count: number, status: 'Good' | 'Damaged' }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
                <span className="text-[10px] font-black text-slate-400">({count})</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${status === 'Good' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${status === 'Good' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {status === 'Good' ? 'Good' : 'Needs Repair'}
                </span>
            </div>
        </div>
    );
}

export default function RoomDetailModal({ room, onClose, onUpdate }: RoomDetailModalProps & { onUpdate?: () => void }) {
    const router = useRouter();
    const [isMaintenance, setIsMaintenance] = useState(room?.status === 'Maintenance');
    const [assigningBed, setAssigningBed] = useState<{ id: string, label: string } | null>(null);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [roomAssets, setRoomAssets] = useState<any[]>([]);

    // Deletion states
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    const handleDeleteRoom = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
        }

        setDeleting(true);
        setDeleteMsg(null);
        try {
            const res = await fetch('/api/rooms', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: room?.id })
            });
            const data = await res.json();
            if (data.success) {
                setDeleteMsg({ type: 'success', text: data.message });
                onUpdate?.();
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setDeleteMsg({ type: 'error', text: data.error || 'Failed to delete room.' });
                setConfirmDelete(false);
            }
        } catch {
            setDeleteMsg({ type: 'error', text: 'Network error. Please try again.' });
            setConfirmDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    React.useEffect(() => {
        if (room?.id) {
            const residentIds = room.beds
                .filter(b => b.isOccupied && b.occupantId)
                .map(b => b.occupantId)
                .join(',');

            fetch(`/api/complaints?roomId=${room.id}&roomLabel=${room.label}&residentIds=${residentIds}&status=Pending,In Progress`)
                .then(res => res.json())
                .then(data => {
                    if (data.complaints) {
                        setComplaints(data.complaints);
                    }
                })
                .catch(err => console.error('Error fetching room complaints:', err));

            fetch(`/api/assets?roomId=${room.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.assets) {
                        setRoomAssets(data.assets);
                    }
                })
                .catch(err => console.error('Error fetching room assets:', err));
        }
    }, [room?.id, room?.label, room?.beds]);

    if (!room) return null;

    const occupiedCount = room.beds.filter(b => b.isOccupied).length;
    const occupancyLabel = occupiedCount === 0 ? 'Empty' : 
                         occupiedCount === room.capacity ? 'Full' : 'Partial';

    const assetCounts = roomAssets.reduce((acc: Record<string, { count: number, damagedCount: number, type: string }>, asset: any) => {
        const name = asset.name;
        const type = asset.type;
        const isDamaged = asset.status !== 'Good';
        if (!acc[name]) {
            acc[name] = { count: 0, damagedCount: 0, type };
        }
        acc[name].count += 1;
        if (isDamaged) {
            acc[name].damagedCount += 1;
        }
        return acc;
    }, {});

    const furnitureAssets = Object.entries(assetCounts).filter(([_, info]) => info.type === 'Furniture');
    const nonFurnitureAssets = Object.entries(assetCounts).filter(([_, info]) => info.type !== 'Furniture');
    
    const statusColors = {
        'Available': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        'Full': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        'Partial': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
        'Maintenance': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-14 w-14 bg-[#F26C22]/10 rounded-2xl flex items-center justify-center text-[#F26C22]">
                            <Building className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{room.label} Details</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[occupancyLabel as keyof typeof statusColors]}`}>
                                    {occupancyLabel} — {occupiedCount}/{room.capacity} Beds Occupied
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Type</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <Bed className="h-3 w-3 text-[#F26C22]" /> {room.roomType}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <Users className="h-3 w-3 text-blue-500" /> {room.gender} Wing
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Floor</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-indigo-500" /> Level {room.floorId}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body - Residents List */}
                <div className="p-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        Current Residents <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    </h3>

                    <div className="space-y-4">
                        {room.beds.map((bed) => (
                            <div 
                                key={bed.id}
                                className={`p-4 rounded-3xl border transition-all ${
                                    bed.isOccupied 
                                    ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm' 
                                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                                            bed.isOccupied 
                                            ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/20' 
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                        }`}>
                                            {bed.label.slice(-1)}
                                        </div>
                                        
                                        {bed.isOccupied ? (
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
                                                    <img 
                                                        src={bed.occupantProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${bed.occupantName}`} 
                                                        alt="Avatar" 
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{bed.occupantName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bed.occupantStudentId}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm font-black text-slate-400 dark:text-slate-500 italic">Vacant</p>
                                                <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Available for assignment</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {bed.isOccupied ? (
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in Date</p>
                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-end gap-1.5">
                                                    <Calendar className="h-3 w-3 text-[#F26C22]" /> {bed.occupantCheckInDate ? new Date(bed.occupantCheckInDate).toLocaleDateString() : 'Pending'}
                                                </p>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setAssigningBed({ id: bed.id, label: bed.label })}
                                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-[#F26C22] uppercase tracking-widest hover:bg-[#F26C22] hover:text-white transition-all shadow-sm"
                                            >
                                                <Plus className="h-3 w-3" /> Assign Student
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body 2 - Assets & Condition */}
                <div className="px-8 pb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            Room Assets & Condition <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        </h3>
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Last checked: {complaints.length > 0 ? new Date(Math.max(...complaints.map(c => new Date(c.created_at).getTime()))).toLocaleDateString() : '28 April 2026'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Furniture Group */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Furniture</p>
                            {furnitureAssets.length > 0 ? (
                                furnitureAssets.map(([name, info]) => (
                                    <AssetItem 
                                        key={name}
                                        label={name} 
                                        count={info.count} 
                                        status={info.damagedCount > 0 ? 'Damaged' : 'Good'} 
                                    />
                                ))
                            ) : (
                                <p className="text-[10px] text-slate-400 italic">No furniture registered</p>
                            )}
                        </div>
                        {/* Electronics & Appliances Group */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Electronics & Appliances</p>
                            {nonFurnitureAssets.length > 0 ? (
                                nonFurnitureAssets.map(([name, info]) => (
                                    <AssetItem 
                                        key={name}
                                        label={name} 
                                        count={info.count} 
                                        status={info.damagedCount > 0 ? 'Damaged' : 'Good'} 
                                    />
                                ))
                            ) : (
                                <p className="text-[10px] text-slate-400 italic">No electronics or appliances registered</p>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={() => router.push('/admin/assets?loc=' + room.id)}
                        className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#F26C22] hover:text-[#d65a16] uppercase tracking-widest transition-colors group"
                    >
                        <ShieldCheck className="h-4 w-4" /> View Full Asset History 
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                    </button>
                </div>

                {/* Footer - Maintenance Control & Deletion */}
                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                    {deleteMsg && (
                        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 ${
                            deleteMsg.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
                        }`}>
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>{deleteMsg.text}</p>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isMaintenance ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                <Wrench className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none mb-1">Facility Maintenance</p>
                                <p className="text-[10px] font-bold text-slate-400">{isMaintenance ? 'Currently marked for inspection' : 'Room is in operational state'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDeleteRoom}
                                disabled={deleting}
                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 ${
                                    confirmDelete
                                        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-md shadow-rose-500/20'
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                                }`}
                                title="Delete this room permanently"
                            >
                                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                {confirmDelete ? 'Confirm Delete?' : 'Delete Room'}
                            </button>

                            <button 
                                onClick={async () => {
                                    const newStatus = isMaintenance ? 'Active' : 'Maintenance';
                                    try {
                                        const res = await fetch('/api/rooms', {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ roomId: room.id, status: newStatus })
                                        });
                                        if (res.ok) {
                                            setIsMaintenance(!isMaintenance);
                                            onUpdate?.(); // Refreshes the grid behind it
                                        } else {
                                            const errData = await res.json();
                                            alert(`Failed to update room status: ${errData.error || res.statusText}`);
                                        }
                                    } catch (err: any) {
                                        alert(`Error updating room status: ${err.message}`);
                                    }
                                }}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isMaintenance 
                                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                                    : 'bg-white border border-orange-200 text-[#F26C22] hover:bg-orange-50 shadow-sm'
                                }`}
                            >
                                {isMaintenance ? 'Mark as Operational' : 'Mark for Maintenance'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Assign Student Modal */}
            {assigningBed && room && (
                <AssignStudentToBedModal
                    roomId={room.id}
                    roomLabel={room.label}
                    roomType={room.roomType}
                    roomGender={room.gender}
                    floorId={room.floorId}
                    bedId={assigningBed.id}
                    bedLabel={assigningBed.label}
                    onClose={() => setAssigningBed(null)}
                    onSuccess={() => {
                        setAssigningBed(null);
                        onUpdate?.();
                        onClose();
                    }}
                />
            )}
        </div>
    );
}

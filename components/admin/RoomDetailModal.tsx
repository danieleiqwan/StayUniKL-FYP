'use client';

import React, { useState } from 'react';
import { 
    X, User, Calendar, Bed, Building, 
    Users, Wrench, AlertCircle, Plus, 
    ShieldCheck, Clock, MapPin, ExternalLink
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
    const [isMaintenance, setIsMaintenance] = useState(room?.status === 'Maintenance');
    const [assigningBed, setAssigningBed] = useState<{ id: string, label: string } | null>(null);
    const [complaints, setComplaints] = useState<any[]>([]);

    React.useEffect(() => {
        if (room?.id) {
            const residentIds = room.beds
                .filter(b => b.isOccupied && b.occupantId)
                .map(b => b.occupantId)
                .join(',');

            fetch(`/api/complaints?roomId=${room.id}&roomLabel=${room.label}&residentIds=${residentIds}&status=Pending,In Progress`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setComplaints(data.complaints);
                    }
                })
                .catch(err => console.error('Error fetching room complaints:', err));
        }
    }, [room?.id, room?.label, room?.beds]);

    if (!room) return null;

    const occupiedCount = room.beds.filter(b => b.isOccupied).length;
    const occupancyLabel = occupiedCount === 0 ? 'Empty' : 
                         occupiedCount === room.capacity ? 'Full' : 'Partial';
    
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
                            <AssetItem 
                                label="Bed Frames" 
                                count={room.capacity} 
                                status={complaints.some(c => 
                                    c.status !== 'Resolved' && (c.title?.toLowerCase().includes('bed') || c.asset?.toLowerCase().includes('bed'))
                                ) ? 'Damaged' : 'Good'} 
                            />
                            <AssetItem 
                                label="Study Tables" 
                                count={room.capacity} 
                                status={complaints.some(c => 
                                    c.status !== 'Resolved' && (c.title?.toLowerCase().includes('table') || c.asset?.toLowerCase().includes('table'))
                                ) ? 'Damaged' : 'Good'} 
                            />
                            <AssetItem 
                                label="Wardrobes" 
                                count={room.capacity} 
                                status={complaints.some(c => 
                                    c.status !== 'Resolved' && (c.title?.toLowerCase().includes('wardrobe') || c.asset?.toLowerCase().includes('wardrobe'))
                                ) ? 'Damaged' : 'Good'} 
                            />
                        </div>
                        {/* Electronics Group */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Electronics</p>
                            <AssetItem 
                                label="Ceiling Fan" 
                                count={1} 
                                status={complaints.some(c => 
                                    c.status !== 'Resolved' && (c.title?.toLowerCase().includes('fan') || c.asset?.toLowerCase().includes('fan'))
                                ) ? 'Damaged' : 'Good'} 
                            />
                            <AssetItem 
                                label="LED Lights" 
                                count={2} 
                                status={complaints.some(c => 
                                    c.status !== 'Resolved' && (c.title?.toLowerCase().includes('light') || c.asset?.toLowerCase().includes('light'))
                                ) ? 'Damaged' : 'Good'} 
                            />
                            <AssetItem 
                                label="AC Unit" 
                                count={room.roomType.includes('Single') ? 1 : 0} 
                                status={complaints.some(c => 
                                    c.status !== 'Resolved' && (c.title?.toLowerCase().includes('ac') || c.asset?.toLowerCase().includes('ac'))
                                ) ? 'Damaged' : 'Good'} 
                            />
                        </div>
                    </div>

                    <button className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#F26C22] hover:text-[#d65a16] uppercase tracking-widest transition-colors group">
                        <ShieldCheck className="h-4 w-4" /> View Full Asset History 
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                    </button>
                </div>

                {/* Footer - Maintenance Control */}
                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isMaintenance ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                            <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none mb-1">Facility Maintenance</p>
                            <p className="text-[10px] font-bold text-slate-400">{isMaintenance ? 'Currently marked for inspection' : 'Room is in operational state'}</p>
                        </div>
                    </div>

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

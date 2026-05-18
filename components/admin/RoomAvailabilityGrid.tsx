'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BedDouble, Users, Wrench, Pencil, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import RoomDetailModal from './RoomDetailModal';

interface Bed {
    id: string;
    label: string;
    status: string;
    isOccupied: boolean;
    occupantName: string | null;
    occupantId: string | null;
}

interface Room {
    id: string;
    floorId: number;
    label: string;
    gender: 'Male' | 'Female';
    roomType: string;
    capacity: number;
    status: string;
    beds: Bed[];
}

interface RoomAvailabilityGridProps {
    rooms: Room[];
    selectedFloor: number | 'All';
    onRefresh?: () => void;
}

type Gender = 'Male' | 'Female' | 'Co-Ed';

// Derive card colour based on occupancy
function getRoomColor(room: Room) {
    if (room.status === 'Maintenance') {
        return {
            card: 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40',
            badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
            bar: 'bg-slate-400',
            dot: 'bg-slate-400',
            label: 'Maintenance',
        };
    }
    const occupiedBeds = room.beds.filter(b => b.isOccupied).length;
    const total = room.capacity;
    if (occupiedBeds === 0) {
        return {
            card: 'border-green-300 dark:border-green-700/60 bg-green-50/40 dark:bg-green-900/10',
            badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
            bar: 'bg-green-500',
            dot: 'bg-green-500',
            label: 'Available',
        };
    }
    if (occupiedBeds === total) {
        return {
            card: 'border-red-300 dark:border-red-700/60 bg-red-50/40 dark:bg-red-900/10',
            badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
            bar: 'bg-red-500',
            dot: 'bg-red-500',
            label: 'Full',
        };
    }
    return {
        card: 'border-yellow-300 dark:border-yellow-600/60 bg-yellow-50/40 dark:bg-yellow-900/10',
        badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
        bar: 'bg-yellow-500',
        dot: 'bg-yellow-400',
        label: 'Partial',
    };
}

function RoomCard({ room, onClick }: { room: Room, onClick: () => void }) {
    const color = getRoomColor(room);
    const occupiedBeds = room.beds.filter(b => b.isOccupied).length;
    const pct = room.capacity > 0 ? (occupiedBeds / room.capacity) * 100 : 0;

    return (
        <div 
            onClick={onClick}
            className={`group rounded-2xl border-2 ${color.card} p-4 flex flex-col gap-3 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-[#F26C22]/50 cursor-pointer duration-300 relative overflow-hidden`}
        >
            {/* Hover overlay highlight */}
            <div className="absolute inset-0 bg-[#F26C22]/0 group-hover:bg-[#F26C22]/5 transition-colors duration-300" />
            
            {/* Room header */}
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="font-black text-slate-900 dark:text-white text-sm group-hover:text-[#F26C22] transition-colors">{room.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                        {room.roomType} · {room.gender}
                    </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${color.badge}`}>
                    {color.label}
                </span>
            </div>

            {/* Occupancy bar */}
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500 font-medium">Occupancy</span>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{occupiedBeds}/{room.capacity}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* Bed dots */}
            <div className="flex gap-1.5 flex-wrap relative z-10">
                {room.beds.map(bed => (
                    <div
                        key={bed.id}
                        title={bed.isOccupied ? `Bed ${bed.label} — ${bed.occupantName ?? 'Occupied'}` : `Bed ${bed.label} — Available`}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all cursor-default select-none ${bed.isOccupied
                            ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300'
                            : bed.status === 'Maintenance'
                                ? 'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-700 dark:border-slate-600'
                                : 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
                            }`}
                    >
                        {bed.label.slice(-1)}
                    </div>
                ))}
            </div>
        </div>
    );
}

function FloorAccordion({ floor, rooms, defaultOpen, onRoomClick, onRefresh }: { floor: number; rooms: Room[]; defaultOpen: boolean; onRoomClick: (room: Room) => void; onRefresh?: () => void }) {
    const [open, setOpen] = useState(defaultOpen);
    const [editingGender, setEditingGender] = useState(false);
    const [selectedGender, setSelectedGender] = useState<Gender>(rooms[0]?.gender as Gender || 'Male');
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'warn' | 'error'; text: string } | null>(null);

    const totalBeds = rooms.reduce((a, r) => a + r.capacity, 0);
    const occupiedBeds = rooms.reduce((a, r) => a + r.beds.filter(b => b.isOccupied).length, 0);
    const availableRooms = rooms.filter(r => r.beds.some(b => !b.isOccupied && b.status !== 'Maintenance')).length;

    const handleSaveGender = async () => {
        setSaving(true);
        setSaveMsg(null);
        try {
            const res = await fetch('/api/rooms', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ floorId: floor, gender: selectedGender })
            });
            const data = await res.json();
            if (data.success) {
                setSaveMsg({ type: data.occupiedWarning ? 'warn' : 'success', text: data.occupiedWarning || data.message });
                onRefresh?.();
                setTimeout(() => { setEditingGender(false); setSaveMsg(null); }, 2500);
            } else {
                setSaveMsg({ type: 'error', text: data.error || 'Failed to update.' });
            }
        } catch {
            setSaveMsg({ type: 'error', text: 'Network error.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            {/* Accordion header */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F26C22]/10 flex items-center justify-center shrink-0">
                        <span className="text-[#F26C22] font-black text-sm">{floor}</span>
                    </div>
                    <div className="text-left">
                        <p className="font-black text-slate-900 dark:text-white">Floor {floor}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            {!editingGender ? (
                                <>
                                    <p className="text-xs text-slate-500">{rooms[0]?.gender} Wing · {rooms.length} rooms</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedGender(rooms[0]?.gender as Gender || 'Male'); setEditingGender(true); setSaveMsg(null); }}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-[#F26C22] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-[9px] font-black uppercase tracking-wider"
                                        title="Edit floor gender designation"
                                    >
                                        <Pencil className="h-2.5 w-2.5" /> Edit
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                    {(['Male', 'Female', 'Co-Ed'] as Gender[]).map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setSelectedGender(g)}
                                            className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                                selectedGender === g
                                                    ? 'bg-[#F26C22] text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                                            }`}
                                        >{g}</button>
                                    ))}
                                    <button
                                        onClick={handleSaveGender}
                                        disabled={saving}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-all disabled:opacity-60"
                                    >
                                        {saving ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Check className="h-2.5 w-2.5" />}
                                        {saving ? '' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setEditingGender(false); setSaveMsg(null); }}
                                        className="p-0.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {saveMsg && (
                            <p className={`text-[9px] font-bold mt-1 flex items-center gap-1 ${
                                saveMsg.type === 'success' ? 'text-emerald-600' :
                                saveMsg.type === 'warn' ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                                {saveMsg.type === 'warn' && <AlertTriangle className="h-2.5 w-2.5 shrink-0" />}
                                {saveMsg.text}
                            </p>
                        )}
                    </div>
                    {/* Summary pills */}
                    <div className="hidden sm:flex items-center gap-2 ml-4">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            {availableRooms} rooms available
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                            <BedDouble className="h-3 w-3" />
                            {occupiedBeds}/{totalBeds} beds
                        </span>
                    </div>
                </div>
                <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </button>

            {/* Accordion body */}
            {open && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                        {rooms.map(room => (
                            <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RoomAvailabilityGrid({ rooms, selectedFloor, onRefresh }: RoomAvailabilityGridProps) {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const filteredRooms = selectedFloor === 'All' ? rooms : rooms.filter(r => r.floorId === selectedFloor);
    const floors = Array.from(new Set(filteredRooms.map(r => r.floorId))).sort((a, b) => a - b);

    if (filteredRooms.length === 0) {
        return (
            <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <BedDouble className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No rooms found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {floors.map((floor, idx) => (
                <FloorAccordion
                    key={floor}
                    floor={floor}
                    rooms={filteredRooms.filter(r => r.floorId === floor)}
                    defaultOpen={idx === 0}
                    onRoomClick={(room) => setSelectedRoom(room)}
                    onRefresh={onRefresh}
                />
            ))}

            {/* Room Detail Modal */}
            <RoomDetailModal 
                room={selectedRoom as any} 
                onClose={() => setSelectedRoom(null)} 
                onUpdate={onRefresh}
            />
        </div>
    );
}

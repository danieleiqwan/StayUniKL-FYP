'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import RoomAvailabilityGrid from '@/components/admin/RoomAvailabilityGrid';
import { BedDouble, Home, Users, Wrench, RefreshCw, Plus, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface AddRoomForm {
    roomId: string;
    floorId: string;
    gender: 'Male' | 'Female' | 'Co-Ed';
    capacity: '1' | '2' | '3' | '4';
    roomType: 'Single' | 'Double' | 'Triple' | 'Quad';
    status: 'Available' | 'Maintenance';
}

export default function AdminRoomsPage() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFloor, setSelectedFloor] = useState<number | 'All'>('All');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Add Room Modal state
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [addMsg, setAddMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [form, setForm] = useState<AddRoomForm>({
        roomId: '', floorId: '', gender: 'Male', capacity: '2', roomType: 'Double', status: 'Available'
    });

    const fetchData = async () => {
        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();
            if (data.rooms) {
                setRooms(data.rooms);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return;
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Auto-sync capacity and roomType
    const handleCapacityChange = (cap: string) => {
        const typeMap: Record<string, AddRoomForm['roomType']> = {
            '1': 'Single', '2': 'Double', '3': 'Triple', '4': 'Quad'
        };
        setForm(f => ({ ...f, capacity: cap as AddRoomForm['capacity'], roomType: typeMap[cap] }));
    };

    const handleAddRoom = async () => {
        setAddMsg(null);
        if (!form.roomId.trim() || !form.floorId.trim()) {
            setAddMsg({ type: 'error', text: 'Room ID and Floor are required.' });
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: form.roomId.trim(),
                    floorId: parseInt(form.floorId),
                    gender: form.gender,
                    capacity: parseInt(form.capacity),
                    roomType: form.roomType,
                    status: form.status
                })
            });
            const data = await res.json();
            if (data.success) {
                setAddMsg({ type: 'success', text: data.message });
                await fetchData();
                setTimeout(() => {
                    setShowAddRoom(false);
                    setAddMsg(null);
                    setForm({ roomId: '', floorId: '', gender: 'Male', capacity: '2', roomType: 'Double', status: 'Available' });
                }, 1800);
            } else {
                setAddMsg({ type: 'error', text: data.error || 'Failed to create room.' });
            }
        } catch (err) {
            setAddMsg({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    const floors = Array.from(new Set(rooms.map(r => r.floorId))).sort((a, b) => a - b);

    const totalBeds = rooms.reduce((a, r) => a + r.beds.length, 0);
    const occupiedBeds = rooms.reduce((a, r) => a + r.beds.filter((b: any) => b.isOccupied).length, 0);
    const availableBeds = totalBeds - occupiedBeds;
    const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
    const fullRooms = rooms.filter(r => r.beds.every((b: any) => b.isOccupied)).length;

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return <div className="p-10 text-center">Access Denied. Admins only.</div>;

    return (
        <div className="max-w-[1400px] mx-auto px-10 py-12 space-y-10">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Room Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Real-time occupancy tracking and room provisioning.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                        <button
                            onClick={() => { setLoading(true); fetchData(); }}
                            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <RefreshCw className="h-4 w-4" /> Refresh
                        </button>
                        <p className="text-[10px] text-slate-400 italic">Updated: {lastUpdated.toLocaleTimeString()}</p>
                    </div>
                    <button
                        onClick={() => { setShowAddRoom(true); setAddMsg(null); }}
                        className="flex items-center gap-2 bg-[#F26C22] hover:bg-[#d65a16] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                    >
                        <Plus className="h-4 w-4" /> Add Room
                    </button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon={<Home className="h-5 w-5 text-indigo-500" />} label="Total Rooms" value={rooms.length} sub={`${floors.length} floors`} color="indigo" />
                <StatCard icon={<BedDouble className="h-5 w-5 text-slate-500" />} label="Total Beds" value={totalBeds} sub={`${availableBeds} available`} color="slate" />
                <StatCard icon={<Users className="h-5 w-5 text-red-500" />} label="Occupied Beds" value={occupiedBeds} sub={`${Math.round(totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0)}% occupancy`} color="red" />
                <StatCard icon={<Wrench className="h-5 w-5 text-orange-500" />} label="Full Rooms" value={fullRooms} sub={`${maintenanceRooms} in maintenance`} color="orange" />
            </div>

            {/* ── Controls Row: Floor Filter + Legend ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Filter:</span>
                    <button
                        onClick={() => setSelectedFloor('All')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedFloor === 'All'
                            ? 'bg-[#F26C22] text-white shadow-md shadow-orange-500/20'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-300'
                            }`}
                    >
                        All Floors
                    </button>
                    {floors.map(floor => (
                        <button
                            key={floor}
                            onClick={() => setSelectedFloor(floor)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedFloor === floor
                                ? 'bg-[#F26C22] text-white shadow-md shadow-orange-500/20'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-300'
                                }`}
                        >
                            Floor {floor}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-sm flex-wrap">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legend:</span>
                    <LegendDot color="bg-green-500" label="Available" />
                    <LegendDot color="bg-yellow-400" label="Partial" />
                    <LegendDot color="bg-red-500" label="Full" />
                    <LegendDot color="bg-slate-400" label="Maintenance" />
                </div>
            </div>

            {/* ── Room Accordion Grid ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="h-10 w-10 border-4 border-[#F26C22] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest animate-pulse">Synchronizing Room Data...</p>
                </div>
            ) : (
                <RoomAvailabilityGrid rooms={rooms} selectedFloor={selectedFloor} onRefresh={fetchData} />
            )}

            {/* ── Add Room Modal ── */}
            {showAddRoom && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                                    <Plus className="h-5 w-5 text-[#F26C22]" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white">Add New Room</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Beds auto-generated from capacity</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddRoom(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {addMsg && (
                                <div className={`flex items-start gap-3 p-4 rounded-2xl text-sm font-bold animate-in fade-in duration-200 ${addMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400'}`}>
                                    {addMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
                                    <p>{addMsg.text}</p>
                                </div>
                            )}

                            {/* Room ID */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Room Number / ID *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 801 or G-02"
                                    value={form.roomId}
                                    onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#F26C22] transition-all"
                                />
                            </div>

                            {/* Floor */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Floor Level *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    placeholder="e.g. 8"
                                    value={form.floorId}
                                    onChange={e => setForm(f => ({ ...f, floorId: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#F26C22] transition-all"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gender Designation *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['Male', 'Female', 'Co-Ed'] as const).map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setForm(f => ({ ...f, gender: g }))}
                                            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${form.gender === g ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >{g}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Capacity */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bed Capacity *</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { val: '1', top: '1 Bed', bot: 'Single' },
                                        { val: '2', top: '2 Beds', bot: 'Double' },
                                        { val: '3', top: '3 Beds', bot: 'Triple' },
                                        { val: '4', top: '4 Beds', bot: 'Quad' }
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            onClick={() => handleCapacityChange(opt.val)}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-0.5 ${form.capacity === opt.val ? 'bg-[#F26C22] text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            <span>{opt.top}</span>
                                            <span className="opacity-70">{opt.bot}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initial Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['Available', 'Maintenance'] as const).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setForm(f => ({ ...f, status: s }))}
                                            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${form.status === s ? (s === 'Available' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >{s}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                    Room <span className="text-[#F26C22]">{form.roomId || '???'}</span> · Floor <span className="text-[#F26C22]">{form.floorId || '?'}</span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {form.roomType} · {form.gender} · {form.capacity} bed(s) →{' '}
                                    {['A', 'B', 'C', 'D'].slice(0, parseInt(form.capacity || '1')).map(l => `${form.roomId || '??'}-${l}`).join(', ')}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={() => setShowAddRoom(false)}
                                className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-sm font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >Cancel</button>
                            <button
                                onClick={handleAddRoom}
                                disabled={submitting || !form.roomId.trim() || !form.floorId.trim()}
                                className="flex-1 py-3.5 rounded-2xl bg-[#F26C22] text-white text-sm font-black uppercase tracking-widest hover:bg-[#d65a16] transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                                    : <><Plus className="h-4 w-4" /> Create Room</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, sub, color }: {
    icon: React.ReactNode; label: string; value: number; sub: string;
    color: 'indigo' | 'slate' | 'red' | 'orange';
}) {
    const bg: Record<string, string> = {
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
        slate: 'bg-slate-50 dark:bg-slate-800/50',
        red: 'bg-red-50 dark:bg-red-900/20',
        orange: 'bg-orange-50 dark:bg-orange-900/20',
    };
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${bg[color]}`}>{icon}</div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
            <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
        </div>
    );
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{label}</span>
        </div>
    );
}

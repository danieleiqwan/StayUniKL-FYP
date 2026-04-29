'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { useEffect, useState } from 'react';
import RoomAvailabilityGrid from '@/components/admin/RoomAvailabilityGrid';
import { BedDouble, Home, Users, Wrench, RefreshCw } from 'lucide-react';

export default function AdminRoomsPage() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFloor, setSelectedFloor] = useState<number | 'All'>('All');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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
        if (!user || user.role !== 'admin') return;
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const floors = Array.from(new Set(rooms.map(r => r.floorId))).sort((a, b) => a - b);

    // Computed stats
    const totalBeds = rooms.reduce((a, r) => a + r.beds.length, 0);
    const occupiedBeds = rooms.reduce((a, r) => a + r.beds.filter((b: any) => b.isOccupied).length, 0);
    const availableBeds = totalBeds - occupiedBeds;
    const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
    const availableRooms = rooms.filter(r => r.beds.some((b: any) => !b.isOccupied)).length;
    const fullRooms = rooms.filter(r => r.beds.every((b: any) => b.isOccupied)).length;

    if (!user || user.role !== 'admin') return <div className="p-10 text-center">Access Denied. Admins only.</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Room Availability</h1>
                        <p className="text-sm text-slate-500 mt-1">Real-time occupancy tracking across all floors.</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <button
                            onClick={() => { setLoading(true); fetchData(); }}
                            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <RefreshCw className="h-4 w-4" /> Refresh
                        </button>
                        <p className="text-[10px] text-slate-400 italic">Updated: {lastUpdated.toLocaleTimeString()}</p>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<Home className="h-5 w-5 text-indigo-500" />}
                        label="Total Rooms"
                        value={rooms.length}
                        sub={`${floors.length} floors`}
                        color="indigo"
                    />
                    <StatCard
                        icon={<BedDouble className="h-5 w-5 text-slate-500" />}
                        label="Total Beds"
                        value={totalBeds}
                        sub={`${availableBeds} available`}
                        color="slate"
                    />
                    <StatCard
                        icon={<Users className="h-5 w-5 text-red-500" />}
                        label="Occupied Beds"
                        value={occupiedBeds}
                        sub={`${Math.round(totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0)}% occupancy`}
                        color="red"
                    />
                    <StatCard
                        icon={<Wrench className="h-5 w-5 text-orange-500" />}
                        label="Full Rooms"
                        value={fullRooms}
                        sub={`${maintenanceRooms} in maintenance`}
                        color="orange"
                    />
                </div>

                {/* ── Controls Row: Floor Filter + Legend ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    {/* Floor filter pills */}
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

                    {/* Legend */}
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
                    <RoomAvailabilityGrid rooms={rooms} selectedFloor={selectedFloor} />
                )}
            </div>
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

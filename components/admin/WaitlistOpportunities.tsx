'use client';

import React, { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Zap, Home, ChevronRight, CheckCircle2 } from 'lucide-react';

interface WaitlistOpportunitiesProps {
    roomChangeRequests: any[];
    onAssign: (request: any, roomId: string, bedId: string) => void;
}

export default function WaitlistOpportunities({ roomChangeRequests, onAssign }: WaitlistOpportunitiesProps) {
    const { rooms, applications } = useData();

    const opportunities = useMemo(() => {
        const waitlisted = roomChangeRequests.filter(r => r.status === 'Approved - Waitlist')
            .sort((a, b) => (a.waitlist_position || 999) - (b.waitlist_position || 999) || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        if (waitlisted.length === 0) return [];

        const ops = [];

        for (const req of waitlisted) {
            // Find vacant bed matching preference
            // Preference could be preferred_room_id, preferred_room_type, or preferred_bed_id
            const prefType = req.preferred_room_type;
            const prefRoomId = req.preferred_room_id;

            // Find all beds
            let foundMatch = false;
            for (const room of rooms) {
                if (foundMatch) break;
                if (prefRoomId && room.id !== prefRoomId) continue;
                if (prefType && room.roomType !== prefType) continue;

                for (const bed of room.beds) {
                    // Check if bed is occupied in applications
                    const isOccupiedByApp = applications.some(a => a.bedId === bed.id && ['Checked in', 'Approved', 'Payment Pending'].includes(a.status));
                    
                    if (!bed.isOccupied && !isOccupiedByApp) {
                        ops.push({
                            request: req,
                            match: {
                                roomId: room.id,
                                bedId: bed.id,
                                roomType: room.roomType
                            }
                        });
                        foundMatch = true;
                        break;
                    }
                }
            }
        }

        return ops.slice(0, 3); // Show top 3 opportunities
    }, [roomChangeRequests, rooms, applications]);

    if (opportunities.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-[#F26C22]/10 to-orange-500/10 dark:from-orange-500/10 dark:to-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-900/50 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-[#F26C22] text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                    <Zap className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Auto-Match: Vacant Beds Found</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">The system found available beds for students currently on the waitlist.</p>
                </div>
            </div>

            <div className="space-y-3">
                {opportunities.map((op, idx) => (
                    <div key={op.request.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 flex items-center justify-between border border-orange-100 dark:border-orange-900/30 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-bold">
                                #{op.request.waitlist_position || idx + 1}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{op.request.student_name}</p>
                                <p className="text-xs text-slate-500">Waitlist for: {op.request.preferred_room_type || `Room ${op.request.preferred_room_id}`}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 mx-2" />
                            <div>
                                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" /> Match Found
                                </p>
                                <p className="text-xs text-slate-500">Room {op.match.roomId} • Bed {op.match.bedId}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onAssign(op.request, op.match.roomId, op.match.bedId)}
                            className="bg-[#F26C22] hover:bg-[#d65a16] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                            Approve & Notify
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

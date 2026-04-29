import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // 1. Fetch Rooms
        const [rooms]: any = await pool.query('SELECT * FROM rooms ORDER BY floor_id, id');

        // 2. Fetch Beds
        const [beds]: any = await pool.query('SELECT * FROM beds ORDER BY id');

        // 3. Fetch Occupied Beds (Active Applications)
        // We consider a bed occupied if there is an application that is NOT Cancelled/Rejected/Checked out/No show
        // Actually, "Checked out" frees the bed. "No show" frees the bed. "Cancelled" frees the bed.
        // So occupied = Pending? No, Pending doesn't reserve usually (unless we want strict holding).
        // Let's stick to design: Payment Pending, Approved, Checked in.
        // Also Pending if we want to show it as "Requested".
        // For inventory V1, let's look for explicitly assigned beds.
        // 3. Fetch Occupied Beds (Active Applications) with Student Names
        const [activeApps]: any = await pool.query(`
            SELECT a.bed_id, a.student_id, u.name as student_name
            FROM applications a
            JOIN users u ON a.student_id = u.id
            WHERE a.bed_id IS NOT NULL 
            AND a.status IN ('Payment Pending', 'Approved', 'Checked in')
        `);

        // Map occupancy
        const occupancyMap = new Map();
        activeApps.forEach((app: any) => {
            occupancyMap.set(app.bed_id, {
                id: app.student_id,
                name: app.student_name
            });
        });

        // Assemble Data
        const roomsWithBeds = rooms.map((room: any) => {
            const roomBeds = beds
                .filter((bed: any) => bed.room_id === room.id)
                .map((bed: any) => {
                    const student = occupancyMap.get(bed.id);
                    return {
                        id: bed.id,
                        label: bed.label,
                        status: bed.status, // Maintenance etc
                        isOccupied: !!student,
                        occupantName: student?.name || null,
                        occupantId: student?.id || null
                    };
                });

            return {
                id: room.id,
                floorId: room.floor_id, // snake_case from DB
                label: `Room ${room.id}`,
                gender: room.gender,
                roomType: room.room_type,
                capacity: room.capacity,
                status: room.status,
                beds: roomBeds
            };
        });

        return NextResponse.json({ rooms: roomsWithBeds });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

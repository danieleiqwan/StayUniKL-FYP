import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function GET() {
    try {
        // 1. Fetch Rooms
        const [rooms]: any = await pool.query('SELECT * FROM rooms ORDER BY floor_id, id');

        // 2. Fetch Beds
        const [beds]: any = await pool.query('SELECT * FROM beds ORDER BY id');

        // 3. Fetch Occupied Beds (Active Applications) with Student Details
        const [activeApps]: any = await pool.query(`
            SELECT 
                a.bed_id, 
                a.student_id, 
                u.name as student_name, 
                u.profile_image, 
                a.check_in_date,
                u.student_id as student_id_number
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
                name: app.student_name,
                studentId: app.student_id_number,
                profileImage: app.profile_image,
                checkInDate: app.check_in_date
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
                        status: bed.status,
                        isOccupied: !!student,
                        occupantName: student?.name || null,
                        occupantId: student?.id || null,
                        occupantStudentId: student?.studentId || null,
                        occupantProfileImage: student?.profileImage || null,
                        occupantCheckInDate: student?.checkInDate || null
                    };
                });

            return {
                id: room.id,
                floorId: room.floor_id,
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


export async function POST(request: Request) {
    const conn = await pool.getConnection();
    try {
        const admin = await isAdmin();
        if (!admin) {
            conn.release();
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { roomId, floorId, gender, capacity, roomType, status } = body;

        if (!roomId || !floorId || !gender || !capacity || !roomType) {
            conn.release();
            return NextResponse.json({ error: 'Missing required fields: roomId, floorId, gender, capacity, roomType' }, { status: 400 });
        }

        // Validate values
        if (!['Male', 'Female', 'Co-Ed'].includes(gender)) {
            conn.release();
            return NextResponse.json({ error: 'Invalid gender. Must be Male, Female, or Co-Ed.' }, { status: 400 });
        }
        if (!['Single', 'Double', 'Triple', 'Quad'].includes(roomType)) {
            conn.release();
            return NextResponse.json({ error: 'Invalid roomType. Must be Single, Double, Triple, or Quad.' }, { status: 400 });
        }

        // Check room doesn't already exist
        const [existing]: any = await conn.query('SELECT id FROM rooms WHERE id = ?', [String(roomId)]);
        if (existing.length > 0) {
            conn.release();
            return NextResponse.json({ error: `Room ${roomId} already exists.` }, { status: 409 });
        }

        await conn.beginTransaction();

        // 1. Insert the room
        await conn.query(
            'INSERT INTO rooms (id, floor_id, gender, capacity, room_type, status) VALUES (?, ?, ?, ?, ?, ?)',
            [String(roomId), Number(floorId), gender, Number(capacity), roomType, status || 'Available']
        );

        // 2. Auto-generate beds based on capacity
        const bedLabels = ['A', 'B', 'C', 'D'].slice(0, Number(capacity));
        for (const label of bedLabels) {
            const bedId = `${roomId}-${label}`;
            await conn.query(
                'INSERT INTO beds (id, room_id, label, status) VALUES (?, ?, ?, ?)',
                [bedId, String(roomId), label, 'Available']
            );
        }

        await conn.commit();
        conn.release();

        // Audit log
        await logAction({
            actorId: admin.id,
            actorName: admin.name,
            action: 'CREATE_ROOM',
            entityType: 'Room',
            entityId: String(roomId),
            details: { floorId, gender, capacity, roomType, bedsGenerated: bedLabels }
        });

        return NextResponse.json({
            success: true,
            message: `Room ${roomId} created with ${capacity} bed(s) on Floor ${floorId}.`,
            bedsGenerated: bedLabels.map(l => `${roomId}-${l}`)
        });

    } catch (error: any) {
        await conn.rollback();
        conn.release();
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { roomId, status } = body;

        if (!roomId || !status) {
            return NextResponse.json({ error: 'Missing roomId or status' }, { status: 400 });
        }

        await pool.query('UPDATE rooms SET status = ? WHERE id = ?', [status, roomId]);

        await logAction({
            actorId: admin.id,
            actorName: admin.name,
            action: 'UPDATE_ROOM_STATUS',
            entityType: 'Room',
            entityId: roomId,
            details: { newStatus: status }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Bulk-update the gender designation of all rooms on a floor
export async function PATCH(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { floorId, gender } = body;

        if (!floorId || !gender) {
            return NextResponse.json({ error: 'Missing floorId or gender' }, { status: 400 });
        }
        if (!['Male', 'Female', 'Co-Ed'].includes(gender)) {
            return NextResponse.json({ error: 'Invalid gender. Must be Male, Female, or Co-Ed.' }, { status: 400 });
        }

        // Check for occupied rooms on this floor — warn if any are assigned to the opposite gender
        const [occupiedRows]: any = await pool.query(`
            SELECT COUNT(*) as cnt FROM applications a
            JOIN beds b ON a.bed_id = b.id
            JOIN rooms r ON b.room_id = r.id
            WHERE r.floor_id = ? AND a.status IN ('Payment Pending', 'Approved', 'Checked in')
        `, [Number(floorId)]);
        const occupiedCount = occupiedRows[0]?.cnt || 0;

        // Bulk update all rooms on this floor
        const [result]: any = await pool.query(
            'UPDATE rooms SET gender = ? WHERE floor_id = ?',
            [gender, Number(floorId)]
        );

        await logAction({
            actorId: admin.id,
            actorName: admin.name,
            action: 'UPDATE_FLOOR_GENDER',
            entityType: 'Floor',
            entityId: String(floorId),
            details: { floorId, newGender: gender, roomsUpdated: result.affectedRows }
        });

        return NextResponse.json({
            success: true,
            message: `Floor ${floorId} updated to ${gender}. ${result.affectedRows} room(s) affected.`,
            occupiedWarning: occupiedCount > 0
                ? `Warning: ${occupiedCount} active resident(s) remain on this floor. Please review their assignments.`
                : null
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


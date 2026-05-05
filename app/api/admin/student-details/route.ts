import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }

        // 1. Fetch Profile
        const [userRows]: any = await pool.query(
            `SELECT 
                id, student_id, name, email, role, gender, phone_number, parent_phone_number, created_at,
                address, city, state, postcode, 
                emergency_contact1_name, emergency_contact1_relation, emergency_contact1_phone,
                emergency_contact2_name, emergency_contact2_relation, emergency_contact2_phone,
                profile_image, nationality
            FROM users 
            WHERE id = ? OR student_id = ?`,
            [studentId, studentId]
        );
        const profile = userRows[0];
        
        // Use the actual internal ID for subsequent queries to ensure consistency
        const internalId = profile?.id;

        if (!profile) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // 2. Fetch Applications
        const [appRows]: any = await pool.query(
            'SELECT * FROM applications WHERE student_id = ? ORDER BY date DESC',
            [internalId]
        );

        // 3. Fetch Payments
        const [payRows]: any = await pool.query(
            'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
            [internalId]
        );

        // 4. Fetch Complaints
        const [compRows]: any = await pool.query(
            'SELECT * FROM complaints WHERE student_id = ? ORDER BY date DESC',
            [internalId]
        );
        const parsedCompRows = compRows.map((comp: any) => ({
            ...comp,
            images: comp.images ? (typeof comp.images === 'string' ? JSON.parse(comp.images) : comp.images) : []
        }));

        // 5. Fetch Documents
        const [docRows]: any = await pool.query(
            'SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC',
            [internalId]
        );

        // 6. Fetch Room Details from active/most recent application
        // Find the most recent application with a room assignment
        const activeApp = appRows.find((a: any) =>
            ['Checked in', 'Approved'].includes(a.status) && a.room_id
        ) || appRows.find((a: any) => a.room_id);

        let roomDetails = null;
        if (activeApp?.room_id) {
            const [roomRows]: any = await pool.query(
                `SELECT
                    r.id AS room_number,
                    r.floor_id AS floor,
                    r.gender AS wing,
                    r.room_type,
                    r.capacity,
                    r.status AS room_status,
                    COUNT(b.id) AS total_beds,
                    SUM(CASE WHEN b.status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_beds,
                    SUM(CASE WHEN b.status = 'Available' THEN 1 ELSE 0 END) AS available_beds
                FROM rooms r
                LEFT JOIN beds b ON b.room_id = r.id
                WHERE r.id = ?
                GROUP BY r.id`,
                [activeApp.room_id]
            );
            if (roomRows.length > 0) {
                roomDetails = {
                    ...roomRows[0],
                    assigned_bed: activeApp.bed_id || null,
                    application_status: activeApp.status,
                };
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                profile,
                applications: appRows.map((app: any) => ({
                    ...app,
                    roomType: app.room_type,
                    roomId: app.room_id,
                    bedId: app.bed_id,
                    durationType: app.duration_type,
                    stayDuration: app.stay_duration,
                    totalPrice: app.total_price
                })),
                payments: payRows,
                complaints: parsedCompRows,
                documents: docRows,
                roomDetails,
            }
        });

    } catch (error: any) {
        console.error('[StudentDetails API Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

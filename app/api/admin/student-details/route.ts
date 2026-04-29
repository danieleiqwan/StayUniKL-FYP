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
            'SELECT id, name, email, role, gender, phone_number, parent_phone_number, created_at FROM users WHERE id = ?',
            [studentId]
        );
        const profile = userRows[0];

        if (!profile) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // 2. Fetch Applications
        const [appRows]: any = await pool.query(
            'SELECT * FROM applications WHERE student_id = ? ORDER BY date DESC',
            [studentId]
        );

        // 3. Fetch Payments
        const [payRows]: any = await pool.query(
            'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
            [studentId]
        );

        // 4. Fetch Complaints
        const [compRows]: any = await pool.query(
            'SELECT * FROM complaints WHERE student_id = ? ORDER BY date DESC',
            [studentId]
        );
        const parsedCompRows = compRows.map((comp: any) => ({
            ...comp,
            images: comp.images ? (typeof comp.images === 'string' ? JSON.parse(comp.images) : comp.images) : []
        }));

        // 5. Fetch Documents
        const [docRows]: any = await pool.query(
            'SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC',
            [studentId]
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
                applications: appRows,
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

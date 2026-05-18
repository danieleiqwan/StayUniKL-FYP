import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { studentId } = await request.json();
        if (!studentId) return NextResponse.json({ error: 'Student ID required' }, { status: 400 });

        // Query user details
        const [users]: any = await pool.query(
            `SELECT id, name, phone_number, email FROM users WHERE id = ? LIMIT 1`,
            [studentId]
        );
        
        if (!users.length) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        
        const user = users[0];

        // Query active application for hostel/room info
        const [apps]: any = await pool.query(
            `SELECT room_id, bed_id, status FROM applications WHERE student_id = ? AND status IN ('Checked in', 'Approved', 'Payment Pending') ORDER BY created_at DESC LIMIT 1`,
            [user.id]
        );

        let roomInfo = 'No Active Residency';
        if (apps.length > 0) {
            const app = apps[0];
            // Assuming hostel info is tied to room or global, for StayUniKL it's usually "UniKL Residence" or similar, or based on room prefixes
            roomInfo = `UniKL Hostel - Room ${app.room_id} (Bed ${app.bed_id})`;
        }

        return NextResponse.json({
            success: true,
            student: {
                id: user.id,
                studentId: user.id,
                name: user.name,
                course: 'Computer Science (Placeholder)', // No course column in DB
                campus: 'UniKL MIIT', // No campus column in DB
                residency: roomInfo
            }
        });
    } catch (error: any) {
        console.error('[Student Lookup Error]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

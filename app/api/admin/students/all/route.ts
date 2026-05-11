import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Fetch all students and their active application status/room
        const [rows]: any = await pool.query(`
            SELECT 
                u.id, 
                u.name, 
                u.student_id, 
                u.email, 
                u.phone_number, 
                u.profile_image,
                u.gender,
                u.nationality,
                u.nric,
                u.birth_date,
                u.created_at,
                u.is_active,
                (SELECT id FROM applications WHERE student_id = u.id ORDER BY date DESC LIMIT 1) as latest_application_id,
                (SELECT status FROM applications WHERE student_id = u.id ORDER BY date DESC LIMIT 1) as latest_status,
                (SELECT date FROM applications WHERE student_id = u.id ORDER BY date DESC LIMIT 1) as latest_application_date,
                (SELECT room_id FROM applications WHERE student_id = u.id AND status IN ('Checked in', 'Approved') ORDER BY date DESC LIMIT 1) as room_id
            FROM users u
            WHERE u.role = 'student'
            ORDER BY u.name ASC
        `);

        return NextResponse.json({ success: true, students: rows });
    } catch (error: any) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

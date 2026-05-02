import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
        }

        // Fetch all students in the same room from the applications table
        const [rows]: any = await pool.query(`
            SELECT a.student_id, u.name as student_name, u.profile_image, a.bed_id, a.status 
            FROM applications a
            LEFT JOIN users u ON a.student_id = u.id
            WHERE a.room_id = ? AND a.status IN ('Approved', 'Checked in')
        `, [roomId]);

        const roommates = rows.map((row: any) => ({
            studentId: row.student_id,
            studentName: row.student_name,
            profileImage: row.profile_image,
            bedId: row.bed_id,
            status: row.status
        }));

        return NextResponse.json({ roommates });

    } catch (error: any) {
        console.error('Roommates Fetch Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // 1. Get room change requests
        const [rcrRows]: any = await pool.query('SELECT * FROM room_change_requests');
        
        // 2. Get users joined
        const [usersRows]: any = await pool.query('SELECT id, student_id, name, gender, role FROM users');
        
        // 3. Get rooms
        const [roomsRows]: any = await pool.query('SELECT id, gender, room_type FROM rooms LIMIT 10');
        
        // 4. Joined check
        const [joinedRows]: any = await pool.query(`
            SELECT rcr.id as rcr_id, rcr.student_id as rcr_student_id, 
                   u.id as u_id, u.student_id as u_student_id, u.name as u_name, u.gender as u_gender
            FROM room_change_requests rcr
            LEFT JOIN users u ON rcr.student_id = u.id
        `);

        return NextResponse.json({
            rcr: rcrRows,
            users: usersRows,
            rooms: roomsRows,
            joined: joinedRows
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

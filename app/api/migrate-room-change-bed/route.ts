import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET() {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }
        // Check if column exists first to avoid errors
        const [columns]: any = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'stayunikl_db' 
            AND TABLE_NAME = 'room_change_requests' 
            AND COLUMN_NAME = 'preferred_bed_id'
        `);

        if (columns.length > 0) {
            return NextResponse.json({ message: 'Column preferred_bed_id already exists.' });
        }

        await pool.query(`
            ALTER TABLE room_change_requests
            ADD COLUMN preferred_bed_id VARCHAR(20) NULL AFTER preferred_room_type
        `);

        return NextResponse.json({ success: true, message: 'Added preferred_bed_id column successfully.' });
    } catch (error: any) {
        console.error('Migration Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

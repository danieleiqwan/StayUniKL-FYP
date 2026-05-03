import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN alert_booking BOOLEAN DEFAULT TRUE;');
        await pool.query('ALTER TABLE users ADD COLUMN alert_maintenance BOOLEAN DEFAULT TRUE;');
        await pool.query('ALTER TABLE users ADD COLUMN alert_announcement BOOLEAN DEFAULT TRUE;');
        return NextResponse.json({ success: true, message: 'Migration successful' });
    } catch (error: any) {
        // If it fails because columns already exist, that's fine too
        return NextResponse.json({ success: false, error: error.message });
    }
}

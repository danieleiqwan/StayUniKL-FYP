import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        try { await pool.query('ALTER TABLE users ADD COLUMN alert_booking BOOLEAN DEFAULT TRUE;'); } catch (e) {}
        try { await pool.query('ALTER TABLE users ADD COLUMN alert_maintenance BOOLEAN DEFAULT TRUE;'); } catch (e) {}
        try { await pool.query('ALTER TABLE users ADD COLUMN alert_announcement BOOLEAN DEFAULT TRUE;'); } catch (e) {}
        return NextResponse.json({ success: true, message: 'Migration successful' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}

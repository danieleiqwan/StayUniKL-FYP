import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
    let results = [];
    try { await pool.query('ALTER TABLE users ADD COLUMN alert_booking BOOLEAN DEFAULT TRUE;'); results.push('booking added'); } catch (e: any) { results.push('booking error: ' + e.message); }
    try { await pool.query('ALTER TABLE users ADD COLUMN alert_maintenance BOOLEAN DEFAULT TRUE;'); results.push('maintenance added'); } catch (e: any) { results.push('maintenance error: ' + e.message); }
    try { await pool.query('ALTER TABLE users ADD COLUMN alert_announcement BOOLEAN DEFAULT TRUE;'); results.push('announcement added'); } catch (e: any) { results.push('announcement error: ' + e.message); }
    
    return NextResponse.json({ success: true, results });
}

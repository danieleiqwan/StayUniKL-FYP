import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { calculateProratedBilling } from '@/lib/hostel-billing';

// TEMPORARY DEBUG ENDPOINT — remove before final production release
export async function GET() {
    try {
        const now = new Date();

        // 1. Try semesters table
        const [semesterRows]: any = await pool.query(
            `SELECT id, name, type, start_date, end_date, is_active FROM semesters WHERE is_active = 1 LIMIT 1`
        );

        // 2. Try application_sessions table
        let sessions: any[] = [];
        try {
            const [sessRows]: any = await pool.query(
                `SELECT id, start_date, end_date FROM application_sessions
                 WHERE DATE(start_date) <= CURDATE() AND DATE(end_date) >= CURDATE()
                 ORDER BY start_date DESC LIMIT 1`
            );
            sessions = sessRows;
        } catch {}

        // 3. Compute billing result from active semester
        let billingResult = null;
        if (semesterRows && semesterRows.length > 0) {
            const semStart = new Date(semesterRows[0].start_date);
            const semEnd = new Date(semesterRows[0].end_date);
            billingResult = calculateProratedBilling(now, semStart, semEnd);
        }

        return NextResponse.json({
            serverNow: now.toISOString(),
            activeSemester: semesterRows?.[0] ?? null,
            activeApplicationSession: sessions?.[0] ?? null,
            billingCalculation: billingResult,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

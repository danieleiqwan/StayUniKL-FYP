import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { calculateProratedBilling } from '@/lib/hostel-billing';

function parseDateAsUtcMidnight(dbValue: Date | string): Date {
    const raw = dbValue instanceof Date ? dbValue.toISOString() : String(dbValue);
    const asDate = new Date(raw);
    const localDateStr = asDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
    const [year, month, day] = localDateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

// TEMPORARY DEBUG ENDPOINT — remove before final production release
export async function GET() {
    try {
        const now = new Date();
        const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const [semesterRows]: any = await pool.query(
            `SELECT id, name, type, start_date, end_date, is_active FROM semesters WHERE is_active = 1 LIMIT 1`
        );

        let sessions: any[] = [];
        try {
            const [sessRows]: any = await pool.query(
                `SELECT id, start_date, end_date FROM application_sessions
                 WHERE DATE(start_date) <= CURDATE() AND DATE(end_date) >= CURDATE()
                 ORDER BY start_date DESC LIMIT 1`
            );
            sessions = sessRows;
        } catch {}

        let billingResult = null;
        let parsedStart = null;
        let parsedEnd = null;
        if (semesterRows && semesterRows.length > 0) {
            const semStart = parseDateAsUtcMidnight(semesterRows[0].start_date);
            const semEnd = parseDateAsUtcMidnight(semesterRows[0].end_date);
            parsedStart = semStart.toISOString();
            parsedEnd = semEnd.toISOString();
            billingResult = calculateProratedBilling(nowUtc, semStart, semEnd);
        }

        return NextResponse.json({
            serverNow: now.toISOString(),
            serverNowUtcMidnight: nowUtc.toISOString(),
            activeSemester: semesterRows?.[0] ?? null,
            parsedSemesterStart: parsedStart,
            parsedSemesterEnd: parsedEnd,
            activeApplicationSession: sessions?.[0] ?? null,
            billingCalculation: billingResult,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin, getAuthUser } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// Ensure table exists
async function ensureTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS application_sessions (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            semester_type ENUM('Long', 'Short') NOT NULL,
            intake_batch VARCHAR(100) NOT NULL,
            eligibility ENUM('New Students Only', 'Returning Students Only', 'Both') NOT NULL DEFAULT 'Both',
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            created_by VARCHAR(64) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

// Compute status based on dates (compare date-only strings to avoid timezone/datetime issues)
// Note: mysql2 returns DATETIME columns as JavaScript Date objects, so we use toISOString()
function resolveStatus(start: any, end: any): 'Upcoming' | 'Open' | 'Closed' {
    const today = new Date().toISOString().split('T')[0]; // "2026-06-06" (UTC)
    const s = new Date(start).toISOString().split('T')[0];
    const e = new Date(end).toISOString().split('T')[0];
    if (today < s) return 'Upcoming';
    if (today >= s && today <= e) return 'Open';
    return 'Closed';
}

// GET: Fetch all sessions (admin) or the active open session (student)
export async function GET(request: Request) {
    try {
        await ensureTable();
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [rows]: any = await pool.query(
            `SELECT * FROM application_sessions ORDER BY start_date DESC`
        );

        const sessions = rows.map((r: any) => ({
            ...r,
            status: resolveStatus(r.start_date, r.end_date),
        }));

        // For students, just return the currently open session (if any)
        if (user.role === 'student') {
            const open = sessions.find((s: any) => s.status === 'Open') || null;
            return NextResponse.json({ session: open });
        }

        return NextResponse.json({ sessions });
    } catch (error: any) {
        console.error('[ApplicationSessions GET]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new session (admin only)
export async function POST(request: Request) {
    try {
        await ensureTable();
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { name, semesterType, intakeBatch, eligibility, startDate, endDate } = await request.json();

        if (!name || !semesterType || !intakeBatch || !eligibility || !startDate || !endDate) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        if (new Date(endDate) <= new Date(startDate)) {
            return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
        }

        const id = `sess_${Date.now()}`;
        await pool.query(
            `INSERT INTO application_sessions (id, name, semester_type, intake_batch, eligibility, start_date, end_date, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, semesterType, intakeBatch, eligibility, startDate, endDate, admin.id]
        );

        await logAction({
            actorId: admin.id,
            actorName: admin.email,
            action: 'CREATE_APPLICATION_SESSION',
            entityType: 'ApplicationSession',
            entityId: id,
            details: { name, semesterType, intakeBatch, eligibility, startDate, endDate },
        });

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('[ApplicationSessions POST]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update an existing session (admin only)
export async function PUT(request: Request) {
    try {
        await ensureTable();
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { id, name, semesterType, intakeBatch, eligibility, startDate, endDate } = await request.json();
        if (!id) return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });

        // Build dynamic SET clause – only update fields that were provided
        const updates: string[] = [];
        const params: any[] = [];

        if (name !== undefined)         { updates.push('name = ?');          params.push(name); }
        if (semesterType !== undefined)  { updates.push('semester_type = ?'); params.push(semesterType); }
        if (intakeBatch !== undefined)   { updates.push('intake_batch = ?');  params.push(intakeBatch); }
        if (eligibility !== undefined)   { updates.push('eligibility = ?');   params.push(eligibility); }
        if (startDate !== undefined)     { updates.push('start_date = ?');    params.push(startDate); }
        if (endDate !== undefined)       { updates.push('end_date = ?');      params.push(endDate); }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
        }

        // Validate date ordering if both dates are present (either from payload or after update)
        if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
            return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
        }

        params.push(id);
        await pool.query(
            `UPDATE application_sessions SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        await logAction({
            actorId: admin.id,
            actorName: admin.email,
            action: 'UPDATE_APPLICATION_SESSION',
            entityType: 'ApplicationSession',
            entityId: id,
            details: { name, semesterType, intakeBatch, eligibility, startDate, endDate },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[ApplicationSessions PUT]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a session (admin only)
export async function DELETE(request: Request) {
    try {
        await ensureTable();
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await pool.query('DELETE FROM application_sessions WHERE id = ?', [id]);

        await logAction({
            actorId: admin.id,
            actorName: admin.email,
            action: 'DELETE_APPLICATION_SESSION',
            entityType: 'ApplicationSession',
            entityId: id,
            details: {},
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

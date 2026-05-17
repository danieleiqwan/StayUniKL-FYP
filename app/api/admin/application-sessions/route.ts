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

// Compute status based on dates
function resolveStatus(start: string, end: string): 'Upcoming' | 'Open' | 'Closed' {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);
    if (now < s) return 'Upcoming';
    if (now >= s && now <= e) return 'Open';
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
            actorName: admin.name,
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
            actorName: admin.name,
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

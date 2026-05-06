import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin, getAuthUser } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// GET: Fetch all semesters (admin) or just the active one (any authenticated user)
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';

        if (activeOnly) {
            const [rows]: any = await pool.query(
                `SELECT * FROM semesters WHERE is_active = 1 LIMIT 1`
            );
            return NextResponse.json({ semester: rows[0] || null });
        }

        const [rows]: any = await pool.query(
            `SELECT * FROM semesters ORDER BY start_date DESC`
        );
        return NextResponse.json({ semesters: rows });
    } catch (error: any) {
        console.error('[Semesters GET]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new semester (admin only)
export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { name, type, start_date, end_date, is_active } = body;

        if (!name || !type || !start_date || !end_date) {
            return NextResponse.json({ error: 'Name, type, start date, and end date are required.' }, { status: 400 });
        }
        if (!['LONG', 'SHORT'].includes(type)) {
            return NextResponse.json({ error: 'Type must be LONG or SHORT.' }, { status: 400 });
        }
        if (new Date(end_date) <= new Date(start_date)) {
            return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
        }

        // Check for overlapping semesters
        const [overlapping]: any = await pool.query(
            `SELECT id FROM semesters WHERE NOT (end_date < ? OR start_date > ?)`,
            [start_date, end_date]
        );
        if (overlapping.length > 0) {
            return NextResponse.json({ error: 'This semester overlaps with an existing one. Please adjust the dates.' }, { status: 400 });
        }

        const id = `sem_${Date.now()}`;

        // If setting as active, deactivate all others first
        if (is_active) {
            await pool.query(`UPDATE semesters SET is_active = 0`);
        }

        await pool.query(
            `INSERT INTO semesters (id, name, type, start_date, end_date, is_active, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, name, type, start_date, end_date, is_active ? 1 : 0, admin.id]
        );

        await logAction({
            actorId: admin.id,
            actorName: (admin as any).name || admin.id,
            action: 'CREATE_SEMESTER',
            entityType: 'Semester',
            entityId: id,
            details: { name, type, start_date, end_date }
        });

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('[Semesters POST]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update a semester or set it as active (admin only)
export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { id, name, type, start_date, end_date, is_active, setActiveOnly } = body;

        if (!id) return NextResponse.json({ error: 'Semester ID is required.' }, { status: 400 });

        // If only toggling active status
        if (setActiveOnly) {
            await pool.query(`UPDATE semesters SET is_active = 0`);
            await pool.query(`UPDATE semesters SET is_active = 1 WHERE id = ?`, [id]);
            await logAction({
                actorId: admin.id,
                actorName: (admin as any).name || admin.id,
                action: 'SET_ACTIVE_SEMESTER',
                entityType: 'Semester',
                entityId: id,
                details: {}
            });
            return NextResponse.json({ success: true });
        }

        if (!name || !type || !start_date || !end_date) {
            return NextResponse.json({ error: 'Name, type, start date, and end date are required.' }, { status: 400 });
        }
        if (!['LONG', 'SHORT'].includes(type)) {
            return NextResponse.json({ error: 'Type must be LONG or SHORT.' }, { status: 400 });
        }
        if (new Date(end_date) <= new Date(start_date)) {
            return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
        }

        // Check for overlapping semesters (excluding current one)
        const [overlapping]: any = await pool.query(
            `SELECT id FROM semesters WHERE id != ? AND NOT (end_date < ? OR start_date > ?)`,
            [id, start_date, end_date]
        );
        if (overlapping.length > 0) {
            return NextResponse.json({ error: 'This semester overlaps with an existing one. Please adjust the dates.' }, { status: 400 });
        }

        if (is_active) {
            await pool.query(`UPDATE semesters SET is_active = 0`);
        }

        await pool.query(
            `UPDATE semesters SET name = ?, type = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?`,
            [name, type, start_date, end_date, is_active ? 1 : 0, id]
        );

        await logAction({
            actorId: admin.id,
            actorName: (admin as any).name || admin.id,
            action: 'UPDATE_SEMESTER',
            entityType: 'Semester',
            entityId: id,
            details: { name, type, start_date, end_date }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Semesters PUT]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a semester (admin only)
export async function DELETE(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Don't allow deleting the active semester
        const [rows]: any = await pool.query(`SELECT is_active FROM semesters WHERE id = ?`, [id]);
        if (rows[0]?.is_active) {
            return NextResponse.json({ error: 'Cannot delete the active semester. Please set another semester as active first.' }, { status: 400 });
        }

        await pool.query(`DELETE FROM semesters WHERE id = ?`, [id]);

        await logAction({
            actorId: admin.id,
            actorName: (admin as any).name || admin.id,
            action: 'DELETE_SEMESTER',
            entityType: 'Semester',
            entityId: id,
            details: {}
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Semesters DELETE]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

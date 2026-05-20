import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { logAction } from '@/lib/audit';

// GET: Fetch duty schedules
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const block = searchParams.get('block');
        const role = searchParams.get('role');
        const date = searchParams.get('date');

        let query = `SELECT * FROM duty_schedules WHERE 1=1`;
        const params: any[] = [];

        // Students typically see all active duties, admins see all
        if (user.role !== 'admin') {
            query += ` AND status = 'active'`;
        }

        if (block) {
            query += ` AND hostel_block = ?`;
            params.push(block);
        }

        if (role) {
            query += ` AND role = ?`;
            params.push(role);
        }

        if (date) {
            query += ` AND duty_date = ?`;
            params.push(date);
        }

        query += ` ORDER BY duty_date ASC, start_time ASC`;

        const [rows]: any = await pool.query(query, params);
        return NextResponse.json({ dutySchedules: rows });
    } catch (error: any) {
        console.error('[Duty Schedules GET]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new duty schedule (admin only, prevents overlaps)
export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { name, role, hostel_block, floor, duty_date, start_time, end_time, contact_number, status } = body;

        if (!name || !role || !hostel_block || !floor || !duty_date || !start_time || !end_time || !contact_number) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        // Validate time formats (start_time < end_time)
        if (start_time >= end_time) {
            return NextResponse.json({ error: 'Start time must be strictly before end time.' }, { status: 400 });
        }

        // Check for overlaps (same date, block, active, and overlapping times)
        const overlapQuery = `
            SELECT name, role, start_time, end_time FROM duty_schedules
            WHERE duty_date = ? 
              AND hostel_block = ? 
              AND status = 'active'
              AND start_time < ? 
              AND end_time > ?
        `;
        const [overlaps]: any = await pool.query(overlapQuery, [duty_date, hostel_block, end_time, start_time]);

        if (overlaps.length > 0) {
            const o = overlaps[0];
            return NextResponse.json({ 
                error: `Overlap Error: ${o.name} (${o.role}) is already scheduled on Block ${hostel_block} from ${o.start_time.substring(0, 5)} to ${o.end_time.substring(0, 5)}.` 
            }, { status: 409 });
        }

        const [result]: any = await pool.query(
            `INSERT INTO duty_schedules (name, role, hostel_block, floor, duty_date, start_time, end_time, contact_number, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, role, hostel_block, floor, duty_date, start_time, end_time, contact_number, status || 'active']
        );

        const newId = result.insertId;

        await logAction({
            actorId: admin.id,
            actorName: admin.name,
            action: 'CREATE_DUTY_SCHEDULE',
            entityType: 'DutySchedule',
            entityId: String(newId),
            details: { name, role, hostel_block, duty_date }
        });

        return NextResponse.json({ success: true, id: newId });
    } catch (error: any) {
        console.error('[Duty Schedules POST]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update an existing duty schedule (admin only, prevents overlaps)
export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { id, name, role, hostel_block, floor, duty_date, start_time, end_time, contact_number, status } = body;

        if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 });

        if (!name || !role || !hostel_block || !floor || !duty_date || !start_time || !end_time || !contact_number) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        if (start_time >= end_time) {
            return NextResponse.json({ error: 'Start time must be strictly before end time.' }, { status: 400 });
        }

        // Check for overlaps (excluding the current record id)
        const overlapQuery = `
            SELECT name, role, start_time, end_time FROM duty_schedules
            WHERE duty_date = ? 
              AND hostel_block = ? 
              AND status = 'active'
              AND id != ?
              AND start_time < ? 
              AND end_time > ?
        `;
        const [overlaps]: any = await pool.query(overlapQuery, [duty_date, hostel_block, id, end_time, start_time]);

        if (status === 'active' && overlaps.length > 0) {
            const o = overlaps[0];
            return NextResponse.json({ 
                error: `Overlap Error: ${o.name} (${o.role}) is already scheduled on Block ${hostel_block} from ${o.start_time.substring(0, 5)} to ${o.end_time.substring(0, 5)}.` 
            }, { status: 409 });
        }

        await pool.query(
            `UPDATE duty_schedules 
             SET name = ?, role = ?, hostel_block = ?, floor = ?, duty_date = ?, start_time = ?, end_time = ?, contact_number = ?, status = ?
             WHERE id = ?`,
            [name, role, hostel_block, floor, duty_date, start_time, end_time, contact_number, status, id]
        );

        await logAction({
            actorId: admin.id,
            actorName: admin.name,
            action: 'UPDATE_DUTY_SCHEDULE',
            entityType: 'DutySchedule',
            entityId: String(id),
            details: { name, role, hostel_block, duty_date }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Duty Schedules PUT]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a duty schedule (admin only)
export async function DELETE(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const [rows]: any = await pool.query('SELECT name, role FROM duty_schedules WHERE id = ?', [id]);
        
        await pool.query('DELETE FROM duty_schedules WHERE id = ?', [id]);

        if (rows.length > 0) {
            await logAction({
                actorId: admin.id,
                actorName: admin.name,
                action: 'DELETE_DUTY_SCHEDULE',
                entityType: 'DutySchedule',
                entityId: String(id),
                details: { name: rows[0].name, role: rows[0].role }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Duty Schedules DELETE]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

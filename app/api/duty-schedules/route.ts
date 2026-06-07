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

// POST: Create a new duty schedule (admin only, prevents overlaps and past dates, supports range)
export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { name, role, floor, duty_date, end_date, start_time, end_time, contact_number, status } = body;

        if (!name || !role || !floor || !duty_date || !start_time || !end_time || !contact_number) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        // Restrict to future or today's date only
        const today = new Date().toISOString().split('T')[0];
        if (duty_date < today) {
            return NextResponse.json({ error: 'Duty start date cannot be in the past.' }, { status: 400 });
        }

        if (end_date && end_date < duty_date) {
            return NextResponse.json({ error: 'End date must be on or after the start date.' }, { status: 400 });
        }

        // Validate time formats (start_time < end_time)
        if (start_time >= end_time) {
            return NextResponse.json({ error: 'Start time must be strictly before end time.' }, { status: 400 });
        }

        // Generate date list (for multi-day scheduling)
        const datesToSchedule: string[] = [];
        if (end_date && end_date > duty_date) {
            let curr = new Date(duty_date);
            const end = new Date(end_date);
            curr.setHours(12, 0, 0, 0);
            end.setHours(12, 0, 0, 0);
            while (curr <= end) {
                datesToSchedule.push(curr.toISOString().split('T')[0]);
                curr.setDate(curr.getDate() + 1);
            }
        } else {
            datesToSchedule.push(duty_date);
        }

        // Check overlaps for all dates in the range (same floor, same time)
        for (const date of datesToSchedule) {
            const overlapQuery = `
                SELECT name, role, start_time, end_time FROM duty_schedules
                WHERE duty_date = ? 
                  AND floor = ?
                  AND status = 'active'
                  AND start_time < ? 
                  AND end_time > ?
            `;
            const [overlaps]: any = await pool.query(overlapQuery, [date, floor, end_time, start_time]);

            if (overlaps.length > 0) {
                const o = overlaps[0];
                return NextResponse.json({ 
                    error: `Overlap Error on ${date}: ${o.name} (${o.role}) is already scheduled on Floor ${floor} from ${o.start_time.substring(0, 5)} to ${o.end_time.substring(0, 5)}.` 
                }, { status: 409 });
            }
        }

        // Insert schedules
        const newIds: number[] = [];
        for (const date of datesToSchedule) {
            const [result]: any = await pool.query(
                `INSERT INTO duty_schedules (name, role, hostel_block, floor, duty_date, start_time, end_time, contact_number, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, role, '', floor, date, start_time, end_time, contact_number, status || 'active']
            );
            newIds.push(result.insertId);
        }

        await logAction({
            actorId: admin.id,
            actorName: admin.email,
            action: 'CREATE_DUTY_SCHEDULE_RANGE',
            entityType: 'DutySchedule',
            entityId: String(newIds[0]),
            details: { name, role, floor, duty_date, end_date, datesScheduled: datesToSchedule }
        });

        return NextResponse.json({ success: true, ids: newIds });
    } catch (error: any) {
        console.error('[Duty Schedules POST]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update an existing duty schedule (admin only, prevents overlaps and past dates)
export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { id, name, role, floor, duty_date, start_time, end_time, contact_number, status } = body;

        if (!id) return NextResponse.json({ error: 'ID is required.' }, { status: 400 });

        if (!name || !role || !floor || !duty_date || !start_time || !end_time || !contact_number) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        // Restrict to future or today's date only
        const today = new Date().toISOString().split('T')[0];
        if (duty_date < today) {
            return NextResponse.json({ error: 'Duty date cannot be in the past.' }, { status: 400 });
        }

        if (start_time >= end_time) {
            return NextResponse.json({ error: 'Start time must be strictly before end time.' }, { status: 400 });
        }

        // Check for overlaps (same floor, excluding current record)
        const overlapQuery = `
            SELECT name, role, start_time, end_time FROM duty_schedules
            WHERE duty_date = ? 
              AND floor = ?
              AND status = 'active'
              AND id != ?
              AND start_time < ? 
              AND end_time > ?
        `;
        const [overlaps]: any = await pool.query(overlapQuery, [duty_date, floor, id, end_time, start_time]);

        if (status === 'active' && overlaps.length > 0) {
            const o = overlaps[0];
            return NextResponse.json({ 
                error: `Overlap Error: ${o.name} (${o.role}) is already scheduled on Floor ${floor} from ${o.start_time.substring(0, 5)} to ${o.end_time.substring(0, 5)}.` 
            }, { status: 409 });
        }

        await pool.query(
            `UPDATE duty_schedules 
             SET name = ?, role = ?, floor = ?, duty_date = ?, start_time = ?, end_time = ?, contact_number = ?, status = ?
             WHERE id = ?`,
            [name, role, floor, duty_date, start_time, end_time, contact_number, status, id]
        );

        await logAction({
            actorId: admin.id,
            actorName: admin.email,
            action: 'UPDATE_DUTY_SCHEDULE',
            entityType: 'DutySchedule',
            entityId: String(id),
            details: { name, role, floor, duty_date }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Duty Schedules PUT]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Delete single or multiple duty schedules (admin only)
export async function DELETE(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const idParam = searchParams.get('id') || searchParams.get('ids');
        if (!idParam) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const ids = idParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        if (ids.length === 0) return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });

        const [rows]: any = await pool.query('SELECT id, name, role FROM duty_schedules WHERE id IN (?)', [ids]);
        
        if (rows.length === 0) {
            return NextResponse.json({ error: 'No schedules found to delete' }, { status: 404 });
        }

        await pool.query('DELETE FROM duty_schedules WHERE id IN (?)', [ids]);

        for (const row of rows) {
            await logAction({
                actorId: admin.id,
                actorName: admin.email,
                action: 'DELETE_DUTY_SCHEDULE',
                entityType: 'DutySchedule',
                entityId: String(row.id),
                details: { name: row.name, role: row.role, bulk: ids.length > 1 }
            });
        }

        return NextResponse.json({ success: true, deletedCount: rows.length });
    } catch (error: any) {
        console.error('[Duty Schedules DELETE]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

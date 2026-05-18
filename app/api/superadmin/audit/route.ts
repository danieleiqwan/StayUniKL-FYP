import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isSuperAdmin } from '@/lib/auth';

/**
 * GET /api/superadmin/audit
 * Returns paginated, filterable audit logs.
 * Superadmin access only.
 *
 * Query params:
 *   - page: number (default 1)
 *   - limit: number (default 50)
 *   - actor: string (filter by actor_name or actor_id)
 *   - action: string (filter by action keyword)
 *   - entity_type: string (filter by entity type)
 *   - from: ISO date string
 *   - to: ISO date string
 */
export async function GET(request: Request) {
    const superadmin = await isSuperAdmin();
    if (!superadmin) {
        return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;
    const actor = searchParams.get('actor') || '';
    const action = searchParams.get('action') || '';
    const entityType = searchParams.get('entity_type') || '';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';

    try {
        const conditions: string[] = [];
        const params: any[] = [];

        if (actor) {
            conditions.push('(a.actor_name LIKE ? OR a.actor_id LIKE ?)');
            params.push(`%${actor}%`, `%${actor}%`);
        }
        if (action) {
            conditions.push('a.action LIKE ?');
            params.push(`%${action}%`);
        }
        if (entityType) {
            conditions.push('a.entity_type = ?');
            params.push(entityType);
        }
        if (from) {
            conditions.push('a.created_at >= ?');
            params.push(from);
        }
        if (to) {
            // Add 1 day to include the full "to" date
            conditions.push('a.created_at < DATE_ADD(?, INTERVAL 1 DAY)');
            params.push(to);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count for pagination
        const [countResult]: any = await pool.query(
            `SELECT COUNT(*) as total FROM audit_logs a ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // Get paginated results
        const [rows]: any = await pool.query(
            `SELECT a.id, a.actor_id, a.actor_name, a.action, a.entity_type, a.entity_id, a.details, a.ip_address, a.created_at,
                    u.is_active as actor_is_active
             FROM audit_logs a
             LEFT JOIN users u ON a.actor_id = u.id
             ${whereClause}
             ORDER BY a.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        // Get distinct entity types for the filter dropdown
        const [entityTypes]: any = await pool.query(
            'SELECT DISTINCT entity_type FROM audit_logs ORDER BY entity_type'
        );

        return NextResponse.json({
            logs: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            entityTypes: entityTypes.map((e: any) => e.entity_type)
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

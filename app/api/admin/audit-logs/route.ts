import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const actorId = searchParams.get('actorId');
        const entityType = searchParams.get('entityType');
        const action = searchParams.get('action');
        const role = searchParams.get('role');
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = `
            SELECT al.*, u.role as actor_role 
            FROM audit_logs al
            LEFT JOIN users u ON al.actor_id = u.id
        `;
        let params: any[] = [];
        let whereClauses: string[] = [];

        if (actorId) {
            whereClauses.push('(al.actor_id LIKE ? OR al.actor_name LIKE ?)');
            params.push(`%${actorId}%`, `%${actorId}%`);
        }
        if (entityType) {
            whereClauses.push('al.entity_type = ?');
            params.push(entityType);
        }
        if (action) {
            whereClauses.push('al.action LIKE ?');
            params.push(`%${action}%`);
        }
        if (role) {
            whereClauses.push('u.role = ?');
            params.push(role);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY al.created_at DESC LIMIT ?';
        params.push(limit);

        const [rows]: any = await pool.query(query, params);

        return NextResponse.json({
            success: true,
            logs: rows
        });

    } catch (error: any) {
        console.error('[AuditLogs API Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

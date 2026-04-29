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
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = 'SELECT * FROM audit_logs';
        let params: any[] = [];
        let whereClauses: string[] = [];

        if (actorId) {
            whereClauses.push('actor_id = ?');
            params.push(actorId);
        }
        if (entityType) {
            whereClauses.push('entity_type = ?');
            params.push(entityType);
        }
        if (action) {
            whereClauses.push('action LIKE ?');
            params.push(`%${action}%`);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
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

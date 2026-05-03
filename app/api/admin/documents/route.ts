import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

// GET /api/admin/documents - fetch all documents
export async function GET(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [rows]: any = await pool.query(`
            SELECT d.*, u.name as student_name, u.student_id
            FROM documents d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
        `);

        return NextResponse.json({ documents: rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/admin/documents - approve/reject document
export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, status, rejectionReason } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'Document ID and status are required' }, { status: 400 });
        }

        if (status === 'Rejected' && !rejectionReason) {
            return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
        }

        await pool.query(
            'UPDATE documents SET status = ?, rejection_reason = ? WHERE id = ?',
            [status, status === 'Rejected' ? rejectionReason : null, id]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

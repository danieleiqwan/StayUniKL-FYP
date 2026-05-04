import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { createSystemNotification } from '@/lib/notifications';

// GET: Fetch announcements (admin gets all, students get active non-expired ones)
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let query: string;
        let params: any[] = [];

        if (user.role === 'admin') {
            query = `SELECT * FROM announcements ORDER BY created_at DESC`;
        } else {
            // Students only see active, non-expired announcements
            query = `
                SELECT * FROM announcements 
                WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())
                ORDER BY priority DESC, created_at DESC
            `;
        }

        const [rows]: any = await pool.query(query, params);
        return NextResponse.json({ announcements: rows });
    } catch (error: any) {
        console.error('[Announcements GET]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new announcement (admin only)
export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { title, message, category, priority, expiresAt, sendNotification } = body;

        if (!title || !message || !category) {
            return NextResponse.json({ error: 'Title, message, and category are required.' }, { status: 400 });
        }

        const id = `ann_${Date.now()}`;

        await pool.query(
            `INSERT INTO announcements (id, title, message, category, priority, expires_at, is_active, created_by)
             VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
            [id, title, message, category, priority || 'general', expiresAt || null, admin.id]
        );

        // Fan out to all students as in-app notification if requested
        if (sendNotification) {
            const notifType = priority === 'urgent' ? 'error' : priority === 'important' ? 'warning' : 'info';
            await createSystemNotification({ title, message, type: notifType });
        }

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('[Announcements POST]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Toggle active status (admin only)
export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { id, is_active } = body;

        await pool.query('UPDATE announcements SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove announcement (admin only)
export async function DELETE(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

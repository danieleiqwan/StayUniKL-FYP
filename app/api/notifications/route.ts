
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// GET: Fetch notifications for a user
export async function GET(request: Request) {
    try {
        const authUser = await getAuthUser();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // --- SECURITY CHECK ---
        // If not admin, you can only see your own notifications
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (authUser.role !== 'admin' && authUser.id !== userId) {
            return NextResponse.json({ error: 'Forbidden: You cannot access notifications for another user' }, { status: 403 });
        }
        // ----------------------

        // --- AUTO CLEANUP ---
        // Delete notifications older than 72 hours (3 days) in the background to avoid blocking the GET request
        pool.query(`
            DELETE FROM notifications 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 72 HOUR)
        `).catch(err => console.error('[Notifications Cleanup Error]', err));
        // --------------------

        let query = `
            SELECT * FROM notifications 
            WHERE user_id = ? 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 72 HOUR)
        `;
        const params: any[] = [userId];

        if (unreadOnly) {
            query += ' AND is_read = FALSE';
        }

        query += ' ORDER BY created_at DESC LIMIT 50';

        const [rows]: any = await pool.query(query, params);

        return NextResponse.json({ success: true, notifications: rows });

    } catch (error: any) {
        console.error('[Notifications GET Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a notification (Internal/System use mainly)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, title, message, type, relatedEntityId, relatedEntityType } = body;

        if (!userId || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        await pool.query(`
            INSERT INTO notifications (
                id, user_id, title, message, type, 
                related_entity_id, related_entity_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            notificationId, userId, title, message,
            type || 'info', relatedEntityId || null, relatedEntityType || null
        ]);

        return NextResponse.json({ success: true, notificationId });

    } catch (error: any) {
        console.error('[Notifications POST Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Mark as read
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, userId, markAll } = body;

        if (markAll && userId) {
            await pool.query(`
                UPDATE notifications 
                SET is_read = TRUE 
                WHERE user_id = ? AND is_read = FALSE
            `, [userId]);

            return NextResponse.json({ success: true, message: 'All notifications marked as read' });
        }

        if (id) {
            await pool.query(`
                UPDATE notifications 
                SET is_read = TRUE 
                WHERE id = ?
            `, [id]);

            return NextResponse.json({ success: true, message: 'Notification marked as read' });
        }

        return NextResponse.json({ error: 'Missing ID or UserId' }, { status: 400 });

    } catch (error: any) {
        console.error('[Notifications PUT Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a notification
export async function DELETE(request: Request) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
        }

        // Verify ownership (unless admin)
        if (authUser.role !== 'admin') {
            const [rows]: any = await pool.query('SELECT user_id FROM notifications WHERE id = ?', [id]);
            if (rows.length > 0 && rows[0].user_id !== authUser.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        await pool.query('DELETE FROM notifications WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Notification deleted' });

    } catch (error: any) {
        console.error('[Notifications DELETE Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

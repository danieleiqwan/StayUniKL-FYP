import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function PATCH(request: Request) {
    const user = await getAuthUser();
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { twoFactorEnabled, notificationsEnabled } = await request.json();

        if (twoFactorEnabled !== undefined) {
            await pool.query('UPDATE users SET two_factor_enabled = ? WHERE id = ?', [twoFactorEnabled ? 1 : 0, user.id]);
        }

        if (notificationsEnabled !== undefined) {
            await pool.query('UPDATE users SET notifications_enabled = ? WHERE id = ?', [notificationsEnabled ? 1 : 0, user.id]);
        }

        await logAction({
            actorId: user.id,
            actorName: user.email,
            action: 'PREFERENCES_UPDATED',
            entityType: 'User',
            entityId: user.id,
            details: { twoFactorEnabled, notificationsEnabled }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

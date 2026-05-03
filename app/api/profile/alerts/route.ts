import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const updateAlertsSchema = z.object({
    alertBooking: z.boolean(),
    alertMaintenance: z.boolean(),
    alertAnnouncement: z.boolean(),
});

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = updateAlertsSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid alert data' }, { status: 400 });
        }

        const { alertBooking, alertMaintenance, alertAnnouncement } = validation.data;

        // Try to update user in DB. If the columns don't exist yet, it will fail and we return 500.
        // It's expected if migration hasn't run.
        const [result]: any = await pool.query(
            'UPDATE users SET alert_booking = ?, alert_maintenance = ?, alert_announcement = ? WHERE id = ?',
            [alertBooking ? 1 : 0, alertMaintenance ? 1 : 0, alertAnnouncement ? 1 : 0, user.id]
        );

        // If the row exists but nothing was changed, affectedRows might be 0 depending on the MySQL driver config.
        // We assume the user exists since getAuthUser() validated the JWT.
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Update alerts error:', error);
        return NextResponse.json({ error: 'Update failed: ' + error.message }, { status: 500 });
    }
}

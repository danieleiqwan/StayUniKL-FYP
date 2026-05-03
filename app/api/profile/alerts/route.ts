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
            [alertBooking, alertMaintenance, alertAnnouncement, user.id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Database update failed. User not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Update alerts error:', error);
        return NextResponse.json({ error: 'Could not update preferences. Did you run the database migration (/api/migrate)?' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
    try {
        const authUser = await getAuthUser();
        
        if (!authUser) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Fetch full user data from DB using the ID from the token
        // Use COALESCE or try to select it. If the DB doesn't have the columns yet, we handle it.
        let rows: any = [];
        try {
            [rows] = await pool.query(
                'SELECT id, name, email, role, gender, profile_image, alert_booking, alert_maintenance, alert_announcement FROM users WHERE id = ?',
                [authUser.id]
            );
        } catch (e) {
            // Fallback for when migration hasn't run
            [rows] = await pool.query(
                'SELECT id, name, email, role, gender, profile_image FROM users WHERE id = ?',
                [authUser.id]
            );
        }

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = rows[0];

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                gender: user.gender,
                profileImage: user.profile_image,
                alertBooking: user.alert_booking !== undefined ? !!user.alert_booking : true,
                alertMaintenance: user.alert_maintenance !== undefined ? !!user.alert_maintenance : true,
                alertAnnouncement: user.alert_announcement !== undefined ? !!user.alert_announcement : true
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

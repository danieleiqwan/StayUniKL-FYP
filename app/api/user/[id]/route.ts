import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const targetId = params.id;

        // Fetch basic user data
        const [userRows]: any = await pool.query(
            'SELECT id, name, email, role, gender, profile_image FROM users WHERE id = ?',
            [targetId]
        );

        if (userRows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userRows[0];

        // Fetch current active application/room info
        const [appRows]: any = await pool.query(
            'SELECT roomId, floorId, bedId, roomType, status FROM applications WHERE studentId = ? AND status IN ("Approved", "Checked in", "Payment Pending") ORDER BY date DESC LIMIT 1',
            [targetId]
        );

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email, // Roommates usually share emails or at least it's okay for university directory
                role: user.role,
                gender: user.gender,
                profileImage: user.profile_image
            },
            application: appRows.length > 0 ? appRows[0] : null
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

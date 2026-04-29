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
        const [rows]: any = await pool.query(
            'SELECT id, name, email, role, gender, profile_image FROM users WHERE id = ?',
            [authUser.id]
        );

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
                profileImage: user.profile_image
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

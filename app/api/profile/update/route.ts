import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    studentId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = updateProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
        }

        const { name, email, studentId } = validation.data;

        // Check if email is already taken by another user
        const [existingEmail]: any = await pool.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, user.id]
        );

        if (existingEmail.length > 0) {
            return NextResponse.json({ error: 'Email is already in use' }, { status: 400 });
        }

        // Check if studentId is already taken
        if (studentId) {
            const [existingId]: any = await pool.query(
                'SELECT id FROM users WHERE student_id = ? AND id != ?',
                [studentId, user.id]
            );
            if (existingId.length > 0) {
                return NextResponse.json({ error: 'Student ID is already in use' }, { status: 400 });
            }
        }

        // Update user in DB
        const [result]: any = await pool.query(
            'UPDATE users SET name = ?, email = ?, student_id = ? WHERE id = ?',
            [name, email, studentId || null, user.id]
        );

        console.log(`Update Result for User ${user.id}:`, result);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Database update failed. User not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

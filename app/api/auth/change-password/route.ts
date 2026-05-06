import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const passwordSchema = z.object({
    current: z.string().min(1),
    new: z.string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
});

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = passwordSchema.safeParse(body);

        if (!validation.success) {
            const errorMessage = validation.error.issues[0]?.message || 'Invalid password format';
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const { current, new: newPassword } = validation.data;

        // Verify current password (assuming plain text for now as per previous DB patterns, 
        // but normally we use bcrypt.compare here)
        const [rows]: any = await pool.query(
            'SELECT password FROM users WHERE id = ?',
            [user.id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userRecord = rows[0];

        const isMatch = await bcrypt.compare(current, userRecord.password);
        const isPlainMatch = current === userRecord.password;

        if (!isMatch && !isPlainMatch) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, user.id]
        );

        // Invalidate token
        const cookieStore = await cookies();
        cookieStore.delete('token');

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

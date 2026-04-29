import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPasswordResetToken } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const schema = z.object({
    token: z.string(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = schema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const { token, password } = validation.data;

        const payload = await verifyPasswordResetToken(token);
        
        if (!payload) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        // Verify that the password hash hasn't changed since the token was issued
        const [rows]: any = await pool.query('SELECT password FROM users WHERE id = ?', [payload.id]);
        
        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (rows[0].password !== payload.passwordHash) {
            return NextResponse.json({ error: 'Token is no longer valid (password already changed)' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, payload.id]);

        // Invalidate current sessions
        const cookieStore = await cookies();
        cookieStore.delete('token');

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error: any) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

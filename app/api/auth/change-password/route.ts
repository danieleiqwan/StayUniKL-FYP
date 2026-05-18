import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser, createToken, setTokenCookie } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        // Enforce basic auth check (but bypassing the middleware's strict mustChangePassword redirect redirect)
        const authUser = await getAuthUser();
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
        }

        const { currentPassword, newPassword, confirmPassword } = await request.json();

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }

        // 1. Password validation rules
        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'New password must be at least 8 characters long.' }, { status: 400 });
        }
        if (!/[A-Z]/.test(newPassword)) {
            return NextResponse.json({ error: 'New password must contain at least 1 uppercase letter.' }, { status: 400 });
        }
        if (!/[0-9]/.test(newPassword)) {
            return NextResponse.json({ error: 'New password must contain at least 1 number.' }, { status: 400 });
        }
        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            return NextResponse.json({ error: 'New password must contain at least 1 special character.' }, { status: 400 });
        }

        // 2. New password matches confirm password
        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });
        }

        // 3. New password is not the same as old password
        if (currentPassword === newPassword) {
            return NextResponse.json({ error: 'New password cannot be the same as your old password.' }, { status: 400 });
        }

        // 4. Verify current password matches DB
        const [rows]: any = await pool.query('SELECT password FROM users WHERE id = ?', [authUser.id]);
        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        const userPassword = rows[0].password;
        const isMatch = await bcrypt.compare(currentPassword, userPassword);
        const isPlainMatch = currentPassword === userPassword;
        if (!isMatch && !isPlainMatch) {
            return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
        }

        // 5. Update password and must_change_password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        await pool.query(
            'UPDATE users SET password = ?, must_change_password = 0 WHERE id = ?',
            [hashedNewPassword, authUser.id]
        );

        // 6. Log the action in security logs
        await logAction({
            actorId: authUser.id,
            actorName: authUser.email,
            action: 'ADMIN_PASSWORD_CHANGED_FIRST_LOGIN',
            entityType: 'User',
            entityId: authUser.id,
            details: { email: authUser.email }
        });

        // 7. Re-issue new session JWT token with mustChangePassword = false so they are instantly authorized
        const newToken = await createToken({
            id: authUser.id,
            role: authUser.role,
            email: authUser.email,
            mustChangePassword: false
        }, false);
        await setTokenCookie(newToken, false);

        return NextResponse.json({ success: true, message: 'Password updated successfully!' });

    } catch (e: any) {
        console.error('[ChangePassword API Error]', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}

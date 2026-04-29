import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createPasswordResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

const schema = z.object({
    email: z.string().email(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = schema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const { email } = validation.data;

        const [rows]: any = await pool.query('SELECT id, email, password FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            // For security, don't reveal if email exists, just say successful
            return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        const user = rows[0];

        const token = await createPasswordResetToken({
            id: user.id,
            email: user.email,
            passwordHash: user.password
        });

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        // Send the email using Nodemailer
        try {
            await sendPasswordResetEmail(email, resetLink);
        } catch (emailError) {
            console.error("Failed to send email, but continuing execution:", emailError);
            // We don't return a 500 error here to prevent email enumeration attacks
        }

        return NextResponse.json({ 
            success: true, 
            message: 'If an account exists, a reset link has been sent.',
            devResetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined 
        });

    } catch (error: any) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

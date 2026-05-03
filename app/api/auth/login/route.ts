import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createToken, setTokenCookie } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(['student', 'admin']),
    rememberMe: z.boolean().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // 1. Validate Input
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: 'Invalid login data', 
                details: validation.error.format() 
            }, { status: 400 });
        }

        const { email, password, role, rememberMe } = validation.data;

        const [rows]: any = await pool.query(
            'SELECT * FROM users WHERE email = ? AND role = ?',
            [email, role]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Invalid credentials or user not found' }, { status: 401 });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        const isPlainMatch = password === user.password;

        if (!isMatch && !isPlainMatch) {
            return NextResponse.json({ error: 'Invalid credentials or user not found' }, { status: 401 });
        }

        if (!isMatch && isPlainMatch) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
        }

        // 1. Create a secure JWT token
        const token = await createToken({
            id: user.id,
            role: user.role,
            email: user.email
        }, rememberMe);

        // 2. Set the token in an HttpOnly cookie
        await setTokenCookie(token, rememberMe);

        // Return user data (excluding sensitive fields)
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                gender: user.gender,
                phoneNumber: user.phone_number,
                parentPhoneNumber: user.parent_phone_number,
                profileImage: user.profile_image,
                alertBooking: user.alert_booking !== undefined ? !!user.alert_booking : true,
                alertMaintenance: user.alert_maintenance !== undefined ? !!user.alert_maintenance : true,
                alertAnnouncement: user.alert_announcement !== undefined ? !!user.alert_announcement : true
            }
        });

    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

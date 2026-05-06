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

        // 2. Check if account is locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const minutesLeft = Math.ceil((new Date(user.locked_until).getTime() - new Date().getTime()) / 60000);
            return NextResponse.json({ 
                error: `Account is locked due to too many failed attempts. Try again in ${minutesLeft} minutes.` 
            }, { status: 403 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        const isPlainMatch = password === user.password;

        if (!isMatch && !isPlainMatch) {
            // Increment failed attempts
            const newAttempts = (user.login_attempts || 0) + 1;
            let updateQuery = 'UPDATE users SET login_attempts = ? WHERE id = ?';
            const params = [newAttempts, user.id];

            if (newAttempts >= 5) {
                // Lock account for 15 minutes
                updateQuery = 'UPDATE users SET login_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?';
                return NextResponse.json({ 
                    error: 'Invalid credentials. Account locked for 15 minutes due to 5 failed attempts.' 
                }, { status: 401 });
            }

            await pool.query(updateQuery, params);
            return NextResponse.json({ 
                error: `Invalid credentials. ${5 - newAttempts} attempts remaining.` 
            }, { status: 401 });
        }

        if (!isMatch && isPlainMatch) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query('UPDATE users SET password = ?, login_attempts = 0, locked_until = NULL WHERE id = ?', [hashedPassword, user.id]);
        } else {
            // Reset attempts on successful login
            await pool.query('UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
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
                studentId: user.student_id || null,
                nric: user.nric,
                phoneNumber: user.phone_number,
                address: user.address,
                city: user.city,
                state: user.state,
                postcode: user.postcode,
                emergencyContact1Name: user.emergency_contact1_name,
                emergencyContact1Relation: user.emergency_contact1_relation,
                emergencyContact1Phone: user.emergency_contact1_phone,
                emergencyContact2Name: user.emergency_contact2_name,
                emergencyContact2Relation: user.emergency_contact2_relation,
                emergencyContact2Phone: user.emergency_contact2_phone,
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

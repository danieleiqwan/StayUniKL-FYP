import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createToken, setTokenCookie } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { validateNRIC } from '@/lib/validation';

const registerSchema = z.object({
    name: z.string().min(2),
    studentId: z.string().min(5),
    nric: z.string().min(12),
    email: z.string().email().endsWith('@unikl.edu.my', { message: 'Only UniKL email addresses are allowed' }),
    gender: z.enum(['Male', 'Female']),
    role: z.enum(['student', 'admin']),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // 1. Validate Input
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: 'Invalid registration data', 
                details: validation.error.format() 
            }, { status: 400 });
        }

        const { name, studentId, nric, email, gender, role } = validation.data;

        // 2. NRIC Age Validation (Backend Enforcement)
        const nricStatus = validateNRIC(nric);
        if (!nricStatus.isValid) {
            return NextResponse.json({ error: nricStatus.error }, { status: 400 });
        }

        // Check if Email exists
        const [existingEmail]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return NextResponse.json({ error: 'Email address is already in use' }, { status: 409 });
        }

        // Check if Student ID exists
        const [existingId]: any = await pool.query('SELECT id FROM users WHERE id = ?', [studentId]);
        if (existingId.length > 0) {
            return NextResponse.json({ error: 'Student ID has already been registered' }, { status: 409 });
        }

        // Check if NRIC exists
        const [existingNric]: any = await pool.query('SELECT id FROM users WHERE nric = ?', [nric]);
        if (existingNric.length > 0) {
            return NextResponse.json({ error: 'NRIC number has already been registered' }, { status: 409 });
        }

        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await pool.query(
            'INSERT INTO users (id, name, nric, email, role, gender, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [studentId, name, nric, email, role, gender, hashedPassword]
        );

        // 1. Create a secure JWT token
        const token = await createToken({
            id: studentId,
            role: role,
            email: email
        });

        // 2. Set the token in an HttpOnly cookie
        await setTokenCookie(token);

        return NextResponse.json({ 
            success: true, 
            user: { id: studentId, name, email, role, gender } 
        });

    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

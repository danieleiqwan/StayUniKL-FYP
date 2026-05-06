import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createToken, setTokenCookie } from '@/lib/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { validateNRIC } from '@/lib/validation';

const registerSchema = z.object({
    name: z.string().min(2),
    studentId: z.string().optional(), // Now optional
    nric: z.string().min(5), // Accepts Passport or NRIC — primary unique identifier
    email: z.string().email().endsWith('@s.unikl.edu.my', { message: 'Only UniKL student email addresses are allowed (@s.unikl.edu.my)' }),
    gender: z.enum(['Male', 'Female']),
    role: z.enum(['student', 'admin']),
    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
        .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
        .regex(/[0-9]/, { message: 'Password must contain at least one number' })
        .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
    nationality: z.string().optional(),
    dob: z.string().optional(),
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

        const { name, studentId, nric, email, gender, role, password, nationality, dob } = validation.data;

        // 2. Identity Validation
        if (nationality === 'Local') {
            const nricStatus = validateNRIC(nric);
            if (!nricStatus.isValid) {
                return NextResponse.json({ error: nricStatus.error }, { status: 400 });
            }
        } else {
            // International Age Check
            if (dob) {
                const birthDate = new Date(dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                
                if (age < 18) {
                    return NextResponse.json({ error: 'You must be at least 18 years old to register' }, { status: 400 });
                }
            }
        }

        // 3. Check if Email exists
        const [existingEmail]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return NextResponse.json({ error: 'Email address is already in use' }, { status: 409 });
        }

        // 4. Check if NRIC/Passport exists (primary unique identifier)
        const [existingNric]: any = await pool.query('SELECT id FROM users WHERE nric = ?', [nric]);
        if (existingNric.length > 0) {
            return NextResponse.json({ error: 'ID/Passport number has already been registered' }, { status: 409 });
        }

        // 5. If Student ID provided, check uniqueness
        if (studentId && studentId.trim()) {
            const [existingStudentId]: any = await pool.query('SELECT id FROM users WHERE student_id = ?', [studentId.trim()]);
            if (existingStudentId.length > 0) {
                return NextResponse.json({ error: 'Student ID has already been registered' }, { status: 409 });
            }
        }

        // 6. Generate a unique primary key: use studentId if provided, otherwise use NRIC-based ID
        const cleanNric = nric.replace(/\D/g, '').slice(0, 12) || nric.replace(/[^A-Z0-9]/g, '').slice(0, 12);
        const generatedId = studentId?.trim() || `STU-${cleanNric}-${Date.now().toString().slice(-4)}`;

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (id, name, nric, email, role, gender, password, nationality, birth_date, student_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                generatedId,
                name,
                nric,
                email,
                role,
                gender,
                hashedPassword,
                nationality || 'Local',
                dob || null,
                studentId?.trim() || null  // null if not provided
            ]
        );

        // 7. Create a secure JWT token
        const token = await createToken({
            id: generatedId,
            role: role,
            email: email
        });

        // 8. Set the token in an HttpOnly cookie
        await setTokenCookie(token);

        return NextResponse.json({ 
            success: true, 
            user: { id: generatedId, name, email, role, gender, studentId: studentId?.trim() || null } 
        });

    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

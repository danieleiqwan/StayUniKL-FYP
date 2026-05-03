import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    studentId: z.string().optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    postcode: z.string().optional().nullable(),
    emergencyContact1Name: z.string().optional().nullable(),
    emergencyContact1Relation: z.string().optional().nullable(),
    emergencyContact1Phone: z.string().optional().nullable(),
    emergencyContact2Name: z.string().optional().nullable(),
    emergencyContact2Relation: z.string().optional().nullable(),
    emergencyContact2Phone: z.string().optional().nullable(),
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

        const { 
            name, email, studentId, phoneNumber, address, city, state, postcode,
            emergencyContact1Name, emergencyContact1Relation, emergencyContact1Phone,
            emergencyContact2Name, emergencyContact2Relation, emergencyContact2Phone
        } = validation.data;

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
            `UPDATE users SET 
                name = ?, email = ?, student_id = ?, phone_number = ?, 
                address = ?, city = ?, state = ?, postcode = ?,
                emergency_contact1_name = ?, emergency_contact1_relation = ?, emergency_contact1_phone = ?,
                emergency_contact2_name = ?, emergency_contact2_relation = ?, emergency_contact2_phone = ?
            WHERE id = ?`,
            [
                name, email, studentId || null, phoneNumber || null,
                address || null, city || null, state || null, postcode || null,
                emergencyContact1Name || null, emergencyContact1Relation || null, emergencyContact1Phone || null,
                emergencyContact2Name || null, emergencyContact2Relation || null, emergencyContact2Phone || null,
                user.id
            ]
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

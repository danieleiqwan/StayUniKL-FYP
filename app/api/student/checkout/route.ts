import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

// POST: Student generates a secure check-out token for their active checked-in application
export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
        }

        const body = await request.json();
        const { applicationId } = body;

        if (!applicationId) {
            return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
        }

        // 1. Verify application exists, is 'Checked in', and belongs to this student
        const [appRows]: any = await pool.query(
            `SELECT a.student_id, u.name as student_name, a.status, a.room_id, a.bed_id 
             FROM applications a
             LEFT JOIN users u ON a.student_id = u.id 
             WHERE a.id = ?`,
            [applicationId]
        );

        if (appRows.length === 0) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const app = appRows[0];

        // Security check: Student can only generate tokens for their own application
        const isAuthorizedUser = user.role === 'admin' || user.role === 'superadmin' || user.id === app.student_id;
        if (!isAuthorizedUser) {
            return NextResponse.json({ error: 'Forbidden: You cannot generate a token for another student' }, { status: 403 });
        }

        if (app.status !== 'Checked in') {
            return NextResponse.json({
                error: `Application status is '${app.status}'. Must be 'Checked in' to generate a check-out token.`
            }, { status: 400 });
        }

        // 2. Generate a secure random token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const token = `su_co_${rawToken}`;

        // 3. Ensure the tokens table exists and save token (expires in 24 hours)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS checkout_tokens (
                token VARCHAR(255) PRIMARY KEY,
                application_id VARCHAR(50) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_application_id (application_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await pool.query(
            "INSERT INTO checkout_tokens (token, application_id, expires_at) VALUES (?, ?, ?)",
            [token, applicationId, expiresAt]
        );

        return NextResponse.json({ success: true, token, expiresAt });

    } catch (error: any) {
        console.error('[Student Checkout Token Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

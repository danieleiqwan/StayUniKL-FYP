import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    console.log('--- Superadmin Bootstrap Start ---');
    try {
        const body = await request.json();
        const { secret, name, email, password } = body;

        // 1. Verify Secret
        const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_SECRET;
        if (!BOOTSTRAP_SECRET) {
            return NextResponse.json({ error: 'BOOTSTRAP_SECRET is missing from Environment Variables.' }, { status: 503 });
        }
        if (secret !== BOOTSTRAP_SECRET) {
            return NextResponse.json({ error: 'Access Denied: Invalid Bootstrap Secret.' }, { status: 403 });
        }

        // 2. Validate Inputs
        if (!name || !email || !password || password.length < 12) {
            return NextResponse.json({ error: 'Missing or weak credentials (password must be 12+ chars).' }, { status: 400 });
        }

        // 3. Check for existing superadmin
        let existing;
        try {
            [existing] = await pool.query("SELECT id FROM users WHERE role = 'superadmin' LIMIT 1") as any;
            if (existing && existing.length > 0) {
                return NextResponse.json({ error: 'Governance already initialized. This endpoint is locked.' }, { status: 409 });
            }
        } catch (dbErr: any) {
            return NextResponse.json({ error: 'DB Connection Error during role check.', details: dbErr.message }, { status: 500 });
        }

        // 4. Check email availability
        try {
            const [emailCheck]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
            if (emailCheck.length > 0) {
                return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });
            }
        } catch (dbErr: any) {
            return NextResponse.json({ error: 'DB Error during email check.', details: dbErr.message }, { status: 500 });
        }

        // 5. Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 6. Create Account
        const userId = `superadmin_${Date.now()}`;
        try {
            await pool.query(
                `INSERT INTO users (id, name, email, password, role, is_active, created_at)
                 VALUES (?, ?, ?, ?, 'superadmin', 1, NOW())`,
                [userId, name, email, hashedPassword]
            );
        } catch (dbErr: any) {
            return NextResponse.json({ error: 'Account Creation Failed.', details: dbErr.message }, { status: 500 });
        }

        // 7. Audit Log (Non-blocking)
        try {
            await pool.query(
                `INSERT INTO audit_logs (actor_id, actor_name, action, entity_type, entity_id, details, created_at)
                 VALUES (?, ?, 'SUPERADMIN_INITIALIZED', 'User', ?, ?, NOW())`,
                [
                    'system_bootstrap',
                    'System Bootstrap',
                    userId,
                    JSON.stringify({ email, name })
                ]
            );
        } catch (auditErr: any) {
            console.warn('Audit log failed during bootstrap (non-fatal):', auditErr.message);
        }

        return NextResponse.json({
            success: true,
            message: `Superadmin ${email} has been created successfully.`,
            id: userId
        });

    } catch (err: any) {
        console.error('Fatal Bootstrap Crash:', err);
        return NextResponse.json({ 
            error: 'Fatal server error during bootstrap process.', 
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}

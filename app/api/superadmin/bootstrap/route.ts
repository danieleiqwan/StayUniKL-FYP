import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * POST /api/superadmin/bootstrap
 * 
 * ONE-TIME USE: Creates the very first superadmin account.
 * This endpoint is protected by a BOOTSTRAP_SECRET environment variable.
 * Once a superadmin account exists, this endpoint will refuse to create another.
 * 
 * Body: { secret: string, name: string, email: string, password: string }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { secret, name, email, password } = body;

        // 1. Verify the bootstrap secret to prevent unauthorized use
        const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_SECRET;
        if (!BOOTSTRAP_SECRET) {
            return NextResponse.json(
                { error: 'Bootstrap is not configured. Set BOOTSTRAP_SECRET in environment variables.' },
                { status: 503 }
            );
        }

        if (secret !== BOOTSTRAP_SECRET) {
            return NextResponse.json(
                { error: 'Invalid bootstrap secret. Access denied.' },
                { status: 403 }
            );
        }

        // 2. Validate inputs
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'name, email, and password are all required.' },
                { status: 400 }
            );
        }

        if (password.length < 12) {
            return NextResponse.json(
                { error: 'Superadmin password must be at least 12 characters long.' },
                { status: 400 }
            );
        }

        // 3. CRITICAL: Check if a superadmin account already exists
        //    This prevents the endpoint from being used to create multiple superadmins
        const [existing]: any = await pool.query(
            "SELECT id FROM users WHERE role = 'superadmin' LIMIT 1"
        );

        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'A superadmin account already exists. Bootstrap is disabled.' },
                { status: 409 }
            );
        }

        // 4. Check if email is already taken
        const [emailCheck]: any = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (emailCheck.length > 0) {
            return NextResponse.json(
                { error: 'This email address is already registered.' },
                { status: 409 }
            );
        }

        // 5. Hash password with reasonable cost factor for serverless execution
        const hashedPassword = await bcrypt.hash(password, 12);

        // 6. Create the superadmin account
        const id = `superadmin_${Date.now()}`;
        await pool.query(
            `INSERT INTO users (id, name, email, password, role, is_active, created_at)
             VALUES (?, ?, ?, ?, 'superadmin', 1, NOW())`,
            [id, name, email, hashedPassword]
        );

        // 7. Log this critical action to audit_logs
        await pool.query(
            `INSERT INTO audit_logs (actor_id, actor_name, action, entity_type, entity_id, details, created_at)
             VALUES (?, ?, 'SUPERADMIN_ACCOUNT_CREATED', 'User', ?, ?, NOW())`,
            [
                'system_bootstrap',
                'System Bootstrap',
                id,
                JSON.stringify({ email, name, method: 'bootstrap' })
            ]
        ).catch((err) => console.error('Audit log failed:', err)); 

        return NextResponse.json({
            success: true,
            message: `Superadmin account created for ${email}. This bootstrap endpoint is now permanently disabled.`,
            id
        });

    } catch (error: any) {
        console.error('Bootstrap Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

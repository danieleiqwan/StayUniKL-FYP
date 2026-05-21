import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { isAdmin, getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

// POST: Generate a new check-out token for a checked-in application
export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: Access token required' }, { status: 401 });
        }

        const body = await request.json();
        const { applicationId } = body;

        if (!applicationId) {
            return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
        }

        // 1. Verify application exists and is 'Checked in'
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

        // Security check: Only Admins or the Student owner of the application can generate a checkout token
        const isAuthorizedUser = user.role === 'admin' || user.role === 'superadmin' || user.id === app.student_id;
        if (!isAuthorizedUser) {
            return NextResponse.json({ error: 'Forbidden: You cannot generate a token for another student' }, { status: 403 });
        }
        
        if (app.status !== 'Checked in') {
            return NextResponse.json({ error: `Application status is '${app.status}'. Student must be 'Checked in' to generate a check-out token.` }, { status: 400 });
        }

        // 2. Generate a secure random token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const token = `su_co_${rawToken}`;

        // 3. Ensure the tokens table exists and save token (Expires in 24 hours)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS checkout_tokens (
                token VARCHAR(255) PRIMARY KEY,
                application_id VARCHAR(50) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        await pool.query(
            "INSERT INTO checkout_tokens (token, application_id, expires_at) VALUES (?, ?, ?)",
            [token, applicationId, expiresAt]
        );

        return NextResponse.json({ success: true, token, expiresAt });

    } catch (error: any) {
        console.error('[Checkout Generate Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Scan/Consume the token to check the student out
export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }

        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Ensure table exists (in case it hasn't been created by POST yet)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS checkout_tokens (
                token VARCHAR(255) PRIMARY KEY,
                application_id VARCHAR(50) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_application_id (application_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        // 1. Resolve Application ID from token
        let applicationId = null;

        if (token.startsWith('{')) {
            // Handle Virtual ID Card (JSON)
            try {
                const data = JSON.parse(token);
                const studentId = data.studentId || data.id;

                // Find the latest 'Checked in' application for this student
                const [appRows]: any = await pool.query(
                    "SELECT id FROM applications WHERE student_id = ? AND status = 'Checked in' ORDER BY date DESC LIMIT 1",
                    [studentId]
                );

                if (appRows.length === 0) {
                    return NextResponse.json({ error: 'No active checked-in stay found for this ID card.' }, { status: 404 });
                }
                applicationId = appRows[0].id;
            } catch (err) {
                return NextResponse.json({ error: 'Invalid ID card data format.' }, { status: 400 });
            }
        } else {
            // Handle Secure Check-out Token
            const [tokenRows]: any = await pool.query(
                "SELECT application_id, expires_at FROM checkout_tokens WHERE token = ?",
                [token]
            );

            if (tokenRows.length === 0) {
                return NextResponse.json({ error: 'Invalid or expired check-out token' }, { status: 400 });
            }

            const { application_id, expires_at } = tokenRows[0];

            if (new Date(expires_at) < new Date()) {
                await pool.query("DELETE FROM checkout_tokens WHERE token = ?", [token]);
                return NextResponse.json({ error: 'Check-out token has expired' }, { status: 400 });
            }
            applicationId = application_id;
        }

        // 2. Fetch application info
        const [appRows]: any = await pool.query(
            `SELECT a.student_id, u.name as student_name, a.status, a.room_id, a.bed_id 
             FROM applications a
             LEFT JOIN users u ON a.student_id = u.id 
             WHERE a.id = ?`,
            [applicationId]
        );

        if (appRows.length === 0) {
            return NextResponse.json({ error: 'Associated application no longer exists' }, { status: 404 });
        }

        const app = appRows[0];

        if (app.status !== 'Checked in') {
             if (!token.startsWith('{')) {
                 await pool.query("DELETE FROM checkout_tokens WHERE token = ?", [token]);
             }
             return NextResponse.json({ error: `Student status is ${app.status}. Must be 'Checked in' to process checkout.` }, { status: 400 });
        }

        // 3. Mark as Checked out (TRANSACTIONAL)
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update application status
            await connection.query(
                "UPDATE applications SET status = 'Checked out', check_out_date = NOW() WHERE id = ?",
                [applicationId]
            );

            // Free the bed and clear assignment refs from application
            if (app.room_id && app.bed_id) {
                await connection.query(
                    "UPDATE beds SET status = 'Available' WHERE id = ? AND room_id = ?",
                    [app.bed_id, app.room_id]
                );
                
                await connection.query(
                    "UPDATE applications SET bed_id = NULL, room_id = NULL WHERE id = ?",
                    [applicationId]
                );
            }

            // 4. Delete the consumed token (if it was a generated one)
            if (!token.startsWith('{')) {
                await connection.query("DELETE FROM checkout_tokens WHERE token = ?", [token]);
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        // 5. Audit log
        const [adminRows]: any = await pool.query('SELECT name FROM users WHERE id = ?', [admin.id]);
        const adminName = adminRows[0]?.name || 'Admin';

        await logAction({
            actorId: admin.id,
            actorName: adminName,
            action: 'QR Scan Check-out',
            entityType: 'Application',
            entityId: applicationId,
            details: {
                studentId: app.student_id,
                studentName: app.student_name,
                room: app.room_id,
                bed: app.bed_id
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: `Successfully checked out ${app.student_name}`,
            student: {
                id: app.student_id,
                name: app.student_name,
                room: app.room_id,
                bed: app.bed_id
            }
        });

    } catch (error: any) {
        console.error('[Checkout Consume Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

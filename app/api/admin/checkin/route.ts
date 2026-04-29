import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { isAdmin } from '@/lib/auth';
import crypto from 'crypto';

// POST: Generate a new check-in token for an application
export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }

        const body = await request.json();
        const { applicationId } = body;

        if (!applicationId) {
            return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
        }

        // 1. Verify application exists and is 'Approved'
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
        
        if (app.status === 'Checked in') {
            return NextResponse.json({ error: 'Student is already checked in' }, { status: 400 });
        }
        
        if (app.status !== 'Approved') {
            return NextResponse.json({ error: `Application status is '${app.status}'. Student must be 'Approved' to generate a check-in token.` }, { status: 400 });
        }

        if (!app.room_id || !app.bed_id) {
             return NextResponse.json({ error: 'Application does not have a room and bed assigned. Cannot check in.' }, { status: 400 });
        }

        // 2. Generate a secure random token (UUID-like or hex)
        const rawToken = crypto.randomBytes(32).toString('hex');
        // Let's create a compact token payload: stayunikl:checkin:rawToken
        const token = `su_ci_${rawToken}`;

        // 3. Save to database (Expires in 24 hours)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        await pool.query(
            "INSERT INTO checkin_tokens (token, application_id, expires_at) VALUES (?, ?, ?)",
            [token, applicationId, expiresAt]
        );

        return NextResponse.json({ success: true, token, expiresAt });

    } catch (error: any) {
        console.error('[Checkin Generate Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Scan/Consume the token to check the student in
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

        // 1. Validate token
        const [tokenRows]: any = await pool.query(
            "SELECT application_id, expires_at FROM checkin_tokens WHERE token = ?",
            [token]
        );

        if (tokenRows.length === 0) {
            return NextResponse.json({ error: 'Invalid or expired check-in token' }, { status: 400 });
        }

        const { application_id, expires_at } = tokenRows[0];

        if (new Date(expires_at) < new Date()) {
            // Delete expired token to clean up
            await pool.query("DELETE FROM checkin_tokens WHERE token = ?", [token]);
            return NextResponse.json({ error: 'Check-in token has expired' }, { status: 400 });
        }

        // 2. Fetch application info
        const [appRows]: any = await pool.query(
            `SELECT a.student_id, u.name as student_name, a.status, a.room_id, a.bed_id 
             FROM applications a
             LEFT JOIN users u ON a.student_id = u.id 
             WHERE a.id = ?`,
            [application_id]
        );

        if (appRows.length === 0) {
            return NextResponse.json({ error: 'Associated application no longer exists' }, { status: 404 });
        }

        const app = appRows[0];

        if (app.status === 'Checked in') {
             // Token shouldn't exist ideally, but let's clean up
             await pool.query("DELETE FROM checkin_tokens WHERE token = ?", [token]);
             return NextResponse.json({ error: 'Student is already checked in' }, { status: 400 });
        }

        // 3. Mark as Checked in (TRANSACTIONAL)
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            await connection.query(
                "UPDATE applications SET status = 'Checked in', check_in_date = NOW() WHERE id = ?",
                [application_id]
            );

            // Ensure bed status is occupied
            if (app.room_id && app.bed_id) {
                await connection.query(
                    "UPDATE beds SET status = 'Occupied' WHERE id = ? AND room_id = ?",
                    [app.bed_id, app.room_id]
                );
            }

            // 4. Delete the consumed token
            await connection.query("DELETE FROM checkin_tokens WHERE token = ?", [token]);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        // 5. Audit log
        await logAction({
            actorId: admin.id,
            actorName: admin.name,
            action: 'QR Scan Check-in',
            entityType: 'Application',
            entityId: application_id,
            details: {
                studentId: app.student_id,
                studentName: app.student_name,
                room: app.room_id,
                bed: app.bed_id
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: `Successfully checked in ${app.student_name}`,
            student: {
                id: app.student_id,
                name: app.student_name,
                room: app.room_id,
                bed: app.bed_id
            }
        });

    } catch (error: any) {
        console.error('[Checkin Consume Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

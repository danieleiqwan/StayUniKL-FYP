import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { isAdmin, getAuthUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

// Validation Schemas
const applicationSchema = z.object({
    studentId: z.string(),
    roomType: z.string(),
    floorId: z.coerce.string(),
    roomId: z.coerce.string(),
    bedId: z.coerce.string(),
    stayDuration: z.number().int().positive().optional().default(1),
    durationType: z.string().optional(),
    totalPrice: z.number().positive().optional()
});

const updateStatusSchema = z.object({
    id: z.string(),
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Payment Pending', 'Checked in', 'Checked out', 'Cancelled']),
    cancellationReason: z.string().optional()
});

// GET: Fetch applications
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        let studentId = searchParams.get('studentId');

        // Security: Students can ONLY fetch their own data
        if (user.role === 'student') {
            studentId = user.id;
        }

        let query = `
            SELECT a.*, u.gender, u.name as student_name, u.student_id as official_id
            FROM applications a
            LEFT JOIN users u ON a.student_id = u.id
        `;
        let params: any[] = [];

        if (studentId) {
            query += ' WHERE a.student_id = ?';
            params.push(studentId);
        } else if (user.role === 'admin') {
            query += ' ORDER BY a.date DESC';
        } else {
            return NextResponse.json({ error: 'Unauthorized: Missing filters' }, { status: 403 });
        }

        const [rows]: any = await pool.query(query, params);

        const applications = rows.map((row: any) => ({
            id: row.id,
            studentId: row.official_id || row.student_id,
            studentName: row.student_name,
            gender: row.gender,
            roomType: row.room_type,
            floorId: row.floor_id,
            roomId: row.room_id,
            bedId: row.bed_id,
            stayDuration: row.stay_duration,
            durationType: row.duration_type,
            totalPrice: row.total_price,
            status: row.status,
            previousStatus: row.previous_status,
            paymentStatus: row.payment_status,
            date: row.date,
            checkInDate: row.check_in_date,
        }));

        return NextResponse.json({ applications });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create new application
export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = applicationSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
        }

        const { studentId, roomType, stayDuration, durationType, totalPrice, floorId, roomId, bedId } = validation.data;
        
        // Fetch student name and gender from DB
        const [studentRows]: any = await pool.query('SELECT name, gender FROM users WHERE id = ?', [studentId]);
        if (studentRows.length === 0) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }
        const studentName = studentRows[0]?.name || 'Student';
        const studentGender = studentRows[0].gender;

        // Security: Can't apply for someone else
        if (user.role === 'student' && studentId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized: Cannot apply for another student' }, { status: 403 });
        }

        // 1. CHECK FOR EXISTING ACTIVE APPLICATIONS
        // We block new applications if student already has one that isn't Cancelled, Rejected, or Checked out.
        const [existing]: any = await pool.query(
            'SELECT id FROM applications WHERE student_id = ? AND status IN ("Pending", "Payment Pending", "Approved", "Checked in")',
            [studentId]
        );

        if (existing.length > 0) {
            return NextResponse.json({ 
                error: 'Active application exists', 
                message: 'You already have an active application or stay. Please manage your existing application in the dashboard.' 
            }, { status: 400 });
        }

        // --- GENDER VALIDATION ---
        // 2. Fetch room gender
        const [roomRows]: any = await pool.query('SELECT gender FROM rooms WHERE id = ?', [roomId]);
        if (roomRows.length === 0) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }
        const roomGender = roomRows[0].gender;

        // 3. Compare
        if (studentGender !== roomGender) {
            return NextResponse.json({ 
                error: `Gender Mismatch: You (${studentGender}) cannot apply for a ${roomGender} room.` 
            }, { status: 400 });
        }
        // -------------------------

        const id = `app_${Date.now()}`;
        const resolvedDurationType = durationType || (stayDuration === 4 ? '1_semester' : '1_month');

        // 1. Create Application
        await pool.query(
            'INSERT INTO applications (id, student_id, room_type, floor_id, room_id, bed_id, stay_duration, duration_type, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, studentId, roomType, floorId, roomId, bedId, stayDuration, resolvedDurationType, totalPrice || 120.00, 'Pending']
        );

        // 2. Mark Bed as Occupied
        await pool.query('UPDATE beds SET status = ? WHERE id = ?', ['Occupied', bedId]);

        // 3. Log Action
        await logAction({
            actorId: studentId,
            actorName: studentName,
            action: 'CREATED_APPLICATION',
            entityType: 'Application',
            entityId: id,
            details: { roomId, bedId }
        });

        // 4. Send Notification
        await createNotification({
            userId: studentId,
            title: 'Application Received',
            message: `Your application for a ${roomType} has been successfully submitted and is currently pending review.`,
            type: 'info',
            relatedEntityId: id,
            relatedEntityType: 'Application'
        });

        return NextResponse.json({ success: true, id });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update status (Admin Only)
export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }

        const body = await request.json();
        const validation = updateStatusSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data', details: validation.error.format() }, { status: 400 });
        }

        const { id, status, cancellationReason } = validation.data;

        let query = 'UPDATE applications SET status = ?';
        const params: any[] = [status];

        if (status === 'Checked in') {
            query += ', check_in_date = NOW()';
        } else if (status === 'Checked out') {
            query += ', check_out_date = NOW()';
        }

        if (cancellationReason) {
            query += ', cancellation_reason = ?';
            params.push(cancellationReason);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const connection = await pool.getConnection();
        await connection.beginTransaction();

try {
            // 1. Fetch BEFORE updating so bed_id is never null
            const [appRows]: any = await connection.query(
                'SELECT student_id, room_type, bed_id, total_price FROM applications WHERE id = ?', 
                [id]
            );

            if (appRows.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'Application not found' }, { status: 404 });
            }

            const app = appRows[0];
            const studentId = app.student_id;
            const bedId = app.bed_id;

            // 2. Update Application Status
            await connection.query(query, params);

            // 3. Update Bed Status based on application status
            if (status === 'Cancelled' || status === 'Rejected' || status === 'Checked out' || status === 'No show') {
                if (bedId) {
                    await connection.query('UPDATE beds SET status = "Available" WHERE id = ?', [bedId]);
                    // Also null the bed_id on the application so it's truly freed
                    await connection.query('UPDATE applications SET bed_id = NULL, room_id = NULL WHERE id = ?', [id]);
                }
            } else if (status === 'Checked in' || status === 'Approved' || status === 'Payment Pending' || status === 'Pending') {
                if (bedId) {
                    await connection.query('UPDATE beds SET status = "Occupied" WHERE id = ?', [bedId]);
                }
            }

            await connection.commit();

                // --- NOTIFICATION LOGIC (Success Path) ---
                let title = 'Application Update';
                let message = `Your hostel application status has been updated to ${status}.`;
                let type: any = 'info';

                if (status === 'Payment Pending') {
                    title = 'Application Approved';
                    message = `Great news! Your application for ${app.room_type} has been approved. Please proceed to payment to confirm your room.`;
                    type = 'success';

                    // Create Invoice for the application
                    const invoiceId = `INV-APP-${Date.now()}`;
                    await connection.query(
                        `INSERT INTO invoices (id, user_id, application_id, type, description, amount, status, due_date)
                         VALUES (?, ?, ?, 'Hostel Fee', ?, ?, 'Unpaid', DATE_ADD(NOW(), INTERVAL 7 DAY))`,
                        [invoiceId, studentId, id, `Hostel Fee for ${app.room_type}`, app.total_price || 0]
                    );
                } else if (status === 'Approved') {
                    title = 'Payment Confirmed';
                    message = `Your payment has been verified. Your stay in ${app.room_type} is now confirmed.`;
                    type = 'success';
                } else if (status === 'Rejected' || status === 'Cancelled') {
                    title = 'Application Cancelled';
                    message = `Your application for ${app.room_type} has been ${status.toLowerCase()}. ${cancellationReason ? `Reason: ${cancellationReason}` : ''}`;
                    type = 'error';
                } else if (status === 'Checked in') {
                    title = 'Welcome to StayUniKL!';
                    message = `You have successfully checked into your room. We hope you have a pleasant stay!`;
                    type = 'success';
                } else if (status === 'Checked out') {
                    title = 'Check-out Confirmed';
                    message = `You have successfully checked out. Thank you for staying with us!`;
                    type = 'info';
                }

                await createNotification({
                    userId: studentId,
                    title,
                    message,
                    type,
                    relatedEntityId: id,
                    relatedEntityType: 'Application'
                });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
        // --------------------------

        // Audit Log using actual admin ID
        await logAction({
            actorId: admin.id,
            actorName: admin.name,
            action: 'UPDATE_APPLICATION_STATUS',
            entityType: 'Application',
            entityId: id,
            details: { status }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

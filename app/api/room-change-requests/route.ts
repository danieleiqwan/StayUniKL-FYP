import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { z } from 'zod';

const requestSchema = z.object({
    studentId: z.string().min(1),
    currentRoomId: z.string().min(1),
    currentBedId: z.string().min(1),
    preferredRoomId: z.string().optional(),
    preferredRoomType: z.string().optional(),
    preferredBedId: z.string().optional(),
    reason: z.string().min(10),
    attachment_url: z.string().url().optional().or(z.literal('')),
});

const updateStatusSchema = z.object({
    id: z.string().min(1),
    status: z.enum(['Pending Review', 'Approved - Assigned', 'Approved - Waitlist', 'Rejected', 'Completed']),
    newRoomId: z.string().optional(),
    newBedId: z.string().optional(),
    adminNotes: z.string().optional(),
    waitlistPosition: z.number().optional(),
});

export const dynamic = 'force-dynamic';

// GET: Fetch room change requests
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const status = searchParams.get('status');

        // Security check: If not admin, you can only see your own requests
        if (user.role !== 'admin' && studentId && user.id !== studentId) {
            return NextResponse.json({ error: 'Forbidden: You cannot access requests for another user' }, { status: 403 });
        }

        // If no studentId is provided and not admin, default to own ID
        const activeId = user.role === 'admin' ? studentId : user.id;

        let query = `
            SELECT rcr.*,
                   u.name as student_name,
                   u.gender as student_gender,
                   curr_room.id as current_room_number,
                   curr_room.floor_id as current_floor_id,
                   new_room.id as new_room_number,
                   new_room.floor_id as new_floor_id
            FROM room_change_requests rcr
            LEFT JOIN users u ON rcr.student_id = u.id
            LEFT JOIN rooms curr_room ON rcr.current_room_id COLLATE utf8mb4_unicode_ci = curr_room.id
            LEFT JOIN rooms new_room ON rcr.new_room_id COLLATE utf8mb4_unicode_ci = new_room.id
            WHERE 1=1
        `;
        const params: any[] = [];

        // Filter by student (for student view)
        if (activeId) {
            query += ' AND rcr.student_id = ?';
            params.push(activeId);
        }

        // Filter by status
        if (status) {
            query += ' AND rcr.status = ?';
            params.push(status);
        }

        query += ' ORDER BY rcr.created_at DESC';

        const [rows]: any = await pool.query(query, params);

        return NextResponse.json({ success: true, requests: rows });

    } catch (error: any) {
        console.error('[RoomChangeRequests GET Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create new room change request
export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // 1. Validate Input
        const validation = requestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid request data', details: validation.error.format() }, { status: 400 });
        }

        const {
            studentId,
            currentRoomId,
            currentBedId,
            preferredRoomId,
            preferredRoomType,
            preferredBedId,
            reason,
            attachment_url
        } = validation.data;

        // Security check: Student can only create requests for themselves
        if (user.role !== 'admin' && user.id !== studentId) {
            return NextResponse.json({ error: 'Forbidden: You cannot create a room change request for another user' }, { status: 403 });
        }

        // Validate required fields (at least preferredRoomId/BedId OR preferredRoomType)
        if (!studentId || !currentRoomId || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if student already has a pending request
        const [existing]: any = await pool.query(
            'SELECT id FROM room_change_requests WHERE student_id = ? AND status IN ("Pending Review", "Approved - Assigned", "Approved - Waitlist")',
            [studentId]
        );

        if (existing.length > 0) {
            return NextResponse.json({ error: 'You already have an active room change request.' }, { status: 400 });
        }

        const id = `rcr_${Date.now()}`;

        // Insert into DB
        await pool.query(
            `INSERT INTO room_change_requests 
            (id, student_id, current_room_id, current_bed_id, preferred_room_id, preferred_room_type, preferred_bed_id, reason, attachment_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, studentId, currentRoomId, currentBedId, preferredRoomId || null, preferredRoomType || null, preferredBedId || null, reason, attachment_url || null]
        );

        // Audit Log
        await logAction({
            actorId: user.id,
            actorName: 'Student', // Using generic 'Student' to fix type error
            action: 'Submit Room Change Request',
            entityType: 'RoomChangeRequest',
            entityId: id,
            details: { reason }
        });

        // Send Notification
        await createNotification({
            userId: studentId,
            title: 'Room Change Submitted',
            message: 'Your room change request has been successfully submitted and is awaiting administrative review.',
            type: 'info',
            relatedEntityId: id,
            relatedEntityType: 'RoomChangeRequest'
        });

        return NextResponse.json({ success: true, id });

    } catch (error: any) {
        console.error('[RoomChangeRequests POST Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update Request Status (Admin Action)
export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }

        const body = await request.json();

        // 1. Validate Input
        const validation = updateStatusSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid update data', details: validation.error.format() }, { status: 400 });
        }

        const { id, status, newRoomId, newBedId, adminNotes, waitlistPosition } = validation.data;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
        }

        if (status === 'Approved - Assigned') {
            if (!newRoomId || !newBedId) {
                return NextResponse.json({ error: 'New Room and Bed ID required for assignment' }, { status: 400 });
            }

            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // 1. Update Request
                await connection.query(
                    `UPDATE room_change_requests 
                     SET status = ?, new_room_id = ?, new_bed_id = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW()
                     WHERE id = ?`,
                    [status, newRoomId, newBedId, adminNotes, admin.name, id]
                );

                // 2. Fetch student info
                const [reqRows]: any = await connection.query('SELECT student_id, current_bed_id FROM room_change_requests WHERE id = ?', [id]);
                if (reqRows.length > 0) {
                    const { student_id } = reqRows[0];

                    // 3. Update Application table
                    await connection.query(
                        `UPDATE applications 
                          SET bed_id = ?, room_id = ? 
                          WHERE student_id = ? AND status = 'Checked in'`,
                        [newBedId, newRoomId, student_id]
                    );

                    await connection.commit();

                    // Audit & Notification (Outside transaction for performance, or inside if strict)
                    await logAction({
                        actorId: admin.id,
                        actorName: admin.name,
                        action: 'APPROVE_ROOM_CHANGE',
                        entityType: 'RoomChangeRequest',
                        entityId: id,
                        details: { student_id, newBedId }
                    });
                    await createNotification({
                        userId: student_id,
                        title: 'Room Change Approved',
                        message: `Your room change request has been approved! You have been assigned to Room ${newRoomId}, Bed ${newBedId}.`,
                        type: 'success',
                        relatedEntityId: id,
                        relatedEntityType: 'RoomChangeRequest'
                    });
                } else {
                    await connection.rollback();
                }
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        else if (status === 'Approved - Waitlist') {
            await pool.query(
                `UPDATE room_change_requests 
                 SET status = ?, waitlist_position = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW()
                 WHERE id = ?`,
                [status, waitlistPosition, adminNotes, admin.name, id]
            );

            // Fetch student ID for notification
            const [reqRows]: any = await pool.query('SELECT student_id FROM room_change_requests WHERE id = ?', [id]);
            if (reqRows.length > 0) {
                await createNotification({
                    userId: reqRows[0].student_id,
                    title: 'Added to Waitlist',
                    message: `Your room change request is now on the waitlist (Position #${waitlistPosition}). We will notify you when a spot opens.`,
                    type: 'info',
                    relatedEntityId: id,
                    relatedEntityType: 'RoomChangeRequest'
                });
            }

        } else if (status === 'Rejected') {
            await pool.query(
                `UPDATE room_change_requests 
                 SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW()
                 WHERE id = ?`,
                [status, adminNotes, admin.name, id]
            );

            // Fetch student ID for notification
            const [reqRows]: any = await pool.query('SELECT student_id FROM room_change_requests WHERE id = ?', [id]);
            if (reqRows.length > 0) {
                await createNotification({
                    userId: reqRows[0].student_id,
                    title: 'Room Change Update',
                    message: `Your room change request was not approved. ${adminNotes ? `Admin notes: ${adminNotes}` : ''}`,
                    type: 'warning',
                    relatedEntityId: id,
                    relatedEntityType: 'RoomChangeRequest'
                });
            }

        } else if (status === 'Completed') {
            await pool.query(
                `UPDATE room_change_requests 
                 SET status = ?, completed_at = NOW()
                 WHERE id = ?`,
                [status, id]
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[RoomChangeRequests PUT Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

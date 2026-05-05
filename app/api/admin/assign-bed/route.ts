import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { isAdmin } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const assignSchema = z.object({
    studentId: z.string(),
    roomId: z.string(),
    bedId: z.string(),
    floorId: z.number().or(z.string()),
    roomType: z.string(),
});

export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }

        const body = await request.json();
        const validation = assignSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data', details: validation.error.format() }, { status: 400 });
        }

        const { studentId, roomId, bedId, floorId, roomType } = validation.data;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Check if student already has an active application
            const [existing]: any = await connection.query(
                'SELECT id FROM applications WHERE student_id = ? AND status IN ("Pending", "Payment Pending", "Approved", "Checked in", "Approved - Assigned")',
                [studentId]
            );

            if (existing.length > 0) {
                await connection.rollback();
                return NextResponse.json({ 
                    error: 'Student already has an active application or is already assigned to a room.' 
                }, { status: 400 });
            }

            const appId = `app_${Date.now()}`;
            // Set base price based on room type
            let totalPrice = 120.00;
            if (roomType.includes('Single')) totalPrice = 250.00;
            if (roomType.includes('Double')) totalPrice = 180.00;
            if (roomType.includes('Premium')) totalPrice += 50.00;

            // 1. Create Application with status 'Approved'
            await connection.query(
                'INSERT INTO applications (id, student_id, room_type, floor_id, room_id, bed_id, stay_duration, duration_type, total_price, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
                [appId, studentId, roomType, floorId, roomId, bedId, 1, '1_semester', totalPrice, 'Approved']
            );

            // 2. Create Invoice
            const invoiceId = `INV-APP-${Date.now()}`;
            await connection.query(
                `INSERT INTO invoices (id, user_id, application_id, type, description, amount, status, due_date)
                 VALUES (?, ?, ?, 'Hostel Fee', ?, ?, 'Unpaid', DATE_ADD(NOW(), INTERVAL 7 DAY))`,
                [invoiceId, studentId, appId, `Hostel Fee for ${roomType}`, totalPrice]
            );

            // 3. Update Bed Status
            await connection.query('UPDATE beds SET status = "Occupied" WHERE id = ?', [bedId]);

            await connection.commit();

            // 4. Log Action
            await logAction({
                actorId: admin.id,
                actorName: admin.name,
                action: 'MANUAL_BED_ASSIGNMENT',
                entityType: 'Application',
                entityId: appId,
                details: { roomId, bedId, studentId }
            });

            // 5. Send Notification
            await createNotification({
                userId: studentId,
                title: 'Room Assigned',
                message: `You have been manually assigned to ${roomType} (Bed ${bedId}). Please check your dashboard for details and invoice.`,
                type: 'success',
                relatedEntityId: appId,
                relatedEntityType: 'Application'
            });

            return NextResponse.json({ success: true, appId });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

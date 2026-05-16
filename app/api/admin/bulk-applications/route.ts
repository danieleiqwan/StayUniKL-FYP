import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { isAdmin } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const bulkUpdateSchema = z.object({
    ids: z.array(z.string()),
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Payment Pending', 'Checked in', 'Checked out', 'Cancelled', 'No show']),
});

export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = bulkUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data', details: validation.error.format() }, { status: 400 });
        }

        const { ids, status } = validation.data;
        if (ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const id of ids) {
                // 1. Fetch application details
                const [appRows]: any = await connection.query(
                    'SELECT student_id, room_type, bed_id, total_price FROM applications WHERE id = ?',
                    [id]
                );

                if (appRows.length === 0) continue;

                const app = appRows[0];
                const studentId = app.student_id;
                const bedId = app.bed_id;

                // 2. Update Status
                let updateQuery = 'UPDATE applications SET status = ?';
                const params: any[] = [status];

                if (status === 'Checked in') {
                    updateQuery += ', check_in_date = NOW()';
                } else if (status === 'Checked out') {
                    updateQuery += ', check_out_date = NOW()';
                }
                updateQuery += ' WHERE id = ?';
                params.push(id);

                await connection.query(updateQuery, params);

                // 3. Bed Status Management
                if (['Cancelled', 'Rejected', 'Checked out', 'No show'].includes(status)) {
                    if (bedId) {
                        await connection.query('UPDATE beds SET status = "Available" WHERE id = ?', [bedId]);
                        await connection.query('UPDATE applications SET bed_id = NULL, room_id = NULL WHERE id = ?', [id]);
                    }
                } else if (['Checked in', 'Approved', 'Payment Pending', 'Pending'].includes(status)) {
                    if (bedId) {
                        await connection.query('UPDATE beds SET status = "Occupied" WHERE id = ?', [bedId]);
                    }
                }

                // 4. Notifications & Invoices
                let title = 'Application Update';
                let message = `Your hostel application status has been updated to ${status}.`;
                let type: any = 'info';

                if (status === 'Payment Pending') {
                    title = 'Application Approved';
                    message = `Great news! Your application for ${app.room_type} has been approved. Please proceed to payment to confirm your room.`;
                    type = 'success';

                    // Create Invoice only if one doesn't already exist for this application
                    const [existingInvoices]: any = await connection.query(
                        'SELECT id FROM invoices WHERE application_id = ? AND type = "Hostel Fee" LIMIT 1',
                        [id]
                    );
                    if (existingInvoices.length === 0) {
                        const invoiceId = `INV-APP-${Date.now()}-${id.slice(-4)}`;
                        await connection.query(
                            `INSERT INTO invoices (id, user_id, application_id, type, description, amount, status, due_date)
                         VALUES (?, ?, ?, 'Hostel Fee', ?, ?, 'Unpaid', DATE_ADD(NOW(), INTERVAL 7 DAY))`,
                            [invoiceId, studentId, id, `Hostel Fee for ${app.room_type}`, app.total_price || 0]
                        );
                    }
                } else if (status === 'Approved') {
                    title = 'Payment Confirmed';
                    message = `Your payment has been verified. Your stay in ${app.room_type} is now confirmed.`;
                    type = 'success';
                    // Mark the related Hostel Fee invoice as Paid
                    await connection.query(
                        `UPDATE invoices SET status = 'Paid' WHERE application_id = ? AND type = 'Hostel Fee' AND status != 'Paid'`,
                        [id]
                    );
                } else if (status === 'Rejected' || status === 'Cancelled') {
                    title = 'Application Cancelled';
                    message = `Your application for ${app.room_type} has been ${status.toLowerCase()}.`;
                    type = 'error';
                }

                await createNotification({
                    userId: studentId,
                    title,
                    message,
                    type,
                    relatedEntityId: id,
                    relatedEntityType: 'Application'
                });

                // 5. Audit Log
                await logAction({
                    actorId: admin.id,
                    actorName: admin.name,
                    action: 'BULK_UPDATE_APPLICATION_STATUS',
                    entityType: 'Application',
                    entityId: id,
                    details: { status }
                });
            }

            await connection.commit();
            return NextResponse.json({ success: true, count: ids.length });
        } catch (err: any) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Bulk Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

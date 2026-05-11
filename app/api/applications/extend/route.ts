import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { applicationId, extraDuration } = body;

        if (!applicationId || !extraDuration || extraDuration < 1 || extraDuration > 4) {
            return NextResponse.json({ error: 'Invalid extension duration' }, { status: 400 });
        }

        // 1. Fetch the application to verify ownership and status
        const [appRows]: any = await pool.query(
            'SELECT * FROM applications WHERE id = ? AND student_id = ?',
            [applicationId, user.id]
        );

        if (appRows.length === 0) {
            return NextResponse.json({ error: 'Application not found or unauthorized' }, { status: 404 });
        }

        const app = appRows[0];

        if (app.status !== 'Checked in') {
            return NextResponse.json({ error: 'Only checked-in applications can be extended' }, { status: 400 });
        }

        // 2. Calculate new duration and invoice amount
        const monthlyRate = 120.00; // Standard monthly rate
        const extensionCost = extraDuration * monthlyRate;
        
        // 3. Update the application stay_duration
        const newDuration = (app.stay_duration || 0) + extraDuration;
        const newTotalPrice = Number(app.total_price || 0) + extensionCost;
        
        await pool.query(
            'UPDATE applications SET stay_duration = ?, total_price = ? WHERE id = ?',
            [newDuration, newTotalPrice, applicationId]
        );

        // 4. Create an invoice for the extension
        const invoiceId = `INV-EXT-${Date.now()}`;
        const description = `Accommodation Extension (${extraDuration} Month${extraDuration > 1 ? 's' : ''})`;
        
        await pool.query(
            `INSERT INTO invoices (id, user_id, application_id, type, description, amount, status, due_date)
             VALUES (?, ?, ?, 'Accommodation', ?, ?, 'Unpaid', DATE_ADD(NOW(), INTERVAL 7 DAY))`,
            [invoiceId, user.id, applicationId, description, extensionCost]
        );

        // 5. Log action
        await logAction({
            actorId: user.id,
            actorName: user.name,
            action: 'EXTENDED_STAY',
            entityType: 'Application',
            entityId: applicationId,
            details: { extraDuration, newDuration, invoiceId, extensionCost }
        });

        // 6. Notify student
        await createNotification({
            userId: user.id,
            title: 'Stay Extended',
            message: `You have successfully extended your stay by ${extraDuration} Month${extraDuration > 1 ? 's' : ''}. A new invoice for RM ${extensionCost.toFixed(2)} has been generated.`,
            type: 'success',
            relatedEntityId: invoiceId,
            relatedEntityType: 'Invoice'
        });

        return NextResponse.json({ success: true, message: 'Stay extended successfully', invoiceId });

    } catch (error: any) {
        console.error('Error extending application:', error);
        return NextResponse.json({ error: 'Failed to extend stay' }, { status: 500 });
    }
}

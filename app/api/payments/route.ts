import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const [rows]: any = await pool.query(
            'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        return NextResponse.json({ payments: rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, referenceId, amount, method, invoiceId } = body;

        if (!userId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = `pay_${Date.now()}`;
        // If referenceId is missing, maybe we can use invoiceId or generate one
        const finalRef = referenceId || invoiceId || `REF-${Date.now()}`;

        await pool.query(
            'INSERT INTO payments (id, user_id, reference_id, amount, method, status, invoice_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, userId, finalRef, amount, method || 'Mock Gateway', 'Success', invoiceId || null]
        );

        // Update Invoice Status if linked
        if (invoiceId) {
            await pool.query('UPDATE invoices SET status = "Paid" WHERE id = ?', [invoiceId]);
        }

        // Auto-approve the application if the reference ID matches an application ID
        // (Assuming referenceId IS the application ID)
        if (finalRef.startsWith('app_')) {
            await pool.query('UPDATE applications SET status = "Approved" WHERE id = ?', [finalRef]);
        }

        // Fetch user name for logging
        const [userRows]: any = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        const userName = userRows[0]?.name || 'Unknown User';

        // Audit Log
        await logAction({
            actorId: userId,
            actorName: userName,
            action: 'Processed Payment',
            entityType: 'Payment',
            entityId: id,
            details: { amount, method, referenceId: finalRef, invoiceId }
        });

        // Send Notification
        await createNotification({
            userId: userId,
            title: 'Payment Successful',
            message: `Your payment of RM ${Number(amount).toFixed(2)} has been successfully processed. Thank you!`,
            type: 'success',
            relatedEntityId: id,
            relatedEntityType: 'Payment'
        });

        return NextResponse.json({ success: true, paymentId: id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

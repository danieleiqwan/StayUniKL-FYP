import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import { syncApplicationPaymentStatus } from '@/lib/hostel-billing';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let query = 'SELECT * FROM payments';
        const params: any[] = [];

        if (userId && userId !== 'admin') {
            query += ' WHERE user_id = ?';
            params.push(userId);
        } else if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        query += ' ORDER BY created_at DESC';
        const [rows]: any = await pool.query(query, params);
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
        const finalRef = referenceId || invoiceId || `REF-${Date.now()}`;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        let applicationId: string | null = null;

        try {
            await connection.query(
                'INSERT INTO payments (id, user_id, reference_id, amount, method, status, invoice_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, userId, finalRef, amount, method || 'Mock Gateway', 'Success', invoiceId || null]
            );

            if (invoiceId) {
                const [invRows]: any = await connection.query(
                    'SELECT application_id FROM invoices WHERE id = ?',
                    [invoiceId]
                );
                applicationId = invRows[0]?.application_id ?? null;

                await connection.query(
                    'UPDATE invoices SET status = "Paid", paid_at = NOW() WHERE id = ?',
                    [invoiceId]
                );
            }

            if (finalRef.startsWith('app_')) {
                applicationId = finalRef;
                await connection.query(
                    `UPDATE invoices SET status = "Paid", paid_at = NOW()
                     WHERE application_id = ? AND status IN ("Unpaid", "Overdue") AND payment_plan = "Full"`,
                    [finalRef]
                );
            }

            if (applicationId) {
                const paymentStatus = await syncApplicationPaymentStatus(applicationId, connection);

                if (paymentStatus === 'Fully Paid') {
                    await connection.query(
                        'UPDATE applications SET status = "Approved" WHERE id = ? AND status = "Payment Pending"',
                        [applicationId]
                    );
                }
            }

            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

        const [userRows]: any = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        const userName = userRows[0]?.name || 'Unknown';

        await logAction({
            actorId: userId,
            actorName: userName,
            action: 'PROCESSED_PAYMENT',
            entityType: 'Payment',
            entityId: id,
            details: { amount, method, referenceId: finalRef, invoiceId, applicationId },
        });

        await createNotification({
            userId,
            title: 'Payment Successful',
            message: `Your payment of RM ${Number(amount).toFixed(2)} has been processed successfully.`,
            type: 'success',
            relatedEntityId: id,
            relatedEntityType: 'Payment',
        });

        return NextResponse.json({ success: true, paymentId: id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

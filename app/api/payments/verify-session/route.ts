import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';

const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27-acacia' as any })
    : null;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // 1. Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ success: false, status: session.payment_status });
        }

        const metadata = session.metadata;
        if (!metadata) return NextResponse.json({ error: 'No metadata found' }, { status: 400 });

        const { userId, invoiceId, applicationId } = metadata;
        const amount = session.amount_total! / 100;
        const stripePaymentId = session.payment_intent as string;

        // 2. Check if we already processed this payment (to avoid duplicates)
        const [existing]: any = await pool.query('SELECT id FROM payments WHERE reference_id = ?', [stripePaymentId]);
        if (existing.length > 0) {
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        const payId = `pay_${Date.now()}`;

        // 3. Update Database
        await pool.query(
            'INSERT INTO payments (id, user_id, reference_id, amount, method, status, invoice_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [payId, userId, stripePaymentId, amount, 'Stripe', 'Success', invoiceId || null]
        );

        if (invoiceId) {
            await pool.query('UPDATE invoices SET status = "Paid" WHERE id = ?', [invoiceId]);
        }

        if (applicationId) {
            await pool.query(
                'UPDATE applications SET status = "Approved", payment_status = "Paid" WHERE id = ?',
                [applicationId]
            ).catch(async () => {
                await pool.query('UPDATE applications SET status = "Approved" WHERE id = ?', [applicationId]);
            });
        }

        // 4. Logging & Notifications
        const [userRows]: any = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
        const userName = userRows[0]?.name || 'Unknown User';

        await logAction({
            actorId: userId,
            actorName: userName,
            action: 'Payment Verified (Callback)',
            entityType: 'Payment',
            entityId: payId,
            details: { amount, stripePaymentId }
        });

        await createNotification({
            userId: userId,
            title: 'Payment Verified',
            message: `RM ${amount.toFixed(2)} received. Your stay is now confirmed!`,
            type: 'success',
            relatedEntityId: payId,
            relatedEntityType: 'Payment'
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

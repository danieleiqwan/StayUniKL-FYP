import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { createNotification } from '@/lib/notifications';
import { headers } from 'next/headers';

const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (metadata) {
            const { userId, invoiceId, applicationId, type } = metadata;
            const amount = session.amount_total! / 100;
            const payId = `pay_${Date.now()}`;
            const stripePaymentId = session.payment_intent as string;

            try {
                // 1. Insert Payment Record
                await pool.query(
                    'INSERT INTO payments (id, user_id, reference_id, amount, method, status, invoice_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [payId, userId, stripePaymentId, amount, 'Stripe', 'Success', invoiceId || null]
                );

                // 2. Update Invoice Status
                if (invoiceId) {
                    await pool.query('UPDATE invoices SET status = "Paid" WHERE id = ?', [invoiceId]);
                }

                // 3. Update Application Status if applicable
                if (applicationId) {
                    await pool.query(
                        'UPDATE applications SET status = "Approved", payment_status = "Paid" WHERE id = ?',
                        [applicationId]
                    ).catch(async () => {
                        await pool.query('UPDATE applications SET status = "Approved" WHERE id = ?', [applicationId]);
                    });
                }

                // 4. Fetch user name for logging
                const [userRows]: any = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
                const userName = userRows[0]?.name || 'Unknown User';

                // 5. Audit Log
                await logAction({
                    actorId: userId,
                    actorName: userName,
                    action: 'Stripe Payment Success',
                    entityType: 'Payment',
                    entityId: payId,
                    details: { amount, stripePaymentId, metadata }
                });

                // 6. Send Notification
                await createNotification({
                    userId: userId,
                    title: 'Payment Confirmed',
                    message: `Your payment of RM ${amount.toFixed(2)} via Stripe was successful.`,
                    type: 'success',
                    relatedEntityId: payId,
                    relatedEntityType: 'Payment'
                });

                console.log(`[Webhook] Payment successful for User ${userId}, Session ${session.id}`);

            } catch (dbError) {
                console.error('[Webhook DB Error]', dbError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}

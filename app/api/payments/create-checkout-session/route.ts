import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

export async function POST(request: NextRequest) {
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    try {
        const { amount, description, metadata } = await request.json();
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'myr',
                        product_data: {
                            name: description || 'StayUniKL Hostel Payment',
                        },
                        unit_amount: Math.round(amount * 100), // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: metadata, // Pass userId, invoiceId, applicationId, etc.
            success_url: `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/dashboard?payment=cancelled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Session Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

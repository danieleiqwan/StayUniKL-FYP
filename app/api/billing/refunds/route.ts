import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fetch refunds
export async function GET(request: Request) {
    try {
        const [rows]: any = await pool.query('SELECT * FROM refunds ORDER BY created_at DESC');
        return NextResponse.json({ refunds: rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create Refund Request / Process Refund
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paymentId, amount, reason } = body;

        if (!paymentId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = `REF-${Date.now()}`;

        await pool.query(
            'INSERT INTO refunds (id, payment_id, amount, reason, status) VALUES (?, ?, ?, ?, ?)',
            [id, paymentId, amount, reason || 'Refund Request', 'Pending']
        );

        return NextResponse.json({ success: true, refundId: id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

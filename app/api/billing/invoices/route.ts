import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fetch invoices
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let query = 'SELECT * FROM invoices';
        const params: any[] = [];

        if (userId) {
            query += ' WHERE user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY created_at DESC';

        const [rows]: any = await pool.query(query, params);

        return NextResponse.json({ invoices: rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Generate Invoice
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, applicationId, type, amount, dueDate } = body;

        if (!userId || !amount || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = `INV-${Date.now()}`; // Simple ID generation

        await pool.query(
            'INSERT INTO invoices (id, user_id, application_id, type, amount, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, userId, applicationId || null, type, amount, 'Unpaid', dueDate || null]
        );

        return NextResponse.json({ success: true, invoice: { id, userId, amount, status: 'Unpaid' } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

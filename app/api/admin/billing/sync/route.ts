import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Find all successful payments that have an invoice_id
        // 2. Identify those where the invoice is NOT marked as 'Paid'
        // 3. Update those invoices to 'Paid'
        
        const [results]: any = await pool.query(`
            UPDATE invoices i
            JOIN payments p ON i.id = p.invoice_id
            SET i.status = 'Paid'
            WHERE p.status IN ('Success', 'Paid')
            AND i.status != 'Paid'
        `);

        return NextResponse.json({ 
            success: true, 
            syncedCount: results.affectedRows || 0,
            message: `Successfully synchronized ${results.affectedRows || 0} invoice(s) with confirmed payments.`
        });

    } catch (error: any) {
        console.error('Billing sync failed:', error);
        return NextResponse.json({ error: 'Failed to sync billing data', message: error.message }, { status: 500 });
    }
}

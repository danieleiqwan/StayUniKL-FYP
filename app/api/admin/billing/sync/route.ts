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
        
        // 1. Sync by invoice_id
        const [res1]: any = await pool.query(`
            UPDATE invoices i
            JOIN payments p ON i.id = p.invoice_id
            SET i.status = 'Paid'
            WHERE p.status IN ('Success', 'Paid')
            AND i.status != 'Paid'
        `);

        // 2. Sync by reference_id (often contains application_id for new bookings)
        const [res2]: any = await pool.query(`
            UPDATE invoices i
            JOIN payments p ON i.application_id = p.reference_id
            SET i.status = 'Paid'
            WHERE p.status IN ('Success', 'Paid')
            AND i.status != 'Paid'
            AND p.invoice_id IS NULL
        `);

        const totalSynced = (res1.affectedRows || 0) + (res2.affectedRows || 0);

        return NextResponse.json({ 
            success: true, 
            syncedCount: totalSynced,
            message: `Successfully synchronized ${totalSynced} invoice(s) with confirmed payments.`
        });

    } catch (error: any) {
        console.error('Billing sync failed:', error);
        return NextResponse.json({ error: 'Failed to sync billing data', message: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let repairLog = [];
        let totalFixed = 0;

        // --- STEP 1: LINKING EXISTING INVOICES ---
        // 1.1 Sync by invoice_id
        const [res1]: any = await pool.query(`
            UPDATE invoices i
            JOIN payments p ON i.id = p.invoice_id
            SET i.status = 'Paid'
            WHERE p.status IN ('Success', 'Paid')
            AND i.status != 'Paid'
        `);
        totalFixed += (res1.affectedRows || 0);

        // 1.2 Sync by reference_id (application_id)
        const [res2]: any = await pool.query(`
            UPDATE invoices i
            JOIN payments p ON i.application_id = p.reference_id
            SET i.status = 'Paid'
            WHERE p.status IN ('Success', 'Paid')
            AND i.status != 'Paid'
            AND p.invoice_id IS NULL
        `);
        totalFixed += (res2.affectedRows || 0);

        // --- STEP 2: DEEP REPAIR (CREATE MISSING INVOICES) ---
        // Find payments that have NO matching invoice at all (neither by ID nor by App Ref)
        const [orphans]: any = await pool.query(`
            SELECT p.* 
            FROM payments p
            LEFT JOIN invoices i1 ON p.invoice_id = i1.id
            LEFT JOIN invoices i2 ON p.reference_id = i2.application_id
            WHERE p.status IN ('Success', 'Paid')
            AND i1.id IS NULL
            AND i2.id IS NULL
        `);

        if (orphans.length > 0) {
            for (const p of orphans) {
                const invId = `INV-FIX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                // Create the missing invoice
                await pool.query(`
                    INSERT INTO invoices (id, user_id, application_id, type, amount, status, due_date, created_at)
                    VALUES (?, ?, ?, 'Hostel Fee', ?, 'Paid', ?, ?)
                `, [
                    invId, 
                    p.user_id, 
                    p.reference_id.startsWith('app_') ? p.reference_id : null, 
                    p.amount, 
                    p.created_at, // Use the payment date as the due date
                    p.created_at  // Use the payment date as the invoice date
                ]);

                // Link the payment to the new invoice
                await pool.query(`UPDATE payments SET invoice_id = ? WHERE id = ?`, [invId, p.id]);
                totalFixed++;
                repairLog.push(`Created missing invoice for Payment ${p.id} (RM ${p.amount})`);
            }
        }

        return NextResponse.json({ 
            success: true, 
            syncedCount: totalFixed,
            message: totalFixed > 0 
                ? `Deep Repair Complete: Recovered ${totalFixed} record(s). Your Finances and Analytics should now match!`
                : `System is already perfectly synced. No issues found.`
        });

    } catch (error: any) {
        console.error('Deep Repair failed:', error);
        return NextResponse.json({ error: 'Failed to run deep repair', message: error.message }, { status: 500 });
    }
}

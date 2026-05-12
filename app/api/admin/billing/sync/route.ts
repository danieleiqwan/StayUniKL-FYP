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

        // --- STEP 1: LINKING PAYMENTS TO INVOICES ---
        // 1.1 Link by invoice_id
        await pool.query(`
            UPDATE invoices i
            JOIN payments p ON i.id = p.invoice_id
            SET i.status = 'Paid'
            WHERE p.status IN ('Success', 'Paid')
            AND i.status != 'Paid'
        `);

        // 1.2 Attempt to link orphaned payments to unpaid invoices by application_id & amount
        // We do this one by one to avoid many-to-one issues
        const [orphans]: any = await pool.query(`
            SELECT p.id, p.user_id, p.amount, p.reference_id, p.created_at
            FROM payments p
            WHERE p.status IN ('Success', 'Paid')
            AND p.invoice_id IS NULL
        `);

        for (const p of orphans) {
            // Find an unpaid invoice for this student and application with the same amount
            const [matchingInvoices]: any = await pool.query(`
                SELECT id FROM invoices 
                WHERE user_id = ? 
                AND application_id = ? 
                AND amount = ? 
                AND status != 'Paid'
                LIMIT 1
            `, [p.user_id, p.reference_id, p.amount]);

            if (matchingInvoices.length > 0) {
                const invId = matchingInvoices[0].id;
                // Link them
                await pool.query(`UPDATE payments SET invoice_id = ? WHERE id = ?`, [invId, p.id]);
                await pool.query(`UPDATE invoices SET status = 'Paid' WHERE id = ?`, [invId]);
                totalFixed++;
                repairLog.push(`Linked Payment ${p.id} to existing Invoice ${invId}`);
            } else {
                // If no matching invoice exists, CREATE one (Deep Repair)
                const invId = `INV-FIX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                await pool.query(`
                    INSERT INTO invoices (id, user_id, application_id, type, amount, status, due_date, created_at)
                    VALUES (?, ?, ?, 'Hostel Fee', ?, 'Paid', ?, ?)
                `, [
                    invId, 
                    p.user_id, 
                    p.reference_id.startsWith('app_') ? p.reference_id : null, 
                    p.amount, 
                    p.created_at, 
                    p.created_at
                ]);

                await pool.query(`UPDATE payments SET invoice_id = ? WHERE id = ?`, [invId, p.id]);
                totalFixed++;
                repairLog.push(`Created missing invoice for Payment ${p.id} (RM ${p.amount})`);
            }
        }

        return NextResponse.json({ 
            success: true, 
            syncedCount: totalFixed,
            message: totalFixed > 0 
                ? `Deep Repair Complete: Recovered ${totalFixed} record(s). Financial consistency restored.`
                : `System is already perfectly synced. No issues found.`
        });

    } catch (error: any) {
        console.error('Deep Repair failed:', error);
        return NextResponse.json({ error: 'Failed to run deep repair', message: error.message }, { status: 500 });
    }
}

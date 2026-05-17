import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET() {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }
        // 1. Align live database ENUM types for installment support
        await pool.query(`
            ALTER TABLE applications 
            MODIFY COLUMN payment_status ENUM('Pending', 'Partially Paid', 'Fully Paid', 'Overdue') NOT NULL DEFAULT 'Pending'
        `);
        await pool.query(`
            ALTER TABLE invoices 
            MODIFY COLUMN type ENUM('Hostel Fee', 'Hostel Fee - Installment', 'Deposit', 'Fine', 'Other') NOT NULL
        `);
        await pool.query(`
            ALTER TABLE invoices 
            MODIFY COLUMN status ENUM('Unpaid', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled') DEFAULT 'Unpaid'
        `);

        // Fix records with empty status that were previously rejected
        await pool.query("UPDATE applications SET status = 'Reapplied' WHERE status = '' AND previous_status = 'Rejected'");

        // Fix any other empty statuses to 'Pending' as a fallback
        await pool.query("UPDATE applications SET status = 'Pending' WHERE status = ''");

        // Sync payment and approval status for all applications
        const [allApps]: any = await pool.query("SELECT id, payment_method FROM applications");
        const { syncApplicationPaymentStatus } = await import('@/lib/hostel-billing');
        for (const app of allApps) {
            if (app.payment_method === 'Installment Plan') {
                const [paySum]: any = await pool.query(
                    `SELECT SUM(amount) as totalPaid FROM payments 
                     WHERE status IN ('Success', 'Paid') AND (
                        invoice_id IN (SELECT id FROM invoices WHERE application_id = ?)
                        OR reference_id = ?
                     )`,
                    [app.id, app.id]
                );
                const totalPaid = Number(paySum[0]?.totalPaid || 0);

                await pool.query(
                    `UPDATE invoices SET 
                        status = CASE 
                            WHEN installment_no = 1 AND ? >= 150 THEN 'Paid'
                            WHEN installment_no = 2 AND ? >= 300 THEN 'Paid'
                            WHEN installment_no = 3 AND ? >= 450 THEN 'Paid'
                            WHEN installment_no = 4 AND ? >= 600 THEN 'Paid'
                            ELSE 'Unpaid'
                        END,
                        paid_at = CASE 
                            WHEN installment_no = 1 AND ? >= 150 THEN COALESCE(paid_at, NOW())
                            WHEN installment_no = 2 AND ? >= 300 THEN COALESCE(paid_at, NOW())
                            WHEN installment_no = 3 AND ? >= 450 THEN COALESCE(paid_at, NOW())
                            WHEN installment_no = 4 AND ? >= 600 THEN COALESCE(paid_at, NOW())
                            ELSE NULL
                        END
                     WHERE application_id = ? AND type = 'Hostel Fee - Installment'`,
                    [totalPaid, totalPaid, totalPaid, totalPaid, totalPaid, totalPaid, totalPaid, totalPaid, app.id]
                );
            }
            await syncApplicationPaymentStatus(app.id);
        }

        return NextResponse.json({ success: true, message: 'Data cleanup successful' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

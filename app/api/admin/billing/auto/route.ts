import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { markOverdueInvoicesWithGrace, notifyOverdueInstallments } from '@/lib/hostel-billing';
import pool from '@/lib/db';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

/** Sync overdue statuses and send payment reminders (no legacy monthly rent generation). */
export async function POST() {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const log: string[] = [];
        const markedOverdue = await markOverdueInvoicesWithGrace();
        log.push(`Marked ${markedOverdue} invoice(s) as overdue (after grace period).`);

        const notificationsSent = await notifyOverdueInstallments();
        log.push(`Sent ${notificationsSent} overdue warning notification(s).`);

        const [unpaid]: any = await pool.query(
            `SELECT i.id, i.user_id, i.description, i.amount, i.installment_no
             FROM invoices i
             JOIN applications a ON a.id = i.application_id
             WHERE i.status = 'Unpaid'
               AND i.type IN ('Hostel Fee', 'Hostel Fee - Installment')
               AND a.status IN ('Payment Pending', 'Checked in', 'Approved')`
        );

        let reminders = 0;
        for (const inv of unpaid) {
            const label = inv.installment_no
                ? `Installment ${inv.installment_no}/4`
                : 'Hostel fee';
            await createNotification({
                userId: inv.user_id,
                title: 'Payment Reminder',
                message: `Reminder: ${label} — RM ${Number(inv.amount).toFixed(2)} is due soon. Please pay via Financials.`,
                type: 'warning',
                relatedEntityId: inv.id,
                relatedEntityType: 'Invoice',
            });
            reminders++;
        }
        log.push(`Sent ${reminders} upcoming due reminder(s).`);

        return NextResponse.json({
            success: true,
            message: `Billing sync complete. ${markedOverdue} overdue, ${notificationsSent} overdue warnings, ${reminders} reminders.`,
            log,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

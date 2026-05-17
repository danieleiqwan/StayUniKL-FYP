import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendPaymentReminderEmail } from '@/lib/email';
import { logAction } from '@/lib/audit';

// This must be a GET request for Vercel Cron Jobs
export async function GET(request: Request) {
    // 1. Verify Vercel Cron Secret to prevent unauthorized public triggering
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized: Invalid Cron Secret' }, { status: 401 });
    }

    try {
        const { markOverdueInvoicesWithGrace } = await import('@/lib/hostel-billing');
        await markOverdueInvoicesWithGrace();

        const [invoices]: any = await pool.query(`
            SELECT i.id as invoice_id, i.amount, i.due_date, u.name, u.email, u.id as student_id
            FROM invoices i
            JOIN users u ON i.user_id = u.id
            WHERE i.status = 'Overdue'
        `);

        if (invoices.length === 0) {
            return NextResponse.json({ success: true, message: 'No overdue invoices found. No emails sent.' });
        }

        // 3. Send emails
        let sentCount = 0;
        let failedCount = 0;

        for (const inv of invoices) {
            const result = await sendPaymentReminderEmail(
                inv.email, 
                inv.name, 
                inv.invoice_id, 
                inv.amount, 
                inv.due_date
            );

            if (result.success) {
                sentCount++;
            } else {
                failedCount++;
            }
            
            // Add a small delay between emails to avoid hitting SMTP rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 4. Log the automated action to the database audit trail
        await logAction({
            actorId: 'system',
            actorName: 'Cron Job Scheduler',
            action: 'Automated Payment Reminders',
            entityType: 'System',
            details: {
                totalOverdueFound: invoices.length,
                emailsSent: sentCount,
                emailsFailed: failedCount
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: `Processed ${invoices.length} overdue invoices. Sent: ${sentCount}, Failed: ${failedCount}` 
        });

    } catch (error: any) {
        console.error('[Cron Job Error]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

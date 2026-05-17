import { NextResponse } from 'next/server';
import { markOverdueInvoicesWithGrace, notifyOverdueInstallments } from '@/lib/hostel-billing';
import { logAction } from '@/lib/audit';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const markedOverdue = await markOverdueInvoicesWithGrace();
        const notificationsSent = await notifyOverdueInstallments();

        await logAction({
            actorId: 'system',
            actorName: 'Hostel Billing Cron',
            action: 'HOSTEL_BILLING_OVERDUE_CHECK',
            entityType: 'System',
            details: { markedOverdue, notificationsSent },
        });

        return NextResponse.json({
            success: true,
            markedOverdue,
            notificationsSent,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

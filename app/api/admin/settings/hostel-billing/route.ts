import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getGracePeriodDays, setGracePeriodDays, MIN_GRACE_DAYS, MAX_GRACE_DAYS } from '@/lib/hostel-billing';
import { logAction } from '@/lib/audit';

export async function GET() {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const gracePeriodDays = await getGracePeriodDays();
        return NextResponse.json({
            gracePeriodDays,
            minGracePeriodDays: MIN_GRACE_DAYS,
            maxGracePeriodDays: MAX_GRACE_DAYS,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const days = Number(body.gracePeriodDays);
        if (Number.isNaN(days)) {
            return NextResponse.json({ error: 'gracePeriodDays must be a number' }, { status: 400 });
        }

        const gracePeriodDays = await setGracePeriodDays(days);

        await logAction({
            actorId: admin.id,
            actorName: admin.email,
            action: 'UPDATE_HOSTEL_BILLING_SETTINGS',
            entityType: 'Settings',
            entityId: 'hostel_billing',
            details: { gracePeriodDays },
        });

        return NextResponse.json({ success: true, gracePeriodDays });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

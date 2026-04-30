import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// One-time migration endpoint: add 'Cancelled' to court_bookings status ENUM
// Hit this endpoint once from the admin dashboard: GET /api/migrate-court-cancel
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
        }

        const results: string[] = [];

        // 1. Modify status ENUM to include 'Cancelled'
        try {
            await pool.query(
                "ALTER TABLE court_bookings MODIFY COLUMN `status` ENUM('Pending','Approved','Rejected','Cancelled') DEFAULT 'Pending'"
            );
            results.push('[OK] status ENUM updated with Cancelled');
        } catch (e: any) {
            results.push(`[SKIP] status ENUM: ${e.message}`);
        }

        // 2. Add cancelled_at column if not exists
        try {
            await pool.query(
                'ALTER TABLE court_bookings ADD COLUMN `cancelled_at` TIMESTAMP NULL DEFAULT NULL AFTER `status`'
            );
            results.push('[OK] cancelled_at column added');
        } catch (e: any) {
            results.push(`[SKIP] cancelled_at: ${e.message}`);
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET() {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }
        // Fix records with empty status that were previously rejected
        await pool.query("UPDATE applications SET status = 'Reapplied' WHERE status = '' AND previous_status = 'Rejected'");

        // Fix any other empty statuses to 'Pending' as a fallback
        await pool.query("UPDATE applications SET status = 'Pending' WHERE status = ''");

        return NextResponse.json({ success: true, message: 'Data cleanup successful' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

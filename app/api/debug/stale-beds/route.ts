import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Show all beds with stale "Occupied" status but no active application
export async function GET() {
    try {
        const [staleBeds]: any = await pool.query(`
            SELECT b.id, b.room_id, b.label, b.status
            FROM beds b
            WHERE b.status = 'Occupied'
            AND b.id NOT IN (
                SELECT bed_id FROM applications 
                WHERE bed_id IS NOT NULL 
                AND status IN ('Payment Pending', 'Approved', 'Checked in')
            )
        `);
        return NextResponse.json({ staleBeds, count: staleBeds.length });
    } catch (e: any) {
        console.error('[debug/stale-beds GET]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Fix all stale beds — reset to Available
export async function POST() {
    try {
        const [result]: any = await pool.query(`
            UPDATE beds 
            SET status = 'Available'
            WHERE status = 'Occupied'
            AND id NOT IN (
                SELECT bed_id FROM applications 
                WHERE bed_id IS NOT NULL 
                AND status IN ('Payment Pending', 'Approved', 'Checked in')
            )
        `);
        return NextResponse.json({ 
            success: true, 
            bedsFixed: result.affectedRows 
        });
    } catch (e: any) {
        console.error('[debug/stale-beds POST]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

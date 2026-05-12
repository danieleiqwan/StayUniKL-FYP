import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Get all occupied beds
        const [occupiedBeds]: any = await pool.query("SELECT id FROM beds WHERE status = 'Occupied'");
        
        // 2. Get all beds currently assigned to active applications
        const [activeApps]: any = await pool.query("SELECT bed_id FROM applications WHERE status IN ('Approved', 'Checked in', 'Payment Pending') AND bed_id IS NOT NULL");
        
        const validBedIds = activeApps.map((app: any) => app.bed_id);
        
        const orphanedBeds = occupiedBeds
            .map((b: any) => b.id)
            .filter((id: string) => !validBedIds.includes(id));

        if (orphanedBeds.length > 0) {
            // Revert orphaned beds to 'Available'
            const placeholders = orphanedBeds.map(() => '?').join(',');
            await pool.query(
                `UPDATE beds SET status = 'Available' WHERE id IN (${placeholders})`,
                orphanedBeds
            );
        }

        return NextResponse.json({
            success: true,
            message: `Reconciliation complete. Reset ${orphanedBeds.length} orphaned beds to Available.`,
            orphanedBeds
        });

    } catch (error: any) {
        console.error("Reconciliation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

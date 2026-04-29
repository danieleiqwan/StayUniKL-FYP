import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Fetch all assets, optionally filtered
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        const status = searchParams.get('status');

        let query = 'SELECT * FROM assets WHERE 1=1';
        const params: any[] = [];

        if (roomId) {
            query += ' AND location_id = ?';
            params.push(roomId);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [assets] = await db.query(query, params);

        // Also fetch maintenance logs if needed, or separate endpoint? 
        // For now, let's keep it simple.

        return NextResponse.json({ assets });
    } catch (error) {
        console.error("Error fetching assets:", error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

// POST: Create Asset OR Update Status OR Log Maintenance
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'create_asset') {
            const { name, type, locationId, value } = body;
            const id = `AST-${Date.now()}`;
            await db.query(
                `INSERT INTO assets (id, name, type, status, location_id, value) VALUES (?, ?, ?, 'Good', ?, ?)`,
                [id, name, type, locationId, value || 0]
            );
            return NextResponse.json({ success: true, id });
        }

        if (action === 'update_status') {
            const { id, status } = body;
            await db.query('UPDATE assets SET status = ? WHERE id = ?', [status, id]);
            return NextResponse.json({ success: true });
        }

        if (action === 'log_maintenance') {
            const { assetId, maintenanceAction, description, cost, performedBy } = body;
            const logId = `LOG-${Date.now()}`;

            // 1. Insert Log
            await db.query(
                `INSERT INTO maintenance_logs (id, asset_id, action, description, cost, performed_by) VALUES (?, ?, ?, ?, ?, ?)`,
                [logId, assetId, maintenanceAction, description, cost || 0, performedBy]
            );

            // 2. Update Asset Status based on action
            let newStatus = 'Maintenance';
            if (maintenanceAction === 'Repair' || maintenanceAction === 'Service') {
                // Usually stays in maintenance until fixed, or moves back to Good if this log IS the fix.
                // For simplicity, let's assume logging a 'Repair' *completes* the repair.
                // Or we can explicitly pass 'newStatus' in the body.
            }
            if (body.newStatus) {
                await db.query('UPDATE assets SET status = ? WHERE id = ?', [body.newStatus, assetId]);
            }

            return NextResponse.json({ success: true, logId });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error("Error processing asset action:", error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

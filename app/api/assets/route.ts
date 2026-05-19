import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { logAction } from '@/lib/audit';

// ─────────────────────────────────────────────────────────────
// ASSET SYNC HELPERS (Shared pattern with complaints API)
// ─────────────────────────────────────────────────────────────
const ASSET_KEYWORD_MAP: Record<string, string[]> = {
    'Fan':             ['Ceiling Fan', 'Fan'],
    'Air Conditioner': ['Air Conditioner', 'AC'],
    'AC':              ['Air Conditioner', 'AC'],
    'Desk':            ['Study Desk', 'Desk'],
    'Chair':           ['Study Chair', 'Chair'],
    'Mattress':        ['Mattress'],
    'Wardrobe':        ['Wardrobe'],
    'Bed':             ['Mattress', 'Bed Frame'],
    'Toilet':          ['Toilet', 'Bathroom Fixture'],
    'Light':           ['Light', 'Ceiling Light', 'Lamp'],
    'Window':          ['Window'],
    'Door':            ['Door'],
};

// GET: Fetch all assets, optionally filtered
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        const status = searchParams.get('status');

        let query = 'SELECT * FROM room_assets WHERE 1=1';
        const params: any[] = [];

        if (roomId) {
            query += ' AND location_id = ?';
            params.push(roomId);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY location_id ASC, name ASC, created_at DESC';

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
        const { action, actorId, actorName } = body;

        if (action === 'create_asset') {
            const { name, type, locationId, value } = body;
            const id = `AST-${Date.now()}`;
            await db.query(
                `INSERT INTO room_assets (id, name, type, status, location_id, value) VALUES (?, ?, ?, 'Good', ?, ?)`,
                [id, name, type, locationId, value || 0]
            );

            await logAction({
                actorId: actorId || 'ADMIN',
                actorName: actorName || 'Administrator',
                action: 'CREATE_ASSET',
                entityType: 'ASSET',
                entityId: id,
                details: { name, type, locationId, value }
            });

            return NextResponse.json({ success: true, id });
        }

        if (action === 'update_status') {
            const { id, status } = body;
            await db.query('UPDATE room_assets SET status = ? WHERE id = ?', [status, id]);

            await logAction({
                actorId: actorId || 'ADMIN',
                actorName: actorName || 'Administrator',
                action: 'UPDATE_ASSET_STATUS',
                entityType: 'ASSET',
                entityId: id,
                details: { newStatus: status }
            });

            return NextResponse.json({ success: true });
        }

        if (action === 'log_maintenance') {
            const { assetId, maintenanceAction, description, cost, performedBy } = body;
            const logId = `LOG-${Date.now()}`;

            await db.query(
                `INSERT INTO maintenance_logs (id, asset_id, action, description, cost, performed_by) VALUES (?, ?, ?, ?, ?, ?)`,
                [logId, assetId, maintenanceAction, description, cost || 0, performedBy]
            );

            if (body.newStatus) {
                await db.query('UPDATE room_assets SET status = ? WHERE id = ?', [body.newStatus, assetId]);
            }

            await logAction({
                actorId: actorId || 'ADMIN',
                actorName: actorName || 'Administrator',
                action: 'LOG_ASSET_MAINTENANCE',
                entityType: 'ASSET',
                entityId: assetId,
                details: { maintenanceAction, cost, performedBy, newStatus: body.newStatus }
            });

            // ── COMPLAINT SYNC: Resolve complaints linked to this asset ──
            if (maintenanceAction === 'Repair' || body.newStatus === 'Good') {
                try {
                    // 1. Get asset details to know its name and room
                    const [assetRows]: any = await db.query('SELECT name, location_id FROM room_assets WHERE id = ?', [assetId]);
                    if (assetRows.length > 0) {
                        const asset = assetRows[0];
                        const assetName = asset.name;
                        const roomId = asset.location_id;

                        if (roomId) {
                            // 2. Find which complaint keywords match this asset name
                            const matchingKeywords = Object.keys(ASSET_KEYWORD_MAP).filter(key => 
                                ASSET_KEYWORD_MAP[key].some(pattern => assetName.toLowerCase().includes(pattern.toLowerCase()))
                            );

                            if (matchingKeywords.length > 0) {
                                // 3. Find pending complaints for these keywords from students in this room
                                const [pendingComplaints]: any = await db.query(`
                                    SELECT c.id, c.student_id, c.title
                                    FROM complaints c
                                    WHERE c.status != 'Resolved'
                                    AND c.asset IN (?)
                                    AND c.student_id IN (
                                        SELECT a.student_id 
                                        FROM applications a
                                        JOIN beds b ON a.bed_id = b.id
                                        WHERE b.room_id = ? AND a.status IN ('Approved', 'Checked in')
                                    )
                                `, [matchingKeywords, roomId]);

                                // 4. Resolve them and notify
                                for (const comp of pendingComplaints) {
                                    await db.query(
                                        'UPDATE complaints SET status = "Resolved", resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
                                        [comp.id]
                                    );

                                    await createNotification({
                                        userId: comp.student_id,
                                        title: 'Issue Resolved',
                                        message: `Great news! The issue with ${assetName} in your room ("${comp.title}") has been repaired by the maintenance team.`,
                                        type: 'success',
                                        relatedEntityId: comp.id,
                                        relatedEntityType: 'Complaint'
                                    });

                                    console.log(`[Asset-Complaint Sync] Automatically resolved complaint ${comp.id} via asset ${assetId} repair`);
                                }
                            }
                        }
                    }
                } catch (syncErr) {
                    console.error('[Asset-Complaint Sync] Error:', syncErr);
                    // Non-fatal, continue with success response
                }
            }
            // ─────────────────────────────────────────────────────────────

            return NextResponse.json({ success: true, logId });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error("Error processing asset action:", error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

// DELETE: Remove an asset from the inventory
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
        }

        await db.query('DELETE FROM room_assets WHERE id = ?', [id]);
        
        // Log deletion
        await logAction({
            actorId: 'ADMIN',
            actorName: 'Administrator',
            action: 'DELETE_ASSET',
            entityType: 'ASSET',
            entityId: id,
            details: { message: 'Asset deleted manually' }
        });

        return NextResponse.json({ success: true, message: 'Asset deleted successfully' });
    } catch (error) {
        console.error("Error deleting asset:", error);
        return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }
}

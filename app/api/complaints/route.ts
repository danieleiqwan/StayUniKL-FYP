import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/audit';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { uploadImage } from '@/lib/cloudinary';
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// ASSET SYNC HELPERS
// Maps complaint asset keywords → asset name patterns in the DB
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

/**
 * Given a student's ID and the asset keyword from the complaint,
 * finds the matching asset in the student's current room.
 */
async function findMatchingAsset(studentId: string, assetKeyword: string): Promise<any | null> {
    if (!assetKeyword) return null;

    // 1. Find the student's current room via their active application
    const [appRows]: any = await pool.query(`
        SELECT b.room_id
        FROM applications a
        JOIN beds b ON a.bed_id = b.id
        WHERE a.student_id = ? AND a.status IN ('Approved', 'Checked in')
        ORDER BY a.date DESC
        LIMIT 1
    `, [studentId]);

    if (!appRows || appRows.length === 0) return null;
    const roomId = appRows[0].room_id;

    // 2. Find the name patterns for this keyword
    const patterns = ASSET_KEYWORD_MAP[assetKeyword] || [assetKeyword];
    const placeholders = patterns.map(() => 'name LIKE ?').join(' OR ');
    const params = patterns.map((p: string) => `%${p}%`);

    const [assetRows]: any = await pool.query(
        `SELECT * FROM assets WHERE location_id = ? AND (${placeholders}) ORDER BY created_at ASC LIMIT 1`,
        [roomId, ...params]
    );

    return assetRows.length > 0 ? { ...assetRows[0], roomId } : null;
}

// Schema for input validation
const complaintSchema = z.object({
    studentId: z.string().min(1),
    title: z.string().min(5).max(100),
    description: z.string().min(10),
    asset: z.string().optional(),
    imagePaths: z.array(z.string()).optional(),
});

// GET: Fetch complaints
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const roomId = searchParams.get('roomId');
        const roomLabel = searchParams.get('roomLabel');
        const residentIds = searchParams.get('residentIds');
        const status = searchParams.get('status');

        // Security check: If not admin/superadmin, you can only see your own complaints
        if (user.role !== 'admin' && user.role !== 'superadmin' && studentId && user.id !== studentId) {
            return NextResponse.json({ error: 'Forbidden: You cannot access complaints for another user' }, { status: 403 });
        }

        // If no studentId is provided and not admin, default to the user's own ID
        const activeId = (user.role === 'admin' || user.role === 'superadmin') ? studentId : user.id;

        let query = `
            SELECT 
                c.*, 
                u.name as student_name, 
                u.student_id as official_id,
                c.student_id as student_internal_id
            FROM complaints c
            LEFT JOIN users u ON c.student_id = u.id
        `;
        let params: any[] = [];
        let whereClauses = [];

        if (activeId) {
            whereClauses.push('c.student_id = ?');
            params.push(activeId);
        }

        if (roomId || roomLabel || residentIds) {
            let roomConditions = [];
            
            if (roomId) {
                // Join with applications to find students who were in this room
                roomConditions.push(`c.student_id IN (
                    SELECT student_id FROM applications WHERE room_id = ?
                )`);
                params.push(roomId);
            }

            if (residentIds) {
                const idList = residentIds.split(',');
                const placeholders = idList.map(() => '?').join(',');
                roomConditions.push(`c.student_id IN (${placeholders})`);
                params.push(...idList);
            }

            if (roomLabel) {
                // Extract just the number if it's like "Room 304"
                const roomNumber = roomLabel.replace('Room', '').trim();
                
                // Fallback: Check if room number or full label is mentioned
                roomConditions.push(`(c.title LIKE ? OR c.description LIKE ? OR c.asset LIKE ? OR c.title LIKE ? OR c.description LIKE ? OR c.asset LIKE ?)`);
                params.push(`%${roomLabel}%`, `%${roomLabel}%`, `%${roomLabel}%`, `%${roomNumber}%`, `%${roomNumber}%`, `%${roomNumber}%`);
            }

            whereClauses.push(`(${roomConditions.join(' OR ')})`);
        }

        if (status) {
            const statusList = status.split(',');
            const placeholders = statusList.map(() => '?').join(',');
            whereClauses.push(`c.status IN (${placeholders})`);
            params.push(...statusList);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY c.date DESC';

        const [rows]: any = await pool.query(query, params);

        const complaints = rows.map((row: any) => ({
            id: row.id,
            studentId: row.student_internal_id,
            officialId: row.official_id,
            studentName: row.student_name,
            title: row.title,
            description: row.description,
            asset: row.asset,
            images: row.images ? JSON.parse(row.images) : [],
            status: row.status || 'Pending',
            technicianAppointment: row.technician_appointment,
            date: row.date,
            resolvedAt: row.resolved_at
        }));

        return NextResponse.json({ complaints });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create complaint
export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        // 1. Validate Input
        const validation = complaintSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ 
                error: 'Invalid input', 
                details: validation.error.format() 
            }, { status: 400 });
        }

        const { studentId, title, description, asset, imagePaths } = validation.data;

        // Fetch student name from DB
        const [studentRows]: any = await pool.query('SELECT name FROM users WHERE id = ?', [studentId]);
        const studentName = studentRows[0]?.name || 'Student';

        // Security check: Student can only create complaints for themselves
        if (user.role !== 'admin' && user.role !== 'superadmin' && user.id !== studentId) {
            return NextResponse.json({ error: 'Forbidden: You cannot create a complaint for another user' }, { status: 403 });
        }

        // --- OVERDUE PAYMENT BLOCK ---
        if (user.role !== 'admin' && user.role !== 'superadmin') {
            const [overdueRows]: any = await pool.query(
                'SELECT id FROM invoices WHERE user_id = ? AND status = "Overdue" LIMIT 1',
                [studentId]
            );

            if (overdueRows.length > 0) {
                return NextResponse.json({ 
                    error: 'Complaint Blocked: You have one or more overdue invoices. Please settle your outstanding payments in the Financials section before submitting new maintenance requests.' 
                }, { status: 403 });
            }
        }
        // -----------------------------

        const id = `comp_${Date.now()}`;

        // 2. Upload Images to Cloudinary (if any are base64)
        let finalImageUrls = [];
        if (imagePaths && imagePaths.length > 0) {
            finalImageUrls = await Promise.all(
                imagePaths.map(async (img) => {
                    if (img.startsWith('data:image')) {
                        return await uploadImage(img, 'complaints');
                    }
                    return img; // Already a URL
                })
            );
        }

        const imagesJson = finalImageUrls.length > 0 ? JSON.stringify(finalImageUrls) : null;

        try {
            await pool.query(
                'INSERT INTO complaints (id, student_id, title, description, asset, images) VALUES (?, ?, ?, ?, ?, ?)',
                [id, studentId, title, description, asset || null, imagesJson]
            );
        } catch (dbErr: any) {
            if (dbErr.message.includes("Unknown column 'asset'")) {
                console.log('Detected missing "asset" column. Running auto-migration...');
                await pool.query('ALTER TABLE complaints ADD COLUMN asset VARCHAR(255) DEFAULT NULL AFTER description');
                // Retry the insert
                await pool.query(
                    'INSERT INTO complaints (id, student_id, title, description, asset, images) VALUES (?, ?, ?, ?, ?, ?)',
                    [id, studentId, title, description, asset || null, imagesJson]
                );
            } else {
                throw dbErr;
            }
        }

        // ── ASSET SYNC: Flag matching asset as Maintenance ──────────
        let linkedAssetId: string | null = null;
        if (asset) {
            try {
                const matchedAsset = await findMatchingAsset(studentId, asset);
                if (matchedAsset && matchedAsset.status === 'Good') {
                    await pool.query('UPDATE assets SET status = ? WHERE id = ?', ['Maintenance', matchedAsset.id]);
                    linkedAssetId = matchedAsset.id;
                    console.log(`[Asset Sync] Complaint ${id} → asset ${matchedAsset.id} flagged as Maintenance`);
                }
            } catch (syncErr) {
                // Non-fatal: log but don't fail the complaint submission
                console.error('[Asset Sync] Failed to flag asset:', syncErr);
            }
        }
        // ──────────────────────────────────────────────────────────────

        // Audit Log
        await logAction({
            actorId: studentId,
            actorName: studentName,
            action: 'Reported Complaint',
            entityType: 'Complaint',
            entityId: id,
            details: { title, description, asset, linkedAssetId, imageCount: finalImageUrls.length }
        });

        // Send Notification
        await createNotification({
            userId: studentId,
            title: 'Complaint Received',
            message: `Your complaint "${title}" has been recorded and is pending review by the maintenance team.`,
            type: 'info',
            relatedEntityId: id,
            relatedEntityType: 'Complaint'
        });

        return NextResponse.json({ 
            success: true, 
            complaint: { id, studentId, studentName, title, description, asset, images: finalImageUrls, status: 'Pending', date: new Date() } 
        });

    } catch (error: any) {
        console.error('Complaint Archive Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update status/appointment
export async function PUT(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }

        const body = await request.json();
        const { id, status, appointmentDate } = body;

        console.log(`[Complaints API] Updating ${id} to ${status} (Appt: ${appointmentDate})`);

        // Get admin name since getAuthUser only returns ID/Role
        const [adminRows]: any = await pool.query('SELECT name FROM users WHERE id = ?', [admin.id]);
        const adminName = adminRows[0]?.name || 'Admin';

        let query = 'UPDATE complaints SET status = ?';
        let params: any[] = [status];

        // Automatically set resolved_at if status is changed to Resolved
        if (status === 'Resolved') {
            query += ', resolved_at = CURRENT_TIMESTAMP';
        } else {
            query += ', resolved_at = NULL';
        }

        if (appointmentDate) {
            query += ', technician_appointment = ?';
            params.push(appointmentDate);
        }

        query += ' WHERE id = ?';
        params.push(id);

        console.log('[Complaints API] Executing Query:', query, params);
        await pool.query(query, params);

        // Fetch complaint details for logging
        const [compRows]: any = await pool.query('SELECT student_id, title, asset FROM complaints WHERE id = ?', [id]);
        const complaint = compRows[0];

        // ── ASSET SYNC: Resolve → flip asset back to Good + log maintenance ──
        if (status === 'Resolved' && complaint?.asset) {
            try {
                const matchedAsset = await findMatchingAsset(complaint.student_id, complaint.asset);
                if (matchedAsset) {
                    // Restore asset status
                    await pool.query('UPDATE assets SET status = ? WHERE id = ?', ['Good', matchedAsset.id]);

                    // Auto-log a maintenance entry
                    const logId = `LOG-${Date.now()}`;
                    await pool.query(
                        `INSERT INTO maintenance_logs (id, asset_id, action, description, cost, performed_by)
                         VALUES (?, ?, 'Repair', ?, 0, ?)`,
                        [logId, matchedAsset.id, `Resolved via complaint: ${complaint.title}`, adminName]
                    );
                    console.log(`[Asset Sync] Complaint resolved → asset ${matchedAsset.id} restored to Good`);
                }
            } catch (syncErr) {
                console.error('[Asset Sync] Failed to restore asset on resolve:', syncErr);
            }
        }
        // ─────────────────────────────────────────────────────────────────────

        // Audit Log
        await logAction({
            actorId: admin.id,
            actorName: adminName,
            action: `Updated Complaint Status to ${status}`,
            entityType: 'Complaint',
            entityId: id,
            details: { status, appointmentDate, title: complaint?.title }
        });

        // --- NOTIFICATION LOGIC ---
        if (complaint) {
            const studentId = complaint.student_id;
            let nTitle = 'Maintenance Update';
            let nMessage = `Your complaint "${complaint.title}" has been updated to ${status}.`;
            let nType: any = 'info';

            if (status === 'In Progress' && appointmentDate) {
                nTitle = 'Technician Scheduled';
                const formattedDate = new Date(appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                nMessage = `Good news! A technician has been scheduled to visit your room for "${complaint.title}" on ${formattedDate}.`;
                nType = 'success';
            } else if (status === 'Resolved') {
                nTitle = 'Complaint Resolved';
                nMessage = `Your complaint "${complaint.title}" has been marked as resolved. We hope everything is back to normal!`;
                nType = 'success';
            }

            await createNotification({
                userId: studentId,
                title: nTitle,
                message: nMessage,
                type: nType,
                relatedEntityId: id,
                relatedEntityType: 'Complaint'
            });
        }
        // --------------------------

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

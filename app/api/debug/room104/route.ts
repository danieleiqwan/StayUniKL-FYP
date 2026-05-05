import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [beds]: any = await pool.query(
            "SELECT id, label, status FROM beds WHERE room_id = '104'"
        );

        const bedIds: string[] = beds.map((b: any) => b.id);

        let apps: any[] = [];
        if (bedIds.length > 0) {
            // Build placeholders manually: ?,?,?
            const placeholders = bedIds.map(() => '?').join(',');
            const [rows]: any = await pool.query(
                `SELECT a.id, a.student_id, u.name as student_name, a.status, a.bed_id, a.room_id
                 FROM applications a
                 LEFT JOIN users u ON a.student_id = u.id
                 WHERE a.bed_id IN (${placeholders})`,
                bedIds
            );
            apps = rows;
        }

        return NextResponse.json({ beds, applications: apps });
    } catch (e: any) {
        console.error('[debug/room104]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

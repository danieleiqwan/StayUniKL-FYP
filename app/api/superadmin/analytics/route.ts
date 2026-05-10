import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isSuperAdmin } from '@/lib/auth';

export async function GET() {
    const superadmin = await isSuperAdmin();
    if (!superadmin) {
        return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    }

    try {
        // 1. User Statistics
        const [userStats]: any = await pool.query(`
            SELECT 
                role,
                COUNT(*) as total,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as suspended
            FROM users
            GROUP BY role
        `);

        // 2. Application Funnel (Last 30 Days)
        const [appStats]: any = await pool.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM applications
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY status
        `);

        // 3. System Activity (Last 24 Hours)
        const [activityStats]: any = await pool.query(`
            SELECT COUNT(*) as count
            FROM audit_logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);

        // 4. Critical Complaints (Pending & Maintenance)
        const [complaintStats]: any = await pool.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM complaints
            WHERE status != 'Resolved'
            GROUP BY status
        `);

        // 5. Recent Critical Events (Top 5 from Audit Log)
        const [recentEvents]: any = await pool.query(`
            SELECT actor_name, action, created_at
            FROM audit_logs
            ORDER BY created_at DESC
            LIMIT 5
        `);

        return NextResponse.json({
            users: userStats,
            applications: appStats,
            activity24h: activityStats[0].count,
            complaints: complaintStats,
            recentEvents
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

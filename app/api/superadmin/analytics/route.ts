import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isSuperAdmin } from '@/lib/auth';

export async function GET() {
    console.log('--- Fetching Superadmin Analytics ---');
    const superadmin = await isSuperAdmin();
    if (!superadmin) {
        return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    }

    try {
        const stats: any = {
            users: [],
            applications: [],
            activity24h: 0,
            complaints: [],
            recentEvents: []
        };

        // 1. User Statistics
        try {
            const [userStats]: any = await pool.query(`
                SELECT 
                    role,
                    COUNT(*) as total,
                    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as suspended
                FROM users
                GROUP BY role
            `);
            stats.users = userStats || [];
        } catch (e: any) {
            console.error('Analytics: UserStats Error:', e.message);
        }

        // 2. Application Funnel (Last 30 Days)
        try {
            const [appStats]: any = await pool.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM applications
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY status
            `);
            stats.applications = appStats || [];
        } catch (e: any) {
            console.error('Analytics: AppStats Error:', e.message);
        }

        // 3. System Activity (Last 24 Hours)
        try {
            const [activityStats]: any = await pool.query(`
                SELECT COUNT(*) as count
                FROM audit_logs
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);
            stats.activity24h = activityStats?.[0]?.count || 0;
        } catch (e: any) {
            console.error('Analytics: ActivityStats Error:', e.message);
        }

        // 4. Critical Complaints (Pending & Maintenance)
        try {
            const [complaintStats]: any = await pool.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM complaints
                WHERE status != 'Resolved'
                GROUP BY status
            `);
            stats.complaints = complaintStats || [];
        } catch (e: any) {
            console.error('Analytics: ComplaintStats Error:', e.message);
        }

        // 5. Recent Critical Events (Top 5 from Audit Log)
        try {
            const [recentEvents]: any = await pool.query(`
                SELECT actor_name, action, created_at
                FROM audit_logs
                ORDER BY created_at DESC
                LIMIT 5
            `);
            stats.recentEvents = recentEvents || [];
        } catch (e: any) {
            console.error('Analytics: RecentEvents Error:', e.message);
        }

        console.log('Analytics Success: Data points gathered.');
        return NextResponse.json(stats);

    } catch (e: any) {
        console.error('Fatal Analytics API Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

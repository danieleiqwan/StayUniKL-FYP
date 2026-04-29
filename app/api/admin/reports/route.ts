import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const semester = searchParams.get('semester'); // Not fully implemented filter yet, but logic ready

        // 1. Occupancy Data
        const [occupancyResult]: any = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM beds) as total_beds,
                (SELECT COUNT(*) FROM beds WHERE status = 'Occupied') as occupied_beds
        `);
        const occupancy = occupancyResult[0];

        // 2. Revenue Data (Last 6 Months)
        const [revenueData]: any = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%b %Y') as month,
                SUM(amount) as total
            FROM payments 
            WHERE status = 'Success'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY created_at ASC
            LIMIT 6
        `);

        // 3. Intake Data (Applications by Month)
        const [intakeData]: any = await db.query(`
            SELECT 
                DATE_FORMAT(date, '%b %Y') as month,
                COUNT(*) as count
            FROM applications
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY date ASC
            LIMIT 6
        `);

        // 4. Complaint Resolution Time
        const [complaintStats]: any = await db.query(`
            SELECT 
                AVG(TIMESTAMPDIFF(HOUR, date, resolved_at)) as avg_resolution_hours
            FROM complaints
            WHERE status = 'Resolved' AND resolved_at IS NOT NULL
        `);

        // 5. Semester Stats (Mocking some based on application counts)
        const [semesterStats]: any = await db.query(`
            SELECT 
                'Semester 1 2024' as semester,
                COUNT(*) as intake,
                SUM(total_price) as potential_revenue
            FROM applications
            WHERE date >= '2024-01-01' AND date <= '2024-06-30'
            UNION ALL
            SELECT 
                'Semester 2 2024' as semester,
                COUNT(*) as intake,
                SUM(total_price) as potential_revenue
            FROM applications
            WHERE date >= '2024-07-01' AND date <= '2024-12-31'
        `);

        return NextResponse.json({
            occupancy: {
                total: occupancy.total_beds,
                occupied: occupancy.occupied_beds,
                rate: (occupancy.occupied_beds / occupancy.total_beds * 100).toFixed(1)
            },
            revenue: revenueData,
            intake: intakeData,
            complaints: {
                avgResolutionTime: Math.round(complaintStats[0].avg_resolution_hours || 0)
            },
            semesterStats
        });
    } catch (error) {
        console.error("Error generating report:", error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}

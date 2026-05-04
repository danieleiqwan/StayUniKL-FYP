import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        let debug_errors: any = {};

        // 1. Occupancy Data
        let occupancy = { total_beds: 0, occupied_beds: 0 };
        try {
            const [rows]: any = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM beds) as total_beds,
                    (SELECT COUNT(*) FROM beds WHERE status = 'Occupied') as occupied_beds
            `);
            if (rows && rows[0]) occupancy = rows[0];
        } catch (e: any) { 
            console.error("Occupancy query failed", e);
            debug_errors.occupancy = String(e);
        }

        // 2. Revenue Data (Last 6 Months)
        let revenueData = [];
        try {
            const [rows]: any = await pool.query(`
                SELECT 
                    DATE_FORMAT(created_at, '%b %Y') as month,
                    SUM(amount) as total
                FROM payments 
                WHERE status IN ('Success', 'Paid')
                GROUP BY month
                ORDER BY MIN(created_at) ASC
                LIMIT 6
            `);
            revenueData = rows;

            // If payments table is empty, fallback to counting Approved applications as revenue
            if (revenueData.length === 0) {
                const [appRows]: any = await pool.query(`
                    SELECT 
                        DATE_FORMAT(date, '%b %Y') as month,
                        SUM(total_price) as total
                    FROM applications 
                    WHERE status LIKE 'Approved%' OR status = 'Checked in'
                    GROUP BY month
                    ORDER BY MIN(date) ASC
                    LIMIT 6
                `);
                revenueData = appRows;
            }
        } catch (e: any) { 
            console.error("Revenue query failed", e); 
            debug_errors.revenue = String(e);
        }

        // 3. Intake Data (Applications by Month)
        let intakeData = [];
        try {
            const [rows]: any = await pool.query(`
                SELECT 
                    DATE_FORMAT(date, '%b %Y') as month,
                    COUNT(*) as count
                FROM applications
                GROUP BY month
                ORDER BY MIN(date) ASC
                LIMIT 6
            `);
            intakeData = rows;
        } catch (e: any) { 
            console.error("Intake query failed", e); 
            debug_errors.intake = String(e);
        }

        // 4. Complaint Resolution Time
        let avgResolutionHours = 0;
        try {
            const [rows]: any = await pool.query(`
                SELECT 
                    AVG(TIMESTAMPDIFF(HOUR, date, resolved_at)) as avg_resolution_hours
                FROM complaints
                WHERE status = 'Resolved' AND resolved_at IS NOT NULL
            `);
            if (rows && rows[0]) avgResolutionHours = rows[0].avg_resolution_hours || 0;
        } catch (e: any) { 
            console.error("Complaints query failed", e); 
            debug_errors.complaints = String(e);
        }

        // 5. Semester Stats
        let semesterStats = [];
        try {
            const [rows]: any = await pool.query(`
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
            semesterStats = rows;
        } catch (e: any) { 
            console.error("SemesterStats query failed", e); 
            debug_errors.semesterStats = String(e);
        }

        const totalBeds = occupancy.total_beds || 0;
        const occupiedBeds = occupancy.occupied_beds || 0;
        const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds * 100).toFixed(1) : "0.0";

        return NextResponse.json({
            occupancy: {
                total: totalBeds,
                occupied: occupiedBeds,
                rate: occupancyRate
            },
            revenue: revenueData || [],
            intake: intakeData || [],
            complaints: {
                avgResolutionTime: Math.round(avgResolutionHours)
            },
            semesterStats: semesterStats || [],
            debug_errors
        });
    } catch (error: any) {
        console.error("Error generating report:", error);
        return NextResponse.json({ error: 'Failed to generate report', message: error.message }, { status: 500 });
    }
}

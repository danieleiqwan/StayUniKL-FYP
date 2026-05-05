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

            // If payments table is empty, fallback to counting Invoices, then Applications
            if (revenueData.length === 0) {
                const [invRows]: any = await pool.query(`
                    SELECT 
                        DATE_FORMAT(created_at, '%b %Y') as month,
                        SUM(amount) as total
                    FROM invoices 
                    WHERE status = 'Paid'
                    GROUP BY month
                    ORDER BY MIN(created_at) ASC
                    LIMIT 6
                `);
                revenueData = invRows;
            }

            if (revenueData.length === 0) {
                const [appRows]: any = await pool.query(`
                    SELECT 
                        DATE_FORMAT(date, '%b %Y') as month,
                        SUM(total_price) as total
                    FROM applications 
                    WHERE (status LIKE 'Approved%' OR status = 'Checked in') AND total_price > 0
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

        // 4. Complaint Stats
        let avgResolutionHours = 0;
        let pendingComplaints = 0;
        try {
            const [resRows]: any = await pool.query(`
                SELECT 
                    AVG(TIMESTAMPDIFF(HOUR, date, resolved_at)) as avg_resolution_hours
                FROM complaints
                WHERE status = 'Resolved' AND resolved_at IS NOT NULL
            `);
            if (resRows && resRows[0]) avgResolutionHours = resRows[0].avg_resolution_hours || 0;

            const [countRows]: any = await pool.query(`
                SELECT COUNT(*) as pending FROM complaints WHERE status != 'Resolved'
            `);
            if (countRows && countRows[0]) pendingComplaints = countRows[0].pending || 0;
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

        // 6. Demographics (New)
        let demographics = { gender: [], nationality: [] };
        try {
            const [genderRows]: any = await pool.query(`
                SELECT gender as label, COUNT(*) as value FROM users WHERE role = 'student' GROUP BY gender
            `);
            const [natRows]: any = await pool.query(`
                SELECT nationality as label, COUNT(*) as value FROM users WHERE role = 'student' GROUP BY nationality
            `);
            demographics = { gender: genderRows, nationality: natRows };
        } catch (e: any) {
            console.error("Demographics query failed", e);
            debug_errors.demographics = String(e);
        }

        // 7. Invoice Status (New)
        let invoiceStats = [];
        try {
            const [rows]: any = await pool.query(`
                SELECT status as label, COUNT(*) as value, SUM(amount) as total_amount FROM invoices GROUP BY status
            `);
            invoiceStats = rows;
        } catch (e: any) {
            console.error("Invoice status query failed", e);
            debug_errors.invoices = String(e);
        }

        // 8. Maintenance Hotspots (New)
        let maintenanceHotspots = [];
        try {
            const [rows]: any = await pool.query(`
                SELECT asset as label, COUNT(*) as value 
                FROM complaints 
                WHERE asset IS NOT NULL AND asset != ''
                GROUP BY asset 
                ORDER BY value DESC 
                LIMIT 5
            `);
            maintenanceHotspots = rows;
        } catch (e: any) {
            console.error("Maintenance Hotspots query failed", e);
            debug_errors.hotspots = String(e);
        }

        // 9. Facility Usage (New)
        let facilityUsage = [];
        try {
            const [rows]: any = await pool.query(`
                SELECT sport as label, COUNT(*) as value 
                FROM court_bookings 
                GROUP BY sport 
                ORDER BY value DESC
            `);
            facilityUsage = rows;
        } catch (e: any) {
            console.error("Facility Usage query failed", e);
            debug_errors.facility_usage = String(e);
        }

        // 10. Check-in Methods (New - Estimated from Audit Logs)
        let checkinMethods = [{ label: 'Manual Check-in', value: 0 }, { label: 'QR Self-Checkin', value: 0 }];
        try {
            const [qrRows]: any = await pool.query("SELECT COUNT(*) as count FROM audit_logs WHERE action = 'QR Scan Check-in'");
            const qrCount = qrRows[0].count;
            
            const [totalCheckedIn]: any = await pool.query("SELECT COUNT(*) as count FROM applications WHERE status = 'Checked in'");
            const totalCount = totalCheckedIn[0].count;
            
            checkinMethods = [
                { label: 'Manual Check-in', value: Math.max(0, totalCount - qrCount) },
                { label: 'QR Self-Checkin', value: qrCount }
            ];
        } catch (e: any) {
            console.error("Checkin Methods query failed", e);
            debug_errors.checkin_methods = String(e);
        }

        const totalBeds = occupancy.total_beds || 0;
        const occupiedBeds = occupancy.occupied_beds || 0;
        const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds * 100).toFixed(1) : "0.0";

        return NextResponse.json({
            success: true,
            data: {
                occupancy: {
                    total: totalBeds,
                    occupied: occupiedBeds,
                    rate: occupancyRate
                },
                revenue: revenueData || [],
                intake: intakeData || [],
                complaints: {
                    avgResolutionTime: Math.round(avgResolutionHours),
                    pending: pendingComplaints // Added this to fix the counter
                },
                semesterStats: semesterStats || [],
                demographics: demographics,
                invoiceStats: invoiceStats || [],
                maintenanceHotspots: maintenanceHotspots || [],
                facilityUsage: facilityUsage || [],
                checkinMethods: checkinMethods || []
            },
            debug_errors
        });
    } catch (error: any) {
        console.error("Error generating report:", error);
        return NextResponse.json({ error: 'Failed to generate report', message: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get all active checked-in applications
        const [applications]: any = await pool.query(
            "SELECT * FROM applications WHERE status = 'Checked in'"
        );

        const results = [];

        for (const app of applications) {
            // Only auto-bill for monthly durations (or you can adjust this logic)
            if (app.duration_type !== '1_month') continue;

            const checkInDate = new Date(app.check_in_date || app.date);
            const now = new Date();

            // Calculate months elapsed since check-in
            const monthsDiff = (now.getFullYear() - checkInDate.getFullYear()) * 12 + (now.getMonth() - checkInDate.getMonth());

            if (monthsDiff <= 0) continue; // Not yet time for next month invoice

            // 2. Check how many hostel fee invoices already exist for this application
            const [existingInvoices]: any = await pool.query(
                "SELECT COUNT(*) as count FROM invoices WHERE application_id = ? AND type = 'Hostel Fee'",
                [app.id]
            );

            const invoicesGenerated = existingInvoices[0].count;

            // If we have been here for 2 months (monthsDiff = 2) but only 1 invoice exists (initial), generate 1 more.
            // Note: Initial payment is often handled at application, but let's assume 'Hostel Fee' type is for subsequent ones.
            if (invoicesGenerated < monthsDiff) {
                const missingInvoices = monthsDiff - invoicesGenerated;

                for (let i = 0; i < missingInvoices; i++) {
                    const invoiceId = `INV-AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

                    const description = `Monthly Rent - ${now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;

                    await pool.query(
                        'INSERT INTO invoices (id, user_id, application_id, type, description, amount, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            invoiceId, 
                            app.student_id, 
                            app.id, 
                            'Hostel Fee', 
                            description,
                            app.total_price || 120.00, 
                            'Unpaid', 
                            dueDate
                        ]
                    );

                    // 3. Notify the student
                    await createNotification({
                        userId: app.student_id,
                        title: 'New Invoice Generated',
                        message: `A new invoice for ${description} (RM ${app.total_price || 120.00}) has been generated. Please settle it by ${dueDate.toLocaleDateString('en-GB')}.`,
                        type: 'warning',
                        relatedEntityId: invoiceId,
                        relatedEntityType: 'Invoice'
                    });

                    results.push({
                        studentId: app.student_id,
                        invoiceId,
                        amount: app.total_price || 120.00
                    });
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Generated ${results.length} invoices.`,
            details: results 
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

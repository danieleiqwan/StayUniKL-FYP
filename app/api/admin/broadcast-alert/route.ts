import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { type } = body;

        if (type === 'missing_emergency_contact') {
            // Find all students missing emergency contact info
            const [students]: any = await pool.query(`
                SELECT id, name FROM users 
                WHERE role = 'student' 
                AND (
                    address IS NULL OR address = '' OR 
                    emergencyContact1Name IS NULL OR emergencyContact1Name = '' OR 
                    emergencyContact1Phone IS NULL OR emergencyContact1Phone = '' OR
                    emergencyContact1Relation IS NULL OR emergencyContact1Relation = ''
                )
            `);

            if (students.length === 0) {
                return NextResponse.json({ success: true, message: 'All students have completed their profiles.' });
            }

            // Batch create notifications
            const notificationPromises = students.map((student: any) => 
                createNotification({
                    userId: student.id,
                    title: '🚨 URGENT: Emergency Contact Required',
                    message: `Hi ${student.name.split(' ')[0]}, your emergency contact information is missing. This is MANDATORY for hostel safety compliance. Please update it in your settings immediately.`,
                    type: 'error',
                    link: '/dashboard/settings'
                })
            );

            await Promise.all(notificationPromises);

            return NextResponse.json({ 
                success: true, 
                count: students.length,
                message: `Alert successfully blasted to ${students.length} students.` 
            });
        }

        if (type === 'unpaid_invoices') {
            // Find all active students with outstanding monthly dues (unpaid or overdue)
            const [debtors]: any = await pool.query(`
                SELECT DISTINCT u.id, u.name 
                FROM users u
                JOIN invoices i ON i.user_id = u.id
                WHERE u.role = 'student' 
                AND i.status IN ('Unpaid', 'Overdue')
            `);

            if (debtors.length === 0) {
                return NextResponse.json({ success: true, message: 'All student accounts are fully paid and up to date!' });
            }

            // Batch create notifications for outstanding payments
            const notificationPromises = debtors.map((student: any) => 
                createNotification({
                    userId: student.id,
                    title: '⚠️ URGENT: Outstanding Hostel Dues',
                    message: `Hi ${student.name.split(' ')[0]}, you have unpaid or overdue monthly hostel invoices. Please settle your accounts immediately in your financials tab.`,
                    type: 'error',
                    link: '/dashboard/financials'
                })
            );

            await Promise.all(notificationPromises);

            return NextResponse.json({ 
                success: true, 
                count: debtors.length,
                message: `Invoice reminder alerts blasted to ${debtors.length} students.` 
            });
        }

        return NextResponse.json({ error: 'Invalid alert type' }, { status: 400 });
    } catch (error: any) {
        console.error('Broadcast error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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

        return NextResponse.json({ error: 'Invalid alert type' }, { status: 400 });
    } catch (error: any) {
        console.error('Broadcast error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

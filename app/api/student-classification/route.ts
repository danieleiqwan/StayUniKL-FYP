import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { hasPreviousResidency, classifyStudent } from '@/lib/student-classification';
import pool from '@/lib/db';

/**
 * GET /api/student-classification
 * Returns the student's classification (new/returning) and
 * checks if they are eligible for the currently open application session.
 */
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const type = await classifyStudent(user.id);
        const isReturning = type === 'returning';

        // Check if student has checked out in the current active semester
        let hasCheckedOutThisSemester = false;
        const [activeSemRows]: any = await pool.query(
            'SELECT start_date, end_date FROM semesters WHERE is_active = 1 LIMIT 1'
        );
        if (activeSemRows.length > 0) {
            const activeSem = activeSemRows[0];
            const [checkedOut]: any = await pool.query(
                `SELECT id FROM applications 
                 WHERE student_id = ? 
                   AND status = 'Checked out' 
                   AND check_out_date >= ?`,
                [user.id, activeSem.start_date]
            );
            if (checkedOut.length > 0) {
                hasCheckedOutThisSemester = true;
            }
        }

        return NextResponse.json({
            studentType: type,
            isReturning,
            isNew: !isReturning,
            hasCheckedOutThisSemester,
        });
    } catch (error: any) {
        console.error('[StudentClassification GET]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

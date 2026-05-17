import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { hasPreviousResidency, classifyStudent } from '@/lib/student-classification';

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

        return NextResponse.json({
            studentType: type,
            isReturning,
            isNew: !isReturning,
        });
    } catch (error: any) {
        console.error('[StudentClassification GET]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

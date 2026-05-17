import pool from '@/lib/db';

/**
 * PHASE 2: Student Classification System
 *
 * Returns true if the student has at least one PREVIOUS successful hostel stay.
 * A "successful stay" = at least one application with status 'Checked in' or 'Checked out'.
 *
 * Explicitly EXCLUDED:
 * - Pending applications
 * - Rejected applications
 * - Cancelled applications
 * - Payment Pending applications
 * - Approved (not yet checked-in) applications
 *
 * @param studentId - The internal user ID (not student_id field)
 * @param excludeApplicationId - Optional: exclude the current in-progress application from the check
 */
export async function hasPreviousResidency(
    studentId: string,
    excludeApplicationId?: string
): Promise<boolean> {
    // Phase 5 DB Check: Check the formal `hostel_tenancies` table first
    let tenancyQuery = `SELECT COUNT(*) AS count FROM hostel_tenancies WHERE student_id = ? AND status IN ('Active', 'Completed')`;
    const [tenancyRows]: any = await pool.query(tenancyQuery, [studentId]).catch(() => [[{ count: 0 }]]); // Catch if table missing
    if ((tenancyRows[0]?.count ?? 0) > 0) return true;

    // Legacy Fallback Check (for existing test records): Check applications table
    let query = `
        SELECT COUNT(*) AS count
        FROM applications
        WHERE student_id = ?
          AND status IN ('Checked in', 'Checked out')
    `;
    const params: any[] = [studentId];

    if (excludeApplicationId) {
        query += ' AND id != ?';
        params.push(excludeApplicationId);
    }

    const [rows]: any = await pool.query(query, params);
    return (rows[0]?.count ?? 0) > 0;
}

/**
 * Classify student as 'new' or 'returning'.
 */
export async function classifyStudent(studentId: string): Promise<'new' | 'returning'> {
    const isReturning = await hasPreviousResidency(studentId);
    return isReturning ? 'returning' : 'new';
}

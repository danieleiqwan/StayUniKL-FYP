import pool from '@/lib/db';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { createNotification } from '@/lib/notifications';

// ─── Billing Constants ──────────────────────────────────────────────────────
export const SEMESTER_FEE = 600;           // Full semester fee (RM)
export const MIN_GRACE_DAYS = 7;
export const MAX_GRACE_DAYS = 14;
export const DEFAULT_GRACE_DAYS = 10;

export type ApplicationPaymentStatus = 'Pending' | 'Partially Paid' | 'Fully Paid' | 'Overdue';
export type HostelPaymentMethod = 'Full Payment' | 'Installment Plan';

const HOSTEL_INVOICE_TYPES = ['Hostel Fee', 'Hostel Fee - Installment'];

// ─── Settings Helpers ────────────────────────────────────────────────────────

export async function ensureBillingSettingsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS hostel_billing_settings (
            setting_key VARCHAR(64) PRIMARY KEY,
            setting_value VARCHAR(255) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
    await pool.query(
        `INSERT IGNORE INTO hostel_billing_settings (setting_key, setting_value) VALUES ('grace_period_days', ?)`,
        [String(DEFAULT_GRACE_DAYS)]
    );
}

export async function getGracePeriodDays(): Promise<number> {
    await ensureBillingSettingsTable();
    const [rows]: any = await pool.query(
        `SELECT setting_value FROM hostel_billing_settings WHERE setting_key = 'grace_period_days' LIMIT 1`
    );
    const raw = parseInt(rows[0]?.setting_value ?? String(DEFAULT_GRACE_DAYS), 10);
    if (Number.isNaN(raw)) return DEFAULT_GRACE_DAYS;
    return Math.min(MAX_GRACE_DAYS, Math.max(MIN_GRACE_DAYS, raw));
}

export async function setGracePeriodDays(days: number): Promise<number> {
    const clamped = Math.min(MAX_GRACE_DAYS, Math.max(MIN_GRACE_DAYS, Math.round(days)));
    await ensureBillingSettingsTable();
    await pool.query(
        `INSERT INTO hostel_billing_settings (setting_key, setting_value) VALUES ('grace_period_days', ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [String(clamped)]
    );
    return clamped;
}

function getExecutor(connection?: PoolConnection) {
    return connection ?? pool;
}

// ─── Prorated Billing Logic ───────────────────────────────────────────────────
/**
 * PRORATED BILLING MODEL (Option A)
 *
 * The total semester fee (RM600) is distributed evenly across the total number
 * of calendar months in the active semester (start_date → end_date).
 *
 * Monthly Rate = SEMESTER_FEE / totalSemesterMonths
 *
 * When a student registers, the system:
 * 1. Fetches the active semester's start_date and end_date.
 * 2. Calculates remaining months from the registration month (inclusive) to
 *    the semester end month (inclusive).
 * 3. Prorated Amount = Monthly Rate × Remaining Months (rounded to 2 d.p.)
 * 4. For Installment Plans, one invoice is generated per remaining month.
 * 5. For Full Payment, a single invoice for the prorated amount is generated.
 *
 * If no active session is found, the system falls back to a fixed full-semester
 * billing to ensure no billing is blocked.
 */
export interface ProratedBillingResult {
    /** Total semester duration in months */
    totalSemesterMonths: number;
    /** Months remaining from registration date to end of semester */
    remainingMonths: number;
    /** RM per month (SEMESTER_FEE / totalSemesterMonths) */
    monthlyRate: number;
    /** Total charge for the student (monthlyRate × remainingMonths) */
    proratedAmount: number;
    /** Number of installments (equals remainingMonths for installment plan) */
    installmentCount: number;
    /** Amount per installment (proratedAmount / installmentCount) */
    installmentAmount: number;
    /** Semester end date used in calculation */
    semesterEndDate: Date;
}

/**
 * Computes the number of whole calendar months between two dates (inclusive of both months).
 * Example: March (start) to July (end) = 5 months.
 * Uses UTC getters because DB dates are stored in UTC (e.g. 2026-02-28T16:00:00Z = 1 Mar MYT).
 */
function countInclusiveMonths(start: Date, end: Date): number {
    const startYear = start.getUTCFullYear();
    const startMonth = start.getUTCMonth(); // 0-indexed, UTC
    const endYear = end.getUTCFullYear();
    const endMonth = end.getUTCMonth();
    return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

/**
 * Calculates prorated billing parameters for a student registering at `registrationDate`
 * within the given semester window (semesterStart → semesterEnd).
 */
export function calculateProratedBilling(
    registrationDate: Date,
    semesterStart: Date,
    semesterEnd: Date
): ProratedBillingResult {
    const totalSemesterMonths = Math.max(1, countInclusiveMonths(semesterStart, semesterEnd));
    const monthlyRate = Math.round((SEMESTER_FEE / totalSemesterMonths) * 100) / 100;

    // Remaining months: from registration month (inclusive) to semester end month (inclusive)
    // Cannot exceed totalSemesterMonths or fall below 1
    const rawRemaining = countInclusiveMonths(registrationDate, semesterEnd);
    const remainingMonths = Math.min(totalSemesterMonths, Math.max(1, rawRemaining));

    const proratedAmount = Math.round(monthlyRate * remainingMonths * 100) / 100;

    // Each installment covers exactly 1 remaining month
    const installmentCount = remainingMonths;
    const installmentAmount = Math.round((proratedAmount / installmentCount) * 100) / 100;

    return {
        totalSemesterMonths,
        remainingMonths,
        monthlyRate,
        proratedAmount,
        installmentCount,
        installmentAmount,
        semesterEndDate: semesterEnd,
    };
}

/**
 * Fetches the current open application session and calculates prorated billing.
 * Falls back to full-semester billing if no session is found.
 */
async function getProratedBillingForNow(
    connection: PoolConnection
): Promise<ProratedBillingResult> {
    const now = new Date();

    try {
        // 1. Query the active academic semester configured in Academic Settings
        const [semesterRows]: any = await connection.query(
            `SELECT start_date, end_date FROM semesters WHERE is_active = 1 LIMIT 1`
        );

        if (semesterRows && semesterRows.length > 0) {
            // Use UTC date to preserve the admin-entered local date (stored as UTC in DB)
            const semesterStart = new Date(semesterRows[0].start_date);
            const semesterEnd = new Date(semesterRows[0].end_date);
            // registrationDate: use UTC-equivalent of today so month comparison is consistent
            const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            return calculateProratedBilling(nowUtc, semesterStart, semesterEnd);
        }
    } catch {
        // Table semesters might not exist or be set up yet – fall through
    }

    try {
        // 2. Fallback: Query the open application session
        const [sessions]: any = await connection.query(
            `SELECT start_date, end_date FROM application_sessions
             WHERE DATE(start_date) <= CURDATE() AND DATE(end_date) >= CURDATE()
             ORDER BY start_date DESC LIMIT 1`
        );

        if (sessions && sessions.length > 0) {
            const semesterStart = new Date(sessions[0].start_date);
            const semesterEnd = new Date(sessions[0].end_date);
            return calculateProratedBilling(now, semesterStart, semesterEnd);
        }
    } catch {
        // Fall through to hardcoded default
    }

    // 3. Fallback: treat as full semester (4 installments, RM150 each)
    return {
        totalSemesterMonths: 4,
        remainingMonths: 4,
        monthlyRate: 150,
        proratedAmount: SEMESTER_FEE,
        installmentCount: 4,
        installmentAmount: 150,
        semesterEndDate: new Date(now.getFullYear(), now.getMonth() + 4, 1),
    };
}

// ─── Payment Status Sync ─────────────────────────────────────────────────────

export async function syncApplicationPaymentStatus(
    applicationId: string,
    connection?: PoolConnection
): Promise<ApplicationPaymentStatus> {
    const db = getExecutor(connection);
    const [invoices]: any = await db.query(
        `SELECT status FROM invoices
         WHERE application_id = ? AND type IN (?, ?)`,
        [applicationId, ...HOSTEL_INVOICE_TYPES]
    );

    if (invoices.length === 0) {
        await db.query(
            `UPDATE applications SET payment_status = 'Pending' WHERE id = ?`,
            [applicationId]
        );
        return 'Pending';
    }

    const statuses = invoices.map((i: RowDataPacket) => i.status);
    const allPaid = statuses.every((s: string) => s === 'Paid');
    const anyOverdue = statuses.some((s: string) => s === 'Overdue');
    const anyPaid = statuses.some((s: string) => s === 'Paid');

    let paymentStatus: ApplicationPaymentStatus = 'Pending';
    if (allPaid) paymentStatus = 'Fully Paid';
    else if (anyOverdue) paymentStatus = 'Overdue';
    else if (anyPaid) paymentStatus = 'Partially Paid';

    await db.query(`UPDATE applications SET payment_status = ? WHERE id = ?`, [
        paymentStatus,
        applicationId,
    ]);

    if (paymentStatus === 'Fully Paid' || paymentStatus === 'Partially Paid') {
        await db.query(
            `UPDATE applications SET status = 'Approved' WHERE id = ? AND status = 'Payment Pending'`,
            [applicationId]
        );
    }

    return paymentStatus;
}

// ─── Invoice Generation (Prorated) ───────────────────────────────────────────

export async function generateHostelInvoices(opts: {
    connection: PoolConnection;
    applicationId: string;
    studentId: string;
    roomType: string;
    paymentMethod: HostelPaymentMethod;
}): Promise<void> {
    const { connection, applicationId, studentId, roomType, paymentMethod } = opts;
    const graceDays = await getGracePeriodDays();

    // Guard: do not generate duplicate invoices
    const [existing]: any = await connection.query(
        `SELECT id FROM invoices WHERE application_id = ? AND type IN (?, ?) LIMIT 1`,
        [applicationId, ...HOSTEL_INVOICE_TYPES]
    );
    if (existing.length > 0) return;

    // ── Calculate prorated billing based on active semester ──
    const billing = await getProratedBillingForNow(connection);

    if (paymentMethod === 'Installment Plan') {
        /**
         * INSTALLMENT PLAN (PRORATED):
         * - installmentCount = remaining months in semester
         * - Due date for installment i = start of (current month + i - 1)
         * - Each installment covers exactly 1 month's share
         */
        for (let i = 1; i <= billing.installmentCount; i++) {
            const invoiceId = `INV-INST-${Date.now()}-${i}`;
            await connection.query(
                `INSERT INTO invoices (
                    id, user_id, application_id, type, description, payment_plan,
                    installment_no, installment_total, amount, status, due_date
                ) VALUES (?, ?, ?, 'Hostel Fee - Installment', ?, 'Installment', ?, ?, ?, 'Unpaid', DATE_ADD(CURDATE(), INTERVAL ? MONTH))`,
                [
                    invoiceId,
                    studentId,
                    applicationId,
                    `Hostel Fee Installment ${i}/${billing.installmentCount} – ${roomType}`,
                    i,
                    billing.installmentCount,
                    billing.installmentAmount,
                    i - 1,   // 0 months ahead for first, 1 for second, etc.
                ]
            );
        }
    } else {
        /**
         * FULL PAYMENT (PRORATED):
         * - Single invoice for the prorated amount
         * - Due within grace period days
         */
        const invoiceId = `INV-FULL-${Date.now()}`;
        await connection.query(
            `INSERT INTO invoices (
                id, user_id, application_id, type, description, payment_plan,
                amount, status, due_date
            ) VALUES (?, ?, ?, 'Hostel Fee', ?, 'Full', ?, 'Unpaid', DATE_ADD(CURDATE(), INTERVAL ? DAY))`,
            [
                invoiceId,
                studentId,
                applicationId,
                `Hostel Fee (Full Payment) – ${roomType}`,
                billing.proratedAmount,
                graceDays,
            ]
        );
    }

    await syncApplicationPaymentStatus(applicationId, connection);
}

// ─── Overdue Management ───────────────────────────────────────────────────────

/** Mark Unpaid invoices as Overdue after due_date + grace period */
export async function markOverdueInvoicesWithGrace(): Promise<number> {
    const graceDays = await getGracePeriodDays();
    const [result]: any = await pool.query(
        `UPDATE invoices
         SET status = 'Overdue'
         WHERE status = 'Unpaid'
           AND due_date IS NOT NULL
           AND DATE_ADD(due_date, INTERVAL ? DAY) < CURDATE()`,
        [graceDays]
    );

    const affected = result.affectedRows ?? 0;

    if (affected > 0) {
        const [apps]: any = await pool.query(
            `SELECT DISTINCT application_id FROM invoices
             WHERE status = 'Overdue' AND application_id IS NOT NULL`
        );
        for (const row of apps) {
            if (row.application_id) {
                await syncApplicationPaymentStatus(row.application_id);
            }
        }
    }

    return affected;
}

/** Notify students with newly overdue hostel installments (once per invoice per day) */
export async function notifyOverdueInstallments(): Promise<number> {
    await markOverdueInvoicesWithGrace();

    const [rows]: any = await pool.query(
        `SELECT i.id, i.user_id, i.amount, i.due_date, i.installment_no, i.installment_total, u.name
         FROM invoices i
         JOIN users u ON u.id = i.user_id
         WHERE i.status = 'Overdue'
           AND i.type IN (?, ?)
           AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.related_entity_id = i.id
               AND n.related_entity_type = 'Invoice'
               AND n.title = 'Payment Overdue'
               AND n.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
           )`,
        HOSTEL_INVOICE_TYPES
    );

    let count = 0;
    for (const inv of rows) {
        const installmentLabel =
            inv.installment_no != null
                ? ` (Installment ${inv.installment_no}/${inv.installment_total})`
                : '';

        await createNotification({
            userId: inv.user_id,
            title: 'Payment Overdue',
            message: `Your hostel payment${installmentLabel} of RM ${Number(inv.amount).toFixed(2)} is overdue. Please pay promptly to keep your account active.`,
            type: 'warning',
            relatedEntityId: inv.id,
            relatedEntityType: 'Invoice',
        });
        count++;
    }

    return count;
}

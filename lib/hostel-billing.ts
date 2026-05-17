import pool from '@/lib/db';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { createNotification } from '@/lib/notifications';

export const SEMESTER_FEE = 600;
export const INSTALLMENT_AMOUNT = 150;
export const INSTALLMENT_COUNT = 4;
export const MIN_GRACE_DAYS = 7;
export const MAX_GRACE_DAYS = 14;
export const DEFAULT_GRACE_DAYS = 10;

export type ApplicationPaymentStatus = 'Pending' | 'Partially Paid' | 'Fully Paid' | 'Overdue';
export type HostelPaymentMethod = 'Full Payment' | 'Installment Plan';

const HOSTEL_INVOICE_TYPES = ['Hostel Fee', 'Hostel Fee - Installment'];

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

    return paymentStatus;
}

export async function generateHostelInvoices(opts: {
    connection: PoolConnection;
    applicationId: string;
    studentId: string;
    roomType: string;
    paymentMethod: HostelPaymentMethod;
}): Promise<void> {
    const { connection, applicationId, studentId, roomType, paymentMethod } = opts;
    const graceDays = await getGracePeriodDays();

    const [existing]: any = await connection.query(
        `SELECT id FROM invoices WHERE application_id = ? AND type IN (?, ?) LIMIT 1`,
        [applicationId, ...HOSTEL_INVOICE_TYPES]
    );
    if (existing.length > 0) return;

    if (paymentMethod === 'Installment Plan') {
        for (let i = 1; i <= INSTALLMENT_COUNT; i++) {
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
                    `Hostel Fee Installment ${i}/${INSTALLMENT_COUNT} – ${roomType}`,
                    i,
                    INSTALLMENT_COUNT,
                    INSTALLMENT_AMOUNT,
                    i - 1,
                ]
            );
        }
    } else {
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
                SEMESTER_FEE,
                graceDays,
            ]
        );
    }

    await syncApplicationPaymentStatus(applicationId, connection);
}

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

/** Notify students with newly overdue hostel installments (once per invoice per day via related entity) */
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
                ? ` (Installment ${inv.installment_no}/${inv.installment_total || INSTALLMENT_COUNT})`
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

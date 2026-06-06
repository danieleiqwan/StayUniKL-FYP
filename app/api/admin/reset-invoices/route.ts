import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

/**
 * TEMPORARY ADMIN UTILITY — Delete invoices for a specific application and
 * reset its status to 'Pending' so invoices can be regenerated on re-approval.
 *
 * DELETE /api/admin/reset-invoices?applicationId=APP-xxx
 *
 * Remove this endpoint once the billing fix has been verified in production.
 */
export async function DELETE(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const applicationId = searchParams.get('applicationId');

        if (!applicationId) {
            return NextResponse.json({ error: 'applicationId query param is required' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Find invoices to be deleted
            const [invoices]: any = await connection.query(
                `SELECT id, type, amount, status FROM invoices WHERE application_id = ?`,
                [applicationId]
            );

            if (invoices.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'No invoices found for this application.' }, { status: 404 });
            }

            // 2. Delete the invoices
            const [deleteResult]: any = await connection.query(
                `DELETE FROM invoices WHERE application_id = ?`,
                [applicationId]
            );

            // 3. Reset application status to 'Pending' so admin can re-approve
            await connection.query(
                `UPDATE applications SET status = 'Pending' WHERE id = ?`,
                [applicationId]
            );

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: `Deleted ${deleteResult.affectedRows} invoice(s) for application ${applicationId}. Status reset to Pending — re-approve to regenerate invoices.`,
                deletedInvoices: invoices,
            });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/admin/reset-invoices?applicationId=APP-xxx
 * Preview which invoices would be deleted (safe, read-only).
 */
export async function GET(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const applicationId = searchParams.get('applicationId');

        if (!applicationId) {
            return NextResponse.json({ error: 'applicationId query param is required' }, { status: 400 });
        }

        const [invoices]: any = await pool.query(
            `SELECT id, type, description, amount, status, installment_no, installment_total
             FROM invoices WHERE application_id = ?`,
            [applicationId]
        );

        const [appRows]: any = await pool.query(
            `SELECT id, status, student_id, payment_method FROM applications WHERE id = ?`,
            [applicationId]
        );

        return NextResponse.json({
            application: appRows[0] ?? null,
            invoicesToDelete: invoices,
            count: invoices.length,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

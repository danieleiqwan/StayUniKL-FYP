import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { markOverdueInvoicesWithGrace, notifyOverdueInstallments } from '@/lib/hostel-billing';

export const dynamic = 'force-dynamic';

// GET: Fetch invoices
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const statusFilter = searchParams.get('status'); // optional filter
        const adminAll = searchParams.get('all') === 'true';

        // If adminAll, check auth
        if (adminAll) {
            const admin = await isAdmin();
            if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query = `
            SELECT i.*, u.name as student_name, u.email as student_email
            FROM invoices i
            LEFT JOIN users u ON i.user_id = u.id
        `;
        const params: any[] = [];
        const conditions: string[] = [];

        if (userId) {
            conditions.push('i.user_id = ?');
            params.push(userId);
        }

        if (statusFilter && statusFilter !== 'All') {
            conditions.push('i.status = ?');
            params.push(statusFilter);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY i.created_at DESC';

        const [rows]: any = await pool.query(query, params);
        return NextResponse.json({ invoices: rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Generate Invoice (admin only)
export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { userId, applicationId, type, amount, dueDate, description } = body;

        if (!userId || !amount || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = `INV-${Date.now()}`;
        const resolvedDueDate = dueDate || (() => {
            const d = new Date();
            d.setDate(d.getDate() + 14); // default: 14 days
            return d.toISOString().split('T')[0];
        })();

        await pool.query(
            'INSERT INTO invoices (id, user_id, application_id, type, description, amount, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, userId, applicationId || null, type, description || type, amount, 'Unpaid', resolvedDueDate]
        );

        // Notify the student
        await createNotification({
            userId,
            title: 'New Invoice Generated',
            message: `A new ${type} invoice of RM ${Number(amount).toFixed(2)} has been generated. Due: ${resolvedDueDate}.`,
            type: 'warning',
            relatedEntityId: id,
            relatedEntityType: 'Invoice'
        });

        return NextResponse.json({ success: true, invoice: { id, userId, amount, status: 'Unpaid', dueDate: resolvedDueDate } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update invoice status (with transition guards)
export async function PATCH(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { invoiceId, newStatus } = body;

        if (!invoiceId || !newStatus) {
            return NextResponse.json({ error: 'invoiceId and newStatus are required' }, { status: 400 });
        }

        const validStatuses = ['Unpaid', 'Paid', 'Overdue', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Fetch current invoice
        const [rows]: any = await pool.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
        if (rows.length === 0) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

        const invoice = rows[0];

        // Guard: Paid invoices cannot revert to Unpaid/Overdue
        if (invoice.status === 'Paid' && newStatus !== 'Paid') {
            return NextResponse.json({ error: 'Cannot revert a Paid invoice.' }, { status: 400 });
        }

        // Guard: Students can only mark as Paid (submit payment)
        if (user.role === 'student' && newStatus !== 'Paid') {
            return NextResponse.json({ error: 'Students can only mark invoices as Paid.' }, { status: 403 });
        }

        // Guard: Students can only update their own invoices
        if (user.role === 'student' && invoice.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (newStatus === 'Paid') {
            await pool.query(
                'UPDATE invoices SET status = ?, paid_at = COALESCE(paid_at, NOW()) WHERE id = ?',
                [newStatus, invoiceId]
            );
            if (invoice.application_id) {
                const { syncApplicationPaymentStatus } = await import('@/lib/hostel-billing');
                await syncApplicationPaymentStatus(invoice.application_id);
            }
        } else {
            await pool.query('UPDATE invoices SET status = ? WHERE id = ?', [newStatus, invoiceId]);
        }

        return NextResponse.json({ success: true, invoiceId, newStatus });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

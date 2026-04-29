import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Fetch documents
// Admin can fetch all or by status, Students fetch their own
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        let query = 'SELECT d.*, u.name as user_name FROM documents d JOIN users u ON d.user_id = u.id WHERE 1=1';
        const params: any[] = [];

        if (userId) {
            query += ' AND d.user_id = ?';
            params.push(userId);
        }
        if (status) {
            query += ' AND d.status = ?';
            params.push(status);
        }

        query += ' ORDER BY d.created_at DESC';

        const [documents] = await db.query(query, params);
        return NextResponse.json({ documents });
    } catch (error) {
        console.error("Error fetching documents:", error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

// POST: Student uploads a document (or re-uploads)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, type, fileUrl } = body;

        if (!userId || !type || !fileUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = `DOC-${Date.now()}`;

        // If a document of this type already exists for this user and is NOT verified, we might want to update it or create new.
        // For simplicity, let's just create a new record.
        await db.query(
            `INSERT INTO documents (id, user_id, type, file_url, status) VALUES (?, ?, ?, ?, 'Pending')`,
            [id, userId, type, fileUrl]
        );

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error uploading document:", error);
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }
}

// PUT: Admin reviews a document (Verify/Reject)
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status, adminNotes } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing ID or status' }, { status: 400 });
        }

        await db.query(
            'UPDATE documents SET status = ?, admin_notes = ? WHERE id = ?',
            [status, adminNotes || null, id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating document status:", error);
        return NextResponse.json({ error: 'Failed to update document status' }, { status: 500 });
    }
}

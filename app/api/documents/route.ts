import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

// GET /api/documents - fetch documents for the user
export async function GET(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [rows]: any = await pool.query(
            'SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC',
            [user.id]
        );

        return NextResponse.json({ documents: rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/documents - upload a document
export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Cloudinary credentials are not configured' }, { status: 500 });
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const docType = formData.get('type') as string;

        if (!file || !docType) {
            return NextResponse.json({ error: 'File and type are required' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File exceeds the 10MB size limit.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        const uploadResponse = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'stayunikl/documents',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        const docId = `doc_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
        const fileName = file.name;
        const fileUrl = uploadResponse.secure_url;

        await pool.query(
            'INSERT INTO documents (id, user_id, type, name, file_url, status) VALUES (?, ?, ?, ?, ?, ?)',
            [docId, user.id, docType, fileName, fileUrl, 'Pending']
        );

        return NextResponse.json({ 
            success: true, 
            document: {
                id: docId,
                type: docType,
                name: fileName,
                file_url: fileUrl,
                status: 'Pending',
                created_at: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('[Document Upload Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/documents?id=...
export async function DELETE(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const docId = searchParams.get('id');

        if (!docId) return NextResponse.json({ error: 'Document ID required' }, { status: 400 });

        // Ensure user owns the document and it is not verified
        const [docs]: any = await pool.query(
            'SELECT * FROM documents WHERE id = ? AND user_id = ?',
            [docId, user.id]
        );

        if (docs.length === 0) {
            return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
        }

        if (docs[0].status === 'Verified') {
            return NextResponse.json({ error: 'Cannot delete a verified document' }, { status: 400 });
        }

        await pool.query('DELETE FROM documents WHERE id = ?', [docId]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

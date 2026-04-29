import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'complaints');
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILES = 3;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('images') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json({ error: `Maximum ${MAX_FILES} images allowed` }, { status: 400 });
        }

        // Validate each file
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json({ error: `Invalid file type: ${file.type}. Only JPG and PNG are allowed.` }, { status: 400 });
            }
            if (file.size > MAX_SIZE) {
                return NextResponse.json({ error: `File "${file.name}" exceeds the 5MB size limit.` }, { status: 400 });
            }
        }

        // Ensure upload directory exists
        await mkdir(UPLOAD_DIR, { recursive: true });

        const savedPaths: string[] = [];

        for (const file of files) {
            const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const uniqueName = `complaint_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const filePath = path.join(UPLOAD_DIR, uniqueName);
            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(filePath, buffer);
            // Return the public URL path
            savedPaths.push(`/uploads/complaints/${uniqueName}`);
        }

        return NextResponse.json({ success: true, paths: savedPaths });

    } catch (error: any) {
        console.error('[Upload Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

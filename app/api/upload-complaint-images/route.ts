import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'complaints');
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILES = 3;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        const savedPaths: string[] = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            
            // Upload to Cloudinary
            const uploadResponse = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'stayunikl/complaints',
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            savedPaths.push(uploadResponse.secure_url);
        }

        return NextResponse.json({ success: true, paths: savedPaths });

    } catch (error: any) {
        console.error('[Upload Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

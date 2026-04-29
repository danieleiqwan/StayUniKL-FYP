import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'complaints');
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILES = 3;

export async function POST(request: Request) {
    try {
        // Configure Cloudinary inside the request to ensure it's always set
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Cloudinary credentials are not configured in environment variables' }, { status: 500 });
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });

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

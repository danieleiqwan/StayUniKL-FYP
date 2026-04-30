import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB for PDFs/Images
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export async function POST(request: Request) {
    try {
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

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File exceeds the 10MB size limit.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Upload to Cloudinary
        const uploadResponse = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'stayunikl/room-changes',
                    resource_type: 'auto', // Important for PDF support
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return NextResponse.json({ 
            success: true, 
            url: uploadResponse.secure_url,
            fileName: file.name
        });

    } catch (error: any) {
        console.error('[RoomChange Upload Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

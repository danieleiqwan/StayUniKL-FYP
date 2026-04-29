import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { z } from 'zod';

const uploadSchema = z.object({
    userId: z.string().min(1),
    profileImage: z.string().min(10), // Base64 string
});

export async function POST(request: Request) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('Upload Request Body Keys:', Object.keys(body));
        
        // 1. Validate Input
        const validation = uploadSchema.safeParse(body);
        if (!validation.success) {
            console.error('Validation Error:', validation.error.format());
            return NextResponse.json({ error: 'Invalid data', details: validation.error.format() }, { status: 400 });
        }

        const { userId, profileImage } = validation.data;

        // Security check: User can only update their own profile
        if (user.role !== 'admin' && user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden: You cannot update another user\'s profile' }, { status: 403 });
        }

        // 2. Upload to Cloudinary
        let imageUrl = profileImage;
        try {
            if (profileImage.startsWith('data:image')) {
                imageUrl = await uploadImage(profileImage, 'profiles');
            }
        } catch (cloudinaryError: any) {
            console.error('Cloudinary failed, falling back to local storage (DB):', cloudinaryError.message);
            // Fallback: If Cloudinary fails, we still have the base64 string.
            // Since our column is LONGTEXT, we can store it directly.
            // However, we'll keep the imageUrl as the base64 string.
            imageUrl = profileImage; 
        }

        // 3. Update the user's profile image in the database
        const [result]: any = await pool.query(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [imageUrl, userId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            imageUrl: imageUrl,
            message: imageUrl.startsWith('data:image') 
                ? 'Profile image updated (Local Storage Fallback)' 
                : 'Profile image updated successfully'
        });

    } catch (error: any) {
        console.error('Final Profile Upload Error:', error);
        return NextResponse.json({ 
            error: error.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}

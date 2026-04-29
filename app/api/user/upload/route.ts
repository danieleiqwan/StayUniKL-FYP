
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;

        if (!file || !userId) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
        const relativePath = `/uploads/${filename}`;
        const finalPath = path.join(process.cwd(), "public/uploads", filename);

        await writeFile(finalPath, buffer);

        // Update DB
        await pool.query(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [relativePath, userId]
        );

        return NextResponse.json({ success: true, profileImage: relativePath });
    } catch (error: any) {
        console.log("Error occurred ", error);
        return NextResponse.json({ Message: "Failed", status: 500 });
    }
}

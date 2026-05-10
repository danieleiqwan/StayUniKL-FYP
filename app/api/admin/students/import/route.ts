import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { students } = body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return NextResponse.json({ error: 'No student data provided' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        let successCount = 0;
        let skippedCount = 0;
        const errors = [];

        try {
            for (const student of students) {
                // Ensure required fields exist
                if (!student.id || !student.name || !student.email) {
                    skippedCount++;
                    errors.push(`Row missing ID, Name, or Email.`);
                    continue;
                }

                const id = student.id.toString().trim();
                const name = student.name.toString().trim();
                const email = student.email.toString().trim().toLowerCase();
                const phone = student.phone ? student.phone.toString().trim() : null;

                // Check if user already exists (by ID or Email)
                const [existing]: any = await connection.query(
                    'SELECT id FROM users WHERE id = ? OR email = ?',
                    [id, email]
                );

                if (existing.length > 0) {
                    skippedCount++;
                    errors.push(`Student ${id} or email ${email} already exists.`);
                    continue;
                }

                // Default password is their Student ID
                const hashedPassword = await bcrypt.hash(id, 10);

                await connection.query(
                    'INSERT INTO users (id, name, email, password, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [id, name, email, hashedPassword, 'student', phone, 1]
                );
                
                successCount++;
            }

            await connection.commit();
        } catch (error: any) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        // Log the bulk action
        await logAction({
            actorId: admin.id,
            actorName: admin.email, // using email as fallback since we don't fetch full profile here
            action: 'Bulk Student Import',
            entityType: 'System',
            details: { imported: successCount, skipped: skippedCount, errors }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully imported ${successCount} students. Skipped ${skippedCount}.`,
            successCount,
            skippedCount,
            errors: errors.slice(0, 10) // Return only first 10 errors to avoid huge payloads
        });

    } catch (error: any) {
        console.error('[Bulk Import Error]', error);
        return NextResponse.json({ error: 'Internal server error during import' }, { status: 500 });
    }
}

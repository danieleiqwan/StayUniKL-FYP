import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/superadmin/migrate
 * Adds the `last_login` column to the users table for session activity tracking.
 * Safe to run multiple times — catches duplicate column errors gracefully.
 */
export async function GET() {
    const results: string[] = [];

    try {
        await pool.query('ALTER TABLE users ADD COLUMN last_login DATETIME NULL DEFAULT NULL');
        results.push('✅ Added last_login column to users table');
    } catch (e: any) {
        results.push(`ℹ️ last_login: ${e.message}`);
    }

    try {
        await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'admin', 'superadmin') NOT NULL DEFAULT 'student'");
        results.push('✅ Updated role ENUM to include superadmin');
    } catch (e: any) {
        results.push(`ℹ️ role ENUM: ${e.message}`);
    }

    return NextResponse.json({ success: true, results });
}

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
        await pool.query('ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1');
        results.push('✅ Added is_active column to users table');
    } catch (e: any) {
        results.push(`ℹ️ is_active: ${e.message}`);
    }

    try {
        await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'admin', 'superadmin') NOT NULL DEFAULT 'student'");
        results.push('✅ Updated role ENUM to include superadmin');
    } catch (e: any) {
        results.push(`ℹ️ role ENUM: ${e.message}`);
    }

    try {
        await pool.query('ALTER TABLE users MODIFY COLUMN nric VARCHAR(20) NULL');
        await pool.query('ALTER TABLE users MODIFY COLUMN student_id VARCHAR(50) NULL');
        results.push('✅ Made nric and student_id nullable');
    } catch (e: any) {}

    // Ensure audit_logs has the modern schema
    try {
        await pool.query('ALTER TABLE audit_logs ADD COLUMN actor_id VARCHAR(50) AFTER id');
        results.push('✅ Added actor_id to audit_logs');
    } catch (e: any) {}

    try {
        await pool.query('ALTER TABLE audit_logs ADD COLUMN actor_name VARCHAR(255) AFTER actor_id');
        results.push('✅ Added actor_name to audit_logs');
    } catch (e: any) {}

    return NextResponse.json({ success: true, results });
}

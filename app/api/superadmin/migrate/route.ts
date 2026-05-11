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

    try {
        await pool.query('ALTER TABLE users ADD COLUMN two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0');
        results.push('✅ Added two_factor_enabled column to users table');
    } catch (e: any) {
        results.push(`ℹ️ two_factor_enabled: ${e.message}`);
    }

    try {
        await pool.query('ALTER TABLE users ADD COLUMN notifications_enabled TINYINT(1) NOT NULL DEFAULT 1');
        results.push('✅ Added notifications_enabled column to users table');
    } catch (e: any) {
        results.push(`ℹ️ notifications_enabled: ${e.message}`);
    }

    try {
        await pool.query('ALTER TABLE users ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
        results.push('✅ Added created_at column to users table');
    } catch (e: any) {
        results.push(`ℹ️ created_at: ${e.message}`);
    }

    return NextResponse.json({ success: true, results });
}

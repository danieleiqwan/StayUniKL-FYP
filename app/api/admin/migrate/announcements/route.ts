import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function POST() {
    try {
        const admin = await isAdmin();
        if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        await pool.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id VARCHAR(64) PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                category ENUM('maintenance', 'billing', 'events', 'general', 'emergency') NOT NULL DEFAULT 'general',
                priority ENUM('urgent', 'important', 'general') NOT NULL DEFAULT 'general',
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                expires_at DATETIME NULL,
                created_by VARCHAR(64) NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        return NextResponse.json({ success: true, message: 'announcements table created or already exists.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

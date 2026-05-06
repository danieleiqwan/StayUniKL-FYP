import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Fetch all emails from the users table
        const [rows]: any = await pool.query('SELECT email, role, name FROM users');
        
        return NextResponse.json({
            count: rows.length,
            users: rows
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

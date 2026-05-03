import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows]: any = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10');
        return NextResponse.json({ notifications: rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}

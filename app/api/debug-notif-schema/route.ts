import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows]: any = await pool.query('SHOW CREATE TABLE notifications');
        return NextResponse.json({ schema: rows[0]['Create Table'] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}

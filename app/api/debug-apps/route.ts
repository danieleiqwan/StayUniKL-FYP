import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows]: any = await pool.query("SELECT id, student_id, status, date, check_in_date, duration_type FROM applications WHERE status = 'Checked in'");
        return NextResponse.json({ applications: rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}

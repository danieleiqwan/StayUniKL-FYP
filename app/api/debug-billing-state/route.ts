import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [rows]: any = await pool.query("SELECT * FROM invoices");
        const [apps]: any = await pool.query("SELECT * FROM applications WHERE status = 'Checked in'");
        return NextResponse.json({ invoices: rows, checkedInApps: apps });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
